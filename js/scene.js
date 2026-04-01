// scene.js — SureClick Three.js Background
// Node network (digital connectivity) + galaxy particle field

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
const scene = new THREE.Scene();
scene.fog   = new THREE.FogExp2(0x060c16, 0.042);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.set(0, 0, 6);

// ─── Particles (galaxy field) ─────────────────────────────────
const COUNT = 3400;
const positions = new Float32Array(COUNT * 3);
const colors    = new Float32Array(COUNT * 3);

const cPrimary = new THREE.Color('#0e62ad');
const cAccent  = new THREE.Color('#5cc6ff');
const cDeep    = new THREE.Color('#061430');
const cWhite   = new THREE.Color('#a8c8f0');

for (let i = 0; i < COUNT; i++) {
  const rand = Math.random();

  // Three shells: inner cluster, mid-field, deep outer field
  let radius;
  if (rand < 0.15) {
    radius = 1.4 + Math.random() * 1.2;           // inner
  } else if (rand < 0.65) {
    radius = 3.2 + Math.random() * 4.0;           // mid
  } else {
    radius = 8.0 + Math.random() * 10.0;          // deep outer — visible as page scrolls
  }

  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);

  positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);

  // Colour gradient: deep → primary → accent → near-white for distant stars
  const t   = Math.random();
  let col;
  if (t < 0.33) {
    col = cDeep.clone().lerp(cPrimary, t * 3);
  } else if (t < 0.66) {
    col = cPrimary.clone().lerp(cAccent, (t - 0.33) * 3);
  } else {
    col = cAccent.clone().lerp(cWhite, (t - 0.66) * 3);
  }

  colors[i * 3]     = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;
}

const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

const pMat = new THREE.PointsMaterial({
  size:            0.016,
  vertexColors:    true,
  sizeAttenuation: true,
  transparent:     true,
  opacity:         0.88,
  depthWrite:      false
});

const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ─── Node Network (central element) ──────────────────────────
// Represents digital connectivity — web, marketing, SureClick brand
const networkGroup = new THREE.Group();
scene.add(networkGroup);

// [x, y, z, radius, colorHex, glowOpacity]
const NODE_DEFS = [
  [  0.0,  0.0,  0.0,  0.13, 0x5cc6ff, 0.12 ],  // 0: central hub
  [  1.8,  0.5,  0.3,  0.07, 0x0e62ad, 0.07 ],   // 1
  [ -1.6,  0.7, -0.4,  0.06, 0x5cc6ff, 0.06 ],   // 2
  [  0.5, -1.8,  0.7,  0.08, 0x0e62ad, 0.07 ],   // 3
  [ -0.9, -1.3, -1.0,  0.06, 0x5cc6ff, 0.06 ],   // 4
  [  1.3,  1.3, -0.8,  0.07, 0x0e62ad, 0.07 ],   // 5
  [ -1.7, -0.5,  0.5,  0.07, 0x5cc6ff, 0.06 ],   // 6
  [  0.2,  1.7,  0.6,  0.06, 0x0e62ad, 0.06 ],   // 7
];

const nodeMeshes = [];
const haloMeshes = [];
// Store {material, baseOpacity} for smooth fade
const networkMaterials = [];

NODE_DEFS.forEach(([x, y, z, r, col, glowOp]) => {
  // Core node sphere
  const geo = new THREE.SphereGeometry(r, 14, 14);
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  networkGroup.add(mesh);
  nodeMeshes.push(mesh);
  networkMaterials.push({ mat, base: 0.9 });

  // Outer glow halo
  const haloGeo = new THREE.SphereGeometry(r * 2.4, 14, 14);
  const haloMat = new THREE.MeshBasicMaterial({
    color:       col,
    transparent: true,
    opacity:     glowOp,
    depthWrite:  false
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.set(x, y, z);
  networkGroup.add(halo);
  haloMeshes.push(halo);
  networkMaterials.push({ mat: haloMat, base: glowOp });
});

// Connection lines between nodes
const CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  [1, 5], [2, 6], [3, 4], [5, 7], [1, 7], [2, 4], [3, 6]
];

const lineVerts = [];
CONNECTIONS.forEach(([a, b]) => {
  const [ax, ay, az] = NODE_DEFS[a];
  const [bx, by, bz] = NODE_DEFS[b];
  lineVerts.push(ax, ay, az, bx, by, bz);
});

const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));

const lineMat = new THREE.LineBasicMaterial({
  color:       0x0e62ad,
  transparent: true,
  opacity:     0.3,
  depthWrite:  false
});

const networkLines = new THREE.LineSegments(lineGeo, lineMat);
networkGroup.add(networkLines);

// ─── Orbit Rings ─────────────────────────────────────────────
const ringGeo  = new THREE.TorusGeometry(2.1, 0.004, 16, 120);
const ringMat  = new THREE.MeshBasicMaterial({ color: 0x5cc6ff, transparent: true, opacity: 0.3 });
const ring     = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2.8;
scene.add(ring);

const ring2    = ring.clone();
ring2.rotation.x = Math.PI / 1.5;
ring2.rotation.z = Math.PI / 4;
const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x0e62ad, transparent: true, opacity: 0.18 });
ring2.material = ring2Mat;
scene.add(ring2);

// ─── Scroll State ────────────────────────────────────────────
let scrollProgress = 0;

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) scrollProgress = Math.min(window.scrollY / maxScroll, 1);
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
  const t  = clock.getElapsedTime();
  const sp = scrollProgress;

  // Particle rotation — original scroll animation
  particles.rotation.y = t * 0.045 + sp * Math.PI * 1.5;
  particles.rotation.x = t * 0.022 + sp * Math.PI * 0.4;

  // Node network rotation
  networkGroup.rotation.y = t * 0.12;
  networkGroup.rotation.x = t * 0.07;

  // Pulse: central node halo breathes
  const pulse = 1 + Math.sin(t * 1.2) * 0.18;
  if (haloMeshes[0]) haloMeshes[0].scale.setScalar(pulse);

  // Orbit rings
  ring.rotation.z  = t * 0.07;
  ring2.rotation.y = t * 0.05;

  // Scroll: camera pulls back, particles maintain visibility
  camera.position.z = 6 + sp * 4;
  camera.position.y = sp * 1.2;
  pMat.opacity      = Math.max(0.25, 0.85 - sp * 0.55);

  // Network: smooth gradual fade as user scrolls down
  const netFade = Math.max(0, 1 - sp * 2.8);
  networkMaterials.forEach(({ mat, base }) => {
    mat.opacity = base * netFade;
  });
  // Also fade lines (base opacity fluctuates, so apply fade on top)
  lineMat.opacity = (0.22 + Math.sin(t * 0.9) * 0.10) * netFade;
  networkGroup.visible = netFade > 0.001;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
