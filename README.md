# 🔐 Escape Quest Campus

Mini escape game web en 2 missions (10 et 12 min) : dans chacune, le joueur résout 3 épreuves de cybersécurité pour rétablir un service critique du campus.
Projet réalisé en Scrum dans le cadre du cours Agile & Scrum (CFP Baudimont).

## Stack

| Partie | Techno | Dossier |
|---|---|---|
| Front | React + Vite | `front/` |
| Back | API Symfony (JSON, sans base de données) | `api/` |
| Hébergement | VM + Nginx + PHP-FPM | `deploy/` |

```
Navigateur ──► VM:80 (Nginx) ──┬─ /      → front/dist (fichiers statiques)
                               └─ /api/* → PHP-FPM → Symfony (api/public/index.php)
```

## Structure du dépôt

```
escape-quest-campus/
├── api/                  ← API Symfony
├── front/                ← Front React (Vite)
├── deploy/
│   ├── deploy.sh         ← script de déploiement sur la VM
│   └── nginx/
│       └── escape-quest.conf
├── .github/
│   └── pull_request_template.md
├── CONTRIBUTING.md       ← workflow Git (branches, commits, PR)
└── README.md
```

## Lancer le jeu en local

**Prérequis** : PHP 8.2+ (8.3 conseillé), Composer 2, Node.js 24 LTS (22.12 minimum), npm.
Facultatif : la [CLI Symfony](https://symfony.com/download).

```bash
# Terminal 1 : l'API Symfony
cd api
composer install              # la première fois, ou après un git pull qui change composer.lock
symfony server:start          # ou : php -S localhost:8000 -t public

# Terminal 2 : le front React
cd front
npm install                   # la première fois, ou après un git pull qui change package-lock.json
npm run dev
```

Puis ouvrir **http://localhost:5173**. Le front redirige `/api` vers `localhost:8000`.

**Vérifier que tout marche**

| Test | Résultat attendu |
|---|---|
| http://localhost:8000/api/health | `{"status":"ok"}` |
| http://localhost:5173 | Page d'accueil « Reprends le contrôle du campus » |
| Lancer la mission → Commencer la mission | Épreuve 1 « Le mail piégé » |

**Problèmes fréquents**

- *« Impossible de charger l'épreuve »* : l'API n'est pas lancée sur le port 8000.
- *« Failed to resolve import @fontsource/… »* : relancer `npm install` dans `front/`.
- *« Cannot find native binding »* : `rm -rf node_modules && npm install` dans `front/`
  (souvent dû à la synchronisation iCloud du Bureau sur Mac).

## API

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/health` | L'API répond |
| `GET` | `/api/challenges/{id}` | Énoncé d'une épreuve (jamais la solution) |
| `GET` | `/api/challenges/{id}/hints/{n}` | Indice n° n de l'épreuve (2 par épreuve) |
| `POST` | `/api/challenges/{id}/answer` | Vérifie une réponse : `{"answer": …}` → `{"correct": bool, "message": "…"}` |
| `GET` | `/api/challenges/{id}/probe/{zone}` | Mission 2, épreuve 5 : signal de la borne pirate mesuré dans une salle → `{"zone": "…", "signal": -39}` |

Les épreuves et leurs solutions sont dans `api/src/Game/Challenges.php` : mission 1 « Le campus est hors ligne » = épreuves 1 à 3, mission 2 « Wi-Fi fantôme » = épreuves 4 à 6. Côté front, le récit, la durée et l'ordre des épreuves de chaque mission sont dans `front/src/game/missions.js`.

| Épreuve | Format de `answer` | Retour en plus de `correct` / `message` |
|---|---|---|
| 1 · Mail piégé | `["expediteur", "lien", …]` (éléments signalés) | — |
| 2 · Réseau | `{"ports": {"http": 80, …}, "firewall": {"http": "ouvert", "porte": "bloque", …}}` | `fields` (service → bien branché ?), `firewall` (nombre de règles justes) |
| 3 · Enquête | `{"ip": "…", "compte": "…", "heure": "HH:MM:SS", "persistance": "…", "cle": "…"}` (fiches remplies) | `fields` (fiche → juste ?), `partial` (pistes justes mais dossier incomplet : pas de pénalité) |
| 4 · Radar Wi-Fi | `["ap3", …]` (bornes signalées) | — |
| 5 · Chasse | `"repro"` (salle où intercepter) | `zone`, `signal` (mesure gratuite de la salle fouillée) |
| 6 · Capture | `{"attaque": "deauth", "domaine": "…", "comptes": 3, "actions": ["…", "…", "…"]}` (éléments remplis) | `fields`, `partial` (comme l'enquête) |

## Accès depuis un autre poste

`http://IP-DE-LA-VM/` — à compléter par l'équipe réseau.

## Branches

`main` (stable, déployée) ← `dev` (intégration) ← `feature/...` (une par story).
Détails dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Équipe

| Membre | Rôle Scrum | Focus |
|---|---|---|
| *à compléter* | Product Owner | Contenu des épreuves, VM, tests réseau/sécurité |
| *à compléter* | Scrum Master | Rythme, déploiement VM, mini doc |
| Axel | Dev | Front React |
| *à compléter* | Dev | API Symfony |
