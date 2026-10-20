import { useState } from 'react'
import { mesurerSignal } from '../../api'
import './Chasse.css'

// Épreuve « chasse » : le joueur se déplace dans la bibliothèque avec un analyseur Wi-Fi.
// Chaque mesure (limitée) donne la puissance de la borne pirate dans la salle ; il faut en déduire
// la salle de la borne, puis l'intercepter. Les mesures sont calculées par l'API.

// Couleur « chaleur » : rouge quand on brûle, bleu quand on est loin.
function chaleur(signal) {
  const t = Math.min(1, Math.max(0, (signal + 62) / 34))
  return `hsl(${Math.round(205 - 205 * t)} 90% 58% / ${0.18 + 0.4 * t})`
}

export default function Chasse({ epreuve, onValider, envoi, verrouille }) {
  const { zones, probes, legend, building, start } = epreuve
  const [ici, setIci] = useState(start)
  const [mesures, setMesures] = useState({}) // zone -> dBm
  const [fouillees, setFouillees] = useState([])
  const [utilisees, setUtilisees] = useState(0)
  const [mesureEnCours, setMesureEnCours] = useState(false)
  const [message, setMessage] = useState(null)
  const [onde, setOnde] = useState(0)

  const colonnes = Math.max(...zones.map((z) => z.col)) + 1
  const lignes = Math.max(...zones.map((z) => z.row)) + 1
  const salle = zones.find((z) => z.id === ici)
  const restantes = probes - utilisees
  const dejaMesuree = ici in mesures

  const aller = (id) => {
    if (verrouille) return
    setIci(id)
    setMessage(null)
  }

  const mesurer = async () => {
    if (restantes <= 0 || dejaMesuree) return
    setMesureEnCours(true)
    try {
      const { signal } = await mesurerSignal(epreuve.id, ici)
      setMesures((m) => ({ ...m, [ici]: signal }))
      setUtilisees((n) => n + 1)
      setOnde((n) => n + 1)
      setMessage(null)
    } catch {
      setMessage("L'analyseur ne répond pas : l'API est-elle lancée ?")
    } finally {
      setMesureEnCours(false)
    }
  }

  const intercepter = async () => {
    const resultat = await onValider(ici)
    // Une fouille ratée donne la mesure de la salle, sans consommer de batterie.
    if (resultat && !resultat.correct && resultat.zone) {
      setMesures((m) => ({ ...m, [resultat.zone]: resultat.signal }))
      setFouillees((f) => (f.includes(resultat.zone) ? f : [...f, resultat.zone]))
    }
  }

  return (
    <div className={`chasse${verrouille ? ' is-trouve' : ''}`}>
      <div className="chasse__tete">
        <p className="chasse__batiment">{building}</p>
        <div className="batterie" aria-label={`Batterie de l'analyseur : ${restantes} mesure(s) restante(s) sur ${probes}`}>
          <span className="batterie__titre">Batterie</span>
          <span className="batterie__cellules" aria-hidden="true">
            {Array.from({ length: probes }, (_, i) => (
              <span key={i} className={i < restantes ? 'is-pleine' : ''} />
            ))}
          </span>
        </div>
      </div>

      <div className="plan" style={{ '--colonnes': colonnes, '--lignes': lignes }}>
        {zones.map((z) => {
          const m = mesures[z.id]
          return (
            <button
              key={z.id}
              type="button"
              className={`salle${ici === z.id ? ' is-ici' : ''}${m !== undefined ? ' is-mesuree' : ''}${fouillees.includes(z.id) ? ' is-fouillee' : ''}`}
              style={{ gridColumn: z.col + 1, gridRow: z.row + 1, ...(m !== undefined && { '--chaleur': chaleur(m) }) }}
              onClick={() => aller(z.id)}
              disabled={verrouille}
              aria-pressed={ici === z.id}
            >
              <span className="salle__nom">{z.name}</span>
              {m !== undefined && <span className="salle__mesure">{m} dBm</span>}
              {fouillees.includes(z.id) && <span className="salle__vide">fouillée : vide</span>}
            </button>
          )
        })}
        <span
          className="pion"
          aria-hidden="true"
          style={{ '--col': salle.col, '--ligne': salle.row }}
        >
          <span key={onde} className={onde ? 'pion__onde is-active' : 'pion__onde'} />
          <svg viewBox="0 0 24 24" className="pion__icone">
            <circle cx="12" cy="7" r="3.5" />
            <path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
          </svg>
          {verrouille && <span className="pion__trophee">Borne saisie</span>}
        </span>
      </div>

      <p className="chasse__legende">{legend}</p>

      <div className="chasse__bas">
        <div className="chasse__position">
          <p className="chasse__ici">
            Tu es ici : <strong>{salle.name}</strong>
          </p>
          <div className="chasse__boutons">
            <button
              type="button"
              className="bouton-secondaire"
              onClick={mesurer}
              disabled={verrouille || mesureEnCours || restantes <= 0 || dejaMesuree}
            >
              {mesureEnCours
                ? 'Mesure…'
                : dejaMesuree
                  ? 'Déjà mesurée'
                  : restantes > 0
                    ? `Mesurer le signal ici (${restantes})`
                    : 'Batterie vide'}
            </button>
            <button type="button" className="bouton" onClick={intercepter} disabled={verrouille || envoi}>
              Intercepter la borne ici
            </button>
          </div>
          <p className="chasse__message" aria-live="polite">
            {message}
          </p>
        </div>

        <div className="carnet">
          <p className="carnet__titre">Carnet de mesures</p>
          {Object.keys(mesures).length === 0 ? (
            <p className="carnet__vide">Aucune mesure. Déplace-toi sur le plan, puis mesure.</p>
          ) : (
            <ol className="carnet__liste">
              {Object.entries(mesures).map(([id, s]) => (
                <li key={id}>
                  <span>{zones.find((z) => z.id === id).name}</span>
                  <span className="carnet__valeur" style={{ '--chaleur': chaleur(s) }}>
                    {s} dBm
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="carnet__regle">Une interception ratée coûte 25 pts.</p>
        </div>
      </div>
    </div>
  )
}
