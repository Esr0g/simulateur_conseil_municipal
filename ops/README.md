# Exploitation

## Ce qui protège le service, et de quoi

| Mécanisme | Couvre | Ne couvre pas |
|---|---|---|
| `--restart unless-stopped` (Docker) | Redémarrage du VPS, arrêt du démon Docker | Conteneur qui tourne mais ne répond plus |
| Vérification post-déploiement (CI) | Déploiement qui casse le service | Toute panne survenant entre deux déploiements |
| `supervision.sh` (timer systemd) | Conteneur arrêté ou muet, à tout moment | **VPS entièrement hors service** |
| Sonde externe (voir plus bas) | VPS éteint, panne réseau, incident hébergeur | — |

La dernière ligne est la raison d'être de la sonde externe : une supervision qui
tourne sur la machine surveillée ne peut pas donner l'alerte quand cette machine
est morte. C'est exactement ce qui s'est produit le 8 juillet 2026.

## Installer la supervision locale

Depuis la racine du dépôt, sur le VPS :

```bash
sudo mkdir -p /opt/simulateur-ops
sudo cp ops/supervision.sh /opt/simulateur-ops/
sudo chmod +x /opt/simulateur-ops/supervision.sh

sudo cp ops/simulateur-supervision.service /etc/systemd/system/
sudo cp ops/simulateur-supervision.timer   /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now simulateur-supervision.timer
```

Vérifier :

```bash
systemctl list-timers simulateur-supervision.timer   # prochaine exécution
sudo systemctl start simulateur-supervision.service  # forcer un passage
journalctl -u simulateur-supervision.service -n 30   # ce qu'elle a constaté
```

### Recevoir les notifications

Sans configuration, la sonde répare et journalise, mais n'avertit personne.
Pour être prévenu, créer `/etc/simulateur-supervision.env` :

```bash
# Discord : Paramètres du salon > Intégrations > Webhooks
SUPERVISION_WEBHOOK=https://discord.com/api/webhooks/xxx/yyy
```

Le format de charge utile est `{"content": "..."}`, compatible Discord et
Slack. Pour un autre service, adapter `notifier()` dans `supervision.sh`.

Après modification : `sudo systemctl restart simulateur-supervision.timer`.

## Ajouter une sonde externe

Indispensable pour détecter un VPS éteint. Deux options gratuites :

- **UptimeRobot** — interroge `https://simulateurconseilmunicipal.fr` depuis
  l'extérieur toutes les 5 minutes et alerte par courriel. Rien à installer.
- **healthchecks.io** — principe inverse : le VPS signale qu'il est vivant, et
  l'absence de signal déclenche l'alerte. Ajouter l'appel à la fin de
  `supervision.sh`, exécuté seulement si tout va bien :

  ```bash
  [ "$code_sortie" -eq 0 ] && curl -fsS -m 10 "$URL_PING" >/dev/null 2>&1
  ```

## Diagnostiquer un 502

`502 Bad Gateway` signifie que nginx est debout mais que le conteneur derrière
ne répond pas.

```bash
docker ps -a                     # les conteneurs tournent-ils ?
docker logs --tail 50 backend
sudo tail -50 /var/log/nginx/error.log
uptime                           # un redémarrage récent explique beaucoup
```
