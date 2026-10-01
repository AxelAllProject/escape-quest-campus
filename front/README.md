# Front React (Vite)

```bash
npm install
npm run dev      # http://localhost:5173 — /api est redirigé vers http://localhost:8000
npm run build    # build de production dans dist/ (servi par Nginx sur la VM)
```

Versions : Node.js 24 LTS (minimum 22.12), Vite 8, React 19.

Règle : appels API **toujours en chemin relatif** (`fetch('/api/...')`), jamais `localhost` en dur.
