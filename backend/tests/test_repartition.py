"""Répartition des sièges entre CSP (méthode des plus forts restes)."""

import pytest

from app.api.commune import repartir_sieges, valeur_ou_none


class TestRepartirSieges:

    def test_repartition_proportionnelle_simple(self):
        assert repartir_sieges([800.0, 100.0, 100.0], 10) == [8, 1, 1]

    def test_repartition_exacte_sans_reste(self):
        assert repartir_sieges([50.0, 50.0], 4) == [2, 2]

    def test_une_seule_categorie_prend_tous_les_sieges(self):
        assert repartir_sieges([42.0], 9) == [9]

    def test_les_restes_vont_aux_plus_fortes_decimales(self):
        # Quotas 3.5 / 2.5 / 1.0 : six sièges attribués d'office, le septième
        # revient à la plus forte décimale.
        assert repartir_sieges([35.0, 25.0, 10.0], 7) == [4, 2, 1]

    def test_categorie_sans_population_ne_recoit_rien(self):
        assert repartir_sieges([100.0, 0.0], 5) == [5, 0]

    @pytest.mark.parametrize("populations, nb_sieges", [
        ([100.0, 50.0, 25.0], 10),
        ([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], 15),
        ([438.0, 61988.0, 585895.0, 253848.0, 206542.0, 73240.0, 345638.0, 310355.0], 163),
        ([7.0, 3.0], 1),
    ])
    def test_la_somme_vaut_toujours_le_nombre_de_sieges(self, populations, nb_sieges):
        assert sum(repartir_sieges(populations, nb_sieges)) == nb_sieges

    def test_aucun_siege_negatif(self):
        sieges = repartir_sieges([1.0, 999.0, 0.0], 3)
        assert all(s >= 0 for s in sieges)

    def test_resultat_deterministe(self):
        populations = [123.0, 456.0, 789.0, 12.0]
        assert repartir_sieges(populations, 19) == repartir_sieges(populations, 19)

    def test_departage_des_ex_aequo_par_cle_decroissante(self):
        # Deux CSP de population identique pour un seul siège : la clé la plus
        # grande l'emporte. Comportement historique, verrouillé ici car il
        # décide de l'attribution dans environ une commune sur sept.
        assert repartir_sieges([10.0, 10.0], 1, ["2", "3"]) == [0, 1]
        assert repartir_sieges([10.0, 10.0], 1, ["3", "2"]) == [1, 0]


class TestRepartirSiegesCasLimites:
    """Cas qui faisaient boucler indéfiniment ou planter l'ancienne implémentation."""

    def test_population_totale_nulle(self):
        assert repartir_sieges([0.0, 0.0], 7) == [0, 0]

    def test_liste_de_populations_vide(self):
        assert repartir_sieges([], 5) == []

    def test_zero_siege_a_repartir(self):
        assert repartir_sieges([10.0, 20.0], 0) == [0, 0]

    def test_nombre_de_sieges_negatif(self):
        assert repartir_sieges([10.0, 20.0], -3) == [0, 0]


class TestValeurOuNone:

    def test_none_reste_none(self):
        assert valeur_ou_none(None) is None

    def test_nan_devient_none(self):
        assert valeur_ou_none(float("nan")) is None

    def test_zero_est_une_donnee_pas_une_absence(self):
        # Les six communes détruites en 1914-18 ont une population réelle de 0 :
        # elle doit être affichée, pas remplacée par "aucune donnée".
        assert valeur_ou_none(0.0) == 0.0

    def test_valeur_normale_conservee(self):
        assert valeur_ou_none(163.0) == 163.0
