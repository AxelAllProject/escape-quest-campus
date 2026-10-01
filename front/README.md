# Front React (Vite)

> ⚠️ Dossier à initialiser en H1 (story US-14 « squelette »), sur la branche `feature/US-14-squelette`.

## Initialisation (une seule fois)

Depuis la racine du dépôt :

```bash
rm front/README.md      # Vite a besoin d'un dossier vide
npm create vite@latest front -- --template react
cd front
npm install
```

Puis, dans `front/vite.config.js`, ajouter le proxy vers l'API en local :

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

## Règles

- Appels API **toujours en chemin relatif** : `fetch('/api/challenges/1')`, jamais `http://localhost:8000/...` en dur.
  En local, le proxy Vite redirige vers Symfony ; sur la VM, c'est Nginx.
- Un composant par écran : `Accueil`, `Epreuve1`, `Epreuve2`, `Epreuve3`, `Victoire`.
- Build de production : `npm run build` → dossier `dist/` servi par Nginx.
