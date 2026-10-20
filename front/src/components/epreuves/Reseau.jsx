import { useEffect, useRef, useState } from 'react'
import './commun.css'
import './Reseau.css'

// Épreuve 2 en trois temps, comme une vraie intervention réseau :
// 1. Brassage : on prend un câble (un port) et on le branche sur un service.
// 2. Pare-feu : pour chaque flux venant d'Internet, on décide s'il passe ou s'il est bloqué.
// 3. Diagnostic : le serveur vérifie tout et renvoie l'état de chaque service.

const ETAPES = ['Brassage', 'Pare-feu', 'Diagnostic']
const DUREE_SCAN = 1400

const reduit = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Reseau({ epreuve, onValider, envoi, verrouille, retour }) {
  const { services, ports, intrus, clue } = epreuve
  const [etape, setEtape] = useState(0)
  const [enMain, setEnMain] = useState(null)
  const [branchements, setBranchements] = useState({})
  const [regles, setRegles] = useState({})
  const [envoye, setEnvoye] = useState(null)
  const [scan, setScan] = useState(false)
  const minuterie = useRef(null)

  const flux = [...services, { ...intrus, protocol: `:${intrus.port}` }]
  const brassageComplet = services.every((s) => branchements[s.id])
  const pareFeuComplet = flux.every((f) => regles[f.id])
  const accessible = [true, brassageComplet, brassageComplet && pareFeuComplet]
  const utilises = Object.values(branchements)

  useEffect(() => () => clearTimeout(minuterie.current), [])

  // Le diagnostic ne vaut que pour la configuration envoyée : si le joueur rebranche un câble, on efface son état.
  const etatService = (id) => {
    if (!retour?.fields || !envoye || envoye.ports[id] !== branchements[id]) return null
    return retour.fields[id] ? 'ok' : 'ko'
  }

  const prendre = (port) => {
    if (verrouille) return
    setEnMain((p) => (p === port ? null : port))
  }

  const brancher = (service) => {
    if (verrouille) return
    if (enMain === null) {
      // Clic sur une prise déjà branchée : on récupère le câble.
      if (branchements[service]) {
        setEnMain(branchements[service])
        setBranchements((b) => Object.fromEntries(Object.entries(b).filter(([cle]) => cle !== service)))
      }
      return
    }
    setBranchements((b) => {
      const suivant = Object.fromEntries(Object.entries(b).filter(([, port]) => port !== enMain))
      return { ...suivant, [service]: enMain }
    })
    setEnMain(null)
  }

  const regler = (id, etat) => !verrouille && setRegles((r) => ({ ...r, [id]: etat }))

  const lancerDiagnostic = () => {
    const reponse = { ports: branchements, firewall: regles }
    setEnvoye(reponse)
    setScan(true)
    minuterie.current = setTimeout(
      () => {
        setScan(false)
        onValider(reponse)
      },
      reduit() ? 0 : DUREE_SCAN,
    )
  }

  const nbOk = services.filter((s) => etatService(s.id) === 'ok').length

  return (
    <div className={`reseau${verrouille ? ' is-retabli' : ''}`}>
      <ol className="reseau__etapes">
        {ETAPES.map((nom, i) => (
          <li key={nom}>
            <button
              type="button"
              className={`reseau__etape${etape === i ? ' is-actuelle' : ''}${i < etape || verrouille ? ' is-faite' : ''}`}
              disabled={!accessible[i]}
              aria-current={etape === i ? 'step' : undefined}
              onClick={() => setEtape(i)}
            >
              <span className="reseau__etape-num">{i + 1}</span>
              {nom}
            </button>
          </li>
        ))}
      </ol>

      {etape === 0 && (
        <section className="brassage" aria-label="Baie de brassage">
          <div className="brassage__bac">
            <p className="brassage__titre">
              Câbles disponibles
              <span>{enMain ? `Câble :${enMain} en main, clique sur une prise` : 'Prends un câble'}</span>
            </p>
            <ul className="brassage__cables">
              {ports.map((port) => {
                const branche = utilises.includes(port)
                return (
                  <li key={port}>
                    <button
                      type="button"
                      className={`cable${enMain === port ? ' is-en-main' : ''}${branche ? ' is-branche' : ''}`}
                      aria-pressed={enMain === port}
                      disabled={verrouille}
                      onClick={() => prendre(port)}
                    >
                      <span className="cable__fiche" aria-hidden="true" />:{port}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <ul className="brassage__prises">
            {services.map((service) => {
              const port = branchements[service.id]
              const etat = etatService(service.id)
              return (
                <li key={service.id}>
                  <button
                    type="button"
                    className={`prise${port ? ' is-branchee' : ''}${enMain ? ' is-cible' : ''}${etat ? ` is-${etat}` : ''}`}
                    disabled={verrouille}
                    onClick={() => brancher(service.id)}
                    aria-label={`${service.name} (${service.protocol}) : ${port ? `branché sur ${port}` : 'débranché'}`}
                  >
                    <span className="prise__led" aria-hidden="true" />
                    <span className="prise__protocole">{service.protocol}</span>
                    <span className="prise__nom">{service.name}</span>
                    <span className="prise__desc">{service.description}</span>
                    <span className="prise__port">{port ? `:${port}` : '— —'}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {clue && (
            <figure className="indice-donne">
              <figcaption>
                <span>{clue.file}</span>
                <span>{clue.note}</span>
              </figcaption>
              <pre>{clue.lines.join('\n')}</pre>
            </figure>
          )}

          <div className="reseau__actions">
            <p className="reseau__compteur">
              <strong>{Object.keys(branchements).length}</strong>/{services.length} services rebranchés
            </p>
            <button type="button" className="bouton" disabled={!brassageComplet} onClick={() => setEtape(1)}>
              Passer au pare-feu
            </button>
          </div>
        </section>
      )}

      {etape === 1 && (
        <section className="parefeu" aria-label="Règles du pare-feu">
          <div className="parefeu__legende" aria-hidden="true">
            <span>Internet</span>
            <span>Pare-feu</span>
            <span>Serveurs du campus</span>
          </div>
          <ul className="parefeu__flux">
            {flux.map((f) => {
              const regle = regles[f.id]
              const suspect = f.id === intrus.id
              return (
                <li
                  key={f.id}
                  className={`flux${regle ? ` is-${regle}` : ''}${suspect ? ' is-suspect' : ''}`}
                >
                  <div className="flux__piste" aria-hidden="true">
                    {[0, 1, 2].map((n) => (
                      <span key={n} className="flux__paquet" style={{ animationDelay: `${n * 0.7}s` }} />
                    ))}
                    <span className="flux__mur" />
                  </div>
                  <div className="flux__info">
                    <span className="flux__protocole">{suspect ? `:${f.port}` : f.protocol}</span>
                    <span className="flux__nom">
                      {f.name}
                      {!suspect && branchements[f.id] && <span className="flux__port">:{branchements[f.id]}</span>}
                    </span>
                    <span className="flux__zone">{suspect ? f.description : f.zone}</span>
                  </div>
                  <div className="flux__choix" role="group" aria-label={`Flux ${f.name} depuis Internet`}>
                    <button
                      type="button"
                      className="flux__bouton is-ouvrir"
                      aria-pressed={regle === 'ouvert'}
                      disabled={verrouille}
                      onClick={() => regler(f.id, 'ouvert')}
                    >
                      Ouvrir
                    </button>
                    <button
                      type="button"
                      className="flux__bouton is-bloquer"
                      aria-pressed={regle === 'bloque'}
                      disabled={verrouille}
                      onClick={() => regler(f.id, 'bloque')}
                    >
                      Bloquer
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="reseau__actions">
            <p className="reseau__compteur">
              <strong>{Object.keys(regles).length}</strong>/{flux.length} règles décidées
            </p>
            <button type="button" className="bouton" disabled={!pareFeuComplet} onClick={() => setEtape(2)}>
              Préparer le diagnostic
            </button>
          </div>
        </section>
      )}

      {etape === 2 && (
        <section className="diagnostic" aria-label="Diagnostic du réseau">
          <div className="terminal">
            <div className="terminal__barre">
              <span>admin@srv-campus-01</span>
              <span>diagnostic</span>
            </div>
            <div className="diagnostic__sortie" aria-live="polite">
              <p className="diagnostic__commande">$ campus-diag --services --firewall</p>
              {scan && (
                <div className="diagnostic__scan">
                  <span>Scan des {services.length} services et des {flux.length} règles…</span>
                  <span className="diagnostic__barre" />
                </div>
              )}
              {!scan && !retour?.fields && !verrouille && (
                <p className="diagnostic__attente">Configuration prête. Lance le diagnostic quand tu es sûr de toi.</p>
              )}
              {!scan && envoye && (retour?.fields || verrouille) && (
                <ul className="diagnostic__lignes">
                  {services.map((s, i) => {
                    const ok = verrouille || retour?.fields?.[s.id]
                    return (
                      <li key={s.id} className={ok ? 'is-ok' : 'is-ko'} style={{ animationDelay: `${i * 0.12}s` }}>
                        <span>{ok ? '●' : '✕'}</span> {s.id}.service
                        <span className="diagnostic__etat">
                          {ok ? `active (running) sur :${envoye.ports[s.id]}` : `failed : rien ne répond sur :${envoye.ports[s.id]}`}
                        </span>
                      </li>
                    )
                  })}
                  <li
                    className={verrouille || retour?.firewall === flux.length ? 'is-ok' : 'is-ko'}
                    style={{ animationDelay: `${services.length * 0.12}s` }}
                  >
                    <span>{verrouille || retour?.firewall === flux.length ? '●' : '✕'}</span> ufw
                    <span className="diagnostic__etat">
                      {verrouille ? flux.length : retour?.firewall}/{flux.length} règles sûres
                      {!verrouille && retour?.firewall < flux.length && ' : un flux dangereux passe encore'}
                    </span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {!verrouille && retour?.fields && (
            <p className="diagnostic__conseil">
              {nbOk < services.length
                ? 'Les prises en rouge sont mal branchées : retourne au brassage.'
                : 'Tous les services répondent : le problème vient du pare-feu.'}
            </p>
          )}

          <div className="reseau__actions">
            <p className="reseau__compteur">Une configuration fausse coûte 25 pts.</p>
            <button
              type="button"
              className="bouton"
              disabled={verrouille || envoi || scan || !pareFeuComplet || !brassageComplet}
              onClick={lancerDiagnostic}
            >
              {scan ? 'Scan en cours…' : 'Lancer le diagnostic'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
