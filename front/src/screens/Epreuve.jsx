import { useEffect, useState } from 'react'
import { chargerEpreuve, chargerIndice, envoyerReponse } from '../api'
import Rack from '../components/Rack'
import Phishing from '../components/epreuves/Phishing'
import Ports from '../components/epreuves/Ports'
import './Epreuve.css'

const COMPOSANTS = {
  phishing: Phishing,
  ports: Ports,
}

// Écran commun à toutes les épreuves : charge l'énoncé depuis l'API,
// affiche l'épreuve, envoie la réponse et montre le résultat.
export default function Epreuve({ id, numero, total, etats, indicesUtilises, onReussite, onSuivante, onIndice }) {
  const [epreuve, setEpreuve] = useState(null)
  const [chargement, setChargement] = useState('en-cours')
  const [retour, setRetour] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [indices, setIndices] = useState([])
  const reussie = retour?.correct === true

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
      if (resultat.correct) onReussite()
    } catch {
      setRetour({ correct: false, message: "L'API ne répond pas. Vérifie que Symfony tourne, puis réessaie." })
    } finally {
      setEnvoi(false)
    }
  }

  const demanderIndice = async () => {
    try {
      const { hint } = await chargerIndice(id, indices.length + 1)
      setIndices((liste) => [...liste, hint])
      onIndice()
    } catch {
      setRetour({ correct: false, message: "Impossible de récupérer l'indice : l'API ne répond pas." })
    }
  }

  const Composant = epreuve ? COMPOSANTS[epreuve.type] : null
  const indicesRestants = epreuve ? epreuve.hints - indices.length : 0

  return (
    <div className="epreuve">
      <section className="epreuve__principal" aria-labelledby="epreuve-titre">
        <p className="epreuve__etape">
          Épreuve {numero} sur {total}
        </p>

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
            <h1 id="epreuve-titre">{epreuve.title}</h1>
            <p className="epreuve__consigne">{epreuve.instructions}</p>
            <Composant epreuve={epreuve} onValider={valider} envoi={envoi} verrouille={reussie} />

            <div className="epreuve__retour" aria-live="polite">
              {retour && (
                <p className={retour.correct ? 'retour is-succes' : 'retour is-erreur'}>{retour.message}</p>
              )}
              {reussie && (
                <button type="button" className="bouton" onClick={onSuivante}>
                  {numero < total ? 'Épreuve suivante' : 'Terminer la mission'}
                </button>
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
                    ? `Demander un indice (${indicesRestants} restant${indicesRestants > 1 ? 's' : ''}, coûte des points)`
                    : 'Plus aucun indice disponible'}
                </button>
              </div>
            )}

          </>
        )}
      </section>

      <aside className="epreuve__salle" aria-label="État de la baie serveur">
        <Rack etats={etats} />
        <p className="epreuve__bilan">Indices utilisés : {indicesUtilises}</p>
      </aside>
    </div>
  )
}
