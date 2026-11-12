// Easter egg : combat de boss EN TEMPS RÉEL contre ROOT-KIT 9000 (clicker + QTE).
// Moteur pur (pas de React ni de 3D) : on l'avance avec maj(c, dt) et on lui envoie les actions
// du joueur. Chaque fonction renvoie la liste des événements, pour l'affichage et les effets 3D.
//
// - Clic sur le robot (ping) : petits dégâts, mais le combo monte tant qu'on clique sans pause.
// - Faille : le cœur du robot s'ouvre quelques instants ; un clic dessus = gros dégâts.
// - Attaque du robot : une séquence de flèches s'affiche (QTE). Tout taper à temps = parade
//   (aucun dégât, robot étourdi et vulnérable). Une erreur ou trop lent = dégâts, combo perdu.
// - Surcharge : se remplit en frappant et en parant ; pleine, elle débloque l'exploit zero-day.
// - Patch : soin, puis 15 s de recharge.
// - Phase 2 (50 % de PV) : 2 drones protègent le robot (dégâts sur lui ÷2) et tirent. Détruis-les.
// - Rage (25 % de PV) : attaques plus fréquentes, QTE plus longs et plus rapides.
// - Si le chrono tombe à zéro, le datacenter est chiffré : défaite.
// - Surchauffe : cliquer trop vite (plus de ~6 clics/s) fait surchauffer l'émetteur : bloqué 1,6 s, combo perdu.
// - Flèches inversées (dès la phase 2) : une flèche rouge se tape dans le sens opposé.

export const BOSS = { nom: 'ROOT-KIT 9000', pv: 5600 }
export const PV_JOUEUR = 100
export const DUREE_COMBAT = 100 // secondes
export const DIRECTIONS = ['haut', 'bas', 'gauche', 'droite']
export const SURCHARGE_MAX = 100
export const RECHARGE_PATCH = 15

const PV_DRONE = 160
export const CHALEUR_MAX = 100
const CHALEUR_CLIC = 8
const REFROIDISSEMENT = 46 // par seconde
const DUREE_SURCHAUFFE = 1.6
export const OPPOSE = { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' }
const PAUSE_COMBO = 1 // s sans clic avant de perdre le combo
const COMBO_MAX = 40 // combo qui donne le bonus maximal (×2)

export const ATTAQUES_BOSS = {
  malware: { nom: 'Malware', degats: 26, touches: [2, 3] },
  ddos: { nom: 'DDoS', degats: 30, touches: [3, 4] },
  phishing: { nom: 'Phishing', degats: 18, touches: [2, 3] }, // en plus : écran brouillé 3 s
  ransomware: { nom: 'Ransomware', degats: 46, touches: [5, 5] },
}

export const puissance = (points) => Math.min(3, Math.round((1 + Math.max(0, points) / 2000) * 100) / 100)

const entre = (a, b, alea) => a + (b - a) * alea()
const entier = (a, b, alea) => Math.floor(entre(a, b + 1, alea))

export function creerCombat(points) {
  return {
    puissance: puissance(points),
    pvBoss: BOSS.pv,
    pvJoueur: PV_JOUEUR,
    temps: 0,
    combo: 0,
    comboMax: 0,
    dernierClic: -10,
    surcharge: 0,
    chaleur: 0,
    surchauffe: 0, // émetteur bloqué jusqu'à cet instant
    patchPret: 0,
    etourdi: 0, // le robot est étourdi jusqu'à cet instant
    brouille: 0, // écran brouillé (phishing) jusqu'à cet instant
    phase: 1,
    drones: [],
    faille: null, // { fin }
    prochaineFaille: 5,
    prochaineAttaque: 3.5,
    nbAttaques: 0,
    qte: null, // { type, sequence, index, debut, limite }
    fin: null, // 'victoire' | 'defaite'
    raison: null,
    stats: { clics: 0, parades: 0, ratees: 0, failles: 0 },
  }
}

export const enRage = (c) => c.pvBoss > 0 && c.pvBoss <= BOSS.pv * 0.25
export const restant = (c) => Math.max(0, DUREE_COMBAT - c.temps)
export const multiplicateurCombo = (c) => 1 + Math.min(c.combo, COMBO_MAX) / COMBO_MAX
export const dronesActifs = (c) => c.drones.filter((d) => d.pv > 0)
export const estEtourdi = (c) => c.temps < c.etourdi
export const enSurchauffe = (c) => c.temps < c.surchauffe

function intervalleAttaque(c, alea) {
  return enRage(c) ? entre(2.2, 3, alea) : entre(3, 4.2, alea)
}

function blesserBoss(c, degats, evts) {
  c.pvBoss = Math.max(0, c.pvBoss - degats)
  if (c.pvBoss === 0) {
    c.fin = 'victoire'
    c.qte = null
    evts.push({ type: 'victoire' })
    return
  }
  if (c.phase === 1 && c.pvBoss <= BOSS.pv * 0.5) {
    c.phase = 2
    c.drones = [0, 1].map((id) => ({ id, pv: PV_DRONE, prochainTir: c.temps + 2.5 + id * 1.2 }))
    evts.push({ type: 'phase2' })
  }
}

function blesserJoueur(c, degats, evts, cause) {
  c.pvJoueur = Math.max(0, c.pvJoueur - degats)
  if (c.pvJoueur === 0) {
    c.fin = 'defaite'
    c.raison = cause
    c.qte = null
    evts.push({ type: 'defaite', raison: cause })
  }
}

// Fait avancer le combat de dt secondes.
export function maj(c, dt, alea = Math.random) {
  const evts = []
  if (c.fin) return evts
  c.temps += dt

  if (restant(c) === 0) {
    c.fin = 'defaite'
    c.raison = 'temps'
    c.qte = null
    evts.push({ type: 'defaite', raison: 'temps' })
    return evts
  }

  c.chaleur = Math.max(0, c.chaleur - REFROIDISSEMENT * dt)

  if (c.combo > 0 && c.temps - c.dernierClic > PAUSE_COMBO) {
    evts.push({ type: 'combo-perdu', combo: c.combo })
    c.combo = 0
  }

  // Faille dans le cœur du robot
  if (c.faille && c.temps > c.faille.fin) {
    c.faille = null
    c.prochaineFaille = c.temps + entre(4.5, 7.5, alea)
    evts.push({ type: 'faille-fermee' })
  } else if (!c.faille && !c.qte && c.temps >= c.prochaineFaille) {
    c.faille = { fin: c.temps + (enRage(c) ? 1.1 : 1.5) }
    evts.push({ type: 'faille' })
  }

  // Tirs des drones
  c.drones.forEach((d) => {
    if (d.pv > 0 && c.temps >= d.prochainTir) {
      d.prochainTir = c.temps + entre(2.6, 3.6, alea)
      evts.push({ type: 'tir-drone', drone: d.id, degats: 5 })
      blesserJoueur(c, 5, evts, 'drones')
    }
  })
  if (c.fin) return evts

  // QTE en cours : trop lent = attaque reçue
  if (c.qte) {
    if (c.temps > c.qte.limite) rater(c, evts, alea)
    return evts
  }

  // Nouvelle attaque du robot
  if (c.temps >= c.prochaineAttaque && !estEtourdi(c)) {
    c.nbAttaques++
    const type = c.nbAttaques % 4 === 0 ? 'ransomware' : ['malware', 'ddos', 'phishing'][Math.floor(alea() * 3)]
    const [min, max] = ATTAQUES_BOSS[type].touches
    const longueur = entier(min, max, alea) + (enRage(c) && type !== 'ransomware' ? 1 : 0)
    const sequence = Array.from({ length: longueur }, () => DIRECTIONS[Math.floor(alea() * 4)])
    // Dès la phase 2, certaines flèches sont inversées : affichées en rouge, à taper dans l'autre sens.
    const chanceInverse = c.phase === 2 ? (enRage(c) ? 0.5 : 0.35) : 0
    const inverses = sequence.map(() => alea() < chanceInverse)
    const parTouche = (type === 'ransomware' ? 0.5 : 0.58) * (enRage(c) ? 0.85 : 1)
    const delai = 0.55 // le temps de voir arriver l'attaque
    c.qte = { type, sequence, inverses, index: 0, debut: c.temps, limite: c.temps + delai + longueur * parTouche }
    c.faille = null
    evts.push({ type: 'qte', attaque: type, sequence, inverses })
  }
  return evts
}

function rater(c, evts, alea) {
  const { type } = c.qte
  const degats = Math.round(ATTAQUES_BOSS[type].degats * (enRage(c) ? 1.3 : 1))
  c.qte = null
  c.stats.ratees++
  c.combo = 0
  if (type === 'phishing') c.brouille = c.temps + 3
  c.prochaineAttaque = c.temps + intervalleAttaque(c, alea)
  evts.push({ type: 'touche', attaque: type, degats })
  blesserJoueur(c, degats, evts, type)
}

// Flèche à afficher pour l'étape i (l'opposé de celle à taper si elle est inversée).
export const flecheAffichee = (q, i) => (q.inverses?.[i] ? OPPOSE[q.sequence[i]] : q.sequence[i])

// Le joueur appuie sur une flèche (clavier ou boutons à l'écran).
// `sequence` contient toujours la touche ATTENDUE ; l'affichage peut être inversé.
export function toucheQTE(c, direction, alea = Math.random) {
  const evts = []
  if (c.fin || !c.qte) return evts
  const q = c.qte
  if (direction !== q.sequence[q.index]) {
    evts.push({ type: 'qte-erreur' })
    rater(c, evts, alea)
    return evts
  }
  q.index++
  evts.push({ type: 'qte-ok', index: q.index })
  if (q.index === q.sequence.length) {
    c.qte = null
    c.stats.parades++
    c.surcharge = Math.min(SURCHARGE_MAX, c.surcharge + (q.type === 'ransomware' ? 35 : 20))
    c.etourdi = c.temps + (q.type === 'ransomware' ? 2.5 : 1.5)
    c.prochaineAttaque = c.etourdi + intervalleAttaque(c, alea) * 0.6
    const riposte = Math.round((q.type === 'ransomware' ? 120 : 40) * c.puissance)
    evts.push({ type: 'parade', attaque: q.type, degats: riposte })
    blesserBoss(c, riposte, evts)
  }
  return evts
}

// Clic du joueur : 'robot', 'faille' ou 'drone' (avec son id).
export function clic(c, cible, droneId, alea = Math.random) {
  const evts = []
  if (c.fin || enSurchauffe(c)) return evts
  c.chaleur += CHALEUR_CLIC
  if (c.chaleur >= CHALEUR_MAX) {
    c.chaleur = CHALEUR_MAX
    c.surchauffe = c.temps + DUREE_SURCHAUFFE
    const combo = c.combo
    c.combo = 0
    evts.push({ type: 'surchauffe', combo })
    return evts
  }
  c.combo = c.temps - c.dernierClic <= PAUSE_COMBO ? c.combo + 1 : 1
  c.comboMax = Math.max(c.comboMax, c.combo)
  c.dernierClic = c.temps
  c.stats.clics++
  const mult = multiplicateurCombo(c) * (estEtourdi(c) ? 1.5 : 1)

  if (cible === 'faille' && c.faille) {
    const degats = Math.round(60 * c.puissance * mult)
    c.faille = null
    c.prochaineFaille = c.temps + entre(4.5, 7.5, alea)
    c.surcharge = Math.min(SURCHARGE_MAX, c.surcharge + 15)
    c.stats.failles++
    evts.push({ type: 'coup', cible: 'faille', degats, critique: true })
    blesserBoss(c, degats, evts)
    return evts
  }

  if (cible === 'drone') {
    const d = c.drones.find((x) => x.id === droneId && x.pv > 0)
    if (d) {
      const degats = Math.round(9 * c.puissance * mult)
      d.pv = Math.max(0, d.pv - degats)
      evts.push({ type: 'coup', cible: 'drone', drone: d.id, degats })
      if (d.pv === 0) evts.push({ type: 'drone-detruit', drone: d.id })
      return evts
    }
  }

  // Le robot (les drones actifs le protègent : dégâts ÷2)
  const bouclier = dronesActifs(c).length > 0 ? 0.5 : 1
  const degats = Math.max(1, Math.round(6 * c.puissance * mult * bouclier))
  c.surcharge = Math.min(SURCHARGE_MAX, c.surcharge + 1)
  evts.push({ type: 'coup', cible: 'robot', degats, protege: bouclier < 1 })
  blesserBoss(c, degats, evts)
  return evts
}

// Clic dans le vide : le combo est perdu (on ne mitraille pas au hasard).
export function clicRate(c) {
  if (c.fin || c.combo === 0) return []
  const combo = c.combo
  c.combo = 0
  return [{ type: 'combo-perdu', combo }]
}

export function zeroday(c) {
  const evts = []
  if (c.fin || c.surcharge < SURCHARGE_MAX) return evts
  c.surcharge = 0
  const degats = Math.round(260 * c.puissance * (estEtourdi(c) ? 1.5 : 1))
  evts.push({ type: 'zeroday', degats })
  blesserBoss(c, degats, evts)
  return evts
}

export function patch(c) {
  const evts = []
  if (c.fin || c.temps < c.patchPret) return evts
  const soin = Math.min(PV_JOUEUR - c.pvJoueur, Math.round(20 * (1 + (c.puissance - 1) / 2)))
  c.pvJoueur += soin
  c.patchPret = c.temps + RECHARGE_PATCH
  evts.push({ type: 'patch', soin })
  return evts
}

// Palmarès gardé dans le navigateur : victoires et meilleur temps.
const CLE = 'escape-quest:boss'

export function lireTableau() {
  try {
    const t = JSON.parse(localStorage.getItem(CLE))
    if (t && typeof t === 'object') return { victoires: t.victoires ?? 0, meilleurTemps: t.meilleurTemps ?? null }
  } catch {
    // stockage indisponible
  }
  return { victoires: 0, meilleurTemps: null }
}

export function enregistrerVictoire(temps) {
  const t = lireTableau()
  const secondes = Math.round(temps * 10) / 10
  const meilleur = t.meilleurTemps === null || secondes < t.meilleurTemps
  const apres = { victoires: t.victoires + 1, meilleurTemps: meilleur ? secondes : t.meilleurTemps }
  try {
    localStorage.setItem(CLE, JSON.stringify(apres))
  } catch {
    // pas de stockage
  }
  return { ...apres, nouveauMeilleur: meilleur }
}
