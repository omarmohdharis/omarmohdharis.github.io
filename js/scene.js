/* =====================================================
   Cozy Desk Scene — Three.js
   Japanese box lamp · About card · Steam mug
   With bokoko-style intro animation + orbit constraints
   ===================================================== */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// -------- Scene setup --------
const canvas = document.getElementById('scene-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40, window.innerWidth / window.innerHeight, 0.1, 100
);

const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// -------- Orbit controls (constrained, bokoko-style) --------
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enableZoom = false;

// Vertical: prevent looking from too high or too low
controls.minPolarAngle = Math.PI / 3.2;   // can't look straight down
controls.maxPolarAngle = Math.PI / 2.15;  // can't dip below desk level

// Horizontal: lock to a small arc around the front-3/4 view
// Resting position is azimuth = PI/4 (45°). Allow ~25° each direction.
controls.minAzimuthAngle = Math.PI / 4 - Math.PI / 7;
controls.maxAzimuthAngle = Math.PI / 4 + Math.PI / 7;

controls.autoRotate = false;
controls.target.set(0, 1.4, 0);

// -------- Intro animation state --------
const restingCam = new THREE.Vector3(5.0, 4.0, 5.0);   // where camera ends up
const introStartCam = new THREE.Vector3(9, 9, 9);       // where camera flies in from
let introDone = false;
const introStartTime = performance.now();

// Snap camera to intro start before first render
camera.position.copy(introStartCam);

// Disable user controls until intro finishes
controls.enabled = false;

// -------- Theme state --------
const THEMES = {
  day: {
    bg: 0xf4ede1,
    ambient: 0xfff5e0,
    ambientIntensity: 0.85,
    sun: 0xffe4b0,
    sunIntensity: 1.2,
    lamp: 0xffc87a,
    lampIntensity: 0,
    fogColor: 0xf4ede1,
    fogNear: 15, fogFar: 35,
    screen: 0x88ccff,
    screenEmissive: 0.2,
  },
  night: {
    bg: 0x1c1b22,
    ambient: 0x7a6f65,
    ambientIntensity: 0.45,
    sun: 0x8f7c68,
    sunIntensity: 0.35,
    lamp: 0xffb35c,
    lampIntensity: 1.65,
    fogColor: 0x1c1b22,
    fogNear: 13, fogFar: 32,
    screen: 0x7ccfff,
    screenEmissive: 0.55,
  },
};

let currentTheme = localStorage.getItem('theme') || 'day';
scene.fog = new THREE.Fog(
  THEMES[currentTheme].fogColor,
  THEMES[currentTheme].fogNear,
  THEMES[currentTheme].fogFar
);

// -------- Lighting --------
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(-5, 8, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -6;
sun.shadow.camera.right = 6;
sun.shadow.camera.top = 6;
sun.shadow.camera.bottom = -6;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 20;
sun.shadow.bias = -0.0005;
scene.add(sun);

const lamp = new THREE.PointLight(0xffa747, 0, 8, 1.6);
lamp.position.set(-1.3, 2.3, 0.4);
lamp.castShadow = true;
lamp.shadow.mapSize.set(1024, 1024);
scene.add(lamp);

// -------- Materials --------
const mat = {
  wood:      new THREE.MeshStandardMaterial({ color: 0xa07555, roughness: 0.85 }),
  darkWood:  new THREE.MeshStandardMaterial({ color: 0x6b4a30, roughness: 0.9 }),
  metal:     new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.7 }),
  brass:     new THREE.MeshStandardMaterial({ color: 0xc9a262, roughness: 0.3, metalness: 0.8 }),
  plastic:   new THREE.MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.6 }),
  ceramic:   new THREE.MeshStandardMaterial({ color: 0xe8d9b8, roughness: 0.3 }),
  accent:    new THREE.MeshStandardMaterial({ color: 0xc2571a, roughness: 0.6 }),
  paper:     new THREE.MeshStandardMaterial({ color: 0xfaf5ea, roughness: 0.9 }),
  leaf:      new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.8 }),
  floor:     new THREE.MeshStandardMaterial({ color: 0xd9cfbf, roughness: 0.95 }),
  wall:      new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 1 }),
  shade:     new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.8, side: THREE.DoubleSide }),
  screenOff: new THREE.MeshStandardMaterial({ color: 0x111, roughness: 0.2 }),
  screenOn:  new THREE.MeshStandardMaterial({
    color: 0x1a2340, emissive: 0x4fb8ff, emissiveIntensity: 0.9, roughness: 0.2
  }),
};

// -------- Room (floor + back/side walls) --------
const room = new THREE.Group();
scene.add(room);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat.floor);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
room.add(floor);

const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), mat.wall);
wallBack.position.set(0, 4, -7);
wallBack.receiveShadow = true;
room.add(wallBack);

const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), mat.wall);
wallLeft.position.set(-7, 4, 0);
wallLeft.rotation.y = Math.PI / 2;
wallLeft.receiveShadow = true;
room.add(wallLeft);

// -------- Build the desk --------
const desk = new THREE.Group();
desk.position.set(0, 0, -1);
scene.add(desk);

const top = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 2.2), mat.wood);
top.position.y = 1.5;
top.castShadow = true;
top.receiveShadow = true;
desk.add(top);

for (const [x, z] of [[-2.1, -0.95], [2.1, -0.95], [-2.1, 0.95], [2.1, 0.95]]) {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.5, 0.12), mat.darkWood);
  leg.position.set(x, 0.75, z);
  leg.castShadow = true;
  desk.add(leg);
}

// -------- Clickable objects --------
const clickables = [];

// -------- Helper: text-on-canvas texture (for the about card / notebook label) --------
function makeTextTexture({
  title = '',
  subtitle = '',
  width = 512,
  height = 512,
  titleSize = 64,
  subtitleSize = 28,
  bg = '#f7f1e6',
  fg = '#2a241d',
  accent = '#c2571a',
  border = '#d7c7ae'
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = border;
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${titleSize}px Georgia`;
  ctx.fillText(title, width / 2, height / 2 - 20);

  if (subtitle) {
    ctx.fillStyle = accent;
    ctx.font = `${subtitleSize}px Arial`;
    ctx.fillText(subtitle, width / 2, height / 2 + 45);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* --- LAPTOP → projects --- */
const laptop = new THREE.Group();
laptop.position.set(0.7, 1.59, -0.2);
laptop.rotation.y = -0.3;
desk.add(laptop);

const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.85), mat.metal);
laptopBase.castShadow = true;
laptop.add(laptopBase);

const laptopScreen = new THREE.Group();
laptopScreen.position.set(0, 0.02, -0.42);
laptopScreen.rotation.x = -0.5;
laptop.add(laptopScreen);

const screenBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.03), mat.metal);
screenBack.position.y = 0.37;
screenBack.castShadow = true;
laptopScreen.add(screenBack);

const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.68), mat.screenOn);
screenFace.position.set(0, 0.37, 0.02);
laptopScreen.add(screenFace);

laptop.userData = { target: 'projects.html', label: 'Projects' };
clickables.push(laptop);

/* --- NOTEBOOK → resume --- */
const notebook = new THREE.Group();
notebook.position.set(-1.3, 1.56, 0.3);
notebook.rotation.y = 0.15;
desk.add(notebook);

const nbCover = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1.2), mat.accent);
nbCover.castShadow = true;
notebook.add(nbCover);

const nbPages = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.04, 1.12), mat.paper);
nbPages.position.y = 0.05;
notebook.add(nbPages);

const resumeTex = makeTextTexture({
  title: 'Resume',
  subtitle: 'view details',
  titleSize: 88,
  subtitleSize: 28,
  width: 512,
  height: 700,
  bg: '#fbf7ee',
  fg: '#1f1b17',
  accent: '#8a8278',
  border: '#e0d3bf'
});

const resumeLabel = new THREE.Mesh(
  new THREE.PlaneGeometry(0.68, 0.95),
  new THREE.MeshStandardMaterial({ map: resumeTex, roughness: 0.95 })
);
resumeLabel.position.set(0, 0.091, 0);
resumeLabel.rotation.x = -Math.PI / 2;
notebook.add(resumeLabel);

notebook.userData = { target: 'resume.html', label: 'Resume' };
clickables.push(notebook);

/* --- ABOUT CARD → about --- */
const aboutCard = new THREE.Group();
aboutCard.position.set(-1.95, 1.56, -0.68);
desk.add(aboutCard);

const aboutBase = new THREE.Mesh(
  new THREE.BoxGeometry(0.58, 0.05, 0.18),
  mat.darkWood
);
aboutBase.castShadow = true;
aboutCard.add(aboutBase);

const aboutSupport = new THREE.Mesh(
  new THREE.BoxGeometry(0.06, 0.26, 0.08),
  mat.darkWood
);
aboutSupport.position.set(0, 0.13, -0.03);
aboutSupport.castShadow = true;
aboutCard.add(aboutSupport);

const aboutTex = makeTextTexture({
  title: 'About',
  subtitle: 'click to enter',
  titleSize: 92,
  subtitleSize: 30,
  width: 512,
  height: 700,
  bg: '#f7f1e6',
  fg: '#2a241d',
  accent: '#c2571a',
  border: '#dbcbb5'
});

const aboutFace = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 0.68),
  new THREE.MeshStandardMaterial({ map: aboutTex, roughness: 0.95 })
);
aboutFace.position.set(0, 0.5, 0.045);
aboutFace.rotation.x = -0.08;
aboutCard.add(aboutFace);

const aboutBack = new THREE.Mesh(
  new THREE.BoxGeometry(0.52, 0.7, 0.04),
  mat.paper
);
aboutBack.position.set(0, 0.5, 0);
aboutBack.castShadow = true;
aboutCard.add(aboutBack);

aboutCard.userData = { target: 'about.html', label: 'About me' };
clickables.push(aboutCard);

/* --- COFFEE CUP → contact --- */
const mug = new THREE.Group();
mug.position.set(1.72, 1.56, 0.45);
desk.add(mug);

const saucer = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.27, 0.025, 32),
  mat.ceramic
);
saucer.position.y = 0.012;
saucer.receiveShadow = true;
mug.add(saucer);

const mugBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.16, 0.13, 0.26, 32, 1, false),
  mat.ceramic
);
mugBody.position.y = 0.15;
mugBody.castShadow = true;
mug.add(mugBody);

const coffee = new THREE.Mesh(
  new THREE.CylinderGeometry(0.125, 0.125, 0.015, 24),
  new THREE.MeshStandardMaterial({ color: 0x4a2b1a, roughness: 0.25 })
);
coffee.position.y = 0.275;
mug.add(coffee);

// Steam
const steamMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.12,
  roughness: 1
});

function makeSteam(xOffset) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(xOffset, 0.30, 0),
    new THREE.Vector3(xOffset + 0.01, 0.40, 0.01),
    new THREE.Vector3(xOffset - 0.01, 0.52, -0.005),
    new THREE.Vector3(xOffset + 0.01, 0.64, 0.01)
  ]);
  const steam = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 20, 0.010, 8, false),
    steamMat
  );
  mug.add(steam);
}
makeSteam(-0.025);
makeSteam(0);
makeSteam(0.025);

mug.userData = { target: 'contact.html', label: 'Contact' };
clickables.push(mug);

/* --- JAPANESE BOX LAMP → toggle theme --- */
const deskLamp = new THREE.Group();
deskLamp.position.set(-1.2, 1.55, -0.65);
desk.add(deskLamp);

const lampBase = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.05, 0.42),
  mat.darkWood
);
lampBase.castShadow = true;
lampBase.receiveShadow = true;
deskLamp.add(lampBase);

const postGeo = new THREE.BoxGeometry(0.035, 0.6, 0.035);
const postOffsets = [
  [-0.15, 0.325, -0.15],
  [ 0.15, 0.325, -0.15],
  [-0.15, 0.325,  0.15],
  [ 0.15, 0.325,  0.15]
];
postOffsets.forEach(([x, y, z]) => {
  const post = new THREE.Mesh(postGeo, mat.darkWood);
  post.position.set(x, y, z);
  post.castShadow = true;
  deskLamp.add(post);
});

const lampTop = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.05, 0.42),
  mat.darkWood
);
lampTop.position.y = 0.65;
lampTop.castShadow = true;
deskLamp.add(lampTop);

const paperMat = new THREE.MeshStandardMaterial({
  color: 0xf5e6c8,
  roughness: 0.95,
  transparent: true,
  opacity: 0.92,
  emissive: 0xffa747,
  emissiveIntensity: 0
});

const paperBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.32, 0.5, 0.32),
  paperMat
);
paperBox.position.y = 0.35;
paperBox.castShadow = true;
deskLamp.add(paperBox);

// Shoji slats
const slatGeoX = new THREE.BoxGeometry(0.34, 0.015, 0.015);
const slatGeoZ = new THREE.BoxGeometry(0.015, 0.015, 0.34);
[0.2, 0.35, 0.5].forEach((y) => {
  const slatFront = new THREE.Mesh(slatGeoX, mat.darkWood);
  slatFront.position.set(0, y, 0.161);
  deskLamp.add(slatFront);

  const slatBack = new THREE.Mesh(slatGeoX, mat.darkWood);
  slatBack.position.set(0, y, -0.161);
  deskLamp.add(slatBack);

  const slatLeft = new THREE.Mesh(slatGeoZ, mat.darkWood);
  slatLeft.position.set(-0.161, y, 0);
  deskLamp.add(slatLeft);

  const slatRight = new THREE.Mesh(slatGeoZ, mat.darkWood);
  slatRight.position.set(0.161, y, 0);
  deskLamp.add(slatRight);
});

const bulb = new THREE.Mesh(
  new THREE.SphereGeometry(0.08, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xfff2cc,
    emissive: 0xffa747,
    emissiveIntensity: 0
  })
);
bulb.position.y = 0.35;
deskLamp.add(bulb);

const lampHitbox = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.75, 0.42),
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false
  })
);
lampHitbox.position.set(0, 0.36, 0);
deskLamp.add(lampHitbox);

deskLamp.userData = { target: '__toggle__', label: 'Night mode' };
clickables.push(deskLamp);

/* --- PLANT (decorative, non-clickable) --- */
const plant = new THREE.Group();
plant.position.set(2.0, 1.5, -0.6);
desk.add(plant);

const pot = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.18, 0.3, 20),
  new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.9 })
);
pot.position.y = 0.15;
pot.castShadow = true;
plant.add(pot);

for (let i = 0; i < 7; i++) {
  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 8),
    mat.leaf
  );
  leaf.scale.set(1, 2.2, 0.4);
  const angle = (i / 7) * Math.PI * 2;
  leaf.position.set(
    Math.cos(angle) * 0.12,
    0.45 + Math.random() * 0.2,
    Math.sin(angle) * 0.12
  );
  leaf.rotation.z = Math.cos(angle) * 0.3;
  leaf.rotation.x = Math.sin(angle) * 0.3;
  leaf.castShadow = true;
  plant.add(leaf);
}

// -------- Pop-in setup for intro animation --------
// Every clickable + the desk + the plant pop in. Floor and walls stay static
// (popping the floor would be too jarring).
const popInObjects = [...clickables, plant];

const introTargets = popInObjects.map((obj, i) => {
  const original = obj.scale.clone();
  obj.scale.set(0.001, 0.001, 0.001);  // start invisible
  return { obj, original, delay: 0.6 + i * 0.18 };  // stagger 180ms each
});

// Constants for intro timing
const CAM_DURATION = 1800;  // ms — camera fly-in length
const POP_DURATION = 600;   // ms — each object's pop-in length

// Easing functions
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Updates intro every frame — called from animate()
function updateIntro() {
  const elapsed = performance.now() - introStartTime;

  // 1. Camera fly-in
  if (elapsed < CAM_DURATION) {
    const t = easeOutCubic(elapsed / CAM_DURATION);
    camera.position.lerpVectors(introStartCam, restingCam, t);
  } else if (!introDone) {
    camera.position.copy(restingCam);
    controls.enabled = true;
    introDone = true;
  }

  // 2. Object pop-ins (run in parallel with camera)
  introTargets.forEach(({ obj, original, delay }) => {
    const objElapsed = elapsed - delay * 1000;
    if (objElapsed < 0) return;
    if (objElapsed >= POP_DURATION) {
      obj.scale.copy(original);
      return;
    }
    const t = easeOutBack(objElapsed / POP_DURATION);
    obj.scale.set(original.x * t, original.y * t, original.z * t);
  });
}

// -------- Raycasting for hover & click --------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById('scene-tooltip');
let hovered = null;

function onPointerMove(e) {
  // Use canvas bounding rect (works correctly when canvas is half-screen on mobile)
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(clickables, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj.parent && !obj.userData.target) obj = obj.parent;
    if (obj.userData.target) {
      hovered = obj;
      canvas.style.cursor = 'pointer';
      if (tooltip) {
        tooltip.textContent = obj.userData.label;
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
        tooltip.classList.add('visible');
      }
      return;
    }
  }
  hovered = null;
  canvas.style.cursor = 'grab';
  if (tooltip) tooltip.classList.remove('visible');
}

function onClick() {
  if (!introDone) return;  // ignore clicks during intro
  if (hovered && hovered.userData.target) {
    if (hovered.userData.target === '__toggle__') {
      toggleTheme();
    } else {
      document.body.style.transition = 'opacity 0.4s';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = hovered.userData.target; }, 350);
    }
  }
}

canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('click', onClick);

// -------- Theme transitions --------
function applyTheme(theme, instant = false) {
  const t = THEMES[theme];
  const duration = instant ? 0 : 1200;
  const start = performance.now();

  const fromBg = scene.background instanceof THREE.Color ? scene.background.clone() : new THREE.Color(0xf4ede1);
  const toBg = new THREE.Color(t.bg);
  const fromFogColor = scene.fog.color.clone();
  const toFogColor = new THREE.Color(t.fogColor);
  const fromAmbInt = ambient.intensity;
  const fromSunInt = sun.intensity;
  const fromLampInt = lamp.intensity;
  const fromFogNear = scene.fog.near;
  const fromFogFar = scene.fog.far;
  const fromBulbEm = bulb.material.emissiveIntensity;
  const fromScreenEm = mat.screenOn.emissiveIntensity;
  const fromPaperEm = paperBox.material.emissiveIntensity;

  ambient.color.set(t.ambient);
  sun.color.set(t.sun);
  lamp.color.set(t.lamp);
  bulb.material.emissive.set(t.lamp);
  mat.screenOn.emissive.set(t.screen);

  function step(now) {
    const p = instant ? 1 : Math.min((now - start) / duration, 1);
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    scene.background = fromBg.clone().lerp(toBg, ease);
    scene.fog.color.copy(fromFogColor.clone().lerp(toFogColor, ease));
    scene.fog.near = fromFogNear + (t.fogNear - fromFogNear) * ease;
    scene.fog.far = fromFogFar + (t.fogFar - fromFogFar) * ease;
    ambient.intensity = fromAmbInt + (t.ambientIntensity - fromAmbInt) * ease;
    sun.intensity = fromSunInt + (t.sunIntensity - fromSunInt) * ease;
    lamp.intensity = fromLampInt + (t.lampIntensity - fromLampInt) * ease;
    bulb.material.emissiveIntensity = fromBulbEm + (t.lampIntensity * 0.6 - fromBulbEm) * ease;
    paperBox.material.emissiveIntensity = fromPaperEm + ((t.lampIntensity > 0 ? 0.22 : 0) - fromPaperEm) * ease;
    mat.screenOn.emissiveIntensity = fromScreenEm + (t.screenEmissive - fromScreenEm) * ease;

    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  currentTheme = theme;
}

function toggleTheme() {
  applyTheme(currentTheme === 'day' ? 'night' : 'day');
}
window.toggleTheme = toggleTheme;

// Apply initial theme instantly
scene.background = new THREE.Color(THEMES[currentTheme].bg);
applyTheme(currentTheme, true);

// -------- Responsive viewport & camera --------
function getViewport() {
  const isMobile = window.innerWidth <= 768;
  const isLandscapeShort = window.innerHeight <= 500 && window.innerWidth > window.innerHeight;

  if (isMobile && !isLandscapeShort) {
    return {
      width: window.innerWidth,
      height: window.innerHeight * 0.5,
      mobile: true,
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    mobile: false,
  };
}

function applyResponsiveCamera() {
  const v = getViewport();

  if (v.mobile) {
    camera.fov = 48;
    restingCam.set(4.6, 3.6, 4.6);
    controls.target.set(0, 1.5, 0);
  } else {
    camera.fov = 40;
    restingCam.set(5.0, 4.0, 5.0);
    controls.target.set(0, 1.4, 0);
  }

  // Only snap to resting if intro is finished (otherwise let it animate)
  if (introDone) {
    camera.position.copy(restingCam);
  }

  camera.aspect = v.width / v.height;
  camera.updateProjectionMatrix();
  renderer.setSize(v.width, v.height);
}

window.addEventListener('resize', applyResponsiveCamera);
window.addEventListener('orientationchange', () => {
  setTimeout(applyResponsiveCamera, 200);
});
applyResponsiveCamera();

// -------- Animate --------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateIntro();

  // Lamp bulb position sync
  const pos = new THREE.Vector3();
  bulb.getWorldPosition(pos);
  lamp.position.copy(pos);

  renderer.render(scene, camera);
}
animate();

// Hide loader once first frame is rendered
requestAnimationFrame(() => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
  }, 400);
});