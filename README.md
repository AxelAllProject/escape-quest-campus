# 🔐 Escape Quest Campus

Mini escape game web (5–10 min) : le joueur résout 3 épreuves pour rétablir un service critique du campus.
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

## Lancer en local (dev)

```bash
# Back (terminal 1)
cd api
composer install
symfony server:start          # ou : php -S localhost:8000 -t public

# Front (terminal 2)
cd front
npm install
npm run dev                   # http://localhost:5173 (proxy /api → localhost:8000)
```

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
