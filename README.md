# Omar Mohd Haris — Portfolio

A cozy 3D portfolio built with plain HTML/CSS/JS and Three.js. Inspired by [room.bokoko33.me](https://room.bokoko33.me/).

## What's here

```
.
├── index.html          ← homepage with 3D desk scene
├── about.html          ← personal story + toolkit
├── projects.html       ← Lightcast + past work
├── resume.html         ← formatted resume + PDF download
├── contact.html        ← email / GitHub / LinkedIn
├── css/
│   └── style.css       ← all styling + day/night theme
├── js/
│   ├── scene.js        ← Three.js cozy desk scene
│   └── nav.js          ← shared nav + theme persistence
├── assets/
│   └── OmarMohdHaris_Resume.pdf   ← (add your own)
└── README.md
```

No build step. No package manager. Just files.

---

## Setup (one-time)

### 1. Clean out the old Quarto project

Your current `omarmohdharis.github.io` repo is set up for Quarto. We're replacing it with this static site, so you need to remove the Quarto-specific stuff. **Back up the repo first** (`git clone` to a safe spot, or just zip it).

From your repo root, delete:

```
_quarto.yml
index.qmd
about.qmd
_site/
pyproject.toml
poetry.lock
requirements.txt
.github/workflows/     ← if it has Quarto-specific actions
```

Keep `.gitignore`, `README.md` (you'll replace it), and the `images/` folder if you want to reuse any.

### 2. Drop this project in

Copy every file from this portfolio zip **into the root** of your `omarmohdharis.github.io` repo. Your repo root should end up looking like the tree above.

### 3. Add your resume PDF

Export your resume as PDF and save it to `assets/OmarMohdHaris_Resume.pdf`. The download button on `resume.html` points there.

### 4. (Optional) Add a real photo to the frame

The "framed photo" on the desk is a placeholder color right now. To show an actual image, edit `js/scene.js` — find the `frameInner` mesh and replace it with:

```js
const tex = new THREE.TextureLoader().load('assets/me.jpg');
tex.colorSpace = THREE.SRGBColorSpace;
const frameInner = new THREE.Mesh(
  new THREE.PlaneGeometry(0.75, 0.95),
  new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })
);
```

Drop `me.jpg` into `assets/`.

---

## Local development

Open two terminals in VS Code.

**Preview locally** — because the site uses ES module imports, you need a local server (opening `index.html` directly will fail with CORS errors).

Easiest option: install the **Live Server** VS Code extension, right-click `index.html` → "Open with Live Server."

Or from the terminal:

```bash
# Python (built in on most systems)
python3 -m http.server 8000

# then open http://localhost:8000
```

---

## Deployment (GitHub Pages)

Your repo is already a GitHub Pages repo (`username.github.io`). Just:

```bash
git add .
git commit -m "Rebuild portfolio as 3D static site"
git push
```

In ~30 seconds it'll be live at `https://omarmohdharis.github.io`.

If Pages isn't publishing: go to repo **Settings → Pages** → confirm **Branch** is `main` and **Folder** is `/ (root)`.

---

## Customizing

### Colors / theme
Open `css/style.css` — the top block under `:root` and `[data-theme="night"]` has all the colors. Change `--accent` to pick a different highlight hue.

### 3D scene objects
All objects live in `js/scene.js`. Each clickable item has a `userData.target` that defines where it navigates. To add a new object:

1. Build a `new THREE.Group()` or `Mesh`
2. Position it on the desk (`y = 1.55` is the desk surface)
3. Set `userData = { target: 'somepage.html', label: 'Label' }`
4. Push it to `clickables`

### Day/night defaults
Starting theme is whatever's saved in localStorage, falling back to `day`. To change the default, edit the line `let currentTheme = localStorage.getItem('theme') || 'day';` in `scene.js`.

### Fonts
Loaded from Google Fonts at the top of `style.css`. Current pairing: Fraunces (display serif) + Inter Tight (body) + JetBrains Mono (code/labels).

---

## Tech notes

- **Three.js r160** loaded via CDN (`jsdelivr`).
- Uses ES modules + an import map so `import * as THREE from 'three'` works natively.
- Click-to-navigate uses raycasting against a `clickables` array of root groups.
- Theme state persists in `localStorage` across pages.
- The desk lamp is both a point light (casts a warm shadow at night) and a clickable object (toggles the theme).
- Shadows use `PCFSoftShadowMap` for soft edges; the sun is a `DirectionalLight` that dims at night.
- Page fades use simple `opacity` transitions on `body` — snappy but noticeable.

---

## A note on AWS

You mentioned wanting to host on AWS. For a static portfolio, **GitHub Pages is the right choice** — free, automatic, instant deploys on push, and your repo is already set up for it. AWS (S3 + CloudFront) is great if you later need custom infrastructure, but adds cost and setup complexity with no visible benefit here. If you ever need to migrate, it's a ~15-minute job (upload files to an S3 bucket, front with CloudFront). Happy to walk you through that when/if you need it.
