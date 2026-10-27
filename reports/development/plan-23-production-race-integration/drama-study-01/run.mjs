import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rankFromSnapshot, raceFingerprint } from '../../plan-13-race-staging-and-run-pacing/preview-model.mjs';

const studyDir = import.meta.dirname;
const repoRoot = resolve(studyDir, '../../../..');
const referencePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(referencePath, 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;
const withPrng = source.replace("from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
if (withPrng === source) throw new Error('Could not locate the accepted reference PRNG import');

const seedNames = Array.from({ length: 6 }, (_, i) => `plan23-drama-cal-${String(i + 1).padStart(2, '0')}`);
const roster = [['common', 10], ['rare', 14], ['legendary', 20]];
const fields = [['tutorial', 8, 'R01'], ['finale', 11.2, 'R03']];
const stances = [['safe', 'steady'], ['sprint', 'sprint']];
const rests = [['rested', 1], ['one-race-rest', 0.75], ['zero-races-rest', 0.5]];
const experiment = 'weave-rank-strong-contact';
const armNames = ['baseline', 'rear-assist', 'leader-disruption', 'combined'];
const MAX_ASSIST_AUDIT = 120;

function inject(code, anchor, replacement, label) {
  if (!code.includes(anchor)) throw new Error(`Reference source anchor not found for ${label}`);
  return code.replace(anchor, replacement);
}

function makeStudySource({ mapAdapter, mechanisms }) {
  let code = withPrng;
  if (mapAdapter) {
    code = inject(code, 'function makeEntrants(input) {', `function adapter(x) { return 8.25 + 0.5 * x; }\nfunction makeEntrants(input) {`, 'affine adapter');
    code = inject(code, 'topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', 'topSpeed: adapter(sampled),', 'affine topSpeed');
  }
  if (mechanisms.leader) {
    code = inject(code, 'weaveOpportunityIndex: 0,', 'weaveOpportunityIndex: 0, upgradedWeaveCount: 0,', 'leader episode count');
    const magnitudeAnchor = 'const magnitude = PHYSICS.weaveMinDeg + magnitudeDraw.value * (PHYSICS.weaveMaxDeg - PHYSICS.weaveMinDeg);';
    const magnitudeReplacement = `const upgradeLeader = ['leader-disruption', 'combined'].includes(input.dramaArm) && place <= 2 && entrant.upgradedWeaveCount < 2;\n    const minWeave = upgradeLeader ? 16 : PHYSICS.weaveMinDeg;\n    const maxWeave = upgradeLeader ? 20 : PHYSICS.weaveMaxDeg;\n    const magnitude = minWeave + magnitudeDraw.value * (maxWeave - minWeave);\n    if (upgradeLeader) entrant.upgradedWeaveCount += 1;`;
    code = inject(code, magnitudeAnchor, magnitudeReplacement, 'leader weave magnitude');
    code = inject(code, 'heldTicks: 0, record,', 'heldTicks: 0, holdTargetTicks: magnitude >= 16 ? 15 : PHYSICS.weaveHoldTicks, record,', 'leader weave duration');
    code = inject(code, 'if (episode.heldTicks >= PHYSICS.weaveHoldTicks) {', 'if (episode.heldTicks >= (episode.holdTargetTicks ?? PHYSICS.weaveHoldTicks)) {', 'leader weave hold');
  }
  if (mechanisms.assist) {
    code = inject(code, 'function simulate(input, guardLimitOverrides = {}) {', `function processStudyAssistance(entrants, input, tick, tickStartOrder, records, eventRecords, drawKeys, limits) {
  if (tick % 40 !== 0) return false;
  if (records.length + entrants.length > ${MAX_ASSIST_AUDIT}) throw new Error('study-sidecar cap exceeded');
  const rankById = new Map(tickStartOrder.map((entrant, index) => [entrant.id, index + 1]));
  for (const entrant of entrants) {
    const opportunityIndex = entrant.assistOpportunityIndex++;
    const rank = rankById.get(entrant.id);
    const orderIndex = tickStartOrder.findIndex((item) => item.id === entrant.id);
    const predecessor = orderIndex > 0 ? tickStartOrder[orderIndex - 1] : null;
    const gap = predecessor ? predecessor.progress - entrant.progress : null;
    const curveDistance = nextCurveDistance(entrant.progress);
    const cornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(entrant.lateral));
    const brakingDistance = Math.max(0, (entrant.speed * entrant.speed - cornerSpeed * cornerSpeed) / (2 * PHYSICS.braking));
    const curveBuffer = curveDistance - brakingDistance;
    const reasons = [];
    if (rank <= entrants.length / 2) reasons.push('not-back-half');
    if (gap === null || gap < 3) reasons.push('gap-under-3m');
    if (entrant.speed > entrant.topSpeed - 0.25) reasons.push('insufficient-topSpeed-headroom');
    if (curveBuffer < 15) reasons.push('under-15m-clear-buffer-after-braking');
    if (entrant.steeringEpisode) reasons.push('active-steering-or-recovery');
    if (tick < entrant.assistCooldownUntil) reasons.push('cooldown');
    if (entrant.assistCount >= 2) reasons.push('per-race-cap');
    const record = { tick, entrantId: entrant.id, opportunityIndex, rank, predecessorId: predecessor?.id ?? null,
      observedGapMeters: gap === null ? null : q(gap, 1000), speed: q(entrant.speed, 1000), topSpeed: q(entrant.topSpeed, 1000),
      speedHeadroom: q(entrant.topSpeed - entrant.speed, 1000), curveBufferMeters: q(curveBuffer, 1000),
      status: reasons.length ? 'blocked' : 'eligible', reasons, drawKey: null,
      progressAtOpportunity: q(entrant.progress, 1000), latestProgressSnapshot: null, progressDeltaThroughLatestSnapshot: null,
      gapAtLatestSnapshot: null, executedTicks: 0 };
    records.push(record);
    if (reasons.length) continue;
    const chance = latentDraw(input.seed, input.raceId, 'plan23-rear-assistance', entrant.id, opportunityIndex);
    record.drawKey = chance.key;
    drawKeys.push(chance.key);
    if (chance.value >= 0.5) { record.status = 'chance-failed'; continue; }
    const event = { id: 'catch-up-assist-' + tick + '-' + entrant.id, tick, time: q(tick * PHYSICS.dt, 1000),
      type: 'catch-up-assist', participants: [entrant.id], status: 'applied',
      effect: 'temporary 5.0 m/s^2 acceleration ceiling for up to 20 ticks, limited by unchanged topSpeed and curve braking',
      reason: 'seeded back-half and gap-eligible assistance opportunity', durationTicks: 20 };
    appendMechanicalEvent(eventRecords, event, limits.maxMechanicalEvents);
    entrant.assistStartTick = tick;
    entrant.assistUntilTick = tick + 20;
    entrant.assistCount += 1;
    entrant.assistActualTicks = 0;
    entrant.assistSpeedGain = 0;
    entrant.assistCooldownUntil = tick + 80;
    entrant.assistAuditRecord = record;
    entrant.assistEventRecord = event;
    record.status = 'executed';
    record.eventId = event.id;
  }
  return false;
}

function simulate(input, guardLimitOverrides = {}) {`, 'assistance helper');
    code = inject(code, 'const drawKeys = [];', 'const drawKeys = [];\n  const assistanceAudit = [];\n  for (const e of entrants) { e.assistOpportunityIndex = 0; e.assistUntilTick = 0; e.assistCount = 0; e.assistCooldownUntil = 0; e.assistAuditRecord = null; e.assistEventRecord = null; e.assistStartTick = 0; e.assistActualTicks = 0; e.assistSpeedGain = 0; }', 'assistance state');
    code = inject(code, 'const tickDrawKeys = [...drawKeys];', 'const tickDrawKeys = [...drawKeys];\n    const tickStartOrder = rankAt(entrants);\n    const tickAssistanceSnapshot = assistanceAudit.map((item) => structuredClone(item));', 'frozen assistance state');
    code = inject(code, 'const dueResult = processWeaveDue(entrants, input, tick, tickOpportunities, tickEvents, tickDrawKeys, limits);', `const dueResult = processWeaveDue(entrants, input, tick, tickOpportunities, tickEvents, tickDrawKeys, limits);`, 'existing weave call');
    const scheduleAnchor = `if (dueResult && dueResult.exceeded) {
        unresolvedReason = 'opportunity_diagnostic_cap';
        guardEvidence = { kind: unresolvedReason, tick, limit: dueResult.limit, attemptedCount: dueResult.attempted };
        break;
      }`;
    const scheduleReplacement = `${scheduleAnchor}
      if (input.dramaArm === 'rear-assist' || input.dramaArm === 'combined') {
        processStudyAssistance(entrants, input, tick, tickStartOrder, assistanceAudit, tickEvents, tickDrawKeys, limits);
      }`;
    code = inject(code, scheduleAnchor, scheduleReplacement, 'assistance scheduling order');
    const accelerationAnchor = `e.acceleration = PHYSICS.baseAcceleration;
      e.speed = targetSpeed < e.speed`;
    const accelerationReplacement = `const wasAssisted = e.assistUntilTick > tick;
      if (wasAssisted && e.assistStartTick < tick && (e.steeringEpisode || curveDistance <= stopping + e.speed * PHYSICS.dt)) {
        e.assistUntilTick = tick;
        if (e.assistEventRecord) { e.assistEventRecord.status = 'ended-early'; e.assistEventRecord.reason = e.steeringEpisode ? 'steering or recovery guard activated' : 'existing curve-braking envelope entered'; e.assistEventRecord.durationTicks = e.assistActualTicks; }
        if (e.assistAuditRecord) e.assistAuditRecord.status = 'ended-early';
      }
      const assistedNow = e.assistUntilTick > tick;
      e.acceleration = assistedNow ? 5 : PHYSICS.baseAcceleration;
      const speedBeforeStep = e.speed;
      e.speed = targetSpeed < e.speed`;
    code = inject(code, accelerationAnchor, accelerationReplacement, 'assistance acceleration');
    const speedTailAnchor = `: Math.min(targetSpeed, e.speed + e.acceleration * PHYSICS.dt);
      let desiredHeading = controllerHeading(e, settings.controller);`;
    const speedTailReplacement = `: Math.min(targetSpeed, e.speed + e.acceleration * PHYSICS.dt);
      if (assistedNow) {
        const referenceSpeed = Math.min(targetSpeed, speedBeforeStep + PHYSICS.baseAcceleration * PHYSICS.dt);
        e.assistSpeedGain = (e.assistSpeedGain ?? 0) + Math.max(0, e.speed - referenceSpeed);
        e.assistActualTicks = (e.assistActualTicks ?? 0) + 1;
        if (e.assistAuditRecord) { e.assistAuditRecord.executedTicks += 1; e.assistAuditRecord.accumulatedSpeedGain = q(e.assistSpeedGain, 1000); }
      }
      if (e.assistEventRecord && e.assistUntilTick === tick && e.assistStartTick < tick) {
        e.assistEventRecord.status = 'completed';
        e.assistEventRecord.durationTicks = e.assistActualTicks;
        if (e.assistAuditRecord) e.assistAuditRecord.status = 'completed';
      }
      if (e.assistAuditRecord && e.assistAuditRecord.status !== 'executed') {
        e.assistAuditRecord.endProgress = q(e.progress, 1000);
        e.assistAuditRecord.progressDeltaThroughLatestSnapshot = q(e.progress - e.assistAuditRecord.progressAtOpportunity, 1000);
      }
      let desiredHeading = controllerHeading(e, settings.controller);`;
    code = inject(code, speedTailAnchor, speedTailReplacement, 'assistance outcome trace');
    code = inject(code, 'e.progress += e.speed * Math.cos(error) * PHYSICS.dt;', `e.progress += e.speed * Math.cos(error) * PHYSICS.dt;
      if (e.assistAuditRecord && ['executed', 'completed', 'ended-early', 'ended-with-race'].includes(e.assistAuditRecord.status)) {
        const auditPredecessor = entrants.find((candidate) => candidate.id === e.assistAuditRecord.predecessorId);
        e.assistAuditRecord.latestProgressSnapshot = q(e.progress, 1000);
        e.assistAuditRecord.progressDeltaThroughLatestSnapshot = q(e.progress - e.assistAuditRecord.progressAtOpportunity, 1000);
        e.assistAuditRecord.gapAtLatestSnapshot = auditPredecessor ? q(auditPredecessor.progress - e.progress, 1000) : null;
      }`, 'assistance progress at step end');
    code = inject(code, 'const trajectory = [copyState(entrants, 0)];', 'const trajectory = [copyState(entrants, 0)];', 'trajectory initialization');
    code = inject(code, 'function simulate(input, guardLimitOverrides = {}) {', 'function simulate(input, guardLimitOverrides = {}) {', 'simulate retention');
    code = inject(code, 'const result = {\n    rulesVersion:', 'const result = {\n    studyAssistanceAudit: assistanceAudit,\n    rulesVersion:', 'study audit output');
    code = inject(code, 'const priorEventSnapshot = eventRecords.map((event) => structuredClone(event));', 'const priorEventSnapshot = eventRecords.map((event) => structuredClone(event));\n    const priorAssistAuditLength = assistanceAudit.length;', 'assistance rollback length');
    code = inject(code, 'eventRecords.splice(0, eventRecords.length, ...priorEventSnapshot);', 'eventRecords.splice(0, eventRecords.length, ...priorEventSnapshot);\n      assistanceAudit.splice(0, assistanceAudit.length, ...tickAssistanceSnapshot);', 'assistance rollback');
    code = inject(code, 'eventRecords.push(...tickEvents.slice(priorEventCount));', 'eventRecords.push(...tickEvents.slice(priorEventCount));\n    for (const item of assistanceAudit) {\n      const e = entrants.find((candidate) => candidate.id === item.entrantId);\n      if (e?.assistAuditRecord === item) { const predecessor = entrants.find((candidate) => candidate.id === item.predecessorId); item.latestProgressSnapshot = q(e.progress, 1000); item.progressDeltaThroughLatestSnapshot = q(e.progress - item.progressAtOpportunity, 1000); item.gapAtLatestSnapshot = predecessor ? q(predecessor.progress - e.progress, 1000) : null; }\n    }', 'assist progress snapshot');
    code = inject(code, 'const finalTick = trajectory.at(-1).tick;', `const finalTick = trajectory.at(-1).tick;
  for (const e of entrants) if (e.assistEventRecord && e.assistEventRecord.status === 'applied') {
    e.assistEventRecord.status = status === 'finished' ? 'race-ended-at-finish' : 'race-ended-before-watchdog';
    e.assistEventRecord.durationTicks = e.assistActualTicks;
    if (e.assistAuditRecord) { e.assistAuditRecord.status = 'ended-with-race'; e.assistAuditRecord.executedTicks = e.assistActualTicks; }
  }`, 'assistance finish finalization');
  }
  return code;
}

async function loadResolver(name, mechanisms) {
  const code = makeStudySource({ mapAdapter: true, mechanisms });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  let module;
  try { module = await import(moduleUrl); }
  catch (error) { throw new Error(`${name} transformed reference failed: ${error.name}`); }
  return module.resolveSeededRace;
}

const baselineResolver = await loadResolver('baseline', { assist: false, leader: false });
const armResolvers = Object.fromEntries(await Promise.all(armNames.map(async (arm) => [arm, await loadResolver(arm, {
  assist: ['rear-assist', 'combined'].includes(arm), leader: ['leader-disruption', 'combined'].includes(arm),
})])));

const witnesses = [
  { seed: 'Quackpot Plan 13 named-seed example', raceId: 'R03', playerBaseSpeed: 11.7, fieldBaseSpeed: 11.5, choice: 'steady', trialCommitted: false, experiment },
  { seed: 'plan23-drama-parity-02', raceId: 'R01', playerBaseSpeed: 13.25, fieldBaseSpeed: 8, choice: 'sprint', trialCommitted: true, experiment },
  { seed: 'plan23-drama-parity-03', raceId: 'R03', playerBaseSpeed: 10.75, fieldBaseSpeed: 11.2, choice: 'steady', trialCommitted: false, experiment },
];
const parity = witnesses.map((input) => {
  const expected = baselineResolver(input);
  const actual = armResolvers.baseline(input);
  return { seed: input.seed, raceId: input.raceId, exactFingerprintMatch: raceFingerprint(expected) === raceFingerprint(actual),
    fingerprintSha256: createHash('sha256').update(raceFingerprint(actual)).digest('hex'), status: actual.status, ticks: actual.ticks };
});
if (parity.some((item) => !item.exactFingerprintMatch)) throw new Error(`Arm A failed current affine baseline parity: ${JSON.stringify(parity)}`);

const quantile = (values, p) => [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(p * values.length) - 1)] ?? null;
function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return { n: sorted.length, min: sorted[0] ?? null, p5: quantile(sorted, 0.05), median: quantile(sorted, 0.5), p95: quantile(sorted, 0.95), p99: quantile(sorted, 0.99), max: sorted.at(-1) ?? null,
    under17: sorted.filter((x) => x < 17).length, over23: sorted.filter((x) => x > 23).length };
}

function rankMetrics(race) {
  const snapshots = race.trajectory.filter((snapshot) => Number.isFinite(snapshot.tick));
  const ranks = snapshots.map((snapshot) => ({ tick: snapshot.tick, order: rankFromSnapshot(snapshot, race).map((item) => item.id) }));
  const visits = new Set(); const drops = new Set(); const pairs = new Set();
  const hasBeenBottomTwo = new Set(); const hasBeenFrontTwo = new Set();
  for (let i = 1; i < ranks.length; i += 1) {
    const prev = ranks[i - 1].order, curr = ranks[i].order;
    if (ranks[i].tick >= 20) {
      for (const id of curr) {
        const a = prev.indexOf(id) + 1, b = curr.indexOf(id) + 1;
        const currentRank = curr.indexOf(id) + 1;
        if (currentRank >= 5) hasBeenBottomTwo.add(id);
        if (currentRank <= 2) hasBeenFrontTwo.add(id);
        if (hasBeenBottomTwo.has(id) && currentRank <= 3) visits.add(id);
        if (hasBeenFrontTwo.has(id) && currentRank >= 4) drops.add(id);
      }
    }
    for (let a = 0; a < curr.length; a += 1) for (let b = a + 1; b < curr.length; b += 1) {
      const x = curr[a], y = curr[b], oldX = prev.indexOf(x), oldY = prev.indexOf(y);
      if (oldX > oldY) {
        let lasting = true;
        const until = Math.min(ranks.length - 1, i + 20);
        for (let k = i; k < until; k += 1) if (ranks[k].order.indexOf(x) > ranks[k].order.indexOf(y)) { lasting = false; break; }
        if (lasting) pairs.add(`${x}>${y}@${ranks[i].tick}`);
      }
    }
  }
  let leadChanges = 0; let priorLead = ranks[0]?.order[0];
  for (let i = 1; i < ranks.length; i += 1) {
    const lead = ranks[i].order[0];
    if (lead !== priorLead) {
      const until = Math.min(ranks.length, i + 20);
      if (until - i >= 20 && ranks.slice(i, until).every((item) => item.order[0] === lead)) { leadChanges += 1; priorLead = lead; }
    }
  }
  const finish = race.finish;
  return { bottomTwoToTopThreeEntrants: visits.size, frontTwoToBottomThreeEntrants: drops.size, lastingPairPassesAtLeast1s: pairs.size,
    sustainedLeadChangesAtLeast1s: leadChanges, finishMarginMeters: finish.length > 1 ? +(finish[0].progress - finish[1].progress).toFixed(3) : null };
}

const attempts = [];
for (const [tier, playerBaseSpeed] of roster) for (const [fieldName, fieldBaseSpeed, raceId] of fields)
  for (const [stanceName, choice] of stances) for (const trialCommitted of [false, true])
    for (const [restName, restFactor] of rests) for (const seed of seedNames) {
      for (const arm of armNames) {
        const input = { seed, raceId, playerBaseSpeed: playerBaseSpeed * restFactor, fieldBaseSpeed, choice, trialCommitted, experiment };
        if (arm !== 'baseline') input.dramaArm = arm;
        let race;
        try { race = armResolvers[arm](input); }
        catch (error) { throw new Error(`${arm} arm failed for ${seed}/${tier}/${fieldName}/${stanceName}/${restName}: ${error.name}: ${error.message}`); }
        const assist = race.studyAssistanceAudit ?? [];
        const player = race.finish.find((item) => item.id === 'P');
        const qualifying = assist.filter((item) => item.status !== 'blocked' && item.reasons.length === 0);
        const executed = assist.filter((item) => ['executed', 'completed', 'ended-early', 'ended-with-race'].includes(item.status));
        const events = race.eventRecords;
        attempts.push({ arm, seed, tier, field: fieldName, raceId, stance: stanceName, trialCommitted, rest: restName,
          status: race.status, unresolvedReason: race.unresolvedReason, finishTimeSeconds: race.finishTimeSeconds,
          winner: race.winner, playerPlace: player?.place ?? null, playerWin: player?.place === 1,
          metrics: rankMetrics(race),
          assistance: { scheduled: assist.length, rankBackHalf: assist.filter((item) => item.rank >= 4).length,
            gapEligible: assist.filter((item) => item.observedGapMeters >= 3).length,
            speedHeadroomEligible: assist.filter((item) => item.speedHeadroom >= 0.25).length,
            eligible: assist.filter((item) => item.reasons.length === 0).length,
            executed: executed.length, actualAccelerationTicks: executed.reduce((sum, item) => sum + item.executedTicks, 0),
            measuredSpeedGainSum: +executed.reduce((sum, item) => sum + (item.accumulatedSpeedGain ?? 0), 0).toFixed(3),
            qualifyingEntrants: [...new Set(qualifying.map((item) => item.entrantId))],
            opportunities: assist },
          mechanics: { eventCount: events.length, opportunityDiagnostics: race.opportunityRecords.length,
            eventCap: race.guardLimits.maxMechanicalEvents, opportunityDiagnosticCap: race.guardLimits.maxOpportunityDiagnostics,
            wallContacts: events.filter((event) => event.type === 'wall-impact' || event.type === 'wall-overlap').length,
            duckContacts: events.filter((event) => event.type === 'duck-contact').length,
            weaveScheduled: race.opportunityRecords.length, weaveActivated: race.opportunityRecords.filter((item) => item.status === 'activated').length,
            upgradedWeaves: events.filter((event) => event.type === 'weave-turn' && (event.targetOffsetDeg ?? 0) >= 16).length,
            guardEvidence: race.guardEvidence },
        });
      }
    }

function aggregate(arm) {
  const rows = attempts.filter((row) => row.arm === arm);
  const finished = rows.filter((row) => row.status === 'finished');
  const times = finished.map((row) => row.finishTimeSeconds);
  const perInput = {};
  for (const key of ['tier', 'field', 'stance', 'trialCommitted', 'rest']) {
    perInput[key] = {};
    for (const value of [...new Set(rows.map((row) => row[key]))]) {
      const group = finished.filter((row) => row[key] === value);
      perInput[key][value] = { attempts: rows.filter((row) => row[key] === value).length,
        finishRate: group.length / (rows.filter((row) => row[key] === value).length || 1),
        meanPlace: group.length ? +(group.reduce((s, row) => s + row.playerPlace, 0) / group.length).toFixed(3) : null,
        winRate: group.length ? group.filter((row) => row.playerWin).length / group.length : null };
    }
  }
  const metrics = Object.fromEntries(['bottomTwoToTopThreeEntrants', 'frontTwoToBottomThreeEntrants', 'lastingPairPassesAtLeast1s', 'sustainedLeadChangesAtLeast1s', 'finishMarginMeters']
    .map((field) => [field, finished.length ? +(finished.reduce((s, row) => s + row.metrics[field], 0) / finished.length).toFixed(3) : null]));
  return { attempts: rows.length, finished: finished.length, unresolved: rows.length - finished.length,
    unresolvedReasons: Object.fromEntries([...new Set(rows.map((row) => row.unresolvedReason).filter(Boolean))].map((reason) => [reason, rows.filter((row) => row.unresolvedReason === reason).length])),
    simulationSeconds: summarize(times), medianTarget17to23: Boolean(times.length && quantile(times, 0.5) >= 17 && quantile(times, 0.5) <= 23),
    over23ShareAmongFinished: times.length ? times.filter((time) => time > 23).length / times.length : null,
    under17ShareAmongFinished: times.length ? times.filter((time) => time < 17).length / times.length : null,
    meanPlayerPlace: finished.length ? +(finished.reduce((s, row) => s + row.playerPlace, 0) / finished.length).toFixed(3) : null,
    playerWinRate: finished.length ? finished.filter((row) => row.playerWin).length / finished.length : null,
    movement: metrics,
    assistance: { scheduled: rows.reduce((s, row) => s + row.assistance.scheduled, 0), rankBackHalf: rows.reduce((s, row) => s + row.assistance.rankBackHalf, 0),
      gapEligible: rows.reduce((s, row) => s + row.assistance.gapEligible, 0), speedHeadroomEligible: rows.reduce((s, row) => s + row.assistance.speedHeadroomEligible, 0),
      executed: rows.reduce((s, row) => s + row.assistance.executed, 0), actualAccelerationTicks: rows.reduce((s, row) => s + row.assistance.actualAccelerationTicks, 0),
      measuredSpeedGainSum: +rows.reduce((s, row) => s + row.assistance.measuredSpeedGainSum, 0).toFixed(3) },
    mechanics: { meanEvents: rows.reduce((s, row) => s + row.mechanics.eventCount, 0) / rows.length,
      maxEvents: Math.max(...rows.map((row) => row.mechanics.eventCount)), maxWeaveDiagnostics: Math.max(...rows.map((row) => row.mechanics.opportunityDiagnostics)),
      wallContacts: rows.reduce((s, row) => s + row.mechanics.wallContacts, 0), duckContacts: rows.reduce((s, row) => s + row.mechanics.duckContacts, 0),
      weaveActivated: rows.reduce((s, row) => s + row.mechanics.weaveActivated, 0), upgradedWeaves: rows.reduce((s, row) => s + row.mechanics.upgradedWeaves, 0),
      mechanicalCap: 128, weaveDiagnosticCap: 84, studyAssistanceSidecarCap: MAX_ASSIST_AUDIT },
    byInput: perInput };
}

const summaries = Object.fromEntries(armNames.map((arm) => [arm, aggregate(arm)]));
const armA = attempts.filter((row) => row.arm === 'baseline');
const paired = Object.fromEntries(armNames.slice(1).map((arm) => {
  const treatment = new Map(attempts.filter((row) => row.arm === arm).map((row) => [
    `${row.seed}|${row.tier}|${row.field}|${row.stance}|${row.trialCommitted}|${row.rest}`, row]));
  const diffs = [];
  for (const base of armA) {
    const row = treatment.get(`${base.seed}|${base.tier}|${base.field}|${base.stance}|${base.trialCommitted}|${base.rest}`);
    if (!row) continue;
    diffs.push({ key: `${base.seed}|${base.tier}|${base.field}|${base.stance}|${base.trialCommitted}|${base.rest}`,
      finishTimeDelta: row.finishTimeSeconds === null || base.finishTimeSeconds === null ? null : row.finishTimeSeconds - base.finishTimeSeconds,
      placeDelta: row.playerPlace === null || base.playerPlace === null ? null : row.playerPlace - base.playerPlace,
      playerWinDelta: Number(row.playerWin) - Number(base.playerWin),
      leadChangeDelta: row.metrics.sustainedLeadChangesAtLeast1s - base.metrics.sustainedLeadChangesAtLeast1s,
      turnaroundDelta: row.metrics.bottomTwoToTopThreeEntrants - base.metrics.bottomTwoToTopThreeEntrants,
      frontDropDelta: row.metrics.frontTwoToBottomThreeEntrants - base.metrics.frontTwoToBottomThreeEntrants });
  }
  return [arm, { pairedRows: diffs.length, finishTimeDeltaMean: average(diffs.map((d) => d.finishTimeDelta)),
    placeDeltaMean: average(diffs.map((d) => d.placeDelta)), playerWinShareImproved: diffs.filter((d) => d.playerWinDelta > 0).length,
    playerWinShareWorsened: diffs.filter((d) => d.playerWinDelta < 0).length,
    observedLeadChangeDeltaMean: average(diffs.map((d) => d.leadChangeDelta)),
    observedTurnaroundDeltaMean: average(diffs.map((d) => d.turnaroundDelta)),
    observedFrontDropDeltaMean: average(diffs.map((d) => d.frontDropDelta)),
    attribution: 'Paired arm deltas support causal comparison; individual within-race observed gap changes are descriptive, not attributed to a mechanic.' }];
}));
function average(values) { const usable = values.filter(Number.isFinite); return usable.length ? usable.reduce((a, b) => a + b, 0) / usable.length : null; }

const payload = { provenance: { study: 'Plan 23 drama study 01', approvedScope: 'headless report-only four-arm screen; no production/canonical/reference write', source: 'accepted Plan 13 race-physics.mjs; in-memory affine adapter and arm-specific transforms only',
  referenceSourceSha256: sourceHash, model: 'topSpeed = 8.25 + 0.5 * sampledPerformance; accepted base/rest/trial/stance order is unchanged', experiment,
  seeds: seedNames, cells: '3 roster tiers × 2 field/race inputs × 2 stances × 2 trial states × 3 rest factors = 72', arms: armNames,
  attempts: attempts.length, expectedAttempts: 1728, parityWitnesses: parity, affineFormulaOwnerReviewOnly: true,
  quantileMethod: 'nearest rank: sorted[Math.ceil(p*n)-1]',
  studyOnlyConstants: { assistance: 'every40 ticks; 0.5 keyed success; rank 4-6; gap>=3m; topSpeed headroom>=0.25; curve distance minus existing braking distance>=15m; acceleration 5 vs 3 for max20 ticks; cooldown80; max2 executions/entrant',
    leader: 'at existing weave opportunity cadence, rank1-2 only, keyed target16-20deg, max15 hold ticks, max2 upgrades/entrant; accepted turn/recovery/contact values unchanged' },
  limitRules: { mechanicalEvents: 128, weaveOpportunityDiagnostics: 84, separateAssistanceSidecarRecords: 120, watchdogTicks: 800 },
  order: 'Per tick, freeze ranks/gaps/speed/headroom/braking buffer; process existing weave keys/opportunity; process assistance from the frozen snapshot; then advance movement. Assistance has separate keyed draws and does not affect same-tick eligibility.' },
  summaries, paired, attempts };
if (attempts.length !== 1728) throw new Error(`Expected 1728 attempts; got ${attempts.length}`);
const fullText = `${JSON.stringify(payload, null, 2)}\n`;
const fullBytes = Buffer.from(fullText, 'utf8');
const fullHash = createHash('sha256').update(fullBytes).digest('hex');
const compressed = gzipSync(fullBytes, { level: 9 });
const compactAttempts = attempts.map((row) => ({ ...row, assistance: { ...row.assistance, opportunities: undefined } }));
const compact = { ...payload, attempts: compactAttempts,
  payloadIntegrity: { fullFile: 'results.full.json.gz', rawBytes: fullBytes.byteLength, rawSha256: fullHash,
    gzipBytes: compressed.byteLength, gzipSha256: createHash('sha256').update(compressed).digest('hex'),
    exactDecompressionVerified: createHash('sha256').update(gunzipSync(compressed)).digest('hex') === fullHash } };
if (!compact.payloadIntegrity.exactDecompressionVerified) throw new Error('Compressed study payload did not verify against exact source bytes');
await writeFile(resolve(studyDir, 'results.full.json.gz'), compressed);
await writeFile(resolve(studyDir, 'results.json'), `${JSON.stringify(compact, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ parity, summaries, paired }, null, 2));
