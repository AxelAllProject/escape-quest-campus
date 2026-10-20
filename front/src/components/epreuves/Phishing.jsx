import { useState } from 'react'
import './Phishing.css'

// Élément du mail que le joueur peut signaler (bouton bascule).
function Signalable({ id, href, className = '', children, signales, basculer, setSurvol, verrouille }) {
  const actif = signales.includes(id)
  const montrer = () => href && setSurvol(href)
  const cacher = () => href && setSurvol('')
  return (
    <button
      type="button"
      className={`signalable ${className} ${actif ? 'is-signale' : ''}`}
      aria-pressed={actif}
      disabled={verrouille}
      onClick={() => basculer(id)}
      onMouseEnter={montrer}
      onMouseLeave={cacher}
      onFocus={montrer}
      onBlur={cacher}
    >
      {children}
    </button>
  )
}

// Épreuve 1 : le joueur signale les éléments suspects d'un faux mail.
// Survoler le lien affiche sa vraie destination dans la barre d'état, comme dans un vrai client mail.
export default function Phishing({ epreuve, onValider, envoi, verrouille }) {
  const { email, expected } = epreuve
  const [signales, setSignales] = useState([])
  const [survol, setSurvol] = useState('')

  const basculer = (id) =>
    setSignales((liste) => (liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]))

  const props = { signales, basculer, setSurvol, verrouille }

  return (
    <div className="phishing">
      <div className="mail">
        <div className="mail__barre">
          <span className="mail__boutons" aria-hidden="true">
            <i /> <i /> <i />
          </span>
          <span>Boîte de réception</span>
        </div>

        <div className="mail__entete">
          <Signalable {...props} id={email.subject.id} className="mail__objet">
            {email.subject.text}
          </Signalable>
          <dl>
            <dt>De</dt>
            <dd>
              <Signalable {...props} id={email.from.id}>
                {email.from.name} &lt;{email.from.address}&gt;
              </Signalable>
            </dd>
            <dt>À</dt>
            <dd>
              <Signalable {...props} id={email.to.id}>{email.to.address}</Signalable>
            </dd>
            <dt>Reçu</dt>
            <dd className="mail__date">{email.date}</dd>
          </dl>
        </div>

        <div className="mail__corps">
          {email.body.map((bloc) =>
            bloc.kind === 'link' ? (
              <p key={bloc.id}>
                <Signalable {...props} id={bloc.id} className="mail__lien" href={bloc.href}>
                  {bloc.text}
                </Signalable>
              </p>
            ) : (
              <p key={bloc.id}>
                <Signalable {...props} id={bloc.id}>{bloc.text}</Signalable>
              </p>
            ),
          )}

          <Signalable {...props} id={email.attachment.id} className="mail__pj">
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path
                d="M8 12.5l5.5-5.5a3 3 0 1 1 4.2 4.2l-7 7a5 5 0 0 1-7-7L10 4.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>{email.attachment.name}</span>
            <small>{email.attachment.size}</small>
          </Signalable>
        </div>

        <p className="mail__etat" aria-live="polite">
          {survol ? `Lien vers : ${survol}` : 'Survole un lien pour voir sa vraie destination.'}
        </p>
      </div>

      <div className="phishing__actions">
        <p className="phishing__compteur">
          {signales.length} élément(s) signalé(s) sur {expected} attendus
        </p>
        <button
          type="button"
          className="bouton"
          disabled={verrouille || envoi || signales.length !== expected}
          onClick={() => onValider(signales)}
        >
          Valider le signalement
        </button>
      </div>
    </div>
  )
}
