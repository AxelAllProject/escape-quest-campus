// Appels à l'API Symfony. Toujours en chemin relatif : le proxy Vite (en local)
// ou Nginx (sur la VM) redirige /api vers Symfony.

async function lireJson(reponse) {
  const data = await reponse.json().catch(() => ({}))
  if (!reponse.ok) {
    const erreur = new Error(data.error ?? `Erreur ${reponse.status}`)
    erreur.status = reponse.status
    throw erreur
  }
  return data
}

export function chargerEpreuve(id) {
  return fetch(`/api/challenges/${id}`).then(lireJson)
}

export function envoyerReponse(id, answer) {
  return fetch(`/api/challenges/${id}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  }).then(lireJson)
}

export function chargerIndice(id, index) {
  return fetch(`/api/challenges/${id}/hints/${index}`).then(lireJson)
}

// Épreuve « chasse » : puissance du signal de la borne pirate dans une salle.
export function mesurerSignal(id, zone) {
  return fetch(`/api/challenges/${id}/probe/${encodeURIComponent(zone)}`).then(lireJson)
}
