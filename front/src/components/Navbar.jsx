import Logo from './Logo'
import './Navbar.css'

// Barre de navigation commune à tous les écrans.
export default function Navbar({ reseauRetabli, onAccueil, onMissions, onCommentJouer, onBoss }) {
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

        {/* Easter egg : combat contre le robot ROOT-KIT 9000 */}
        <button type="button" className="navbar__boss" onClick={onBoss} title="Un robot rôde dans le datacenter… Entre dans l'arène">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2v3" />
            <rect x="4" y="5" width="16" height="12" rx="3" />
            <rect x="8" y="9" width="2.5" height="2.5" className="navbar__boss-oeil" />
            <rect x="13.5" y="9" width="2.5" height="2.5" className="navbar__boss-oeil" />
            <path d="M9 14h6M8 17v4M16 17v4" />
          </svg>
          <span className="navbar__boss-texte">Boss</span>
          <span className="sr-only">Ouvrir l'arène : combat contre le robot ROOT-KIT 9000</span>
        </button>
      </div>
    </header>
  )
}
