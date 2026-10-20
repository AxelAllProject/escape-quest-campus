import { useState } from 'react'
import './commun.css'
import './Capture.css'

// Épreuve « capture » : une capture réseau façon Wireshark. Le joueur filtre et inspecte les trames,
// puis remplit un rapport (type d'attaque, faux domaine, comptes piégés) et choisit 3 contre-mesures.
// Comme pour l'enquête, les éléments justes sont confirmés sans pénalité ; une erreur coûte des points.

const FILTRES = ['802.11', 'dhcp', 'dns', 'http', 'tls']
const DOMAINE = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:fr|net|com)\b/g
const NB_ACTIONS = 3

// Rend les noms de domaine cliquables dans la colonne Info.
function Info({ texte, onDomaine, actif }) {
  const morceaux = []
  let fin = 0
  for (const m of texte.matchAll(DOMAINE)) {
    if (m.index > fin) morceaux.push(texte.slice(fin, m.index))
    morceaux.push(
      <button
        key={m.index}
        type="button"
        className="domaine"
        disabled={!actif}
        onClick={(e) => {
          e.stopPropagation()
          onDomaine(m[0])
        }}
      >
        {m[0]}
      </button>,
    )
    fin = m.index + m[0].length
  }
  morceaux.push(texte.slice(fin))
  return morceaux
}

const cle = (v) => (Array.isArray(v) ? [...v].sort().join(',') : String(v ?? ''))

export default function Capture({ epreuve, onValider, envoi, verrouille, retour }) {
  const { frames, attacks, actions, file } = epreuve
  const [filtre, setFiltre] = useState('')
  const [trame, setTrame] = useState(frames[0].no)
  const [rapport, setRapport] = useState({ attaque: '', domaine: '', comptes: '', actions: [] })
  const [envoye, setEnvoye] = useState(null)

  const f = filtre.trim().toLowerCase()
  const visibles = frames.filter((t) => !f || t.proto.toLowerCase() === f || `${t.proto} ${t.src} ${t.dst} ${t.info}`.toLowerCase().includes(f))
  const detail = frames.find((t) => t.no === trame)

  const changer = (champ, valeur) => setRapport((r) => ({ ...r, [champ]: valeur }))
  const basculerAction = (id) =>
    changer(
      'actions',
      rapport.actions.includes(id) ? rapport.actions.filter((a) => a !== id) : [...rapport.actions, id].slice(-NB_ACTIONS),
    )

  const etat = (champ) => {
    if (verrouille) return 'ok'
    if (!retour?.fields || !envoye || !(champ in retour.fields) || cle(envoye[champ]) !== cle(rapport[champ])) return null
    return retour.fields[champ] ? 'ok' : 'ko'
  }

  const rempli = {
    attaque: rapport.attaque !== '',
    domaine: rapport.domaine.trim() !== '',
    comptes: rapport.comptes !== '',
    actions: rapport.actions.length > 0,
  }
  const nbRemplis = Object.values(rempli).filter(Boolean).length
  const nbOk = ['attaque', 'domaine', 'comptes', 'actions'].filter((c) => etat(c) === 'ok').length

  const envoyer = (e) => {
    e.preventDefault()
    const reponse = Object.fromEntries(Object.entries(rapport).filter(([c]) => rempli[c]))
    if (reponse.comptes !== undefined) reponse.comptes = Number(reponse.comptes)
    setEnvoye(rapport)
    onValider(reponse)
  }

  const tampon = (champ) => {
    const e = etat(champ)
    return e ? <span className={`tampon is-${e}`}>{e === 'ok' ? 'Confirmé' : 'Faux'}</span> : null
  }

  return (
    <div className="capture">
      <div className="wireshark">
        <div className="terminal__barre">
          <span>{file}</span>
          <span>
            {visibles.length} / {frames.length} trames
          </span>
        </div>
        <div className="wireshark__filtre">
          <label>
            <span className="sr-only">Filtre d'affichage</span>
            <input
              type="text"
              value={filtre}
              onChange={(e) => setFiltre(e.target.value)}
              placeholder="Filtre d'affichage : http, dns, 802.11, lmartin…"
              spellCheck="false"
              autoComplete="off"
            />
          </label>
          <div className="wireshark__raccourcis">
            {FILTRES.map((p) => (
              <button
                key={p}
                type="button"
                className={`puce${f === p ? ' is-active' : ''}`}
                onClick={() => setFiltre(f === p ? '' : p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="wireshark__table-zone">
          <table className="wireshark__table">
            <thead>
              <tr>
                <th scope="col">N°</th>
                <th scope="col">Temps</th>
                <th scope="col">Source</th>
                <th scope="col">Destination</th>
                <th scope="col">Proto</th>
                <th scope="col">Info</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((t) => (
                <tr
                  key={t.no}
                  className={`proto-${t.proto.replace('.', '')}${trame === t.no ? ' is-choisie' : ''}`}
                  onClick={() => setTrame(t.no)}
                >
                  <td>
                    <button type="button" className="wireshark__no" onClick={() => setTrame(t.no)} aria-pressed={trame === t.no}>
                      {t.no}
                    </button>
                  </td>
                  <td>{t.time}</td>
                  <td>{t.src}</td>
                  <td>{t.dst}</td>
                  <td>{t.proto}</td>
                  <td className="wireshark__info">
                    <Info texte={t.info} actif={!verrouille} onDomaine={(d) => changer('domaine', d)} />
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan="6" className="wireshark__vide">
                    Aucune trame ne correspond à ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="wireshark__detail" aria-live="polite">
          <p className="wireshark__detail-titre">
            Trame {detail.no} · {detail.proto} · {detail.src} → {detail.dst}
          </p>
          <ul>
            {detail.detail.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>

      <form className="rapport" onSubmit={envoyer}>
        <div className="rapport__tete">
          <h2 className="rapport__titre">Rapport d'incident</h2>
          <span className="rapport__score">
            {nbOk}/4 confirmés
          </span>
        </div>

        <fieldset className={`rapport__bloc${etat('attaque') ? ` is-${etat('attaque')}` : ''}`}>
          <legend>
            <span className="rapport__num">1</span>Quelle trame a déconnecté les étudiants du vrai Wi-Fi ?
          </legend>
          {tampon('attaque')}
          <div className="rapport__choix">
            {attacks.map((a) => (
              <label key={a.id} className={`option${rapport.attaque === a.id ? ' is-choisie' : ''}`}>
                <input
                  type="radio"
                  name="attaque"
                  value={a.id}
                  checked={rapport.attaque === a.id}
                  onChange={() => changer('attaque', a.id)}
                  disabled={verrouille}
                />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="rapport__ligne">
          <fieldset className={`rapport__bloc${etat('domaine') ? ` is-${etat('domaine')}` : ''}`}>
            <legend>
              <span className="rapport__num">2</span>Domaine du faux portail
            </legend>
            {tampon('domaine')}
            <input
              className="rapport__saisie"
              value={rapport.domaine}
              onChange={(e) => changer('domaine', e.target.value)}
              placeholder="clique un domaine dans la capture"
              spellCheck="false"
              autoComplete="off"
              disabled={verrouille}
              aria-label="Domaine du faux portail"
            />
          </fieldset>

          <fieldset className={`rapport__bloc${etat('comptes') ? ` is-${etat('comptes')}` : ''}`}>
            <legend>
              <span className="rapport__num">3</span>Comptes ENT piégés
            </legend>
            {tampon('comptes')}
            <div className="compteur">
              <button
                type="button"
                onClick={() => changer('comptes', Math.max(0, Number(rapport.comptes || 0) - 1))}
                disabled={verrouille}
                aria-label="Un compte de moins"
              >
                −
              </button>
              <output aria-label="Nombre de comptes">{rapport.comptes === '' ? '?' : rapport.comptes}</output>
              <button
                type="button"
                onClick={() => changer('comptes', Math.min(9, rapport.comptes === '' ? 1 : Number(rapport.comptes) + 1))}
                disabled={verrouille}
                aria-label="Un compte de plus"
              >
                +
              </button>
            </div>
          </fieldset>
        </div>

        <fieldset className={`rapport__bloc${etat('actions') ? ` is-${etat('actions')}` : ''}`}>
          <legend>
            <span className="rapport__num">4</span>Contre-mesures : choisis-en {NB_ACTIONS} ({rapport.actions.length}/{NB_ACTIONS})
          </legend>
          {tampon('actions')}
          <div className="contre-mesures">
            {actions.map((a) => {
              const choisie = rapport.actions.includes(a.id)
              return (
                <label key={a.id} className={`contre-mesure${choisie ? ' is-choisie' : ''}`}>
                  <input type="checkbox" checked={choisie} onChange={() => basculerAction(a.id)} disabled={verrouille} />
                  <span className="contre-mesure__case" aria-hidden="true" />
                  {a.label}
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="rapport__actions">
          <p>Les éléments justes sont confirmés gratuitement. Une erreur coûte 25 pts.</p>
          <button type="submit" className="bouton" disabled={verrouille || envoi || nbRemplis === 0}>
            {nbRemplis === 4 ? 'Envoyer le rapport' : `Vérifier ${nbRemplis} élément${nbRemplis > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  )
}
