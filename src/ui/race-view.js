import { BANNER_1_ROSTER, DUCK_COSMETICS, GAME_CONSTANTS } from '../core/game-engine.mjs';
import { raceDuckYaw, raceHeadingError, sampleTrajectory } from '../core/race-resolver.mjs';
import { createDigitalDuckSvg } from './duck-rig-view.mjs';
import { createRaceMotionController } from './race-motion-controller.mjs';
import { deriveRaceRest, formatRaceRating, stableExposureSignature } from '../core/race-rest.mjs';
import './race-entry.css';
import { createRacePlaybackController, describeRaceEvent, individualPresentationTiming, participantGlowEnvelope, raceCourseTimeAtFraction, raceHighlightParticipantEvents, restoreRaceTimelineState, RACE_TIMELINE_EVENT_TYPES, wallClockAtRaceFraction } from './race-playback-controller.mjs';

const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const LABEL_SHIFTS = [-96, 0, 96, -96, 0, 96];

function isFullyVisibleInViewport(element) {
  if (!element || document.visibilityState === 'hidden') return false;
  for (let ancestor = element; ancestor instanceof Element; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
  }
  const rect = element.getBoundingClientRect();
  const hud = document.querySelector('#hud-container');
  const hudRect = hud?.getBoundingClientRect();
  const hudStyle = hud ? getComputedStyle(hud) : null;
  const stickyHudCoversCandidate = hudRect && hudStyle?.position === 'sticky'
    && hudRect.top <= 0 && hudRect.bottom > 0 && rect.top < hudRect.bottom
    && rect.right > hudRect.left && rect.left < hudRect.right;
  return !stickyHudCoversCandidate && rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0
    && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight;
}

function duckSvg(duckId, name, prefix) {
  const cosmetics = DUCK_COSMETICS[duckId] ?? DUCK_COSMETICS['duck-0'];
  return createDigitalDuckSvg({ prefix, label: name, ...cosmetics });
}

function raceName(entrant, raceNumber) {
  if (raceNumber === 2 && entrant.id === 'A') return 'Rival Whale';
  return entrant.id === 'P' ? 'Your duck' : entrant.name;
}

function placeLabel(place) {
  return `${place}${place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'}`;
}

function sceneMarkup(resolution, raceNumber, attempt) {
  const labels = Object.fromEntries(resolution.entrants.map((entrant) => [entrant.id, raceName(entrant, raceNumber)]));
  labels.P = BANNER_1_ROSTER.find((duck) => duck.id === attempt.duckId)?.name ?? 'Your duck';
  const runners = resolution.entrants.map((entrant) => {
    const id = entrant.id;
    const prefix = `race-${raceNumber}-${id}`;
    const duckId = id === 'P' ? attempt.duckId : `duck-${(id.charCodeAt(0) - 64) % 6}`;
    const labelIndex = resolution.entrants.findIndex((item) => item.id === id);
    return `<div class="race-runner-position" data-race-position="${esc(id)}" data-race-id="${esc(id)}">
      <div class="race-runner-orientation" data-race-orientation>
        <div class="race-runner-scope" data-race-runner-scope>
          <div class="race-contact-layer" data-race-contact-layer>
            <div class="race-duck-shell" data-duck-motion="paddle" data-duck-prefix="${prefix}" data-race-id="${esc(id)}">
              ${duckSvg(duckId, labels[id], prefix)}
            </div>
          </div>
        </div>
      </div>
      <span class="race-runner-label" data-label-stack="${labelIndex}" style="--race-label-x:${LABEL_SHIFTS[labelIndex] ?? 0}px">${esc(labels[id])}</span>
    </div>`;
  }).join('');
  const podium = [2, 1, 3].map((place) => resolution.finish.find((entrant) => entrant.place === place)).filter(Boolean).map((entrant) => {
    const id = entrant.id;
    const place = entrant.place;
    const prefix = `podium-${raceNumber}-${place}-${id}`;
    const motion = place === 1 ? 'graceful-bob' : 'paddle';
    const isPlayer = id === 'P';
    const duckId = isPlayer ? attempt.duckId : `duck-${(id.charCodeAt(0) - 64) % 6}`;
    return `<div class="race-podium-card race-podium-place-${place}${isPlayer ? ' is-player' : ''}" data-podium-card="${place}">
      <span class="podium-place-label">${place}${['th','st','nd','rd'][place] || 'th'} place${isPlayer ? ' (you!)' : ''}</span>
      <div class="podium-platform"></div>
      <div class="podium-duck-shell" data-duck-motion="${motion}" data-duck-prefix="${prefix}" data-race-id="${esc(id)}">
        ${duckSvg(duckId, labels[id], prefix)}
      </div>
      <strong class="podium-competitor">${esc(labels[id])}</strong>
      <span class="podium-award">${entrant.payout} Gems</span>
    </div>`;
  }).join('');

  return { labels, runners, podium };
}

function mountPlayback(container, attempt, resolution, raceNumber, callbacks, options) {
  const { onProceed, onAction = () => {}, onCueDisplayed = () => {} } = callbacks;
  const { active = true, initialSnapshot = null } = options;
  const { labels, runners, podium: podiumMarkup } = sceneMarkup(resolution, raceNumber, attempt);
  const timelineEvents = resolution.eventRecords.filter((event) => RACE_TIMELINE_EVENT_TYPES.includes(event.type));
  const timing = individualPresentationTiming(resolution);
  const contactGlowEvents = resolution.eventRecords.filter((event) => ['duck-contact', 'wall-impact'].includes(event.type));
  const highlightParticipantEvents = raceHighlightParticipantEvents(resolution);
  const highlightCenterFraction = (timing.highlightStartFraction + timing.highlightEndFraction) / 2;
  const highlightGlowStartSeconds = wallClockAtRaceFraction(highlightCenterFraction, timing) - 1.1;
  const finishPlaces = new Map(resolution.finish.map((entrant) => [entrant.id, entrant.place]));
  const playerFinish = resolution.finish.find((entrant) => entrant.id === 'P');
  const playerPodiumText = playerFinish?.place <= 3
    ? `${placeLabel(playerFinish.place)} place! +${playerFinish.payout} Gems`
    : '';
  const timelineItems = [0, 25, 50, 75, 100].map((percent) => ({
    tick: resolution.ticks * percent / 100,
    time: raceCourseTimeAtFraction(percent / 100, timing),
    kind: 'checkpoint', percent,
  })).concat(timelineEvents.map((event) => ({ tick: event.tick, time: raceCourseTimeAtFraction(event.tick / resolution.ticks, timing), kind: 'event', event })))
    .sort((a, b) => a.tick - b.tick || (a.kind === 'checkpoint' ? -1 : 1));

  container.innerHTML = `
    <section class="race-view race-playback" aria-labelledby="race-title-${raceNumber}" data-player-duck-id="${esc(attempt.duckId)}">
      <header class="race-view-header">
        <h2 id="race-title-${raceNumber}">${raceNumber === 1 ? 'Opening Pond Trial' : 'Championship Race'}</h2>
        <p class="race-eyebrow">${raceNumber === 1 ? 'Tutorial event' : 'Championship finale'}</p>
      </header>

      <div class="race-player-podium-slot"><p class="race-player-podium-banner" data-player-podium-banner hidden></p></div>

      <div class="race-track-stage">
        <div class="race-camera-layer" data-race-camera>
          <svg class="race-environment" viewBox="-52 -32 104 64" role="img" aria-label="Oval race scene">
            <rect x="-52" y="-32" width="104" height="64" rx="10" fill="#91b8a9"/>
            <ellipse cx="0" cy="0" rx="49" ry="29" fill="#327987"/>
            <path d="M -30 -20 H 30 A 20 20 0 0 1 30 20 H -30 A 20 20 0 0 1 -30 -20" fill="none" stroke="#b2d6bd" stroke-width="12"/>
            <path d="M -30 -20 H 30 A 20 20 0 0 1 30 20 H -30 A 20 20 0 0 1 -30 -20" fill="none" stroke="#477d62" stroke-width="1.3"/>
          </svg>
          <svg class="race-finish-markings" viewBox="-52 -32 104 64" aria-hidden="true">
            <path d="M -1 -23 V -17 M 0 -23 V -17 M 1 -23 V -17" stroke="#fff5c2" stroke-width=".45"/>
            <text x="3" y="-20" font-size="2.5" fill="#fff5c2">FINISH</text>
          </svg>
          <div class="race-runner-layer" data-race-runners>${runners}</div>
        </div>
        <div class="race-scene-dim" data-race-scene-dim aria-hidden="true"></div>
        <svg class="race-finish-overlay" viewBox="-52 -32 104 64" aria-hidden="true" data-race-finish-overlay>
          <path d="M -1 -23 V -17 M 0 -23 V -17 M 1 -23 V -17" stroke="#fff5c2" stroke-width=".45"/>
          <text x="3" y="-20" font-size="2.5" fill="#fff5c2">FINISH</text>
        </svg>
        <div class="race-podium-scope" data-race-podium-scope>
          <button type="button" data-duck-motion-toggle hidden tabindex="-1" aria-hidden="true"></button>
          <span data-duck-motion-status hidden></span>
          <div class="race-podium" data-race-podium aria-label="Final race podium" hidden></div>
        </div>
      </div>

      <div class="race-live-readout"><p class="race-commentary" data-race-commentary aria-live="polite">The field is moving toward the finish.</p><strong class="race-time-readout" data-race-time>0.00 s</strong></div>

      <div class="race-playback-controls" aria-label="Race playback controls">
        <button type="button" class="race-control-button" data-race-pause aria-label="Pause race playback">Pause</button>
        <button type="button" class="race-control-button" data-race-replay>Replay race</button>
      </div>

      ${timelineItems.length ? `<details class="race-event-seeking"><summary>Race timeline and stills</summary>
        <ol>${timelineItems.map((item) => item.kind === 'checkpoint'
          ? `<li><button type="button" data-race-checkpoint="${item.percent}" aria-label="Show ${item.percent} percent race checkpoint">${item.percent}% checkpoint · ${item.time.toFixed(2)} s</button></li>`
          : `<li><button type="button" data-race-seek="${esc(item.event.id)}" aria-label="Upcoming race moment at ${item.time.toFixed(2)} seconds">Upcoming race moment · ${item.time.toFixed(2)} s</button></li>`).join('')}</ol>
      </details>` : ''}

      <div class="race-result-summary" data-race-result-summary hidden></div>
      <div class="race-exit-actions"><button type="button" class="race-control-button" data-race-proceed disabled>Continue</button></div>
    </section>`;

  const viewRoot = container.querySelector('.race-playback');
  const runnerLayer = container.querySelector('[data-race-runners]');
  const podiumScope = container.querySelector('[data-race-podium-scope]');
  const timelineDetails = container.querySelector('.race-event-seeking');
  const timelineDisplayedEventIds = new Set(initialSnapshot?.timelineDisplayedEventIds ?? []);
  let motion = createRaceMotionController(container, { active, podiumMotionPaused: initialSnapshot?.podiumMotionPaused });
  let previousElapsed = initialSnapshot?.elapsedMs ?? 0;
  let highlightLogged = false;
  let podiumLogged = false;
  let resultLogged = false;
  let completedMotionSet = false;
  let podiumMaterialized = false;

  const draw = (state) => {
    if (state.elapsedMs < previousElapsed - 0.1) {
      highlightLogged = false;
      podiumLogged = false;
      resultLogged = false;
      completedMotionSet = false;
    }
    previousElapsed = state.elapsedMs;
    const timeline = sampleTrajectory(resolution, state.cursorTick);
    const coordinate = (value, min, span) => `${clamp(((value - min) / span) * 100, 0, 100)}%`;
    for (const entrantState of timeline.entrants) {
      const position = runnerLayer.querySelector(`[data-race-position="${entrantState.id}"]`);
      const runner = resolution.entrants.find((entrant) => entrant.id === entrantState.id);
      const crossing = resolution.finishCrossings.find((item) => item.id === entrantState.id);
      let x = entrantState.x;
      let y = entrantState.y;
      let coast = 0;
      let hasCrossed = false;
      if (crossing) {
        const crossingFraction = crossing.crossingTimeSeconds / resolution.lastFinishTimeSeconds;
        const crossingWallMs = wallClockAtRaceFraction(crossingFraction, timing) * 1000;
        hasCrossed = state.elapsedMs >= crossingWallMs;
        coast = clamp((state.elapsedMs - crossingWallMs) / 1000, 0, 1);
        if (state.elapsedMs >= crossingWallMs) {
          const eased = coast * (2 - coast);
          const distance = crossing.speed * 0.45 * eased;
          x = crossing.x + Math.cos(crossing.heading) * distance;
          y = crossing.y + Math.sin(crossing.heading) * distance;
        }
      }
      if (position) {
        position.style.left = coordinate(x, -52, 104);
        position.style.top = coordinate(y, -32, 64);
        const label = position.querySelector('.race-runner-label');
        if (label) {
          const stack = Number(label.dataset.labelStack) || 0;
          const below = y <= 0 ? stack % 2 === 0 : stack % 2 === 1;
          label.dataset.side = below ? 'below' : 'above';
          const stage = container.querySelector('.race-track-stage');
          if (stage?.clientWidth) {
            const leftPx = Number.parseFloat(position.style.left) / 100 * stage.clientWidth;
            const halfLabel = label.offsetWidth / 2;
            const preferred = LABEL_SHIFTS[stack] ?? 0;
            const minShift = halfLabel - leftPx;
            const maxShift = stage.clientWidth - halfLabel - leftPx;
            label.style.setProperty('--race-label-x', `${clamp(preferred, minShift, maxShift)}px`);
          }
        }
        const orientation = position.querySelector('[data-race-orientation]');
        const heading = coast && crossing ? crossing.heading : entrantState.heading;
        const steeringTilt = clamp(raceHeadingError(entrantState.progress, heading) * 180 / Math.PI, -35, 35);
        if (orientation) orientation.style.transform = `perspective(180px) rotateY(${raceDuckYaw(entrantState.progress)}deg) rotateZ(${steeringTilt}deg)`;
        position.classList.toggle('is-crossed', hasCrossed && coast > 0);
        position.setAttribute('aria-label', `${labels[entrantState.id]}${hasCrossed ? `, crossed in place ${finishPlaces.get(entrantState.id)}` : ''}`);
      }
      const contactGlow = contactGlowEvents.reduce((strongest, event) => {
        if (!event.participants?.includes(entrantState.id)) return strongest;
        const startedAt = wallClockAtRaceFraction(event.tick / Math.max(1, resolution.ticks), timing);
        const age = state.elapsedMs / 1000 - startedAt;
        const envelope = participantGlowEnvelope(age);
        return Math.max(strongest, envelope);
      }, 0);
      const highlightGlow = highlightParticipantEvents.some((event) => event.participants.includes(entrantState.id))
        ? participantGlowEnvelope(state.elapsedMs / 1000 - highlightGlowStartSeconds)
        : 0;
      const glow = Math.max(contactGlow, highlightGlow);
      position?.style.setProperty('--participant-glow-opacity', glow.toFixed(3));
      position?.classList.toggle('participant-glow', glow > 0);
      if (runner && entrantState.crossedAtFinish) position?.classList.add('is-crossed');
    }

    const reveal = state.revealProgress;
    const dim = Math.max(state.highlightProgress ?? 0, reveal);
    const sceneDim = container.querySelector('[data-race-scene-dim]');
    if (sceneDim) sceneDim.style.opacity = String(0.57 * dim);
    const camera = container.querySelector('[data-race-camera]');
    if (camera) {
      const fraction = resolution.finishTimeSeconds > 0 ? state.cursorTick / (resolution.finishTimeSeconds / resolution.dt) : 0;
      const zoom = state.reduced ? 1 : closeZoom(fraction);
      const focus = zoom > 1 ? clamp((zoom - 1) / 0.16, 0, 1) : 0;
      const playerState = timeline.entrants.find((entrant) => entrant.id === 'P');
      const stage = container.querySelector('.race-track-stage');
      const width = stage?.clientWidth ?? 0;
      const height = stage?.clientHeight ?? 0;
      const px = (playerState?.x ?? 0) + 52;
      const py = (playerState?.y ?? 0) + 32;
      const playerX = px / 104 * width;
      const playerY = py / 64 * height;
      const tx = width / 2 * (1 - zoom) + (width / 2 - playerX * zoom - width / 2 * (1 - zoom)) * focus;
      const ty = height / 2 * (1 - zoom) + (height / 2 - playerY * zoom - height / 2 * (1 - zoom)) * focus;
      camera.style.transform = `matrix(${zoom}, 0, 0, ${zoom}, ${tx}, ${ty})`;
      camera.style.setProperty('--camera-zoom', String(zoom));
      const finishOverlay = container.querySelector('[data-race-finish-overlay]');
      if (finishOverlay) finishOverlay.style.transform = camera.style.transform;
    }
    const podium = container.querySelector('[data-race-podium]');
    if (podium) {
      if (state.podiumVisible && !podiumMaterialized) {
        podium.innerHTML = podiumMarkup;
        podiumMaterialized = true;
        motion?.syncPodium();
      } else if (!state.podiumVisible && podiumMaterialized) {
        podium.innerHTML = '';
        podiumMaterialized = false;
        motion?.syncPodium();
      }
      podium.hidden = !state.podiumVisible;
      podium.style.setProperty('--podium-progress', String(reveal));
    }
    podiumScope?.classList.toggle('is-visible', Boolean(state.podiumVisible));
    const time = container.querySelector('[data-race-time]');
    if (time) time.textContent = `${state.seconds.toFixed(2)}s`;
    const revealedEventIds = new Set(state.revealedEventIds ?? []);
    for (const button of container.querySelectorAll('[data-race-seek]')) {
      const event = resolution.eventRecords.find((candidate) => candidate.id === button.dataset.raceSeek);
      if (!event) continue;
      const reached = revealedEventIds.has(event.id);
      const text = reached ? describeRaceEvent(event, labels) : 'Upcoming race moment';
      const eventCourseSeconds = raceCourseTimeAtFraction(event.tick / Math.max(1, resolution.ticks), timing);
      button.textContent = `${text} · ${eventCourseSeconds.toFixed(2)}s`;
      button.setAttribute('aria-label', reached ? `${text} at ${eventCourseSeconds.toFixed(2)} seconds` : `Upcoming race moment at ${eventCourseSeconds.toFixed(2)} seconds`);
      if (state.visible && timelineDetails?.open && reached && !timelineDisplayedEventIds.has(event.id)) {
        timelineDisplayedEventIds.add(event.id);
        onCueDisplayed({
          cueId: `race-timeline-event:${event.id}`,
          eventId: event.id,
          text,
          timeSeconds: eventCourseSeconds,
          timeline: true,
        });
      }
    }
    const commentary = container.querySelector('[data-race-commentary]');
    if (commentary && state.commentary) commentary.textContent = state.commentary;
    const pause = container.querySelector('[data-race-pause]');
    if (pause) {
      pause.textContent = state.settled
        ? (state.podiumMotionPaused ? 'Resume' : 'Pause')
        : (state.playing ? 'Pause' : 'Resume');
      pause.setAttribute('aria-label', state.settled
        ? (state.podiumMotionPaused ? 'Resume podium motion' : 'Pause podium motion')
        : (state.playing ? 'Pause race playback' : 'Resume race playback'));
      pause.setAttribute('aria-pressed', String(state.settled ? state.podiumMotionPaused : state.userPaused));
      pause.disabled = state.reduced;
    }
    const result = container.querySelector('[data-race-result-summary]');
    if (result) {
      result.hidden = !state.settled;
      if (!state.settled) result.innerHTML = '';
    }
    if (result && state.settled) {
      const winner = resolution.finish[0];
      const player = resolution.finish.find((entrant) => entrant.id === 'P');
      result.hidden = false;
      const playerAward = player.place <= 3 ? `<p class="race-player-result">${placeLabel(player.place)} place! +${player.payout} Gems</p>` : `<p>Your duck finished ${placeLabel(player.place)} place.</p>`;
      result.innerHTML = `<h3>${esc(labels[winner.id])} crossed first</h3>${playerAward}<p>Final results by finish order:</p><ol>${resolution.finish.map((entrant) => `<li>${esc(labels[entrant.id])} — place ${entrant.place}, ${entrant.payout} Gems${entrant.id === 'P' ? ' (you!)' : ''}</li>`).join('')}</ol>`;
    }
    motion?.setPresentationPaused(!state.playing && (state.userPaused || !state.visible));
    motion?.setPodiumVisible(state.podiumVisible);
    motion?.setPodiumMotionPaused(state.podiumMotionPaused);
    const banner = container.querySelector('[data-player-podium-banner]');
    if (banner) {
      banner.textContent = state.podiumVisible ? playerPodiumText : '';
      banner.hidden = !state.podiumVisible || !playerPodiumText;
    }
    if (state.settled !== completedMotionSet) {
      motion?.setRaceComplete(state.settled);
      completedMotionSet = state.settled;
    }
    motion?.updateRunnerRanks({ ...state, entrants: timeline.entrants });
    if (state.visible && state.inHighlight && !highlightLogged) {
      highlightLogged = true;
      onCueDisplayed({ cueId: 'slow-motion-highlight', text: 'The race entered its recorded slow-motion highlight.' });
    }
    if (state.visible && state.podiumVisible && !podiumLogged) {
      podiumLogged = true;
      const settledDisplay = state.reduced || state.elapsedMs >= (timing.simulationWallSeconds + timing.revealSeconds) * 1000;
      onCueDisplayed(settledDisplay
        ? { cueId: 'podium-settled-result', text: 'The race podium was shown in its settled position.' }
        : { cueId: 'podium-reveal', text: 'The finish podium began to descend.' });
    }
    if (state.visible && state.settled && !resultLogged) {
      resultLogged = true;
      const order = resolution.finish.map((entrant) => `${entrant.place}: ${labels[entrant.id]}`).join(', ');
      onCueDisplayed({ cueId: 'final-race-results', text: `Final race results shown in crossing order: ${order}.` });
    }
  };

  const playback = createRacePlaybackController(viewRoot, resolution, {
    active,
    initialSnapshot,
    entrantLabels: labels,
    onState: draw,
    onAction: (action, detail) => {
      if (action === 'replay') motion?.resetContactMotions();
      onAction(action, detail);
    },
    onCueDisplayed: (cue) => {
      if (cue.seek) motion?.resetContactMotions();
      motion?.playContact(resolution.eventRecords.find((event) => event.id === cue.eventId), { seekPose: cue.seek });
      onCueDisplayed(cue);
    },
  });
  const onTimelineToggle = () => playback.refresh();
  timelineDetails?.addEventListener('toggle', onTimelineToggle);
  const proceedButton = container.querySelector('[data-race-proceed]');
  const onProceedClick = () => onProceed?.();
  proceedButton?.addEventListener('click', onProceedClick);

  return {
    snapshot: () => ({ ...playback.snapshot(), timelineDisplayedEventIds: [...timelineDisplayedEventIds] }),
    setActive(value) { playback.setActive(value); motion?.setActive(value); },
    destroy() {
      playback.destroy();
      timelineDetails?.removeEventListener('toggle', onTimelineToggle);
      proceedButton?.removeEventListener('click', onProceedClick);
      motion?.destroy();
      motion = null;
    },
  };
}

function closeZoom(fraction) {
  const smooth = (value) => value * value * (3 - 2 * value);
  if (fraction < 0.34 || fraction > 0.76) return 1;
  if (fraction < 0.42) return 1 + smooth((fraction - 0.34) / 0.08) * 0.16;
  if (fraction <= 0.66) return 1.16;
  return 1.16 - smooth((fraction - 0.66) / 0.1) * 0.16;
}

export function renderRaceView(container, engine, raceNumber, callbacks = {}, options = {}) {
  const { onStartRace, onProceed, onChoiceShown = () => {}, onTrialOfferShown = () => {}, onAction = () => {}, onCueDisplayed = () => {}, onBuyTrial = () => {} } = callbacks;
  const isTutorial = raceNumber === 1;
  const fieldBaseSpeed = isTutorial ? GAME_CONSTANTS.TUTORIAL_FIELD_SPEED : GAME_CONSTANTS.FINALE_FIELD_SPEED;
  const existingAttempt = engine.getRaceAttempt?.(raceNumber) ?? engine.state.raceAttempts?.[raceNumber] ?? null;
  const existingResolution = engine.getRaceResolution?.(raceNumber) ?? null;
  const ownedDucks = engine.state.owned.map((id) => BANNER_1_ROSTER.find((duck) => duck.id === id)).filter(Boolean);
  const restCandidates = ownedDucks.map((duck, index) => {
    const evidence = deriveRaceRest(engine.log?.entries ?? [], duck.id);
    return { ...duck, originalIndex: index, restEvidence: evidence, restFactor: evidence.restFactor, effectiveBaseInput: duck.speed * evidence.restFactor };
  }).sort((a, b) => b.effectiveBaseInput - a.effectiveBaseInput || b.speed - a.speed || a.originalIndex - b.originalIndex || a.id.localeCompare(b.id));
  const defaultDuck = restCandidates[0];

  if (existingAttempt?.status === 'finished' && existingResolution) {
    const timelineState = restoreRaceTimelineState(existingResolution, {
      raceNumber,
      raceId: existingAttempt.raceId,
      initialSnapshot: options.initialSnapshot,
      logEntries: engine.log?.entries ?? [],
    });
    return mountPlayback(container, existingAttempt, existingResolution, raceNumber, callbacks, {
      ...options,
      initialSnapshot: { ...options.initialSnapshot, ...timelineState },
    });
  }

  if (existingAttempt?.status === 'unresolved') {
    container.innerHTML = `<section class="race-view race-unresolved"><p class="race-eyebrow">${isTutorial ? 'Tutorial event' : 'Championship finale'}</p><h2>Race attempt unresolved</h2><p>${esc(statusText(existingAttempt))}</p><p>The attempt is recorded once. The story may continue, but this is not a finished race and does not count toward future rest.</p><button type="button" data-race-proceed class="race-control-button">Continue</button></section>`;
    const proceed = container.querySelector('[data-race-proceed]');
    const handler = () => onProceed?.();
    proceed?.addEventListener('click', handler);
    return { snapshot: () => null, setActive() {}, destroy() { proceed?.removeEventListener('click', handler); } };
  }

  if (existingAttempt?.legacySummaryOnly) {
    const summary = engine.state.raceResults?.[raceNumber] ?? existingAttempt;
    container.innerHTML = `<section class="race-view race-legacy-summary"><p class="race-eyebrow">Saved race record</p><h2>Race result summary</h2><p>Your saved record shows place ${summary.place} and ${summary.payoutGems} Gems. This older save contains no race timeline, so its past presentation cannot be replayed.</p><button type="button" data-race-proceed class="race-control-button">Continue</button></section>`;
    const proceed = container.querySelector('[data-race-proceed]');
    const handler = () => onProceed?.();
    proceed?.addEventListener('click', handler);
    return { snapshot: () => null, setActive() {}, destroy() { proceed?.removeEventListener('click', handler); } };
  }

  container.innerHTML = `
    <section class="race-view race-entry">
      <header class="race-view-header"><h2>${isTutorial ? 'Opening Pond Trial' : 'Championship Race'}</h2><p class="race-eyebrow">${isTutorial ? 'Tutorial event' : 'Championship finale'}</p></header>
      <div class="race-field-summary"><strong>Field pace:</strong> ${fieldBaseSpeed.toFixed(1)} rating. Finish places and awards are determined by actual crossings.</div>
      <form class="race-entry-form" data-race-form>
        <fieldset class="race-candidate-list" ${ownedDucks.length ? '' : 'disabled'}>
          <legend>Choose an owned digital racer</legend>
          ${restCandidates.some((duck) => duck.restEvidence.historyLimited) ? '<p class="race-rest-note">Rest tracking starts after an older completed race whose duck identity was not recorded.</p>' : ''}
          ${restCandidates.map((duck) => `<label class="race-candidate-card ${duck.id === defaultDuck?.id ? 'selected' : ''}" data-candidate-id="${esc(duck.id)}">
            <input type="radio" name="duckId" value="${esc(duck.id)}" required ${duck.id === defaultDuck?.id ? 'checked' : ''}>
            <span class="race-candidate-art">${duckSvg(duck.id, `${duck.name}, ${duck.restFactor < 1 ? 'needs rest' : 'rested'}`, `qp-race-${raceNumber}-${duck.id}`)}</span>
            <span class="race-candidate-name">${esc(duck.name)}</span>
            <span class="race-candidate-meta">${duck.tier} · speed rating ${duck.speed}</span>
            <span class="race-candidate-effective" data-candidate-effective>Race rating ${formatRaceRating(duck.effectiveBaseInput)}</span>
            <span class="race-candidate-reason">${duck.restFactor === 1 ? (duck.restEvidence.historyLimited ? 'Rested under tracked history.' : (duck.restEvidence.lastRaceSeq === null ? 'Rested. No prior finished race.' : 'Rested. Two other races have finished since its last race.')) : `Needs rest · ${Math.round((1 - duck.restFactor) * 100)}% lower race rating.`}</span>
          </label>`).join('')}
          <p class="race-rest-note">A duck's race rating is 50% lower immediately after racing, 25% lower after one other race finishes, and fully rested after two other races finish.</p>
          ${ownedDucks.length ? '' : '<p>No owned digital ducks are available to enter.</p>'}
        </fieldset>
        <fieldset class="race-stance-options"><legend>Choose a stance</legend>
          <label><input type="radio" name="stance" value="safe" checked> Steady pace <span>More consistent pacing</span></label>
          <label><input type="radio" name="stance" value="sprint"> Variable pace <span>Wider swings in pacing</span></label>
        </fieldset>
        <div class="race-trial-offer" data-race-trial>
          ${engine.state.raceTrialAvailable
            ? '<label class="race-trial-ready"><input type="checkbox" name="useTrial" value="true"> Use purchased one-race speed upgrade: +5% base speed on this race.</label>'
            : `<button type="button" class="race-control-button" data-buy-race-trial ${engine.state.down < GAME_CONSTANTS.RACE_TRIAL_COST ? 'disabled' : ''}>Exchange 3 Down for a +5% one-race speed upgrade</button><p>Available Down: ${engine.state.down}</p>`}
        </div>
        <button type="submit" class="race-control-button race-start-button" ${ownedDucks.length ? '' : 'disabled'}>Start race</button>
      </form>
    </section>`;

  const form = container.querySelector('[data-race-form]');
  let entryActive = options.active !== false;
  const selectedDuck = () => form.querySelector('input[name="duckId"]:checked')?.value ?? null;
  const trialState = () => ({ available: Boolean(engine.state.raceTrialAvailable), selected: Boolean(form.querySelector('input[name="useTrial"]:checked')), multiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER });
  const choicePayload = () => {
    const visibleIds = new Set([...container.querySelectorAll('.race-candidate-card')]
      .filter(isFullyVisibleInViewport).map((card) => card.dataset.candidateId));
    const candidates = restCandidates.filter((duck) => visibleIds.has(duck.id)).map((duck) => ({
      duckId: duck.id,
      authoredRating: duck.speed,
      restFactor: duck.restFactor,
      historyLimited: duck.restEvidence.historyLimited,
      effectiveBaseInput: duck.effectiveBaseInput,
      effectiveWithTrialInput: duck.effectiveBaseInput * (trialState().selected ? GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER : 1),
      rendered: true,
    }));
    const selected = selectedDuck();
    const payload = { candidates, fieldBaseSpeed, trialState: trialState(), duckId: visibleIds.has(selected) ? selected : null };
    return { raceNumber, ...payload, exposureId: `race-choice-${raceNumber}-${stableExposureSignature(payload)}` };
  };
  const recordEntryShown = () => {
    const payload = choicePayload();
    container.querySelectorAll('.race-candidate-card').forEach((card) => {
      const candidate = payload.candidates.find((item) => item.duckId === card.dataset.candidateId);
      const value = card.querySelector('[data-candidate-effective]');
      if (candidate && value) value.textContent = payload.trialState.selected
        ? `Race rating ${formatRaceRating(candidate.effectiveBaseInput)}; with upgrade ${formatRaceRating(candidate.effectiveWithTrialInput)}`
        : `Race rating ${formatRaceRating(candidate.effectiveBaseInput)}`;
    });
    if (entryActive && payload.candidates.length) onChoiceShown(payload);
    const trialPanel = container.querySelector('[data-race-trial]');
    if (entryActive && isFullyVisibleInViewport(trialPanel)) {
      onTrialOfferShown({ raceNumber, costDown: GAME_CONSTANTS.RACE_TRIAL_COST, exposureId: `race-trial-${raceNumber}` });
    }
  };
  if (entryActive) recordEntryShown();
  const onViewportChange = () => { if (entryActive && !childHandle) recordEntryShown(); };
  window.addEventListener('scroll', onViewportChange, { capture: true, passive: true });
  window.addEventListener('resize', onViewportChange, { passive: true });
  document.addEventListener('visibilitychange', onViewportChange);
  const trialButton = container.querySelector('[data-buy-race-trial]');
  const onTrialClick = () => {
    if (!onBuyTrial()) return;
    const trialPanel = container.querySelector('[data-race-trial]');
    if (trialPanel) trialPanel.innerHTML = '<label class="race-trial-ready"><input type="checkbox" name="useTrial" value="true"> Use purchased one-race speed upgrade: +5% base speed on this race.</label>';
    bindTrialInput();
    recordEntryShown();
  };
  const onTrialChange = () => recordEntryShown();
  const bindTrialInput = () => container.querySelector('input[name="useTrial"]')?.addEventListener('change', onTrialChange);
  const onCandidateChange = (event) => {
    if (!event.target?.matches?.('input[name="duckId"]')) return;
    container.querySelectorAll('.race-candidate-card').forEach((card) => card.classList.toggle('selected', card.querySelector('input')?.checked));
    recordEntryShown();
  };
  form?.addEventListener('change', onCandidateChange);
  bindTrialInput();
  trialButton?.addEventListener('click', onTrialClick);
  let childHandle = null;
  const onSubmit = (event) => {
    event.preventDefault();
    const duckId = selectedDuck();
    const stance = form.querySelector('input[name="stance"]:checked')?.value ?? 'safe';
    const useTrial = Boolean(form.querySelector('input[name="useTrial"]:checked'));
    const result = onStartRace?.({ duckId, stance, useTrial, raceNumber });
    if (result?.attempt?.status === 'unresolved') {
      childHandle = renderRaceView(container, engine, raceNumber, callbacks, options);
      return;
    }
    if (result?.attempt?.status === 'finished' && result.resolution) {
      const timelineState = restoreRaceTimelineState(result.resolution, {
        raceNumber,
        raceId: result.attempt.raceId,
        initialSnapshot: options.initialSnapshot,
        logEntries: engine.log?.entries ?? [],
      });
      childHandle = mountPlayback(container, result.attempt, result.resolution, raceNumber, callbacks, {
        ...options,
        initialSnapshot: { ...options.initialSnapshot, ...timelineState },
      });
    }
  };
  form?.addEventListener('submit', onSubmit);
  return {
    snapshot: () => childHandle?.snapshot?.() ?? null,
    setActive(value) {
      entryActive = Boolean(value);
      childHandle?.setActive?.(value);
      if (!childHandle && entryActive) recordEntryShown();
    },
    destroy() {
      childHandle?.destroy?.();
      form?.removeEventListener('submit', onSubmit);
      form?.removeEventListener('change', onCandidateChange);
      container.querySelector('input[name="useTrial"]')?.removeEventListener('change', onTrialChange);
      trialButton?.removeEventListener('click', onTrialClick);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
      document.removeEventListener('visibilitychange', onViewportChange);
    },
  };
}
