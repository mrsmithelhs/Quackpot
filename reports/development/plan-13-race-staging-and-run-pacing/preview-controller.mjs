import {
  buildPresentationPlan,
  presentationProgressFraction,
  raceFractionAtWallClock,
  resolveSeededRace,
  savePresentationSnapshot,
  restorePresentationSnapshot,
  visualLaneAt,
} from './preview-model.mjs';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const FIXTURES = {
  overtake: {
    label: 'Fixed fixture · draft and bobble overtake',
    speeds: [12, 11.7, 11.8, 11.4, 11.2, 11],
    draws: { 0.4: [0.8, 0.1, 0.8, 0.8, 0.8, 0.8], 0.7: [0.02, 0.8, 0.8, 0.8, 0.8, 0.8] },
  },
  none: {
    label: 'Fixed fixture · no-event control',
    speeds: [12, 11.7, 11.8, 11.4, 11.2, 11],
    draws: { 0.4: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8], 0.7: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8] },
  },
  tie: {
    label: 'Fixed fixture · non-player event and exact tie',
    speeds: [12, 12, 11.8, 11.4, 11.2, 11],
    draws: { 0.4: [0.8, 0.8, 0.02, 0.8, 0.8, 0.8], 0.7: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8] },
  },
};
const BASE_ENTRANTS = [
  { id: 'A', name: 'Rival A', lane: 1 },
  { id: 'P', name: 'Player', lane: 2, player: true },
  { id: 'B', name: 'Rival B', lane: 3 },
  { id: 'C', name: 'Rival C', lane: 4 },
  { id: 'D', name: 'Rival D', lane: 5 },
  { id: 'E', name: 'Rival E', lane: 6 },
];
const AXES = [
  { rx: 345, ry: 173 }, { rx: 309, ry: 149 }, { rx: 273, ry: 125 },
  { rx: 237, ry: 101 }, { rx: 201, ry: 77 }, { rx: 165, ry: 53 },
];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const LOCAL_SNAPSHOT_KEY = 'quackpot.plan13.presentationSnapshot.v1';

let state = null;
let raf = 0;
let startedAt = 0;
let elapsedBeforePause = 0;
let running = false;
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let savedSnapshot = null;

function rankAt(entrants, fraction) {
  return [...entrants].sort((a, b) => {
    const aScore = a.speed * 100 * fraction + a.offset;
    const bScore = b.speed * 100 * fraction + b.offset;
    if (Math.abs(bScore - aScore) > 1e-8) return bScore - aScore;
    if (a.player) return -1;
    if (b.player) return 1;
    return a.lane - b.lane;
  });
}

function resolveFixture(fixtureId, model) {
  const fixture = FIXTURES[fixtureId];
  const entrants = BASE_ENTRANTS.map((entrant, index) => ({
    ...entrant,
    speed: fixture.speeds[index],
    baselineScore: fixture.speeds[index] * 100,
    offset: 0,
    presentationEvents: [],
    node: null,
  }));
  const rows = [];

  if (model === 'causal') {
    for (const beat of [0.4, 0.7]) {
      const frozen = rankAt(entrants, beat);
      const beatScores = new Map(entrants.map((entrant) => [entrant.id, entrant.baselineScore * beat + entrant.offset]));
      const pending = [];
      for (const entrant of [...entrants].sort((a, b) => a.lane - b.lane)) {
        const draw = fixture.draws[beat][entrant.lane - 1];
        const position = frozen.findIndex((candidate) => candidate.id === entrant.id);
        const ahead = position > 0 ? frozen[position - 1] : null;
        const gap = ahead ? beatScores.get(ahead.id) - beatScores.get(entrant.id) : null;
        const eligible = Boolean(ahead && gap <= entrant.baselineScore * 0.02);
        let event = 'none';
        let delta = 0;
        let reason = 'roll outside event ranges';
        if (draw < 0.05) {
          event = 'bobble'; delta = -entrant.baselineScore * 0.02; reason = 'roll below 0.05';
        } else if (eligible && draw < 0.25) {
          event = 'clean-draft'; delta = entrant.baselineScore * 0.02; reason = 'eligible gap and roll in [0.05, 0.25)';
        } else if (!ahead) reason = 'leading at beat start';
        else if (!eligible) reason = 'outside the 2% draft gap';
        pending.push({ entrant, beat, draw, event, delta, reason, eligible, gap, offsetBefore: entrant.offset });
      }
      for (const row of pending) row.entrant.offset += row.delta;
      for (const row of pending) {
        if (row.delta) row.entrant.presentationEvents.push({ beat, delta: row.delta });
        rows.push({
          beat, id: row.entrant.id, lane: row.entrant.lane, entrantName: row.entrant.name,
          draw: row.draw, eligible: row.eligible, gap: row.gap, event: row.event,
          delta: row.delta, reason: row.reason,
          progressBefore: row.entrant.baselineScore * beat + row.offsetBefore,
          progressAfter: row.entrant.baselineScore * beat + row.entrant.offset,
        });
      }
    }
  } else {
    for (const beat of [0.4, 0.7]) for (const entrant of entrants) rows.push({
      beat, id: entrant.id, lane: entrant.lane, entrantName: entrant.name,
      draw: null, eligible: false, gap: null, event: 'no added event', delta: 0,
      reason: 'finish already resolved by baseline performance',
      progressBefore: entrant.baselineScore * beat, progressAfter: entrant.baselineScore * beat,
    });
  }

  const finish = rankAt(entrants, 1).map((entrant, index) => ({
    id: entrant.id,
    name: entrant.name,
    lane: entrant.lane,
    player: Boolean(entrant.player),
    speed: entrant.speed,
    baselineScore: entrant.baselineScore,
    offset: entrant.offset,
    score: entrant.baselineScore + entrant.offset,
    place: index + 1,
    payout: [50, 20, 10][index] ?? 0,
  }));
  return {
    source: 'fixture', model, fixtureLabel: fixture.label, entrants, finish,
    rows, eventRecords: rows, resolution: null,
  };
}

function stateFromSeededResolution(resolution) {
  const presentationEvents = resolution.eventRecords
    .filter((event) => event.delta !== 0)
    .reduce((byEntrant, event) => {
      (byEntrant[event.id] ??= []).push({ beat: event.beat, delta: event.delta });
      return byEntrant;
    }, {});
  const entrants = resolution.entrants.map((entrant) => ({
    ...entrant,
    offset: entrant.offset,
    presentationEvents: presentationEvents[entrant.id] ?? [],
    node: null,
  }));
  return {
    source: 'seeded', model: resolution.model,
    fixtureLabel: `Named seed · ${resolution.seed} · race ${resolution.raceId}`,
    entrants, finish: resolution.finish,
    rows: resolution.eventRecords.map((event) => ({
      ...event, entrantName: entrants.find((entrant) => entrant.id === event.id)?.name ?? event.id,
      draw: event.eventDraw,
    })),
    eventRecords: resolution.eventRecords,
    resolution,
  };
}

function inputFromControls() {
  return {
    seed: $('run-seed').value.trim(),
    raceId: $('race-id').value.trim(),
    playerBaseSpeed: Number($('player-speed').value),
    fieldBaseSpeed: Number($('field-speed').value),
    choice: $('choice').value,
    trialCommitted: $('trial').checked,
    model: $('model').value,
  };
}

function currentPresentationSettings() {
  return {
    duration: Number($('duration').value),
    camera: $('camera').value === 'scripted' ? 'close' : 'wide',
    reducedMotion: reduced,
    staticMode: false,
    skipped: false,
    replay: false,
    highlightSeconds: Number($('highlight').value),
    lighting: $('lighting').value,
  };
}

function resolveOutcomes() {
  stopPlayback();
  const seeded = $('trace').value === 'seeded';
  $('seed-inputs').style.display = seeded ? 'block' : 'none';
  $('save-state').disabled = !seeded || !state?.resolution;
  $('restore-state').disabled = !seeded || !savedSnapshot;
  try {
    state = seeded
      ? stateFromSeededResolution(resolveSeededRace(inputFromControls()))
      : resolveFixture($('trace').value, $('model').value);
    state.presentationPlan = buildPresentationPlan(state.resolution ?? { entrants: state.entrants }, currentPresentationSettings());
    $('save-state').disabled = !seeded;
    $('restore-state').disabled = !seeded || !savedSnapshot;
    renderSummary();
    renderRecord();
    renderRunners(0);
    const drawText = state.resolution
      ? ` · ${state.resolution.draws.total} mechanic draws (perf ${state.resolution.draws.performance}, events ${state.resolution.draws.events})`
      : ' · fixed fixture draws';
    $('race-status').textContent = `Ready · ${state.fixtureLabel}; ${state.model === 'causal' ? 'causal beats' : 'resolved-result control'}${drawText}.`;
  } catch (error) {
    state = null;
    $('finish-summary').textContent = `Input error: ${error.message}`;
    $('finish-order').replaceChildren();
    $('event-summary').textContent = '';
    $('record').replaceChildren();
    $('race-status').textContent = 'Correct the committed race inputs to resolve this preview.';
  }
}

function updatePresentationOnly({ reset = true } = {}) {
  if (!state) return;
  if (reset) {
    stopPlayback();
    elapsedBeforePause = 0;
  }
  state.presentationPlan = buildPresentationPlan(state.resolution ?? { entrants: state.entrants }, currentPresentationSettings());
  renderSummary();
  renderRunners(reset || reduced ? 0 : playbackFraction());
  if (reset) $('race-status').textContent = 'Presentation updated · same committed mechanical record; no outcome draws consumed.';
}

function renderSummary() {
  const duration = Number($('duration').value);
  const highlight = Number($('highlight').value);
  const modelLabel = state.model === 'causal' ? 'causal mechanical beats' : 'resolved-result control';
  const trialText = state.resolution?.trialConsumptionCount
    ? ' · Plan 17 trial applied and consumed once on race commit'
    : '';
  $('finish-summary').textContent = `${state.fixtureLabel} · ${modelLabel} · ${duration}s race${highlight ? ` + ${highlight}s highlight` : ''} = ${duration + highlight}s wall time${trialText}`;
  $('finish-order').replaceChildren();
  for (const entrant of state.finish) {
    const item = document.createElement('li');
    const suffix = entrant.place === 1 ? 'st' : entrant.place === 2 ? 'nd' : entrant.place === 3 ? 'rd' : 'th';
    item.textContent = `${entrant.name} · ${entrant.score.toFixed(1)} points · ${entrant.place}${suffix} · ${entrant.payout} Gems`;
    $('finish-order').append(item);
  }
  const changed = state.rows.filter((row) => row.delta !== 0).map((row) => `${row.id} ${row.event} ${row.delta > 0 ? '+' : ''}${row.delta.toFixed(1)} at ${Math.round(row.beat * 100)}%`);
  $('event-summary').textContent = changed.length
    ? `Recorded causes: ${changed.join('; ')}.`
    : `Recorded causes: no progress-changing race event.${state.resolution ? ` Named-seed draw record: ${state.resolution.draws.total} mechanical draws.` : ''}`;
}

function renderRecord() {
  const body = $('record');
  body.replaceChildren();
  for (const row of state.rows) {
    const final = state.finish.find((entrant) => entrant.id === row.id);
    const roll = row.draw === null || row.draw === undefined ? row.reason : `r=${row.draw.toFixed(6)} · ${row.reason}`;
    const effect = row.event === 'none' || row.event === 'no added event' ? row.event : `${row.event}${row.delta ? ` ${row.delta > 0 ? '+' : ''}${row.delta.toFixed(2)}` : ''}`;
    const progress = row.progressBefore === undefined
      ? '—'
      : `${row.progressBefore.toFixed(1)} → ${row.progressAfter.toFixed(1)}`;
    const values = [
      `${Math.round(row.beat * 100)}%`, `${row.entrantName} (lane ${row.lane})`, roll,
      effect, progress, final ? final.score.toFixed(1) : '—',
    ];
    const tr = document.createElement('tr');
    for (const value of values) {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    }
    body.append(tr);
  }
}

function makeNode(entrant) {
  const group = document.createElementNS(NS, 'g');
  group.setAttribute('class', 'runner-token'); group.setAttribute('aria-hidden', 'true');
  const image = document.createElementNS(NS, 'image');
  image.setAttribute('href', '../../../src/assets/svg/duck-rig.svg');
  image.setAttribute('x', '-24'); image.setAttribute('y', '-24'); image.setAttribute('width', '48'); image.setAttribute('height', '48');
  image.dataset.duckImage = 'true';
  const label = document.createElementNS(NS, 'text');
  label.setAttribute('class', 'runner-label'); label.setAttribute('x', '0'); label.setAttribute('y', '-29'); label.setAttribute('text-anchor', 'middle'); label.textContent = entrant.id;
  group.append(image, label); $('runner-layer').append(group); entrant.node = group;
}

function progressFor(entrant, t) {
  return presentationProgressFraction(entrant, state.finish, t);
}

function renderRunners(t) {
  if (!state) return;
  for (const entrant of state.entrants) {
    const fraction = progressFor(entrant, t);
    const angle = -Math.PI / 2 + fraction * Math.PI * 2;
    const path = state.presentationPlan?.visualLanePaths.find((item) => item.logicalLane === entrant.lane);
    const visualLane = !reduced && path ? visualLaneAt(path, t) : entrant.lane;
    const low = Math.floor(visualLane); const high = Math.min(AXES.length, low + 1);
    const blend = visualLane - low;
    const rx = AXES[low - 1].rx * (1 - blend) + AXES[high - 1].rx * blend;
    const ry = AXES[low - 1].ry * (1 - blend) + AXES[high - 1].ry * blend;
    const x = 450 + rx * Math.cos(angle); const y = 250 + ry * Math.sin(angle);
    if (!entrant.node) makeNode(entrant);
    entrant.node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    // The SVG reference's bill points left; rotate its facing back onto the travel tangent.
    const facing = Math.atan2(ry * Math.cos(angle), -rx * Math.sin(angle)) * 180 / Math.PI + 180;
    entrant.node.querySelector('[data-duck-image="true"]').setAttribute('transform', `rotate(${facing.toFixed(1)})`);
  }
  const close = $('camera').value === 'scripted' && !reduced;
  const zoom = close ? smoothCloseZoom(t) : 1;
  const player = state.entrants.find((entrant) => entrant.player);
  const playerT = progressFor(player, t); const playerAngle = -Math.PI / 2 + playerT * Math.PI * 2;
  const axis = AXES[player.lane - 1];
  const px = 450 + axis.rx * Math.cos(playerAngle); const py = 250 + axis.ry * Math.sin(playerAngle);
  const tx = zoom === 1 ? 0 : 450 - px * zoom;
  const ty = zoom === 1 ? 0 : 250 - py * zoom;
  $('camera-root').setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${zoom.toFixed(4)})`);
  $('stage-shell').classList.toggle('warm-light', $('lighting').value === 'warm' && !reduced);
  $('camera-note').textContent = reduced
    ? 'Static/reduced-motion mode: no moving racers or camera zoom; the same final positions and recorded order remain visible. Warm lighting is disabled.'
    : $('camera').value === 'wide'
      ? 'Locked wide. Tangent-facing ducks and staggered lane paths are presentation only; logical lanes stay fixed.'
      : 'Camera eases in around the 40% beat, then eases back wide. Lane paths do not affect logical lanes or results.';
}

function smoothCloseZoom(t) {
  if (t < 0.34 || t > 0.76) return 1;
  const smooth = (x) => x * x * (3 - 2 * x);
  if (t < 0.42) return 1 + smooth((t - 0.34) / 0.08) * 0.16;
  if (t <= 0.66) return 1.16;
  return 1.16 - smooth((t - 0.66) / 0.1) * 0.16;
}

function playbackFraction() {
  return raceFractionAtWallClock(elapsedBeforePause / 1000, {
    duration: Number($('duration').value), highlightSeconds: Number($('highlight').value),
  });
}

function tick(now) {
  if (!running || !state) return;
  const elapsed = elapsedBeforePause + (now - startedAt);
  const total = state.presentationPlan.totalWallSeconds * 1000;
  const progress = clamp(elapsed / total, 0, 1);
  const fraction = raceFractionAtWallClock(elapsed / 1000, {
    duration: state.presentationPlan.duration,
    highlightSeconds: state.presentationPlan.highlightSeconds,
  });
  renderRunners(fraction);
  $('race-status').textContent = `Race playing · ${Math.min(state.presentationPlan.totalWallSeconds, elapsed / 1000).toFixed(1)} / ${state.presentationPlan.totalWallSeconds}s wall time · race ${Math.round(fraction * 100)}%`;
  if (progress >= 1) {
    running = false; elapsedBeforePause = 0;
    $('play').disabled = false; $('pause').disabled = true;
    $('race-status').textContent = `Finish · ${state.finish[0].name} wins under the selected model.`;
    renderRunners(1); return;
  }
  raf = requestAnimationFrame(tick);
}

function stopPlayback() {
  running = false;
  cancelAnimationFrame(raf);
  $('play').disabled = false;
  $('pause').disabled = true;
}

function startPlayback() {
  if (!state) return;
  if (reduced) {
    renderRunners(1);
    $('race-status').textContent = 'Static result shown · the committed mechanics and finish are unchanged.';
    return;
  }
  if (running) return;
  running = true; startedAt = performance.now();
  $('play').disabled = true; $('pause').disabled = false;
  raf = requestAnimationFrame(tick);
}

function captureSnapshot() {
  if (!state?.resolution) return;
  try {
    savedSnapshot = savePresentationSnapshot(state.resolution, currentPresentationSettings());
    sessionStorage.setItem(LOCAL_SNAPSHOT_KEY, savedSnapshot);
    $('restore-state').disabled = false;
    $('race-status').textContent = 'Presentation snapshot saved locally · mechanic draws remain unchanged.';
  } catch (error) {
    $('race-status').textContent = `Could not save this browser-local snapshot: ${error.message}`;
  }
}

function restoreSnapshot() {
  try {
    stopPlayback();
    elapsedBeforePause = 0;
    const serialized = savedSnapshot ?? sessionStorage.getItem(LOCAL_SNAPSHOT_KEY);
    if (!serialized) throw new Error('no saved snapshot is available');
    const snapshot = restorePresentationSnapshot(serialized);
    state = stateFromSeededResolution(snapshot.resolution);
    $('model').value = snapshot.resolution.model;
    $('trace').value = 'seeded';
    $('run-seed').value = snapshot.resolution.inputs.seed;
    $('race-id').value = snapshot.resolution.inputs.raceId;
    $('player-speed').value = snapshot.resolution.inputs.playerBaseSpeed;
    $('field-speed').value = snapshot.resolution.inputs.fieldBaseSpeed;
    $('choice').value = snapshot.resolution.inputs.choice;
    $('trial').checked = snapshot.resolution.inputs.trialCommitted;
    $('duration').value = String(snapshot.presentation.duration);
    $('camera').value = snapshot.presentation.camera === 'close' ? 'scripted' : 'wide';
    $('highlight').value = String(snapshot.presentation.highlightSeconds);
    $('lighting').value = snapshot.presentation.lighting;
    reduced = snapshot.presentation.reducedMotion;
    $('reduce').checked = reduced;
    document.body.classList.toggle('reduce-motion', reduced);
    state.presentationPlan = snapshot.presentation;
    renderSummary(); renderRecord(); renderRunners(0);
    $('race-status').textContent = 'Snapshot restored · the saved mechanical record was reused; no outcome draws consumed.';
  } catch (error) {
    $('race-status').textContent = `Could not restore snapshot: ${error.message}`;
  }
}

for (const id of ['model', 'trace', 'run-seed', 'race-id', 'player-speed', 'field-speed', 'choice', 'trial']) {
  const control = $(id);
  control.addEventListener(control.type === 'text' || control.type === 'number' ? 'change' : 'change', resolveOutcomes);
}
for (const id of ['duration', 'camera', 'highlight', 'lighting']) $(id).addEventListener('change', () => updatePresentationOnly());
$('reduce').checked = reduced;
$('reduce').addEventListener('change', () => {
  reduced = $('reduce').checked;
  document.body.classList.toggle('reduce-motion', reduced);
  updatePresentationOnly();
  if (reduced) { renderRunners(1); $('race-status').textContent = 'Static finish · same committed mechanics, events, scores and payouts.'; }
});
$('play').addEventListener('click', startPlayback);
$('pause').addEventListener('click', () => {
  if (!running) return;
  elapsedBeforePause += performance.now() - startedAt;
  stopPlayback();
  $('race-status').textContent = 'Paused · resume from the same mechanical record; no outcome draws consumed.';
});
$('skip-race').addEventListener('click', () => {
  stopPlayback(); elapsedBeforePause = 0; renderRunners(1);
  $('race-status').textContent = 'Skipped to finish · the same committed result and record were used.';
});
$('replay').addEventListener('click', () => {
  stopPlayback(); elapsedBeforePause = 0; renderRunners(0);
  $('race-status').textContent = 'Replay reset · same committed result; no outcome draws consumed.';
});
$('save-state').addEventListener('click', captureSnapshot);
$('restore-state').addEventListener('click', restoreSnapshot);
$('uninstall').addEventListener('click', () => {
  $('exit-note').textContent = 'Uninstall remains reachable in this demonstration. This preview does not start or end a game run.';
});
$('turn').addEventListener('click', () => {
  const card = $('turn-card');
  const toBack = !card.classList.contains('is-back');
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
});

try { savedSnapshot = sessionStorage.getItem(LOCAL_SNAPSHOT_KEY); } catch { savedSnapshot = null; }
$('restore-state').disabled = !savedSnapshot;
resolveOutcomes();
