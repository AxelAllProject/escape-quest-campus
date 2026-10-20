import { useEffect, useRef, useState } from 'react'
import { chargerEpreuve, chargerIndice, envoyerReponse } from '../api'
import Rack from '../components/Rack'
import Logs from '../components/epreuves/Logs'
import Phishing from '../components/epreuves/Phishing'
import Ports from '../components/epreuves/Ports'
import { formaterDuree, scoreEpreuves, secondesRestantes, serie } from '../game/partie'
import './Epreuve.css'

const COMPOSANTS = {
  phishing: Phishing,
  ports: Ports,
  logs: Logs,
}

const MODULES = { messagerie: 'messagerie', reseau: 'réseau', journaux: 'journaux' }

// Écran commun à toutes les épreuves : charge l'énoncé depuis l'API, affiche l'épreuve,
// envoie la réponse, montre le résultat et le tableau de bord de la partie.
export default function Epreuve({
  id,
  numero,
  total,
  etats,
  partie,
  maintenant,
  onReussite,
  onErreur,
  onIndice,
  onSuivante,
}) {
  const [epreuve, setEpreuve] = useState(null)
  const [chargement, setChargement] = useState('en-cours')
  const [retour, setRetour] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [indices, setIndices] = useState([])
  const jeu = useRef(null)
  const reussie = retour?.correct === true
  const etat = partie.epreuves[numero - 1]

  useEffect(() => {
    let actif = true
    chargerEpreuve(id)
      .then((data) => actif && (setEpreuve(data), setChargement('ok')))
      .catch((e) => actif && setChargement(e.status === 404 ? 'a-venir' : 'erreur'))
    return () => {
      actif = false
    }
  }, [id])

  const valider = async (answer) => {
    setEnvoi(true)
    try {
      const resultat = await envoyerReponse(id, answer)
      setRetour(resultat)
      if (resultat.correct) {
        onReussite()
      } else {
        onErreur()
        secouer()
      }
    } catch {
      setRetour({ correct: false, reseau: true, message: "L'API ne répond pas. Vérifie que Symfony tourne, puis réessaie." })
    } finally {
      setEnvoi(false)
    }
  }

  // Mauvaise réponse : le panneau tremble, sans perdre ce que le joueur a saisi.
  const secouer = () => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    jeu.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 400, easing: 'ease-in-out' },
    )
  }

  const demanderIndice = async () => {
    try {
      const { hint } = await chargerIndice(id, indices.length + 1)
      setIndices((liste) => [...liste, hint])
      onIndice()
    } catch {
      setRetour({ correct: false, reseau: true, message: "Impossible de récupérer l'indice : l'API ne répond pas." })
    }
  }

  const Composant = epreuve ? COMPOSANTS[epreuve.type] : null
  const indicesRestants = epreuve ? epreuve.hints - indices.length : 0
  const restantes = secondesRestantes(partie, maintenant)
  const serieEnCours = serie(partie)
  const module = epreuve ? MODULES[epreuve.module] ?? epreuve.module : ''

  return (
    <div className="epreuve">
      <section className="epreuve__principal" aria-labelledby="epreuve-titre">
        <ol className="progression" aria-label={`Épreuve ${numero} sur ${total}`}>
          {etats.map((e, i) => (
            <li
              key={i}
              className={`progression__pas${e === 'retabli' ? ' is-fait' : ''}${i === numero - 1 ? ' is-actuel' : ''}`}
            >
              {i + 1}
            </li>
          ))}
        </ol>

        {chargement === 'en-cours' && <p className="epreuve__info">Chargement de l'épreuve…</p>}
        {chargement === 'erreur' && (
          <p className="epreuve__info is-erreur">
            Impossible de charger l'épreuve : l'API ne répond pas. Lance Symfony sur le port 8000 puis
            recharge la page.
          </p>
        )}
        {chargement === 'a-venir' && (
          <>
            <h1 id="epreuve-titre">Épreuve en préparation</h1>
            <p className="epreuve__info">Cette épreuve arrive dans un prochain incrément.</p>
          </>
        )}

        {chargement === 'ok' && Composant && (
          <>
            <p className="epreuve__module">Module {module}</p>
            <h1 id="epreuve-titre">{epreuve.title}</h1>
            <p className="epreuve__consigne">{epreuve.instructions}</p>

            <div ref={jeu} className="epreuve__jeu">
              <Composant epreuve={epreuve} onValider={valider} envoi={envoi} verrouille={reussie} />
            </div>

            <div className="epreuve__retour" aria-live="polite">
              {retour && !reussie && (
                <p className="retour is-erreur">
                  <span>{retour.message}</span>
                  {!retour.reseau && <span className="retour__penalite">−25 pts</span>}
                </p>
              )}
              {reussie && (
                <div className="reussite">
                  <svg className="reussite__icone" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
                    <circle cx="24" cy="24" r="21" className="reussite__cercle" />
                    <path d="M14 25l7 7 13-15" className="reussite__coche" />
                  </svg>
                  <div className="reussite__texte">
                    <p className="reussite__titre">
                      Module {module} rétabli
                      <span className="reussite__points">+{etat.points} pts</span>
                      {serieEnCours >= 2 && <span className="reussite__serie">Série ×{serieEnCours}</span>}
                    </p>
                    <p className="reussite__message">{retour.message}</p>
                  </div>
                  <button type="button" className="bouton reussite__suite" onClick={onSuivante}>
                    {numero < total ? 'Épreuve suivante' : "Clore l'incident"}
                  </button>
                </div>
              )}
            </div>

            {!reussie && epreuve.hints > 0 && (
              <div className="indices">
                {indices.length > 0 && (
                  <ol className="indices__liste" aria-label="Indices obtenus">
                    {indices.map((indice) => (
                      <li key={indice}>{indice}</li>
                    ))}
                  </ol>
                )}
                <button
                  type="button"
                  className="bouton-secondaire"
                  disabled={indicesRestants === 0}
                  onClick={demanderIndice}
                >
                  {indicesRestants > 0
                    ? `Demander un indice (−50 pts, ${indicesRestants} restant${indicesRestants > 1 ? 's' : ''})`
                    : 'Plus aucun indice disponible'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <aside className="epreuve__salle" aria-label="Tableau de bord de la mission">
        <Rack
          etats={etats}
          minuteur={formaterDuree(restantes)}
          legende={restantes > 0 ? "avant l'ouverture des inscriptions" : 'temps écoulé : plus de bonus'}
        />
        <dl className="hud">
          <div className="hud__score">
            <dt>Score</dt>
            <dd>{scoreEpreuves(partie)}</dd>
          </div>
          <div>
            <dt>Série</dt>
            <dd>{serieEnCours > 0 ? `×${serieEnCours}` : '0'}</dd>
          </div>
          <div>
            <dt>Indices</dt>
            <dd>{partie.epreuves.reduce((n, e) => n + e.indices, 0)}</dd>
          </div>
          <div>
            <dt>Erreurs</dt>
            <dd>{partie.epreuves.reduce((n, e) => n + e.erreurs, 0)}</dd>
          </div>
        </dl>
        <p className="hud__regle">Chaque seconde restante à la fin rapporte 1 point.</p>
      </aside>
    </div>
  )
}
