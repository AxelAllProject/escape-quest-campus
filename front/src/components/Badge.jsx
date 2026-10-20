// Icônes des badges (24×24) et pastille hexagonale.
const ICONES = {
  'oeil-de-lynx': (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  autonome: <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" />,
  'sans-faute': <path d="M5 12.5l4.5 4.5L19 7" />,
  'dans-les-temps': (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 3h6" />
    </>
  ),
  eclair: <path d="M13 2L5 13.5h6L10 22l9-12h-6z" />,
  legende: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1-4.5-4.3 6.1-.8z" />,
}

export default function Badge({ id, etat }) {
  return (
    <svg viewBox="0 0 64 72" className={`badge-hex is-${etat}`} aria-hidden="true">
      <path d="M32 3l27 15.5v35L32 69 5 53.5v-35z" className="badge-hex__fond" />
      <g transform="translate(20 24)" className="badge-hex__icone">
        {etat === 'verrouille' ? (
          <>
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </>
        ) : (
          ICONES[id]
        )}
      </g>
    </svg>
  )
}
