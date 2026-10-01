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
| `GET` | `/api/challenges/{id}` | Énoncé + indice d'une épreuve (endpoint modèle) |
| `POST` | `/api/challenges/{id}/answer` | Vérifie la réponse → `{ "correct": true/false }` *(à venir)* |

Toutes les routes commencent par `/api` (préfixe redirigé vers Symfony par Nginx et par le proxy Vite).
