# API Symfony

Versions : PHP 8.3 (minimum 8.2), Symfony **7.4 LTS**, Composer 2.

## Première installation

```bash
composer install
```

La première fois, Symfony Flex génère automatiquement les fichiers du framework
(`bin/console`, `config/`, `public/index.php`, `src/Kernel.php`, `.env`, `symfony.lock`, `composer.lock`).
**Ils doivent être commités.**

## Lancer en local

```bash
symfony server:start          # ou : php -S localhost:8000 -t public
```

Vérifier : http://localhost:8000/api/health → `{"status":"ok"}`

## Endpoints

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/health` | L'API répond |
| `GET` | `/api/challenges/{id}` | Énoncé d'une épreuve (jamais la solution) |
| `GET` | `/api/challenges/{id}/hints/{n}` | Indice n° n de l'épreuve (2 par épreuve) |
| `POST` | `/api/challenges/{id}/answer` | Vérifie la réponse : `{"answer": …}` → `{"correct": bool, "message": "…"}` |

Toutes les routes commencent par `/api` (préfixe redirigé vers Symfony par Nginx et par le proxy Vite).
Contenu et solutions des épreuves : `src/Game/Challenges.php`.

| Épreuve | Format de `answer` | Retour en plus de `correct` / `message` |
|---|---|---|
| 1 · Mail piégé | `["expediteur", "lien", …]` (éléments signalés) | — |
| 2 · Réseau | `{"ports": {"http": 80, …}, "firewall": {"http": "ouvert", "porte": "bloque", …}}` | `fields` (service → bien branché ?), `firewall` (nombre de règles justes) |
| 3 · Enquête | `{"ip": "…", "compte": "…", "heure": "HH:MM:SS", "persistance": "…", "cle": "…"}` (fiches remplies) | `fields` (fiche → juste ?), `partial` (pistes justes mais dossier incomplet : pas de pénalité) |
