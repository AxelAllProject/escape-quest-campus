import Rack from '../components/Rack'
import './Briefing.css'

// Récit d'ouverture de la mission (textes dans game/missions.js).
export default function Briefing({ mission, onStart }) {
  const { heure, titre, lead, role, journal, verrous } = mission.briefing
  return (
    <div className="briefing">
      <section className="briefing__brief" aria-labelledby="briefing-titre">
        <p className="incident">
          <span className="incident__voyant" aria-hidden="true" />
          Mission {mission.id} · incident ouvert à {heure}
        </p>
        <h1 id="briefing-titre">{titre}</h1>
        <p className="briefing__lead">{lead}</p>
        <p className="briefing__role">{role}</p>

        <h2>Trois verrous à lever</h2>
        <ol className="verrous">
          {verrous.map((verrou, i) => (
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

        <div className="briefing__action">
          <button type="button" className="bouton" onClick={onStart}>
            Commencer la mission
          </button>
          <p className="briefing__note">
            {mission.duree / 60} minutes, {mission.epreuves.length} épreuves, des indices si tu bloques.
          </p>
        </div>
      </section>

      <aside className="briefing__salle" aria-label="Salle serveur">
        <Rack
          modules={mission.modules}
          minuteur={`${String(mission.duree / 60).padStart(2, '0')}:00`}
          legende={mission.legendeMinuteur}
        />
        <ol className="journal" aria-label="Journal de supervision">
          {journal.map((ligne, i) => (
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
