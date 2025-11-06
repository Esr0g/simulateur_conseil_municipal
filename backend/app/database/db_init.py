import pandas as pd
import sqlite3

conn = sqlite3.connect('app/database/data.db')
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS communes (
               code TEXT,
               nom TEXT NOT NULL,
               pop_municipale INTEGER NOT NULL  CHECK(typeof(pop_municipale) = 'integer'),
               nb_conseillers INTEGER NOT NULL  CHECK(typeof(nb_conseillers) = 'integer'),
               PRIMARY KEY (code) )
               """)

df_nom = pd.read_csv('app/database/csv/commune_2022-reduced.csv', usecols=["TYPECOM", "COM", "LIBELLE"])
df_nom = df_nom.rename(columns= {
    "TYPECOM": "type_commune",
    "COM": "code",
    "LIBELLE": "nom"
})
df_nom = df_nom[df_nom["type_commune"].isin(["COM"])]
df_nom = df_nom.drop(columns=["type_commune"])

df_pop = pd.read_csv('app/database/csv/population_municipale_2022_et_conseillers.csv')
df_pop = df_pop.rename(columns= {
    "GEO": "code",
    "OBS_VALUE": "pop_municipale",
    "nombre_conseillers": "nb_conseillers"
})

df_communes = pd.merge(df_nom, df_pop, on="code", how="left")


df_communes.to_sql("communes", conn, if_exists="replace", index=False)

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

cursor.execute("""
CREATE TABLE IF NOT EXISTS csp (
               csp_code INTEGER PRIMARY KEY CHECK(typeof(csp_code) = 'integer'),
               libelle TEXT NOT NULL)
            """)

for csp_code, libelle in CSP.items():
    cursor.execute("INSERT OR REPLACE INTO csp (csp_code, libelle) VALUES (?,?)", (csp_code, libelle))

cursor.execute("""
CREATE TABLE IF NOT EXISTS pop_commune_par_csp_2022 (
               code TEXT NOT NULL,
               csp_code INTEGER NOT NULL CHECK(typeof(csp_code) = 'integer'),
               population INTEGER NOT NULL CHECK(typeof(population) = 'integer'),
               PRIMARY KEY (code, csp_code),
               FOREIGN KEY (csp_code) REFERENCES csp(csp_code),
               FOREIGN KEY (code) REFERENCES communes(code))
               """)

            

df = pd.read_csv('app/database/csv/population_communes_2022_csp.csv')
df = df.rename(columns= {
    "GEO": "code",
    "PCS": "csp_code",
    "OBS_VALUE": "population"
})
df = df[df["csp_code"].isin(["1", "2", "3", "4", "5", "6", "7", "9"])]
df.to_sql("pop_commune_par_csp_2022", conn, if_exists="replace", index=False)

conn.commit()
conn.close()

# code MOCODO :
# CSP: csp_code, libelle
# Pop_Commune_Par_CSP, 1N COMMUNE, 1N CSP: population
# COMMUNES: code, nom, pop_municipale, nb_conseillers
