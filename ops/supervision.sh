#!/usr/bin/env bash
#
# Surveille les conteneurs du simulateur, tente de les remettre en route et
# signale ce qu'il n'a pas pu réparer.
#
# Installé en tant que timer systemd (voir ops/README.md). Complète, sans le
# remplacer, le --restart unless-stopped de Docker : celui-ci couvre le
# redémarrage de la machine, pas un conteneur qui s'arrête en cours de route
# ni une application qui ne répond plus.

set -uo pipefail

# service:port/chemin testé
CIBLES=(
    "backend:8000/api/communes?nom=paris"
    "frontend:3000/"
)

DELAI_MAX=10                                     # secondes accordées à une réponse HTTP
ATTENTE_REDEMARRAGE="${SUPERVISION_ATTENTE:-15}" # secondes laissées au conteneur pour repartir

# URL de notification (Discord, Slack, ntfy...). Vide = journal seulement.
WEBHOOK="${SUPERVISION_WEBHOOK:-}"

# Mémorise les pannes déjà signalées d'une exécution à l'autre. Sans cet état,
# le timer (toutes les 5 minutes) renvoyait une alerte par passage : une panne
# nocturne produisait une douzaine de messages par heure, le webhook finissait
# rate-limité et les alertes suivantes étaient perdues.
REP_ETAT="${SUPERVISION_ETAT:-/var/lib/simulateur-supervision}"
mkdir -p "$REP_ETAT" 2>/dev/null || REP_ETAT="${TMPDIR:-/tmp}/simulateur-supervision"
mkdir -p "$REP_ETAT" 2>/dev/null || true

# iconv laisse tomber les séquences UTF-8 incomplètes ; absent, on s'en passe.
if command -v iconv >/dev/null 2>&1; then
    NETTOYER_UTF8=(iconv -f utf-8 -t utf-8 -c)
else
    NETTOYER_UTF8=(cat)
fi

journal() {
    echo "$*"
    logger -t simulateur-supervision "$*" 2>/dev/null || true
}

# Échappement JSON : les journaux de conteneur contiennent des guillemets et
# des sauts de ligne qui produiraient une charge utile invalide.
echapper_json() {
    local texte="$1"
    # Les caractères spéciaux passent par des variables : écrite directement,
    # la substitution ne double pas le backslash comme attendu.
    local bs='\' guillemet='"'
    texte="${texte//"$bs"/"$bs$bs"}"
    texte="${texte//"$guillemet"/"$bs$guillemet"}"
    texte="${texte//$'\n'/"${bs}n"}"
    texte="${texte//$'\r'/}"
    texte="${texte//$'\t'/ }"
    # Les autres caractères de contrôle sont interdits tels quels dans une
    # chaîne JSON : un seul suffit à faire rejeter la charge utile en 400.
    printf '%s' "$texte" | tr -d '\000-\010\013\014\016-\037\177'
}

# tail -c coupe au nombre d'octets et tombe donc régulièrement au milieu d'un
# caractère accentué (le backend journalise en français). L'octet orphelin
# rendait le JSON invalide et l'alerte n'était jamais envoyée : la seule trace
# était "La notification n'a pas pu être envoyée", exactement dans le cas que
# ce script existe pour signaler.
journaux_conteneur() {
    docker logs --tail 20 "$1" 2>&1 | tail -c 800 | "${NETTOYER_UTF8[@]}"
}

temoin_panne() { printf '%s/%s.en-panne' "$REP_ETAT" "$1"; }
deja_signale() { [ -f "$(temoin_panne "$1")" ]; }
marquer_panne() { : > "$(temoin_panne "$1")" 2>/dev/null || true; }
oublier_panne() { rm -f "$(temoin_panne "$1")" 2>/dev/null || true; }

notifier() {
    local message="$1"
    journal "$message"

    [ -n "$WEBHOOK" ] || return 0
    curl -fsS -m 10 -X POST -H 'Content-Type: application/json' \
        -d "{\"content\": \"$(echapper_json "$message")\"}" \
        "$WEBHOOK" >/dev/null 2>&1 \
        || journal "La notification n'a pas pu être envoyée."
}

repond() {
    curl -fsS -o /dev/null -m "$DELAI_MAX" "$1"
}

tourne() {
    [ -n "$(docker ps -q -f "name=^$1$" -f status=running)" ]
}

code_sortie=0

for cible in "${CIBLES[@]}"; do
    nom="${cible%%:*}"
    url="http://localhost:${cible#*:}"

    if tourne "$nom" && repond "$url"; then
        # Remis en route entre-temps (redémarrage manuel, Docker, déploiement) :
        # on ferme l'incident pour que la prochaine panne réalerte.
        if deja_signale "$nom"; then
            oublier_panne "$nom"
            notifier "Simulateur : $nom répond de nouveau."
        fi
        continue
    fi

    # Un conteneur arrêté est démarré ; un conteneur qui tourne mais ne répond
    # plus est relancé.
    if tourne "$nom"; then
        journal "$nom ne répond pas sur $url, redémarrage."
        docker restart "$nom" >/dev/null 2>&1
    else
        journal "$nom est arrêté, démarrage."
        docker start "$nom" >/dev/null 2>&1
    fi

    sleep "$ATTENTE_REDEMARRAGE"

    if tourne "$nom" && repond "$url"; then
        oublier_panne "$nom"
        notifier "Simulateur : $nom était hors service, il a été redémarré et répond de nouveau."
    else
        # Une alerte par incident, pas une par passage du timer.
        if deja_signale "$nom"; then
            journal "Simulateur : $nom est toujours hors service (alerte déjà envoyée)."
        else
            marquer_panne "$nom"
            notifier "Simulateur : $nom est hors service et le redémarrage a échoué. Derniers journaux : $(journaux_conteneur "$nom")"
        fi
        code_sortie=1
    fi
done

# Un échec persistant fait échouer l'unité systemd : elle apparaît alors dans
# `systemctl list-units --failed`.
exit "$code_sortie"
