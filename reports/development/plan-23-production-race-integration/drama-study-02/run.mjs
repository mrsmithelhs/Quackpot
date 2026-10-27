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

const seedNames = Array.from({ length: 6 }, (_, i) => `plan23-drama2-cal-${String(i + 1).padStart(2, '0')}`);
const roster = [['common', 10], ['rare', 14], ['legendary', 20]];
const fields = [['tutorial', 8, 'R01'], ['finale', 11.2, 'R03']];
const stances = [['safe', 'steady'], ['sprint', 'sprint']];
const rests = [['rested', 1], ['one-race-rest', 0.75], ['zero-races-rest', 0.5]];
const experiment = 'weave-rank-strong-contact';
const armNames = ['baseline', 'assistance', 'leader-slowdown', 'combined'];
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
  if (mechanisms.slowdown) {
    code = inject(code, 'weaveOpportunityIndex: 0,', 'weaveOpportunityIndex: 0, leaderSlowdownCount: 0, leaderSlowdownUntil: 0, leaderSlowdownEventRecord: null, leaderSlowdownTicks: 0, leaderSlowdownSpeedDelta: 0,', 'leader slowdown state');
    code = inject(code, 'const tickDrawKeys = [...drawKeys];', 'const tickDrawKeys = [...drawKeys];\n    const tickStartOrder = rankAt(entrants);', 'leader slowdown rank snapshot');
    code = inject(code, 'function advanceSteeringEpisode(entrant, tick, controller) {', 'function advanceSteeringEpisode(entrant, tick, controller, rankAtTick, slowdownEnabled, eventRecords, limits) {', 'leader slowdown episode boundary');
    const holdAnchor = 'episode.phase = \'hold\'; episode.heldTicks = 0;';
    const holdReplacement = `episode.phase = 'hold'; episode.heldTicks = 0;
      if (slowdownEnabled && episode.kind === 'weave' && rankAtTick <= 2 && entrant.leaderSlowdownCount < 2 && entrant.leaderSlowdownUntil <= tick) {
        const slowdown = { id: 'leader-wobble-slowdown-' + (tick + 1) + '-' + entrant.id, tick: tick + 1,
          triggerTick: tick, time: q((tick + 1) * PHYSICS.dt, 1000), type: 'leader-wobble-slowdown', participants: [entrant.id],
          status: 'applied', targetSpeedFactor: 0.8, durationLimitTicks: 20, actualTicks: 0, speedDelta: 0,
          reason: 'rank 1 or 2 weave entered its held phase', effect: 'targetSpeed multiplied by 0.8 for at most 20 ticks; normal braking and acceleration remain active' };
        appendMechanicalEvent(eventRecords, slowdown, limits.maxMechanicalEvents);
        entrant.leaderSlowdownEventRecord = slowdown; entrant.leaderSlowdownUntil = tick + 21; entrant.leaderSlowdownCount += 1;
      }`;
    code = inject(code, holdAnchor, holdReplacement, 'leader slowdown trigger');
    const callAnchor = 'advanceSteeringEpisode(e, tick, settings.controller);';
    code = inject(code, callAnchor, `advanceSteeringEpisode(e, tick, settings.controller, tickStartOrder.findIndex((item) => item.id === e.id) + 1,
        ['leader-slowdown', 'combined'].includes(input.dramaArm), tickEvents, limits);`, 'leader slowdown rank snapshot');
    const targetAnchor = 'if (curveDistance <= stopping + e.speed * PHYSICS.dt) targetSpeed = Math.min(targetSpeed, targetCornerSpeed);';
    const targetReplacement = `${targetAnchor}
      const slowdownSpeedBeforeStep = e.speed;
      const unslowedTargetSpeed = targetSpeed;
      const leaderSlowdownActive = e.leaderSlowdownUntil > tick;
      if (leaderSlowdownActive) targetSpeed *= 0.8;`;
    code = inject(code, targetAnchor, targetReplacement, 'leader slowdown target speed');
    const slowdownSpeedAnchor = 'e.speed = targetSpeed < e.speed\n        ? Math.max(targetSpeed, e.speed - PHYSICS.braking * PHYSICS.dt)\n        : Math.min(targetSpeed, e.speed + e.acceleration * PHYSICS.dt);';
    const slowdownSpeedReplacement = `${slowdownSpeedAnchor}
      if (leaderSlowdownActive && e.leaderSlowdownEventRecord) {
        const referenceSpeed = unslowedTargetSpeed < slowdownSpeedBeforeStep
          ? Math.max(unslowedTargetSpeed, slowdownSpeedBeforeStep - PHYSICS.braking * PHYSICS.dt)
          : Math.min(unslowedTargetSpeed, slowdownSpeedBeforeStep + e.acceleration * PHYSICS.dt);
        e.leaderSlowdownEventRecord.actualTicks += 1;
        e.leaderSlowdownEventRecord.speedDelta += Math.max(0, referenceSpeed - e.speed);
        e.leaderSlowdownTicks += 1;
        e.leaderSlowdownSpeedDelta += Math.max(0, referenceSpeed - e.speed);
      }
      if (!leaderSlowdownActive && e.leaderSlowdownEventRecord?.status === 'applied') {
        e.leaderSlowdownEventRecord.status = 'completed';
        e.leaderSlowdownEventRecord.endTick = tick - 1;
        e.leaderSlowdownEventRecord.durationTicks = e.leaderSlowdownEventRecord.actualTicks;
      }`;
    code = inject(code, slowdownSpeedAnchor, slowdownSpeedReplacement, 'leader slowdown applied speed');
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
    const reasons = [];
    if (rank <= entrants.length / 2) reasons.push('not-back-half');
    if (gap === null || gap < 2) reasons.push('gap-under-2m');
    if (tick < entrant.assistCooldownUntil) reasons.push('cooldown');
    if (entrant.assistCount >= 2) reasons.push('per-race-cap');
    const record = { tick, entrantId: entrant.id, opportunityIndex, rank, predecessorId: predecessor?.id ?? null,
      observedGapMeters: gap === null ? null : q(gap, 1000), speed: q(entrant.speed, 1000), topSpeed: q(entrant.topSpeed, 1000),
      speedHeadroom: q(entrant.topSpeed - entrant.speed, 1000), speedSaturatedAtOpportunity: entrant.speed >= entrant.topSpeed - 1e-9,
      status: reasons.length ? 'blocked' : 'eligible', reasons, drawKey: null,
      progressAtOpportunity: q(entrant.progress, 1000), episodeEndTick: null, progressAtEpisodeEnd: null, progressDeltaDuringEpisode: null,
      gapAtEpisodeEnd: null, executedTicks: 0, accelerationTicks: 0, saturatedTicks: 0, recenterTicks: 0, raisedTurnCapTicks: 0, turnCapReliefTicks: 0,
      appliedSpeedGain: 0, maxAppliedTurnCapDegPerSecond: 0 };
    records.push(record);
    if (reasons.length) continue;
    const chance = latentDraw(input.seed, input.raceId, 'plan23-rear-assistance', entrant.id, opportunityIndex);
    record.drawKey = chance.key;
    drawKeys.push(chance.key);
    if (chance.value >= 0.5) { record.status = 'chance-failed'; continue; }
    const event = { id: 'catch-up-assist-' + tick + '-' + entrant.id, tick, time: q(tick * PHYSICS.dt, 1000),
      type: 'catch-up-assist', participants: [entrant.id], status: 'applied',
      effect: '5.0 m/s^2 acceleration for up to 40 ticks, with 6 m recovery lookahead and turn cap up to 1.5× (maximum 90°/s)',
      reason: 'seeded back-half and gap-eligible assistance opportunity', durationLimitTicks: 40, actualTicks: 0 };
    appendMechanicalEvent(eventRecords, event, limits.maxMechanicalEvents);
    entrant.assistStartTick = tick;
    entrant.assistUntilTick = tick + 40;
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
    if (!code.includes('const tickStartOrder = rankAt(entrants);'))
      code = inject(code, 'const tickDrawKeys = [...drawKeys];', 'const tickDrawKeys = [...drawKeys];\n    const tickStartOrder = rankAt(entrants);', 'frozen assistance rank');
    code = inject(code, 'const tickDrawKeys = [...drawKeys];', 'const tickDrawKeys = [...drawKeys];\n    const tickAssistanceSnapshot = assistanceAudit.map((item) => structuredClone(item));', 'frozen assistance audit');
    code = inject(code, 'const dueResult = processWeaveDue(entrants, input, tick, tickOpportunities, tickEvents, tickDrawKeys, limits);', `const dueResult = processWeaveDue(entrants, input, tick, tickOpportunities, tickEvents, tickDrawKeys, limits);`, 'existing weave call');
    const scheduleAnchor = `if (dueResult && dueResult.exceeded) {
        unresolvedReason = 'opportunity_diagnostic_cap';
        guardEvidence = { kind: unresolvedReason, tick, limit: dueResult.limit, attemptedCount: dueResult.attempted };
        break;
      }`;
    const scheduleReplacement = `${scheduleAnchor}
      if (input.dramaArm === 'assistance' || input.dramaArm === 'combined') {
        processStudyAssistance(entrants, input, tick, tickStartOrder, assistanceAudit, tickEvents, tickDrawKeys, limits);
      }`;
    code = inject(code, scheduleAnchor, scheduleReplacement, 'assistance scheduling order');
    const accelerationAnchor = `e.acceleration = PHYSICS.baseAcceleration;
      e.speed = targetSpeed < e.speed`;
    const accelerationReplacement = `const assistedNow = e.assistUntilTick > tick;
      e.acceleration = assistedNow ? 5 : PHYSICS.baseAcceleration;
      const speedBeforeStep = e.speed;
      e.speed = targetSpeed < e.speed`;
    code = inject(code, accelerationAnchor, accelerationReplacement, 'assistance acceleration');
    const speedTailAnchor = 'let desiredHeading = controllerHeading(e, settings.controller);';
    const speedTailReplacement = `if (assistedNow) {
        const referenceSpeed = Math.min(targetSpeed, speedBeforeStep + PHYSICS.baseAcceleration * PHYSICS.dt);
        const speedGain = Math.max(0, e.speed - referenceSpeed);
        e.assistSpeedGain = (e.assistSpeedGain ?? 0) + speedGain;
        e.assistActualTicks = (e.assistActualTicks ?? 0) + 1;
        if (e.assistAuditRecord) {
          e.assistAuditRecord.executedTicks += 1;
          e.assistAuditRecord.accelerationTicks += 1;
          e.assistAuditRecord.saturatedTicks += speedGain <= 1e-9 ? 1 : 0;
          e.assistAuditRecord.appliedSpeedGain += speedGain;
          e.assistEventRecord.actualTicks = e.assistActualTicks;
          e.assistEventRecord.appliedSpeedGain = q(e.assistSpeedGain, 1000);
        }
      }
      let desiredHeading = controllerHeading(e, settings.controller);`;
    code = inject(code, speedTailAnchor, speedTailReplacement, 'assistance outcome trace');
    const turnAssistAnchor = `const episode = e.steeringEpisode;
      if (episode && ['acquire', 'hold'].includes(episode.phase)) {
        desiredHeading = offsetTarget(e, episode.sign, episode.targetOffsetDeg);
      }
      const turnRadians = Math.min(Math.abs(angleDelta(desiredHeading, e.heading)), turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt);`;
    const turnAssistReplacement = `const episode = e.steeringEpisode;
      let appliedTurnCap = turnCap(e.speed);
      const turnAssistActive = assistedNow && (!episode || episode.phase === 'recover');
      if (turnAssistActive) {
        const ordinaryCorrection = recenterCorrectionDeg(crossTrackError(e));
        const assistedCorrection = clamp(Math.atan2(-crossTrackError(e), 6) * 180 / Math.PI,
          -PHYSICS.recoveryMaxCorrectionDeg, PHYSICS.recoveryMaxCorrectionDeg);
        desiredHeading = tangentHeading(e) + assistedCorrection * Math.PI / 180;
        appliedTurnCap = Math.min(90, appliedTurnCap * 1.5);
        if (e.assistAuditRecord) {
          if (Math.abs(assistedCorrection - ordinaryCorrection) > 1e-6) e.assistAuditRecord.recenterTicks += 1;
          if (appliedTurnCap > turnCap(e.speed) + 1e-6) e.assistAuditRecord.raisedTurnCapTicks += 1;
          e.assistAuditRecord.maxAppliedTurnCapDegPerSecond = Math.max(e.assistAuditRecord.maxAppliedTurnCapDegPerSecond, appliedTurnCap);
        }
      }
      if (episode && ['acquire', 'hold'].includes(episode.phase)) {
        desiredHeading = offsetTarget(e, episode.sign, episode.targetOffsetDeg);
      }
      const requestedTurnRadians = Math.abs(angleDelta(desiredHeading, e.heading));
      const turnRadians = Math.min(requestedTurnRadians, appliedTurnCap * Math.PI / 180 * PHYSICS.dt);
      if (turnAssistActive && e.assistAuditRecord && requestedTurnRadians > turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt + 1e-9
        && turnRadians > turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt + 1e-9) e.assistAuditRecord.turnCapReliefTicks += 1;`;
    code = inject(code, turnAssistAnchor, turnAssistReplacement, 'recovery turn assistance');
    code = inject(code, 'e.lateral += e.speed * Math.sin(error) * PHYSICS.dt;', `e.lateral += e.speed * Math.sin(error) * PHYSICS.dt;
      if (e.assistAuditRecord && e.assistEventRecord && e.assistUntilTick === tick + 1 && e.assistEventRecord.status === 'applied') {
        e.assistEventRecord.status = 'completed'; e.assistEventRecord.endTick = tick; e.assistEventRecord.durationTicks = e.assistActualTicks;
        e.assistAuditRecord.status = 'completed'; e.assistAuditRecord.episodeEndTick = tick;
        e.assistAuditRecord.progressAtEpisodeEnd = q(e.progress, 1000);
        e.assistAuditRecord.progressDeltaDuringEpisode = q(e.progress - e.assistAuditRecord.progressAtOpportunity, 1000);
        const auditPredecessor = entrants.find((candidate) => candidate.id === e.assistAuditRecord.predecessorId);
        e.assistAuditRecord.gapAtEpisodeEnd = auditPredecessor ? q(auditPredecessor.progress - e.progress, 1000) : null;
      }`, 'assistance endpoint');
    code = inject(code, 'const trajectory = [copyState(entrants, 0)];', 'const trajectory = [copyState(entrants, 0)];', 'trajectory initialization');
    code = inject(code, 'function simulate(input, guardLimitOverrides = {}) {', 'function simulate(input, guardLimitOverrides = {}) {', 'simulate retention');
    code = inject(code, 'const result = {\n    rulesVersion:', 'const result = {\n    studyAssistanceAudit: assistanceAudit,\n    rulesVersion:', 'study audit output');
    code = inject(code, 'eventRecords.splice(0, eventRecords.length, ...priorEventSnapshot);', 'eventRecords.splice(0, eventRecords.length, ...priorEventSnapshot);\n      assistanceAudit.splice(0, assistanceAudit.length, ...tickAssistanceSnapshot);', 'assistance rollback');
    code = inject(code, 'const finalTick = trajectory.at(-1).tick;', `const finalTick = trajectory.at(-1).tick;
  const finalSnapshot = trajectory.at(-1);
  for (const e of entrants) {
    if (e.assistEventRecord?.status === 'applied') {
      e.assistEventRecord.status = 'ended-with-race'; e.assistEventRecord.endTick = finalTick; e.assistEventRecord.durationTicks = e.assistActualTicks;
      if (e.assistAuditRecord) {
        const finalEntrant = finalSnapshot.entrants.find((item) => item.id === e.id);
        const finalPredecessor = finalSnapshot.entrants.find((item) => item.id === e.assistAuditRecord.predecessorId);
        e.assistAuditRecord.status = 'ended-with-race'; e.assistAuditRecord.episodeEndTick = finalTick;
        e.assistAuditRecord.progressAtEpisodeEnd = finalEntrant?.progress ?? null;
        e.assistAuditRecord.progressDeltaDuringEpisode = finalEntrant ? q(finalEntrant.progress - e.assistAuditRecord.progressAtOpportunity, 1000) : null;
        e.assistAuditRecord.gapAtEpisodeEnd = finalEntrant && finalPredecessor ? q(finalPredecessor.progress - finalEntrant.progress, 1000) : null;
      }
    }
    if (e.leaderSlowdownEventRecord?.status === 'applied') {
      e.leaderSlowdownEventRecord.status = 'ended-with-race'; e.leaderSlowdownEventRecord.endTick = finalTick;
      e.leaderSlowdownEventRecord.durationTicks = e.leaderSlowdownEventRecord.actualTicks;
    }
  }`, 'episode endpoint finalization');
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

const baselineResolver = await loadResolver('baseline', { assist: false, slowdown: false });
const armResolvers = Object.fromEntries(await Promise.all(armNames.map(async (arm) => [arm, await loadResolver(arm, {
  assist: ['assistance', 'combined'].includes(arm), slowdown: ['leader-slowdown', 'combined'].includes(arm),
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
        const executed = assist.filter((item) => ['executed', 'completed', 'ended-with-race'].includes(item.status));
        const events = race.eventRecords;
        const slowdownEvents = events.filter((event) => event.type === 'leader-wobble-slowdown');
        attempts.push({ arm, seed, tier, field: fieldName, raceId, stance: stanceName, trialCommitted, rest: restName,
          status: race.status, unresolvedReason: race.unresolvedReason, finishTimeSeconds: race.finishTimeSeconds,
          winner: race.winner, playerPlace: player?.place ?? null, playerWin: player?.place === 1,
          metrics: rankMetrics(race),
          assistance: { scheduled: assist.length, rankBackHalf: assist.filter((item) => item.rank >= 4).length,
            gapEligible: assist.filter((item) => item.observedGapMeters >= 2).length,
            speedSaturatedAtOpportunity: assist.filter((item) => item.speedSaturatedAtOpportunity).length,
            eligible: assist.filter((item) => item.reasons.length === 0).length,
            executed: executed.length, actualAccelerationTicks: executed.reduce((sum, item) => sum + item.accelerationTicks, 0),
            saturatedAccelerationTicks: executed.reduce((sum, item) => sum + item.saturatedTicks, 0),
            recenterTicks: executed.reduce((sum, item) => sum + item.recenterTicks, 0),
            raisedTurnCapTicks: executed.reduce((sum, item) => sum + item.raisedTurnCapTicks, 0),
            turnCapReliefTicks: executed.reduce((sum, item) => sum + item.turnCapReliefTicks, 0),
            appliedSpeedGainSum: +executed.reduce((sum, item) => sum + item.appliedSpeedGain, 0).toFixed(3),
            opportunitiesByEntrant: assist.reduce((map, item) => { map[item.entrantId] ??= { scheduled: 0, eligible: 0, executed: 0 }; map[item.entrantId].scheduled += 1; map[item.entrantId].eligible += item.reasons.length === 0 ? 1 : 0; map[item.entrantId].executed += ['executed', 'completed', 'ended-with-race'].includes(item.status) ? 1 : 0; return map; }, {}),
            qualifyingEntrants: [...new Set(qualifying.map((item) => item.entrantId))],
            opportunities: assist },
          mechanics: { eventCount: events.length, opportunityDiagnostics: race.opportunityRecords.length,
            eventCap: race.guardLimits.maxMechanicalEvents, opportunityDiagnosticCap: race.guardLimits.maxOpportunityDiagnostics,
            wallContacts: events.filter((event) => event.type === 'wall-impact' || event.type === 'wall-overlap').length,
            duckContacts: events.filter((event) => event.type === 'duck-contact').length,
            weaveScheduled: race.opportunityRecords.length, weaveActivated: race.opportunityRecords.filter((item) => item.status === 'activated').length,
            leaderSlowdowns: slowdownEvents.length,
            leaderSlowdownTicks: slowdownEvents.reduce((sum, event) => sum + (event.actualTicks ?? 0), 0),
            leaderSlowdownSpeedDelta: +slowdownEvents.reduce((sum, event) => sum + (event.speedDelta ?? 0), 0).toFixed(3),
            leaderPenaltyEvents: slowdownEvents.map(({ id, tick, triggerTick, endTick, participants, targetSpeedFactor, durationLimitTicks, actualTicks, durationTicks, speedDelta, status }) =>
              ({ id, tick, triggerTick, endTick, participants, targetSpeedFactor, durationLimitTicks, actualTicks, durationTicks, speedDelta, status })),
            upgradedWeaves: 0,
            guardEvidence: race.guardEvidence },
        });
      }
    }

function aggregate(arm) {
  const rows = attempts.filter((row) => row.arm === arm);
  const finished = rows.filter((row) => row.status === 'finished');
  const times = finished.map((row) => row.finishTimeSeconds);
  const executedStatuses = new Set(['executed', 'completed', 'ended-with-race']);
  const speedBands = {};
  for (const row of rows) for (const item of row.assistance.opportunities) {
    const band = item.topSpeed < 14 ? 'weak-under-14' : item.topSpeed < 17 ? 'middle-14-to-under-17' : 'strong-17-plus';
    const group = speedBands[band] ?? { scheduled: 0, eligible: 0, executed: 0, saturatedAtOpportunity: 0, accelerationTicks: 0, saturatedAccelerationTicks: 0, recenterTicks: 0, raisedTurnCapTicks: 0, turnCapReliefTicks: 0, appliedSpeedGain: 0 };
    group.scheduled += 1;
    group.eligible += item.reasons.length === 0 ? 1 : 0;
    group.executed += executedStatuses.has(item.status) ? 1 : 0;
    group.saturatedAtOpportunity += item.speedSaturatedAtOpportunity ? 1 : 0;
    group.accelerationTicks += item.accelerationTicks;
    group.saturatedAccelerationTicks += item.saturatedTicks;
    group.recenterTicks += item.recenterTicks;
    group.raisedTurnCapTicks += item.raisedTurnCapTicks;
    group.turnCapReliefTicks += item.turnCapReliefTicks;
    group.appliedSpeedGain += item.appliedSpeedGain;
    speedBands[band] = group;
  }
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
      gapEligible: rows.reduce((s, row) => s + row.assistance.gapEligible, 0), eligible: rows.reduce((s, row) => s + row.assistance.eligible, 0),
      executed: rows.reduce((s, row) => s + row.assistance.executed, 0), actualAccelerationTicks: rows.reduce((s, row) => s + row.assistance.actualAccelerationTicks, 0),
      saturatedAccelerationTicks: rows.reduce((s, row) => s + row.assistance.saturatedAccelerationTicks, 0),
      recenterTicks: rows.reduce((s, row) => s + row.assistance.recenterTicks, 0), raisedTurnCapTicks: rows.reduce((s, row) => s + row.assistance.raisedTurnCapTicks, 0),
      turnCapReliefTicks: rows.reduce((s, row) => s + row.assistance.turnCapReliefTicks, 0),
      appliedSpeedGainSum: +rows.reduce((s, row) => s + row.assistance.appliedSpeedGainSum, 0).toFixed(3),
      byMappedTopSpeedBand: Object.fromEntries(Object.entries(speedBands).map(([band, value]) => [band, { ...value, appliedSpeedGain: +value.appliedSpeedGain.toFixed(3) }])) },
    mechanics: { meanEvents: rows.reduce((s, row) => s + row.mechanics.eventCount, 0) / rows.length,
      maxEvents: Math.max(...rows.map((row) => row.mechanics.eventCount)), maxWeaveDiagnostics: Math.max(...rows.map((row) => row.mechanics.opportunityDiagnostics)),
      wallContacts: rows.reduce((s, row) => s + row.mechanics.wallContacts, 0), duckContacts: rows.reduce((s, row) => s + row.mechanics.duckContacts, 0),
      weaveActivated: rows.reduce((s, row) => s + row.mechanics.weaveActivated, 0),
      leaderSlowdowns: rows.reduce((s, row) => s + row.mechanics.leaderSlowdowns, 0),
      leaderSlowdownTicks: rows.reduce((s, row) => s + row.mechanics.leaderSlowdownTicks, 0),
      leaderSlowdownSpeedDelta: +rows.reduce((s, row) => s + row.mechanics.leaderSlowdownSpeedDelta, 0).toFixed(3),
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

const payload = { provenance: { study: 'Plan 23 drama study 02', approvedScope: 'root-approved headless report-only four-arm screen; no production/canonical/reference write', source: 'accepted Plan 13 race-physics.mjs; in-memory affine adapter and arm-specific transforms only',
  referenceSourceSha256: sourceHash, model: 'topSpeed = 8.25 + 0.5 * sampledPerformance; accepted base/rest/trial/stance order is unchanged', experiment,
  seeds: seedNames, cells: '3 roster tiers × 2 field/race inputs × 2 stances × 2 trial states × 3 rest factors = 72', arms: armNames,
  attempts: attempts.length, expectedAttempts: 1728, parityWitnesses: parity, affineFormulaOwnerReviewOnly: true,
  quantileMethod: 'nearest rank: sorted[Math.ceil(p*n)-1]',
  studyOnlyConstants: { assistance: 'every40 ticks; 0.5 keyed success; rank4-6; gap>=2m; acceleration5 vs3 for max40 ticks; recovery/recentering lookahead6m vs10m; turn cap min(90,1.5x current); correction max20deg; cooldown80; max2 windows/entrant; topSpeed, braking and nominal corner target unchanged',
    leaderSlowdown: 'when a rank1-2 weave enters hold, targetSpeed x0.8 for at most20 ticks; unchanged12-16deg target/10tick hold, normal braking/acceleration; nonstacking, max2/entrant' },
  limitRules: { mechanicalEvents: 128, weaveOpportunityDiagnostics: 84, separateAssistanceSidecarRecords: 120, watchdogTicks: 800 },
  order: 'Per tick, freeze rank/gap at tick start; process existing weave keys/opportunity; process assistance from the frozen snapshot; then advance speed/turn and recovery. Slowdown triggers from tick-start rank when a weave enters hold. Penalty/assistance episode endpoints are frozen at their actual ends.' },
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
console.log(JSON.stringify({ parity, summaries, paired }, null, 2));
