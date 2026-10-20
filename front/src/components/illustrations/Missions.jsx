// Illustrations des cartes de mission.

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

export function IllustrationServeurs() {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" className="illu">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${86 + i * 52} 24)`}>
          <rect width="44" height="104" rx="5" className="illu__fichier" />
          {[0, 1, 2, 3].map((u) => (
            <rect key={u} x="7" y={12 + u * 21} width="30" height="12" rx="2" className="illu__pli" />
          ))}
          <circle cx="22" cy="8" r="2.5" className="illu__point" />
        </g>
      ))}
    </svg>
  )
}
