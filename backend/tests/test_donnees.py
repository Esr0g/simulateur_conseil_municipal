"""Invariants vérifiés sur les données réelles livrées avec le projet."""

import math

import duckdb
import pytest

from app.api.commune import (
    COMMUNES_PARQUET,
    CSP_PARQUET,
    POPULATION_CSP_PARQUET,
    COMMUNE_COLUMNS,
    repartir_sieges,
)


@pytest.fixture(scope="module")
def connexion():
    with duckdb.connect(":memory:") as conn:
        yield conn


def test_le_parquet_contient_toutes_les_colonnes_attendues(connexion):
    # Le code lit les colonnes par nom : ce test échoue si l'une disparaît
    # lors d'une régénération des données.
    colonnes = {
        ligne[0]
        for ligne in connexion.execute(
            "DESCRIBE SELECT * FROM read_parquet(?)", [COMMUNES_PARQUET]
        ).fetchall()
    }
    assert set(COMMUNE_COLUMNS) <= colonnes


def test_chaque_csp_de_population_a_un_libelle(connexion):
    # Une CSP orpheline serait silencieusement écartée par la jointure interne.
    orphelines = connexion.execute(
        """
        SELECT DISTINCT pop.code_csp
        FROM read_parquet(?) pop
        LEFT JOIN read_parquet(?) csp USING (code_csp)
        WHERE csp.libelle_csp IS NULL AND pop.code_csp <> '_T'
        """,
        [POPULATION_CSP_PARQUET, CSP_PARQUET],
    ).fetchall()
    assert orphelines == []


def test_la_somme_des_sieges_vaut_le_nombre_de_conseillers(connexion):
    """Invariant central du simulateur, vérifié sur toutes les communes."""
    lignes = connexion.execute(
        """
        SELECT pop.code_commune, pop.population_csp, com.total_conseillers
        FROM read_parquet(?) pop
        JOIN read_parquet(?) csp USING (code_csp)
        JOIN read_parquet(?) com USING (code_commune)
        ORDER BY pop.code_commune, pop.code_csp
        """,
        [POPULATION_CSP_PARQUET, CSP_PARQUET, COMMUNES_PARQUET],
    ).fetchall()

    par_commune = {}
    for code, population, conseillers in lignes:
        par_commune.setdefault(code, (conseillers, []))[1].append(population)

    testees = 0
    for code, (conseillers, populations) in par_commune.items():
        if conseillers is None or math.isnan(conseillers) or conseillers <= 0:
            continue
        assert sum(repartir_sieges(populations, int(conseillers))) == int(conseillers), code
        testees += 1

    assert testees > 30000, "l'invariant doit être vérifié sur l'ensemble des communes"
