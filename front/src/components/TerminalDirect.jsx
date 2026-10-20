import { useEffect, useState } from 'react'
import './TerminalDirect.css'

// Terminal de diagnostic qui « tape » des commandes en boucle sur l'accueil.
const LIGNES = [
  { cmd: 'ping ent.campus.fr', sortie: 'Request timeout for icmp_seq 0', niveau: 'alerte' },
  { cmd: 'systemctl status nginx', sortie: 'nginx.service: inactive (dead)', niveau: 'alerte' },
  { cmd: 'grep "Failed" /var/log/auth.log | wc -l', sortie: '3', niveau: 'info' },
  { cmd: 'whois 185.220.101.4', sortie: 'origine inconnue, adresse signalée', niveau: 'alerte' },
  { cmd: 'nmcli dev wifi list | grep campus', sortie: '3 réseaux « campus », dont 1 ouvert : suspect', niveau: 'alerte' },
  { cmd: 'nslookup ent.campus.fr 192.168.4.1', sortie: 'Address: 192.168.4.1 (réponse falsifiée)', niveau: 'alerte' },
]

export default function TerminalDirect() {
  const [ligne, setLigne] = useState(0)
  const [tape, setTape] = useState(0)
  const reduit = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const actuelle = LIGNES[ligne]
  const finie = reduit || tape >= actuelle.cmd.length

  useEffect(() => {
    if (reduit) return undefined
    const delai = finie ? 2200 : 45 + Math.random() * 60
    const minuterie = setTimeout(() => {
      if (finie) {
        setLigne((l) => (l + 1) % LIGNES.length)
        setTape(0)
      } else {
        setTape((t) => t + 1)
      }
    }, delai)
    return () => clearTimeout(minuterie)
  }, [finie, tape, reduit])

  return (
    <div className="terminal-direct" aria-hidden="true">
      <p>
        <span className="terminal-direct__invite">soc@campus:~$</span> {reduit ? actuelle.cmd : actuelle.cmd.slice(0, tape)}
        {!finie && <span className="terminal-direct__curseur" />}
      </p>
      <p className={`terminal-direct__sortie is-${actuelle.niveau}`}>{finie ? actuelle.sortie : ' '}</p>
    </div>
  )
}
