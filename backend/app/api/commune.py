# app/api/commune.py
from fastapi import APIRouter, HTTPException, Query
from app.database.duckdb_connection import DuckDBConnection
from app.utils.responses import success_response
from rapidfuzz import process, fuzz
import pandas as pd
import numpy as np
import re
import unidecode
import math

router = APIRouter()

df = pd.read_parquet("data/communes.parquet")
df["libelle_norm"] = df["libelle"].apply(lambda x: unidecode.unidecode(x.lower()))
df["code_postal"] = df["code_postal"].apply(
    lambda x: list(x) if isinstance(x, (list, np.ndarray)) else ([str(x)] if x else [])
)

libelle_list = df['libelle_norm'].tolist()
cp_list = df['code_postal'].tolist()


@router.get("/communes")
async def search_communes_by_name(nom: str = Query(...)):
    nom_norm = unidecode.unidecode(nom.lower())

    scores_cp = np.zeros(len(df))
    scores_libelle = np.zeros(len(df))
    matches_libelle = None

    if re.fullmatch(r'\D+', nom_norm):
        matches_libelle = process.extract(
            nom_norm, libelle_list, scorer=fuzz.WRatio, limit=50
        )
    elif re.fullmatch(r'\d+', nom_norm):
        for i, cps in enumerate(cp_list):
            if cps:
                scores_cp[i] = max(100 if cp.startswith(nom) else 0 for cp in cps)
    else:
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

    scores_global = np.maximum(scores_libelle, scores_cp)
    top_indices = scores_global.argsort()[::-1][:10]
    top_indices = [i for i in top_indices if scores_global[i] >= 70]

    results = df.iloc[top_indices][['code_commune', 'libelle', 'code_postal']].to_dict(orient='records')
    return success_response(results)


@router.get("/communes/{code}")
async def search_communes_by_code(code: str):
    with DuckDBConnection() as conn:
        commune = conn.execute("""
            SELECT *
            FROM 'data/communes.parquet'
            WHERE code_commune = ?
        """, [code]).fetchone()

    if not commune:
        raise HTTPException(status_code=404, detail="Code commune invalide.")

    with DuckDBConnection() as conn:
        csp = conn.execute("""
            SELECT pop.code_csp, csp.libelle_csp, pop.population_csp
            FROM 'data/population_communes_csp_2022.parquet' as pop,
                 'data/csp.parquet' as csp
            WHERE code_commune = ? AND pop.code_csp = csp.code_csp
        """, [code]).fetch_df()

    res = []
    if not csp.empty:
        tot_pop_csp = csp["population_csp"].sum()
        nb_conseillers = commune[4]
        
        temp_list = []
        for _, row in csp.iterrows():
            fraction, entier = math.modf(row["population_csp"] * nb_conseillers / tot_pop_csp)
            temp_list.append([fraction, entier, row["code_csp"]])

        temp_list.sort(reverse=True)

        tot_conseillers = sum(t[1] for t in temp_list)

        i = 0
        while tot_conseillers != nb_conseillers:
            temp_list[i][1] += 1
            tot_conseillers += 1
            i = (i + 1) % len(temp_list)

        entiers_par_csp = {t[2]: t[1] for t in temp_list}

        for _, row in csp.iterrows():
            res.append({
                "code_csp": row["code_csp"],
                "libelle_csp": row["libelle_csp"],
                "population_csp": row["population_csp"],
                "nb_conseillers_csp": entiers_par_csp[row["code_csp"]],
            })

    return success_response({
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
