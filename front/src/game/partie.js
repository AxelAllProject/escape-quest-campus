// Règles du jeu, communes à toutes les missions : minuteur, score, rang, badges et record.
// Ce qui change d'une mission à l'autre (épreuves, durée, récit) est dans missions.js.

const POINTS_EPREUVE = 300
const PENALITE_INDICE = 50
const PENALITE_ERREUR = 25
const BONUS_PREMIER_COUP = 50
const MINIMUM_EPREUVE = 50

export function nouvellePartie(mission) {
  return {
    mission: mission.id,
    duree: mission.duree, // secondes
    debut: null,
    fin: null,
    epreuves: mission.epreuves.map(() => ({ indices: 0, erreurs: 0, resolueA: null, points: 0 })),
  }
}

export const secondesEcoulees = (partie, maintenant) =>
  partie.debut ? Math.floor(((partie.fin ?? maintenant) - partie.debut) / 1000) : 0

export const secondesRestantes = (partie, maintenant) => Math.max(0, partie.duree - secondesEcoulees(partie, maintenant))

export function formaterDuree(secondes) {
  const m = Math.floor(secondes / 60)
  const s = secondes % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const premierCoup = (e) => e.resolueA !== null && e.indices === 0 && e.erreurs === 0

// Points d'une épreuve au moment où elle est réussie.
export function pointsEpreuve(e) {
  const base = POINTS_EPREUVE - e.indices * PENALITE_INDICE - e.erreurs * PENALITE_ERREUR
  return Math.max(MINIMUM_EPREUVE, base) + (e.indices === 0 && e.erreurs === 0 ? BONUS_PREMIER_COUP : 0)
}

// Série en cours : épreuves réussies du premier coup, à la suite.
export function serie(partie) {
  let n = 0
  for (const e of partie.epreuves) {
    if (e.resolueA === null) break
    n = premierCoup(e) ? n + 1 : 0
  }
  return n
}

export const scoreEpreuves = (partie) => partie.epreuves.reduce((total, e) => total + e.points, 0)

export function bilan(partie) {
  const temps = secondesEcoulees(partie, partie.fin)
  const bonusTemps = Math.max(0, partie.duree - temps)
  const score = scoreEpreuves(partie) + bonusTemps
  return {
    temps,
    bonusTemps,
    score,
    rang: rang(score, partie.duree),
    indices: partie.epreuves.reduce((n, e) => n + e.indices, 0),
    erreurs: partie.epreuves.reduce((n, e) => n + e.erreurs, 0),
    serieMax: serieMax(partie),
  }
}

function serieMax(partie) {
  let max = 0
  let n = 0
  for (const e of partie.epreuves) {
    n = premierCoup(e) ? n + 1 : 0
    max = Math.max(max, n)
  }
  return max
}

// Seuils pensés pour 10 minutes : une mission plus longue rapporte plus de bonus de temps,
// donc les seuils montent d'autant.
export function rang(score, duree = 600) {
  const s = score - (duree - 600)
  if (s >= 1350) return 'S'
  if (s >= 1100) return 'A'
  if (s >= 800) return 'B'
  return 'C'
}

export const RANGS = {
  S: 'Admin légendaire',
  A: 'Expert sécurité',
  B: 'Technicien confirmé',
  C: 'Stagiaire de la DSI',
}

// Badges d'une mission : le premier est propre à la mission, les autres sont communs.
export const badgesMission = (mission) => [
  mission.badgePremier,
  ...BADGES_COMMUNS,
]

const BADGES_COMMUNS = [
  { id: 'autonome', nom: 'Autonome', texte: 'Finir la mission sans aucun indice' },
  { id: 'sans-faute', nom: 'Sans faute', texte: 'Finir la mission sans aucune erreur' },
  { id: 'dans-les-temps', nom: 'Dans les temps', texte: 'Finir avant la fin du minuteur' },
  { id: 'eclair', nom: 'Éclair', texte: 'Finir en moins de 40 % du temps imparti' },
  { id: 'legende', nom: 'Légende', texte: 'Obtenir le rang S' },
]

export function badgesObtenus(partie, b, mission) {
  const ids = []
  if (premierCoup(partie.epreuves[0])) ids.push(mission.badgePremier.id)
  if (b.indices === 0) ids.push('autonome')
  if (b.erreurs === 0) ids.push('sans-faute')
  if (b.temps < partie.duree) ids.push('dans-les-temps')
  if (b.temps < partie.duree * 0.4) ids.push('eclair')
  if (b.rang === 'S') ids.push('legende')
  return ids
}

// Record et badges : gardés dans le navigateur du joueur, mission par mission.
const cle = (missionId) => `escape-quest:mission-${missionId}`

export function lireProgression(missionId) {
  try {
    const brut = JSON.parse(localStorage.getItem(cle(missionId)))
    if (brut && typeof brut === 'object') {
      return { record: brut.record ?? null, badges: Array.isArray(brut.badges) ? brut.badges : [], parties: brut.parties ?? 0 }
    }
  } catch {
    // stockage indisponible ou illisible : on repart de zéro
  }
  return { record: null, badges: [], parties: 0 }
}

// Enregistre une partie terminée et renvoie ce qui est nouveau.
export function enregistrerPartie(missionId, b, idsBadges) {
  const avant = lireProgression(missionId)
  const nouveauRecord = !avant.record || b.score > avant.record.score
  const nouveauxBadges = idsBadges.filter((id) => !avant.badges.includes(id))
  const apres = {
    record: nouveauRecord ? { score: b.score, rang: b.rang, temps: b.temps } : avant.record,
    badges: [...avant.badges, ...nouveauxBadges],
    parties: avant.parties + 1,
  }
  try {
    localStorage.setItem(cle(missionId), JSON.stringify(apres))
  } catch {
    // pas de stockage : le jeu reste jouable, seul le record n'est pas gardé
  }
  return { nouveauRecord, nouveauxBadges, ancienRecord: avant.record, progression: apres }
}
