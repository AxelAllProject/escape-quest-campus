import { useState } from 'react'
import { flushSync } from 'react-dom'
import Navbar from './components/Navbar'
import Accueil from './screens/Accueil'
import Briefing from './screens/Briefing'
import Epreuve from './screens/Epreuve'
import './App.css'

// Les 3 épreuves de la mission 1, dans l'ordre (id = identifiant côté API).
const EPREUVES = [1, 2, 3]
const ETATS_INITIAUX = EPREUVES.map(() => 'verrouille')

// Navigation entre les écrans du jeu (pas besoin de routeur pour quelques écrans).
export default function App() {
  const [ecran, setEcran] = useState('accueil')
  const [etape, setEtape] = useState(0)
  const [etats, setEtats] = useState(ETATS_INITIAUX)
  const [indicesUtilises, setIndicesUtilises] = useState(0)

  const aller = (prochainEcran) => {
    setEcran(prochainEcran)
    window.scrollTo(0, 0)
  }

  // Revient à l'accueil puis descend jusqu'à la section demandée.
  const allerSection = (id) => {
    flushSync(() => setEcran('accueil'))
    document.getElementById(id)?.scrollIntoView()
  }

  const ouvrirBriefing = () => {
    setEtape(0)
    setEtats(ETATS_INITIAUX)
    setIndicesUtilises(0)
    aller('briefing')
  }

  const marquerReussie = (index) =>
    setEtats((liste) => liste.map((etat, i) => (i === index ? 'retabli' : etat)))

  const epreuveSuivante = () => {
    if (etape < EPREUVES.length - 1) {
      setEtape(etape + 1)
      window.scrollTo(0, 0)
    }
  }

  return (
    <>
      <Navbar
        onAccueil={() => aller('accueil')}
        onMissions={() => allerSection('missions')}
        onCommentJouer={() => allerSection('comment-jouer')}
      />
      <main>
        {ecran === 'accueil' && <Accueil onLancer={ouvrirBriefing} />}
        {ecran === 'briefing' && <Briefing onStart={() => aller('epreuve')} />}
        {ecran === 'epreuve' && (
          <Epreuve
            key={EPREUVES[etape]}
            id={EPREUVES[etape]}
            numero={etape + 1}
            total={EPREUVES.length}
            etats={etats}
            indicesUtilises={indicesUtilises}
            onReussite={() => marquerReussie(etape)}
            onSuivante={epreuveSuivante}
            onIndice={() => setIndicesUtilises((n) => n + 1)}
          />
        )}
      </main>
    </>
  )
}
