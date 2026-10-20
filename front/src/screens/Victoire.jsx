import { useEffect, useState } from 'react'
import Badge from '../components/Badge'
import { badgesMission, formaterDuree, RANGS } from '../game/partie'
import './Victoire.css'

// Fait défiler un nombre de 0 jusqu'à sa valeur finale (instantané si les animations sont réduites).
function useDefilement(cible, duree = 1400) {
  const [valeur, setValeur] = useState(0)
  useEffect(() => {
    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let image
    const depart = performance.now()
    const avancer = (t) => {
      const p = reduit ? 1 : Math.min(1, (t - depart) / duree)
      setValeur(Math.round(cible * (1 - (1 - p) ** 3)))
      if (p < 1) image = requestAnimationFrame(avancer)
    }
    image = requestAnimationFrame(avancer)
    return () => cancelAnimationFrame(image)
  }, [cible, duree])
  return valeur
}

const ecart = (partie, instant) => formaterDuree(Math.round((instant - partie.debut) / 1000))

export default function Victoire({ mission, partie, resultat, onRejouer, onAccueil }) {
  const { bilan, badges, nouveauxBadges, nouveauRecord, ancienRecord, progression } = resultat
  const { titre, lead, fin, attaque, riposte, reflexes } = mission.victoire
  const listeBadges = badgesMission(mission)
  const score = useDefilement(bilan.score)
  const horsDelai = bilan.temps >= partie.duree

  return (
    <div className="victoire">
      <section className="victoire__hero" aria-labelledby="victoire-titre">
        <div className="victoire__texte">
          <p className="victoire__statut">
            <span className="victoire__voyant" aria-hidden="true" />
            {horsDelai ? 'Incident clos, hors délai' : `Incident clos en ${formaterDuree(bilan.temps)}`}
          </p>
          <h1 id="victoire-titre">{titre}</h1>
          <p className="victoire__lead">{lead}</p>
          <div className="victoire__actions">
            <button type="button" className="bouton" onClick={onRejouer}>
              {nouveauRecord ? 'Rejouer et faire encore mieux' : 'Rejouer et battre ton record'}
            </button>
            <button type="button" className="bouton-secondaire" onClick={onAccueil}>
              Retour aux missions
            </button>
          </div>
        </div>

        <div className={`certificat rang-${bilan.rang}`}>
          <svg viewBox="0 0 160 176" className="certificat__embleme" role="img" aria-label={`Rang ${bilan.rang}`}>
            <path d="M80 6l70 40v84l-70 40-70-40V46z" className="certificat__hex" />
            <path d="M80 22l56 32v68l-56 32-56-32V54z" className="certificat__hex-int" />
            <text x="80" y="112" textAnchor="middle" className="certificat__lettre">
              {bilan.rang}
            </text>
          </svg>
          <p className="certificat__titre">{RANGS[bilan.rang]}</p>
          <p className="certificat__score" aria-label={`${bilan.score} points`}>
            {score}
            <span> pts</span>
          </p>
          {nouveauRecord ? (
            <p className="certificat__record is-nouveau">
              {ancienRecord ? `Nouveau record, +${bilan.score - ancienRecord.score} pts` : 'Premier record enregistré'}
            </p>
          ) : (
            <p className="certificat__record">
              Record : {progression.record.score} pts, rang {progression.record.rang}
            </p>
          )}
        </div>
      </section>

      <section className="decompte" aria-label="Détail du score">
        <ul className="decompte__lignes">
          {partie.epreuves.map((e, i) => (
            <li key={i}>
              <span>
                Épreuve {i + 1}
                {e.indices + e.erreurs === 0 && <em> du premier coup</em>}
              </span>
              <span>+{e.points}</span>
            </li>
          ))}
          <li>
            <span>Bonus de temps ({formaterDuree(bilan.bonusTemps)} restantes)</span>
            <span>+{bilan.bonusTemps}</span>
          </li>
          <li className="decompte__total">
            <span>Total</span>
            <span>{bilan.score}</span>
          </li>
        </ul>
        <dl className="stats">
          <div>
            <dt>Temps</dt>
            <dd>{formaterDuree(bilan.temps)}</dd>
          </div>
          <div>
            <dt>Indices</dt>
            <dd>{bilan.indices}</dd>
          </div>
          <div>
            <dt>Erreurs</dt>
            <dd>{bilan.erreurs}</dd>
          </div>
          <div>
            <dt>Meilleure série</dt>
            <dd>×{bilan.serieMax}</dd>
          </div>
        </dl>
      </section>

      <section className="badges" aria-labelledby="badges-titre">
        <div className="section-tete">
          <h2 id="badges-titre">Badges</h2>
          <p>
            {progression.badges.length} sur {listeBadges.length} débloqués
          </p>
        </div>
        <ul className="badges__grille">
          {listeBadges.map((badge) => {
            const etat = nouveauxBadges.includes(badge.id)
              ? 'nouveau'
              : progression.badges.includes(badge.id)
                ? 'obtenu'
                : 'verrouille'
            return (
              <li key={badge.id} className={`badge is-${etat}`}>
                <Badge id={badge.id} etat={etat} />
                <div>
                  <p className="badge__nom">
                    {badge.nom}
                    {etat === 'nouveau' && <span className="badge__nouveau">Nouveau</span>}
                    {etat === 'obtenu' && badges.includes(badge.id) && <span className="badge__encore">Encore</span>}
                  </p>
                  <p className="badge__texte">{badge.texte}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="chronologie" aria-labelledby="chrono-titre">
        <h2 id="chrono-titre">Ce qu'il s'est passé</h2>
        <div className="chronologie__colonnes">
          <div>
            <h3>L'attaque</h3>
            <ol className="frise is-attaque">
              {attaque.map((evt) => (
                <li key={evt.heure + evt.texte}>
                  <time>{evt.heure}</time>
                  <p>{evt.texte}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3>Ta riposte</h3>
            <ol className="frise is-riposte">
              <li>
                <time>T+00:00</time>
                <p>Tu prends l'incident en charge.</p>
              </li>
              {partie.epreuves.map((e, i) => (
                <li key={riposte[i]}>
                  <time>T+{ecart(partie, e.resolueA)}</time>
                  <p>
                    {riposte[i]}
                    {e.indices > 0 && ` (${e.indices} indice${e.indices > 1 ? 's' : ''})`}
                  </p>
                </li>
              ))}
              <li>
                <time>T+{formaterDuree(bilan.temps)}</time>
                <p>{fin}</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="reflexes" aria-labelledby="reflexes-titre">
        <h2 id="reflexes-titre">Les réflexes à retenir</h2>
        <ul className="reflexes__liste">
          {reflexes.map((r) => (
            <li key={r.titre}>
              <h3>{r.titre}</h3>
              <p>{r.texte}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
