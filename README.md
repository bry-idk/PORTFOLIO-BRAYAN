# Brayan Marín Ampudia — Digital Interaction Portfolio (2026)

Interactive bilingual (**EN / ES**) creative technology portfolio built from Brayan Marín Ampudia's official materials (`portfolio pag 1.pdf`, `pdf portfolio completo.pdf`, `link behance.txt`, and project media folders).

## Highlights

- **Persistent WebGL / GLSL Canvas (`Three.js` + `@react-three/fiber`)**: Domain-warped FBM fluid atmosphere, subtle editorial halftone dot framing, interactive 3D Fresnel Memory Prism sculpture, and cursor/touch-reactive particle field whose palette morphs smoothly per project chapter.
- **5 Differentiated Interactive GLSL Project Labs**:
  1. **01 · Crónicas de Palenque**: Volumetric Ray-Tracing & Bioluminescent Canopy Shader + Unity 6 showcase reels & ordered gallery.
  2. **02 · Kane no Hibiki (鐘の響き)**: Live Ultrasonic Proximity & Simulated OSC Façade Simulator (`0.4m – 6.0m`) modulating GLSL ukiyo-e waves and sakura brilliance + architectural calibration BTS.
  3. **03 · SOGNO**: Interactive LiDAR Spatial Depth-Scan & AR Holographic Wireframe Lens + dual SOGNO / SOGNO 2 showcase & reels.
  4. **04 · Notas y Colores**: Web Audio Polyphonic 4-Lane Synth (`D`, `F`, `J`, `K` or click/touch) driving real-time GLSL chromatic frequency pulses.
  5. **05 · The Amazing Digital Circus 2**: Retro-Digital CRT Scanline & RGB Glitch LookDev Shader + elastic 3D character rig cutouts & P29 gallery.
- **Bilingual Fidelity (`EN` / `ES`)**: Preserves exact English copy from `portfolio pag 1.pdf` and `pdf portfolio completo.pdf` alongside faithful Spanish translations, including all 13 Career Overview entries, 7 Education credentials, 4 Software Skill categories, 5 Awards, and exact Behance gallery URL.

## Project Structure

- `src/data/profileData.ts` — Official Bio, Contact, Career Overview, Education, Languages, Software Skills, and Awards.
- `src/data/projectsData.ts` — Strictly ordered 5 projects (01–05) matching `pdf portfolio completo.pdf` (pages 4–29).
- `src/shaders/` — Custom GLSL vertex and fragment shaders (`atmosphereShader.ts`, `projectLabShaders.ts`).
- `src/components/webgl/` — Persistent `ExperienceCanvas.tsx` and 5-mode `InteractiveProjectLab.tsx`.
- `public/media/` — Web-optimized WebP images (alpha-preserved cutouts/logos) and H.264 `+faststart` cropped MP4 videos (original source folders and PDFs remain untouched).

## Running Locally

```bash
npm install
npm run dev
```

## Build & Verification

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

## Deploying to GitHub & Netlify

This folder is pre-configured for direct push to GitHub and automatic deployment on Netlify:

- **`.gitignore` (GitHub-safe)**: Automatically ignores `node_modules/`, `dist/`, build caches (`*.tsbuildinfo`), and the raw source folders/PDFs (`pdf portfolio completo.pdf` is >100 MB, which GitHub rejects). All web-optimized images and videos live inside `public/media/` (~52.6 MB total, largest file ~23.1 MB), while your original source files remain untouched locally.
- **`netlify.toml` (Netlify-ready)**: Configures `npm run build`, publish directory `dist`, Node 20, SPA redirects (`/* -> /index.html`), security headers, and immutable caching for `/assets/*` and `/media/*`.

### Push to GitHub

```bash
git init
git add .
git commit -m "feat: interactive WebGL/GLSL portfolio 2026"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

### Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → **GitHub**.
2. Select your repository. Netlify will automatically read `netlify.toml` (`Build command: npm run build`, `Publish directory: dist`).
3. Click **Deploy site**.
