"""Contrat de l'API : codes HTTP, enveloppe de réponse et cas limites."""

import pytest


class TestRechercheParNom:

    def test_recherche_exacte_remonte_la_commune_en_tete(self, client):
        reponse = client.get("/api/communes", params={"nom": "paris"})
        assert reponse.status_code == 200
        assert reponse.json()["data"][0]["libelle"] == "Paris"

    def test_recherche_insensible_aux_accents(self, client):
        # La saisie est normalisée avant comparaison : "chalons" doit atteindre
        # les communes écrites "Châlons".
        reponse = client.get("/api/communes", params={"nom": "chalons"})
        libelles = [c["libelle"] for c in reponse.json()["data"]]
        assert any("lons" in libelle for libelle in libelles)

    def test_recherche_par_code_postal(self, client):
        reponse = client.get("/api/communes", params={"nom": "75001"})
        assert reponse.status_code == 200
        assert any(c["libelle"] == "Paris" for c in reponse.json()["data"])

    @pytest.mark.parametrize("saisie", ["", "   "])
    def test_recherche_vide_renvoie_une_liste_vide(self, client, saisie):
        # Sans garde-fou, le score flou renvoyait des communes arbitraires.
        reponse = client.get("/api/communes", params={"nom": saisie})
        assert reponse.status_code == 200
        assert reponse.json()["data"] == []

    def test_recherche_sans_correspondance(self, client):
        reponse = client.get("/api/communes", params={"nom": "zzzzzzzzzz"})
        assert reponse.json()["data"] == []

    def test_nombre_de_resultats_plafonne(self, client):
        reponse = client.get("/api/communes", params={"nom": "saint"})
        assert len(reponse.json()["data"]) <= 10

    def test_parametre_obligatoire_manquant(self, client):
        reponse = client.get("/api/communes")
        assert reponse.status_code == 422
        # L'erreur suit l'enveloppe de l'API, pas le format brut de FastAPI.
        assert set(reponse.json()) == {"success", "error", "message", "data"}
        assert reponse.json()["success"] is False


class TestDetailCommune:

    def test_commune_connue(self, client):
        donnees = client.get("/api/communes/75056").json()["data"]
        assert donnees["code_commune"] == "75056"
        assert donnees["libelle"] == "Paris"
        assert donnees["total_conseillers"] == 163

    def test_somme_des_sieges_egale_le_nombre_de_conseillers(self, client):
        donnees = client.get("/api/communes/75056").json()["data"]
        total = sum(csp["nb_conseillers_csp"] for csp in donnees["csp"])
        assert total == donnees["total_conseillers"]

    def test_code_postal_toujours_une_liste(self, client):
        # Le schéma zod du frontend attend un tableau de chaînes.
        donnees = client.get("/api/communes/75056").json()["data"]
        assert isinstance(donnees["code_postal"], list)
        assert all(isinstance(cp, str) for cp in donnees["code_postal"])

    def test_commune_sans_population_ne_plante_pas(self, client):
        # Beaumont-en-Verdunois, détruite en 1916 : population réelle de 0.
        reponse = client.get("/api/communes/55039")
        assert reponse.status_code == 200
        donnees = reponse.json()["data"]
        assert donnees["population_municipale"] == 0
        assert donnees["csp"] == []

    def test_donnees_absentes_renvoyees_en_null(self, client):
        donnees = client.get("/api/communes/55039").json()["data"]
        assert donnees["taux_pauvrete"] is None

    @pytest.mark.parametrize("code", ["99999", "abc", "0"])
    def test_code_invalide_renvoie_404(self, client, code):
        reponse = client.get(f"/api/communes/{code}")
        assert reponse.status_code == 404
        assert reponse.json()["success"] is False


class TestEnveloppeDeReponse:

    @pytest.mark.parametrize("chemin, params", [
        ("/api/communes", {"nom": "paris"}),
        ("/api/communes/75056", None),
        ("/api/communes/99999", None),
        ("/api/inconnu", None),
    ])
    def test_toutes_les_reponses_ont_la_meme_structure(self, client, chemin, params):
        corps = client.get(chemin, params=params).json()
        assert set(corps) == {"success", "error", "message", "data"}
