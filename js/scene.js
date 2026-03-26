// scene.js — SureClick Three.js Background
// Particle field + wireframe icosahedron in brand colors

import * as THREE from 'three';

// ─── Renderer ────────────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x060c16, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// ─── Scene & Camera ──────────────────────────────────────────
const scene  = new THREE.Scene();
scene.fog    = new THREE.FogExp2(0x060c16, 0.055);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 6);

// ─── Particles ───────────────────────────────────────────────
const COUNT = 2200;
const positions = new Float32Array(COUNT * 3);
const colors    = new Float32Array(COUNT * 3);

const cPrimary = new THREE.Color('#0e62ad');
const cAccent  = new THREE.Color('#5cc6ff');
const cDeep    = new THREE.Color('#061430');

for (let i = 0; i < COUNT; i++) {
  // Spherical shell distribution — two shells for depth
  const shell  = Math.random() > 0.35 ? 1 : 0;
  const radius = shell === 1
    ? 3.2 + Math.random() * 3.5
    : 1.4 + Math.random() * 1.2;

  const theta  = Math.random() * Math.PI * 2;
  const phi    = Math.acos(2 * Math.random() - 1);

  positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);

  // Colour: gradient from deep → primary → accent
  const t   = Math.random();
  const col = t < 0.5
    ? cDeep.clone().lerp(cPrimary, t * 2)
    : cPrimary.clone().lerp(cAccent, (t - 0.5) * 2);

  colors[i * 3]     = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;
}

const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

const pMat = new THREE.PointsMaterial({
  size:           0.016,
  vertexColors:   true,
  sizeAttenuation: true,
  transparent:    true,
  opacity:        0.85,
  depthWrite:     false
});

const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ─── Central Icosahedron (wireframe) ─────────────────────────
const icoGeo = new THREE.IcosahedronGeometry(1.25, 2);

const icoWireMat = new THREE.MeshBasicMaterial({
  color:       0x0e62ad,
  wireframe:   true,
  transparent: true,
  opacity:     0.28
});
const icoWire = new THREE.Mesh(icoGeo, icoWireMat);
scene.add(icoWire);

// Inner glow fill
const icoFillMat = new THREE.MeshBasicMaterial({
  color:       0x5cc6ff,
  transparent: true,
  opacity:     0.04
});
const icoFill = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.22, 2),
  icoFillMat
);
scene.add(icoFill);

// ─── Orbit Ring ──────────────────────────────────────────────
const ringGeo = new THREE.TorusGeometry(2.1, 0.004, 16, 120);
const ringMat = new THREE.MeshBasicMaterial({
  color:       0x5cc6ff,
  transparent: true,
  opacity:     0.35
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2.8;
scene.add(ring);

// Second ring (tilted differently)
const ring2 = ring.clone();
ring2.rotation.x = Math.PI / 1.5;
ring2.rotation.z = Math.PI / 4;
const ring2Mat = new THREE.MeshBasicMaterial({
  color:       0x0e62ad,
  transparent: true,
  opacity:     0.2
});
ring2.material = ring2Mat;
scene.add(ring2);

// ─── Scroll State ────────────────────────────────────────────
let scrollProgress = 0;

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) {
    scrollProgress = Math.min(window.scrollY / maxScroll, 1);
  }
}, { passive: true });

// ─── Resize ──────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Clock & Render Loop ─────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  const sp = scrollProgress;

  // Ambient rotation
  particles.rotation.y  = t * 0.045 + sp * Math.PI * 1.5;
  particles.rotation.x  = t * 0.022 + sp * Math.PI * 0.4;
  icoWire.rotation.y    = t * 0.14;
  icoWire.rotation.x    = t * 0.09;
  icoFill.rotation.y    = t * 0.14;
  icoFill.rotation.x    = t * 0.09;
  ring.rotation.z       = t * 0.07;
  ring2.rotation.y      = t * 0.05;

  // Scroll effects: camera pulls back, particles fade slightly
  camera.position.z = 6 + sp * 4;
  camera.position.y = sp * 1.2;
  pMat.opacity      = Math.max(0.25, 0.85 - sp * 0.55);
  icoWireMat.opacity = Math.max(0.05, 0.28 - sp * 0.22);

  // Subtle breathing scale on icosahedron
  const breathe = 1 + Math.sin(t * 0.8) * 0.025;
  icoWire.scale.setScalar(breathe);
  icoFill.scale.setScalar(breathe);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
