import * as baselineModel from './baseline-model.mjs';
import * as candidateModel from './candidate-model.mjs';
import { createDigitalDuckSvg } from '../../../../src/ui/duck-rig-view.mjs';
import { createDuckMotionController } from '../../../../src/ui/duck-motion-controller.mjs';

const { buildPresentationPlan, interpolateSnapshot, raceFractionAtWallClock, rankFromSnapshot } = baselineModel;

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const PX_PER_METER = 7.3;
const OSCillation = matchMedia('(prefers-reduced-motion: reduce)');

let state;
let raf = 0;
let running = false;
let startedAt = 0;
let elapsedBeforePause = 0;
let reduced = OSCillation.matches;
let manualReduced = null;
let validationSeedIndex = 0;
let previewManifest;
let presetById;
const motionControllers = new Map();
const motionRoles = new Map();
const impactAnimations = new Map();
const PALETTES_BY_ID = { A: 'classic-yellow', P: 'mallard-green', B: 'bubblegum-pink', C: 'classic-yellow', D: 'mallard-green', E: 'bubblegum-pink' };
previewManifest = await (await fetch('./model-manifest.json', { cache: 'no-store' })).json();
presetById = new Map(previewManifest.presets.map((preset) => [preset.id, preset]));
const validationSeeds = previewManifest.validationSeeds;

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
  const preset = presetById.get($('scenario').value);
  if (!preset) throw new Error('Select a supported preview scenario.');
  return {
    seed: $('run-seed').value.trim(),
    raceId: preset.raceId,
    playerBaseSpeed: preset.playerBaseSpeed * preset.restFactor,
    fieldBaseSpeed: preset.fieldBaseSpeed,
    choice: $('choice').value,
    trialCommitted: $('trial').checked,
    experiment: $('experiment').value,
  };
}

function freshState(resolution) {
  const preset = presetById.get($('scenario').value);
  const mode = $('mode').value;
  return {
    resolution,
    entrants: resolution.entrants.map((e) => ({ ...e, node: null })),
    finish: resolution.finish,
    experiment: resolution.experiment,
    fixtureLabel: `${preset?.id ?? 'race'} · ${modeLabel(mode)} · ${resolution.seed} · race ${resolution.raceId}`,
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

function modeLabel(mode) {
  return ({ baseline: 'affine baseline', R2combined: 'current Sprint + R2 combined',
    'R2combined-risk-only': 'selected candidate · Sprint mean ×1.00 ±20%' })[mode] ?? mode;
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
  clearRaceMotions();
  elapsedBeforePause = 0;
  const input = inputFromControls();
  const mode = $('mode').value;
  if (mode !== 'baseline') {
    input.dramaArm = mode;
    input.studySprintMean = mode === 'R2combined-risk-only' ? 1.0 : 1.1;
  }
  const resolution = mode === 'baseline'
    ? baselineModel.resolveSeededRace(input)
    : candidateModel.resolveSeededRace(input);
  state = freshState(resolution);
  $('runner-layer').replaceChildren();
  $('race-status').textContent = resolution.status === 'finished'
    ? `${modeLabel(mode)} resolved once · first line crossing at ${resolution.finishTimeSeconds.toFixed(2)}s · ${resolution.draws.total} keyed mechanic draws.`
    : `Race unresolved · ${resolution.unresolvedReason} · no winner or payout · ${resolution.draws.total} keyed mechanic draws.`;
  $('event-list').replaceChildren();
  $('event-caption').textContent = '';
  $('scene-description').textContent = 'Race starts from the committed grid. Only recorded contacts trigger impact/recovery motion; event captions follow the committed event records.';
  $('static-view-label').textContent = '';
  $('presentation-log').replaceChildren();
  renderPresentationLog();
  $('narrative-status').textContent = 'No race event has been reached yet.';
  renderSummary(false);
  renderRecord(false);
  renderRunners(0);
  $('seed-progress').textContent = `Validation seed ${validationSeedIndex + 1} of ${validationSeeds.length} · seeds advance in order; no seed selection.`;
  $('next-seed').disabled = validationSeedIndex >= validationSeeds.length - 1;
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
    'weave-rank-strong-contact': 'rank-weighted weave + strong contact · interaction candidate',
  })[r.experiment];
  const trialText = r.trialConsumptionCount ? ' · Plan 17 +5% base-speed trial applied once' : '';
  const preset = presetById.get($('scenario').value);
  const stanceText = $('choice').value === 'sprint'
    ? `Sprint sampling · mean ×${$('mode').value === 'R2combined-risk-only' ? '1.00' : '1.10'} with ±20% keyed spread`
    : 'Safe sampling · ±5% keyed spread';
  const simText = r.status === 'finished'
    ? `first line crossing ${r.finishTimeSeconds.toFixed(2)}s`
    : `unresolved at ${r.horizonSeconds.toFixed(2)}s (${r.unresolvedReason})`;
  $('finish-summary').textContent = `${state.fixtureLabel} · ${modelText} · authored rating ${preset?.playerBaseSpeed ?? '?'} × rest factor ${preset?.restFactor ?? '?'} · ${stanceText} · ${simText}${timeBonus ? ` + ${timeBonus}s playback highlight` : ''} = ${(r.horizonSeconds + timeBonus).toFixed(2)}s max playback${trialText}`;
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
    const names = event.participants.map((id) => state.entrants.find((entrant) => entrant.id === id)?.name ?? id).join(' + ');
    const execution = event.type === 'leader-wobble-slowdown' || event.type === 'catch-up-assist'
      ? event.actualTicks > 0 ? ` · ${event.actualTicks} movement ticks` : ' · scheduled; no movement tick applied'
      : '';
    button.textContent = `${displayTime(event)} · ${event.type} · ${names}${execution}`;
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
  $('event-caption').textContent = commentaryForEvent(event, state.entrants);
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

function commentaryForEvent(event, entrants) {
  const byId = Object.fromEntries(entrants.map((entrant) => [entrant.id, entrant]));
  const names = event.participants.map((id) => byId[id]?.name ?? id).join(' and ');
  if (event.type === 'duck-contact') return `${names} made recorded contact. Their committed path and speed changes are shown at this event time.`;
  if (event.type === 'wall-impact') return `${names} contacted the wall. The recorded bounce and recovery are shown in the trajectory.`;
  if (event.type === 'wall-overlap') return `${names} reached the wall boundary; the model recorded a bounded position correction without an impact impulse.`;
  if (event.type === 'leader-wobble-slowdown') {
    return event.actualTicks > 0
      ? `${names} received the recorded leader-weave slowdown for ${event.actualTicks} movement ticks${event.speedDelta > 0 ? `; logged speed effect ${event.speedDelta.toFixed(2)} m/s` : ''}.`
      : `${names} reached the slowdown trigger at the end of the race. It was recorded, but no movement tick applied the slowdown.`;
  }
  if (event.type === 'catch-up-assist') {
    return event.actualTicks > 0
      ? `${names} received the recorded backmarker assistance window for ${event.actualTicks} movement ticks; the trajectory includes its acceleration and recovery changes.`
      : `${names} reached an assistance event with no movement tick applied before the race ended.`;
  }
  if (event.type === 'weave-turn') return `${names} entered the recorded seeded weave. The path follows the stored steering and recovery events.`;
  if (event.type === 'finish-line-crossing') return `${names} crossed the actual finish line first. Remaining places are classified from positions at that same crossing instant.`;
  return `${names} · ${event.type}. ${event.effect ?? 'The event remains in the committed race record.'}`;
}

function makeNode(entrant) {
  const group = document.createElementNS(NS, 'g');
  group.setAttribute('class', 'runner-token'); group.dataset.runnerId = entrant.id;
  const foreign = document.createElementNS(NS, 'foreignObject');
  foreign.setAttribute('x', '-30'); foreign.setAttribute('y', '-30'); foreign.setAttribute('width', '60'); foreign.setAttribute('height', '60');
  const palette = PALETTES_BY_ID[entrant.id] ?? 'classic-yellow';
  const prefix = `qp-race-${entrant.id.toLowerCase()}`;
  foreign.innerHTML = `<div class="race-motion-container" data-race-motion-container="${entrant.id}"><div class="race-duck-shell" data-duck-prefix="${prefix}" data-duck-motion="paddle"><div class="race-orientation">${createDigitalDuckSvg({ prefix, label: `${entrant.name}, race participant`, palette, paperMode: 'hybrid' })}</div></div></div>`;
  const label = document.createElementNS(NS, 'text');
  label.setAttribute('class', 'runner-label'); label.setAttribute('x', '0'); label.setAttribute('y', '-32'); label.setAttribute('text-anchor', 'middle'); label.textContent = entrant.id;
  group.append(foreign, label); $('runner-layer').append(group); entrant.node = group;
  entrant.motionContainer = foreign.querySelector('[data-race-motion-container]');
  entrant.motionShell = foreign.querySelector('.race-duck-shell');
  entrant.motionOrientation = foreign.querySelector('.race-orientation');
}

function activeModel() { return $('mode').value === 'baseline' ? baselineModel : candidateModel; }

function stopEntrantMotion(id) {
  motionControllers.get(id)?.destroy();
  motionControllers.delete(id);
  for (const animation of impactAnimations.get(id)?.animations ?? []) animation.cancel();
  impactAnimations.delete(id);
}

function clearRaceMotions() {
  for (const entrant of state?.entrants ?? []) stopEntrantMotion(entrant.id);
  motionRoles.clear();
}

function applyLocomotion(entrant, role) {
  if (motionRoles.get(entrant.id) === role) {
    motionControllers.get(entrant.id)?.setActive(running && !reduced);
    return;
  }
  stopEntrantMotion(entrant.id);
  motionRoles.set(entrant.id, role);
  if (!entrant.motionShell) return;
  entrant.motionShell.dataset.duckMotion = role.startsWith('impact:') ? 'impact-recover-demo' : role;
  if (role.startsWith('impact:')) return;
  motionControllers.set(entrant.id, createDuckMotionController(entrant.motionContainer, {
    active: running && !reduced,
  }));
}

function paperTransform(x, y, degrees = 0) {
  return `translate(${x * 4}px, ${y * 4}px) rotate(${degrees * 4}deg)`;
}

function startRecordedImpact(entrant, event) {
  const prior = impactAnimations.get(entrant.id);
  if (prior?.eventId === event.id) return prior.animations;
  stopEntrantMotion(entrant.id);
  motionRoles.set(entrant.id, `impact:${event.id}`);
  entrant.motionShell.dataset.duckMotion = 'impact-recover-demo';
  const shell = entrant.motionShell;
  const svg = shell.querySelector('svg');
  const prefix = shell.dataset.duckPrefix;
  const animate = (target, frames) => {
    const item = target?.animate(frames, { duration: 1100, easing: 'ease-out', fill: 'both' });
    if (item) { item.pause(); return item; }
    return null;
  };
  const animations = [
    animate(shell, [
      { transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(9%) rotate(-7deg)', offset: .2 },
      { transform: 'translateY(5%) rotate(3deg)', offset: .48 }, { transform: 'translateY(-3%) rotate(-2deg)', offset: .74 },
      { transform: 'translateY(0) rotate(0deg)' },
    ]),
    animate(svg.querySelector(`#${prefix}-head-group`), [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)', offset: .3 }, { transform: 'rotate(5deg)', offset: .62 }, { transform: 'rotate(0deg)' },
    ]),
    animate(svg.querySelector(`#${prefix}-wing-group`), [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-16deg)', offset: .25 }, { transform: 'rotate(7deg)', offset: .56 }, { transform: 'rotate(0deg)' },
    ]),
  ].filter(Boolean);
  const oneShot = (ids, peak, settle, timing, rebound = 'translate(0px, 0px) rotate(0deg)') => {
    const frames = [
      { transform: 'translate(0px, 0px) rotate(0deg)', offset: 0 },
      { transform: 'translate(0px, 0px) rotate(0deg)', offset: timing.onset },
      { transform: peak, offset: timing.peak }, { transform: settle, offset: timing.settle },
      { transform: rebound, offset: .92 }, { transform: 'translate(0px, 0px) rotate(0deg)', offset: 1 },
    ];
    for (const id of ids) {
      const item = animate(svg.querySelector(`#${prefix}-${id}`), frames);
      if (item) animations.push(item);
    }
  };
  oneShot(['body-backing-rim'], paperTransform(.7, .25), paperTransform(.18, .08), { onset: .08, peak: .26, settle: .68 }, paperTransform(-.04, 0));
  oneShot(['tail-backing'], paperTransform(.5, .2), paperTransform(.12, .04), { onset: .12, peak: .32, settle: .74 }, paperTransform(-.03, 0));
  oneShot(['wing-mid', 'wing-under-seam'], paperTransform(.8, .3, .5), paperTransform(.2, .08, .12), { onset: .1, peak: .3, settle: .68 }, paperTransform(-.05, 0, -.04));
  oneShot(['wing-top', 'wing-mid-seam'], paperTransform(1.1, .35, -.8), paperTransform(.24, .08, -.16), { onset: .16, peak: .4, settle: .78 }, paperTransform(.04, 0, .04));
  oneShot(['head-backing-rim'], paperTransform(.45, .25), paperTransform(.12, .06), { onset: .2, peak: .42, settle: .88 });
  impactAnimations.set(entrant.id, { eventId: event.id, animations });
  return animations;
}

function recordedContactAt(entrant, tick) {
  return state.resolution.eventRecords.filter((event) => ['duck-contact', 'wall-impact'].includes(event.type)
    && event.participants?.includes(entrant.id) && event.tick <= tick && tick <= event.tick + 22)
    .sort((a, b) => b.tick - a.tick || a.id.localeCompare(b.id))[0] ?? null;
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
  const ranked = rankFromSnapshot(snap, state.resolution);
  const leaderIds = new Set(ranked.slice(0, 2).map((row) => row.id));
  const model = activeModel();
  for (const entrant of state.entrants) {
    const position = snap.entrants.find((row) => row.id === entrant.id);
    if (!entrant.node) makeNode(entrant);
    const x = 450 + position.x * PX_PER_METER;
    const y = 250 + position.y * PX_PER_METER;
    entrant.node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    const steeringYaw = model.raceHeadingError(position.progress, position.heading) * 180 / Math.PI;
    entrant.motionOrientation.style.transform = `perspective(180px) rotateY(${model.raceDuckYaw(position.progress).toFixed(2)}deg) rotateZ(${steeringYaw.toFixed(2)}deg)`;
    const contact = !reduced ? recordedContactAt(entrant, state.cursorTick) : null;
    const role = contact ? `impact:${contact.id}` : leaderIds.has(entrant.id) ? 'graceful-bob' : 'paddle';
    if (contact && !reduced) {
      if (impactAnimations.get(entrant.id)?.eventId !== contact.id) {
        applyLocomotion(entrant, role);
        startRecordedImpact(entrant, contact);
      }
      const animations = impactAnimations.get(entrant.id)?.animations ?? [];
      const fraction = clamp((state.cursorTick - contact.tick) / 22, 0, 1);
      for (const animation of animations) { animation.currentTime = fraction * 1100; animation.pause(); }
    } else if (impactAnimations.has(entrant.id)) {
      stopEntrantMotion(entrant.id);
      motionRoles.delete(entrant.id);
      applyLocomotion(entrant, role);
    } else {
      applyLocomotion(entrant, role);
    }
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
  for (const controller of motionControllers.values()) controller.setActive(false);
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
  for (const controller of motionControllers.values()) controller.setActive(true);
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

function replayRace() {
  if (!state) return;
  const fromTick = state.cursorTick;
  stopPlayback();
  state.replayNumber += 1;
  state.finished = false; state.revealedIds = new Set(); state.loggedCueForReplay = new Set(); state.selectedEventId = null;
  state.started = true; state.cursorTick = 0; state.checkpointIndex = 0; elapsedBeforePause = 0;
  appendPresentationRecord('same race restarted', { fromTick, restartTick: 0 });
  clearRaceMotions();
  $('runner-layer').replaceChildren();
  for (const entrant of state.entrants) {
    entrant.node = null; entrant.motionContainer = null; entrant.motionShell = null; entrant.motionOrientation = null;
  }
  $('event-list').replaceChildren(); $('event-caption').textContent = '';
  renderSummary(false); renderRecord(false); renderRunners(0); renderPresentationLog(); updateControls();
  $('race-status').textContent = `Replay ${state.replayNumber} · same committed trajectory; no mechanical draws or rewards repeated.`;
  if (reduced) { setNarrativeExpanded(true); seekCheckpoint(0); return; }
  startPlayback();
}

function startNewRace() {
  if (!state) return;
  state.started = true;
  if (reduced) { state.started = true; setNarrativeExpanded(true); seekCheckpoint(0); }
  else startPlayback();
}

setTrackGeometry();
reduced = OSCillation.matches;
$('reduce').checked = reduced;
document.body.classList.toggle('reduce-motion', reduced);
for (const id of ['mode', 'scenario', 'choice', 'trial']) $(id).addEventListener('change', resolveOutcomes);
for (const id of ['camera', 'highlight', 'lighting']) $(id).addEventListener('change', () => updatePresentationOnly({ reset: true }));
$('next-seed').addEventListener('click', () => {
  if (validationSeedIndex >= validationSeeds.length - 1) return;
  validationSeedIndex += 1;
  $('run-seed').value = validationSeeds[validationSeedIndex];
  resolveOutcomes();
});
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
$('uninstall').addEventListener('click', () => { $('exit-note').textContent = 'This is a report-only preview. Closing it does not start or end a game run.'; });

resolveOutcomes();
