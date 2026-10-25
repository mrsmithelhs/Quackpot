/**
 * @file build-plan-04-preview.mjs
 * Bounded build and derivation helper for Plan 04 SVG rig and sound preview gallery.
 *
 * Enforces single source of truth:
 * 1. Derives `src/assets/svg/duck-rig.svg` directly from `src/core/duck-rig.mjs`.
 * 2. Compiles `src/core/duck-rig.mjs` and `src/audio/synth.mjs` into standalone browser bundles via Vite.
 * 3. Pre-renders gallery instances using the authoritative composer functions.
 * 4. Generates a standalone, source-backed review page `reports/development/plan-04-svg-rig-and-sound/preview.html`.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { build } from 'vite';

import {
  PALETTES,
  HATS,
  ACCESSORIES,
  SHADOW_MODES,
  composeDuckSvg,
  getCanonicalMasterSvg
} from '../../src/core/duck-rig.mjs';

import {
  QUACK_SHORT,
  validateSoundParams,
  calculateDuration
} from '../../src/audio/synth.mjs';

function computeSha256(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getGitRevision() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (_) {
    return 'uncommitted';
  }
}

async function bundleModuleToIife(entryPath, globalName) {
  const result = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: false,
      lib: {
        entry: entryPath,
        formats: ['iife'],
        name: globalName
      }
    }
  });

  const bundle = Array.isArray(result) ? result[0] : result;
  return `${bundle.output[0].code}\nif (typeof window !== 'undefined') { window.${globalName} = ${globalName}; }\n`;
}

const PROOF_SET = [
  { prefix: 'combo-1', name: 'Classic Gentleman', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'monocle' },
  { prefix: 'combo-2', name: 'Naval Mallard', palette: 'mallard-green', hat: 'sailor-cap', accessory: 'bow-tie' },
  { prefix: 'combo-3', name: 'Festive Pink', palette: 'bubblegum-pink', hat: 'tiny-top-hat', accessory: 'bow-tie' },
  { prefix: 'combo-4', name: 'Pink Seafarer', palette: 'bubblegum-pink', hat: 'sailor-cap', accessory: 'monocle' },
  { prefix: 'base-yellow', name: 'Classic Yellow Base', palette: 'classic-yellow', hat: 'none', accessory: 'none' },
  { prefix: 'base-mallard', name: 'Mallard Green Base', palette: 'mallard-green', hat: 'none', accessory: 'none' }
];

export async function buildPlan04AssetsAndPreview() {
  const rootDir = process.cwd();
  const duckRigPath = path.resolve(rootDir, 'src/core/duck-rig.mjs');
  const synthPath = path.resolve(rootDir, 'src/audio/synth.mjs');
  const masterSvgPath = path.resolve(rootDir, 'src/assets/svg/duck-rig.svg');
  const previewHtmlPath = path.resolve(rootDir, 'reports/development/plan-04-svg-rig-and-sound/preview.html');

  // 1. Authoritative Vector Derivation: write master SVG directly from source composer
  const masterSvgContent = getCanonicalMasterSvg();
  fs.mkdirSync(path.dirname(masterSvgPath), { recursive: true });
  fs.writeFileSync(masterSvgPath, masterSvgContent, 'utf8');

  // 2. Hash source modules
  const duckRigHash = computeSha256(duckRigPath);
  const synthHash = computeSha256(synthPath);
  const gitRevision = getGitRevision();
  const buildDate = new Date().toISOString();

  // 3. Compile source modules to IIFE bundles
  const duckRigBundle = await bundleModuleToIife(duckRigPath, 'DuckRig');
  const synthBundle = await bundleModuleToIife(synthPath, 'DuckSynth');

  // 4. Pre-render initial gallery markup directly using the imported source composer
  const preRenderedDiagnostic = composeDuckSvg({
    prefix: 'gallery-demo',
    palette: 'classic-yellow',
    hat: 'tiny-top-hat',
    accessory: 'monocle',
    shadowMode: 'offset'
  });

  const preRenderedScale32 = composeDuckSvg({ prefix: 'scale-32', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'bow-tie', shadowMode: 'offset' });
  const preRenderedScale64 = composeDuckSvg({ prefix: 'scale-64', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'bow-tie', shadowMode: 'offset' });
  const preRenderedScale128 = composeDuckSvg({ prefix: 'scale-128', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'bow-tie', shadowMode: 'offset' });
  const preRenderedScale256 = composeDuckSvg({ prefix: 'scale-256', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'bow-tie', shadowMode: 'offset' });

  const preRenderedProofCards = PROOF_SET.map(item => `
        <div class="gallery-card">
          <div class="gallery-duck-box bg-dark" id="box-${item.prefix}">
            <div class="duck-wrapper duck-128" id="container-${item.prefix}">
              ${composeDuckSvg({ ...item, shadowMode: 'offset' })}
            </div>
          </div>
          <div class="gallery-info">
            <div class="gallery-name">${item.name}</div>
            <div class="gallery-meta">Palette: ${item.palette}</div>
            <div class="gallery-meta">Hat: ${item.hat} | Acc: ${item.accessory}</div>
            <div class="gallery-meta">Instance Prefix: <code>${item.prefix}</code></div>
          </div>
        </div>`).join('\n');

  // 5. Generate Standalone Source-Backed Preview HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plan 04 — Source-Backed SVG Duck Rig & Synthesized Sound Gallery</title>
  <style>
    :root {
      --bg-dark: #0f172a;
      --bg-light: #f8fafc;
      --bg-pond: #0284c7;
      --panel-bg: #1e293b;
      --panel-border: #334155;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0ea5e9;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      padding: 24px;
      line-height: 1.5;
    }

    header {
      max-width: 1200px;
      margin: 0 auto 24px auto;
      border-bottom: 1px solid var(--panel-border);
      padding-bottom: 16px;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      background: #0284c7;
      color: #ffffff;
    }

    .provenance-tag {
      font-size: 0.72rem;
      background: #334155;
      color: #38bdf8;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    .subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 6px;
    }

    .provenance-bar {
      margin-top: 10px;
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      background: #0b1329;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #1e293b;
    }

    .controls-bar {
      max-width: 1200px;
      margin: 0 auto 24px auto;
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .control-group label {
      color: var(--text-muted);
      font-weight: 600;
    }

    select, button {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    select:hover, button:hover {
      border-color: var(--accent);
    }

    button.primary {
      background: #0284c7;
      border-color: #0284c7;
      font-weight: 600;
    }

    button.primary:hover {
      background: var(--accent-hover);
    }

    .main-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section-card {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 20px;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    .duck-stage {
      border-radius: 6px;
      padding: 20px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 180px;
    }

    .duck-stage.bg-dark { background-color: var(--bg-dark); }
    .duck-stage.bg-light { background-color: var(--bg-light); color: #0f172a; }
    .duck-stage.bg-pond { background-color: var(--bg-pond); }

    .scale-row {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      align-items: flex-end;
      justify-content: center;
      width: 100%;
    }

    .scale-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .scale-label {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--text-muted);
    }

    .duck-stage.bg-light .scale-label { color: #64748b; }

    .duck-wrapper { display: flex; align-items: center; justify-content: center; }
    .duck-32  { width: 32px; height: 32px; }
    .duck-64  { width: 64px; height: 64px; }
    .duck-128 { width: 128px; height: 128px; }
    .duck-256 { width: 256px; height: 256px; }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .gallery-card {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .gallery-duck-box {
      width: 140px;
      height: 140px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gallery-duck-box.bg-dark { background-color: var(--bg-dark); }
    .gallery-duck-box.bg-light { background-color: var(--bg-light); }
    .gallery-duck-box.bg-pond { background-color: var(--bg-pond); }

    .gallery-info { width: 100%; font-size: 0.8rem; }
    .gallery-name { font-weight: 600; color: #ffffff; margin-bottom: 4px; }
    .gallery-meta { color: var(--text-muted); font-size: 0.75rem; }

    .sound-box { display: flex; flex-direction: column; gap: 16px; }
    .sound-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .sound-status {
      font-size: 0.85rem;
      padding: 4px 10px;
      border-radius: 4px;
      background: #0f172a;
      border: 1px solid var(--panel-border);
      font-family: monospace;
    }

    .param-spec {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 12px 16px;
      font-family: monospace;
      font-size: 0.8rem;
      color: #38bdf8;
      overflow-x: auto;
    }

    .head-tilt-active #gallery-demo-head-group {
      transform-origin: 48px 46px;
      transform: rotate(12deg);
      transition: transform 0.2s ease;
    }

    .wing-flap-active #gallery-demo-wing-group {
      transform-origin: 52px 56px;
      transform: rotate(-18deg);
      transition: transform 0.2s ease;
    }
  </style>
</head>
<body>

  <header>
    <h1>
      Plan 04: SVG Duck Rig & Sound Spike
      <span class="badge">E2 Paper-Cut Rig</span>
      <span class="provenance-tag">Source-Backed</span>
    </h1>
    <p class="subtitle">
      Bounded proof of the owner-selected E2 layered-paper digital gacha rig, motion-ready hierarchy, and parameter-synthesized sound.
    </p>
    <div class="provenance-bar">
      <span><strong>Build checkout HEAD:</strong> ${gitRevision} (may include local edits; module hashes identify source content)</span>
      <span><strong>duck-rig.mjs SHA-256:</strong> ${duckRigHash.slice(0, 12)}...</span>
      <span><strong>synth.mjs SHA-256:</strong> ${synthHash.slice(0, 12)}...</span>
      <span><strong>Build Date:</strong> ${buildDate}</span>
    </div>
  </header>

  <!-- Global Visual Controls -->
  <div class="controls-bar">
    <div class="control-group">
      <label for="bg-select">Stage Ground:</label>
      <select id="bg-select" onchange="updateStageBackground(this.value)">
        <option value="bg-dark" selected>Dark Ground (#0F172A)</option>
        <option value="bg-light">Light Ground (#F8FAFC)</option>
        <option value="bg-pond">Pond Blue (#0284C7)</option>
      </select>
    </div>

    <div class="control-group">
      <label for="shadow-select">Shadow Mode (re-renders via DuckRig):</label>
      <select id="shadow-select" onchange="updateShadowMode(this.value)">
        <option value="offset" selected>Flat Offset Paper Shadows</option>
        <option value="filter">SVG &lt;feDropShadow&gt; Filter</option>
        <option value="none">No Shadows (Pure Silhouette)</option>
      </select>
    </div>

    <div class="control-group">
      <label>Static Motion Diagnostics:</label>
      <button onclick="toggleHeadTilt()">Toggle Head Tilt (12°)</button>
      <button onclick="toggleWingFlap()">Toggle Wing Paddle (-18°)</button>
    </div>
  </div>

  <div class="main-container">

    <!-- 1. Motion-Ready Hierarchy & Attachment Diagnostic -->
    <section class="section-card">
      <div class="section-title">
        <span>1. Motion-Ready Hierarchy & Attachment Points</span>
        <span class="scale-label">Parent-relative local coordinates</span>
      </div>
      <p class="section-desc">
        Hat attachment resides inside the head group so head transforms automatically carry the hat. Monocle attaches to the eye group. Bow tie attaches to the body neck slot. Wing sublayers rotate around a common pivot (52, 56).
      </p>

      <div class="duck-stage bg-dark" id="stage-diagnostic">
        <div class="scale-row">
          <div class="scale-item">
            <div class="duck-wrapper duck-256" id="diagnostic-duck-container">
              ${preRenderedDiagnostic}
            </div>
            <span class="scale-label">Interactive Rig (256px)</span>
          </div>
          <div class="scale-item" style="max-width: 480px; align-items: flex-start;">
            <div class="param-spec" style="width: 100%;">
              <strong>Authoritative Layer & Anchor Contract:</strong><br>
              • [Head Group] pivot: (48, 46)<br>
              &nbsp;&nbsp;├── Head base & shadow<br>
              &nbsp;&nbsp;├── Bill group (upper, lower, crease)<br>
              &nbsp;&nbsp;├── [Eye Group] pivot: (40, 33)<br>
              &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── [Slot Eye] Monocle @ (40, 33)<br>
              &nbsp;&nbsp;└── [Slot Hat] Tiny Top Hat / Sailor Cap @ (46, 22)<br>
              • [Body Group]:<br>
              &nbsp;&nbsp;├── Tail base & shadow<br>
              &nbsp;&nbsp;├── Body base & shadow<br>
              &nbsp;&nbsp;├── [Wing Group] common pivot: (52, 56)<br>
              &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── Wing under-feather<br>
              &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── Wing mid-layer<br>
              &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── Wing top-layer<br>
              &nbsp;&nbsp;└── [Slot Neck] Bow Tie @ (41, 60)
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Small-Scale Readability (32px, 64px, 128px, 256px) -->
    <section class="section-card">
      <div class="section-title">
        <span>2. Small-Scale Readability & Contrast Test</span>
        <span class="scale-label">32px / 64px / 128px / 256px</span>
      </div>
      <p class="section-desc">
        Comparing silhouette and detail down to thumbnail sizes across the chosen stage background. Flat offset shadows maintain crisp edges at 32px without raster blur.
      </p>

      <div class="duck-stage bg-dark" id="stage-scale">
        <div class="scale-row">
          <div class="scale-item">
            <div class="duck-wrapper duck-32" id="scale-32">${preRenderedScale32}</div>
            <span class="scale-label">32px icon</span>
          </div>
          <div class="scale-item">
            <div class="duck-wrapper duck-64" id="scale-64">${preRenderedScale64}</div>
            <span class="scale-label">64px avatar</span>
          </div>
          <div class="scale-item">
            <div class="duck-wrapper duck-128" id="scale-128">${preRenderedScale128}</div>
            <span class="scale-label">128px card</span>
          </div>
          <div class="scale-item">
            <div class="duck-wrapper duck-256" id="scale-256">${preRenderedScale256}</div>
            <span class="scale-label">256px dialog</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Exact Proof Set: Multi-Instance Combinations in Single DOM -->
    <section class="section-card">
      <div class="section-title">
        <span>3. Exact Proof Set & Multi-Instance DOM Isolation</span>
        <span class="scale-label">3 Palettes × 2 Hats × 2 Accessories</span>
      </div>
      <p class="section-desc">
        Rendered simultaneously in one DOM using authoritative <code>DuckRig.composeDuckSvg()</code>. All IDs and filter URLs are strictly namespaced by instance prefix.
      </p>

      <div class="gallery-grid" id="gallery-grid">
${preRenderedProofCards}
      </div>
    </section>

    <!-- 4. Parameter-Synthesized Sound Spike (QUACK_SHORT) -->
    <section class="section-card">
      <div class="section-title">
        <span>4. Synthesized Sound Prototype (<code>QUACK_SHORT</code>)</span>
        <span class="scale-label">Source-backed via DuckSynth</span>
      </div>
      <p class="section-desc">
        Executed via <code>DuckSynth.playSynthesizedSound()</code> directly from <code>src/audio/synth.mjs</code>. Demonstrates lazy user-gesture unlocking, conservative gain (0.15 peak), and silent fallback when audio hardware or context is absent.
      </p>

      <div class="sound-box">
        <div class="sound-row">
          <button class="primary" onclick="triggerQuackSound()">🔊 Play QUACK_SHORT via DuckSynth</button>
          <button onclick="testSilentFallback()">Simulate Silent Fallback</button>
          <span class="sound-status" id="audio-status">Status: Waiting for user gesture</span>
        </div>

        <div class="param-spec">
          <strong>Text-Stored Parameter Contract (synth.mjs):</strong><br>
          const QUACK_SHORT = Object.freeze({<br>
          &nbsp;&nbsp;name: 'QUACK_SHORT',<br>
          &nbsp;&nbsp;waveform: 'sawtooth',&nbsp;&nbsp;&nbsp;&nbsp;// Rich harmonic foundation<br>
          &nbsp;&nbsp;frequency: 340,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 340 Hz base fundamental<br>
          &nbsp;&nbsp;pitchBend: -140,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// -140 Hz downward chirp sweep<br>
          &nbsp;&nbsp;attack: 0.02,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 20ms attack ramp<br>
          &nbsp;&nbsp;decay: 0.12,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 120ms decay ramp<br>
          &nbsp;&nbsp;sustain: 0.05,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Low sustain floor<br>
          &nbsp;&nbsp;release: 0.08,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 80ms release ramp (Total: 0.22s)<br>
          &nbsp;&nbsp;modulationFreq: 22,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 22 Hz nasal resonance<br>
          &nbsp;&nbsp;modulationDepth: 35,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Modulation depth<br>
          &nbsp;&nbsp;gain: 0.15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Conservative peak gain (avoids blasting)<br>
          });
        </div>
      </div>
    </section>

  </div>

  <!-- Inlined Source Bundles (Derived directly from src/core/duck-rig.mjs and src/audio/synth.mjs) -->
  <script id="bundle-duck-rig">
${duckRigBundle}
  </script>
  <script id="bundle-duck-synth">
${synthBundle}
  </script>

  <!-- Interactive Gallery Controller (Invokes DuckRig and DuckSynth directly) -->
  <script>
    let currentShadowMode = 'offset';

    const PROOF_SET = [
      { prefix: 'combo-1', name: 'Classic Gentleman', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'monocle' },
      { prefix: 'combo-2', name: 'Naval Mallard', palette: 'mallard-green', hat: 'sailor-cap', accessory: 'bow-tie' },
      { prefix: 'combo-3', name: 'Festive Pink', palette: 'bubblegum-pink', hat: 'tiny-top-hat', accessory: 'bow-tie' },
      { prefix: 'combo-4', name: 'Pink Seafarer', palette: 'bubblegum-pink', hat: 'sailor-cap', accessory: 'monocle' },
      { prefix: 'base-yellow', name: 'Classic Yellow Base', palette: 'classic-yellow', hat: 'none', accessory: 'none' },
      { prefix: 'base-mallard', name: 'Mallard Green Base', palette: 'mallard-green', hat: 'none', accessory: 'none' }
    ];

    function updateStageBackground(bgClass) {
      ['stage-diagnostic', 'stage-scale'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'duck-stage ' + bgClass;
      });
      document.querySelectorAll('.gallery-duck-box').forEach(box => {
        box.className = 'gallery-duck-box ' + bgClass;
      });
    }

    function updateShadowMode(mode) {
      currentShadowMode = mode;
      // Re-render diagnostic duck using DuckRig.composeDuckSvg from the source bundle
      document.getElementById('diagnostic-duck-container').innerHTML = window.DuckRig.composeDuckSvg({
        prefix: 'gallery-demo',
        palette: 'classic-yellow',
        hat: 'tiny-top-hat',
        accessory: 'monocle',
        shadowMode: currentShadowMode
      });

      // Re-render scale ducks using DuckRig.composeDuckSvg
      ['scale-32', 'scale-64', 'scale-128', 'scale-256'].forEach(id => {
        document.getElementById(id).innerHTML = window.DuckRig.composeDuckSvg({
          prefix: id,
          palette: 'classic-yellow',
          hat: 'tiny-top-hat',
          accessory: 'bow-tie',
          shadowMode: currentShadowMode
        });
      });

      // Re-render permutation cards using DuckRig.composeDuckSvg
      PROOF_SET.forEach(item => {
        const container = document.getElementById('container-' + item.prefix);
        if (container) {
          container.innerHTML = window.DuckRig.composeDuckSvg({
            ...item,
            shadowMode: currentShadowMode
          });
        }
      });
    }

    function toggleHeadTilt() {
      const container = document.getElementById('diagnostic-duck-container');
      container.classList.toggle('head-tilt-active');
    }

    function toggleWingFlap() {
      const container = document.getElementById('diagnostic-duck-container');
      container.classList.toggle('wing-flap-active');
    }

    async function triggerQuackSound() {
      const statusEl = document.getElementById('audio-status');
      statusEl.textContent = 'Status: Playing via DuckSynth.playSynthesizedSound()...';

      try {
        // Calls the authoritative DuckSynth module
        const result = await window.DuckSynth.playSynthesizedSound();
        if (result.played) {
          statusEl.textContent = 'Status: Played (' + result.name + ', ' + result.duration.toFixed(2) + 's, gain ' + result.gain + ')';
          statusEl.style.color = '#4ade80';
        } else {
          statusEl.textContent = 'Status: Fallback triggered (' + result.reason + ', fallback: ' + result.fallback + ')';
          statusEl.style.color = '#f59e0b';
        }
      } catch (err) {
        statusEl.textContent = 'Status: Error (' + err.message + ')';
        statusEl.style.color = '#f87171';
      }
    }

    async function testSilentFallback() {
      const statusEl = document.getElementById('audio-status');
      // Force fallback by providing a dummy non-functional audio context
      const result = await window.DuckSynth.playSynthesizedSound(window.DuckSynth.QUACK_SHORT, {
        audioContext: { state: 'suspended', resume: async () => {} }
      });
      statusEl.textContent = 'Status: Verified silent fallback -> ' + JSON.stringify(result);
      statusEl.style.color = '#38bdf8';
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(previewHtmlPath, htmlContent, 'utf8');

  return {
    masterSvgPath,
    previewHtmlPath,
    duckRigHash,
    synthHash,
    gitRevision,
    buildDate
  };
}

// Allow CLI invocation
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/dev/build-plan-04-preview.mjs')) {
  buildPlan04AssetsAndPreview()
    .then(meta => {
      console.log('Successfully built Plan 04 assets and preview gallery:');
      console.log(`- Master SVG: ${meta.masterSvgPath}`);
      console.log(`- Preview HTML: ${meta.previewHtmlPath}`);
      console.log(`- duck-rig.mjs SHA-256: ${meta.duckRigHash.slice(0, 16)}...`);
      console.log(`- synth.mjs SHA-256: ${meta.synthHash.slice(0, 16)}...`);
    })
    .catch(err => {
      console.error('Error building Plan 04 preview:', err);
      process.exit(1);
    });
}
