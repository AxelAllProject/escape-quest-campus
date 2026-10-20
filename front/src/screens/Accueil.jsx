import { useState } from 'react'
import Datacenter3D from '../components/Datacenter3D'
import Globe3D from '../components/Globe3D'
import TerminalDirect from '../components/TerminalDirect'
import { IllustrationRancon, IllustrationWifi } from '../components/illustrations/Missions'
import { BADGES, formaterDuree, lireProgression } from '../game/partie'
import useApparition from '../hooks/useApparition'
import './Accueil.css'

// Les 3 épreuves, dans l'ordre : ce que le joueur doit faire, en clair.
const EPREUVES = [
  {
    module: 'Messagerie',
    titre: 'Le mail piégé',
    action: "Repère les 3 indices qui prouvent qu'un mail est du phishing.",
    competence: 'Phishing',
  },
  {
    module: 'Réseau',
    titre: 'Les services coupés',
    action: 'Remets chaque service (web, SSH, DNS…) sur le bon port.',
    competence: 'Ports réseau',
  },
  {
    module: 'Journaux',
    titre: "Les traces de l'intrus",
    action: "Fouille les logs du serveur pour trouver la clé secrète de l'intrus.",
    competence: 'Analyse de logs',
  },
]

const REGLES = [
  { valeur: '10:00', titre: 'Minuteur', texte: 'Il démarre quand tu commences la mission.' },
  { valeur: '+300', titre: 'Épreuve réussie', texte: '+50 en plus si tu réussis du premier coup.' },
  { valeur: '−50', titre: 'Indice', texte: 'Deux indices par épreuve si tu bloques.' },
  { valeur: '−25', titre: 'Erreur', texte: 'Chaque mauvaise réponse coûte des points.' },
  { valeur: '+1/s', titre: 'Bonus de temps', texte: 'Chaque seconde restante à la fin compte.' },
  { valeur: 'S A B C', titre: 'Rang', texte: `Ton rang final, et ${BADGES.length} badges à collectionner.` },
]

const PROCHAINES = [
  { id: 'wifi', titre: 'Wi-Fi fantôme', Illustration: IllustrationWifi },
  { id: 'rancon', titre: 'Rançon à la bibliothèque', Illustration: IllustrationRancon },
]

export default function Accueil({ onLancer }) {
  const [progression] = useState(lireProgression)
  const { record } = progression
  const racine = useApparition()

  return (
    <div className="accueil" ref={racine}>
      <section className="hero" aria-labelledby="hero-titre">
        <div className="hero__texte">
          <p className="hero__alerte">
            <span className="hero__voyant" aria-hidden="true" />
            Incident en cours sur le campus
          </p>
          <h1 id="hero-titre">
            Le campus est hors ligne.
            <span className="hero__sous-titre">Tu as 10 minutes pour le relancer.</span>
          </h1>
          <p className="hero__lead">
            Un intrus a coupé l'ENT. Résous 3 épreuves de cybersécurité pour déverrouiller les 3 baies
            serveur et remettre le campus en ligne.
          </p>
          <div className="hero__actions">
            <button type="button" className="bouton" onClick={onLancer}>
              {record ? 'Rejouer et battre ton record' : 'Commencer la mission'}
            </button>
            <a className="bouton-secondaire" href="#comment-jouer">
              Voir les règles
            </a>
          </div>
          <TerminalDirect />
        </div>
        <div className="hero__illustration">
          <Globe3D />
          <p className="hero__legende">Attaques en direct vers le campus, fais glisser pour tourner le globe</p>
        </div>
      </section>

      <section id="missions" className="mission" aria-labelledby="mission-titre">
        <div className="mission__tete" data-apparition>
          <h2 id="mission-titre">Ta mission</h2>
          <p>
            L'intrus est entré par la messagerie, a coupé les services du campus et s'est caché un accès
            administrateur. Chaque épreuve réussie déverrouille une baie.
          </p>
        </div>

        <div className="mission__salle" data-apparition>
          <Datacenter3D />
          <p className="mission__legende">1 baie verrouillée = 1 épreuve à réussir</p>
        </div>

        <ol className="parcours">
          {EPREUVES.map((epreuve, i) => (
            <li key={epreuve.titre} className="parcours__etape" data-apparition style={{ '--delai': `${i * 120}ms` }}>
              <span className="parcours__num" aria-hidden="true">
                {i + 1}
              </span>
              <p className="parcours__module">Baie {epreuve.module.toLowerCase()}</p>
              <h3>{epreuve.titre}</h3>
              <p className="parcours__action">{epreuve.action}</p>
              <p className="parcours__competence">{epreuve.competence}</p>
            </li>
          ))}
        </ol>

        <div className="objectif" data-apparition>
          <div className="objectif__texte">
            <h3>Pour gagner</h3>
            <p>
              Déverrouille les 3 baies. Si tu finis avant la fin des 10 minutes, chaque seconde restante
              rapporte des points.
            </p>
          </div>
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
            {record ? 'Rejouer la mission' : 'Commencer la mission'}
          </button>
        </div>
      </section>

      <section id="comment-jouer" className="regles" aria-labelledby="regles-titre">
        <h2 id="regles-titre">Les règles</h2>
        <dl className="regles__grille">
          {REGLES.map((regle, i) => (
            <div key={regle.titre} className="regle" data-apparition style={{ '--delai': `${i * 70}ms` }}>
              <dt>{regle.titre}</dt>
              <dd className="regle__valeur">{regle.valeur}</dd>
              <dd className="regle__texte">{regle.texte}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="prochaines" aria-labelledby="prochaines-titre">
        <h2 id="prochaines-titre">Prochaines missions</h2>
        <ul>
          {PROCHAINES.map(({ id, titre, Illustration }) => (
            <li key={id}>
              <div className="prochaines__illu">
                <Illustration />
              </div>
              <span>{titre}</span>
              <span className="prochaines__statut">Bientôt</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="pied">
        <p>Escape Quest Campus, projet Agile & Scrum du CFP Baudimont.</p>
      </footer>
    </div>
  )
}
