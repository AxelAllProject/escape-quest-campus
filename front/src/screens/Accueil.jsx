import Rack from '../components/Rack'
import './Accueil.css'

// Textes du récit : brouillon à faire valider par le Product Owner.
const JOURNAL = [
  { heure: '08:02:14', niveau: 'ALERTE', message: 'ent.campus.local ne répond plus (HTTP 503)' },
  { heure: '08:02:31', niveau: 'WARN', message: 'connexion admin inhabituelle depuis 185.220.101.4' },
  { heure: '08:03:40', niveau: 'ALERTE', message: 'services arrêtés : web, dns, ssh' },
  { heure: '08:04:02', niveau: 'INFO', message: 'origine probable : pièce jointe ouverte sur la messagerie' },
]

const VERROUS = [
  { titre: 'Messagerie', texte: "Retrouve le mail piégé qui a ouvert la porte à l'attaquant." },
  { titre: 'Réseau', texte: 'Remets chaque service sur le bon port.' },
  { titre: 'Journaux', texte: 'Fouille les logs pour récupérer le code administrateur.' },
]

export default function Accueil({ onStart }) {
  return (
    <div className="accueil">
      <section className="accueil__brief" aria-labelledby="accueil-titre">
        <p className="incident">
          <span className="incident__voyant" aria-hidden="true" />
          Incident ouvert à 08:02
        </p>
        <h1 id="accueil-titre">Le campus est hors ligne</h1>
        <p className="accueil__lead">
          Depuis 8 h, l'ENT ne répond plus : emplois du temps, notes et messagerie sont
          inaccessibles. La supervision a détecté une intrusion.
        </p>
        <p className="accueil__role">
          Tu es d'astreinte à la DSI. Les inscriptions aux examens ouvrent dans 10 minutes :
          remets le service en ligne avant.
        </p>

        <h2>Trois verrous à lever</h2>
        <ol className="verrous">
          {VERROUS.map((verrou, i) => (
            <li key={verrou.titre} className="verrou">
              <span className="verrou__num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{verrou.titre}</h3>
                <p>{verrou.texte}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="accueil__action">
          <button type="button" className="bouton" onClick={onStart}>
            Commencer la mission
          </button>
          <p className="accueil__note">10 minutes, 3 épreuves, des indices si tu bloques.</p>
        </div>
      </section>

      <aside className="accueil__salle" aria-label="Salle serveur">
        <Rack />
        <ol className="journal" aria-label="Journal de supervision">
          {JOURNAL.map((ligne, i) => (
            <li key={ligne.heure} className="journal__ligne" style={{ animationDelay: `${0.3 + i * 0.45}s` }}>
              <span className="journal__heure">{ligne.heure}</span>
              <span className={`journal__niveau is-${ligne.niveau.toLowerCase()}`}>{ligne.niveau}</span>
              <span className="journal__message">{ligne.message}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
