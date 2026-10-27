import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { rankFromSnapshot, raceFingerprint } from '../../plan-13-race-staging-and-run-pacing/preview-model.mjs';

const previewDir = import.meta.dirname;
const repoRoot = resolve(previewDir, '../../../..');
const referencePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(referencePath, 'utf8');
const validationPath = resolve(repoRoot, 'reports/development/plan-23-production-race-integration/drama-study-02/validate.mjs');
const validationSource = await readFile(validationPath, 'utf8');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;
const sourceHash = createHash('sha256').update(source).digest('hex');
const validationScriptHash = createHash('sha256').update(validationSource).digest('hex');

function sha(value) { return createHash('sha256').update(value).digest('hex'); }
function inject(code, anchor, replacement, label) {
  if (!code.includes(anchor)) throw new Error(`Study transform anchor missing: ${label}`);
  return code.replace(anchor, replacement);
}
function factoryFromValidation(withPrng) {
  const start = validationSource.indexOf('function makeStudySource({ mapAdapter, mechanisms }) {');
  const end = validationSource.indexOf('\nasync function loadResolver', start);
  if (start < 0 || end < 0) throw new Error('Could not locate the frozen R2 transform factory');
  const block = validationSource.slice(start, end);
  return new Function('inject', 'withPrng', 'MAX_ASSIST_AUDIT', `${block}\nreturn makeStudySource;`)(
    inject, withPrng, 120);
}
const makeStudySource = factoryFromValidation(source.replace("from '../../../src/core/prng.mjs'", `from '${prngUrl}'`));
const makeBrowserStudySource = factoryFromValidation(source.replace("from '../../../src/core/prng.mjs'", "from '../../../../src/core/prng.mjs'"));

const baselineNodeSource = makeStudySource({ mapAdapter: true, mechanisms: { assist: false, slowdown: false, sprintMeanOne: false } });
const combinedNodeSource = makeStudySource({ mapAdapter: true, mechanisms: { assist: true, slowdown: true, sprintMeanOne: false } });
const riskNodeSource = makeStudySource({ mapAdapter: true, mechanisms: { assist: true, slowdown: true, sprintMeanOne: true } });
let candidateBrowserSource = makeBrowserStudySource({ mapAdapter: true, mechanisms: { assist: true, slowdown: true, sprintMeanOne: false } });
candidateBrowserSource = inject(candidateBrowserSource,
  'base * 1.1 * (1 + (2 * draw - 1) * 0.2)',
  'base * (input.studySprintMean ?? 1.1) * (1 + (2 * draw - 1) * 0.2)',
  'runtime-selectable Sprint mean');
await writeFile(resolve(previewDir, 'baseline-model.mjs'), makeBrowserStudySource({ mapAdapter: true, mechanisms: { assist: false, slowdown: false, sprintMeanOne: false } }));
await writeFile(resolve(previewDir, 'candidate-model.mjs'), candidateBrowserSource);

const importFresh = (path) => import(`${pathToFileURL(path).href}?build=${Date.now()}-${Math.random()}`);
const [baselineModel, candidateModel] = await Promise.all([
  importFresh(resolve(previewDir, 'baseline-model.mjs')),
  importFresh(resolve(previewDir, 'candidate-model.mjs')),
]);
const baselineReference = await import(`data:text/javascript;base64,${Buffer.from(baselineNodeSource).toString('base64')}`);
const combinedReference = await import(`data:text/javascript;base64,${Buffer.from(combinedNodeSource).toString('base64')}`);
const riskReference = await import(`data:text/javascript;base64,${Buffer.from(riskNodeSource).toString('base64')}`);

const validationFullPath = resolve(repoRoot, 'reports/development/plan-23-production-race-integration/drama-study-02/validation-results.full.json.gz');
const frozenRaw = gunzipSync(await readFile(validationFullPath));
const frozenRawHash = sha(frozenRaw);
const frozen = JSON.parse(frozenRaw.toString('utf8'));
if (frozenRawHash !== frozen.provenance?.expectedRawSha256 && frozenRawHash !== 'c1d6c9bba497e47dd2301e252d3960bb544e6d50de261839071463bebc5b15fd') {
  throw new Error(`Frozen validation raw hash changed: ${frozenRawHash}`);
}
const firstValidationSeed = 'plan23-drama2-val-01';
const presets = [
  { id: 'tutorial-common-rested', tier: 'common', field: 'tutorial', raceId: 'R01', playerBaseSpeed: 10, fieldBaseSpeed: 8, rest: 'rested', restFactor: 1 },
  { id: 'finale-common-rested', tier: 'common', field: 'finale', raceId: 'R03', playerBaseSpeed: 10, fieldBaseSpeed: 11.2, rest: 'rested', restFactor: 1 },
  { id: 'finale-rare-rested', tier: 'rare', field: 'finale', raceId: 'R03', playerBaseSpeed: 14, fieldBaseSpeed: 11.2, rest: 'rested', restFactor: 1 },
  { id: 'finale-legendary-rested', tier: 'legendary', field: 'finale', raceId: 'R03', playerBaseSpeed: 20, fieldBaseSpeed: 11.2, rest: 'rested', restFactor: 1 },
  { id: 'finale-rare-tired', tier: 'rare', field: 'finale', raceId: 'R03', playerBaseSpeed: 14, fieldBaseSpeed: 11.2, rest: 'one-race-rest', restFactor: 0.75 },
  { id: 'finale-rare-zero-races-tired', tier: 'rare', field: 'finale', raceId: 'R03', playerBaseSpeed: 14, fieldBaseSpeed: 11.2, rest: 'zero-races-rest', restFactor: 0.5 },
];
function rankMetrics(race) {
  const ranks = race.trajectory.map((snapshot) => ({ tick: snapshot.tick, order: rankFromSnapshot(snapshot, race).map((item) => item.id) }));
  const visits = new Set(), drops = new Set(), pairs = new Set(), bottom = new Set(), front = new Set();
  for (let i = 1; i < ranks.length; i += 1) {
    const current = ranks[i].order;
    if (ranks[i].tick >= 20) for (const id of current) {
      const rank = current.indexOf(id) + 1;
      if (rank >= 5) bottom.add(id);
      if (rank <= 2) front.add(id);
      if (bottom.has(id) && rank <= 3) visits.add(id);
      if (front.has(id) && rank >= 4) drops.add(id);
    }
    const previous = ranks[i - 1].order;
    for (let a = 0; a < current.length; a += 1) for (let b = a + 1; b < current.length; b += 1) {
      const x = current[a], y = current[b];
      if (previous.indexOf(x) > previous.indexOf(y)) {
        let lasting = true;
        for (let k = i; k < Math.min(ranks.length - 1, i + 20); k += 1) if (ranks[k].order.indexOf(x) > ranks[k].order.indexOf(y)) lasting = false;
        if (lasting) pairs.add(`${x}>${y}@${ranks[i].tick}`);
      }
    }
  }
  let leadChanges = 0, previousLead = ranks[0]?.order[0];
  for (let i = 1; i < ranks.length; i += 1) if (ranks[i].order[0] !== previousLead) {
    const lead = ranks[i].order[0], end = Math.min(ranks.length, i + 20);
    if (end - i >= 20 && ranks.slice(i, end).every((row) => row.order[0] === lead)) { leadChanges += 1; previousLead = lead; }
  }
  return { bottomTwoToTopThreeEntrants: visits.size, frontTwoToBottomThreeEntrants: drops.size,
    lastingPairPassesAtLeast1s: pairs.size, sustainedLeadChangesAtLeast1s: leadChanges,
    finishMarginMeters: race.finish.length > 1 ? +(race.finish[0].progress - race.finish[1].progress).toFixed(3) : null };
}
function compareFrozen(actual, expected, mode) {
  const player = actual.finish.find((row) => row.id === 'P');
  const events = actual.eventRecords;
  const slowdown = events.filter((event) => event.type === 'leader-wobble-slowdown');
  const assist = actual.studyAssistanceAudit ?? [];
  const exact = {
    status: actual.status === expected.status,
    winner: actual.winner === expected.winner,
    finishTimeSeconds: actual.finishTimeSeconds === expected.finishTimeSeconds,
    playerPlace: player?.place === expected.playerPlace,
    playerWin: (player?.place === 1) === expected.playerWin,
    metrics: JSON.stringify(rankMetrics(actual)) === JSON.stringify(expected.metrics),
    eventCount: events.length === expected.mechanics.eventCount,
    opportunityDiagnostics: actual.opportunityRecords.length === expected.mechanics.opportunityDiagnostics,
    wallContacts: events.filter((event) => event.type === 'wall-impact' || event.type === 'wall-overlap').length === expected.mechanics.wallContacts,
    duckContacts: events.filter((event) => event.type === 'duck-contact').length === expected.mechanics.duckContacts,
    leaderSlowdowns: slowdown.length === expected.mechanics.leaderSlowdowns,
    assistanceExecuted: assist.filter((row) => ['executed', 'completed', 'ended-with-race'].includes(row.status)).length === expected.assistance.executed,
  };
  if (Object.values(exact).some((value) => !value)) throw new Error(`Generated preview model differs from frozen validation in ${mode}: ${JSON.stringify(exact)}`);
  return exact;
}

const parityRows = [];
const modes = ['baseline', 'R2combined', 'R2combined-risk-only'];
for (const preset of presets) for (const choice of ['steady', 'sprint']) for (const trialCommitted of [false, true]) for (const mode of modes) {
  const input = { seed: firstValidationSeed, raceId: preset.raceId,
    playerBaseSpeed: preset.playerBaseSpeed * preset.restFactor, fieldBaseSpeed: preset.fieldBaseSpeed,
    choice, trialCommitted, experiment: 'weave-rank-strong-contact' };
  let actual, expectedModel;
  if (mode === 'baseline') {
    actual = baselineModel.resolveSeededRace(input);
    expectedModel = baselineReference;
  } else {
    input.dramaArm = mode;
    input.studySprintMean = mode === 'R2combined-risk-only' ? 1.0 : 1.1;
    actual = candidateModel.resolveSeededRace(input);
    expectedModel = mode === 'R2combined-risk-only' ? riskReference : combinedReference;
  }
  const expectedModelResult = expectedModel.resolveSeededRace(input);
  if (raceFingerprint(actual) !== raceFingerprint(expectedModelResult)) throw new Error(`Preview-module fingerprint mismatch for ${mode}/${preset.id}/${choice}/trial-${trialCommitted}`);
  const frozenRow = frozen.attempts.find((row) => row.arm === mode && row.seed === firstValidationSeed && row.tier === preset.tier
    && row.field === preset.field && row.stance === (choice === 'sprint' ? 'sprint' : 'safe')
    && row.trialCommitted === trialCommitted && row.rest === preset.rest);
  if (!frozenRow) throw new Error(`Missing frozen validation row for ${mode}/${preset.id}/${choice}/trial-${trialCommitted}`);
  const fields = compareFrozen(actual, frozenRow, mode);
  parityRows.push({ mode, preset: preset.id, choice, trialCommitted, fingerprintSha256: sha(raceFingerprint(actual)), frozenValidationMatch: fields });
}

const result = { schema: 'quackpot.plan23.preview-model-manifest/v1', scope: 'isolated report preview only; no production import',
  generatedAt: new Date().toISOString(), referenceSourceSha256: sourceHash, validationRunnerSha256: validationScriptHash,
  frozenValidationRawSha256: frozenRawHash, validationSeeds: frozen.provenance.seeds, modes, presets, parityWitnesses: parityRows.length,
  parityRows, verification: 'Browser modules generated from the exact makeStudySource function in frozen validate.mjs; baseline and both candidate variants matched fresh direct transforms by race fingerprint and matched their stored first-seed frozen validation outcome/metrics.' };
await writeFile(resolve(previewDir, 'model-manifest.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ referenceSourceSha256: sourceHash, validationRunnerSha256: validationScriptHash,
  frozenValidationRawSha256: frozenRawHash, previewModelHashes: {
    baseline: sha(await readFile(resolve(previewDir, 'baseline-model.mjs'))),
    candidate: sha(await readFile(resolve(previewDir, 'candidate-model.mjs'))),
  }, parityWitnesses: parityRows.length, modes }, null, 2));
