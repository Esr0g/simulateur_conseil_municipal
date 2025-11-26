from app.api import bp
from flask import request, abort, jsonify, current_app
from app.database.duckdb_connection import DuckDBConnection
from rapidfuzz import process, fuzz
from app.api.responses import success_response
import unidecode
import pandas as pd
import math
import numpy as np
import re


df = pd.read_parquet("data/communes.parquet")

df['libelle_norm'] = df['libelle'].apply(lambda x: unidecode.unidecode(x.lower()))

# Normaliser code_postal pour éviter les erreurs ndarray/None
df['code_postal'] = df['code_postal'].apply(lambda x: list(x) if isinstance(x, (list, np.ndarray)) else ([str(x)] if x else []))

libelle_list = df['libelle_norm'].tolist()
cp_list = df['code_postal'].tolist()

@bp.route('/communes', methods=["GET"])
def searchCommunesByName():
    nom = request.args.get('nom', '').strip()

    if not nom:
        abort(404, description="Données manquantes.")

    nom_norm = unidecode.unidecode(nom.lower())

    # ----------------------
    # Recherche fuzzy optimisée
    # ----------------------
    scores_cp = np.zeros(len(df))
    scores_libelle = np.zeros(len(df))
    matches_libelle = None

    if re.fullmatch(r'\D+', nom_norm):  # que des lettres
        matches_libelle = process.extract(
            nom_norm, libelle_list, scorer=fuzz.WRatio, limit=50
        )
    elif re.fullmatch(r'\d+', nom_norm):  # que des chiffres
        for i, cps in enumerate(cp_list):
            if cps:
                scores_cp[i] = max(100 if cp.startswith(nom) else 0 for cp in cps)
    else:  # mélange lettres + chiffres
        matches_libelle = process.extract(
            nom_norm, libelle_list, scorer=fuzz.partial_ratio, limit=50
        )

        for i, cps in enumerate(cp_list):
            if cps:
                scores_cp[i] = max(100 if cp.startswith(nom) else 0 for cp in cps)

    if matches_libelle:
        for _, score, idx in matches_libelle:
            if score > scores_libelle[idx]:
                scores_libelle[idx] = score
            

    # Score global : max entre libelle et code postal
    scores_global = np.maximum(scores_libelle, scores_cp)

    # Top 10 résultats
    top_indices = scores_global.argsort()[::-1][:10]
    top_indices = [i for i in top_indices if scores_global[i] >= 70]

    results = df.iloc[top_indices][['code_commune', 'libelle', 'code_postal']].to_dict(orient='records')

    return success_response(data=results)


@bp.route('/communes/<code>', methods = ["GET"])
def searchCommunesByCode(code):
    if not code:
        abort(404, description="Données manquantes.")
    
    commune = None
    with DuckDBConnection() as conn:
        commune = conn.execute("""
        SELECT *
        FROM 'data/communes.parquet'
        WHERE code_commune = ?
                        """, [code]).fetchone()
    if not commune:
        abort(404, description="Code commune invalide.")
    
    with DuckDBConnection() as conn:
        csp = conn.execute("""
        SELECT pop.code_csp, csp.libelle_csp, pop.population_csp
        FROM 'data/population_communes_csp_2022.parquet' as pop, 'data/csp.parquet' as csp
        WHERE code_commune = ? AND pop.code_csp = csp.code_csp
                        """, [code]).fetch_df()

    res = []
    tot_pop_csp = 0

    res = csp.to_dict(orient="records") 
    tot_pop_csp = sum(r["population_csp"] for r in res)
    
    #On met dans une liste la partie entière et la fraction puis on trie sur la fraction
    nb_conseillers = commune[4]
    temp_list = []
    tot_conseillers = 0
    for r in res:
        fraction, entier = math.modf(r["population_csp"] * nb_conseillers / tot_pop_csp)
        temp_list.append([fraction, entier, r["code_csp"]])
        tot_conseillers += entier

    temp_list.sort(reverse=True);

    # On ajoute 1 à la partie entière de l'élement qui à la fraciton la plus élevée
    # jusqu'à ce qu'on atteigne le nombre de conseillers
    i = 0;
    while tot_conseillers != nb_conseillers:
        temp_list[i][1] += 1
        tot_conseillers += 1
        i = (i + 1) % len(temp_list)

    # On ajoute une colonne qui contient le nombre exact de conseiller en fonction de la CSP
    entiers_par_csp = {t[2]: t[1] for t in temp_list} 

    for r in res:
        r["nb_conseillers_csp"] = entiers_par_csp[r["code_csp"]]

    return success_response(data={
        "code_commune": commune[0],
        "libelle": commune[1],
        "code_postal": commune[2],
        "population_municipale": commune[3],
        "total_conseillers": commune[4],
        "total_loc_et_prop": commune[5],
        "total_locataires": commune[6],
        "taux_pauvrete": commune[7],
        "csp": res,
    })
    

        
        