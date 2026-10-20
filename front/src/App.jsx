import { useState } from 'react'
import { flushSync } from 'react-dom'
import Navbar from './components/Navbar'
import Accueil from './screens/Accueil'
import Briefing from './screens/Briefing'
import './App.css'

// Navigation entre les écrans du jeu (pas besoin de routeur pour quelques écrans).
export default function App() {
  const [ecran, setEcran] = useState('accueil')

  const aller = (prochainEcran) => {
    setEcran(prochainEcran)
    window.scrollTo(0, 0)
  }

  // Revient à l'accueil puis descend jusqu'à la section demandée.
  const allerSection = (id) => {
    flushSync(() => setEcran('accueil'))
    document.getElementById(id)?.scrollIntoView()
  }

  return (
    <>
      <Navbar
        onAccueil={() => aller('accueil')}
        onMissions={() => allerSection('missions')}
        onCommentJouer={() => allerSection('comment-jouer')}
      />
      <main>
        {ecran === 'accueil' && <Accueil onLancer={() => aller('briefing')} />}
        {ecran === 'briefing' && <Briefing onStart={() => aller('epreuve1')} />}
        {ecran === 'epreuve1' && <p className="ecran-attente">Épreuve 1 : à venir (US-2)</p>}
      </main>
    </>
  )
}
