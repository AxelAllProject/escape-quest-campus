import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { enRage } from '../../game/boss'

// Scène 3D de l'Arène (Three.js, sans React) : un datacenter, le robot ROOT-KIT 9000,
// ses drones, l'émetteur du joueur et tous les effets d'attaque.
// API : viser(x, y) → ce qui est sous le pointeur, jouer(evt) → Promise résolue à l'impact,
// majEtat(etat) à chaque image, detruire().

const C = {
  nuit: 0x0b1524,
  action: 0x3dd6f5,
  alarme: 0xf2474e,
  ambre: 0xffb547,
  retabli: 0x45d98a,
  violet: 0xa884ff,
  acier: 0x93a7c0,
  coque: 0x1d2f48,
}

const POS_ROBOT = new THREE.Vector3(0, 0, -2)
const CIBLE_BOSS = new THREE.Vector3(0, 3.1, -1.6)
const EMETTEUR = new THREE.Vector3(0, 0.75, 4.2)
const CIBLE_JOUEUR = new THREE.Vector3(0, 1.4, 5.8)

const aleaEntre = (a, b) => a + Math.random() * (b - a)

export function creerArene(canvas, { reduit = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(C.nuit)
  scene.fog = new THREE.FogExp2(C.nuit, 0.045)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTexture
  scene.environmentIntensity = 0.35

  const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 80)
  const CAM_BASE = new THREE.Vector3(0, 2.9, 7.6)
  const CAM_VISEE = new THREE.Vector3(0, 2.45, -1.5)
  camera.position.copy(CAM_BASE)

  // Post-traitement : un léger « bloom » fait briller tout ce qui est émissif.
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.4, 0.22)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  const jetables = [] // géométries et matériaux à libérer à la fin
  const garder = (...objets) => {
    jetables.push(...objets)
    return objets[0]
  }

  // ---------- Lumières ----------
  scene.add(new THREE.HemisphereLight(0x6f8fbf, 0x0b1524, 0.55))
  const cle = new THREE.DirectionalLight(0xbfd7ff, 1.4)
  cle.position.set(4, 9, 6)
  cle.castShadow = true
  cle.shadow.mapSize.set(1024, 1024)
  cle.shadow.camera.left = -6
  cle.shadow.camera.right = 6
  cle.shadow.camera.top = 8
  cle.shadow.camera.bottom = -2
  scene.add(cle)
  const contre = new THREE.PointLight(C.alarme, 30, 14, 2)
  contre.position.set(0, 4, -5.5)
  scene.add(contre)
  const flash = new THREE.PointLight(0xffffff, 0, 12, 2)
  scene.add(flash)

  // ---------- Sol et arène ----------
  const sol = new THREE.Mesh(
    garder(new THREE.PlaneGeometry(60, 60)),
    garder(new THREE.MeshStandardMaterial({ color: 0x0d1a2c, metalness: 0.6, roughness: 0.45 })),
  )
  sol.rotation.x = -Math.PI / 2
  sol.receiveShadow = true
  scene.add(sol)

  const grille = new THREE.GridHelper(60, 60, C.action, C.action)
  grille.material.transparent = true
  grille.material.opacity = 0.08
  grille.position.y = 0.01
  garder(grille.geometry, grille.material)
  scene.add(grille)

  const anneauArene = new THREE.Mesh(
    garder(new THREE.RingGeometry(3.3, 3.42, 96)),
    garder(new THREE.MeshBasicMaterial({ color: C.action, transparent: true, opacity: 0.55 })),
  )
  anneauArene.rotation.x = -Math.PI / 2
  anneauArene.position.set(POS_ROBOT.x, 0.02, POS_ROBOT.z)
  scene.add(anneauArene)

  // ---------- Baies serveur (instanciées) ----------
  const geoBaie = garder(new THREE.BoxGeometry(1.1, 2.6, 1))
  const matBaie = garder(new THREE.MeshStandardMaterial({ color: 0x15253b, metalness: 0.75, roughness: 0.4 }))
  const placesBaies = []
  for (const cote of [-1, 1]) {
    for (let i = 0; i < 9; i++) placesBaies.push([cote * 7.2, -12 + i * 1.35, cote * -0.18])
  }
  for (let i = 0; i < 11; i++) placesBaies.push([-6.75 + i * 1.35, -13.5, 0])
  const baies = new THREE.InstancedMesh(geoBaie, matBaie, placesBaies.length)
  const m4 = new THREE.Matrix4()
  placesBaies.forEach(([x, z, r], i) => {
    m4.makeRotationY(r).setPosition(x, 1.3, z)
    baies.setMatrixAt(i, m4)
  })
  baies.castShadow = true
  scene.add(baies)

  // Voyants des baies : petites plaques émissives qui clignotent.
  const geoLed = garder(new THREE.PlaneGeometry(0.08, 0.05))
  const matLed = garder(new THREE.MeshBasicMaterial({ toneMapped: false }))
  const parBaie = 10
  const leds = new THREE.InstancedMesh(geoLed, matLed, placesBaies.length * parBaie)
  const couleursLed = [new THREE.Color(C.action), new THREE.Color(C.retabli), new THREE.Color(C.ambre), new THREE.Color(C.alarme)]
  const eteinte = new THREE.Color(0x10202f)
  let k = 0
  placesBaies.forEach(([x, z]) => {
    const versCentreX = x < -5 ? 0.56 : x > 5 ? -0.56 : 0
    const faceZ = z < -13 ? 0.51 : 0
    for (let j = 0; j < parBaie; j++) {
      const y = 0.45 + j * 0.2
      const decal = (j % 2) * 0.25 - 0.12
      if (versCentreX) {
        m4.makeRotationY(versCentreX > 0 ? Math.PI / 2 : -Math.PI / 2).setPosition(x + versCentreX, y, z + decal)
      } else {
        m4.makeRotationY(0).setPosition(x + decal, y, z + faceZ)
      }
      leds.setMatrixAt(k, m4)
      leds.setColorAt(k, couleursLed[Math.floor(Math.random() * 3)])
      k++
    }
  })
  scene.add(leds)

  // Poussière lumineuse qui flotte dans la salle.
  const nbPoussiere = reduit ? 120 : 360
  const posPoussiere = new Float32Array(nbPoussiere * 3)
  for (let i = 0; i < nbPoussiere; i++) {
    posPoussiere[i * 3] = aleaEntre(-12, 12)
    posPoussiere[i * 3 + 1] = aleaEntre(0.2, 8)
    posPoussiere[i * 3 + 2] = aleaEntre(-14, 8)
  }
  const geoPoussiere = garder(new THREE.BufferGeometry())
  geoPoussiere.setAttribute('position', new THREE.BufferAttribute(posPoussiere, 3))
  const poussiere = new THREE.Points(
    geoPoussiere,
    garder(new THREE.PointsMaterial({ color: C.action, size: 0.045, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })),
  )
  scene.add(poussiere)

  // ---------- Le robot ----------
  const metal = garder(new THREE.MeshStandardMaterial({ color: C.coque, metalness: 0.85, roughness: 0.32, emissive: 0xffffff, emissiveIntensity: 0 }))
  const metalSombre = garder(new THREE.MeshStandardMaterial({ color: 0x0f1a2a, metalness: 0.9, roughness: 0.5 }))
  const verre = garder(new THREE.MeshStandardMaterial({ color: 0x050b14, metalness: 0.2, roughness: 0.08 }))
  const lueur = garder(new THREE.MeshBasicMaterial({ color: C.action, toneMapped: false }))
  const lueurRouge = garder(new THREE.MeshBasicMaterial({ color: C.alarme, toneMapped: false }))
  const lignes = garder(new THREE.LineBasicMaterial({ color: C.action, transparent: true, opacity: 0.35 }))

  const robot = new THREE.Group()
  robot.position.copy(POS_ROBOT)
  scene.add(robot)
  const corps = new THREE.Group() // tout sauf le socle : c'est lui qui recule quand il est touché
  robot.add(corps)

  const piece = (geo, mat, x, y, z, parent = corps, avecLignes = false) => {
    garder(geo)
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.castShadow = true
    parent.add(m)
    if (avecLignes) {
      const e = new THREE.LineSegments(garder(new THREE.EdgesGeometry(geo)), lignes)
      m.add(e)
    }
    return m
  }

  // Socle flottant
  const socle = piece(new THREE.CylinderGeometry(1.1, 1.4, 0.35, 8), metalSombre, 0, 0.55, 0, robot)
  const anneauSocle = piece(new THREE.TorusGeometry(1.25, 0.04, 8, 64), lueur, 0, 0.45, 0, robot)
  anneauSocle.rotation.x = Math.PI / 2
  const jet = new THREE.PointLight(C.action, 8, 4, 2)
  jet.position.set(0, 0.2, 0)
  robot.add(jet)

  // Bassin, torse, cœur
  piece(new THREE.CylinderGeometry(0.55, 0.75, 0.6, 8), metal, 0, 1.15, 0, corps, true)
  const torse = piece(new THREE.BoxGeometry(2.3, 1.7, 1.3), metal, 0, 2.25, 0, corps, true)
  piece(new THREE.BoxGeometry(2.5, 0.35, 1.45), metalSombre, 0, 3.05, 0)
  const cadreCoeur = piece(new THREE.TorusGeometry(0.42, 0.07, 12, 40), metalSombre, 0, 2.3, 0.66)
  const coeur = piece(new THREE.SphereGeometry(0.3, 24, 16), lueur, 0, 2.3, 0.62)
  // Faille : un halo ambré autour du cœur, et une zone de clic généreuse.
  const halosFaille = [0, 1].map((i) => {
    const h = piece(new THREE.TorusGeometry(0.55 + i * 0.22, 0.04, 10, 48), garder(new THREE.MeshBasicMaterial({ color: C.ambre, toneMapped: false })), 0, 2.3, 0.7)
    h.visible = false
    return h
  })
  const zoneFaille = piece(new THREE.SphereGeometry(0.75, 12, 10), garder(new THREE.MeshBasicMaterial({ visible: false })), 0, 2.3, 0.7)
  const lumiereCoeur = new THREE.PointLight(C.action, 10, 5, 2)
  lumiereCoeur.position.set(0, 2.3, 1.2)
  corps.add(lumiereCoeur)
  // Anneaux de chiffrement (visibles pendant la charge du ransomware)
  const anneauxCharge = [0, 1, 2].map((i) => {
    const a = piece(new THREE.TorusGeometry(0.62 + i * 0.16, 0.025, 8, 48), lueurRouge, 0, 2.3, 0.62)
    a.visible = false
    return a
  })
  // Panneaux lumineux sur le torse
  ;[-0.75, 0.75].forEach((x) => piece(new THREE.BoxGeometry(0.35, 0.06, 0.02), lueur, x, 2.75, 0.66))
  ;[-0.85, 0.85].forEach((x) => piece(new THREE.BoxGeometry(0.18, 0.5, 0.02), metalSombre, x, 2.05, 0.66))

  // Tête
  const tete = new THREE.Group()
  tete.position.set(0, 3.75, 0)
  corps.add(tete)
  piece(new THREE.CylinderGeometry(0.28, 0.35, 0.35, 8), metalSombre, 0, -0.45, 0, tete)
  piece(new THREE.BoxGeometry(1.5, 1.05, 1.15), metal, 0, 0.1, 0, tete, true)
  piece(new THREE.BoxGeometry(1.25, 0.42, 0.05), verre, 0, 0.18, 0.58, tete)
  const yeux = [-0.32, 0.32].map((x) => piece(new THREE.BoxGeometry(0.3, 0.14, 0.04), lueur, x, 0.18, 0.62, tete))
  for (let i = 0; i < 5; i++) piece(new THREE.BoxGeometry(0.08, 0.16, 0.04), metalSombre, -0.32 + i * 0.16, -0.22, 0.58, tete)
  ;[-0.82, 0.82].forEach((x) => piece(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 16), metalSombre, x, 0.1, 0, tete).rotateZ(Math.PI / 2))
  piece(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), metalSombre, 0.35, 0.9, 0, tete)
  const antenne = piece(new THREE.SphereGeometry(0.09, 16, 12), lueurRouge, 0.35, 1.22, 0, tete)

  // Bras articulés
  const bras = [-1, 1].map((cote) => {
    const epaule = new THREE.Group()
    epaule.position.set(cote * 1.45, 2.85, 0)
    corps.add(epaule)
    piece(new THREE.SphereGeometry(0.34, 20, 14), metalSombre, 0, 0, 0, epaule)
    piece(new THREE.BoxGeometry(0.34, 1.0, 0.34), metal, 0, -0.62, 0, epaule, true)
    const coude = new THREE.Group()
    coude.position.set(0, -1.15, 0)
    epaule.add(coude)
    piece(new THREE.SphereGeometry(0.22, 16, 12), metalSombre, 0, 0, 0, coude)
    piece(new THREE.BoxGeometry(0.42, 0.95, 0.42), metal, 0, -0.5, 0.05, coude, true)
    const main = piece(new THREE.CylinderGeometry(0.22, 0.16, 0.25, 8), metalSombre, 0, -1.05, 0.05, coude)
    piece(new THREE.SphereGeometry(0.1, 12, 10), lueurRouge, 0, -1.22, 0.05, coude)
    epaule.rotation.z = cote * 0.18
    coude.rotation.x = -0.5
    return { epaule, coude, main, cote }
  })

  // ---------- Drones du botnet (phase 2) ----------
  const matDrone = garder(new THREE.MeshStandardMaterial({ color: 0x24324a, metalness: 0.8, roughness: 0.3 }))
  const drones = [0, 1].map((i) => {
    const g = new THREE.Group()
    piece(new THREE.OctahedronGeometry(0.38), matDrone, 0, 0, 0, g, true)
    const anneau = piece(new THREE.TorusGeometry(0.55, 0.03, 8, 40), lueurRouge, 0, 0, 0, g)
    anneau.rotation.x = Math.PI / 2
    piece(new THREE.SphereGeometry(0.09, 12, 10), lueurRouge, 0, 0, 0.36, g)
    g.visible = false
    g.userData = { angle: i * Math.PI, actif: false, apparition: 0, anneau }
    scene.add(g)
    return g
  })

  // ---------- L'émetteur du joueur (un petit pare-feu flottant) ----------
  const joueur = new THREE.Group()
  joueur.position.copy(EMETTEUR)
  scene.add(joueur)
  const matJoueur = garder(new THREE.MeshStandardMaterial({ color: 0x1a2c44, metalness: 0.8, roughness: 0.3 }))
  const lueurJoueur = garder(new THREE.MeshBasicMaterial({ color: C.action, toneMapped: false }))
  piece(new THREE.CylinderGeometry(0.42, 0.5, 0.22, 6), matJoueur, 0, 0, 0, joueur, true)
  const cristal = piece(new THREE.OctahedronGeometry(0.26), lueurJoueur, 0, 0.42, 0, joueur)
  const anneauJoueur = piece(new THREE.TorusGeometry(0.62, 0.025, 8, 48), lueurJoueur, 0, 0.05, 0, joueur)
  anneauJoueur.rotation.x = Math.PI / 2
  const bulle = new THREE.Mesh(
    garder(new THREE.IcosahedronGeometry(1.05, 2)),
    garder(new THREE.MeshBasicMaterial({ color: C.retabli, wireframe: true, transparent: true, opacity: 0.35, toneMapped: false })),
  )
  bulle.position.y = 0.3
  bulle.visible = false
  joueur.add(bulle)

  // Bouclier hexagonal du robot (s'allume quand un zero-day est bloqué)
  const pareFeuBoss = new THREE.Mesh(
    garder(new THREE.IcosahedronGeometry(2.6, 1)),
    garder(new THREE.MeshBasicMaterial({ color: C.alarme, wireframe: true, transparent: true, opacity: 0, toneMapped: false })),
  )
  pareFeuBoss.position.set(0, 2.5, -2)
  scene.add(pareFeuBoss)

  // ---------- Effets ----------
  const effets = []
  let secousse = 0
  let recul = 0
  let flashCoque = 0
  let teinte = C.action
  let rage = false
  let charge = false
  let vaincu = 0 // 0 → 1 : le robot s'effondre
  let victoireJoueur = false
  let defaiteJoueur = false
  let lever = 0 // le robot lève les bras pour attaquer
  let failleOuverte = false
  let etourdi = false
  const vitesse = reduit ? 3 : 1

  const geoParticule = garder(new THREE.BoxGeometry(0.09, 0.09, 0.09))
  const geoOrbe = garder(new THREE.SphereGeometry(0.16, 16, 12))
  const geoGrosOrbe = garder(new THREE.IcosahedronGeometry(0.3, 1))
  const geoCrochet = garder(new THREE.TorusKnotGeometry(0.16, 0.05, 48, 8))

  const matBrillant = (couleur, opacite = 1) =>
    new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: opacite, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })

  // Un projectile qui vole en arc de cercle, puis appelle `impact`.
  function projectile({ de, vers, geo, couleur, duree = 0.6, hauteur = 1, delai = 0, impact, tourne = true, echelle = 1 }) {
    const mat = matBrillant(couleur)
    const m = new THREE.Mesh(geo, mat)
    m.scale.setScalar(echelle)
    m.visible = false
    scene.add(m)
    const milieu = de.clone().lerp(vers, 0.5)
    milieu.y += hauteur
    const courbe = new THREE.QuadraticBezierCurve3(de.clone(), milieu, vers.clone())
    let t = -delai
    effets.push((dt) => {
      t += (dt * vitesse) / duree
      if (t < 0) return true
      m.visible = true
      if (t >= 1) {
        scene.remove(m)
        mat.dispose()
        impact?.()
        return false
      }
      courbe.getPoint(t, m.position)
      if (tourne) m.rotation.set(t * 12, t * 9, 0)
      return true
    })
  }

  // Explosion de particules.
  function explosion(pos, couleur, nb = 40, force = 4) {
    const n = reduit ? Math.ceil(nb / 3) : nb
    const positions = new Float32Array(n * 3)
    const vitesses = []
    for (let i = 0; i < n; i++) {
      positions.set([pos.x, pos.y, pos.z], i * 3)
      vitesses.push(new THREE.Vector3(aleaEntre(-1, 1), aleaEntre(-0.4, 1.2), aleaEntre(-1, 1)).normalize().multiplyScalar(aleaEntre(0.4, 1) * force))
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color: couleur, size: 0.14, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    flash.color.set(couleur)
    flash.position.copy(pos)
    flash.intensity = 40
    let vie = 1
    effets.push((dt) => {
      vie -= dt * 1.3
      for (let i = 0; i < n; i++) {
        vitesses[i].y -= dt * 4
        positions[i * 3] += vitesses[i].x * dt
        positions[i * 3 + 1] += vitesses[i].y * dt
        positions[i * 3 + 2] += vitesses[i].z * dt
      }
      geo.attributes.position.needsUpdate = true
      mat.opacity = Math.max(0, vie)
      if (vie <= 0) {
        scene.remove(pts)
        geo.dispose()
        mat.dispose()
        return false
      }
      return true
    })
  }

  // Onde de choc au sol (ou verticale).
  function onde(pos, couleur, { rayon = 6, duree = 0.8, verticale = false } = {}) {
    const geo = new THREE.RingGeometry(0.85, 1, 72)
    const mat = new THREE.MeshBasicMaterial({ color: couleur, transparent: true, side: THREE.DoubleSide, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })
    const m = new THREE.Mesh(geo, mat)
    m.position.copy(pos)
    if (!verticale) m.rotation.x = -Math.PI / 2
    scene.add(m)
    let t = 0
    effets.push((dt) => {
      t += dt / duree
      m.scale.setScalar(0.3 + t * rayon)
      mat.opacity = Math.max(0, 1 - t)
      if (t >= 1) {
        scene.remove(m)
        geo.dispose()
        mat.dispose()
        return false
      }
      return true
    })
  }

  // Rayon laser (drones).
  function laser(de, vers, couleur) {
    const longueur = de.distanceTo(vers)
    const geo = new THREE.CylinderGeometry(0.025, 0.025, longueur, 6)
    geo.translate(0, longueur / 2, 0)
    geo.rotateX(Math.PI / 2)
    const mat = matBrillant(couleur)
    const m = new THREE.Mesh(geo, mat)
    m.position.copy(de)
    m.lookAt(vers)
    scene.add(m)
    let vie = 1
    effets.push((dt) => {
      vie -= dt * 3
      mat.opacity = Math.max(0, vie)
      if (vie <= 0) {
        scene.remove(m)
        geo.dispose()
        mat.dispose()
        return false
      }
      return true
    })
  }

  // Anneaux de soin qui montent autour de l'émetteur.
  function soin() {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.TorusGeometry(0.7, 0.03, 8, 48)
      const mat = matBrillant(C.retabli)
      const m = new THREE.Mesh(geo, mat)
      m.rotation.x = Math.PI / 2
      m.position.copy(EMETTEUR)
      scene.add(m)
      let t = -i * 0.18
      effets.push((dt) => {
        t += dt * vitesse
        if (t < 0) return true
        m.position.y = EMETTEUR.y + t * 1.8
        m.scale.setScalar(1 + t * 0.6)
        mat.opacity = Math.max(0, 1 - t)
        if (t >= 1) {
          scene.remove(m)
          geo.dispose()
          mat.dispose()
          return false
        }
        return true
      })
    }
  }

  const toucherBoss = (force) => {
    recul = Math.min(1.4, recul + force)
    flashCoque = 1
    if (!reduit) secousse = Math.max(secousse, force * 0.35)
  }
  const toucherJoueur = (force) => {
    if (!reduit) secousse = Math.max(secousse, force * 0.6)
    explosion(EMETTEUR.clone().add(new THREE.Vector3(0, 0.4, 0)), C.alarme, 26, 3)
  }
  const mains = () => bras.map((b) => b.main.getWorldPosition(new THREE.Vector3()))
  const attendre = (ms) => new Promise((r) => setTimeout(r, reduit ? Math.min(ms, 120) : ms))

  // ---------- Animation d'un événement de combat ----------
  // Filet de sécurité : si l'onglet est en pause ou l'appareil très lent, on rend la main au jeu.
  function jouer(evt) {
    return Promise.race([animer(evt), new Promise((r) => setTimeout(r, 3500))])
  }

  function animer(evt) {
    return new Promise((resolve) => {
      switch (evt.type) {
        case 'zeroday': {
          projectile({
            de: EMETTEUR.clone().add(new THREE.Vector3(0, 0.5, 0)),
            vers: CIBLE_BOSS,
            geo: geoGrosOrbe,
            couleur: evt.critique ? 0xffffff : C.ambre,
            duree: 0.75,
            hauteur: 2.2,
            echelle: evt.critique ? 1.5 : 1.1,
            impact: () => {
              explosion(CIBLE_BOSS, C.ambre, 70, 6)
              if (evt.critique) explosion(CIBLE_BOSS, 0xffffff, 40, 8)
              onde(CIBLE_BOSS, C.ambre, { rayon: 4, verticale: true })
              toucherBoss(evt.critique ? 1.4 : 1)
              resolve()
            },
          })
          break
        }
        case 'patch':
          soin()
          attendre(500).then(resolve)
          break
        case 'phase2':
          onde(new THREE.Vector3(POS_ROBOT.x, 0.05, POS_ROBOT.z), C.alarme, { rayon: 10, duree: 1.1 })
          drones.forEach((d) => {
            d.visible = true
            d.userData.actif = true
            d.userData.apparition = 0
          })
          if (!reduit) secousse = 0.5
          attendre(900).then(resolve)
          break
        case 'charge':
          lever = 1
          onde(CIBLE_BOSS.clone().add(new THREE.Vector3(0, -0.8, 1)), C.alarme, { rayon: 3, verticale: true, duree: 1 })
          attendre(800).then(resolve)
          break
        case 'malware': {
          lever = 1
          attendre(250).then(() => {
            mains().forEach((m, i) =>
              projectile({
                de: m,
                vers: CIBLE_JOUEUR,
                geo: geoOrbe,
                couleur: C.alarme,
                duree: 0.65,
                hauteur: 1.2,
                delai: i * 0.12,
                echelle: 1.3,
                impact: i === 1 ? () => (toucherJoueur(0.8), resolve()) : undefined,
              }),
            )
          })
          break
        }
        case 'ddos': {
          lever = 1
          const n = reduit ? 6 : 24
          let arrives = 0
          for (let i = 0; i < n; i++) {
            const vague = Math.floor(i / (n / 3))
            projectile({
              de: CIBLE_BOSS.clone().add(new THREE.Vector3(aleaEntre(-1.4, 1.4), aleaEntre(-0.6, 0.8), 0.8)),
              vers: CIBLE_JOUEUR.clone().add(new THREE.Vector3(aleaEntre(-1.2, 1.2), aleaEntre(-0.8, 0.4), 0)),
              geo: geoParticule,
              couleur: C.alarme,
              duree: 0.55,
              hauteur: aleaEntre(0, 1.5),
              delai: vague * 0.35 + aleaEntre(0, 0.12),
              impact: () => {
                arrives++
                if (arrives % Math.ceil(n / 3) === 0) toucherJoueur(0.45)
                if (arrives === n) resolve()
              },
            })
          }
          break
        }
        case 'phishing':
          projectile({
            de: CIBLE_BOSS.clone().add(new THREE.Vector3(0, 0.9, 0.8)),
            vers: CIBLE_JOUEUR,
            geo: geoCrochet,
            couleur: C.violet,
            duree: 0.9,
            hauteur: 2.5,
            echelle: 1.4,
            impact: () => {
              explosion(EMETTEUR.clone().add(new THREE.Vector3(0, 0.5, 0)), C.violet, 30, 3)
              toucherJoueur(0.5)
              resolve()
            },
          })
          break
        case 'ransomware':
          lever = 1.4
          attendre(300).then(() => {
            projectile({
              de: CIBLE_BOSS.clone().add(new THREE.Vector3(0, -0.8, 1)),
              vers: CIBLE_JOUEUR,
              geo: geoGrosOrbe,
              couleur: C.alarme,
              duree: 0.7,
              hauteur: 0.6,
              echelle: 2.2,
              impact: () => {
                explosion(EMETTEUR.clone().add(new THREE.Vector3(0, 0.5, 0)), C.alarme, 80, 6)
                onde(new THREE.Vector3(EMETTEUR.x, 0.05, EMETTEUR.z), C.alarme, { rayon: 8 })
                toucherJoueur(1.6)
                resolve()
              },
            })
          })
          break
        case 'coup': {
          // Clic du joueur : petit impact au point visé (et un paquet qui part de l'émetteur)
          const point = evt.point ?? CIBLE_BOSS
          const couleur = evt.cible === 'faille' ? C.ambre : C.action
          explosion(point, couleur, evt.cible === 'faille' ? 60 : 8, evt.cible === 'faille' ? 6 : 2)
          if (evt.cible === 'faille') {
            onde(point, C.ambre, { rayon: 3, verticale: true, duree: 0.5 })
            toucherBoss(1)
          } else if (evt.cible === 'robot') {
            if (evt.protege) pareFeuBoss.material.opacity = 0.3 // les drones protègent le robot
            recul = Math.min(0.5, recul + 0.06)
            flashCoque = Math.max(flashCoque, 0.35)
          }
          resolve()
          break
        }
        case 'prepare':
          lever = 1.2
          flashCoque = 0.4
          resolve()
          break
        case 'parade': {
          bulle.visible = true
          bulle.material.color.set(C.action)
          explosion(EMETTEUR.clone().add(new THREE.Vector3(0, 0.5, 0)), C.action, 40, 4)
          setTimeout(() => (bulle.visible = false), reduit ? 100 : 500)
          projectile({
            de: EMETTEUR.clone().add(new THREE.Vector3(0, 0.5, 0)),
            vers: CIBLE_BOSS,
            geo: geoGrosOrbe,
            couleur: C.action,
            duree: 0.45,
            hauteur: 1.2,
            impact: () => {
              explosion(CIBLE_BOSS, C.action, 50, 5)
              toucherBoss(evt.attaque === 'ransomware' ? 1.4 : 0.8)
              resolve()
            },
          })
          break
        }
        case 'tir-drone': {
          const d = drones[evt.drone]
          if (d?.visible) {
            laser(d.position.clone(), CIBLE_JOUEUR.clone().add(new THREE.Vector3(aleaEntre(-0.5, 0.5), -0.6, 0)), C.alarme)
            explosion(EMETTEUR.clone().add(new THREE.Vector3(0, 0.5, 0)), C.alarme, 10, 2)
            if (!reduit) secousse = Math.max(secousse, 0.2)
          }
          resolve()
          break
        }
        default:
          resolve()
      }
    })
  }

  // ---------- État du combat (rage, charge, drones, fin) ----------
  // Appelé à chaque image avec l'état du combat.
  function majEtat(c) {
    rage = enRage(c)
    charge = c.qte?.type === 'ransomware'
    etourdi = c.temps < c.etourdi
    failleOuverte = !!c.faille
    teinte = rage || charge ? C.alarme : etourdi ? C.ambre : C.action
    lueur.color.set(teinte)
    lumiereCoeur.color.set(failleOuverte ? C.ambre : teinte)
    anneauxCharge.forEach((a) => (a.visible = charge))
    halosFaille.forEach((h) => (h.visible = failleOuverte))
    anneauArene.material.color.set(rage ? C.alarme : C.action)
    drones.forEach((d, i) => {
      const donnees = c.drones[i]
      if (donnees && donnees.pv > 0 && !d.userData.actif && !victoireJoueur) {
        d.visible = true
        d.userData.actif = true
        d.userData.apparition = 0
      }
      if (d.userData.actif && donnees && donnees.pv <= 0) {
        d.userData.actif = false
        explosion(d.position.clone(), C.alarme, 50, 5)
        d.visible = false
      }
    })
    if (c.fin === 'victoire' && !victoireJoueur) {
      victoireJoueur = true
      explosion(CIBLE_BOSS, C.ambre, 120, 7)
      onde(new THREE.Vector3(POS_ROBOT.x, 0.05, POS_ROBOT.z), C.ambre, { rayon: 12, duree: 1.4 })
      drones.forEach((d) => {
        if (d.visible) explosion(d.position.clone(), C.alarme, 30, 4)
        d.visible = false
        d.userData.actif = false
      })
    }
    if (c.fin === 'defaite') defaiteJoueur = true
    if (!c.fin && c.temps < 0.5) {
      victoireJoueur = false
      defaiteJoueur = false
      vaincu = 0
      drones.forEach((d) => {
        d.visible = false
        d.userData.actif = false
      })
    }
  }

  // Ce qui se trouve sous le pointeur : la faille (si ouverte), un drone, ou le robot.
  const lancer = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  function viser(clientX, clientY) {
    const r = canvas.getBoundingClientRect()
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
    lancer.setFromCamera(ndc, camera)
    if (failleOuverte) {
      const f = lancer.intersectObject(zoneFaille, false)[0]
      if (f) return { cible: 'faille', point: f.point }
    }
    for (const d of drones) {
      if (!d.visible) continue
      const t = lancer.intersectObject(d, true)[0]
      if (t) return { cible: 'drone', drone: drones.indexOf(d), point: t.point }
    }
    const t = lancer.intersectObject(corps, true).find((i) => i.object !== zoneFaille)
    if (t) return { cible: 'robot', point: t.point }
    return null
  }

  // ---------- Boucle de rendu ----------
  const horloge = new THREE.Timer()
  let image = 0
  let temps = 0
  let pointeur = { x: 0, y: 0 }
  let prochainClignotement = 0

  function boucle(instant) {
    image = requestAnimationFrame(boucle)
    horloge.update(instant)
    const dt = Math.min(horloge.getDelta(), 0.1)
    temps += dt

    // Effets en cours
    for (let i = effets.length - 1; i >= 0; i--) if (!effets[i](dt)) effets.splice(i, 1)

    // Robot : flottement, recul, flash, bras, effondrement
    const bob = reduit ? 0 : Math.sin(temps * 1.6) * 0.12
    if (victoireJoueur) vaincu = Math.min(1, vaincu + dt * 0.8)
    recul = Math.max(0, recul - dt * 2.5)
    flashCoque = Math.max(0, flashCoque - dt * 4)
    lever = Math.max(0, lever - dt * 1.4)
    corps.position.set(0, bob - vaincu * 1.1, -recul * 0.5)
    corps.rotation.x = -recul * 0.12 + vaincu * 0.5
    corps.rotation.z = vaincu * 0.35
    tete.rotation.y = reduit ? 0 : Math.sin(temps * 0.7) * 0.25 + pointeur.x * 0.2
    tete.rotation.x = vaincu * 0.6
    metal.emissiveIntensity = flashCoque * 0.9
    bras.forEach(({ epaule, coude, cote }) => {
      const balancier = reduit ? 0 : Math.sin(temps * 1.6 + cote) * 0.08
      epaule.rotation.x = -lever * 1.1 + balancier - (defaiteJoueur ? 1.6 : 0)
      epaule.rotation.z = cote * (0.18 + vaincu * 0.9)
      coude.rotation.x = -0.5 - lever * 0.6
    })
    socle.position.y = 0.55 + bob * 0.4
    anneauSocle.rotation.z += dt * (rage ? 4 : 1.2)
    anneauSocle.position.y = 0.45 + bob * 0.4
    jet.intensity = vaincu > 0 ? 0 : 8 + Math.sin(temps * 20) * 2
    jet.color.set(teinte)
    const pulsation = failleOuverte ? 1.5 + Math.sin(temps * 18) * 0.2 : charge ? 1 + Math.sin(temps * 14) * 0.25 : 1 + Math.sin(temps * 3) * 0.08
    coeur.scale.setScalar(pulsation * (1 - vaincu))
    halosFaille.forEach((h, i) => {
      h.rotation.z += dt * (i ? -4 : 3)
      h.scale.setScalar(1 + Math.sin(temps * 10 + i) * 0.08)
    })
    if (etourdi && !reduit) corps.rotation.z += Math.sin(temps * 25) * 0.04
    cadreCoeur.rotation.z += dt * (charge ? 3 : 0.4)
    lumiereCoeur.intensity = (failleOuverte ? 30 : charge ? 22 : rage ? 16 : 10) * pulsation * (1 - vaincu)
    anneauxCharge.forEach((a, i) => {
      a.rotation.x = temps * (1.5 + i)
      a.rotation.y = temps * (1 + i * 0.7)
    })
    yeux.forEach((o) => {
      const cligne = !reduit && temps % 4 < 0.12 ? 0.15 : 1
      o.scale.y = cligne * (1 - vaincu * 0.9)
    })
    antenne.visible = vaincu < 1 && (reduit || Math.floor(temps * 2.5) % 2 === 0)
    contre.intensity = (rage ? 60 : 30) * (1 - vaincu * 0.8)
    pareFeuBoss.material.opacity = Math.max(0, pareFeuBoss.material.opacity - dt * 1.2)
    pareFeuBoss.rotation.y += dt * 0.6

    // Drones en orbite
    drones.forEach((d, i) => {
      if (!d.visible) return
      d.userData.apparition = Math.min(1, d.userData.apparition + dt * 1.5)
      d.userData.angle += dt * (reduit ? 0 : 0.9)
      const a = d.userData.angle
      d.position.set(POS_ROBOT.x + Math.cos(a) * 3, 3.6 + Math.sin(temps * 2 + i) * 0.35, POS_ROBOT.z + Math.sin(a) * 1.6 + 0.5)
      d.scale.setScalar(d.userData.apparition)
      d.rotation.y += dt * 2
      d.userData.anneau.rotation.z += dt * 5
    })

    // Joueur
    cristal.rotation.y += dt * 1.5
    cristal.position.y = 0.42 + (reduit ? 0 : Math.sin(temps * 2.4) * 0.06)
    anneauJoueur.rotation.z += dt
    bulle.rotation.y += dt * 0.5
    joueur.rotation.z = defaiteJoueur ? Math.min(0.6, joueur.rotation.z + dt) : 0
    cristal.material = defaiteJoueur ? metalSombre : lueurJoueur

    // Voyants des baies
    if (temps > prochainClignotement) {
      prochainClignotement = temps + 0.12
      for (let i = 0; i < 14; i++) {
        const n = Math.floor(Math.random() * leds.count)
        const r = Math.random()
        leds.setColorAt(n, r < 0.15 ? eteinte : rage && r < 0.6 ? couleursLed[3] : couleursLed[Math.floor(Math.random() * 3)])
      }
      leds.instanceColor.needsUpdate = true
    }
    poussiere.rotation.y += dt * 0.01

    // Flash et caméra
    flash.intensity = Math.max(0, flash.intensity - dt * 120)
    secousse = Math.max(0, secousse - dt * 1.8)
    const s = secousse * secousse
    const sway = reduit ? 0 : 1
    camera.position.set(
      CAM_BASE.x + pointeur.x * 0.8 * sway + Math.sin(temps * 0.3) * 0.25 * sway + aleaEntre(-1, 1) * s,
      CAM_BASE.y - pointeur.y * 0.4 * sway + aleaEntre(-1, 1) * s,
      CAM_BASE.z + aleaEntre(-0.5, 0.5) * s,
    )
    camera.lookAt(CAM_VISEE)
    composer.render()
  }

  // ---------- Taille, pointeur, visibilité ----------
  const parent = canvas.parentElement
  const redimensionner = () => {
    const l = parent.clientWidth
    const h = parent.clientHeight
    if (!l || !h) return
    renderer.setSize(l, h, false)
    composer.setSize(l, h)
    bloom.setSize(l, h)
    camera.aspect = l / h
    // Sur écran étroit, on recule la caméra pour garder le robot entier.
    camera.fov = l / h < 1 ? 62 : 48
    CAM_BASE.z = l / h < 1 ? 10.5 : 7.6
    camera.updateProjectionMatrix()
  }
  const observateur = new ResizeObserver(redimensionner)
  observateur.observe(parent)
  redimensionner()

  const bouger = (e) => {
    const r = canvas.getBoundingClientRect()
    pointeur = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 }
  }
  canvas.addEventListener('pointermove', bouger)

  const visibilite = () => {
    cancelAnimationFrame(image)
    if (!document.hidden) {
      horloge.reset()
      image = requestAnimationFrame(boucle)
    }
  }
  document.addEventListener('visibilitychange', visibilite)
  image = requestAnimationFrame(boucle)

  return {
    jouer,
    majEtat,
    viser,
    detruire() {
      cancelAnimationFrame(image)
      observateur.disconnect()
      canvas.removeEventListener('pointermove', bouger)
      document.removeEventListener('visibilitychange', visibilite)
      effets.length = 0
      jetables.forEach((o) => o.dispose?.())
      geoBaie.dispose()
      envTexture.dispose()
      pmrem.dispose()
      composer.dispose()
      horloge.dispose()
      renderer.dispose()
    },
  }
}
