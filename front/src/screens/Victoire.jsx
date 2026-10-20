import { useEffect, useState } from 'react'
import Badge from '../components/Badge'
import { BADGES, DUREE, formaterDuree, RANGS } from '../game/partie'
import './Victoire.css'

const ATTAQUE = [
  { heure: '07:48', texte: 'Un faux mail « Mise à jour de votre emploi du temps » arrive chez les agents.' },
  { heure: '07:53', texte: "Un agent ouvre Emploi_du_temps_S2.pdf.exe : l'attaquant a un pied dans le réseau." },
  { heure: '08:00', texte: '185.220.101.4 devine le mot de passe admin en SSH, après 3 échecs en rafale.' },
  { heure: '08:01', texte: "L'intrus crée un compte « maintenance » et la clé de récupération X9-4TQZ." },
  { heure: '08:02', texte: "Il coupe le web, le DNS et SSH, puis ouvre une porte dérobée sur le port 4444 : l'ENT tombe." },
]

const RIPOSTE = ['Mail piégé démasqué', 'Réseau rebranché, porte 4444 murée', "Dossier de l'intrus bouclé, accès révoqués"]

const REFLEXES = [
  {
    titre: 'Avant de cliquer',
    texte: "Vérifie le domaine de l'expéditeur, survole le lien, et méfie-toi des doubles extensions comme .pdf.exe.",
  },
  {
    titre: 'Ports et pare-feu',
    texte: '22 SSH, 25 SMTP, 53 DNS, 80 et 443 web, 3306 MySQL. N’ouvre sur Internet que ce que le public doit joindre, et un port inconnu se ferme.',
  },
  {
    titre: 'Lire les journaux',
    texte: 'Des échecs en rafale puis une réussite depuis la même IP, suivis d’un compte créé : force brute et accès caché. Recoupe toujours plusieurs journaux.',
  },
]

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

export default function Victoire({ partie, resultat, onRejouer, onAccueil }) {
  const { bilan, badges, nouveauxBadges, nouveauRecord, ancienRecord, progression } = resultat
  const score = useDefilement(bilan.score)
  const horsDelai = bilan.temps >= DUREE

  return (
    <div className="victoire">
      <section className="victoire__hero" aria-labelledby="victoire-titre">
        <div className="victoire__texte">
          <p className="victoire__statut">
            <span className="victoire__voyant" aria-hidden="true" />
            {horsDelai ? 'Incident clos, hors délai' : `Incident clos en ${formaterDuree(bilan.temps)}`}
          </p>
          <h1 id="victoire-titre">Le campus est de nouveau en ligne</h1>
          <p className="victoire__lead">
            Mail piégé démasqué, services relancés, accès de l'intrus révoqué. Les étudiants peuvent
            s'inscrire aux examens.
          </p>
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
            {progression.badges.length} sur {BADGES.length} débloqués
          </p>
        </div>
        <ul className="badges__grille">
          {BADGES.map((badge) => {
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
              {ATTAQUE.map((evt) => (
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
                <li key={RIPOSTE[i]}>
                  <time>T+{ecart(partie, e.resolueA)}</time>
                  <p>
                    {RIPOSTE[i]}
                    {e.indices > 0 && ` (${e.indices} indice${e.indices > 1 ? 's' : ''})`}
                  </p>
                </li>
              ))}
              <li>
                <time>T+{formaterDuree(bilan.temps)}</time>
                <p>L'ENT redémarre. Incident clos.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="reflexes" aria-labelledby="reflexes-titre">
        <h2 id="reflexes-titre">Les réflexes à retenir</h2>
        <ul className="reflexes__liste">
          {REFLEXES.map((r) => (
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
