import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [api, setApi] = useState({ etat: 'chargement' })

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setApi({ etat: 'ok', data }))
      .catch(() => setApi({ etat: 'erreur' }))
  }, [])

  return (
    <main className="app">
      <h1>Escape Quest Campus</h1>
      <p>Squelette React + Symfony.</p>
      {api.etat === 'chargement' && <p>Connexion à l'API…</p>}
      {api.etat === 'ok' && <p className="ok">API connectée : {api.data.status}</p>}
      {api.etat === 'erreur' && (
        <p className="erreur">API injoignable : lance Symfony sur le port 8000.</p>
      )}
    </main>
  )
}
