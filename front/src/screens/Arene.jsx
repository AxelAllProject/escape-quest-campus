import { useEffect, useRef, useState } from 'react'
import { creerArene } from '../components/arene/scene3d'
import {
  ATTAQUES_BOSS,
  BOSS,
  CHALEUR_MAX,
  clic,
  clicRate,
  creerCombat,
  dronesActifs,
  DUREE_COMBAT,
  enRage,
  enregistrerVictoire,
  enSurchauffe,
  estEtourdi,
  flecheAffichee,
  lireTableau,
  maj,
  multiplicateurCombo,
  patch,
  PV_JOUEUR,
  RECHARGE_PATCH,
  restant,
  SURCHARGE_MAX,
  toucheQTE,
  zeroday,
} from '../game/boss'
import './Arene.css'

const reduit = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const FLECHES = { haut: '↑', bas: '↓', gauche: '←', droite: '→' }
// Flèches du clavier, ZQSD (AZERTY) et WASD (QWERTY).
const TOUCHES = {
  ArrowUp: 'haut', ArrowDown: 'bas', ArrowLeft: 'gauche', ArrowRight: 'droite',
  z: 'haut', w: 'haut', s: 'bas', q: 'gauche', a: 'gauche', d: 'droite',
}
const RAISONS = {
  temps: 'Le chrono est tombé à zéro : le datacenter est chiffré.',
  drones: 'Les drones du botnet ont eu raison de toi.',
  malware: 'Un malware a fini le travail.',
  ddos: 'Le DDoS t’a submergé.',
  phishing: 'Tu as mordu à l’hameçon.',
  ransomware: 'Le ransomware a tout chiffré.',
}

function Jauge({ valeur, max, classe, libelle, texte }) {
  const p = Math.max(0, Math.min(100, (valeur / max) * 100))
  return (
    <div className={`arene-jauge ${classe}${p <= 30 ? ' is-bas' : ''}`} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(valeur)} aria-label={libelle}>
      <div className="arene-jauge__fond">
        <div className="arene-jauge__barre" style={{ width: `${p}%` }} />
      </div>
      {texte !== undefined && <span className="arene-jauge__valeur">{texte}</span>}
    </div>
  )
}

// Page « Arène » : combat de boss en temps réel (clicker + QTE) dans une scène 3D. Easter egg.
export default function Arene({ points, onRetour }) {
  const canvas = useRef(null)
  const zone = useRef(null)
  const scene = useRef(null)
  const combat = useRef(creerCombat(points))
  const compteur = useRef(1)
  const [phase, setPhase] = useState('intro') // intro | decompte | combat | fin
  const [decompte, setDecompte] = useState(3)
  const [, setVue] = useState(0)
  const [erreur3d, setErreur3d] = useState(false)
  const [effets, setEffets] = useState([]) // nombres flottants
  const [banniere, setBanniere] = useState(null)
  const [resultat, setResultat] = useState(null)
  const [palmares, setPalmares] = useState(lireTableau)
  const c = combat.current

  // Scène 3D
  useEffect(() => {
    try {
      scene.current = creerArene(canvas.current, { reduit: reduit() })
      scene.current.majEtat(combat.current)
    } catch {
      setErreur3d(true)
    }
    return () => {
      scene.current?.detruire()
      scene.current = null
    }
  }, [])

  // Compte à rebours avant le combat
  useEffect(() => {
    if (phase !== 'decompte') return undefined
    if (decompte === 0) {
      setPhase('combat')
      return undefined
    }
    const t = setTimeout(() => setDecompte((d) => d - 1), reduit() ? 300 : 700)
    return () => clearTimeout(t)
  }, [phase, decompte])

  const nombre = (texte, classe, x, y) => {
    const id = compteur.current++
    setEffets((e) => [...e.slice(-14), { id, texte, classe, x, y }])
    setTimeout(() => setEffets((e) => e.filter((n) => n.id !== id)), 900)
  }

  // Le cadre tremble quand on encaisse un coup (sans recréer la scène 3D).
  const secouer = () => {
    if (reduit()) return
    zone.current?.animate(
      [{ transform: 'translate(0)' }, { transform: 'translate(-8px, 3px)' }, { transform: 'translate(7px, -4px)' }, { transform: 'translate(-4px, 2px)' }, { transform: 'translate(0)' }],
      { duration: 380 },
    )
  }

  const annoncer = (texte, type = 'info', duree = 1400) => {
    const id = compteur.current++
    setBanniere({ id, texte, type })
    setTimeout(() => setBanniere((b) => (b?.id === id ? null : b)), duree)
  }

  // Traduit les événements du moteur en effets 3D, nombres et annonces.
  const traiter = (evts, position) => {
    const s = scene.current
    const boite = zone.current?.getBoundingClientRect()
    const centreBoss = boite ? { x: boite.width / 2 + 40, y: boite.height * 0.36 } : { x: 0, y: 0 }
    const joueur = boite ? { x: boite.width / 2 - 20, y: boite.height * 0.78 } : { x: 0, y: 0 }
    for (const e of evts) {
      switch (e.type) {
        case 'coup':
          s?.jouer({ ...e, point: position?.point })
          nombre(e.degats, e.cible === 'faille' ? 'is-faille' : e.protege ? 'is-protege' : '', position?.x ?? centreBoss.x, position?.y ?? centreBoss.y)
          if (e.cible === 'faille') annoncer('Faille exploitée !', 'faille', 900)
          break
        case 'qte':
          s?.jouer({ type: e.attaque === 'ransomware' ? 'charge' : 'prepare' })
          break
        case 'parade':
          s?.jouer(e)
          nombre(e.degats, 'is-parade', centreBoss.x, centreBoss.y)
          annoncer(e.attaque === 'ransomware' ? 'Ransomware paré !' : 'Parade !', 'parade', 900)
          break
        case 'touche':
          s?.jouer({ type: e.attaque })
          nombre(`−${e.degats}`, 'is-joueur', joueur.x, joueur.y)
          secouer()
          if (e.attaque === 'phishing') annoncer('Phishing : écran brouillé !', 'danger')
          break
        case 'qte-erreur':
          annoncer('Mauvaise touche !', 'danger', 800)
          break
        case 'tir-drone':
          s?.jouer(e)
          nombre(`−${e.degats}`, 'is-joueur', joueur.x + 40, joueur.y - 10)
          break
        case 'drone-detruit':
          annoncer('Drone détruit', 'parade', 800)
          break
        case 'phase2':
          s?.jouer(e)
          annoncer('Phase 2 : drones déployés, flèches inversées !', 'danger', 2200)
          break
        case 'faille':
          annoncer('Faille ouverte : vise le cœur !', 'faille', 1000)
          break
        case 'zeroday':
          s?.jouer({ type: 'zeroday', critique: true })
          nombre(e.degats, 'is-zeroday', centreBoss.x, centreBoss.y - 30)
          annoncer('EXPLOIT ZERO-DAY', 'faille', 1200)
          break
        case 'patch':
          s?.jouer(e)
          nombre(`+${e.soin}`, 'is-soin', joueur.x, joueur.y)
          break
        case 'surchauffe':
          annoncer('Surchauffe ! Clique moins vite', 'danger', 1200)
          break
        case 'combo-perdu':
          if (e.combo >= 10) nombre(`Combo ×${e.combo} perdu`, 'is-perdu', centreBoss.x, centreBoss.y + 60)
          break
        case 'victoire':
        case 'defaite':
          setTimeout(() => terminer(), reduit() ? 200 : 1800)
          break
        default:
      }
    }
  }

  const terminer = () => {
    const cc = combat.current
    if (cc.fin === 'victoire') {
      const r = enregistrerVictoire(cc.temps)
      setPalmares(r)
      setResultat({ victoire: true, temps: cc.temps, nouveauMeilleur: r.nouveauMeilleur })
    } else {
      setResultat({ victoire: false, raison: cc.raison })
    }
    setPhase('fin')
  }

  // Boucle de jeu : le moteur avance à chaque image, l'interface se rafraîchit ~15 fois par seconde.
  useEffect(() => {
    if (phase !== 'combat') return undefined
    let image
    let avant = performance.now()
    let dernierRendu = 0
    const tic = (t) => {
      image = requestAnimationFrame(tic)
      const dt = Math.min(0.1, (t - avant) / 1000)
      avant = t
      if (document.hidden) return
      traiter(maj(combat.current, dt))
      scene.current?.majEtat(combat.current)
      if (t - dernierRendu > 66) {
        dernierRendu = t
        setVue((v) => v + 1)
      }
    }
    image = requestAnimationFrame(tic)
    return () => cancelAnimationFrame(image)
    // traiter ne change pas de comportement d'un rendu à l'autre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const agir = (evts, position) => {
    traiter(evts, position)
    scene.current?.majEtat(combat.current)
    setVue((v) => v + 1)
  }

  // Clic dans la scène : on vise le robot, sa faille ou un drone.
  const viser = (e) => {
    if (phase !== 'combat' || e.button > 0) return
    const boite = zone.current.getBoundingClientRect()
    const position = { x: e.clientX - boite.left, y: e.clientY - boite.top }
    const cible = scene.current?.viser(e.clientX, e.clientY)
    if (!cible && scene.current) {
      agir(clicRate(combat.current))
      nombre('Raté', 'is-rate', position.x, position.y)
      return
    }
    // Sans 3D (WebGL indisponible), un clic n'importe où vise le robot.
    const { cible: nom = 'robot', drone, point } = cible ?? {}
    agir(clic(combat.current, nom, drone), { ...position, point })
  }

  const fleche = (direction) => phase === 'combat' && agir(toucheQTE(combat.current, direction))
  const lancerZeroday = () => phase === 'combat' && agir(zeroday(combat.current))
  const lancerPatch = () => phase === 'combat' && agir(patch(combat.current))

  const commencer = () => {
    combat.current = creerCombat(points)
    scene.current?.majEtat(combat.current)
    setResultat(null)
    setEffets([])
    setBanniere(null)
    setDecompte(3)
    setPhase('decompte')
  }

  // Clavier : flèches / ZQSD / WASD pour les QTE, Espace = zero-day, E = patch, Échap = quitter.
  useEffect(() => {
    const touche = (e) => {
      if (e.key === 'Escape') {
        onRetour()
        return
      }
      if (phase !== 'combat' || e.repeat) return
      const direction = TOUCHES[e.key] ?? TOUCHES[e.key.toLowerCase()]
      if (direction) {
        e.preventDefault()
        fleche(direction)
      } else if (e.key === ' ') {
        e.preventDefault()
        lancerZeroday()
      } else if (e.key.toLowerCase() === 'e') {
        lancerPatch()
      }
    }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  })

  const q = c.qte
  const rage = enRage(c)
  const drones = dronesActifs(c).length
  const brouille = c.temps < c.brouille
  const surchauffe = enSurchauffe(c)
  const patchDans = Math.max(0, c.patchPret - c.temps)
  const chrono = restant(c)

  return (
    <div className="arene-page">
      <header className="arene-page__tete">
        <div>
          <p className="arene-page__sur-titre">Easter egg · combat de boss en temps réel</p>
          <h1>L'Arène</h1>
        </div>
        <div className="arene-page__actions">
          <p className="arene-page__palmares">
            {palmares.victoires > 0
              ? `${palmares.victoires} victoire${palmares.victoires > 1 ? 's' : ''} · record ${palmares.meilleurTemps} s`
              : 'Aucune victoire'}
          </p>
          <button type="button" className="bouton-secondaire" onClick={onRetour}>
            Quitter l'arène
          </button>
        </div>
      </header>

      <div
        ref={zone}
        className={`arene-scene${rage ? ' is-rage' : ''}${brouille ? ' is-brouille' : ''}${phase === 'fin' && !resultat?.victoire ? ' is-defaite' : ''}${phase === 'combat' ? ' is-combat' : ''}`}
        onPointerDown={viser}
      >
        <canvas ref={canvas} className="arene-scene__canvas" aria-hidden="true" />
        {erreur3d && <p className="arene-scene__erreur">3D indisponible (WebGL désactivé) : clique n'importe où pour frapper.</p>}

        {/* HUD du boss + chrono */}
        <div className="arene-hud arene-hud--boss">
          <p className="arene-hud__nom">
            {BOSS.nom}
            <span className="arene-hud__phase">Phase {c.phase}</span>
            {rage && <span className="arene-hud__etiquette is-rage">Rage</span>}
            {estEtourdi(c) && <span className="arene-hud__etiquette is-etourdi">Étourdi ×1,5</span>}
            {drones > 0 && <span className="arene-hud__etiquette is-drones">{drones} drone{drones > 1 ? 's' : ''} : dégâts ÷2</span>}
            {c.faille && <span className="arene-hud__etiquette is-faille">Faille ouverte</span>}
          </p>
          <Jauge valeur={c.pvBoss} max={BOSS.pv} classe="is-boss" libelle={`PV de ${BOSS.nom}`} texte={`${c.pvBoss}`} />
        </div>
        <div className={`arene-chrono${chrono <= 15 ? ' is-urgent' : ''}`} role="timer" aria-label={`Temps restant : ${Math.ceil(chrono)} secondes`}>
          {chrono.toFixed(1)}
          <span>s</span>
        </div>

        {/* HUD du joueur */}
        <div className="arene-hud arene-hud--joueur">
          <p className="arene-hud__nom">
            Toi <span className="arene-hud__puissance">Puissance ×{c.puissance.toFixed(2)}</span>
          </p>
          <Jauge valeur={c.pvJoueur} max={PV_JOUEUR} classe="is-joueur" libelle="Tes PV" texte={`${c.pvJoueur} PV`} />
          <Jauge
            valeur={c.chaleur}
            max={CHALEUR_MAX}
            classe={`is-chaleur${surchauffe ? ' is-surchauffe' : ''}`}
            libelle="Chaleur de l'émetteur"
            texte={surchauffe ? 'SURCHAUFFE' : 'chaleur'}
          />
          <div className="arene-hud__boutons">
            <button
              type="button"
              className={`arene-capacite is-zeroday${c.surcharge >= SURCHARGE_MAX ? ' is-pret' : ''}`}
              disabled={phase !== 'combat' || c.surcharge < SURCHARGE_MAX}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={lancerZeroday}
            >
              <span className="arene-capacite__remplissage" style={{ height: `${(c.surcharge / SURCHARGE_MAX) * 100}%` }} />
              <span className="arene-capacite__nom">Zero-day</span>
              <kbd>Espace</kbd>
            </button>
            <button
              type="button"
              className="arene-capacite is-patch"
              disabled={phase !== 'combat' || patchDans > 0}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={lancerPatch}
            >
              <span className="arene-capacite__remplissage" style={{ height: `${(1 - patchDans / RECHARGE_PATCH) * 100}%` }} />
              <span className="arene-capacite__nom">{patchDans > 0 ? `${Math.ceil(patchDans)} s` : 'Patch'}</span>
              <kbd>E</kbd>
            </button>
          </div>
        </div>

        {/* Combo */}
        {c.combo >= 3 && phase === 'combat' && (
          <div className="arene-combo" key={c.combo >= 40 ? 'max' : 'combo'}>
            <span className="arene-combo__nb">{c.combo}</span>
            <span className="arene-combo__mult">combo ×{multiplicateurCombo(c).toFixed(2)}</span>
          </div>
        )}

        {/* QTE */}
        {q && phase === 'combat' && (
          <div className={`qte is-${q.type}`} key={q.debut} onPointerDown={(e) => e.stopPropagation()}>
            <p className="qte__titre">
              {ATTAQUES_BOSS[q.type].nom} en approche : pare !
            </p>
            <ol className="qte__sequence" aria-label="Séquence à taper">
              {q.sequence.map((_, i) => (
                <li
                  key={i}
                  className={`qte__fleche${i < q.index ? ' is-faite' : ''}${i === q.index ? ' is-actuelle' : ''}${q.inverses?.[i] ? ' is-inverse' : ''}`}
                  aria-label={q.inverses?.[i] ? `${flecheAffichee(q, i)} inversée` : flecheAffichee(q, i)}
                >
                  {FLECHES[flecheAffichee(q, i)]}
                </li>
              ))}
            </ol>
            <div className="qte__temps">
              <span style={{ animationDuration: `${q.limite - q.debut}s` }} />
            </div>
            <div className="qte__pave" aria-label="Flèches">
              {['gauche', 'haut', 'bas', 'droite'].map((d) => (
                <button key={d} type="button" className="qte__touche" onClick={() => fleche(d)} aria-label={d}>
                  {FLECHES[d]}
                </button>
              ))}
            </div>
          </div>
        )}

        {banniere && (
          <p key={banniere.id} className={`arene-banniere is-${banniere.type}`} aria-live="assertive">
            {banniere.texte}
          </p>
        )}

        {effets.map((n) => (
          <span key={n.id} className={`arene-nombre ${n.classe}`} style={{ left: n.x, top: n.y }} aria-hidden="true">
            {n.texte}
          </span>
        ))}

        {phase === 'decompte' && (
          <div className="arene-decompte" key={decompte} aria-live="assertive">
            {decompte > 0 ? decompte : 'GO'}
          </div>
        )}

        {phase === 'intro' && (
          <div className="arene-panneau" onPointerDown={(e) => e.stopPropagation()}>
            <p className="arene-panneau__titre">Combat en temps réel</p>
            <ul className="arene-panneau__regles">
              <li><strong>Clique sur le robot</strong> pour le frapper. Enchaîne sans pause pour monter le combo (jusqu'à ×2). Un clic dans le vide casse le combo.</li>
              <li><strong>Pas trop vite :</strong> au-delà de ~6 clics/s, l'émetteur surchauffe et tu es bloqué.</li>
              <li><strong>Faille :</strong> quand le cœur du robot s'ouvre (orange), clique dessus pour de gros dégâts.</li>
              <li><strong>QTE :</strong> avant chaque attaque, tape les flèches à temps (flèches, ZQSD ou WASD). Réussi = parade et robot étourdi. Raté = dégâts.</li>
              <li><strong>Phase 2 :</strong> des drones protègent le robot et tirent : détruis-les. Les flèches <span className="is-rouge">rouges</span> se tapent dans le sens opposé.</li>
              <li><strong>Surcharge pleine</strong> → zero-day (Espace). <strong>Patch</strong> (E) : soin, 15 s de recharge.</li>
              <li>Tu as <strong>{DUREE_COMBAT} secondes</strong>. Puissance ×{c.puissance.toFixed(2)} grâce à tes {points} points de mission.</li>
            </ul>
            <button type="button" className="bouton" onClick={commencer}>
              Lancer le combat
            </button>
          </div>
        )}

        {phase === 'fin' && resultat && (
          <div className={`arene-panneau is-fin${resultat.victoire ? ' is-victoire' : ' is-defaite'}`} onPointerDown={(e) => e.stopPropagation()}>
            <p className="arene-panneau__titre">{resultat.victoire ? 'ROOT-KIT 9000 désactivé' : 'Datacenter perdu'}</p>
            <p>
              {resultat.victoire
                ? `Victoire en ${resultat.temps.toFixed(1)} s${resultat.nouveauMeilleur ? ', nouveau record !' : '.'}`
                : RAISONS[resultat.raison] ?? 'Le robot a gagné cette fois.'}
            </p>
            <dl className="arene-stats">
              <div><dt>Clics</dt><dd>{c.stats.clics}</dd></div>
              <div><dt>Combo max</dt><dd>{c.comboMax}</dd></div>
              <div><dt>Parades</dt><dd>{c.stats.parades}/{c.stats.parades + c.stats.ratees}</dd></div>
              <div><dt>Failles</dt><dd>{c.stats.failles}</dd></div>
              <div><dt>PV du boss</dt><dd>{c.pvBoss}</dd></div>
            </dl>
            {!resultat.victoire && <p className="arene-panneau__conseil">Plus tu as de points en mission, plus tu frappes fort.</p>}
            <div className="arene-panneau__actions">
              <button type="button" className="bouton" onClick={commencer}>
                {resultat.victoire ? 'Revanche' : 'Retenter'}
              </button>
              <button type="button" className="bouton-secondaire" onClick={onRetour}>
                Quitter l'arène
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="arene-aide">
        Clic : frapper · Flèches / ZQSD / WASD : parer · Espace : zero-day · E : patch · Échap : quitter
      </p>
    </div>
  )
}
