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
    printf '%s' "$texte"
}

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
        notifier "Simulateur : $nom était hors service, il a été redémarré et répond de nouveau."
    else
        notifier "Simulateur : $nom est hors service et le redémarrage a échoué. Derniers journaux : $(docker logs --tail 20 "$nom" 2>&1 | tail -c 800)"
        code_sortie=1
    fi
done

# Un échec persistant fait échouer l'unité systemd : elle apparaît alors dans
# `systemctl list-units --failed`.
exit "$code_sortie"
