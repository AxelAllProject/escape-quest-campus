import { useState } from 'react'
import Datacenter3D from '../components/Datacenter3D'
import Globe3D from '../components/Globe3D'
import TerminalDirect from '../components/TerminalDirect'
import { IllustrationRancon, IllustrationServeurs, IllustrationWifi } from '../components/illustrations/Missions'
import { MISSIONS } from '../game/missions'
import { badgesMission, formaterDuree, lireProgression } from '../game/partie'
import useApparition from '../hooks/useApparition'
import './Accueil.css'

const REGLES = [
  { valeur: '10–12 min', titre: 'Minuteur', texte: 'Il démarre quand tu commences la mission.' },
  { valeur: '+300', titre: 'Épreuve réussie', texte: '+50 en plus si tu réussis du premier coup.' },
  { valeur: '−50', titre: 'Indice', texte: 'Deux indices par épreuve si tu bloques.' },
  { valeur: '−25', titre: 'Erreur', texte: 'Chaque mauvaise réponse coûte des points.' },
  { valeur: '+1/s', titre: 'Bonus de temps', texte: 'Chaque seconde restante à la fin compte.' },
  { valeur: 'S A B C', titre: 'Rang', texte: `Ton rang final, et ${badgesMission(MISSIONS[0]).length} badges à collectionner par mission.` },
]

const PROCHAINES = [{ id: 'rancon', titre: 'Rançon à la bibliothèque', Illustration: IllustrationRancon }]

const ILLUSTRATIONS = { 1: IllustrationServeurs, 2: IllustrationWifi }

export default function Accueil({ onLancer }) {
  const [progressions] = useState(() => Object.fromEntries(MISSIONS.map((m) => [m.id, lireProgression(m.id)])))
  const [choisie, setChoisie] = useState(1)
  const mission = MISSIONS.find((m) => m.id === choisie)
  const progression = progressions[choisie]
  const { record } = progression
  const racine = useApparition()

  return (
    <div className="accueil" ref={racine}>
      <section className="hero" aria-labelledby="hero-titre">
        <div className="hero__texte">
          <p className="hero__alerte">
            <span className="hero__voyant" aria-hidden="true" />
            {MISSIONS.length} incidents en cours sur le campus
          </p>
          <h1 id="hero-titre">
            Le campus est attaqué.
            <span className="hero__sous-titre">Choisis ta mission et riposte avant la fin du chrono.</span>
          </h1>
          <p className="hero__lead">
            Un intrus a coupé l'ENT, un faux Wi-Fi vole les mots de passe des étudiants. Chaque mission :
            3 épreuves de cybersécurité et {MISSIONS.map((m) => m.duree / 60).join(' à ')} minutes pour
            déverrouiller les 3 baies.
          </p>
          <ul className="hero__missions" aria-label="Lancer une mission">
            {MISSIONS.map((m) => {
              const rec = progressions[m.id].record
              return (
                <li key={m.id}>
                  <button type="button" className="lanceur" onClick={() => onLancer(m.id)}>
                    <span className="lanceur__num" aria-hidden="true">
                      {m.id}
                    </span>
                    <span className="lanceur__texte">
                      <span className="lanceur__nom">
                        {m.nom}
                        {m.id === MISSIONS[MISSIONS.length - 1].id && !rec && (
                          <span className="hero__nouveau-tag">Nouveau</span>
                        )}
                      </span>
                      <span className="lanceur__meta">
                        {m.niveau} · {m.duree / 60} min · {rec ? `record ${rec.score} pts, rang ${rec.rang}` : 'pas encore jouée'}
                      </span>
                    </span>
                    <span className="lanceur__fleche" aria-hidden="true">
                      {rec ? 'Rejouer' : 'Jouer'} →
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="hero__liens">
            <a href="#missions">Détail des missions</a>
            <a href="#comment-jouer">Voir les règles</a>
          </p>
          <TerminalDirect />
        </div>
        <div className="hero__illustration">
          <Globe3D />
          <p className="hero__legende">Attaques en direct vers le campus, fais glisser pour tourner le globe</p>
        </div>
      </section>

      <section id="missions" className="mission" aria-labelledby="mission-titre">
        <div className="mission__tete" data-apparition>
          <h2 id="mission-titre">Choisis ta mission</h2>
          <p>Chaque mission, 3 épreuves. Chaque épreuve réussie déverrouille une baie de la salle serveur.</p>
        </div>

        <div className="missions__choix" role="tablist" aria-label="Missions disponibles" data-apparition>
          {MISSIONS.map((m) => {
            const Illustration = ILLUSTRATIONS[m.id]
            const rec = progressions[m.id].record
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                id={`onglet-mission-${m.id}`}
                aria-selected={choisie === m.id}
                aria-controls="mission-detail"
                className={`carte-mission${choisie === m.id ? ' is-choisie' : ''}`}
                onClick={() => setChoisie(m.id)}
              >
                <span className="carte-mission__illu" aria-hidden="true">
                  <Illustration />
                </span>
                <span className="carte-mission__num">Mission {m.id}</span>
                <span className="carte-mission__nom">{m.nom}</span>
                <span className="carte-mission__accroche">{m.accroche}</span>
                <span className="carte-mission__meta">
                  <span>{m.niveau}</span>
                  <span>{m.duree / 60} min</span>
                  <span>{rec ? `Record ${rec.score} pts · rang ${rec.rang}` : 'Pas encore jouée'}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div id="mission-detail" role="tabpanel" aria-labelledby={`onglet-mission-${choisie}`} key={choisie} className="mission__detail">
          <div className="mission__salle">
            <Datacenter3D baies={mission.modules} />
            <p className="mission__legende">1 baie verrouillée = 1 épreuve à réussir</p>
          </div>

          <ol className="parcours">
            {mission.parcours.map((epreuve, i) => (
              <li key={epreuve.titre} className="parcours__etape" style={{ '--delai': `${i * 120}ms` }}>
                <span className="parcours__num" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="parcours__module">Baie {mission.modules[i].nom}</p>
                <h3>{epreuve.titre}</h3>
                <p className="parcours__action">{epreuve.action}</p>
                <p className="parcours__competence">{epreuve.competence}</p>
              </li>
            ))}
          </ol>

          <div className="objectif">
            <div className="objectif__texte">
              <h3>Pour gagner</h3>
              <p>
                Déverrouille les 3 baies. Si tu finis avant la fin des {mission.duree / 60} minutes, chaque
                seconde restante rapporte des points.
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
                    {progression.badges.length}/{badgesMission(mission).length}
                  </dd>
                </div>
              </dl>
            )}
            <button type="button" className="bouton" onClick={() => onLancer(mission.id)}>
              {record ? `Rejouer la mission ${mission.id}` : `Lancer la mission ${mission.id}`}
            </button>
          </div>
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
