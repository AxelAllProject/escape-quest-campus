import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import Navbar from './components/Navbar'
import {
  badgesObtenus,
  bilan,
  enregistrerPartie,
  EPREUVES,
  nouvellePartie,
  pointsEpreuve,
} from './game/partie'
import Accueil from './screens/Accueil'
import Briefing from './screens/Briefing'
import Epreuve from './screens/Epreuve'
import Victoire from './screens/Victoire'
import './App.css'

// Navigation entre les écrans et déroulement de la partie.
export default function App() {
  const [ecran, setEcran] = useState('accueil')
  const [etape, setEtape] = useState(0)
  const [partie, setPartie] = useState(nouvellePartie)
  const [resultat, setResultat] = useState(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  // Le minuteur avance une fois par seconde pendant les épreuves.
  useEffect(() => {
    if (ecran !== 'epreuve') return undefined
    const tic = setInterval(() => setMaintenant(Date.now()), 1000)
    return () => clearInterval(tic)
  }, [ecran])

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
    setPartie(nouvellePartie())
    setResultat(null)
    aller('briefing')
  }

  const commencer = () => {
    const debut = Date.now()
    setPartie((p) => ({ ...p, debut }))
    setMaintenant(debut)
    aller('epreuve')
  }

  const modifierEpreuve = (index, changement) =>
    setPartie((p) => ({
      ...p,
      epreuves: p.epreuves.map((e, i) => (i === index ? changement(e) : e)),
    }))

  const reussir = (index) =>
    modifierEpreuve(index, (e) => (e.resolueA ? e : { ...e, resolueA: Date.now(), points: pointsEpreuve(e) }))

  const terminer = () => {
    const finie = { ...partie, fin: Date.now() }
    const b = bilan(finie)
    const ids = badgesObtenus(finie, b)
    setPartie(finie)
    setResultat({ bilan: b, badges: ids, ...enregistrerPartie(b, ids) })
    aller('victoire')
  }

  const epreuveSuivante = () => {
    if (etape < EPREUVES.length - 1) {
      setEtape(etape + 1)
      window.scrollTo(0, 0)
    } else {
      terminer()
    }
  }

  const etats = partie.epreuves.map((e) => (e.resolueA ? 'retabli' : 'verrouille'))

  return (
    <>
      <Navbar
        reseauRetabli={ecran === 'victoire'}
        onAccueil={() => aller('accueil')}
        onMissions={() => allerSection('missions')}
        onCommentJouer={() => allerSection('comment-jouer')}
      />
      <main>
        {ecran === 'accueil' && <Accueil onLancer={ouvrirBriefing} />}
        {ecran === 'briefing' && <Briefing onStart={commencer} />}
        {ecran === 'epreuve' && (
          <Epreuve
            key={EPREUVES[etape]}
            id={EPREUVES[etape]}
            numero={etape + 1}
            total={EPREUVES.length}
            etats={etats}
            partie={partie}
            maintenant={maintenant}
            onReussite={() => reussir(etape)}
            onErreur={() => modifierEpreuve(etape, (e) => ({ ...e, erreurs: e.erreurs + 1 }))}
            onIndice={() => modifierEpreuve(etape, (e) => ({ ...e, indices: e.indices + 1 }))}
            onSuivante={epreuveSuivante}
          />
        )}
        {ecran === 'victoire' && resultat && (
          <Victoire
            partie={partie}
            resultat={resultat}
            onRejouer={ouvrirBriefing}
            onAccueil={() => allerSection('missions')}
          />
        )}
      </main>
    </>
  )
}
