import streamlit as st
import pandas as pd

CSP = {
    '1': "Agriculteurs",
    '2': "Artisans - commerçants et chefs d'entreprise",
    '3': "Cadres et professions intellectuelles supérieures",
    '4': "Professions intermédiaires",
    '5': "Employés",
    '6': "Ouvriers",
    '7': "Retraités",
    '9': "Autres inactifs"
}

# Cache pour charger les données
@st.cache_data
def load_csp_data():
    """Charge les données d'effectif des CSP par commune"""
    df = pd.read_csv('data/population_communes_2022_csp.csv')
    return df

@st.cache_data
def load_commune_data():
    """Charge les données des communes"""
    df = pd.read_csv('data/commune_2022-reduced.csv')
    return df

@st.cache_data
def load_population_municipale_data():
    """Charge les données d'effectif de population municipale par commune avec le nombre de conseillers"""
    df = pd.read_csv('data/population_municipale_2022_et_conseillers.csv')
    return df

# Calcul de la représentation théorique
def calculate_theoretical_representation(csp_data, code_commune, pop_muni):
    """Calcule la représentation théorique par CSP"""
    
    # Filtrer les données pour la commune choisie
    commune_data = csp_data[csp_data['GEO'] == code_commune]

    infos_commune = None
    tab_final = None
    if not commune_data.empty:
        # Chercher les informations de base
            # Population municipale 
        pop_municipale = pop_muni[pop_muni['GEO'] == code_commune]['OBS_VALUE'].values[0]

            # Population de 15 ans ou plus
        total_population_15_plus = commune_data[commune_data['PCS'] == '_T']['OBS_VALUE'].values[0]

            # Nombre de conseillers municipaux
        nombre_conseillers = pop_muni[pop_muni['GEO'] == code_commune]['nombre_conseillers'].values[0]

        # Créer un DataFrame avec les informations de bases
        infos_commune = pd.DataFrame({
            'Population municipale': [pop_municipale],
            'Nombre de conseillers municipaux': [nombre_conseillers]
        })

        # Calculer les pourcentages par CSP
        poids = {}
        
        for key, label in CSP.items():
            subset = commune_data[commune_data["PCS"] == key]

            if not subset.empty:
                poid = (subset["OBS_VALUE"].values[0] / total_population_15_plus) * 100
                poids[label]= poid
            else:
                poids[label] = None
    
        tab_final = pd.DataFrame(list(poids.items()), columns=["Catgéorie socio-professionelle", "Poids dans la population communale (%) *"])
        tab_final["Nombre de sièges théorique au conseil municipal **"] = round(nombre_conseillers * (tab_final["Poids dans la population communale (%) *"] / 100))
        tab_final["Poids dans la population communale (%) *"] = tab_final["Poids dans la population communale (%) *"].round(2)
        
    return tab_final, infos_commune

############################### interface ##############################################
st.markdown(
    """
    <style>
    /* Cible le conteneur principal */
    .block-container {
        max-width: 56rem; 
        margin: auto;       /* centre horizontalement */
        padding-top: 2rem;
    }
    </style>
    """,
    unsafe_allow_html=True
)
st.set_page_config(
    page_title="Simulateur de parité sociale Municipales 2026",
    page_icon="🏛️",
)

c = st.container()
c.title("🏛️ Simulateur de parité sociale Municipales 2026")
c.markdown("### De quels élu.e.s votre commune a-t-elle besoin ?")
c.markdown("---")

# Liste d'options de sélection des communes
communes_df = load_commune_data()
# Modifier la colonne libellé an ajoutant les deux premier caractère de la colonne COM comme suit 'Libellé (XX)'
communes_df["LIBELLE"] = communes_df["LIBELLE"] + " (" + communes_df["COM"].str[:2] + ")" 
communes_dict = dict(zip(communes_df["LIBELLE"], communes_df["COM"]))

# Dropdown
libelle_choisi = c.selectbox(
    "🏘️ Entrer une commune :",
    options=list(communes_dict.keys()),  # Ajouter une option vide
    index=None,  # Commencer sur l'option vide
    placeholder="Tapez pour rechercher une commune...",
    help="Commencez à taper le nom de votre commune pour la trouver rapidement"
)

if libelle_choisi:
    # Récupérer le COM correspondant
    com_valeur = communes_dict[libelle_choisi]
    
    # Chargement des données
    csp_data = load_csp_data()
    pop_data = load_population_municipale_data()

    tab_final, infos_commune = calculate_theoretical_representation(csp_data, com_valeur, pop_data)
    if tab_final is not None and not tab_final.empty:
        c.dataframe(infos_commune, hide_index=True)
        c.dataframe(tab_final, hide_index=True)
        st.html(
            """
            <small>
                (*) Le ratio des CSP dans la population ne concerne que 
                les personnes de 15 ans ou plus (toutes les données sont issues de ce fichier 
                <a href="https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_RP_POPULATION_COMP" target="_blank">Recensement de la population
                - Exploitation complémentaire</a>). </br>
                (**) Le nombre de conseillers municipaux par commune a été calculé à partir de ce fichier (population municipale)
                <a href="https://catalogue-donnees.insee.fr/fr/catalogue/recherche/DS_POPULATIONS_REFERENCE" target="_blank">
                    Recensement de la population - Population de référence</a>
                    et la clé de réparition issue 
                du <a href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070633/LEGISCTA000006164544/" target="_blank">
                        code des collectivités territoriales.
                    </a>
            </small>
            """)
    else:
        st.markdown("⚠️ Aucune donnée disponible pour cette commune.")

