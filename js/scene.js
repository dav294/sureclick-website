// scene.js — SureClick Three.js Background
// Intergalactic galaxy: branded planets + star field

import * as THREE from 'three';

const isMobile = window.innerWidth < 768;

// ─── Renderer ────────────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x060c16, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// ─── Scene & Camera ──────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060c16, 0.028);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0, 6);

// ─── Lighting ────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x0a1830, 2.2));

// Primary "star" light — upper left, cyan-tinted
const starLight = new THREE.PointLight(0x5cc6ff, 2.8, 55);
starLight.position.set(-5, 5, 8);
scene.add(starLight);

// Secondary fill — lower right, brand blue
const fillLight = new THREE.PointLight(0x0e62ad, 1.4, 40);
fillLight.position.set(7, -3, 5);
scene.add(fillLight);

// ─── Star Field ──────────────────────────────────────────────
const STAR_COUNT = isMobile ? 2000 : 3400;
const starPos = new Float32Array(STAR_COUNT * 3);
const starCol = new Float32Array(STAR_COUNT * 3);

const cPrimary = new THREE.Color('#0e62ad');
const cAccent  = new THREE.Color('#5cc6ff');
const cDeep    = new THREE.Color('#061430');
const cWhite   = new THREE.Color('#a8c8f0');

for (let i = 0; i < STAR_COUNT; i++) {
  const rand = Math.random();
  const r = rand < 0.15 ? 1.4 + Math.random() * 1.2
          : rand < 0.65 ? 3.2 + Math.random() * 4.0
          :               8.0 + Math.random() * 10.0;

  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPos[i * 3 + 2] = r * Math.cos(phi);

  const t = Math.random();
  const c = t < 0.33 ? cDeep.clone().lerp(cPrimary, t * 3)
          : t < 0.66 ? cPrimary.clone().lerp(cAccent, (t - 0.33) * 3)
          :             cAccent.clone().lerp(cWhite, (t - 0.66) * 3);
  starCol[i * 3] = c.r; starCol[i * 3 + 1] = c.g; starCol[i * 3 + 2] = c.b;
}

const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color',    new THREE.BufferAttribute(starCol, 3));

const starMat = new THREE.PointsMaterial({
  size: 0.016, vertexColors: true, sizeAttenuation: true,
  transparent: true, opacity: 0.88, depthWrite: false
});
const particles = new THREE.Points(starGeo, starMat);
scene.add(particles);

// ─── Planets ─────────────────────────────────────────────────
// Each planet: sphere + atmospheric BackSide glow + outer haze + optional ring
// All colours drawn from SureClick palette: #0e62ad / #5cc6ff / #060c16

const PLANET_DEFS = [
  // [0] Large ringed planet — right of centre, deep navy
  {
    x: 2.1, y: 0.4, z: -1.2,
    r: isMobile ? 0.36 : 0.52,
    col:       0x0a3d7a,
    emissive:  0x041830,
    shininess: 55,
    glow:  { col: 0x1a6ec4, scale: 1.48, op: 0.09 },
    halo:  { col: 0x0e62ad, scale: 2.20, op: 0.035 },
    ring:  { inner: 0.70, outer: 1.14, col: 0x5cc6ff, op: 0.18, rx: 0.40, rz: 0.08 },
    float: { amp: 0.07, spd: 0.55, off: 0.0 },
    rotSpd: { y: 0.035, x: 0.014 },
  },
  // [1] Medium icy planet — upper left, vivid cyan atmosphere
  {
    x: isMobile ? -1.7 : -2.6,
    y: isMobile ?  0.9 :  1.4,
    z: 0.2,
    r: isMobile ? 0.21 : 0.30,
    col:       0x0c4878,
    emissive:  0x061530,
    shininess: 90,
    glow:  { col: 0x5cc6ff, scale: 1.70, op: 0.10 },
    halo:  { col: 0x5cc6ff, scale: 2.60, op: 0.038 },
    ring:  null,
    float: { amp: 0.06, spd: 0.42, off: 1.8 },
    rotSpd: { y: 0.024, x: 0.010 },
  },
  // [2] Small dark planet — lower left, neon-cyan ring
  {
    x: -1.55, y: -1.5, z: -0.5,
    r: 0.17,
    col:       0x06101e,
    emissive:  0x040d1a,
    shininess: 25,
    glow:  { col: 0x0e62ad, scale: 1.80, op: 0.13 },
    halo:  { col: 0x0e62ad, scale: 2.90, op: 0.042 },
    ring:  { inner: 0.25, outer: 0.46, col: 0x5cc6ff, op: 0.40, rx: 0.65, rz: 0.22 },
    float: { amp: 0.05, spd: 0.72, off: 3.2 },
    rotSpd: { y: 0.048, x: 0.020 },
    hideOnMobile: true,
  },
  // [3] Tiny planet — lower right
  {
    x: 1.35, y: -1.85, z: 0.5,
    r: 0.13,
    col:       0x0c3060,
    emissive:  0x071a40,
    shininess: 45,
    glow:  { col: 0x3a8fd0, scale: 1.90, op: 0.10 },
    halo:  { col: 0x3a8fd0, scale: 3.00, op: 0.036 },
    ring:  null,
    float: { amp: 0.04, spd: 0.65, off: 4.5 },
    rotSpd: { y: 0.042, x: 0.017 },
    hideOnMobile: true,
  },
  // [4] Distant tiny planet — upper right, deep space
  {
    x: 3.3, y: 2.0, z: -2.6,
    r: 0.085,
    col:       0x0e62ad,
    emissive:  0x0a2e58,
    shininess: 60,
    glow:  { col: 0x5cc6ff, scale: 2.10, op: 0.12 },
    halo:  { col: 0x5cc6ff, scale: 3.40, op: 0.042 },
    ring:  null,
    float: { amp: 0.03, spd: 0.50, off: 2.1 },
    rotSpd: { y: 0.030, x: 0.012 },
    hideOnMobile: true,
  },
];

const SEGS = isMobile ? 24 : 40;
const planetObjects = [];

PLANET_DEFS.forEach((def) => {
  if (def.hideOnMobile && isMobile) return;

  const group = new THREE.Group();
  group.position.set(def.x, def.y, def.z);

  // ── Planet sphere ──────────────────────────────────────────
  const mat = new THREE.MeshPhongMaterial({
    color:     def.col,
    emissive:  def.emissive,
    shininess: def.shininess,
    transparent: true,
    opacity: 1.0,
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(def.r, SEGS, SEGS), mat));

  // ── Inner atmospheric glow (BackSide rim effect) ───────────
  const glowMat = new THREE.MeshBasicMaterial({
    color: def.glow.col,
    transparent: true,
    opacity: def.glow.op,
    depthWrite: false,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(def.r * def.glow.scale, SEGS, SEGS), glowMat));

  // ── Outer haze ─────────────────────────────────────────────
  const haloMat = new THREE.MeshBasicMaterial({
    color: def.halo.col,
    transparent: true,
    opacity: def.halo.op,
    depthWrite: false,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(def.r * def.halo.scale, 16, 16), haloMat));

  // ── Ring ───────────────────────────────────────────────────
  let ringMat = null;
  if (def.ring) {
    ringMat = new THREE.MeshBasicMaterial({
      color: def.ring.col,
      transparent: true,
      opacity: def.ring.op,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(def.ring.inner, def.ring.outer, 80),
      ringMat
    );
    ringMesh.rotation.x = def.ring.rx;
    ringMesh.rotation.z = def.ring.rz;
    group.add(ringMesh);
  }

  scene.add(group);

  planetObjects.push({
    group,
    mat, glowMat, haloMat, ringMat,
    baseX:    def.x,
    baseY:    def.y,
    baseGlowOp: def.glow.op,
    baseHaloOp: def.halo.op,
    baseRingOp: def.ring ? def.ring.op : null,
    float:    def.float,
    rotSpd:   def.rotSpd,
  });
});

// ─── Scroll State ────────────────────────────────────────────
let scrollProgress = 0;
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max > 0) scrollProgress = Math.min(window.scrollY / max, 1);
}, { passive: true });

// ─── Resize ──────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Render Loop ─────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  const t  = clock.getElapsedTime();
  const sp = scrollProgress;

  // Stars — identical scroll behaviour to original
  particles.rotation.y = t * 0.045 + sp * Math.PI * 1.5;
  particles.rotation.x = t * 0.022 + sp * Math.PI * 0.4;
  starMat.opacity = Math.max(0.55, 0.92 - sp * 0.35);

  // Camera pull-back on scroll (same as original)
  camera.position.z = 6 + sp * 4;
  camera.position.y = sp * 1.2;

  // Planets — float, rotate, spread outward, fade on scroll
  const planetFade = Math.max(0, 1 - sp * 2.4);

  planetObjects.forEach((po) => {
    const { group, mat, glowMat, haloMat, ringMat, baseX, baseY, float: fl, rotSpd } = po;

    // Gentle sinusoidal float
    const floatY = Math.sin(t * fl.spd + fl.off) * fl.amp;

    // Planets drift outward as user scrolls — gives sense of depth expanding
    group.position.x = baseX * (1 + sp * 0.38);
    group.position.y = baseY * (1 + sp * 0.28) + floatY;

    // Slow continuous self-rotation
    group.rotation.y = t * rotSpd.y;
    group.rotation.x = t * rotSpd.x;

    // Fade out with scroll (mirrors how network faded)
    if (planetFade <= 0.001) {
      group.visible = false;
    } else {
      group.visible   = true;
      mat.opacity     = planetFade;
      glowMat.opacity = po.baseGlowOp * planetFade;
      haloMat.opacity = po.baseHaloOp * planetFade;
      if (ringMat) ringMat.opacity = po.baseRingOp * planetFade;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
