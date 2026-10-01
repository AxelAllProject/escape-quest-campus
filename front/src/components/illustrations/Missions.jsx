// Illustrations des cartes de mission.

export function IllustrationPanne() {
  return (
    <svg viewBox="76 2 232 146" aria-hidden="true" className="illu">
      <rect x="96" y="14" width="128" height="122" rx="8" className="illu__chassis" />
      {[26, 62, 98].map((y, i) => (
        <g key={y}>
          <rect x="108" y={y} width="104" height="28" rx="4" className="illu__unite" />
          <circle cx="122" cy={y + 14} r="4" className="illu__voyant" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x="134" y={y + 11} width="44" height="6" rx="3" className="illu__barre" />
          {[190, 196, 202].map((x) => (
            <line key={x} x1={x} y1={y + 7} x2={x} y2={y + 21} className="illu__grille" />
          ))}
        </g>
      ))}
      <g transform="translate(232 18)">
        <rect width="58" height="26" rx="13" className="illu__badge" />
        <text x="29" y="17.5" textAnchor="middle" className="illu__badge-texte">503</text>
      </g>
    </svg>
  )
}

export function IllustrationWifi() {
  const arcs = (cx, cy, classe) =>
    [16, 32, 48].map((r) => (
      <path
        key={r}
        d={`M ${cx - r} ${cy - r * 0.15} A ${r} ${r} 0 0 1 ${cx + r} ${cy - r * 0.15}`}
        className={classe}
      />
    ))
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" className="illu">
      {arcs(100, 104, 'illu__onde')}
      <circle cx="100" cy="108" r="5" className="illu__point" />
      {arcs(220, 104, 'illu__onde is-fantome')}
      <circle cx="220" cy="108" r="5" className="illu__point is-fantome" />
      <text x="100" y="136" textAnchor="middle" className="illu__legende">campus</text>
      <text x="220" y="136" textAnchor="middle" className="illu__legende">campus_free</text>
    </svg>
  )
}

export function IllustrationRancon() {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" className="illu">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${104 + i * 16} ${22 + i * 8})`}>
          <path d="M0 0h62l18 18v80H0z" className="illu__fichier" />
          <path d="M62 0v18h18" className="illu__pli" />
        </g>
      ))}
      <g transform="translate(166 66)">
        <path d="M8 18V11a10 10 0 0 1 20 0v7" className="illu__anse" />
        <rect x="2" y="17" width="32" height="26" rx="5" className="illu__cadenas" />
        <circle cx="18" cy="30" r="3.5" className="illu__trou" />
      </g>
    </svg>
  )
}
