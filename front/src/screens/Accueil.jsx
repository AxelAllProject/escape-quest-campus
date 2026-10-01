// Récit de mission : brouillon à faire valider par le Product Owner.
const mission = {
  titre: "Alerte DSI : le campus est à l'arrêt",
  contexte:
    "Depuis 8 h ce matin, l'ENT est inaccessible : plus d'emplois du temps, plus de notes, plus de messagerie. Les premiers éléments pointent vers une intrusion.",
  role: 'Tu es technicien·ne de permanence à la DSI. Les inscriptions aux examens ouvrent dans 10 minutes.',
  objectifs: [
    "Identifier le mail par lequel l'attaquant est entré",
    'Rétablir les services réseau du campus',
    'Retrouver le code administrateur dans les logs',
  ],
}

export default function Accueil({ onStart }) {
  return (
    <section className="accueil">
      <p className="badge">Incident critique en cours</p>
      <h1>{mission.titre}</h1>
      <p>{mission.contexte}</p>
      <p>
        <strong>{mission.role}</strong>
      </p>
      <h2>Ta mission</h2>
      <ol>
        {mission.objectifs.map((objectif) => (
          <li key={objectif}>{objectif}</li>
        ))}
      </ol>
      <button type="button" onClick={onStart}>
        Commencer la mission
      </button>
    </section>
  )
}
