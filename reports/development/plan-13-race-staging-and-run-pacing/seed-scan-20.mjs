import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PHYSICS, resolveSeededRace, steeringEquilibrium } from './race-physics.mjs';

const experiments = [
  'controller-tangent', 'controller-recenter', 'weave-symmetric',
  'weave-rank-weighted', 'contact-6deg', 'contact-15-20deg',
];
const seedCount = 20;
const dt = 0.05;
const output = {
  schema: 'quackpot.plan13-seed-scan/v1',
  generatedAt: '2026-10-26',
  method: {
    seeds: Array.from({ length: seedCount }, (_, i) => ({ seed: `Plan13 stability seed ${i}`, raceId: `R${i}` })),
    playerBaseSpeed: 11.7, fieldBaseSpeed: 11.5, choice: 'steady', trialCommitted: false,
    experiments, dt, screenshotWitness: { seed: 'Quackpot Plan 13 named-seed example', raceId: 'R03' },
    summaryNotes: 'One shared PRNG performance sequence per seed/race across all experiment arms. Recovery stages and max lane error are measured per participant from the fixed-step trajectory. Full trajectories are intentionally omitted from this compact artifact; rerun this script to reproduce them.'
  },
  summary: {},
  paired: {},
  runs: [],
  screenshotWitness: [],
};

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function laneOffset(lane) { return lane === 1 ? -0.6 : 0.6; }

function recoveryRows(resolution, experiment) {
  const rows = [];
  for (const event of resolution.eventRecords) {
    if (!['weave-turn', 'duck-contact', 'wall-impact'].includes(event.type)) continue;
    for (const id of event.participants) {
      const detail = event.recovery?.[id];
      if (!detail) continue;
      const entrant = resolution.entrants.find((row) => row.id === id);
      const startSeconds = detail.startedAt ?? event.time;
      const endSeconds = detail.recenteredAt ?? resolution.finishTimeSeconds ?? resolution.horizonSeconds;
      const startTick = startSeconds / dt;
      const endTick = endSeconds / dt;
      let maxLaneError = 0;
      let lateralToleranceSettledAt = null;
      let lateralToleranceTicks = 0;
      let maxHeadingErrorAfterYawRecoveryDeg = 0;
      let lastHeadingErrorAfterYawRecovery = null;
      let wallImpactsAfterStart = 0;
      for (const frame of resolution.trajectory) {
        if (frame.tick < startTick || frame.tick > endTick) continue;
        const state = frame.entrants.find((row) => row.id === id);
        if (state) {
          const lateralError = Math.abs(state.lateral - laneOffset(entrant.lane));
          maxLaneError = Math.max(maxLaneError, lateralError);
          const at = frame.tick * dt;
          lateralToleranceTicks = lateralError <= PHYSICS.recoveryLateralTolerance ? lateralToleranceTicks + 1 : 0;
          lateralToleranceSettledAt = lateralToleranceTicks >= PHYSICS.recoverySettleTicks
            ? Number((at - (PHYSICS.recoverySettleTicks - 1) * dt).toFixed(3)) : null;
          if (Number.isFinite(detail.yawRecoveredAt) && at >= detail.yawRecoveredAt) {
            const delta = state.heading - steeringEquilibrium(state.progress, state.lateral, laneOffset(entrant.lane), 'recenter');
            const errorDeg = Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)) * 180 / Math.PI);
            maxHeadingErrorAfterYawRecoveryDeg = Math.max(maxHeadingErrorAfterYawRecoveryDeg, errorDeg);
            lastHeadingErrorAfterYawRecovery = errorDeg;
          }
        }
      }
      wallImpactsAfterStart = resolution.eventRecords.filter((record) => record.type === 'wall-impact'
        && record.participants.includes(id) && record.time >= startSeconds && record.time <= endSeconds).length;
      rows.push({
        eventId: event.id, type: event.type, entrantId: id,
        startedAt: Number(startSeconds.toFixed(3)),
        acquiredAt: detail.acquiredAt ?? null,
        holdStartAt: detail.holdStartAt ?? null,
        durationToAcquireSeconds: Number.isFinite(detail.acquiredAt) ? Number((detail.acquiredAt - startSeconds).toFixed(3)) : null,
        holdSeconds: detail.holdSeconds ?? null,
        targetOffsetDeg: detail.targetOffsetDeg ?? null,
        yawRecoveredAt: detail.yawRecoveredAt ?? null,
        recenteredAt: detail.recenteredAt ?? null,
        durationToYawRecoveredSeconds: Number.isFinite(detail.yawRecoveredAt) ? Number((detail.yawRecoveredAt - startSeconds).toFixed(3)) : null,
        durationYawRecoveredToRecenterSeconds: Number.isFinite(detail.recenteredAt) && Number.isFinite(detail.yawRecoveredAt) ? Number((detail.recenteredAt - detail.yawRecoveredAt).toFixed(3)) : null,
        lateralToleranceSettledAt,
        durationToRecenterSeconds: Number.isFinite(detail.recenteredAt)
          ? Number((detail.recenteredAt - startSeconds).toFixed(3)) : null,
        durationUntilRaceEndSeconds: Number((endSeconds - startSeconds).toFixed(3)),
        maxAbsLaneErrorMeters: Number(maxLaneError.toFixed(3)),
        maxHeadingErrorAfterYawRecoveryDeg: Number(maxHeadingErrorAfterYawRecoveryDeg.toFixed(3)),
        lastHeadingErrorAfterYawRecoveryDeg: Number.isFinite(lastHeadingErrorAfterYawRecovery) ? Number(lastHeadingErrorAfterYawRecovery.toFixed(3)) : null,
        wallImpactsAfterStart,
        reason: event.reason ?? detail.reason ?? null,
      });
    }
  }
  return rows;
}

function namedContactRecoveryTrace(resolution) {
  const event = resolution.eventRecords.find((row) => row.id === 'duck-contact-208-C-E');
  if (!event) return [];
  const recoveries = ['C', 'E'].map((id) => ({ id, detail: event.recovery[id] }));
  const endSeconds = Math.max(...recoveries.map(({ detail }) => detail.recenteredAt ?? resolution.finishTimeSeconds));
  const samples = [];
  for (let time = event.time; time <= endSeconds + 1e-6; time += 0.5) {
    const frame = resolution.trajectory.reduce((best, current) => Math.abs(current.tick * dt - time) < Math.abs(best.tick * dt - time) ? current : best);
    for (const { id } of recoveries) {
      const entrant = resolution.entrants.find((row) => row.id === id);
      const state = frame.entrants.find((row) => row.id === id);
      const equilibrium = steeringEquilibrium(state.progress, state.lateral, laneOffset(entrant.lane), 'recenter');
      const headingErrorDeg = Math.atan2(Math.sin(state.heading - equilibrium), Math.cos(state.heading - equilibrium)) * 180 / Math.PI;
      samples.push({
        entrantId: id, time: Number((frame.tick * dt).toFixed(2)),
        lateralErrorMeters: Number((state.lateral - laneOffset(entrant.lane)).toFixed(3)),
        headingErrorToEquilibriumDeg: Number(headingErrorDeg.toFixed(3)),
      });
    }
  }
  return samples;
}

function runOne(seed, raceId, experiment) {
  const resolution = resolveSeededRace({
    seed, raceId, playerBaseSpeed: 11.7, fieldBaseSpeed: 11.5,
    choice: 'steady', trialCommitted: false, experiment,
  });
  const events = resolution.eventRecords;
  return {
    seed, raceId, experiment,
    status: resolution.status,
    unresolvedReason: resolution.unresolvedReason,
    finishTimeSeconds: resolution.finishTimeSeconds,
    horizonSeconds: resolution.horizonSeconds,
    winner: resolution.winner,
    finishOrder: resolution.finish.map((row) => row.id),
    places: resolution.finish.map(({ id, place }) => ({ id, place })),
    draws: resolution.draws,
    performanceDraws: resolution.entrants.map(({ id, performanceDraw }) => ({ id, value: performanceDraw })),
    drawKeys: resolution.drawKeys,
    eventCounts: Object.fromEntries([...new Set(events.map((event) => event.type))].map((type) => [type, events.filter((event) => event.type === type).length])),
    opportunityCounts: {
      due: resolution.opportunityRecords.length,
      activated: resolution.opportunityRecords.filter((row) => row.status === 'activated').length,
      skipped: resolution.opportunityRecords.filter((row) => row.status === 'skipped').length,
      truncated: resolution.opportunityRecords.length >= 84,
    },
    eventRecords: events,
    opportunityRecords: resolution.opportunityRecords,
    recoveryRows: recoveryRows(resolution, experiment),
    contactRecoveryTrace: seed === 'Quackpot Plan 13 named-seed example' && experiment === 'contact-15-20deg'
      ? namedContactRecoveryTrace(resolution) : undefined,
    trajectory: resolution.trajectory.map((frame) => ({
      tick: frame.tick,
      entrants: frame.entrants.map(({ id, x, y, progress, lateral, heading, speed }) => ({ id, x, y, progress, lateral, heading, speed })),
    })),
  };
}

for (let i = 0; i < seedCount; i += 1) {
  for (const experiment of experiments) output.runs.push(runOne(`Plan13 stability seed ${i}`, `R${i}`, experiment));
}
for (const experiment of experiments) output.screenshotWitness.push(runOne('Quackpot Plan 13 named-seed example', 'R03', experiment));

for (const experiment of experiments) {
  const runs = output.runs.filter((run) => run.experiment === experiment);
  const times = runs.map((run) => run.finishTimeSeconds).filter(Number.isFinite);
  const recoveries = runs.flatMap((run) => run.recoveryRows);
  const weaveEvents = recoveries.filter((row) => row.type === 'weave-turn');
  const episodeSeconds = runs.map((run) => run.recoveryRows.reduce((sum, row) => sum + row.durationUntilRaceEndSeconds, 0));
  output.summary[experiment] = {
    runs: runs.length,
    finished: runs.filter((run) => run.status === 'finished').length,
    unresolved: runs.filter((run) => run.status !== 'finished').length,
    finishTime: times.length ? { min: Math.min(...times), median: median(times), mean: Number((times.reduce((s, n) => s + n, 0) / times.length).toFixed(3)), max: Math.max(...times) } : null,
    totalMechanicalEvents: runs.reduce((sum, run) => sum + run.eventRecords.length, 0),
    eventCounts: Object.fromEntries(['duck-contact', 'wall-impact', 'weave-turn', 'finish-line-crossing'].map((type) => [type, runs.reduce((sum, run) => sum + (run.eventCounts[type] ?? 0), 0)])),
    opportunities: {
      due: runs.reduce((sum, run) => sum + run.opportunityCounts.due, 0),
      activated: runs.reduce((sum, run) => sum + run.opportunityCounts.activated, 0),
      skipped: runs.reduce((sum, run) => sum + run.opportunityCounts.skipped, 0),
      activationRateAmongDue: (() => { const n = runs.reduce((sum, run) => sum + run.opportunityCounts.due, 0); return n ? Number((runs.reduce((sum, run) => sum + run.opportunityCounts.activated, 0) / n).toFixed(3)) : null; })(),
    },
    weaveRecovery: {
      actualWeaveEpisodes: weaveEvents.length,
      attainedHalfSecondHold: weaveEvents.filter((row) => row.holdSeconds >= 0.5).length,
      recenteredBeforeFinish: weaveEvents.filter((row) => row.recenteredAt !== null).length,
      medianHoldSeconds: median(weaveEvents.map((row) => row.holdSeconds ?? 0)),
      medianDurationToRecenterSeconds: median(weaveEvents.map((row) => row.durationToRecenterSeconds).filter(Number.isFinite)),
      medianMaxLaneErrorMeters: median(weaveEvents.map((row) => row.maxAbsLaneErrorMeters)),
    },
    contactRecovery: (() => {
      const contacts = recoveries.filter((row) => row.type === 'duck-contact');
      const finite = (field) => contacts.map((row) => row[field]).filter(Number.isFinite);
      return {
        participantEpisodes: contacts.length,
        recenteredBeforeFinish: contacts.filter((row) => row.recenteredAt !== null).length,
        medianAcquireSeconds: median(finite('durationToAcquireSeconds')),
        medianHoldSeconds: median(finite('holdSeconds')),
        medianYawRecoverySeconds: median(finite('durationToYawRecoveredSeconds')),
        medianYawToLaneSeconds: median(finite('durationYawRecoveredToRecenterSeconds')),
        medianTotalRecoverySeconds: median(finite('durationToRecenterSeconds')),
        maxTotalRecoverySeconds: finite('durationToRecenterSeconds').length ? Math.max(...finite('durationToRecenterSeconds')) : null,
        medianMaxLaneErrorMeters: median(finite('maxAbsLaneErrorMeters')),
        wallImpactsDuringRecovery: contacts.reduce((sum, row) => sum + row.wallImpactsAfterStart, 0),
      };
    })(),
    recoveryDurationSecondsPerRace: { median: median(episodeSeconds), mean: Number((episodeSeconds.reduce((s, n) => s + n, 0) / episodeSeconds.length).toFixed(3)), max: Math.max(...episodeSeconds) },
  };
}

function pairSummary(leftExperiment, rightExperiment) {
  const pairs = Array.from({ length: seedCount }, (_, index) => {
    const left = output.runs.find((run) => run.raceId === `R${index}` && run.experiment === leftExperiment);
    const right = output.runs.find((run) => run.raceId === `R${index}` && run.experiment === rightExperiment);
    let maxPositionDifference = 0;
    for (let frame = 0; frame < Math.min(left.trajectory.length, right.trajectory.length); frame += 1) {
      for (let entrant = 0; entrant < 6; entrant += 1) {
        const a = left.trajectory[frame].entrants[entrant]; const b = right.trajectory[frame].entrants[entrant];
        maxPositionDifference = Math.max(maxPositionDifference, Math.hypot(a.x - b.x, a.y - b.y));
      }
    }
    return {
      raceId: left.raceId, seed: left.seed,
      leftWinner: left.winner, rightWinner: right.winner,
      leftOrder: left.finishOrder, rightOrder: right.finishOrder,
      finishOrderChanged: left.finishOrder.join('|') !== right.finishOrder.join('|'),
      winnerChanged: left.winner !== right.winner,
      finishTimeDeltaSeconds: left.finishTimeSeconds === null || right.finishTimeSeconds === null ? null : Number((right.finishTimeSeconds - left.finishTimeSeconds).toFixed(6)),
      performanceDrawsIdentical: JSON.stringify(left.performanceDraws) === JSON.stringify(right.performanceDraws),
      maxMatchedTickPositionDifferenceMeters: Number(maxPositionDifference.toFixed(3)),
      trajectoryChangedByAtLeast1cm: maxPositionDifference >= 0.01,
      leftRecoverySeconds: left.recoveryRows.reduce((sum, row) => sum + row.durationUntilRaceEndSeconds, 0),
      rightRecoverySeconds: right.recoveryRows.reduce((sum, row) => sum + row.durationUntilRaceEndSeconds, 0),
    };
  });
  return {
    leftExperiment, rightExperiment,
    seeds: pairs.length,
    winnersChanged: pairs.filter((row) => row.winnerChanged).length,
    finishOrdersChanged: pairs.filter((row) => row.finishOrderChanged).length,
    trajectoriesChangedAtLeast1cm: pairs.filter((row) => row.trajectoryChangedByAtLeast1cm).length,
    identicalPerformanceDrawPairs: pairs.filter((row) => row.performanceDrawsIdentical).length,
    finishTimeDeltaRangeSeconds: { min: Math.min(...pairs.map((row) => row.finishTimeDeltaSeconds)), max: Math.max(...pairs.map((row) => row.finishTimeDeltaSeconds)) },
    recoverySecondsDifferencePerRaceMedian: median(pairs.map((row) => row.rightRecoverySeconds - row.leftRecoverySeconds)),
    pairs,
  };
}

output.paired['controller-recenter__weave-symmetric'] = pairSummary('controller-recenter', 'weave-symmetric');
output.paired['controller-recenter__weave-rank-weighted'] = pairSummary('controller-recenter', 'weave-rank-weighted');
output.paired['contact-6deg__contact-15-20deg'] = pairSummary('contact-6deg', 'contact-15-20deg');
for (const run of [...output.runs, ...output.screenshotWitness]) delete run.trajectory;
const folder = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(folder, 'seed-scan-20.json'), `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(JSON.stringify({ summary: output.summary, paired: Object.fromEntries(Object.entries(output.paired).map(([key, value]) => [key, { seeds: value.seeds, winnersChanged: value.winnersChanged, finishOrdersChanged: value.finishOrdersChanged, trajectoriesChangedAtLeast1cm: value.trajectoriesChangedAtLeast1cm, finishTimeDeltaRangeSeconds: value.finishTimeDeltaRangeSeconds, recoverySecondsDifferencePerRaceMedian: value.recoverySecondsDifferencePerRaceMedian }])) }, null, 2));
