# API Symfony

> ⚠️ Dossier à initialiser en H1 (story US-14 « squelette »), sur la branche `feature/US-14-squelette`.

## Initialisation (une seule fois)

Depuis la racine du dépôt :

```bash
rm api/README.md        # Composer a besoin d'un dossier vide
composer create-project symfony/skeleton:"7.*" api
cd api
composer require symfony/monolog-bundle
```

Symfony 7 nécessite **PHP 8.2 minimum**.

## Organisation prévue

- `src/Controller/ChallengeController.php` : les endpoints du jeu
- `config/challenges.yaml` (ou équivalent) : énoncés, indices et réponses des épreuves — **côté serveur uniquement**
- Logs : canal Monolog dédié `game` (une ligne par tentative : épreuve, résultat, IP)

## Contrat d'API (à valider en H1 avec le front)

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/challenges/{id}` | Énoncé + indice de l'épreuve |
| `POST` | `/api/challenges/{id}/answer` | Vérifie la réponse → `{ "correct": true/false }` |

Toutes les routes commencent par `/api` (c'est ce préfixe que Nginx redirige vers Symfony).
