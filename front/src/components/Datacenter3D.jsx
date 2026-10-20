import { useRef } from 'react'
import './Datacenter3D.css'

// Salle serveur en 3D (CSS) : une baie par épreuve, verrouillée tant que l'épreuve n'est pas réussie.
const BAIES = [
  { id: 'messagerie', nom: 'messagerie', numero: 1 },
  { id: 'reseau', nom: 'réseau', numero: 2 },
  { id: 'journaux', nom: 'journaux', numero: 3 },
]

function Baie({ baie, index }) {
  return (
    <div className="baie3d" style={{ '--i': index }}>
      <div className="baie3d__face baie3d__dessus">
        <span className="baie3d__num">{baie.numero}</span>
        <span className="baie3d__nom">{baie.nom}</span>
      </div>
      <div className="baie3d__face baie3d__avant">
        <div className="baie3d__ecran">
          <span className="baie3d__voyant" style={{ animationDelay: `${index * 0.3}s` }} />
          <span>verrouillé</span>
        </div>
        {[0, 1, 2, 3].map((u) => (
          <div key={u} className="baie3d__unite">
            <span className="baie3d__led" style={{ animationDelay: `${(index + u) * 0.17}s` }} />
            <span className="baie3d__fente" />
          </div>
        ))}
        <svg className="baie3d__cadenas" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 11V8a5 5 0 0 1 10 0v3" />
          <rect x="5" y="11" width="14" height="10" rx="2" />
        </svg>
      </div>
      <div className="baie3d__face baie3d__cote" />
      <div className="baie3d__face baie3d__cote baie3d__gauche" />
      <div className="baie3d__face baie3d__arriere" />
    </div>
  )
}

export default function Datacenter3D() {
  const scene = useRef(null)

  // La scène s'incline légèrement vers le pointeur.
  const incliner = (e) => {
    if (!scene.current || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const zone = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - zone.left) / zone.width - 0.5
    const y = (e.clientY - zone.top) / zone.height - 0.5
    scene.current.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`)
    scene.current.style.setProperty('--tilt-z', `${(x * 10).toFixed(2)}deg`)
  }

  const recentrer = () => {
    scene.current?.style.setProperty('--tilt-x', '0deg')
    scene.current?.style.setProperty('--tilt-z', '0deg')
  }

  return (
    <div
      className="dc3d"
      role="img"
      aria-label="Salle serveur du campus en 3D : trois baies verrouillées, messagerie, réseau et journaux, une par épreuve"
      onPointerMove={incliner}
      onPointerLeave={recentrer}
    >
      <div className="dc3d__scene" ref={scene}>
        <div className="dc3d__sol" />
        <div className="dc3d__halo" />
        {BAIES.map((baie, i) => (
          <Baie key={baie.id} baie={baie} index={i} />
        ))}
      </div>
    </div>
  )
}
