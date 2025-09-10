# 🏛️ Simulateur de parité sociale - Municipales 2026

## Objectifs du projet

Ce projet vise à encourager les candidats aux **Municipales 2026** à imaginer à quoi ressemblerait leur conseil municipal s’il était à l’image de la population de leur commune. L’objectif est de sensibiliser aux inégalités de représentation et de fournir un outil simple pour visualiser la composition idéale d’un conseil municipal selon différents critères sociaux (catégorie socioprofessionnelle, taux de pauvreté, statut de logement…).

L’outil permettra, à partir du nom d’une commune, de générer automatiquement des données issues de l’INSEE, afin de faciliter la tâche des candidats et des citoyens soucieux de lutter contre les inégalités politiques.

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
- Un premier travail avait été effectué pour chercher les données depuis l'API de l'INSEE, les scripts se trouvent dans le repertoire `/old/`

## Sources de données utilisées

- **Recensement de la population - Exploitation complémentaire**
  - Lien : https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_POPULATION_COMP
  - Identifiant : DS_RP_POPULATION_COMP
  - Année 2022
  - Variables à retenir : GEO, PCS, OBS_VALUE sur la période 2022, pour les personnes de 15 ans ou plus, indifférent de l'âge
  - Le fichier est pré-traité dans le notebook `traitement_data.ipynb` pour réduire sa taille.
  - Fichier traité = `data/population_communes_2022_csp.csv`

- **Recensement de la population - Population de référence**
  - Lien : https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_POPULATIONS_REFERENCE 
  - Identifiant : DS_POPULATIONS_REFERENCE
  - Année 2022
  - Variable à retenir : GEO, OBS_VALUE
  - Le fichier est pré-traité dans le notebook `traitement_data.ipynb` ajouter le nombre de conseillers municipaux à partir du fichier `conseillers.csv`
  - Fichier traité = `data/population_municipale_2022_et_conseillers.csv`
    
- **Nombre de conseillers munincipaux selon la population**
  -   Fichier créé par les développeurs
  -   Lien source : https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070633/LEGISCTA000006164544/
  -   Fichier est utilisé pour calculer le nombre de connseillers par commune dans le notebook `traitement_data.ipynb`
  -   Fichier = `data/conseillers.csv`

- **Code officiel géographique au 1er janvier 2022 - Communes**
  - Lien : https://www.insee.fr/fr/information/6051727
  - Fichier traité par les développeur pour réduire sa taille
  - Fichier traité = `data/commune_2022-reduced.csv`
 
## Prochaines étapes :

- [ ] Ajouter des graphiques
- [ ] Ajouter une fonctionnalité de saisie collaborative des CSP des candidat.e.s pour comparer les listes candidates et la répartitions théoriques de conseillers municipaux
---

*Projet open source, contributions bienvenues !*

