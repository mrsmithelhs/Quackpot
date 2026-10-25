/**
 * @file build-audition.mjs
 * Reproducible build script for Plan 18 audio audition.
 * Compiles the authoritative `src/audio/synth.mjs` into a standalone IIFE bundle
 * `bundled-synth.js` in the plan-18 report directory, recording git revision and SHA-256 hash.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { build } from 'vite';

const rootDir = path.resolve('.');
const synthSourcePath = path.resolve(rootDir, 'src/audio/synth.mjs');
const outDir = path.resolve(rootDir, 'reports/development/plan-18-audio-sources-and-credits');
const bundlePath = path.resolve(outDir, 'bundled-synth.js');

function computeSha256(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getGitRevision() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (_) {
    return 'unknown';
  }
}

async function run() {
  if (!fs.existsSync(synthSourcePath)) {
    throw new Error(`Synth source not found at: ${synthSourcePath}`);
  }

  const sourceHash = computeSha256(synthSourcePath);
  const gitRev = getGitRevision();
  console.log(`Building bundled-synth.js from src/audio/synth.mjs (git: ${gitRev}, sha256: ${sourceHash.slice(0, 12)}...)`);

  const buildResult = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: false,
      lib: {
        entry: synthSourcePath,
        formats: ['iife'],
        name: 'DuckSynth'
      }
    }
  });

  const rawCode = buildResult[0].output[0].code;

  const header = `/**
 * @file bundled-synth.js
 * Reproducibly compiled from src/audio/synth.mjs
 * Git Revision: ${gitRev}
 * Source SHA-256: ${sourceHash}
 * Generated: ${new Date().toISOString()}
 *
 * DO NOT EDIT DIRECTLY. Re-generate via:
 * node reports/development/plan-18-audio-sources-and-credits/build-audition.mjs
 */
`;

  fs.writeFileSync(bundlePath, header + rawCode, 'utf8');
  console.log(`Successfully generated ${bundlePath} (${(fs.statSync(bundlePath).size / 1024).toFixed(1)} KB)`);
}

run().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
