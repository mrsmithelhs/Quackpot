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
  PAPER_MODES,
  composeDuckSvg,
  getCanonicalMasterSvg
} from '../../src/core/duck-rig.mjs';

import {
  QUACK_A_CONTROL,
  QUACK_B_SYNTH_ADSR,
  QUACK_C_FORMANT_NOISE,
  QUACK_CANDIDATES,
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

  // 4. Pre-render matched A/B/C paper construction comparison on yellow base
  const renderScaleSet = (modePrefix, modeName) => ({
    s32: composeDuckSvg({ prefix: `${modePrefix}-32`, palette: 'classic-yellow', hat: 'none', accessory: 'none', paperMode: modeName }),
    s64: composeDuckSvg({ prefix: `${modePrefix}-64`, palette: 'classic-yellow', hat: 'none', accessory: 'none', paperMode: modeName }),
    s128: composeDuckSvg({ prefix: `${modePrefix}-128`, palette: 'classic-yellow', hat: 'none', accessory: 'none', paperMode: modeName }),
    s256: composeDuckSvg({ prefix: `${modePrefix}-256`, palette: 'classic-yellow', hat: 'none', accessory: 'none', paperMode: modeName })
  });

  const modeA = renderScaleSet('mode-a', 'baseline');
  const modeB = renderScaleSet('mode-b', 'geometric');
  const modeC = renderScaleSet('mode-c', 'hybrid');

  // Pre-render diagnostic rig
  const preRenderedDiagnostic = composeDuckSvg({
    prefix: 'gallery-demo',
    palette: 'classic-yellow',
    hat: 'tiny-top-hat',
    accessory: 'monocle',
    paperMode: 'geometric'
  });

  // Pre-render permutation proof set
  const preRenderedProofCards = PROOF_SET.map(item => `
        <div class="gallery-card">
          <div class="gallery-duck-box bg-dark" id="box-${item.prefix}">
            <div class="duck-wrapper duck-128" id="container-${item.prefix}">
              ${composeDuckSvg({ ...item, paperMode: 'geometric' })}
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
  <title>Plan 04 — E2 Layered Paper & Quack Audition Gallery</title>
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

    /* Comparison Grid */
    .compare-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-top: 12px;
    }

    .compare-card {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .compare-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 8px;
    }

    .compare-title {
      font-weight: 700;
      color: #ffffff;
      font-size: 0.95rem;
    }

    .compare-tag {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 3px;
      background: #1e293b;
      color: var(--accent);
      font-family: monospace;
    }

    .compare-notes {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .duck-stage {
      border-radius: 6px;
      padding: 16px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 140px;
    }

    .duck-stage.bg-dark { background-color: var(--bg-dark); }
    .duck-stage.bg-light { background-color: var(--bg-light); color: #0f172a; }
    .duck-stage.bg-pond { background-color: var(--bg-pond); }

    .scale-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-end;
      justify-content: center;
      width: 100%;
    }

    .scale-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .scale-label {
      font-size: 0.72rem;
      font-family: monospace;
      color: var(--text-muted);
    }

    .duck-stage.bg-light .scale-label { color: #64748b; }

    .duck-wrapper { display: flex; align-items: center; justify-content: center; }
    .duck-32  { width: 32px; height: 32px; }
    .duck-64  { width: 64px; height: 64px; }
    .duck-128 { width: 128px; height: 128px; }
    .duck-256 { width: 256px; height: 256px; }

    /* Gallery Grid */
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

    /* Audition Cards */
    .audition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 12px;
    }

    .audition-card {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .audition-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .audition-title {
      font-weight: 700;
      color: #ffffff;
      font-size: 0.95rem;
    }

    .audition-tag {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 3px;
      background: #1e293b;
      color: var(--accent);
      font-family: monospace;
    }

    .audition-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .param-spec {
      background: #0b1329;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 10px 14px;
      font-family: monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      overflow-x: auto;
      white-space: pre;
    }

    .sound-status {
      font-size: 0.85rem;
      padding: 4px 10px;
      border-radius: 4px;
      background: #0f172a;
      border: 1px solid var(--panel-border);
      font-family: monospace;
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
      Plan 04: E2 Layered Paper & Quack Audition
      <span class="badge">Source-Backed</span>
      <span class="provenance-tag">Refinement 01</span>
    </h1>
    <p class="subtitle">
      Owner refinement: visible paper construction comparison (Modes A/B/C) and quack candidate audition (A/B/C).
    </p>
    <div class="provenance-bar">
      <span><strong>Build checkout HEAD:</strong> ${gitRevision}</span>
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
      <label>Static Motion Diagnostics:</label>
      <button onclick="toggleHeadTilt()">Toggle Head Tilt (12°)</button>
      <button onclick="toggleWingFlap()">Toggle Wing Paddle (-18°)</button>
    </div>

    <div class="control-group">
      <span class="sound-status" id="audio-status">Audio: Waiting for user gesture</span>
    </div>
  </div>

  <div class="main-container">

    <!-- 1. Matched Paper Construction Comparison (A / B / C) -->
    <section class="section-card">
      <div class="section-title">
        <span>1. Matched Paper Construction Comparison (Unadorned Classic Yellow Base)</span>
        <span class="scale-label">32px silhouette / 64px / 128px / 256px seam inspection</span>
      </div>
      <p class="section-desc">
        Directly compares the delivered baseline (A), stronger geometric paper separation with stepped wing sublayers and seam contact shadows (B), and B plus restrained localized soft seam shadows (C).
      </p>

      <div class="compare-grid">

        <!-- Mode A: Baseline Control -->
        <div class="compare-card">
          <div class="compare-header">
            <span class="compare-title">Mode A: Baseline Control</span>
            <span class="compare-tag">Historical Control</span>
          </div>
          <p class="compare-notes">
            Delivered baseline snapshot. Flatter paper profile with nearly coincident mid/top wing contours and broad painted body shadow.
          </p>
          <div class="duck-stage bg-dark" id="stage-mode-a">
            <div class="scale-row">
              <div class="scale-item"><div class="duck-wrapper duck-32">${modeA.s32}</div><span class="scale-label">32px</span></div>
              <div class="scale-item"><div class="duck-wrapper duck-64">${modeA.s64}</div><span class="scale-label">64px</span></div>
              <div class="scale-item"><div class="duck-wrapper duck-128">${modeA.s128}</div><span class="scale-label">128px</span></div>
            </div>
          </div>
          <div class="duck-stage bg-dark" style="margin-top: 8px;">
            <div class="scale-item"><div class="duck-wrapper duck-256">${modeA.s256}</div><span class="scale-label">256px Inspection</span></div>
          </div>
        </div>

        <!-- Mode B: Strong Geometric Paper Separation -->
        <div class="compare-card" style="border-color: #38bdf8;">
          <div class="compare-header">
            <span class="compare-title">Mode B: Geometric Paper Separation</span>
            <span class="compare-tag" style="background: #0284c7; color: #fff;">Authoritative Base</span>
          </div>
          <p class="compare-notes">
            <strong>Key Paper Elements:</strong><br>
            • 3 Stepped Wing Pieces: Under-wing (dark base), Mid-wing (intermediate tone, 4u step), Top-wing (bright card, 3u step) with bottom contact shadow.<br>
            • Backing Cardstock Rims: Exposed bottom-right edges on body and head skull.<br>
            • Seam Shadows: Crisp contact shadows at head-to-body, wing-to-body, and bill-to-cheek joins. Zero filter overhead.
          </p>
          <div class="duck-stage bg-dark" id="stage-mode-b">
            <div class="scale-row">
              <div class="scale-item"><div class="duck-wrapper duck-32">${modeB.s32}</div><span class="scale-label">32px</span></div>
              <div class="scale-item"><div class="duck-wrapper duck-64">${modeB.s64}</div><span class="scale-label">64px</span></div>
              <div class="scale-item"><div class="duck-wrapper duck-128">${modeB.s128}</div><span class="scale-label">128px</span></div>
            </div>
          </div>
          <div class="duck-stage bg-dark" style="margin-top: 8px;">
            <div class="scale-item"><div class="duck-wrapper duck-256">${modeB.s256}</div><span class="scale-label">256px Inspection</span></div>
          </div>
        </div>

        <!-- Mode C: Restrained Hybrid -->
        <div class="compare-card">
          <div class="compare-header">
            <span class="compare-title">Mode C: Restrained Hybrid</span>
            <span class="compare-tag">Mode B + Local Seam Shadows</span>
          </div>
          <p class="compare-notes">
            Mode B geometric paper construction PLUS subtle, localized soft contact shadows (stdDeviation 0.8) placed *specifically* at the head, wing, and bill joins (no whole-duck halo or plastic gradients).
          </p>
          <div class="duck-stage bg-dark" id="stage-mode-c">
            <div class="scale-row">
              <div class="scale-item"><div class="duck-wrapper duck-32">${modeC.s32}</div><span class="scale-label">32px</span></div>
              <div class="scale-item"><div class="duck-wrapper duck-64">${modeC.s64}</div><span class="scale-label">64px</span></div>
              <div class="scale-item"><div class="duck-wrapper duck-128">${modeC.s128}</div><span class="scale-label">128px</span></div>
            </div>
          </div>
          <div class="duck-stage bg-dark" style="margin-top: 8px;">
            <div class="scale-item"><div class="duck-wrapper duck-256">${modeC.s256}</div><span class="scale-label">256px Inspection</span></div>
          </div>
        </div>

      </div>
    </section>

    <!-- 2. Quack Sound Audition (Candidates A / B / C) -->
    <section class="section-card">
      <div class="section-title">
        <span>2. Sound Audition: Quack Candidates (A / B / C)</span>
        <span class="scale-label">One-click replay at level-matched perceived volume</span>
      </div>
      <p class="section-desc">
        Proposes two new treatments of the quack effect alongside the baseline control. Owner auditions and selects by listening.
      </p>

      <div class="audition-grid">

        <!-- Candidate A -->
        <div class="audition-card">
          <div class="audition-header">
            <span class="audition-title">Candidate A: Baseline Control</span>
            <span class="audition-tag">QUACK_A_CONTROL</span>
          </div>
          <p class="audition-desc">
            Unchanged baseline. 340 Hz sawtooth with whole-duration -140 Hz downward linear glide and 22 Hz sine FM modulator. Reads as a retro electronic synth sweep.
          </p>
          <button class="primary" onclick="playCandidate('QUACK_A_CONTROL')">🔊 Audition Candidate A</button>
          <div class="param-spec">{
  waveform: 'sawtooth',
  frequency: 340,
  pitchBend: -140, // Whole glide
  attack: 0.02, decay: 0.12,
  sustain: 0.05, release: 0.08,
  modulationFreq: 22, depth: 35,
  gain: 0.15
}</div>
        </div>

        <!-- Candidate B -->
        <div class="audition-card">
          <div class="audition-header">
            <span class="audition-title">Candidate B: Articulated ADSR</span>
            <span class="audition-tag">QUACK_B_SYNTH_ADSR</span>
          </div>
          <p class="audition-desc">
            Parameter-only revision within existing oscillator/envelope graph. Removes continuous siren slide and modulation; uses snappy 5ms attack and 40ms release.
          </p>
          <button class="primary" onclick="playCandidate('QUACK_B_SYNTH_ADSR')">🔊 Audition Candidate B</button>
          <div class="param-spec">{
  waveform: 'sawtooth',
  frequency: 380,
  pitchBend: -40,  // Gentle bend
  attack: 0.005, decay: 0.06,
  sustain: 0.15, release: 0.04,
  modulationFreq: 0, depth: 0,
  gain: 0.14
}</div>
        </div>

        <!-- Candidate C -->
        <div class="audition-card" style="border-color: #38bdf8;">
          <div class="audition-header">
            <span class="audition-title">Candidate C: Formants & Breath</span>
            <span class="audition-tag" style="background: #0284c7; color: #fff;">Source-Filter</span>
          </div>
          <p class="audition-desc">
            Small source-filter graph: buzzy carrier + deterministic 15ms breath burst routed through parallel bandpass formant filters (~750 Hz and ~1600 Hz).
          </p>
          <button class="primary" onclick="playCandidate('QUACK_C_FORMANT_NOISE')">🔊 Audition Candidate C</button>
          <div class="param-spec">{
  waveform: 'sawtooth', freq: 300,
  noiseDuration: 0.015, noiseGain: 0.12,
  formant1: 750 Hz (Q 3.0, gain 0.85),
  formant2: 1600 Hz (Q 3.5, gain 0.65),
  attack: 0.01, decay: 0.08,
  gain: 0.15 // Calibrated level
}</div>
        </div>

      </div>
    </section>

    <!-- 3. Motion-Ready Hierarchy & Attachment Diagnostic -->
    <section class="section-card">
      <div class="section-title">
        <span>3. Motion-Ready Hierarchy & Attachment Diagnostics</span>
        <span class="scale-label">Mode B Authoritative Rig</span>
      </div>
      <p class="section-desc">
        Verifies parent-relative pivots: 12° head tilt carries the hat and monocle; -18° wing paddle articulates all three stepped wing sublayers around common pivot (52, 56).
      </p>

      <div class="duck-stage bg-dark" id="stage-diagnostic">
        <div class="scale-row">
          <div class="scale-item">
            <div class="duck-wrapper duck-256" id="diagnostic-duck-container">
              ${preRenderedDiagnostic}
            </div>
            <span class="scale-label">Interactive Rig (256px Mode B)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Existing Permutation Proof Set (Mode B) -->
    <section class="section-card">
      <div class="section-title">
        <span>4. Existing Permutation Proof Set (Mode B Geometric Paper Rig)</span>
        <span class="scale-label">3 Palettes × 2 Hats × 2 Accessories</span>
      </div>
      <p class="section-desc">
        All accepted palettes and cosmetic items rendered with the authoritative geometric paper rig.
      </p>

      <div class="gallery-grid" id="gallery-grid">
${preRenderedProofCards}
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

  <!-- Interactive Gallery Controller -->
  <script>
    function updateStageBackground(bgClass) {
      ['stage-mode-a', 'stage-mode-b', 'stage-mode-c', 'stage-diagnostic'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'duck-stage ' + bgClass;
      });
      document.querySelectorAll('.gallery-duck-box').forEach(box => {
        box.className = 'gallery-duck-box ' + bgClass;
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

    async function playCandidate(candidateId) {
      const statusEl = document.getElementById('audio-status');
      statusEl.textContent = 'Audio: Playing ' + candidateId + '...';

      try {
        const candidate = window.DuckSynth.QUACK_CANDIDATES[candidateId] || window.DuckSynth.QUACK_SHORT;
        const result = await window.DuckSynth.playSynthesizedSound(candidate);

        if (result.played) {
          statusEl.textContent = 'Audio: Played (' + result.candidateId + ', ' + result.duration.toFixed(2) + 's, gain ' + result.gain + ')';
          statusEl.style.color = '#4ade80';
        } else {
          statusEl.textContent = 'Audio: Fallback (' + result.reason + ', fallback: ' + result.fallback + ')';
          statusEl.style.color = '#f59e0b';
        }
      } catch (err) {
        statusEl.textContent = 'Audio: Error (' + err.message + ')';
        statusEl.style.color = '#f87171';
      }
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
