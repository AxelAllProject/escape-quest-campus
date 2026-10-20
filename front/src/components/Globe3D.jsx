import { useEffect, useRef } from 'react'
import './Globe3D.css'

// Globe 3D dessiné sur un canvas : une sphère de points qui tourne, des arcs d'attaque
// qui convergent vers le campus, et des paquets qui circulent sur ces arcs.

const CAMPUS = { lat: 50.63, lon: 3.06, nom: 'campus.fr' }
const ATTAQUANTS = [
  { lat: 40.7, lon: -74, nom: '185.220.101.4' },
  { lat: 55.75, lon: 37.6 },
  { lat: 39.9, lon: 116.4 },
  { lat: -23.5, lon: -46.6 },
  { lat: 1.35, lon: 103.8 },
  { lat: 6.5, lon: 3.4 },
  { lat: 64.1, lon: -21.9 },
]

const NB_POINTS = 900
const INCLINAISON = -0.62

function versVecteur(lat, lon) {
  const la = (lat * Math.PI) / 180
  const lo = (lon * Math.PI) / 180
  return [Math.cos(la) * Math.sin(lo), -Math.sin(la), Math.cos(la) * Math.cos(lo)]
}

// Points répartis régulièrement sur la sphère (spirale de Fibonacci).
const POINTS = Array.from({ length: NB_POINTS }, (_, i) => {
  const y = 1 - (i / (NB_POINTS - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const t = i * Math.PI * (3 - Math.sqrt(5))
  return [Math.cos(t) * r, y, Math.sin(t) * r]
})

// Interpolation sur un grand cercle, avec une bosse pour que l'arc décolle du globe.
function pointArc(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const s = Math.sin(omega) || 1
  const k1 = Math.sin((1 - t) * omega) / s
  const k2 = Math.sin(t * omega) / s
  const hauteur = 1 + 0.28 * Math.sin(Math.PI * t) * (omega / Math.PI + 0.3)
  return [(a[0] * k1 + b[0] * k2) * hauteur, (a[1] * k1 + b[1] * k2) * hauteur, (a[2] * k1 + b[2] * k2) * hauteur]
}

function couleur(nom, repli) {
  return getComputedStyle(document.documentElement).getPropertyValue(nom).trim() || repli
}

export default function Globe3D() {
  const canvas = useRef(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d')
    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const c = {
      point: couleur('--acier', '#93a7c0'),
      action: couleur('--action', '#3dd6f5'),
      alarme: couleur('--alarme', '#f2474e'),
      texte: couleur('--givre', '#e8eef6'),
    }
    const campus = versVecteur(CAMPUS.lat, CAMPUS.lon)
    const sources = ATTAQUANTS.map((a) => ({ ...a, v: versVecteur(a.lat, a.lon) }))

    let largeur = 0
    let hauteur = 0
    let angle = 0.35
    const vitesse = 0.0022
    let visible = true
    let image = 0
    let glisse = null

    const redimensionner = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      largeur = el.clientWidth
      hauteur = el.clientHeight
      el.width = largeur * dpr
      el.height = hauteur * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const projeter = ([x, y, z], R, cx, cy) => {
      const ca = Math.cos(angle)
      const sa = Math.sin(angle)
      const x1 = x * ca + z * sa
      const z1 = -x * sa + z * ca
      const ci = Math.cos(INCLINAISON)
      const si = Math.sin(INCLINAISON)
      const y2 = y * ci - z1 * si
      const z2 = y * si + z1 * ci
      return { x: cx + x1 * R, y: cy + y2 * R, z: z2 }
    }

    const dessiner = (temps) => {
      const R = Math.min(largeur, hauteur) * 0.37
      const cx = largeur / 2
      const cy = hauteur / 2
      ctx.clearRect(0, 0, largeur, hauteur)

      // Halo autour du globe
      const halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.35)
      halo.addColorStop(0, 'rgba(61, 214, 245, 0.16)')
      halo.addColorStop(1, 'rgba(61, 214, 245, 0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(61, 214, 245, 0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()

      // Méridiens et parallèles (moitié avant seulement)
      ctx.lineWidth = 0.7
      for (let m = 0; m < 12; m++) {
        const lon = (m / 12) * 360
        ctx.beginPath()
        let enCours = false
        for (let lat = -90; lat <= 90; lat += 6) {
          const p = projeter(versVecteur(lat, lon), R, cx, cy)
          if (p.z > 0) {
            if (enCours) ctx.lineTo(p.x, p.y)
            else ctx.moveTo(p.x, p.y)
            enCours = true
          } else enCours = false
        }
        ctx.strokeStyle = 'rgba(147, 167, 192, 0.12)'
        ctx.stroke()
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let enCours = false
        for (let lon = 0; lon <= 360; lon += 6) {
          const p = projeter(versVecteur(lat, lon), R, cx, cy)
          if (p.z > 0) {
            if (enCours) ctx.lineTo(p.x, p.y)
            else ctx.moveTo(p.x, p.y)
            enCours = true
          } else enCours = false
        }
        ctx.strokeStyle = 'rgba(147, 167, 192, 0.12)'
        ctx.stroke()
      }

      // Nuage de points
      ctx.fillStyle = c.point
      for (const pt of POINTS) {
        const p = projeter(pt, R, cx, cy)
        ctx.globalAlpha = p.z > 0 ? 0.25 + p.z * 0.6 : 0.07
        const taille = p.z > 0 ? 1.1 + p.z * 0.9 : 0.8
        ctx.fillRect(p.x - taille / 2, p.y - taille / 2, taille, taille)
      }
      ctx.globalAlpha = 1

      // Arcs d'attaque et paquets
      sources.forEach((src, i) => {
        ctx.beginPath()
        let enCours = false
        for (let s = 0; s <= 40; s++) {
          const p = projeter(pointArc(src.v, campus, s / 40), R, cx, cy)
          if (p.z > -0.15) {
            if (enCours) ctx.lineTo(p.x, p.y)
            else ctx.moveTo(p.x, p.y)
            enCours = true
          } else enCours = false
        }
        ctx.strokeStyle = 'rgba(242, 71, 78, 0.45)'
        ctx.lineWidth = 1.2
        ctx.stroke()

        const t = ((temps / 2600 + i * 0.37) % 1 + 1) % 1
        const paquet = projeter(pointArc(src.v, campus, t), R, cx, cy)
        if (paquet.z > -0.15) {
          ctx.fillStyle = c.alarme
          ctx.shadowColor = c.alarme
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(paquet.x, paquet.y, 2.6, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }

        const depart = projeter(src.v, R, cx, cy)
        if (depart.z > 0) {
          ctx.fillStyle = c.alarme
          ctx.beginPath()
          ctx.arc(depart.x, depart.y, 2.4, 0, Math.PI * 2)
          ctx.fill()
          if (src.nom) {
            ctx.font = '11px "IBM Plex Mono", monospace'
            ctx.fillText(src.nom, depart.x + 7, depart.y - 6)
          }
        }
      })

      // Le campus, en alerte
      const pc = projeter(campus, R, cx, cy)
      if (pc.z > 0) {
        const phase = (temps / 1600) % 1
        ctx.strokeStyle = `rgba(61, 214, 245, ${0.8 * (1 - phase)})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(pc.x, pc.y, 4 + phase * 18, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = c.action
        ctx.shadowColor = c.action
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(pc.x, pc.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = c.texte
        ctx.font = '600 12px "Chakra Petch", sans-serif'
        ctx.fillText(CAMPUS.nom, pc.x + 9, pc.y + 4)
      }
    }

    const boucle = (temps) => {
      if (!glisse) angle += vitesse
      dessiner(temps)
      if (visible) image = requestAnimationFrame(boucle)
    }

    const demarrer = () => {
      cancelAnimationFrame(image)
      if (reduit) dessiner(0)
      else image = requestAnimationFrame(boucle)
    }

    // Faire tourner le globe à la main
    const appuyer = (e) => {
      glisse = { x: e.clientX, angle }
      el.setPointerCapture(e.pointerId)
    }
    const deplacer = (e) => {
      if (!glisse) return
      angle = glisse.angle + (e.clientX - glisse.x) * 0.008
      if (reduit) dessiner(0)
    }
    const relacher = () => {
      glisse = null
    }

    redimensionner()
    const observateurTaille = new ResizeObserver(() => {
      redimensionner()
      if (reduit) dessiner(0)
    })
    observateurTaille.observe(el)

    // Pas d'animation quand le globe n'est pas à l'écran
    const observateurVue = new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting
      if (visible) demarrer()
    })
    observateurVue.observe(el)

    el.addEventListener('pointerdown', appuyer)
    el.addEventListener('pointermove', deplacer)
    el.addEventListener('pointerup', relacher)
    el.addEventListener('pointercancel', relacher)
    demarrer()

    return () => {
      cancelAnimationFrame(image)
      observateurTaille.disconnect()
      observateurVue.disconnect()
      el.removeEventListener('pointerdown', appuyer)
      el.removeEventListener('pointermove', deplacer)
      el.removeEventListener('pointerup', relacher)
      el.removeEventListener('pointercancel', relacher)
    }
  }, [])

  return (
    <canvas
      ref={canvas}
      className="globe3d"
      role="img"
      aria-label="Globe en 3D : des attaques partent de plusieurs pays et convergent vers le campus"
    />
  )
}
