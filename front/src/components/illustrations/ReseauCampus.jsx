// Illustration de l'accueil : le réseau du campus pendant l'attaque.
const ENT = { x: 285, y: 215 }

const NOEUDS = [
  { id: 'messagerie', nom: 'Messagerie', statut: 'compromise', etat: 'alerte', x: 110, y: 80 },
  { id: 'dns', nom: 'DNS', statut: 'arrêté', etat: 'coupe', x: 460, y: 80 },
  { id: 'parefeu', nom: 'Pare-feu', statut: 'actif', etat: 'ok', x: 110, y: 350 },
  { id: 'web', nom: 'Serveur web', statut: 'arrêté', etat: 'coupe', x: 460, y: 350 },
]

const L = 128
const H = 50

function Noeud({ noeud }) {
  return (
    <g className={`reseau__noeud is-${noeud.etat}`}>
      <rect x={noeud.x - L / 2} y={noeud.y - H / 2} width={L} height={H} rx="8" />
      <text x={noeud.x} y={noeud.y - 2} textAnchor="middle" className="reseau__nom">
        {noeud.nom}
      </text>
      <text x={noeud.x} y={noeud.y + 15} textAnchor="middle" className="reseau__statut">
        {noeud.statut}
      </text>
    </g>
  )
}

export default function ReseauCampus() {
  return (
    <svg className="reseau" viewBox="0 0 540 430" role="img" aria-labelledby="reseau-titre reseau-desc">
      <title id="reseau-titre">Le réseau du campus pendant l'attaque</title>
      <desc id="reseau-desc">
        Un intrus est entré par la messagerie. L'ENT est hors ligne, le DNS et le serveur web sont
        arrêtés, seul le pare-feu est encore actif.
      </desc>
      <defs>
        <marker id="fleche-intrus" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L8 5L1 9" fill="none" stroke="var(--alarme)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      <circle cx={ENT.x} cy={ENT.y} r="150" className="reseau__onde" />
      <circle cx={ENT.x} cy={ENT.y} r="100" className="reseau__onde" />

      {NOEUDS.map((n) => (
        <line key={n.id} x1={ENT.x} y1={ENT.y} x2={n.x} y2={n.y} className={`reseau__lien is-${n.etat}`} />
      ))}

      <path d="M66 190 C 66 140, 70 120, 84 108" className="reseau__attaque" markerEnd="url(#fleche-intrus)" />

      <g className="reseau__ent">
        <circle cx={ENT.x} cy={ENT.y} r="54" className="reseau__pulse" />
        <circle cx={ENT.x} cy={ENT.y} r="54" className="reseau__coeur" />
        <text x={ENT.x} y={ENT.y + 4} textAnchor="middle" className="reseau__ent-nom">
          ENT
        </text>
        <text x={ENT.x} y={ENT.y + 24} textAnchor="middle" className="reseau__ent-statut">
          hors ligne
        </text>
      </g>

      {NOEUDS.map((n) => (
        <Noeud key={n.id} noeud={n} />
      ))}

      <g className="reseau__intrus">
        <rect x="16" y="192" width="100" height="48" rx="8" />
        <text x="66" y="212" textAnchor="middle" className="reseau__nom">
          Intrus
        </text>
        <text x="66" y="229" textAnchor="middle" className="reseau__ip">
          185.220.101.4
        </text>
      </g>
    </svg>
  )
}
