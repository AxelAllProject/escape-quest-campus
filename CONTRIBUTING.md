# Workflow Git

## Les branches

```
main      ●───────────────●───────────────●          ← stable, déployée sur la VM, montrée en démo
           \             /               /
dev         ●───●───●───●───●───●───●───●            ← intégration : tout ce qui est "Done"
                 \     /       \       /
feature/...       ●───●         ●─────●              ← une branche par story
```

| Branche | Rôle | Qui y pousse ? |
|---|---|---|
| `main` | Version stable. C'est elle qui tourne sur la VM et qu'on montre à la micro-démo. | Personne en direct : uniquement par merge de `dev` |
| `dev` | Intégration. Contient toutes les stories terminées et testées. | Personne en direct : uniquement par merge (PR) des `feature/*` |
| `feature/US-<id>-<description>` | Une story du backlog Notion. Créée depuis `dev`, supprimée après merge. | Le dev qui porte la story |

> 🔒 Sur GitHub, protéger `main` et `dev` (Settings → Branches) : pas de push direct, merge par Pull Request.

## Nommage des branches feature

Utiliser l'**ID de la story** dans le backlog Notion (`US-…`) :

```
feature/US-14-squelette
feature/US-2-epreuve-phishing
feature/US-4-epreuve-ports
feature/US-15-vm-nginx
```

Minuscules, mots séparés par des tirets, pas d'accents.

## Le cycle d'une story

```bash
# 1. Partir de dev à jour
git switch dev
git pull

# 2. Créer la branche de la story
git switch -c feature/US-2-epreuve-phishing

# 3. Travailler, commiter souvent
git add .
git commit -m "feat(front): affichage du faux mail"

# 4. Pousser et ouvrir une Pull Request vers dev
git push -u origin feature/US-2-epreuve-phishing
```

5. **Pull Request vers `dev`** : une autre personne teste et valide (règle « Done = testé par quelqu'un d'autre »).
6. Merge, puis suppression de la branche feature.
7. Dans Notion, passer la story en **Done** et remplir « Testé par ».

## Le rythme d'une heure

| Créneau | Git |
|---|---|
| 0–45 min | Travail sur les branches `feature/*` |
| 45–50 min | PR `feature/*` → `dev`, test croisé, puis merge `dev` → `main` et déploiement (`deploy/deploy.sh`) |
| 50–57 min | Micro-démo sur la VM, depuis `main` |

> Si une story n'est pas finie à 45 min, elle **reste** sur sa branche feature : on ne merge pas du travail non testé dans `dev`.

## Messages de commit

Format : `type(portée): description courte`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `sec` | Correctif de sécurité (carte 5 !) |
| `docs` | Documentation, mini doc |
| `chore` | Config, dépendances, déploiement |

Portées : `front`, `api`, `infra`, `docs`.

Exemples :
```
feat(api): endpoint de vérification de l'épreuve 2
fix(front): bouton suivant inactif après bonne réponse
sec(api): la réponse n'est plus renvoyée dans GET /api/challenges/{id}
chore(infra): script de déploiement
```
