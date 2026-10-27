const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function individualPresentationTiming(base, resolution) {
  const duration = resolution.lastFinishTimeSeconds;
  const firstCrossSeconds = resolution.finishTimeSeconds;
  const highlightSeconds = base.highlightSeconds;
  const highlightBandSeconds = firstCrossSeconds * 0.06;
  const highlightCenterSeconds = firstCrossSeconds * 0.5;
  const highlightStartSeconds = highlightCenterSeconds - highlightBandSeconds / 2;
  const highlightEndSeconds = highlightCenterSeconds + highlightBandSeconds / 2;
  const highlightStartFraction = clamp(highlightStartSeconds / duration, 0, 0.94);
  const highlightEndFraction = clamp(highlightEndSeconds / duration, highlightStartFraction, 1);
  const simulationWallSeconds = duration + highlightSeconds;
  const resultRevealSeconds = 1;

  return {
    ...base,
    duration,
    simulationWallSeconds,
    highlightStartFraction,
    highlightEndFraction,
    resultRevealSeconds,
    resultRevealStartMilliseconds: simulationWallSeconds * 1000,
    totalWallSeconds: simulationWallSeconds + resultRevealSeconds,
  };
}

export function raceFractionAtPlanWallClock(elapsedSeconds, plan) {
  const { duration, highlightSeconds } = plan;
  const start = plan.highlightStartFraction ?? 0.47;
  const end = plan.highlightEndFraction ?? 0.53;
  const elapsed = clamp(elapsedSeconds, 0, duration + highlightSeconds);
  if (!highlightSeconds) return elapsed / duration;
  const baseStart = start * duration;
  const slowedWallSpan = duration * (end - start) + highlightSeconds;
  const baseEnd = baseStart + slowedWallSpan;
  if (elapsed <= baseStart) return elapsed / duration;
  if (elapsed < baseEnd) return start + ((elapsed - baseStart) / slowedWallSpan) * (end - start);
  return Math.min(1, end + (elapsed - baseEnd) / duration);
}

export function wallClockAtPlanFraction(fraction, plan) {
  const f = clamp(fraction, 0, 1);
  const { duration, highlightSeconds } = plan;
  const start = plan.highlightStartFraction ?? 0.47;
  const end = plan.highlightEndFraction ?? 0.53;
  if (!highlightSeconds) return f * duration;
  const slowedWallSpan = duration * (end - start) + highlightSeconds;
  if (f <= start) return f * duration;
  if (f <= end) return start * duration + ((f - start) / (end - start)) * slowedWallSpan;
  return start * duration + slowedWallSpan + (f - end) * duration;
}

export function revealProgressAtElapsedMilliseconds(elapsedMilliseconds, plan) {
  if (!plan.resultRevealSeconds) return 0;
  const elapsedSinceRevealStart = elapsedMilliseconds - plan.resultRevealStartMilliseconds;
  return clamp(elapsedSinceRevealStart / (plan.resultRevealSeconds * 1000), 0, 1);
}

export function resultRevealDueAtElapsedMilliseconds(elapsedMilliseconds, plan) {
  return Boolean(plan.resultRevealSeconds) && elapsedMilliseconds >= plan.resultRevealStartMilliseconds;
}

export function cameraFractionAtTick(cursorTick, firstCrossTick, totalTicks) {
  if (!Number.isFinite(firstCrossTick) || firstCrossTick <= 0) return clamp(cursorTick / totalTicks, 0, 1);
  return clamp(cursorTick / firstCrossTick, 0, 1);
}

export function playbackStateAtSeek(tick) {
  return {
    cursorTick: tick,
    finished: false,
    podiumVisible: false,
    resultRevealStarted: false,
    resultRevealProgress: 0,
  };
}
