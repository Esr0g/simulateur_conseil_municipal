from app.api import bp
from .commune_manager import CommuneManager
from flask import request, jsonify, abort
from app.database.database import Database

communeManager = CommuneManager()

@bp.route('/communes', methods = ["GET"])
def searchCommunes():
    nom = request.args.get('nom', '').strip()
    code = request.args.get('code', '').strip()

    if not code and not nom:
        abort(404)
    
    if not code:
        results = communeManager.search(nom.strip())
        return jsonify(results)

    rows = None
    with Database() as conn:
        rows = conn.execute("""
        SELECT co.code, nom, pop_municipale, nb_conseillers, po.csp_code, libelle as libelle_csp, population as population_csp
        FROM communes as co, csp, pop_commune_par_csp_2022 as po
        WHERE po.code = ? AND po.code = co.code AND po.csp_code = csp.csp_code
                        """, (code,)).fetchall()
    if not rows:
        abort(404, description="Code commune invalide")

    return jsonify([dict(r) for r in rows])

        
        