import {
  raceHeadingError,
  raceDuckYaw,
  buildPresentationPlan,
  interpolateSnapshot,
  narrativeForEvent,
  raceFractionAtWallClock,
  rankFromSnapshot,
  resolveSeededRace,
  restorePresentationSnapshot,
  savePresentationSnapshot,
} from './race-physics.mjs';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const PX_PER_METER = 7.3;
const LOCAL_SNAPSHOT_KEY = 'quackpot.plan13.physicsPresentation.v3';
const OSCillation = matchMedia('(prefers-reduced-motion: reduce)');

let state;
let raf = 0;
let running = false;
let startedAt = 0;
let elapsedBeforePause = 0;
let reduced = OSCillation.matches;
let manualReduced = null;
let savedSnapshot = null;

function svgStadiumPath(radius) {
  const halfStraight = 30 * PX_PER_METER;
  const r = radius * PX_PER_METER;
  const left = 450 - halfStraight; const right = 450 + halfStraight;
  const top = 250 - r; const bottom = 250 + r;
  return `M ${left} ${top} L ${right} ${top} A ${r} ${r} 0 0 1 ${right} ${bottom} L ${left} ${bottom} A ${r} ${r} 0 0 1 ${left} ${top} Z`;
}

function setTrackGeometry() {
  const outer = svgStadiumPath(26);
  const inner = svgStadiumPath(14);
  $('track-shore').setAttribute('d', outer);
  $('track-shore').setAttribute('fill', 'none');
  $('track-surface').setAttribute('d', `${outer} ${inner}`);
  $('track-surface').setAttribute('fill-rule', 'evenodd');
  $('lane-divider').setAttribute('d', svgStadiumPath(20));
  $('inner-pond').setAttribute('d', inner);
}

function inputFromControls() {
  return {
    seed: $('run-seed').value.trim(),
    raceId: $('race-id').value.trim(),
    playerBaseSpeed: Number($('player-speed').value),
    fieldBaseSpeed: Number($('field-speed').value),
    choice: $('choice').value,
    trialCommitted: $('trial').checked,
    experiment: $('experiment').value,
  };
}

function freshState(resolution) {
  return {
    resolution,
    entrants: resolution.entrants.map((e) => ({ ...e, node: null })),
    finish: resolution.finish,
    experiment: resolution.experiment,
    fixtureLabel: `Seeded line race · ${resolution.seed} · race ${resolution.raceId}`,
    presentationPlan: buildPresentationPlan(resolution, currentPresentationSettings()),
    cursorTick: 0,
    checkpointIndex: 0,
    selectedEventId: null,
    revealedIds: new Set(),
    loggedCueForReplay: new Set(),
    presentationLog: [],
    replayNumber: 0,
    started: false,
    finished: false,
  };
}

function currentPresentationSettings() {
  return {
    camera: $('camera').value === 'scripted' ? 'close' : 'wide',
    lighting: $('lighting').value,
    highlightSeconds: Number($('highlight').value),
    reducedMotion: reduced,
  };
}

function resolveOutcomes() {
  stopPlayback();
  elapsedBeforePause = 0;
  const resolution = resolveSeededRace(inputFromControls());
  state = freshState(resolution);
  $('runner-layer').replaceChildren();
  $('save-state').disabled = false;
  $('restore-state').disabled = !savedSnapshot;
  $('race-status').textContent = resolution.status === 'finished'
    ? `Race committed · first line crossing at ${resolution.finishTimeSeconds.toFixed(2)}s · ${resolution.draws.total} keyed mechanic draws.`
    : `Race unresolved · ${resolution.unresolvedReason} · no winner or payout · ${resolution.draws.total} keyed mechanic draws.`;
  $('event-list').replaceChildren();
  $('event-caption').textContent = '';
  $('scene-description').textContent = 'Race starts from the committed grid. Race events will be described when playback or event seeking reaches them.';
  $('static-view-label').textContent = '';
  $('presentation-log').replaceChildren();
  renderPresentationLog();
  $('narrative-status').textContent = 'No race event has been revealed yet.';
  renderSummary(false);
  renderRecord(false);
  renderRunners(0);
  updateControls();
}

function rankAtCurrentTick(tick) {
  return rankFromSnapshot(interpolateSnapshot(state.resolution, tick), state.resolution);
}

function renderSummary(revealFinish = state.finished) {
  const r = state.resolution;
  const timeBonus = Number($('highlight').value);
  const modelText = ({
    'controller-tangent': 'controller baseline · tangent only',
    'controller-recenter': 'controller baseline · cross-track recenter',
    'weave-symmetric': 'symmetric weave · recenter controller',
    'weave-rank-weighted': 'rank-weighted weave · recenter controller',
    'contact-6deg': 'contact control · 6 degrees',
    'contact-15-20deg': 'contact candidate · 15–20 degrees',
  })[r.experiment];
  const trialText = r.trialConsumptionCount ? ' · Plan 17 +5% base-speed trial applied once' : '';
  const simText = r.status === 'finished'
    ? `first line crossing ${r.finishTimeSeconds.toFixed(2)}s`
    : `unresolved at ${r.horizonSeconds.toFixed(2)}s (${r.unresolvedReason})`;
  $('finish-summary').textContent = `${state.fixtureLabel} · ${modelText} · ${simText}${timeBonus ? ` + ${timeBonus}s playback highlight` : ''} = ${(r.horizonSeconds + timeBonus).toFixed(2)}s max playback${trialText}`;
  $('finish-order').replaceChildren();
  if (!revealFinish) {
    const item = document.createElement('li');
    item.textContent = `Result hidden during playback. ${r.eventRecords.length} mechanical event${r.eventRecords.length === 1 ? ' is' : 's are'} committed; they are revealed as playback reaches them.`;
    $('finish-order').append(item);
  } else if (r.status !== 'finished') {
    const item = document.createElement('li'); item.textContent = `Unresolved · ${r.unresolvedReason} · no winner or payout.`; $('finish-order').append(item);
  } else {
    for (const entrant of state.finish) {
      const item = document.createElement('li');
      const suffix = entrant.place === 1 ? 'st' : entrant.place === 2 ? 'nd' : entrant.place === 3 ? 'rd' : 'th';
      const crossing = entrant.crossedAtFinish ? `crossed at ${entrant.crossingTimeSeconds.toFixed(2)}s` : `position at winner time`;
      item.textContent = `${entrant.name} · ${entrant.progress.toFixed(1)} m · ${entrant.place}${suffix} · ${crossing} · ${entrant.payout} Gems`;
      $('finish-order').append(item);
    }
  }
  const causes = r.eventRecords.filter((e) => e.success !== false && e.eligible !== false);
  $('event-summary').textContent = revealFinish
    ? `${causes.length} mechanical event${causes.length === 1 ? '' : 's'}; ${r.opportunityRecords.length} separate weave-opportunity diagnostic${r.opportunityRecords.length === 1 ? '' : 's'}. The full event archive and diagnostics are available in the narrative. Presentation cues are logged separately.`
    : 'Race outcome and events are committed before playback. Future event details and finish order stay hidden until they are reached.';
  if ($('opportunity-summary')) {
    const skipped = r.opportunityRecords.filter((item) => item.status === 'skipped').length;
    $('opportunity-summary').textContent = `${r.opportunityRecords.length} scheduled weave opportunities · ${skipped} skipped during recovery or lane recentering · diagnostics are separate from mechanical event records.`;
  }
}

function displayTime(event) { return `${event.time.toFixed(2)}s · tick ${event.tick}`; }

function renderRecord(revealAll = state.finished) {
  const body = $('record');
  body.replaceChildren();
  const events = state.resolution.eventRecords.filter((e) => revealAll || state.revealedIds.has(e.id));
  for (const event of events) {
    const tr = document.createElement('tr');
    const names = event.participants.map((id) => state.entrants.find((e) => e.id === id)?.name ?? id).join(' + ');
    const reason = event.reason ?? (event.eligible === false ? 'not eligible for an impulse' : 'eligible event');
    const progress = event.pre && event.post
      ? `${Object.entries(event.pre).map(([id, pre]) => `${id} ${pre.speed}→${event.post[id]?.speed ?? '?'} m/s`).join('; ')}`
      : event.normalClosingSpeed !== undefined ? `${event.normalClosingSpeed} m/s closing speed` : event.effect;
    const place = revealAll ? state.finish.find((e) => e.id === event.participants[0])?.place ?? '—' : 'hidden';
    [displayTime(event), `${event.type} · ${names}`, reason, event.effect, progress, String(place)].forEach((value) => {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    });
    body.append(tr);
  }
  if (!events.length) {
    const tr = document.createElement('tr'); const td = document.createElement('td');
    td.colSpan = 6; td.textContent = revealAll ? 'No mechanical events occurred in this race.' : 'Event details appear here as playback reaches them.';
    tr.append(td); body.append(tr);
  }
}

function renderOpportunityDiagnostics(revealAll = state.finished) {
  const list = $('opportunity-list');
  if (!list) return;
  list.replaceChildren();
  const rows = state.resolution.opportunityRecords.filter((row) => revealAll || row.tick <= state.cursorTick);
  for (const row of rows) {
    const item = document.createElement('li');
    item.textContent = `${row.time.toFixed(2)}s · ${row.entrantId} · frozen rank ${row.rank} · ${row.intervalTicks * state.resolution.dt}s interval · ${row.status} (${row.reason})${row.eventId ? ` · ${row.eventId}` : ''}`;
    list.append(item);
  }
  if (!rows.length) {
    const item = document.createElement('li');
    item.textContent = revealAll ? 'No weave opportunities occurred.' : 'Weave opportunities appear here as playback reaches them.';
    list.append(item);
  }
}

function appendPresentationRecord(type, details = {}) {
  state.presentationLog.push({ sequence: state.presentationLog.length + 1, replay: state.replayNumber, type, tick: Math.round(state.cursorTick), time: Number((state.cursorTick * state.resolution.dt).toFixed(3)), ...details });
  renderPresentationLog();
}

function renderPresentationLog() {
  const list = $('presentation-log'); list.replaceChildren();
  for (const entry of state.presentationLog) {
    const li = document.createElement('li');
    li.textContent = `#${entry.sequence} · replay ${entry.replay} · ${entry.type} · ${entry.time.toFixed(2)}s / tick ${entry.tick}${entry.eventId ? ` · ${entry.eventId}` : ''}`;
    list.append(li);
  }
  $('presentation-log-count').textContent = `${state.presentationLog.length} presentation action${state.presentationLog.length === 1 ? '' : 's'} recorded`;
}

function setNarrativeExpanded(expanded) {
  $('race-narrative').hidden = !expanded;
  $('narrative-toggle').setAttribute('aria-expanded', String(expanded));
  $('narrative-toggle').textContent = expanded ? 'Hide race narrative' : 'Show race narrative';
  if (!expanded && $('race-narrative').contains(document.activeElement)) $('narrative-toggle').focus();
  if (expanded) { renderEventList(); renderOpportunityDiagnostics(state.finished); }
}

function revealReachedEvents(tick, allowFuture = false) {
  const records = state.resolution.eventRecords;
  const revealed = allowFuture ? records : records.filter((event) => event.tick <= tick);
  let changed = false;
  for (const event of revealed) {
    if (state.revealedIds.has(event.id)) continue;
    state.revealedIds.add(event.id); changed = true;
  }
  if (changed) {
    renderRecord(state.finished);
    if (!$('race-narrative').hidden) renderEventList();
  }
  if (!$('race-narrative').hidden) renderOpportunityDiagnostics(allowFuture || state.finished);
}

function renderEventList() {
  const list = $('event-list');
  const priorFocus = document.activeElement?.dataset?.eventId;
  list.replaceChildren();
  const records = state.resolution.eventRecords.filter((e) => state.revealedIds.has(e.id));
  $('narrative-status').textContent = state.finished
    ? `Full race summary · ${records.length} committed event records.`
    : `${records.length} event${records.length === 1 ? '' : 's'} reached so far. Later events remain hidden.`;
  for (const event of records) {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.eventId = event.id;
    button.setAttribute('aria-current', String(state.selectedEventId === event.id));
    button.textContent = `${displayTime(event)} · ${event.type} · ${event.participants.join(' + ')}`;
    button.addEventListener('click', () => seekToEvent(event, button));
    list.append(button);
    const cueKey = `${state.replayNumber}:${event.id}`;
    if (!state.loggedCueForReplay.has(cueKey)) {
      state.loggedCueForReplay.add(cueKey);
      appendPresentationRecord('event-list cue displayed', { eventId: event.id });
    }
  }
  if (state.finished && !records.length) list.textContent = 'No mechanical events occurred in this race.';
  if (priorFocus) list.querySelector(`[data-event-id="${CSS.escape(priorFocus)}"]`)?.focus();
}

function seekToEvent(event, button) {
  pauseAtTick(event.tick, `Paused at ${displayTime(event)} · post-event state.`);
  state.selectedEventId = event.id;
  $('event-caption').textContent = narrativeForEvent(event, Object.fromEntries(state.entrants.map((e) => [e.id, e])));
  $('scene-description').textContent = `Race scene at ${displayTime(event)}. Post-event state. ${$('event-caption').textContent}`;
  appendPresentationRecord('event selected and playback sought', { eventId: event.id });
  appendPresentationRecord('event caption displayed', { eventId: event.id, caption: $('event-caption').textContent });
  renderRunners(state.cursorTick);
  $('race-status').textContent = `Paused · ${displayTime(event)} · post-event state. Resume continues from this simulation tick.`;
  $('narrative-status').textContent = `Paused at ${displayTime(event)}. Post-event state shown.`;
  updateControls();
  for (const item of $('event-list').querySelectorAll('[data-event-id]')) item.setAttribute('aria-current', String(item.dataset.eventId === event.id));
  button.focus();
}

function makeNode(entrant) {
  const group = document.createElementNS(NS, 'g');
  group.setAttribute('class', 'runner-token'); group.dataset.runnerId = entrant.id;
  const image = document.createElementNS(NS, 'image');
  image.setAttribute('href', '../../../src/assets/svg/duck-rig.svg');
  image.setAttribute('x', '-24'); image.setAttribute('y', '-24'); image.setAttribute('width', '48'); image.setAttribute('height', '48');
  image.style.transformBox = 'fill-box'; image.style.transformOrigin = 'center'; image.style.backfaceVisibility = 'visible';
  image.dataset.duckImage = 'true';
  const label = document.createElementNS(NS, 'text');
  label.setAttribute('class', 'runner-label'); label.setAttribute('x', '0'); label.setAttribute('y', '-29'); label.setAttribute('text-anchor', 'middle'); label.textContent = entrant.id;
  group.append(image, label); $('runner-layer').append(group); entrant.node = group;
}

function nearestDramaEvent(tickFloat) {
  const fraction = tickFloat / state.resolution.ticks;
  if (fraction < 0.34 || fraction > 0.76) return null;
  return state.resolution.eventRecords
    .filter((event) => event.participants?.length && Math.abs(event.tick / state.resolution.ticks - fraction) <= 0.08)
    .sort((a, b) => Math.abs(a.tick - tickFloat) - Math.abs(b.tick - tickFloat) || a.id.localeCompare(b.id))[0] ?? null;
}

function renderRunners(tickFloat) {
  if (!state) return;
  state.cursorTick = clamp(tickFloat, 0, state.resolution.ticks);
  const snap = interpolateSnapshot(state.resolution, state.cursorTick);
  for (const entrant of state.entrants) {
    const position = snap.entrants.find((row) => row.id === entrant.id);
    if (!entrant.node) makeNode(entrant);
    const x = 450 + position.x * PX_PER_METER;
    const y = 250 + position.y * PX_PER_METER;
    entrant.node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    const duckImage = entrant.node.querySelector('[data-duck-image="true"]');
    const steeringYaw = raceHeadingError(position.progress, position.heading) * 180 / Math.PI;
    duckImage.style.transform = `perspective(180px) rotateY(${raceDuckYaw(position.progress).toFixed(2)}deg) rotateZ(${steeringYaw.toFixed(2)}deg)`;
  }
  const reducedNow = reduced;
  const fraction = state.cursorTick / state.resolution.ticks;
  const zoom = !reducedNow && $('camera').value === 'scripted' ? smoothCloseZoom(fraction) : 1;
  const player = snap.entrants.find((e) => e.id === 'P');
  const px = 450 + player.x * PX_PER_METER; const py = 250 + player.y * PX_PER_METER;
  const focus = zoom > 1 ? clamp((zoom - 1) / 0.16, 0, 1) : 0;
  const tx = 450 * (1 - zoom) + (450 - px * zoom - 450 * (1 - zoom)) * focus;
  const ty = 250 * (1 - zoom) + (250 - py * zoom - 250 * (1 - zoom)) * focus;
  $('camera-root').setAttribute('transform', `matrix(${zoom.toFixed(4)} 0 0 ${zoom.toFixed(4)} ${tx.toFixed(2)} ${ty.toFixed(2)})`);
  const drama = !reducedNow && $('lighting').value === 'event' && Boolean(nearestDramaEvent(state.cursorTick));
  $('stage-shell').classList.toggle('dramatic', drama);
  const highlighted = drama ? new Set(nearestDramaEvent(state.cursorTick).participants) : new Set();
  for (const entrant of state.entrants) entrant.node.classList.toggle('participant-glow', highlighted.has(entrant.id));
  $('camera-note').textContent = reducedNow
    ? 'Reduced motion: fixed wide still; no camera zoom, dramatic lighting, or slow-time effect.'
    : `World-coordinate simulation · ${state.cursorTick.toFixed(1)} / ${state.resolution.ticks} ticks · ${($('camera').value === 'scripted' ? 'close camera eases in and returns wide' : 'locked wide camera')}${drama ? ' · recorded-event participants highlighted' : ''}.`;
  updateSceneDescription(snap, fraction);
}

function updateSceneDescription(snapshot, fraction) {
  const rank = rankFromSnapshot(snapshot, state.resolution).map((e, i) => `${e.name} ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`).join(', ');
  const label = `Simulation ${state.cursorTick.toFixed(1)} of ${state.resolution.ticks} ticks (${(fraction * 100).toFixed(1)}%). Current progress order: ${rank}.`;
  $('race-svg').querySelector('#track-desc').textContent = label;
  $('simulation-hud').textContent = `Tick ${Math.round(state.cursorTick)} · ${(state.cursorTick * state.resolution.dt).toFixed(2)}s · ${(fraction * 100).toFixed(0)}%`;
  if ($('static-view-label')) $('static-view-label').textContent = reduced
    ? `Static race view · tick ${state.cursorTick.toFixed(1)} / ${state.resolution.ticks.toFixed(1)} · ${(fraction * 100).toFixed(0)}% of line-race trajectory · same committed result.`
    : '';
}

function smoothCloseZoom(fraction) {
  if (fraction < 0.34 || fraction > 0.76) return 1;
  if (fraction < 0.42) return 1 + smoothstep((fraction - 0.34) / 0.08) * 0.16;
  if (fraction <= 0.66) return 1.16;
  return 1.16 - smoothstep((fraction - 0.66) / 0.1) * 0.16;
}

function smoothstep(value) { return value * value * (3 - 2 * value); }

function playbackFraction() {
  return raceFractionAtWallClock(elapsedBeforePause / 1000, {
    duration: state.presentationPlan.duration,
    highlightSeconds: state.presentationPlan.highlightSeconds,
  });
}

function tick(now) {
  if (!running || !state) return;
  const elapsed = elapsedBeforePause + now - startedAt;
  const total = state.presentationPlan.totalWallSeconds * 1000;
  const fraction = raceFractionAtWallClock(elapsed / 1000, state.presentationPlan);
  const currentTick = fraction * state.resolution.ticks;
  renderRunners(currentTick);
  revealReachedEvents(currentTick);
  $('race-status').textContent = `Race playing · ${(elapsed / 1000).toFixed(1)} / ${state.presentationPlan.totalWallSeconds}s playback · simulation ${currentTick.toFixed(1)} / ${state.resolution.ticks} ticks.`;
  if (elapsed >= total) { finishRace('finish'); return; }
  raf = requestAnimationFrame(tick);
}

function stopPlayback() {
  running = false; cancelAnimationFrame(raf);
  $('play').disabled = false; $('pause').disabled = true;
}

function pauseAtTick(tick, status) {
  stopPlayback();
  state.cursorTick = clamp(tick, 0, state.resolution.ticks);
  elapsedBeforePause = wallClockAtFraction(state.cursorTick / state.resolution.ticks, state.presentationPlan) * 1000;
  revealReachedEvents(state.cursorTick);
  $('race-status').textContent = status;
  renderRunners(state.cursorTick);
  updateControls();
}

function wallClockAtFraction(fraction, plan) {
  const { duration, highlightSeconds } = plan;
  if (!highlightSeconds) return fraction * duration;
  if (fraction <= 0.47) return fraction * duration;
  if (fraction <= 0.53) return duration * 0.47 + ((fraction - 0.47) / 0.06) * (duration * 0.06 + highlightSeconds);
  return duration * 0.53 + highlightSeconds + (fraction - 0.53) * duration;
}

function startPlayback() {
  if (!state || running || state.finished) return;
  if (reduced) { nextCheckpoint(); return; }
  running = true; startedAt = performance.now();
  state.started = true;
  $('play').disabled = true; $('pause').disabled = false;
  appendPresentationRecord('playback started/resumed');
  raf = requestAnimationFrame(tick);
}

function finishRace(reason) {
  stopPlayback(); state.finished = true; state.cursorTick = state.resolution.ticks;
  elapsedBeforePause = state.presentationPlan.totalWallSeconds * 1000;
  revealReachedEvents(state.cursorTick, true);
  renderSummary(true); renderRecord(true); renderOpportunityDiagnostics(true); renderRunners(state.cursorTick);
  $('race-status').textContent = reason === 'skip'
    ? 'Skipped to results · full committed summary revealed; no mechanics or RNG rerun.'
    : state.resolution.status === 'finished'
      ? `Finish line · ${state.finish[0].name} crossed first at ${state.resolution.finishTimeSeconds.toFixed(2)}s.`
      : `Race unresolved · ${state.resolution.unresolvedReason}; no winner or payout.`;
  $('narrative-status').textContent = `Full race summary · all ${state.resolution.eventRecords.length} committed events are available.`;
  $('scene-description').textContent = state.resolution.status === 'finished'
    ? `Race complete. ${state.finish[0].name} crossed first at ${state.resolution.finishTimeSeconds.toFixed(2)} seconds; remaining places are classified at that same crossing time.`
    : `Race unresolved at ${state.resolution.horizonSeconds.toFixed(2)} seconds. No winner or payout was recorded.`;
  appendPresentationRecord(reason === 'skip' ? 'skip to results' : 'race finished');
  if (!$('race-narrative').hidden) renderEventList();
  updateControls();
}

function seekCheckpoint(index) {
  const checkpoints = state.presentationPlan.checkpoints;
  const next = clamp(index, 0, checkpoints.length - 1);
  state.checkpointIndex = next;
  state.selectedEventId = null;
  pauseAtTick(checkpoints[next], `Paused at static checkpoint ${next + 1} of ${checkpoints.length} · tick ${checkpoints[next]}.`);
  appendPresentationRecord('reduced-motion checkpoint selected', { checkpoint: next + 1 });
  renderRunners(checkpoints[next]);
  updateControls();
}

function nextCheckpoint() {
  if (!reduced) {
    const next = state.presentationPlan.checkpoints.find((tick) => tick > state.cursorTick + 1e-9);
    if (next === undefined) { finishRace('finish'); return; }
    pauseAtTick(next, `Paused at next checkpoint · tick ${next}.`);
    appendPresentationRecord('next checkpoint selected', { tick: next });
    renderRunners(next); return;
  }
  const nextIndex = state.presentationPlan.checkpoints.findIndex((tick) => tick > state.cursorTick + 1e-9);
  if (nextIndex < 0) { finishRace('finish'); return; }
  seekCheckpoint(nextIndex);
}

function previousCheckpoint() {
  if (!reduced) return;
  const prior = state.presentationPlan.checkpoints.map((tick, index) => ({ tick, index })).filter((item) => item.tick < state.cursorTick - 1e-9).at(-1);
  if (prior) seekCheckpoint(prior.index);
}

function resumeFromCursor() {
  if (state.finished) return;
  const fraction = state.cursorTick / state.resolution.ticks;
  elapsedBeforePause = wallClockAtFraction(fraction, state.presentationPlan) * 1000;
  if (reduced) { $('race-status').textContent = `Static view remains paused at tick ${Math.round(state.cursorTick)}; select Next view to advance.`; updateControls(); return; }
  startPlayback();
}

function updateControls() {
  $('pause').disabled = !running;
  $('play').disabled = running || state.finished || (reduced && state.started);
  $('snapshot-prev').disabled = !reduced || state.checkpointIndex <= 0 || state.finished;
  $('snapshot-next').disabled = state.finished || (!reduced && !state.resolution.eventRecords.length && state.cursorTick >= state.resolution.ticks);
  $('resume-race').disabled = reduced || state.finished;
  $('play').textContent = reduced
    ? state.started ? 'Static sequence active' : 'Start static race'
    : state.finished ? 'Race finished' : state.started ? 'Resume race' : 'Start race';
  $('snapshot-next').textContent = reduced ? 'Next view' : 'Next checkpoint';
}

function onMotionModeChange() {
  manualReduced = $('reduce').checked;
  const nextReduced = manualReduced || OSCillation.matches;
  if (nextReduced === reduced) return;
  const currentTick = state.cursorTick;
  const wasRunning = running;
  if (wasRunning) {
    const elapsed = elapsedBeforePause + performance.now() - startedAt;
    const frac = raceFractionAtWallClock(elapsed / 1000, state.presentationPlan);
    state.cursorTick = frac * state.resolution.ticks;
  }
  stopPlayback(); reduced = nextReduced;
  document.body.classList.toggle('reduce-motion', reduced);
  state.presentationPlan = buildPresentationPlan(state.resolution, currentPresentationSettings());
  if (wasRunning) {
    elapsedBeforePause = wallClockAtFraction(state.cursorTick / state.resolution.ticks, state.presentationPlan) * 1000;
    appendPresentationRecord('display mode changed; simulation position preserved', { fromTick: currentTick, toTick: state.cursorTick, reducedMotion: reduced });
  }
  if (reduced) state.checkpointIndex = nearestCheckpointIndex(state.cursorTick);
  renderRunners(state.cursorTick);
  updateControls();
  $('race-status').textContent = `Display mode changed; same committed race paused at tick ${state.cursorTick.toFixed(1)}.`;
}

function nearestCheckpointIndex(tick) {
  const checkpoints = state.presentationPlan.checkpoints;
  return checkpoints.reduce((best, value, index) => Math.abs(value - tick) < Math.abs(checkpoints[best] - tick) ? index : best, 0);
}

function updatePresentationOnly({ reset = false } = {}) {
  if (!state) return;
  if (reset && running) pauseAtTick(state.cursorTick, 'Paused · presentation settings changed; committed race retained.');
  state.presentationPlan = buildPresentationPlan(state.resolution, currentPresentationSettings());
  renderRunners(state.cursorTick);
  updateControls();
  $('race-status').textContent = 'Presentation changed · same trajectory, event order, finish and rewards.';
}

function captureSnapshot() {
  try {
    savedSnapshot = savePresentationSnapshot(state.resolution, { ...currentPresentationSettings(), presentationLog: state.presentationLog, cursorTick: state.cursorTick, finished: state.finished, replayNumber: state.replayNumber, started: state.started });
    sessionStorage.setItem(LOCAL_SNAPSHOT_KEY, savedSnapshot);
    $('restore-state').disabled = false;
    $('race-status').textContent = 'Committed trajectory and presentation log saved locally.';
  } catch (error) { $('race-status').textContent = `Could not save snapshot: ${error.message}`; }
}

function restoreSnapshot() {
  try {
    stopPlayback();
    const serialized = savedSnapshot ?? sessionStorage.getItem(LOCAL_SNAPSHOT_KEY);
    if (!serialized) throw new Error('no saved snapshot is available');
    const snapshot = restorePresentationSnapshot(serialized);
    state = freshState(snapshot.resolution);
    state.presentationPlan = snapshot.presentation;
    state.presentationLog = snapshot.presentationLog ?? [];
    state.cursorTick = snapshot.cursorTick ?? 0;
    state.finished = Boolean(snapshot.finished);
    state.started = Boolean(snapshot.started || state.cursorTick > 0 || state.finished);
    state.replayNumber = Number.isInteger(snapshot.replayNumber) ? snapshot.replayNumber : 0;
    state.revealedIds = new Set(snapshot.resolution.eventRecords.filter((e) => e.tick <= state.cursorTick).map((e) => e.id));
    for (const key of ['seed', 'raceId', 'playerBaseSpeed', 'fieldBaseSpeed']) {
      const id = ({ seed: 'run-seed', raceId: 'race-id', playerBaseSpeed: 'player-speed', fieldBaseSpeed: 'field-speed' })[key];
      $(id).value = snapshot.resolution.inputs[key];
    }
    $('experiment').value = snapshot.resolution.experiment; $('choice').value = snapshot.resolution.choice;
    $('trial').checked = snapshot.resolution.inputs.trialCommitted;
    $('highlight').value = String(snapshot.presentation.highlightSeconds);
    $('camera').value = snapshot.presentation.camera === 'wide' ? 'wide' : 'scripted';
    $('lighting').value = snapshot.presentation.lighting;
    $('reduce').checked = snapshot.presentation.reducedMotion;
    $('runner-layer').replaceChildren(); renderSummary(false); renderRecord(false); renderOpportunityDiagnostics(false); renderRunners(state.cursorTick); renderPresentationLog();
    $('race-status').textContent = 'Snapshot restored · committed trajectory reused; no mechanics or RNG rerun.';
    updateControls();
  } catch (error) { $('race-status').textContent = `Could not restore snapshot: ${error.message}`; }
}

function replayRace() {
  if (!state) return;
  const fromTick = state.cursorTick;
  stopPlayback();
  state.replayNumber += 1;
  state.finished = false; state.revealedIds = new Set(); state.loggedCueForReplay = new Set(); state.selectedEventId = null;
  state.started = true; state.cursorTick = 0; state.checkpointIndex = 0; elapsedBeforePause = 0;
  appendPresentationRecord('same race restarted', { fromTick, restartTick: 0 });
  $('runner-layer').replaceChildren();
  for (const entrant of state.entrants) entrant.node = null;
  $('event-list').replaceChildren(); $('event-caption').textContent = '';
  renderSummary(false); renderRecord(false); renderRunners(0); renderPresentationLog(); updateControls();
  $('race-status').textContent = `Replay ${state.replayNumber} · same committed trajectory; no mechanical draws or rewards repeated.`;
  if (reduced) { setNarrativeExpanded(true); seekCheckpoint(0); return; }
  startPlayback();
}

function startNewRace() {
  resolveOutcomes();
  if (reduced) { state.started = true; setNarrativeExpanded(true); seekCheckpoint(0); }
  else startPlayback();
}

setTrackGeometry();
reduced = OSCillation.matches;
$('reduce').checked = reduced;
document.body.classList.toggle('reduce-motion', reduced);
try { savedSnapshot = sessionStorage.getItem(LOCAL_SNAPSHOT_KEY); } catch { savedSnapshot = null; }
$('restore-state').disabled = !savedSnapshot;

for (const id of ['experiment', 'run-seed', 'race-id', 'player-speed', 'field-speed', 'choice', 'trial']) $(id).addEventListener('change', resolveOutcomes);
for (const id of ['camera', 'highlight', 'lighting']) $(id).addEventListener('change', () => updatePresentationOnly({ reset: true }));
$('reduce').addEventListener('change', onMotionModeChange);
OSCillation.addEventListener?.('change', onMotionModeChange);
$('play').addEventListener('click', () => {
  if (!state.started) startNewRace();
  else if (reduced) nextCheckpoint();
  else resumeFromCursor();
});
$('pause').addEventListener('click', () => {
  if (!running) return;
  const elapsed = elapsedBeforePause + performance.now() - startedAt;
  state.cursorTick = raceFractionAtWallClock(elapsed / 1000, state.presentationPlan) * state.resolution.ticks;
  elapsedBeforePause = elapsed; stopPlayback(); renderRunners(state.cursorTick);
  $('race-status').textContent = `Paused at tick ${state.cursorTick.toFixed(1)}; resume continues from here.`;
  appendPresentationRecord('playback paused'); updateControls();
});
$('skip-race').addEventListener('click', () => finishRace('skip'));
$('replay').addEventListener('click', replayRace);
$('snapshot-next').addEventListener('click', nextCheckpoint);
$('snapshot-prev').addEventListener('click', previousCheckpoint);
$('resume-race').addEventListener('click', resumeFromCursor);
$('narrative-toggle').addEventListener('click', () => setNarrativeExpanded($('race-narrative').hidden));
$('save-state').addEventListener('click', captureSnapshot);
$('restore-state').addEventListener('click', restoreSnapshot);
$('uninstall').addEventListener('click', () => { $('exit-note').textContent = 'Uninstall remains reachable in this demonstration. This preview does not start or end a game run.'; });

$('turn').addEventListener('click', () => {
  const card = $('turn-card'); const toBack = !card.classList.contains('is-back');
  card.classList.toggle('is-back', toBack);
  $('turn').textContent = toBack ? 'Turn back to front · 0.5 seconds' : 'Turn to reverse · 0.5 seconds';
  if (reduced) { $('turn-status').textContent = `Reduced motion: ${toBack ? 'reverse' : 'front'} shown instantly; orientation information is unchanged.`; return; }
  card.classList.remove('flipping', 'to-back', 'to-front'); void card.offsetWidth;
  card.classList.add('flipping', toBack ? 'to-back' : 'to-front');
  $('turn-status').textContent = `Flat paper turns 180° in 0.5 seconds and stays ${toBack ? 'on the reverse' : 'at the front'}; presentation only.`;
});
$('turn-card').addEventListener('animationend', () => $('turn-card').classList.remove('flipping', 'to-back', 'to-front'));
for (const radio of document.querySelectorAll('input[name="back"]')) radio.addEventListener('change', () => {
  $('turn-card').classList.toggle('flat-back', radio.checked && radio.value === 'flat');
  $('turn-card').dataset.back = radio.value;
});
$('turn-card').dataset.back = document.querySelector('input[name="back"]:checked')?.value ?? 'mirrored';

resolveOutcomes();
