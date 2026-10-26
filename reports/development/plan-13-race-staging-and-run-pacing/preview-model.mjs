import { createRng } from '../../../src/core/prng.mjs';

export const PREVIEW_RULES = Object.freeze({
  eventBeats: Object.freeze([0.4, 0.7]),
  bobbleProbability: 0.05,
  draftRollStart: 0.05,
  draftProbability: 0.2,
  draftGapFraction: 0.02,
  eventDeltaFraction: 0.02,
  trialMultiplier: 1.05,
  payoutByPlace: Object.freeze([50, 20, 10]),
});

const CHOICES = new Set(['steady', 'sprint', 'drafting']);
const MODELS = new Set(['causal', 'resolved']);
const CAMERA_MODES = new Set(['wide', 'close']);
const DURATIONS = new Set([12, 20, 30]);
const HIGHLIGHTS = new Set([0, 1, 2]);
const LIGHTING = new Set(['neutral', 'warm']);

function validateInputs(input) {
  if (!input || typeof input !== 'object') throw new TypeError('race input is required');
  if (typeof input.seed !== 'string' || !input.seed.trim()) throw new TypeError('seed must be a non-empty string');
  if (typeof input.raceId !== 'string' || !input.raceId.trim()) throw new TypeError('raceId must be a non-empty string');
  if (!CHOICES.has(input.choice)) throw new RangeError(`unsupported choice: ${input.choice}`);
  if (!MODELS.has(input.model)) throw new RangeError(`unsupported model: ${input.model}`);
  if (!Number.isFinite(input.playerBaseSpeed) || input.playerBaseSpeed <= 0) throw new RangeError('playerBaseSpeed must be positive');
  if (!Number.isFinite(input.fieldBaseSpeed) || input.fieldBaseSpeed <= 0) throw new RangeError('fieldBaseSpeed must be positive');
  if (input.trialCommitted !== undefined && typeof input.trialCommitted !== 'boolean') throw new TypeError('trialCommitted must be boolean');
}

function rank(entrants, fraction, { includeOffsets = true } = {}) {
  return [...entrants].sort((a, b) => {
    const aScore = a.speed * 100 * fraction + (includeOffsets ? a.offset : 0);
    const bScore = b.speed * 100 * fraction + (includeOffsets ? b.offset : 0);
    if (Math.abs(bScore - aScore) > 1e-8) return bScore - aScore;
    if (a.player) return -1;
    if (b.player) return 1;
    return a.lane - b.lane;
  });
}

function performanceSpeed(entrant, input, draw) {
  const base = entrant.player
    ? input.playerBaseSpeed * (input.trialCommitted ? PREVIEW_RULES.trialMultiplier : 1)
    : input.fieldBaseSpeed;
  if (!entrant.player) return base * (1 + (2 * draw - 1) * 0.05);
  if (input.choice === 'sprint') return base * 1.1 * (1 + (2 * draw - 1) * 0.2);
  // Candidate finding: Drafting currently shares Steady's exact baseline formula.
  return base * (1 + (2 * draw - 1) * 0.05);
}

/**
 * Resolve a named-seed race using Quackpot's canonical PRNG without mutating it.
 * Candidate event values are preview rules, not accepted production mechanics.
 */
export function resolveSeededRace(input) {
  validateInputs(input);
  const normalized = {
    seed: input.seed,
    raceId: input.raceId,
    model: input.model,
    choice: input.choice,
    trialCommitted: input.trialCommitted ?? false,
    playerBaseSpeed: input.playerBaseSpeed,
    fieldBaseSpeed: input.fieldBaseSpeed,
  };

  const raceRoot = createRng(normalized.seed).fork(`race:${normalized.raceId}`);
  const performanceRng = raceRoot.fork('performance');
  const eventRng = raceRoot.fork('events');
  const entrants = [
    { id: 'A', name: 'Rival A', lane: 1, player: false },
    { id: 'P', name: 'Player', lane: 2, player: true },
    { id: 'B', name: 'Rival B', lane: 3, player: false },
    { id: 'C', name: 'Rival C', lane: 4, player: false },
    { id: 'D', name: 'Rival D', lane: 5, player: false },
    { id: 'E', name: 'Rival E', lane: 6, player: false },
  ].map((entrant) => {
    const performanceDraw = performanceRng.next();
    const speed = performanceSpeed(entrant, normalized, performanceDraw);
    return {
      ...entrant,
      performanceDraw,
      speed,
      baselineScore: speed * 100,
      offset: 0,
    };
  });

  const eventRecords = [];
  let eventDrawCount = 0;
  if (normalized.model === 'causal') {
    for (const beat of PREVIEW_RULES.eventBeats) {
      const frozenOrder = rank(entrants, beat);
      const scoreAtBeat = new Map(entrants.map((entrant) => [
        entrant.id,
        entrant.baselineScore * beat + entrant.offset,
      ]));
      const pending = [];

      for (const entrant of [...entrants].sort((a, b) => a.lane - b.lane)) {
        const eventDraw = eventRng.next();
        eventDrawCount += 1;
        const orderIndex = frozenOrder.findIndex((candidate) => candidate.id === entrant.id);
        const ahead = orderIndex > 0 ? frozenOrder[orderIndex - 1] : null;
        const gap = ahead ? scoreAtBeat.get(ahead.id) - scoreAtBeat.get(entrant.id) : null;
        const eligible = Boolean(ahead && gap <= entrant.baselineScore * PREVIEW_RULES.draftGapFraction);
        let event = 'none';
        let delta = 0;
        let reason = 'roll outside event ranges';

        if (eventDraw < PREVIEW_RULES.bobbleProbability) {
          event = 'bobble';
          delta = -entrant.baselineScore * PREVIEW_RULES.eventDeltaFraction;
          reason = 'roll below 0.05';
        } else if (eligible && eventDraw < PREVIEW_RULES.draftRollStart + PREVIEW_RULES.draftProbability) {
          event = 'clean-draft';
          delta = entrant.baselineScore * PREVIEW_RULES.eventDeltaFraction;
          reason = 'eligible gap and roll in [0.05, 0.25)';
        } else if (!ahead) {
          reason = 'leading at beat start';
        } else if (!eligible) {
          reason = 'outside the 2% draft gap';
        }

        pending.push({
          entrant, beat, eventDraw, event, delta, reason, eligible, gap,
          offsetBefore: entrant.offset,
        });
      }

      // A beat's eligibility is frozen; effects land simultaneously after all lane rolls.
      for (const result of pending) result.entrant.offset += result.delta;
      for (const result of pending) {
        eventRecords.push({
          beat: result.beat,
          id: result.entrant.id,
          lane: result.entrant.lane,
          eventDraw: result.eventDraw,
          eligible: result.eligible,
          gap: result.gap,
          event: result.event,
          delta: result.delta,
          progressBefore: result.entrant.baselineScore * result.beat + result.offsetBefore,
          progressAfter: result.entrant.baselineScore * result.beat + result.entrant.offset,
          offsetAfter: result.entrant.offset,
          reason: result.reason,
        });
      }
    }
  }

  const finish = rank(entrants, 1).map((entrant, index) => ({
    ...entrant,
    place: index + 1,
    score: entrant.baselineScore + entrant.offset,
    payout: PREVIEW_RULES.payoutByPlace[index] ?? 0,
  }));
  const result = {
    rulesVersion: 'plan13-preview-candidate-1',
    seed: normalized.seed,
    raceId: normalized.raceId,
    model: normalized.model,
    choice: normalized.choice,
    inputs: normalized,
    trialConsumptionCount: normalized.trialCommitted ? 1 : 0,
    entrants: entrants.map((entrant) => ({
      id: entrant.id,
      name: entrant.name,
      lane: entrant.lane,
      player: entrant.player,
      performanceDraw: entrant.performanceDraw,
      speed: entrant.speed,
      baselineScore: entrant.baselineScore,
      offset: entrant.offset,
    })),
    eventRecords,
    finish: finish.map(({ id, name, lane, player, speed, baselineScore, offset, place, score, payout }) => ({
      id, name, lane, player, speed, baselineScore, offset, place, score, payout,
    })),
    draws: {
      performance: entrants.length,
      events: eventDrawCount,
      total: entrants.length + eventDrawCount,
    },
    streamSnapshots: {
      performance: performanceRng.serialize(),
      events: eventRng.serialize(),
    },
  };
  return deepFreeze(result);
}

export function buildPresentationPlan(resolution, options = {}) {
  const duration = Number(options.duration ?? 20);
  const camera = options.camera ?? 'wide';
  const reducedMotion = Boolean(options.reducedMotion);
  const staticMode = Boolean(options.staticMode);
  const skipped = Boolean(options.skipped);
  const replay = Boolean(options.replay);
  const highlightSeconds = Number(options.highlightSeconds ?? 0);
  const lighting = options.lighting ?? 'neutral';
  if (!DURATIONS.has(duration)) throw new RangeError('duration must be 12, 20, or 30 seconds');
  if (!CAMERA_MODES.has(camera)) throw new RangeError('camera must be wide or close');
  if (!HIGHLIGHTS.has(highlightSeconds)) throw new RangeError('highlightSeconds must be 0, 1, or 2');
  if (!LIGHTING.has(lighting)) throw new RangeError('lighting must be neutral or warm');

  const staticPresentation = staticMode || reducedMotion || skipped;
  const visualLanePaths = resolution.entrants.map((entrant) => createVisualLanePath(entrant));
  const frames = staticPresentation
    ? [{ normalizedTime: 1, elapsedSeconds: 0, camera: 'wide', zoom: 1, static: true }]
    : [0, 0.3, 0.4, 0.7, 1].map((normalizedTime) => ({
      normalizedTime,
      elapsedSeconds: raceWallClockAtFraction(normalizedTime, duration, highlightSeconds),
      camera: camera,
      zoom: camera === 'close' ? closeZoomAt(normalizedTime) : 1,
      static: false,
    }));

  return deepFreeze({
    duration,
    camera,
    reducedMotion,
    staticMode,
    skipped,
    replay,
    highlightSeconds,
    highlightBeat: highlightSeconds > 0 ? 0.4 : null,
    totalWallSeconds: duration + highlightSeconds,
    lighting,
    laneChangesEnabled: false,
    visualLanePaths,
    frames,
    resultFingerprint: raceFingerprint(resolution),
  });
}

export function visualLaneAt(path, normalizedTime) {
  if (!path?.points?.length) throw new TypeError('a visual lane path is required');
  const t = Math.max(0, Math.min(1, normalizedTime));
  const points = path.points;
  for (let index = 1; index < points.length; index += 1) {
    const next = points[index];
    if (t <= next.at) {
      const prior = points[index - 1];
      const local = (t - prior.at) / (next.at - prior.at);
      const eased = smoothstep(Math.max(0, Math.min(1, local)));
      return prior.lane + (next.lane - prior.lane) * eased;
    }
  }
  return points.at(-1).lane;
}

export function presentationProgressFraction(entrant, finish, normalizedTime) {
  const t = Math.max(0, Math.min(1, normalizedTime));
  const leaderScore = Math.max(...finish.map((item) => item.score));
  const ownFinish = finish.find((item) => item.id === entrant.id)?.score ?? entrant.baselineScore;
  const easing = smoothstep(t);
  const finalGap = (ownFinish - leaderScore) / 600;
  const phase = (entrant.id.charCodeAt(0) % 7) * (Math.PI / 3.5);
  const presentationSurge = 0.018 * Math.sin(Math.PI * t) * Math.sin((Math.PI * 2 * t) + phase);
  return Math.max(0, t + finalGap * easing + presentationSurge);
}

export function raceFractionAtWallClock(elapsedSeconds, { duration, highlightSeconds = 0 } = {}) {
  if (!DURATIONS.has(Number(duration)) || !HIGHLIGHTS.has(Number(highlightSeconds))) {
    throw new RangeError('invalid presentation timing');
  }
  const elapsed = Math.max(0, Math.min(Number(duration) + Number(highlightSeconds), elapsedSeconds));
  if (highlightSeconds === 0) return elapsed / duration;
  const slowStart = duration * 0.38;
  const baseSlowLength = duration * 0.04;
  const slowEnd = slowStart + baseSlowLength + highlightSeconds;
  if (elapsed <= slowStart) return elapsed / duration;
  if (elapsed < slowEnd) return 0.38 + ((elapsed - slowStart) / (baseSlowLength + highlightSeconds)) * 0.04;
  return Math.min(1, 0.42 + (elapsed - slowEnd) / duration);
}

function createVisualLanePath(entrant) {
  const visualSlot = { A: [1, 0], P: [2, 0], B: [1, 1], C: [2, 1], D: [1, 2], E: [2, 2] };
  const [lane, row] = visualSlot[entrant.id] ?? [1, 0];
  return { logicalLane: entrant.lane, lane, row, points: [{ at: 0, lane }, { at: 1, lane }] };
}

function raceWallClockAtFraction(fraction, duration, highlightSeconds) {
  if (highlightSeconds === 0) return fraction * duration;
  if (fraction <= 0.38) return fraction * duration;
  if (fraction <= 0.42) return duration * 0.38 + ((fraction - 0.38) / 0.04) * (duration * 0.04 + highlightSeconds);
  return duration * 0.42 + highlightSeconds + (fraction - 0.42) * duration;
}

function closeZoomAt(fraction) {
  if (fraction < 0.34 || fraction > 0.76) return 1;
  if (fraction < 0.42) return 1 + smoothstep((fraction - 0.34) / 0.08) * 0.16;
  if (fraction <= 0.66) return 1.16;
  return 1.16 - smoothstep((fraction - 0.66) / 0.1) * 0.16;
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

export function savePresentationSnapshot(resolution, options = {}) {
  return JSON.stringify({
    version: 1,
    resolution,
    presentation: buildPresentationPlan(resolution, options),
  });
}

export function restorePresentationSnapshot(serialized) {
  const snapshot = JSON.parse(serialized);
  if (snapshot.version !== 1 || !snapshot.resolution || !snapshot.presentation) {
    throw new Error('Unrecognized Plan 13 preview snapshot');
  }
  if (raceFingerprint(snapshot.resolution) !== snapshot.presentation.resultFingerprint) {
    throw new Error('Preview snapshot mechanics do not match its presentation fingerprint');
  }
  return deepFreeze(snapshot);
}

export function raceFingerprint(resolution) {
  return JSON.stringify({
    rulesVersion: resolution.rulesVersion,
    seed: resolution.seed,
    raceId: resolution.raceId,
    model: resolution.model,
    choice: resolution.choice,
    inputs: resolution.inputs,
    trialConsumptionCount: resolution.trialConsumptionCount,
    entrants: resolution.entrants,
    eventRecords: resolution.eventRecords,
    finish: resolution.finish,
    draws: resolution.draws,
    streamSnapshots: resolution.streamSnapshots,
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
