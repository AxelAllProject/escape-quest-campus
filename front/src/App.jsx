import { useState } from 'react'
import Accueil from './screens/Accueil'
import './App.css'

// Navigation entre les écrans du jeu (pas besoin de routeur pour 5 écrans).
export default function App() {
  const [ecran, setEcran] = useState('accueil')

  return (
    <main className="app">
      {ecran === 'accueil' && <Accueil onStart={() => setEcran('epreuve1')} />}
      {ecran === 'epreuve1' && <p>Épreuve 1 : à venir (US-2)</p>}
    </main>
  )
}
