import { useMemo, useState } from 'react'
import './commun.css'
import './Enquete.css'

// Épreuve 3 : une enquête dans 3 journaux du serveur.
// Les indices (IP, heures, comptes, clés) sont cliquables : un clic les range dans la fiche active du dossier.
// Le joueur peut faire vérifier ses pistes à tout moment (toutes les fiches remplies sont renvoyées) :
// si elles sont toutes justes, elles sont confirmées sans pénalité ; une seule fausse piste coûte des points.

const MOTIF =
  /(\b\d{1,3}(?:\.\d{1,3}){3}\b)|(\b\d{2}:\d{2}:\d{2}\b)|(\b[A-Z0-9]{2}-[A-Z0-9]{4}\b)|((?<=(?:for|user|pour|sudo:|-m|-G sudo) )(?!invalid\b)[a-z][a-z0-9]+)/g
const TYPES = ['ip', 'time', 'key', 'user']
const NOMS_TYPE = { ip: 'une adresse IP', time: 'une heure', key: 'une clé', user: 'un nom de compte' }

function decouper(ligne) {
  const morceaux = []
  let fin = 0
  for (const m of ligne.matchAll(MOTIF)) {
    if (m.index > fin) morceaux.push({ texte: ligne.slice(fin, m.index) })
    morceaux.push({ texte: m[0], type: TYPES[m.slice(1).findIndex(Boolean)] })
    fin = m.index + m[0].length
  }
  if (fin < ligne.length) morceaux.push({ texte: ligne.slice(fin) })
  return morceaux
}

function niveau(ligne) {
  if (/UFW ALLOW|useradd -m -G sudo|systemctl stop/.test(ligne)) return 'is-danger'
  if (/Failed|invalid|BLOCK|Stopp|" (401|403|404|503)$/.test(ligne)) return 'is-alerte'
  if (/recovery-key:/.test(ligne)) return 'is-cle'
  if (/Accepted|" 200$/.test(ligne)) return 'is-ok'
  return ''
}

// Surligne le texte du filtre (façon grep --color).
function Surligne({ texte, filtre }) {
  if (!filtre) return texte
  const i = texte.toLowerCase().indexOf(filtre)
  if (i === -1) return texte
  return (
    <>
      {texte.slice(0, i)}
      <mark>{texte.slice(i, i + filtre.length)}</mark>
      <Surligne texte={texte.slice(i + filtre.length)} filtre={filtre} />
    </>
  )
}

export default function Enquete({ epreuve, onValider, envoi, verrouille, retour }) {
  const { files, fields } = epreuve
  const [onglet, setOnglet] = useState(0)
  const [filtre, setFiltre] = useState('')
  const [dossier, setDossier] = useState({})
  const [active, setActive] = useState(fields[0].id)
  const [envoye, setEnvoye] = useState(null)
  const [bulle, setBulle] = useState(null)

  const f = filtre.trim().toLowerCase()
  const fichier = files[onglet]
  const lignes = useMemo(() => fichier.lines.map((l) => ({ l, morceaux: decouper(l), niveau: niveau(l) })), [fichier])
  const visibles = lignes.filter(({ l }) => l.toLowerCase().includes(f))
  const champActif = fields.find((c) => c.id === active)

  // Résultat de la dernière vérification, pour les valeurs que le joueur n'a pas modifiées depuis.
  const etat = (id) => {
    if (verrouille) return 'ok'
    if (!retour?.fields || !envoye || envoye[id] !== dossier[id] || !(id in retour.fields)) return null
    return retour.fields[id] ? 'ok' : 'ko'
  }

  const nbConfirmes = fields.filter((c) => etat(c.id) === 'ok').length

  const suivante = (apres) => {
    const ordre = fields.map((c) => c.id)
    const debut = ordre.indexOf(apres)
    for (let k = 1; k <= ordre.length; k++) {
      const id = ordre[(debut + k) % ordre.length]
      if (!dossier[id] && id !== apres) return id
    }
    return apres
  }

  const remplir = (id, valeur) => setDossier((d) => ({ ...d, [id]: valeur }))

  const epingler = (texte, type) => {
    if (verrouille || !champActif) return
    if (champActif.kind !== type) {
      setBulle(`La fiche « ${champActif.label} » attend ${NOMS_TYPE[champActif.kind]}, pas ${NOMS_TYPE[type]}.`)
      return
    }
    setBulle(null)
    remplir(champActif.id, texte)
    setActive(suivante(champActif.id))
  }

  const verifier = (e) => {
    e.preventDefault()
    const pistes = Object.fromEntries(Object.entries(dossier).filter(([, v]) => v.trim()))
    setEnvoye(pistes)
    onValider(pistes)
  }

  const alertes = (lines) => lines.filter((l) => /is-(alerte|danger)/.test(niveau(l))).length
  const nbRemplis = fields.filter((c) => dossier[c.id]?.trim()).length

  return (
    <div className="enquete">
      <div className="terminal enquete__journaux">
        <div className="enquete__onglets" role="tablist" aria-label="Journaux du serveur">
          {files.map((fi, i) => {
            const nb = f ? fi.lines.filter((l) => l.toLowerCase().includes(f)).length : alertes(fi.lines)
            return (
              <button
                key={fi.name}
                type="button"
                role="tab"
                aria-selected={onglet === i}
                className={`enquete__onglet${onglet === i ? ' is-actif' : ''}`}
                onClick={() => setOnglet(i)}
              >
                {fi.name}
                <span className={`enquete__badge${f ? ' is-filtre' : ''}`} title={f ? 'lignes trouvées' : 'alertes'}>
                  {nb}
                </span>
              </button>
            )
          })}
        </div>

        <div className="terminal__barre">
          <span>{fichier.path}</span>
          <span>
            {visibles.length} / {fichier.lines.length} lignes
          </span>
        </div>

        <label className="terminal__filtre">
          <span>$ grep -i</span>
          <input
            type="text"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="une IP, un compte, « Accepted », « useradd »…"
            spellCheck="false"
            autoComplete="off"
          />
          {filtre && (
            <button type="button" className="terminal__effacer" onClick={() => setFiltre('')} aria-label="Effacer le filtre">
              ✕
            </button>
          )}
        </label>

        <ol className="terminal__lignes" aria-label={`Contenu de ${fichier.name}`}>
          {visibles.map(({ l, morceaux, niveau: n }) => (
            <li key={l} className={n}>
              {morceaux.map((m, k) =>
                m.type ? (
                  <button
                    key={k}
                    type="button"
                    className={`jeton is-${m.type}${Object.values(dossier).includes(m.texte) ? ' is-epingle' : ''}`}
                    onClick={() => epingler(m.texte, m.type)}
                    disabled={verrouille}
                  >
                    <Surligne texte={m.texte} filtre={f} />
                  </button>
                ) : (
                  <Surligne key={k} texte={m.texte} filtre={f} />
                ),
              )}
            </li>
          ))}
          {visibles.length === 0 && <li className="terminal__vide">Aucune ligne ne correspond à ce filtre.</li>}
        </ol>
      </div>

      <form className="dossier" onSubmit={verifier}>
        <div className="dossier__tete">
          <h2 className="dossier__titre">Dossier de l'intrus</h2>
          <div className="dossier__jauge" role="meter" aria-valuemin={0} aria-valuemax={fields.length} aria-valuenow={nbConfirmes} aria-label="Pistes confirmées">
            {fields.map((c) => (
              <span key={c.id} className={`dossier__cran${etat(c.id) === 'ok' ? ' is-ok' : ''}`} />
            ))}
            <span className="dossier__score">
              {nbConfirmes}/{fields.length} confirmées
            </span>
          </div>
        </div>
        <p className="dossier__aide">
          Choisis une fiche, puis clique sur un indice souligné dans les journaux pour l'y épingler.
        </p>

        <ol className="fiches">
          {fields.map((c, i) => {
            const e = etat(c.id)
            return (
              <li
                key={c.id}
                className={`fiche${active === c.id && !verrouille ? ' is-active' : ''}${e ? ` is-${e}` : ''}`}
                onClick={() => !verrouille && setActive(c.id)}
              >
                <label htmlFor={`fiche-${c.id}`} className="fiche__label">
                  <span className="fiche__num">{i + 1}</span>
                  {c.label}
                </label>
                <input
                  id={`fiche-${c.id}`}
                  className="fiche__valeur"
                  value={dossier[c.id] ?? ''}
                  onFocus={() => setActive(c.id)}
                  onChange={(ev) => remplir(c.id, ev.target.value)}
                  placeholder={c.placeholder}
                  spellCheck="false"
                  autoComplete="off"
                  disabled={verrouille}
                />
                {e && (
                  <span className="fiche__tampon" aria-label={e === 'ok' ? 'confirmé' : 'fausse piste'}>
                    {e === 'ok' ? 'Confirmé' : 'Fausse piste'}
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        <p className="dossier__bulle" aria-live="polite">
          {bulle}
        </p>

        <div className="dossier__actions">
          <p>Les pistes justes sont confirmées gratuitement. Une fausse piste coûte 25 pts.</p>
          <button type="submit" className="bouton" disabled={verrouille || envoi || nbRemplis === 0}>
            {nbRemplis === fields.length ? 'Boucler le dossier' : `Vérifier ${nbRemplis} piste${nbRemplis > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  )
}
