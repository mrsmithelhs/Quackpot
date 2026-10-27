const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function individualPresentationTiming(resolution) {
  const duration = resolution.lastFinishTimeSeconds;
  const firstCrossSeconds = resolution.finishTimeSeconds;
  const highlightSeconds = 2;
  const band = firstCrossSeconds * 0.06;
  const center = firstCrossSeconds * 0.5;
  const highlightStartFraction = clamp((center - band / 2) / duration, 0, 0.94);
  const highlightEndFraction = clamp((center + band / 2) / duration, highlightStartFraction, 1);
  return {
    duration,
    highlightSeconds,
    highlightStartFraction,
    highlightEndFraction,
    simulationWallSeconds: duration + highlightSeconds,
    revealSeconds: 1,
  };
}

export function raceFractionAtWallClock(elapsedSeconds, plan) {
  const { duration, highlightSeconds } = plan;
  const start = plan.highlightStartFraction;
  const end = plan.highlightEndFraction;
  const elapsed = clamp(elapsedSeconds, 0, duration + highlightSeconds);
  const baseStart = start * duration;
  const slowSpan = duration * (end - start) + highlightSeconds;
  const baseEnd = baseStart + slowSpan;
  if (elapsed <= baseStart) return elapsed / duration;
  if (elapsed < baseEnd) return start + ((elapsed - baseStart) / slowSpan) * (end - start);
  return Math.min(1, end + (elapsed - baseEnd) / duration);
}

export function wallClockAtRaceFraction(fraction, plan) {
  const f = clamp(fraction, 0, 1);
  const { duration, highlightSeconds } = plan;
  const start = plan.highlightStartFraction;
  const end = plan.highlightEndFraction;
  const slowSpan = duration * (end - start) + highlightSeconds;
  if (f <= start) return f * duration;
  if (f <= end) return start * duration + ((f - start) / (end - start)) * slowSpan;
  return start * duration + slowSpan + (f - end) * duration;
}

function eventLine(event, labels) {
  const names = (event.participants ?? []).map((id) => labels[id] ?? id);
  const subject = names.length ? names.join(' and ') : 'The field';
  if (event.type === 'duck-contact') return `${subject} made contact and recovered.`;
  if (event.type === 'wall-impact' || event.type === 'wall-contact') return `${subject} touched the wall and recovered.`;
  if (event.type === 'leader-wobble-slowdown' || event.type === 'leader-slowdown') return `${subject} lost speed briefly while leading.`;
  if (event.type === 'catch-up-assist') return `${subject} got a brief push from behind.`;
  if (event.type === 'finish-line-crossing') return `${subject} crossed the finish line.`;
  if (event.type === 'weave-turn') return `${subject} shifted across the course.`;
  return `${subject}: ${String(event.type).replaceAll('-', ' ')}.`;
}

export function describeRaceEvent(event, labels = {}) {
  return eventLine(event, labels);
}

export function createRacePlaybackController(container, resolution, {
  active = true,
  initialSnapshot = null,
  entrantLabels = {},
  onState = () => {},
  onAction = () => {},
  onCueDisplayed = () => {},
  onMotionEnabled = () => {},
  matchMedia = globalThis.matchMedia?.bind(globalThis),
  documentRef = globalThis.document,
  requestFrame = globalThis.requestAnimationFrame?.bind(globalThis),
  cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
  now = () => globalThis.performance?.now?.() ?? Date.now(),
} = {}) {
  if (!resolution || resolution.status !== 'finished' || !Array.isArray(resolution.trajectory)) {
    throw new TypeError('finished committed race resolution required');
  }
  const plan = individualPresentationTiming(resolution);
  const totalTicks = resolution.trajectory.at(-1).tick;
  const totalWallMs = (plan.simulationWallSeconds + plan.revealSeconds) * 1000;
  const media = matchMedia?.('(prefers-reduced-motion: reduce)');
  let reduced = Boolean(media?.matches);
  let visible = documentRef?.visibilityState !== 'hidden';
  let isActive = Boolean(active);
  let userPaused = Boolean(initialSnapshot?.userPaused);
  let playing = false;
  let destroyed = false;
  let frameId = null;
  let lastFrameTime = null;
  let elapsedMs = Number.isFinite(initialSnapshot?.elapsedMs) ? clamp(initialSnapshot.elapsedMs, 0, totalWallMs) : 0;
  let cursorTick = 0;
  let lastCueCursor = -1;
  let seekCommentary = null;
  let podiumMotionPaused = Boolean(initialSnapshot?.podiumMotionPaused);

  const staticResultAtEnd = () => reduced && elapsedMs >= totalWallMs && resolution.finish.length > 0;
  const settled = () => elapsedMs >= totalWallMs;
  const currentPlanTime = () => raceFractionAtWallClock(elapsedMs / 1000, plan) * plan.duration;
  const update = () => {
    const seconds = currentPlanTime();
    const tick = clamp((seconds / plan.duration) * totalTicks, 0, totalTicks);
    cursorTick = tick;
    const smoothstep = (value) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
    const revealStartMs = plan.simulationWallSeconds * 1000;
    const revealProgress = reduced ? (staticResultAtEnd() ? 1 : 0) : smoothstep((elapsedMs - revealStartMs) / (plan.revealSeconds * 1000));
    const inHighlight = !reduced && elapsedMs / 1000 >= plan.highlightStartFraction * plan.duration
      && elapsedMs / 1000 <= wallClockAtRaceFraction(plan.highlightEndFraction, plan);
    const highlightStart = plan.highlightStartFraction * plan.duration;
    const highlightEnd = wallClockAtRaceFraction(plan.highlightEndFraction, plan);
    const highlightEaseSeconds = 0.25;
    const highlightProgress = reduced ? 0 : smoothstep((elapsedMs / 1000 - highlightStart) / highlightEaseSeconds)
      * (1 - smoothstep((elapsedMs / 1000 - (highlightEnd - highlightEaseSeconds)) / highlightEaseSeconds));
    const snapshot = {
      elapsedMs,
      seconds,
      cursorTick: tick,
      progress: totalTicks > 0 ? tick / totalTicks : 1,
      revealProgress,
      podiumVisible: reduced ? staticResultAtEnd() : revealProgress > 0,
      inHighlight,
      highlightProgress,
      playing,
      userPaused,
      settled: settled(),
      reduced,
      visible: isActive && visible,
      podiumMotionPaused,
      commentary: null,
    };
    if (proceedButton) proceedButton.disabled = !snapshot.settled;

    if (reduced) {
      snapshot.commentary = staticResultAtEnd()
        ? 'Static result: all six racers crossed the line.'
        : `Static race view at ${Math.round(snapshot.progress * 100)} percent.`;
    } else {
      const currentEvent = [...resolution.eventRecords].reverse().find((event) => Number.isFinite(event.time) && event.time <= seconds && seconds - event.time < 2.5);
      if (currentEvent) snapshot.commentary = eventLine(currentEvent, entrantLabels);
      if (isActive && visible && lastCueCursor >= 0 && tick > lastCueCursor) {
        for (const event of resolution.eventRecords) {
          if (Number.isFinite(event.time) && event.time > lastCueCursor * resolution.dt && event.time <= seconds) {
            onCueDisplayed({ cueId: `event:${event.id}`, eventId: event.id, text: eventLine(event, entrantLabels), timeSeconds: event.time });
          }
        }
      }
    }
    if (seekCommentary) snapshot.commentary = seekCommentary;
    lastCueCursor = tick;
    onMotionEnabled(!snapshot.reduced && isActive && visible);
    onState(snapshot);
    return snapshot;
  };

  const stopFrame = () => {
    if (frameId !== null) cancelFrame?.(frameId);
    frameId = null;
    lastFrameTime = null;
  };
  const drawFrame = (time) => {
    if (destroyed || !playing || reduced || !isActive || !visible) return;
    if (lastFrameTime === null) lastFrameTime = time;
    else elapsedMs += Math.max(0, time - lastFrameTime);
    lastFrameTime = time;
    if (elapsedMs >= totalWallMs) {
      elapsedMs = totalWallMs;
      playing = false;
    }
    update();
    if (playing) frameId = requestFrame?.(drawFrame) ?? null;
  };
  const start = () => {
    if (destroyed || reduced || !isActive || !visible || userPaused || settled()) return;
    playing = true;
    lastFrameTime = null;
    frameId = requestFrame?.(drawFrame) ?? null;
    update();
  };
  const pause = (reason = 'pause') => {
    stopFrame();
    if (playing) {
      playing = false;
      userPaused = reason === 'user' ? true : userPaused;
      update();
    }
  };
  const resume = (userInitiated = false) => {
    seekCommentary = null;
    if (userInitiated) {
      userPaused = false;
      onAction('resume', { cursorTick });
    }
    start();
  };
  const onVisibility = () => {
    visible = documentRef?.visibilityState !== 'hidden';
    if (!visible) pause('hidden');
    else if (!userPaused && isActive && !reduced && !settled()) start();
  };
  const onMotionPreference = () => {
    reduced = Boolean(media?.matches);
    if (reduced) {
      stopFrame();
      playing = false;
      elapsedMs = totalWallMs;
      onAction('reduced-motion-settled', { cursorTick: totalTicks });
    }
    update();
    if (!reduced && !userPaused && isActive && visible && !settled()) start();
  };

  const onPauseButton = () => {
    if (settled()) {
      podiumMotionPaused = !podiumMotionPaused;
      onAction(podiumMotionPaused ? 'pause-podium-motion' : 'resume-podium-motion', { cursorTick });
      update();
      return;
    }
    if (playing) {
      userPaused = true;
      pause('user');
      onAction('pause', { cursorTick });
    } else resume(true);
  };
  const onReplayButton = () => {
    elapsedMs = 0;
    cursorTick = 0;
    lastCueCursor = -1;
    seekCommentary = null;
    userPaused = false;
    playing = false;
    onAction('replay', { cursorTick: 0 });
    update();
    start();
  };
  const onCheckpoint = (event) => {
    const button = event.target.closest('[data-race-checkpoint]');
    if (!button) return;
    const fraction = Number(button.dataset.raceCheckpoint) / 100;
    pause();
    elapsedMs = wallClockAtRaceFraction(fraction, plan) * 1000;
    if (fraction === 1) elapsedMs = totalWallMs;
    userPaused = true;
    lastCueCursor = -1;
    seekCommentary = null;
    onAction('checkpoint', { fraction, cursorTick: fraction * totalTicks });
    update();
  };
  const onEventSeek = (event) => {
    const button = event.target.closest('[data-race-seek]');
    if (!button) return;
    const eventId = button.dataset.raceSeek;
    const mechanicalEvent = resolution.eventRecords.find((item) => item.id === eventId);
    if (!mechanicalEvent) return;
    pause();
    const fraction = clamp(mechanicalEvent.tick / totalTicks, 0, 1);
    elapsedMs = wallClockAtRaceFraction(fraction, plan) * 1000;
    userPaused = true;
    lastCueCursor = -1;
    seekCommentary = eventLine(mechanicalEvent, entrantLabels);
    onAction('seek', { eventId, cursorTick: mechanicalEvent.tick });
    if (isActive && visible) onCueDisplayed({ cueId: `event:${eventId}`, eventId, text: eventLine(mechanicalEvent, entrantLabels), timeSeconds: mechanicalEvent.time, seek: true });
    update();
    lastCueCursor = Math.max(mechanicalEvent.tick, (mechanicalEvent.time ?? 0) / resolution.dt);
  };
  const pauseButton = container.querySelector('[data-race-pause]');
  const replayButton = container.querySelector('[data-race-replay]');
  const proceedButton = container.querySelector('[data-race-proceed]');
  pauseButton?.addEventListener('click', onPauseButton);
  replayButton?.addEventListener('click', onReplayButton);
  container.addEventListener('click', onCheckpoint);
  container.addEventListener('click', onEventSeek);
  documentRef?.addEventListener('visibilitychange', onVisibility);
  if (media?.addEventListener) media.addEventListener('change', onMotionPreference);
  else media?.addListener?.(onMotionPreference);

  update();
  if (reduced) {
    elapsedMs = totalWallMs;
    update();
  } else if (isActive && !initialSnapshot?.userPaused) {
    start();
  }

  return {
    snapshot: () => ({ elapsedMs, userPaused, podiumMotionPaused }),
    setActive(value) {
      isActive = Boolean(value);
      if (!isActive) pause('inactive');
      else if (!userPaused && !reduced && visible && !settled()) start();
      update();
    },
    setPodiumMotionPaused(value) { podiumMotionPaused = Boolean(value); update(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopFrame();
      pauseButton?.removeEventListener('click', onPauseButton);
      replayButton?.removeEventListener('click', onReplayButton);
      container.removeEventListener('click', onCheckpoint);
      container.removeEventListener('click', onEventSeek);
      documentRef?.removeEventListener('visibilitychange', onVisibility);
      if (media?.removeEventListener) media.removeEventListener('change', onMotionPreference);
      else media?.removeListener?.(onMotionPreference);
      onMotionEnabled(false);
    },
  };
}
