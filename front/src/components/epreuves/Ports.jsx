import { useState } from 'react'
import './Ports.css'

// Épreuve 2 : le joueur remet chaque service sur le bon port, comme dans une console d'admin.
export default function Ports({ epreuve, onValider, envoi, verrouille }) {
  const { services, ports, clue } = epreuve
  const [choix, setChoix] = useState({})
  const complet = services.every((s) => choix[s.id])

  const choisir = (service, port) => setChoix((c) => ({ ...c, [service]: port }))

  return (
    <div className="ports">
      <div className="console">
        <div className="console__barre">
          <span>admin@srv-campus-01</span>
          <span>gestion des services</span>
        </div>

        <table className="console__table">
          <thead>
            <tr>
              <th scope="col">État</th>
              <th scope="col">Service</th>
              <th scope="col">Port d'écoute</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>
                  <span
                    className={`console__voyant ${verrouille ? 'is-actif' : ''}`}
                    role="img"
                    aria-label={verrouille ? 'actif' : 'arrêté'}
                  />
                </td>
                <td>
                  <span className="console__protocole">{service.protocol}</span>
                  <span className="console__nom">{service.name}</span>
                  <span className="console__desc">{service.description}</span>
                </td>
                <td>
                  <label className="sr-only" htmlFor={`port-${service.id}`}>
                    Port pour {service.name}
                  </label>
                  <select
                    id={`port-${service.id}`}
                    className="console__select"
                    value={choix[service.id] ?? ''}
                    disabled={verrouille}
                    onChange={(e) => choisir(service.id, Number(e.target.value))}
                  >
                    <option value="" disabled>
                      choisir…
                    </option>
                    {ports.map((port) => (
                      <option key={port} value={port}>
                        {port}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="console__sortie" aria-hidden="true">
          {verrouille
            ? '$ systemctl status --all  →  4 services actifs'
            : '$ systemctl status --all  →  4 services arrêtés (configuration effacée)'}
        </p>
      </div>

      {clue && (
        <figure className="indice-donne">
          <figcaption>
            <span>{clue.file}</span>
            <span>{clue.note}</span>
          </figcaption>
          <pre>{clue.lines.join('\n')}</pre>
        </figure>
      )}

      <div className="ports__actions">
        <p className="ports__compteur">
          {Object.keys(choix).length} service(s) configuré(s) sur {services.length}
        </p>
        <button
          type="button"
          className="bouton"
          disabled={verrouille || envoi || !complet}
          onClick={() => onValider(choix)}
        >
          Relancer les services
        </button>
      </div>
    </div>
  )
}
