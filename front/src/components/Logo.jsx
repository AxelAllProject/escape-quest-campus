// Logo : une baie serveur verrouillée.
export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <rect x="1" y="1" width="30" height="30" rx="7" className="logo__fond" />
      <rect x="8" y="7" width="16" height="5" rx="1.5" className="logo__unite" />
      <rect x="8" y="14" width="16" height="5" rx="1.5" className="logo__unite" />
      <rect x="8" y="21" width="16" height="5" rx="1.5" className="logo__unite" />
      <circle cx="11" cy="9.5" r="1.3" className="logo__voyant" />
      <circle cx="11" cy="16.5" r="1.3" className="logo__voyant" />
      <circle cx="11" cy="23.5" r="1.3" className="logo__voyant" />
    </svg>
  )
}
