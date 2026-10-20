import { useEffect, useRef } from 'react'

// Ajoute la classe « is-visible » aux éléments [data-apparition] quand ils entrent à l'écran.
export default function useApparition() {
  const racine = useRef(null)

  useEffect(() => {
    const elements = racine.current?.querySelectorAll('[data-apparition]') ?? []
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (entree.isIntersecting) {
            entree.target.classList.add('is-visible')
            observateur.unobserve(entree.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    elements.forEach((el) => observateur.observe(el))
    return () => observateur.disconnect()
  }, [])

  return racine
}
