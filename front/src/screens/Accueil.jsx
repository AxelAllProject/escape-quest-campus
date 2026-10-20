import { useState } from 'react'
import ReseauCampus from '../components/illustrations/ReseauCampus'
import { BADGES, formaterDuree, lireProgression } from '../game/partie'
import { IllustrationPanne, IllustrationRancon, IllustrationWifi } from '../components/illustrations/Missions'
import './Accueil.css'

const A_VENIR = [
  {
    id: 'wifi',
    titre: 'Wi-Fi fantôme',
    texte: "Un faux point d'accès imite le Wi-Fi du campus et intercepte les connexions.",
    Illustration: IllustrationWifi,
  },
  {
    id: 'rancon',
    titre: 'Rançon à la bibliothèque',
    texte: 'Les postes de la BU sont chiffrés. Retrouve la clé avant la fin des examens.',
    Illustration: IllustrationRancon,
  },
]

const ETAPES = [
  { titre: 'Lis le briefing', texte: "Chaque mission commence par un incident réel : ce qui est tombé et depuis quand." },
  { titre: 'Résous les épreuves', texte: 'Trois énigmes techniques, une à la fois. Un indice est disponible si tu bloques.' },
  { titre: 'Rétablis le service', texte: 'Chaque épreuve réussie remet un module en ligne. Termine avant la fin du minuteur.' },
]

export default function Accueil({ onLancer }) {
  const [progression] = useState(lireProgression)
  const { record } = progression

  return (
    <div className="accueil">
      <section className="hero" aria-labelledby="hero-titre">
        <div className="hero__texte">
          <h1 id="hero-titre">Reprends le contrôle du campus</h1>
          <p className="hero__lead">
            Un escape game web où chaque énigme est un vrai réflexe d'informaticien : repérer un
            phishing, remettre des services en ligne, lire des logs.
          </p>
          <div className="hero__actions">
            <button type="button" className="bouton" onClick={onLancer}>
              Lancer la mission 1
            </button>
            <a className="bouton-secondaire" href="#missions">
              Voir les missions
            </a>
          </div>
          <ul className="hero__faits">
            <li>10 minutes par mission</li>
            <li>3 épreuves</li>
            <li>Indices disponibles</li>
          </ul>
        </div>
        <div className="hero__illustration">
          <ReseauCampus />
        </div>
      </section>

      <section id="missions" className="missions" aria-labelledby="missions-titre">
        <h2 id="missions-titre">Missions</h2>

        <article className="mission-phare">
          <div className="mission-phare__illu">
            <IllustrationPanne />
          </div>
          <div className="mission-phare__contenu">
            <p className="mission__statut is-ouverte">Mission 1, disponible</p>
            <h3>Le campus est hors ligne</h3>
            <p>
              L'ENT ne répond plus depuis 8 h. Trouve par où l'attaquant est entré, remets les
              services en route et récupère le code administrateur.
            </p>
            <ul className="tags" aria-label="Compétences">
              <li>Phishing</li>
              <li>Ports réseau</li>
              <li>Analyse de logs</li>
            </ul>
            {record && (
              <dl className="record">
                <div>
                  <dt>Ton record</dt>
                  <dd>{record.score} pts</dd>
                </div>
                <div>
                  <dt>Meilleur rang</dt>
                  <dd className={`record__rang rang-${record.rang}`}>{record.rang}</dd>
                </div>
                <div>
                  <dt>Temps</dt>
                  <dd>{formaterDuree(record.temps)}</dd>
                </div>
                <div>
                  <dt>Badges</dt>
                  <dd>
                    {progression.badges.length}/{BADGES.length}
                  </dd>
                </div>
              </dl>
            )}
            <button type="button" className="bouton" onClick={onLancer}>
              {record ? 'Rejouer et battre ton record' : 'Lancer la mission'}
            </button>
          </div>
        </article>

        <div className="missions__a-venir">
          {A_VENIR.map(({ id, titre, texte, Illustration }) => (
            <article key={id} className="mission-verrouillee" aria-label={`${titre} (bientôt disponible)`}>
              <div className="mission-verrouillee__illu">
                <Illustration />
              </div>
              <p className="mission__statut">Bientôt</p>
              <h3>{titre}</h3>
              <p>{texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="comment-jouer" className="comment-jouer" aria-labelledby="comment-jouer-titre">
        <h2 id="comment-jouer-titre">Comment jouer</h2>
        <ol className="etapes">
          {ETAPES.map((etape, i) => (
            <li key={etape.titre} className="etape">
              <span className="etape__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{etape.titre}</h3>
              <p>{etape.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="pied">
        <p>Escape Quest Campus, projet Agile & Scrum du CFP Baudimont.</p>
      </footer>
    </div>
  )
}
