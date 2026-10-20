import Logo from './Logo'
import './Navbar.css'

// Barre de navigation commune à tous les écrans.
export default function Navbar({ reseauRetabli, onAccueil, onMissions, onCommentJouer }) {
  return (
    <header className="navbar">
      <div className="navbar__interieur">
        <button type="button" className="navbar__marque" onClick={onAccueil}>
          <Logo />
          <span>Escape Quest Campus</span>
        </button>

        <nav aria-label="Navigation principale" className="navbar__liens">
          <button type="button" onClick={onMissions}>
            Missions
          </button>
          <button type="button" onClick={onCommentJouer}>
            Comment jouer
          </button>
        </nav>

        <p className={`navbar__etat ${reseauRetabli ? 'is-retabli' : ''}`} role="status">
          <span className="navbar__voyant" aria-hidden="true" />
          {reseauRetabli ? 'Réseau campus opérationnel' : 'Réseau campus dégradé'}
        </p>
      </div>
    </header>
  )
}
