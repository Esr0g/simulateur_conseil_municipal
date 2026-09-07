# app/api/commune.py
import math
import os
import re

import numpy as np
import pandas as pd
import unidecode
from fastapi import APIRouter, HTTPException, Query
from rapidfuzz import process, fuzz

from app.database.duckdb_connection import DuckDBConnection
from app.utils.responses import success_response

router = APIRouter()

# Répertoire des parquets : /app/data dans les conteneurs (cf. docker run et docker-compose).
# Surchargeable par DATA_DIR pour l'exécution locale et les tests.
DATA_DIR = os.getenv("DATA_DIR", "data")
COMMUNES_PARQUET = f"{DATA_DIR}/communes.parquet"
CSP_PARQUET = f"{DATA_DIR}/csp.parquet"
POPULATION_CSP_PARQUET = f"{DATA_DIR}/population_communes_csp_2022.parquet"

# Colonnes lues explicitement plutôt qu'un SELECT * exploité par index :
# l'ordre physique des colonnes du parquet cesse d'être une dépendance cachée.
COMMUNE_COLUMNS = [
    "code_commune",
    "libelle",
    "code_postal",
    "population_municipale",
    "total_conseillers",
    "total_loc_et_prop",
    "total_locataires",
    "taux_pauvrete",
]

SCORE_MINIMUM = 70
NB_RESULTATS = 10
LIMITE_FUZZY = 50

df = pd.read_parquet(COMMUNES_PARQUET)
df["libelle_norm"] = df["libelle"].apply(lambda x: unidecode.unidecode(x.lower()))
df["code_postal"] = df["code_postal"].apply(
    lambda x: list(x) if isinstance(x, (list, np.ndarray)) else ([str(x)] if x else [])
)

libelle_list = df['libelle_norm'].tolist()
cp_list = df['code_postal'].tolist()


def valeur_ou_none(valeur):
    """Normalise les NULL du parquet (None ou NaN) en None."""
    if valeur is None:
        return None
    if isinstance(valeur, float) and math.isnan(valeur):
        return None
    return valeur


def repartir_sieges(populations, nb_sieges, cles=None):
    """Répartit nb_sieges proportionnellement aux populations (méthode des plus forts restes).

    Renvoie une liste d'entiers de même longueur que populations, dont la somme
    vaut exactement nb_sieges. `cles` départage les ex aequo (voir plus bas).
    """
    if not populations or nb_sieges <= 0:
        return [0] * len(populations)

    total = sum(populations)
    if total <= 0:
        return [0] * len(populations)

    quotas = [p * nb_sieges / total for p in populations]
    sieges = [int(math.floor(q)) for q in quotas]

    # Les sièges restants vont aux plus fortes décimales. Les ex aequo sont
    # fréquents (deux CSP de population identique dans une petite commune) :
    # on départage par nombre de sièges déjà acquis puis par clé décroissante,
    # ce qui reproduit à l'identique la répartition servie jusqu'ici.
    if cles is None:
        cles = list(range(len(populations)))

    ordre_restes = sorted(
        range(len(populations)),
        key=lambda i: (quotas[i] - sieges[i], sieges[i], cles[i]),
        reverse=True,
    )

    for rang in range(nb_sieges - sum(sieges)):
        sieges[ordre_restes[rang % len(ordre_restes)]] += 1

    return sieges


# Routes définies en `def` et non `async def` : le travail est bloquant (DuckDB,
# pandas, rapidfuzz). FastAPI les exécute alors dans un threadpool au lieu de
# bloquer la boucle d'événements, donc une recherche lente ne gèle plus l'API.
@router.get("/communes")
def search_communes_by_name(nom: str = Query(...)):
    nom_norm = unidecode.unidecode(nom.lower()).strip()

    # Une recherche vide n'a pas de meilleure réponse qu'une liste vide :
    # sans ce garde-fou, le score flou renvoyait des communes arbitraires.
    if not nom_norm:
        return success_response([])

    scores_cp = np.zeros(len(df))
    scores_libelle = np.zeros(len(df))
    matches_libelle = None

    if re.fullmatch(r'\D+', nom_norm):
        matches_libelle = process.extract(
            nom_norm, libelle_list, scorer=fuzz.WRatio, limit=LIMITE_FUZZY
        )
    elif re.fullmatch(r'\d+', nom_norm):
        for i, cps in enumerate(cp_list):
            if cps:
                scores_cp[i] = max(100 if cp.startswith(nom_norm) else 0 for cp in cps)
    else:
        matches_libelle = process.extract(
            nom_norm, libelle_list, scorer=fuzz.partial_ratio, limit=LIMITE_FUZZY
        )
        for i, cps in enumerate(cp_list):
            if cps:
                scores_cp[i] = max(100 if cp.startswith(nom_norm) else 0 for cp in cps)

    if matches_libelle:
        for _, score, idx in matches_libelle:
            if score > scores_libelle[idx]:
                scores_libelle[idx] = score

    scores_global = np.maximum(scores_libelle, scores_cp)
    top_indices = scores_global.argsort()[::-1][:NB_RESULTATS]
    top_indices = [i for i in top_indices if scores_global[i] >= SCORE_MINIMUM]

    results = df.iloc[top_indices][['code_commune', 'libelle', 'code_postal']].to_dict(orient='records')
    return success_response(results)


@router.get("/communes/{code}")
def search_communes_by_code(code: str):
    colonnes = ", ".join(COMMUNE_COLUMNS)

    with DuckDBConnection() as conn:
        ligne = conn.execute(
            f"SELECT {colonnes} FROM read_parquet(?) WHERE code_commune = ?",
            [COMMUNES_PARQUET, code],
        ).fetchone()

        if not ligne:
            raise HTTPException(status_code=404, detail="Code commune invalide.")

        commune = dict(zip(COMMUNE_COLUMNS, ligne))

        csp = conn.execute(
            """
            SELECT pop.code_csp, csp.libelle_csp, pop.population_csp
            FROM read_parquet(?) AS pop
            JOIN read_parquet(?) AS csp USING (code_csp)
            WHERE pop.code_commune = ?
            ORDER BY pop.code_csp
            """,
            [POPULATION_CSP_PARQUET, CSP_PARQUET, code],
        ).fetch_df()

    nb_conseillers = valeur_ou_none(commune["total_conseillers"])

    res = []
    if not csp.empty and nb_conseillers:
        populations = csp["population_csp"].tolist()
        sieges = repartir_sieges(populations, int(nb_conseillers), csp["code_csp"].tolist())

        for (_, row), nb_sieges in zip(csp.iterrows(), sieges):
            res.append({
                "code_csp": row["code_csp"],
                "libelle_csp": row["libelle_csp"],
                "population_csp": row["population_csp"],
                "nb_conseillers_csp": nb_sieges,
            })

    return success_response({
        "code_commune": commune["code_commune"],
        "libelle": commune["libelle"],
        "code_postal": commune["code_postal"],
        "population_municipale": valeur_ou_none(commune["population_municipale"]),
        "total_conseillers": nb_conseillers,
        "total_loc_et_prop": valeur_ou_none(commune["total_loc_et_prop"]),
        "total_locataires": valeur_ou_none(commune["total_locataires"]),
        "taux_pauvrete": valeur_ou_none(commune["taux_pauvrete"]),
        "csp": res,
    })
