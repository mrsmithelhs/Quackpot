import * as baselineModel from './baseline-model.mjs';
import * as candidateModel from './candidate-model.mjs';
import * as individualFinishModel from './individual-finish-model.mjs';
import { cameraFractionAtTick, individualPresentationTiming, raceFractionAtPlanWallClock,
  playbackStateAtSeek, resultRevealDueAtElapsedMilliseconds, revealProgressAtElapsedMilliseconds, wallClockAtPlanFraction } from './presentation-timing.mjs';
import { createDigitalDuckSvg } from '../../../../src/ui/duck-rig-view.mjs';
import { createDuckMotionController } from '../../../../src/ui/duck-motion-controller.mjs';

const { buildPresentationPlan, interpolateSnapshot, raceFingerprint, rankFromSnapshot } = baselineModel;

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const PX_PER_METER = 7.3;
const OSCillation = matchMedia('(prefers-reduced-motion: reduce)');

let state;
let raf = 0;
let running = false;
let podiumAnimation = null;
let lightingAnimation = null;
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
    presentationPlan: presentationPlanFor(resolution),
    cursorTick: 0,
    checkpointIndex: 0,
    selectedEventId: null,
    revealedIds: new Set(),
    loggedCueForReplay: new Set(),
    presentationLog: [],
    replayNumber: 0,
    podiumAppearanceCount: 0,
    podiumVisible: false,
    started: false,
    finished: false,
  };
}

function presentationPlanFor(resolution) {
  const base = buildPresentationPlan(resolution, currentPresentationSettings());
  const hasIndividualFinish = resolution.rulesVersion === individualFinishModel.PHYSICS.version && resolution.status === 'finished';
  if (hasIndividualFinish) return individualPresentationTiming(base, resolution);
  return { ...base, simulationWallSeconds: base.duration + base.highlightSeconds, resultRevealSeconds: 0 };
}

function modeLabel(mode) {
  return ({ baseline: 'affine baseline', R2combined: 'current Sprint + R2 combined',
    'R2combined-risk-only': 'selected candidate · Sprint mean ×1.00 ±20%',
    'plan23-individual-crossing': 'selected candidate · individual crossing order' })[mode] ?? mode;
}

function activeModel() {
  const mode = $('mode').value;
  return mode === 'baseline' ? baselineModel
    : mode === 'plan23-individual-crossing' ? individualFinishModel : candidateModel;
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
  hidePodium();
  clearRaceMotions();
  elapsedBeforePause = 0;
  const input = inputFromControls();
  const mode = $('mode').value;
  if (mode !== 'baseline') {
    input.dramaArm = mode === 'plan23-individual-crossing' ? 'R2combined-risk-only' : mode;
    input.studySprintMean = ['R2combined-risk-only', 'plan23-individual-crossing'].includes(mode) ? 1.0 : 1.1;
  }
  const resolution = activeModel().resolveSeededRace(input);
  state = freshState(resolution);
  $('race-svg').dataset.resolutionFingerprint = raceFingerprint(resolution);
  $('runner-layer').replaceChildren();
  $('race-status').textContent = resolution.status === 'finished'
    ? `${modeLabel(mode)} resolved once · first line crossing at ${resolution.finishTimeSeconds.toFixed(2)}s${resolution.lastFinishTimeSeconds ? ` · last at ${resolution.lastFinishTimeSeconds.toFixed(2)}s` : ''} · ${resolution.draws.total} keyed mechanic draws.`
    : resolution.rulesVersion === individualFinishModel.PHYSICS.version
      ? `Race unresolved · ${resolution.unresolvedReason} · no final places or payout · ${resolution.draws.total} keyed mechanic draws.`
      : `Race unresolved · ${resolution.unresolvedReason} · no winner or payout · ${resolution.draws.total} keyed mechanic draws.`;
  $('race-boundary').textContent = resolution.rulesVersion === individualFinishModel.PHYSICS.version
    ? 'All six ducks receive their own genuine forward finish-line crossing and actual crossing order. A completed field may receive places and Gems; any unresolved entrant leaves the whole result unplaced.'
    : 'Six ducks start in the accepted two-lane grid. This comparison ends at the earliest interpolated forward finish-line crossing and classifies followers at that same instant. Recorded duck and wall contacts alter paths; only those events trigger impact/recovery motion.';
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
    ? `Sprint sampling · mean ×${['R2combined-risk-only', 'plan23-individual-crossing'].includes($('mode').value) ? '1.00' : '1.10'} with ±20% keyed spread`
    : 'Safe sampling · ±5% keyed spread';
  const individualFinish = r.rulesVersion === individualFinishModel.PHYSICS.version;
  const simText = r.status === 'finished'
    ? individualFinish ? `first crossing ${r.finishTimeSeconds.toFixed(2)}s; last crossing ${r.lastFinishTimeSeconds.toFixed(2)}s`
      : `first line crossing ${r.finishTimeSeconds.toFixed(2)}s`
    : `unresolved at ${r.horizonSeconds.toFixed(2)}s (${r.unresolvedReason})`;
  const coastText = individualFinish ? ' + 1s visual coast with overlapping 1s podium reveal' : '';
  $('finish-summary').textContent = `${state.fixtureLabel} · ${modelText} · authored rating ${preset?.playerBaseSpeed ?? '?'} × rest factor ${preset?.restFactor ?? '?'} · ${stanceText} · ${simText}${timeBonus ? ` + ${timeBonus}s playback highlight` : ''}${coastText} · ${state.presentationPlan.totalWallSeconds.toFixed(2)}s full playback${trialText}`;
  $('finish-order').replaceChildren();
  if (!revealFinish) {
    const item = document.createElement('li');
    item.textContent = `Result hidden during playback. ${r.eventRecords.length} mechanical event${r.eventRecords.length === 1 ? ' is' : 's are'} committed; they are revealed as playback reaches them.`;
    $('finish-order').append(item);
  } else if (r.status !== 'finished') {
    const item = document.createElement('li');
    item.textContent = individualFinish
      ? `Unresolved · ${r.unresolvedReason} · ${r.finishCrossings?.length ?? 0} ducks crossed, but no final places or payouts are issued unless every duck crosses.`
      : `Unresolved · ${r.unresolvedReason} · no winner or payout.`;
    $('finish-order').append(item);
  } else {
    for (const entrant of state.finish) {
      const item = document.createElement('li');
      const suffix = entrant.place === 1 ? 'st' : entrant.place === 2 ? 'nd' : entrant.place === 3 ? 'rd' : 'th';
      const crossing = entrant.crossedAtFinish
        ? `crossed at ${entrant.crossingTimeSeconds.toFixed(2)}s`
        : individualFinish ? `crossed at ${entrant.crossingTimeSeconds.toFixed(2)}s`
          : 'position at winner time';
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
  hidePodium();
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
  const crossingRows = state.resolution.finish.length ? state.resolution.finish : (state.resolution.finishCrossings ?? []);
  const raceSeconds = state.cursorTick * state.resolution.dt;
  const lastFinishSeconds = state.resolution.lastFinishTimeSeconds ?? raceSeconds;
  const coastClock = state.resultRevealStarted || state.finished
    ? lastFinishSeconds + (state.resultRevealProgress ?? (state.finished ? 1 : 0)) : raceSeconds;
  for (const entrant of state.entrants) {
    const position = snap.entrants.find((row) => row.id === entrant.id);
    if (!entrant.node) makeNode(entrant);
    const crossing = state.resolution.rulesVersion === individualFinishModel.PHYSICS.version
      ? crossingRows.find((item) => item.id === entrant.id) : null;
    const coastFraction = crossing ? clamp((coastClock - crossing.crossingTimeSeconds) / 1, 0, 1) : 0;
    const crossingPosition = crossing?.crossingPosition ?? crossing;
    const crossingX = crossingPosition?.x ?? crossing?.crossingX;
    const crossingY = crossingPosition?.y ?? crossing?.crossingY;
    const crossingHeading = crossing?.crossingHeading ?? crossingPosition?.heading ?? position.heading;
    const crossingSpeed = crossing?.crossingSpeed ?? crossingPosition?.speed ?? position.speed;
    const coastDistance = crossingSpeed * (coastFraction - coastFraction * coastFraction / 2);
    const positionX = crossing && coastFraction > 0 && Number.isFinite(crossingX)
      ? crossingX + Math.cos(crossingHeading) * coastDistance : position.x;
    const positionY = crossing && coastFraction > 0 && Number.isFinite(crossingY)
      ? crossingY + Math.sin(crossingHeading) * coastDistance : position.y;
    const x = 450 + positionX * PX_PER_METER;
    const y = 250 + positionY * PX_PER_METER;
    entrant.node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    const steeringYaw = model.raceHeadingError(position.progress, coastFraction ? crossingHeading : position.heading) * 180 / Math.PI;
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
  const cameraFraction = state.resolution.rulesVersion === individualFinishModel.PHYSICS.version
    ? cameraFractionAtTick(state.cursorTick, state.resolution.finishTimeSeconds / state.resolution.dt, state.resolution.ticks)
    : fraction;
  const zoom = !reducedNow && $('camera').value === 'scripted' ? smoothCloseZoom(cameraFraction) : 1;
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
  return raceFractionAtPlanWallClock(elapsedBeforePause / 1000, state.presentationPlan);
}

function tick(now) {
  if (!running || !state) return;
  const elapsed = elapsedBeforePause + now - startedAt;
  const total = state.presentationPlan.totalWallSeconds * 1000;
  const fraction = raceFractionAtPlanWallClock(elapsed / 1000, state.presentationPlan);
  const currentTick = fraction * state.resolution.ticks;
  state.resultRevealProgress = revealProgressAtElapsedMilliseconds(elapsed, state.presentationPlan);
  renderRunners(currentTick);
  if (resultRevealDueAtElapsedMilliseconds(elapsed, state.presentationPlan)) startResultReveal();
  revealReachedEvents(currentTick);
  $('race-status').textContent = `Race playing · ${(elapsed / 1000).toFixed(1)} / ${state.presentationPlan.totalWallSeconds}s playback · simulation ${currentTick.toFixed(1)} / ${state.resolution.ticks} ticks.`;
  if (elapsed >= total) { finishRace('finish'); return; }
  raf = requestAnimationFrame(tick);
}

function stopPlayback() {
  running = false; cancelAnimationFrame(raf);
  for (const controller of motionControllers.values()) controller.setActive(false);
  if (podiumAnimation?.playState === 'running') podiumAnimation.pause();
  if (lightingAnimation?.playState === 'running') lightingAnimation.pause();
  $('play').disabled = false; $('pause').disabled = true;
}

function pauseAtTick(tick, status) {
  stopPlayback();
  hidePodium();
  Object.assign(state, playbackStateAtSeek(clamp(tick, 0, state.resolution.ticks)));
  elapsedBeforePause = wallClockAtPlanFraction(state.cursorTick / state.resolution.ticks, state.presentationPlan) * 1000;
  revealReachedEvents(state.cursorTick);
  $('race-status').textContent = status;
  renderRunners(state.cursorTick);
  updateControls();
}

function startPlayback() {
  if (!state || running || state.finished) return;
  if (reduced) { nextCheckpoint(); return; }
  running = true; startedAt = performance.now();
  if (podiumAnimation?.playState === 'paused') podiumAnimation.play();
  if (lightingAnimation?.playState === 'paused') lightingAnimation.play();
  for (const controller of motionControllers.values()) controller.setActive(true);
  state.started = true;
  $('play').disabled = true; $('pause').disabled = false;
  appendPresentationRecord('playback started/resumed');
  raf = requestAnimationFrame(tick);
}

function finishRace(reason) {
  stopPlayback(); state.finished = true; state.cursorTick = state.resolution.ticks;
  elapsedBeforePause = state.presentationPlan.totalWallSeconds * 1000;
  if (state.presentationPlan.resultRevealSeconds && state.resolution.status === 'finished') {
    state.resultRevealStarted = true;
    state.resultRevealProgress = 1;
  }
  revealReachedEvents(state.cursorTick, true);
  renderSummary(true); renderRecord(true); renderOpportunityDiagnostics(true); renderRunners(state.cursorTick);
  $('race-status').textContent = reason === 'skip'
    ? 'Skipped to results · full committed summary revealed; no mechanics or RNG rerun.'
    : state.resolution.status === 'finished'
      ? state.resolution.rulesVersion === individualFinishModel.PHYSICS.version
        ? `Race complete · all ducks crossed; ${state.finish[0].name} finished first at ${state.resolution.finishTimeSeconds.toFixed(2)}s and the last duck crossed at ${state.resolution.lastFinishTimeSeconds.toFixed(2)}s.`
        : `Finish line · ${state.finish[0].name} crossed first at ${state.resolution.finishTimeSeconds.toFixed(2)}s.`
      : state.resolution.rulesVersion === individualFinishModel.PHYSICS.version
        ? `Race unresolved · ${state.resolution.unresolvedReason}; no final places or payout.`
        : `Race unresolved · ${state.resolution.unresolvedReason}; no winner or payout.`;
  $('narrative-status').textContent = `Full race summary · all ${state.resolution.eventRecords.length} committed events are available.`;
  $('scene-description').textContent = state.resolution.status === 'finished'
    ? state.resolution.rulesVersion === individualFinishModel.PHYSICS.version
      ? `Race complete. All ducks crossed the finish line in recorded order. ${state.finish[0].name} crossed first at ${state.resolution.finishTimeSeconds.toFixed(2)} seconds; the final duck crossed at ${state.resolution.lastFinishTimeSeconds.toFixed(2)} seconds.`
      : `Race complete. ${state.finish[0].name} crossed first at ${state.resolution.finishTimeSeconds.toFixed(2)} seconds; remaining places are classified at that same crossing time.`
    : state.resolution.rulesVersion === individualFinishModel.PHYSICS.version
      ? `Race unresolved at ${state.resolution.horizonSeconds.toFixed(2)} seconds. No final places or payout were recorded.`
      : `Race unresolved at ${state.resolution.horizonSeconds.toFixed(2)} seconds. No winner or payout was recorded.`;
  appendPresentationRecord(reason === 'skip' ? 'skip to results' : 'race finished');
  if (!$('race-narrative').hidden) renderEventList();
  if (reason === 'skip' || reduced) {
    state.skipReveal = reason === 'skip';
    showPodium({ animate: false });
    if (state.resolution.status === 'finished') settleResultLighting();
    state.skipReveal = false;
  } else if (!state.presentationPlan.resultRevealSeconds) showPodium({ animate: true });
  updateControls();
}

function safeHtml(text) {
  return String(text ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function stablePodiumHash(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function podiumOrdinal(place) {
  if (place % 100 >= 11 && place % 100 <= 13) return `${place}th`;
  return `${place}${place % 10 === 1 ? 'st' : place % 10 === 2 ? 'nd' : place % 10 === 3 ? 'rd' : 'th'}`;
}

function payoutLabel(entrant) {
  return Number.isFinite(Number(entrant.payout)) ? `${Number(entrant.payout)} Gems` : 'Payout pending';
}

function buildPodium() {
  const layer = $('podium-layer');
  layer.replaceChildren();
  const finishers = [...state.finish].sort((a, b) => a.place - b.place);
  if (state.resolution.status !== 'finished' || finishers.length < 3) return false;

  const namespace = `qp23-podium-${stablePodiumHash(raceFingerprint(state.resolution))}`;
  const positions = {
    1: { x: 390, top: 354, duckY: 238 },
    2: { x: 270, top: 389, duckY: 274 },
    3: { x: 510, top: 408, duckY: 292 },
  };
  const palette = { 1: '#b28b45', 2: '#718d98', 3: '#91765e' };
  const steps = document.createElementNS(NS, 'g');
  steps.setAttribute('class', 'podium-plinths');
  for (const place of [2, 1, 3]) {
    const { x, top } = positions[place];
    const group = document.createElementNS(NS, 'g');
    group.setAttribute('id', `${namespace}-plinth-${place}`);
    group.setAttribute('class', `podium-plinth podium-plinth-${place}`);
    const face = document.createElementNS(NS, 'rect');
    face.setAttribute('x', String(x)); face.setAttribute('y', String(top + 12)); face.setAttribute('width', '120'); face.setAttribute('height', String(466 - top));
    face.setAttribute('rx', '3'); face.setAttribute('fill', palette[place]); face.setAttribute('class', 'podium-plinth-face');
    const topFace = document.createElementNS(NS, 'path');
    topFace.setAttribute('d', `M ${x} ${top + 12} l 18 -12 h 84 l 18 12 z`);
    topFace.setAttribute('fill', '#f3eee2'); topFace.setAttribute('class', 'podium-plinth-top');
    group.append(face, topFace);
    for (let layerIndex = 1; layerIndex <= 3; layerIndex += 1) {
      const edge = document.createElementNS(NS, 'path');
      const y = top + 23 + layerIndex * 12;
      edge.setAttribute('d', `M ${x + 2} ${y} h 116`);
      edge.setAttribute('class', `podium-paper-edge podium-paper-edge-${layerIndex}`);
      group.append(edge);
    }
    steps.append(group);
  }
  layer.append(steps);

  for (const place of [2, 1, 3]) {
    const entrant = finishers.find((item) => item.place === place);
    if (!entrant) continue;
    const { x, top, duckY } = positions[place];
    const foreign = document.createElementNS(NS, 'foreignObject');
    foreign.setAttribute('x', String(x - 4)); foreign.setAttribute('y', String(duckY));
    foreign.setAttribute('width', '128'); foreign.setAttribute('height', String(top + 68 - duckY));
    foreign.setAttribute('class', 'podium-entrant-art');
    const prefix = `${namespace}-duck-${entrant.id.toLowerCase()}-${place}`;
    const ordinal = podiumOrdinal(place);
    const you = entrant.player ? '<span class="podium-you">YOU</span>' : '';
    foreign.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="podium-card podium-card-${place}">
      <div class="podium-duck">${createDigitalDuckSvg({ prefix, label: `${entrant.name}, ${ordinal} place podium duck`, palette: PALETTES_BY_ID[entrant.id] ?? 'classic-yellow', paperMode: 'hybrid' })}</div>
      <div class="podium-card-label"><strong>${ordinal} place</strong>${you}<span class="podium-name">${safeHtml(entrant.name)}</span><span class="podium-gems">${safeHtml(payoutLabel(entrant))}</span></div>
    </div>`;
    layer.append(foreign);
  }

  const summary = $('podium-summary');
  summary.replaceChildren();
  const heading = document.createElement('h3'); heading.textContent = 'Final podium and race payouts'; summary.append(heading);
  const list = document.createElement('ol');
  for (const entrant of finishers) {
    const item = document.createElement('li');
    item.textContent = `${podiumOrdinal(entrant.place)} place: ${entrant.name}; ${payoutLabel(entrant)}.${entrant.player ? ' You.' : ''}`;
    list.append(item);
  }
  summary.append(list); summary.hidden = false;
  const player = finishers.find((entrant) => entrant.player);
  const playerNote = $('podium-player-note');
  playerNote.textContent = player && player.place > 3
    ? `YOU · ${podiumOrdinal(player.place)} place · ${payoutLabel(player)}`
    : '';
  playerNote.hidden = !playerNote.textContent;
  return true;
}

function showPodium({ animate = false } = {}) {
  if (!state) return;
  if (state.podiumVisible) {
    if (!animate && podiumAnimation && podiumAnimation.playState !== 'finished') podiumAnimation.finish();
    return;
  }
  if (!buildPodium()) return;
  const layer = $('podium-layer');
  state.podiumVisible = true;
  state.podiumAppearanceCount += 1;
  layer.setAttribute('visibility', 'visible');
  appendPresentationRecord('podium shown', { replayIndex: state.replayNumber, appearance: state.podiumAppearanceCount,
    presentation: animate ? 'animated descent' : 'settled view', skippedMotion: Boolean(state.skipReveal) });
  if (animate && !reduced && typeof layer.animate === 'function') {
    podiumAnimation = layer.animate([
      { transform: 'translateY(-190px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ], { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' });
    podiumAnimation.onfinish = () => updateControls();
  }
}

function startResultReveal() {
  if (!state || state.resultRevealStarted || state.resolution.status !== 'finished') return;
  state.resultRevealStarted = true;
  showPodium({ animate: !reduced });
  const stage = $('stage-shell');
  stage.classList.add('result-reveal');
  const layer = $('result-lighting');
  if (!reduced && typeof layer.animate === 'function') {
    lightingAnimation = layer.animate([{ opacity: 0 }, { opacity: .34 }],
      { duration: 1000, easing: 'ease-out', fill: 'forwards' });
  } else layer.setAttribute('opacity', '.34');
  appendPresentationRecord('podium and finish lighting reveal started', {
    tick: state.resolution.ticks, lastFinishTimeSeconds: state.resolution.lastFinishTimeSeconds,
    coastSeconds: 1, podiumSeconds: 1,
  });
}

function settleResultLighting() {
  $('stage-shell').classList.add('result-reveal');
  const layer = $('result-lighting');
  lightingAnimation?.finish();
  if (layer) layer.setAttribute('opacity', '.34');
}

function hidePodium() {
  podiumAnimation?.cancel(); podiumAnimation = null;
  lightingAnimation?.cancel(); lightingAnimation = null;
  $('stage-shell')?.classList.remove('result-reveal');
  $('result-lighting')?.removeAttribute('opacity');
  $('podium-layer')?.replaceChildren(); $('podium-layer')?.setAttribute('visibility', 'hidden');
  if ($('podium-summary')) { $('podium-summary').replaceChildren(); $('podium-summary').hidden = true; }
  if ($('podium-player-note')) { $('podium-player-note').textContent = ''; $('podium-player-note').hidden = true; }
  if (state) { state.podiumVisible = false; state.resultRevealStarted = false; state.resultRevealProgress = 0; }
}

function seekCheckpoint(index) {
  hidePodium();
  const checkpoints = state.presentationPlan.checkpoints;
  const next = clamp(index, 0, checkpoints.length - 1);
  state.checkpointIndex = next;
  state.selectedEventId = null;
  pauseAtTick(checkpoints[next], `Paused at static checkpoint ${next + 1} of ${checkpoints.length} · tick ${checkpoints[next]}.`);
  appendPresentationRecord('reduced-motion checkpoint selected', { checkpoint: next + 1 });
  renderRunners(checkpoints[next]);
  if (reduced && checkpoints[next] >= state.resolution.ticks - 1e-9) finishRace('finish');
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
  if (!(state.resultRevealStarted && state.cursorTick >= state.resolution.ticks)) {
    const fraction = state.cursorTick / state.resolution.ticks;
    elapsedBeforePause = wallClockAtPlanFraction(fraction, state.presentationPlan) * 1000;
  }
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
    const frac = raceFractionAtPlanWallClock(elapsed / 1000, state.presentationPlan);
    state.cursorTick = frac * state.resolution.ticks;
  }
  stopPlayback(); reduced = nextReduced;
  document.body.classList.toggle('reduce-motion', reduced);
  state.presentationPlan = presentationPlanFor(state.resolution);
  if (wasRunning) {
    elapsedBeforePause = wallClockAtPlanFraction(state.cursorTick / state.resolution.ticks, state.presentationPlan) * 1000;
    appendPresentationRecord('display mode changed; simulation position preserved', { fromTick: currentTick, toTick: state.cursorTick, reducedMotion: reduced });
  }
  if (reduced) state.checkpointIndex = nearestCheckpointIndex(state.cursorTick);
  if (reduced && state.resultRevealStarted) {
    podiumAnimation?.finish(); lightingAnimation?.finish();
    state.resultRevealProgress = 1;
    if (!state.finished) finishRace('finish');
  }
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
  state.presentationPlan = presentationPlanFor(state.resolution);
  renderRunners(state.cursorTick);
  updateControls();
  $('race-status').textContent = 'Presentation changed · same trajectory, event order, finish and rewards.';
}

function replayRace() {
  if (!state) return;
  const fromTick = state.cursorTick;
  stopPlayback();
  hidePodium();
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
  state.cursorTick = raceFractionAtPlanWallClock(elapsed / 1000, state.presentationPlan) * state.resolution.ticks;
  if (state.presentationPlan.resultRevealSeconds) {
    state.resultRevealProgress = revealProgressAtElapsedMilliseconds(elapsed, state.presentationPlan);
  }
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
