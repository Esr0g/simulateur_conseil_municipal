# Simulateur de Conseil Municipal à l’image de la population

## Objectifs du projet

Ce projet vise à encourager les candidats aux **Municipales 2026** à imaginer à quoi ressemblerait leur conseil municipal s’il était à l’image de la population de leur commune. L’objectif est de sensibiliser aux inégalités de représentation et de fournir un outil simple pour visualiser la composition idéale d’un conseil municipal selon différents critères sociaux (catégorie socioprofessionnelle, taux de pauvreté, statut de logement…).

L’outil permettra, à partir du nom d’une commune, de générer automatiquement des données issues de l’INSEE, afin de faciliter la tâche des candidats et des citoyens soucieux de lutter contre les inégalités politiques.

## Contexte

Ce projet est porté dans le cadre de l’association **Data For Good France**, en lien avec la démarche de la #Lettreaux500000 et en collaboration avec différents collectifs engagés pour la démocratie locale (Démocratie Ouverte, Tous Elus, A Voté, Démocratiser la Politique, Fréquence Commune…).

## Travail réalisé jusqu’à maintenant

- Exploration et récupération des données INSEE pertinentes (catégories socioprofessionnelles, taux de pauvreté, statut d’occupation du logement…)
- Scripts Python pour interroger les APIs de l’INSEE et manipuler les jeux de données (voir notebooks `get_data2.ipynb`)
- Premiers prototypes de visualisations (diagrammes, camemberts) pour représenter la structure sociale d’une commune
- Documentation des sources et des variables utilisées

## Sources de données utilisées

- **Recensement de la population (CSP, sexe et âge)**  
  https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_POPULATION_COMP  
  Variables : Catégorie socioprofessionnelle, sexe, âge
  Variables à retenir : GEO, SEX, PCS, AGE, OBS_VALUE sur la période 2021


- **Taux de pauvreté (niveau commune)**
https://www.insee.fr/fr/statistiques/7756855?sommaire=7756859
Variables à retenir : TP4021, TP5021, TP6021 les taux de pauvreté à différents seuils (40%, 50%, 60%)


- **Logements (statut d’occupation)**  
  https://www.insee.fr/fr/statistiques/8202349?sommaire=8202874
  Variables à retenir : P21_RP_PROP (nombre de propriétaires en RP), P21_RP_LOC (nombre de locataires en RP)

- **APIs INSEE**  
  - Données locales : https://api.insee.fr/donnees-locales/
  - MELODI : https://api.insee.fr/melodi

## Prochaines étapes : mise en place de l'infrastructure

- **Source de données** : utilisation d'un CSV "light" ou d'une base de données SQL pour centraliser et structurer les données issues de l'INSEE.
- **Couche BI** : mise en place de Metabase pour l'exploration et la visualisation des données, solution couramment utilisée chez Data For Good.

---

*Projet open source, contributions bienvenues !*

