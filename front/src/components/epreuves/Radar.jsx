import { useState } from 'react'
import './commun.css'
import './Radar.css'

// Épreuve « radar » : un scanner Wi-Fi balaie les alentours. Le joueur inspecte chaque réseau,
// le compare à la fiche des bornes officielles et signale les bornes pirates.

const TAILLE = 320
const CENTRE = TAILLE / 2
const PERIODE = 4 // secondes pour un tour de balayage

// Plus le signal est fort, plus le point est proche du centre.
const rayon = (signal) => Math.min(142, Math.max(26, 26 + (-30 - signal) * 2.3))

function position(reseau) {
  const a = (reseau.angle * Math.PI) / 180
  const r = rayon(reseau.signal)
  return { x: CENTRE + r * Math.sin(a), y: CENTRE - r * Math.cos(a) }
}

function Barres({ signal }) {
  const niveau = signal >= -45 ? 4 : signal >= -60 ? 3 : signal >= -70 ? 2 : 1
  return (
    <span className="barres" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= niveau ? 'is-plein' : ''} style={{ height: `${n * 25}%` }} />
      ))}
    </span>
  )
}

export default function Radar({ epreuve, onValider, envoi, verrouille }) {
  const { networks, reference } = epreuve
  const [choisi, setChoisi] = useState(networks[0].id)
  const [signales, setSignales] = useState([])
  const [vus, setVus] = useState(() => new Set([networks[0].id]))
  const reseau = networks.find((n) => n.id === choisi)
  const estSignale = signales.includes(choisi)

  const inspecter = (id) => {
    setChoisi(id)
    setVus((v) => new Set(v).add(id))
  }

  const basculer = () => {
    if (verrouille) return
    setSignales((s) => (s.includes(choisi) ? s.filter((id) => id !== choisi) : [...s, choisi]))
  }

  return (
    <div className={`radar${verrouille ? ' is-nettoye' : ''}`}>
      <div className="radar__haut">
        <div className="radar__ecran">
          <svg viewBox={`0 0 ${TAILLE} ${TAILLE}`} className="radar__svg" aria-hidden="true">
            <defs>
              <linearGradient id="radar-balayage" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--action)" stopOpacity="0" />
                <stop offset="1" stopColor="var(--action)" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            {[46, 92, 138].map((r) => (
              <circle key={r} cx={CENTRE} cy={CENTRE} r={r} className="radar__cercle" />
            ))}
            <line x1={CENTRE} y1="12" x2={CENTRE} y2={TAILLE - 12} className="radar__axe" />
            <line x1="12" y1={CENTRE} x2={TAILLE - 12} y2={CENTRE} className="radar__axe" />
            <text x={CENTRE + 4} y={CENTRE - 48} className="radar__graduation">−50 dBm</text>
            <text x={CENTRE + 4} y={CENTRE - 94} className="radar__graduation">−70 dBm</text>
            {!verrouille && (
              <g className="radar__balayage" style={{ animationDuration: `${PERIODE}s` }}>
                <path
                  d={`M${CENTRE} ${CENTRE} L${CENTRE} ${CENTRE - 142} A142 142 0 0 1 ${CENTRE + 142 * Math.sin(0.7)} ${CENTRE - 142 * Math.cos(0.7)} Z`}
                  fill="url(#radar-balayage)"
                  transform={`rotate(-40 ${CENTRE} ${CENTRE})`}
                />
                <line x1={CENTRE} y1={CENTRE} x2={CENTRE} y2={CENTRE - 142} className="radar__faisceau" />
              </g>
            )}
            <circle cx={CENTRE} cy={CENTRE} r="5" className="radar__toi" />
            {networks.map((n) => {
              const { x, y } = position(n)
              const pirate = signales.includes(n.id)
              return (
                <g
                  key={n.id}
                  className={`spot${pirate ? ' is-pirate' : ''}${choisi === n.id ? ' is-choisi' : ''}`}
                  onClick={() => inspecter(n.id)}
                >
                  <circle cx={x} cy={y} r="16" className="spot__zone" />
                  <circle cx={x} cy={y} r="10" className="spot__anneau" />
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className="spot__point"
                    style={{ animationDelay: `${(n.angle / 360) * PERIODE}s`, animationDuration: `${PERIODE}s` }}
                  />
                  {pirate && <path d={`M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8`} className="spot__croix" />}
                  <text x={x} y={y + 24} textAnchor="middle" className="spot__nom">
                    {n.ssid}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="radar__statut">
            {verrouille ? 'Bornes pirates neutralisées' : `${networks.length} réseaux captés · ${vus.size}/${networks.length} inspectés`}
          </p>
        </div>

        <div className="radar__inspecteur" aria-live="polite">
          <p className="radar__inspecteur-titre">Inspection</p>
          <h3 className="radar__ssid">
            {reseau.ssid}
            {estSignale && <span className="radar__marque">Pirate</span>}
          </h3>
          <dl className="radar__fiche">
            <div>
              <dt>BSSID (MAC)</dt>
              <dd className="is-code">{reseau.bssid}</dd>
            </div>
            <div>
              <dt>Constructeur</dt>
              <dd>{reseau.vendor}</dd>
            </div>
            <div>
              <dt>Canal</dt>
              <dd className="is-code">{reseau.channel}</dd>
            </div>
            <div>
              <dt>Sécurité</dt>
              <dd>{reseau.security}</dd>
            </div>
            <div>
              <dt>Signal</dt>
              <dd className="is-code">
                <Barres signal={reseau.signal} /> {reseau.signal} dBm
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className={`radar__signaler${estSignale ? ' is-actif' : ''}`}
            aria-pressed={estSignale}
            disabled={verrouille}
            onClick={basculer}
          >
            {estSignale ? 'Retirer le signalement' : 'Signaler comme borne pirate'}
          </button>
        </div>
      </div>

      <figure className="indice-donne radar__reference">
        <figcaption>
          <span>{reference.title}</span>
          <span>à comparer avec chaque réseau</span>
        </figcaption>
        <ul>
          {reference.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </figure>

      <ul className="radar__liste" aria-label="Réseaux captés">
        {networks.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={`ligne-reseau${choisi === n.id ? ' is-choisi' : ''}${signales.includes(n.id) ? ' is-pirate' : ''}`}
              aria-pressed={choisi === n.id}
              onClick={() => inspecter(n.id)}
            >
              <span className="ligne-reseau__ssid">{n.ssid}</span>
              <span className="ligne-reseau__bssid">{n.bssid}</span>
              <span className="ligne-reseau__signal">
                <Barres signal={n.signal} />
              </span>
              {!vus.has(n.id) && <span className="ligne-reseau__nouveau">non inspecté</span>}
              {signales.includes(n.id) && <span className="ligne-reseau__marque">pirate</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="radar__actions">
        <p>
          <strong>{signales.length}</strong> borne{signales.length > 1 ? 's' : ''} signalée{signales.length > 1 ? 's' : ''}.
          Une erreur coûte 25 pts.
        </p>
        <button
          type="button"
          className="bouton"
          disabled={verrouille || envoi || signales.length === 0}
          onClick={() => onValider(signales)}
        >
          Neutraliser {signales.length > 0 ? signales.length : ''} borne{signales.length > 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}
