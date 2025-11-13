from app.api import bp
from .commune_manager import CommuneManager
from flask import request, jsonify, abort, current_app
from app.database.database import Database
import math

communeManager = CommuneManager()

@bp.route('/communes', methods = ["GET"])
def searchCommunesByName():
    nom = request.args.get('nom', '').strip()

    if not nom:
       abort(404)
    
    results = communeManager.search(nom.strip())
    return jsonify(results)


@bp.route('/communes/<code>', methods = ["GET"])
def searchCommunesByCode(code):
    if not code:
        abort(404)
    
    rows = None
    with Database() as conn:
        rows = conn.execute("""
        SELECT co.code, nom, pop_municipale, nb_conseillers, po.csp_code, libelle as libelle_csp, population as population_csp
        FROM communes as co, csp, pop_commune_par_csp_2022 as po
        WHERE po.code = ? AND po.code = co.code AND po.csp_code = csp.csp_code
        ORDER BY po.csp_code
                        """, (code,)).fetchall()
    if not rows:
        abort(404, description="Code commune invalide")
    
    res = []
    tot_pop_csp = 0

    # Somme pour avoir la population CSP totale
    for r in rows:
        res.append(dict(r))
        tot_pop_csp += dict(r)["population_csp"]
    
    # On met dans une liste la partie entière et la fraction puis on trie sur la fraction
    nb_conseillers = rows[0]["nb_conseillers"] 
    temp_list = []
    tot_conseillers = 0
    for r in rows:
        fraction, entier = math.modf(r["population_csp"] * nb_conseillers / tot_pop_csp)
        temp_list.append([fraction, entier, r["csp_code"]])
        tot_conseillers += entier
    temp_list.sort();

    # On ajoute 1 à la partie entière de l'élement qui à la fraciton la plus élevée
    # jusqu'à ce qu'on atteigne le nombre de conseillers
    i = 0;
    while tot_conseillers != nb_conseillers:
        temp_list[i][1] += 1
        tot_conseillers += 1
        i = (i + 1) % 7

    # On ajoute une colonne qui contient le nombre exact de conseiller en fonction de la CSP
    entiers_par_csp = {t[2]: t[1] for t in temp_list} 

    for r in res:
        r["nb_conseillers_csp"] = entiers_par_csp[r["csp_code"]]

    return jsonify(res)
        
        