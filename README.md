# 🏛️ Simulateur de parité sociale - Municipales 2026

## Objectifs du projet

Ce projet vise à encourager les candidats aux **Municipales 2026** à imaginer à quoi ressemblerait leur conseil municipal s’il était à l’image de la population de leur commune. L’objectif est de sensibiliser aux inégalités de représentation et de fournir un outil simple pour visualiser la composition idéale d’un conseil municipal selon différents critères sociaux, notamment les [catégories socioprofessionnelles](https://fr.wikipedia.org/wiki/Professions_et_cat%C3%A9gories_socioprofessionnelles_en_France).

L’outil permettra, à partir du nom d’une commune, de générer automatiquement des données issues de l’INSEE, afin de faciliter la tâche des candidats et des citoyens soucieux de lutter contre les inégalités de réprésentation de la population en politique.

## Contexte

Ce projet est porté dans le cadre de l’association **Data For Good France**, en lien avec la démarche de la #Lettreaux500000 et en collaboration avec différents collectifs engagés pour la démocratie locale (Démocratie Ouverte, Tous Elus, A Voté, Démocratiser la Politique, Fréquence Commune…).

## Points d'attention pour utiliser le simulateur
- Le **ratio des CSP dans la population** ne concerne que les personnes de **15 ans ou plus** (toutes les données sont issues de ce fichier [Recensement de la population - Exploitation complémentaire](https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_POPULATION_COMP)) ;
- Le **nombre de conseillers municipaux** par commune a été calculé à partir de ce fichier (population municipale) [Recensement de la population - Population de référence](https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_POPULATIONS_REFERENCE) et la clé de réparition issue [du code des collectivités territoriales](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070633/LEGISCTA000006164544/) ;
- Nous avons arrondis à l'entier le plus proche le **nombre de sièges théorique au conseil municipal**, ainsi le total par commune peut être inférieur ou supérieur au nombre réel de conseillers municipaux.

## Travail réalisé jusqu’à maintenant

- Exploration et récupération des données INSEE pertinentes
- Scripts Python pour pré-traiter les données, notamment réduire la taille des données sources (voir notebooks `traitement_data.ipynb`). Par exemple, le fichier de rescencement de la population par CSP a été réduit de 80 à 3Mo.
- Affichage des données pour chaque commune et calcul des ratios théoriques de composition des conseils municipaux
- Documentation des sources et des variables utilisées
- Un premier travail avait été effectué pour chercher les données depuis l'API de l'INSEE ; ces scripts ne font plus partie du dépôt.

## Sources de données utilisées

- **Recensement de la population - Exploitation complémentaire**
  - Lien : https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_POPULATION_COMP
  - Identifiant : DS_RP_POPULATION_COMP
  - Année 2022
  - Variables à retenir : GEO, PCS, OBS_VALUE sur la période 2022, pour les personnes de 15 ans ou plus, indifférent de l'âge
  - Le fichier est pré-traité dans le notebook `traitement_data.ipynb` pour réduire sa taille.
  - Fichier traité = `data/processed/population_communes_csp_2022.parquet`

- **Recensement de la population - Population de référence**
  - Lien : https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_POPULATIONS_REFERENCE 
  - Identifiant : DS_POPULATIONS_REFERENCE
  - Année 2022
  - Variable à retenir : GEO, OBS_VALUE
  - Le fichier est pré-traité dans le notebook `traitement_data.ipynb` ajouter le nombre de conseillers municipaux à partir du fichier `conseillers.csv`, et la proportion de locataires.
  - Fichier traité = `data/processed/communes.parquet`

- **Recensement de la population - Logements**
  - Lien : https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_LOGEMENT_PRINC
  - Identifiant : DS_RP_LOGEMENT_PRINC
  - Année 2022
  - Variable à retenir : GEO, RP_MEASURE (DWELLINGS_POPSIZE)
  - Le fichier est pré-traité dans le notebook `traitement_data.ipynb` pour calculer la proportion de locataires.
  - Fichier traité = `data/processed/communes.parquet`

- **Filosofi - Niveau de vie médian et taux de pauvreté par tranche d’âge du référent fiscal**
  - Lien : https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_FILOSOFI_AGE_TP_NIVVIE
  - Identifiant : DSD_FILOSOFI_AGE_TP_MED_NIVVIE
  - Année 2021
  - Variable à retenir : GEO, OBS_VALUE, FILOSOFI_MEASURE (PR_MD60)
  - Le fichier est pré-traité dans le notebook `traitement_data.ipynb` pour calculer la proportion de locataires.
  - Fichier traité = `data/processed/communes.parquet`
    
- **Echelle du nombre de conseillers munincipaux selon la population**
  -   Fichier créé par les développeurs
  -   Lien source : https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070633/LEGISCTA000006164544/
  -   Fichier est utilisé pour calculer le nombre de connseillers par commune dans le notebook `traitement_data.ipynb`
  -   Fichier = `data/raw_data/conseillers.csv`

- **Code officiel géographique au 1er janvier 2025 - Communes**
  - Lien : https://www.insee.fr/fr/information/8377162)
  - Fichier est utilisé pour la barre de recherche des communes par libellé
  - Traitement des données dans le notebook `traitement_data.ipynb`
  - Fichier traité = `data/processed/communes.parquet`
 
## Prochaines étapes :

- [ ] Ajouter des graphiques
- [ ] Ajouter une fonctionnalité de saisie collaborative des CSP des candidat.e.s pour comparer les listes candidates et la répartitions théoriques de conseillers municipaux
---

*Projet open source, contributions bienvenues !*

## Licence

MIT License

Copyright (c) 2025 DataForGood
Contibuteurs : Sacha Gorse, Clément Mandron, Barnabé Sellier et GoldenDataScout 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

