// Baie serveur du campus : un module par épreuve.
// `etats` : 'verrouille' (voyant rouge) ou 'retabli' (voyant vert) pour chaque module.
const MODULES = [
  { id: 'messagerie', nom: 'messagerie' },
  { id: 'reseau', nom: 'réseau' },
  { id: 'journaux', nom: 'journaux' },
]

function Cadenas({ x, y, ouvert }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <path
        d={ouvert ? 'M4 9V5.5a4 4 0 0 1 7.6-1.8' : 'M4 9V5.5a4 4 0 0 1 8 0V9'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="1.5" y="8.5" width="13" height="10" rx="2" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="var(--baie)" />
    </g>
  )
}

function Grille({ x, y }) {
  return (
    <g aria-hidden="true">
      {[0, 6, 12, 18].map((dx) => (
        <line key={dx} x1={x + dx} y1={y} x2={x + dx} y2={y + 22} className="rack__grille" />
      ))}
    </g>
  )
}

export default function Rack({ etats = ['verrouille', 'verrouille', 'verrouille'], minuteur = '10:00' }) {
  const restants = etats.filter((e) => e !== 'retabli').length

  return (
    <svg
      className="rack"
      viewBox="0 0 300 430"
      role="img"
      aria-labelledby="rack-titre rack-desc"
    >
      <title id="rack-titre">Baie serveur du campus</title>
      <desc id="rack-desc">
        {`${restants} module(s) sur 3 encore verrouillé(s). Temps restant : ${minuteur}.`}
      </desc>

      <rect x="16" y="8" width="268" height="414" rx="12" className="rack__chassis" />
      {[38, 262].map((x) => (
        <g key={x} aria-hidden="true">
          <rect x={x - 6} y="24" width="12" height="382" rx="3" className="rack__rail" />
          {Array.from({ length: 19 }, (_, i) => (
            <circle key={i} cx={x} cy={36 + i * 20} r="1.8" className="rack__trou" />
          ))}
        </g>
      ))}

      <g>
        <rect x="58" y="28" width="184" height="64" rx="6" className="rack__ecran" />
        <text x="150" y="70" textAnchor="middle" className="rack__minuteur">
          {minuteur}
        </text>
        <text x="150" y="85" textAnchor="middle" className="rack__legende">
          avant l'ouverture des inscriptions
        </text>
      </g>

      {MODULES.map((module, i) => {
        const y = 110 + i * 78
        const retabli = etats[i] === 'retabli'
        return (
          <g key={module.id} className={retabli ? 'rack__module is-retabli' : 'rack__module'}>
            <rect x="54" y={y} width="192" height="64" rx="5" className="rack__facade" />
            <circle
              cx="74"
              cy={y + 32}
              r="5.5"
              className="rack__voyant"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
            <g className="rack__cadenas">
              <Cadenas x={88} y={y + 21} ouvert={retabli} />
            </g>
            <text x="114" y={y + 30} className="rack__nom">
              {module.nom}
            </text>
            <text x="114" y={y + 46} className="rack__statut">
              {retabli ? 'rétabli' : 'verrouillé'}
            </text>
            <Grille x={220} y={y + 21} />
          </g>
        )
      })}

      {[350, 386].map((y) => (
        <g key={y} aria-hidden="true">
          <rect x="54" y={y} width="192" height="28" rx="4" className="rack__vide" />
          <Grille x={220} y={y + 3} />
        </g>
      ))}
    </svg>
  )
}
