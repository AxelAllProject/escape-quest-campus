import { useState } from 'react'
import './Logs.css'

// Couleur d'une ligne selon son contenu, comme dans un vrai outil de supervision.
function niveau(ligne) {
  if (/Failed|stopped/.test(ligne)) return 'is-alerte'
  if (/Accepted/.test(ligne)) return 'is-ok'
  if (/recovery-key:/.test(ligne)) return 'is-cle'
  return ''
}

// Épreuve 3 : le joueur fouille un journal système (avec un filtre façon grep)
// et saisit la clé de récupération créée par l'intrus.
export default function Logs({ epreuve, onValider, envoi, verrouille }) {
  const { lines, file } = epreuve
  const [filtre, setFiltre] = useState('')
  const [code, setCode] = useState('')
  const visibles = lines.filter((l) => l.toLowerCase().includes(filtre.trim().toLowerCase()))

  const valider = (e) => {
    e.preventDefault()
    if (code.trim()) onValider(code.trim())
  }

  return (
    <div className="logs">
      <div className="terminal">
        <div className="terminal__barre">
          <span>{file}</span>
          <span>
            {visibles.length} / {lines.length} lignes
          </span>
        </div>

        <label className="terminal__filtre">
          <span>$ grep</span>
          <input
            type="text"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="filtrer : une IP, un nom, un mot…"
            spellCheck="false"
            autoComplete="off"
          />
        </label>

        <ol className="terminal__lignes" aria-label="Journal du serveur">
          {visibles.map((ligne) => (
            <li key={ligne} className={niveau(ligne)}>
              {ligne}
            </li>
          ))}
          {visibles.length === 0 && <li className="terminal__vide">Aucune ligne ne correspond à ce filtre.</li>}
        </ol>
      </div>

      <form className="logs__reponse" onSubmit={valider}>
        <label htmlFor="cle-intrus">Clé créée par l'intrus</label>
        <div className="logs__champ">
          <input
            id="cle-intrus"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="XX-XXXX"
            maxLength={20}
            spellCheck="false"
            autoComplete="off"
            disabled={verrouille}
          />
          <button type="submit" className="bouton" disabled={verrouille || envoi || !code.trim()}>
            Révoquer la clé
          </button>
        </div>
      </form>
    </div>
  )
}
