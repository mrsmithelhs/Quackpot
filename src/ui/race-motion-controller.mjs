import { createDuckMotionController } from './duck-motion-controller.mjs';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function isReducedMotion(matchMedia) {
  return Boolean(matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function shellAnimations(scope) {
  return [...(scope?.querySelectorAll?.('*') ?? [])].flatMap((element) => element.getAnimations?.() ?? []);
}

export function createRaceMotionController(container, {
  active = true,
  podiumMotionPaused = false,
  matchMedia = globalThis.matchMedia?.bind(globalThis),
  documentRef = globalThis.document,
  IntersectionObserverRef = globalThis.IntersectionObserver,
  motionControllerFactory = createDuckMotionController,
} = {}) {
  let reduced = isReducedMotion(matchMedia);
  let racePaused = false;
  let raceWasActive = Boolean(active);
  let raceComplete = false;
  let podiumVisible = false;
  let destroyed = false;
  let lastRankSample = -Infinity;
  let previousRankCursor = -Infinity;
  const roleStreaks = new Map();
  const runnerControllers = new Map();
  const contactMotions = new Map();
  let podiumController = null;

  const runnerScopes = () => [...container.querySelectorAll('[data-race-runner-scope]')];
  const podiumScope = container.querySelector('[data-race-podium-scope]');
  const podiumToggle = podiumScope?.querySelector('[data-duck-motion-toggle]');
  const createLoop = (scope, loopActive, paused = false) => motionControllerFactory(scope, {
    active: loopActive,
    paused,
    matchMedia,
    documentRef,
    IntersectionObserverRef,
  });

  const createRunnerController = (scope) => {
    const shell = scope.querySelector('[data-duck-motion]');
    if (!shell) return;
    const id = shell.dataset.raceId;
    const controller = createLoop(scope, raceWasActive && !racePaused && !raceComplete && !reduced);
    runnerControllers.set(id, { controller, scope, shell, role: shell.dataset.duckMotion });
  };

  const destroyLoops = () => {
    for (const record of runnerControllers.values()) record.controller.destroy();
    runnerControllers.clear();
    podiumController?.destroy();
    podiumController = null;
  };

  const cancelContactMotions = (resumeLoops = false) => {
    const ids = [...contactMotions.keys()];
    for (const { animations } of contactMotions.values()) {
      for (const animation of animations) animation.cancel();
    }
    contactMotions.clear();
    if (resumeLoops) {
      for (const id of ids) runnerControllers.get(id)?.controller.setActive(raceWasActive && !racePaused && !raceComplete && !reduced);
    }
  };

  const setRunnerRole = (id, desired) => {
    const record = runnerControllers.get(id);
    if (!record || desired === record.role) return;
    record.controller.destroy();
    record.shell.dataset.duckMotion = desired;
    runnerControllers.delete(id);
    roleStreaks.set(id, 0);
    createRunnerController(record.scope);
  };

  const createLoops = () => {
    if (destroyed || reduced) return;
    for (const scope of runnerScopes()) createRunnerController(scope);
    if (podiumScope) {
      podiumController = createLoop(podiumScope, podiumVisible && raceWasActive && !racePaused, podiumMotionPaused);
      const togglePaused = podiumToggle?.getAttribute('aria-pressed') === 'true';
      if (podiumMotionPaused !== togglePaused) podiumToggle?.click();
    }
  };

  const onMotionChange = () => {
    const nextReduced = isReducedMotion(matchMedia);
    if (nextReduced === reduced) return;
    reduced = nextReduced;
    if (reduced) cancelContactMotions();
    destroyLoops();
    if (!reduced) createLoops();
  };
  const media = matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!reduced) createLoops();
  if (media?.addEventListener) media.addEventListener('change', onMotionChange);
  else media?.addListener?.(onMotionChange);

  return {
    setActive(value) {
      raceWasActive = Boolean(value);
      for (const { animations } of contactMotions.values()) {
        for (const animation of animations) {
          if (raceWasActive && !racePaused && !raceComplete && !reduced) animation.play();
          else animation.pause();
        }
      }
      if (reduced) return;
      for (const record of runnerControllers.values()) record.controller.setActive(raceWasActive && !racePaused && !raceComplete);
      podiumController?.setActive(raceWasActive && podiumVisible && !racePaused);
    },
    setPresentationPaused(value) {
      racePaused = Boolean(value);
      if (reduced) return;
      if (racePaused) {
        for (const scope of [...runnerScopes(), podiumScope].filter(Boolean)) {
          for (const animation of shellAnimations(scope)) if (animation.playState === 'running') animation.pause();
        }
      } else {
        for (const [id, record] of runnerControllers) {
          if (!raceWasActive) continue;
          for (const animation of shellAnimations(record.scope)) if (animation.playState === 'paused') animation.play();
        }
        if (podiumVisible && podiumController && !podiumMotionPaused) {
          for (const animation of shellAnimations(podiumScope)) if (animation.playState === 'paused') animation.play();
        }
      }
    },
    setPodiumVisible(value) {
      podiumVisible = Boolean(value);
      podiumController?.setActive(podiumVisible && raceWasActive && !racePaused && !reduced);
    },
    syncPodium() { podiumController?.syncNewCards(); },
    setPodiumMotionPaused(value) {
      podiumMotionPaused = Boolean(value);
      if (!reduced && podiumToggle?.getAttribute('aria-pressed') !== String(podiumMotionPaused)) podiumToggle?.click();
    },
    setRaceComplete(value) {
      raceComplete = Boolean(value);
      for (const record of runnerControllers.values()) record.controller.setActive(raceWasActive && !racePaused && !raceComplete && !reduced);
      if (podiumVisible && !reduced) podiumController?.setActive(raceWasActive && !racePaused);
    },
    updateRunnerRanks(snapshot) {
      if (reduced || !snapshot || !Number.isFinite(snapshot.cursorTick)) return;
      const rewound = snapshot.cursorTick < previousRankCursor;
      const firstSample = lastRankSample === -Infinity;
      previousRankCursor = snapshot.cursorTick;
      if (!rewound && snapshot.cursorTick - lastRankSample < 20) return;
      lastRankSample = snapshot.cursorTick;
      const ordered = [...snapshot.entrants].sort((a, b) => b.progress - a.progress || a.id.localeCompare(b.id));
      const leaders = new Set(ordered.slice(0, 2).map((entrant) => entrant.id));
      for (const [id, record] of runnerControllers) {
        const desired = leaders.has(id) ? 'graceful-bob' : 'paddle';
        if (rewound || firstSample) {
          setRunnerRole(id, desired);
          continue;
        }
        const streak = desired === record.role ? 0 : (roleStreaks.get(id) ?? 0) + 1;
        roleStreaks.set(id, streak);
        if (desired === record.role || streak < 2) continue;
        setRunnerRole(id, desired);
      }
    },
    playContact(event, { seekPose = false } = {}) {
      if (reduced || !event || !['duck-contact', 'wall-impact'].includes(event.type)) return;
      const identity = 'translate(0px, 0px) rotate(0deg)';
      const paperTransform = (x, y, degrees = 0) => `translate(${x * 4}px, ${y * 4}px) rotate(${degrees * 4}deg)`;
      const oneShot = (element, peak, settle, onset, peakAt, settleAt, rebound = identity) => {
        if (!element?.animate) return null;
        return element.animate([
          { transform: identity, offset: 0 },
          { transform: identity, offset: onset },
          { transform: peak, offset: peakAt },
          { transform: settle, offset: settleAt },
          { transform: rebound, offset: .92 },
          { transform: identity, offset: 1 },
        ], { duration: 1100, easing: 'ease-out', fill: 'none' });
      };
      for (const id of event.participants ?? []) {
        const record = runnerControllers.get(id);
        const layer = record?.scope.querySelector('[data-race-contact-layer]');
        const svg = record?.shell.querySelector('svg');
        if (!record || !layer?.animate || !svg) continue;
        const previous = contactMotions.get(id);
        for (const animation of previous?.animations ?? []) animation.cancel();
        const token = Symbol(id);
        record.controller.setActive(false);
        const byId = (name) => svg.querySelector(`#${record.shell.dataset.duckPrefix}-${name}`);
        const head = byId('head-group');
        const wing = byId('wing-group');
        if (head) { head.style.transformBox = 'view-box'; head.style.transformOrigin = '48px 46px'; }
        if (wing) { wing.style.transformBox = 'view-box'; wing.style.transformOrigin = '52px 56px'; }
        for (const name of ['wing-mid', 'wing-under-seam', 'wing-top', 'wing-mid-seam']) {
          const paper = byId(name);
          if (paper) { paper.style.transformBox = 'view-box'; paper.style.transformOrigin = '52px 56px'; }
        }
        const animations = [
          oneShot(record.shell, 'translateY(8%) rotate(-6deg)', 'translateY(2%) rotate(-2deg)', .08, .3, .68),
          oneShot(byId('body-backing-rim'), paperTransform(.7, .25), paperTransform(.18, .08), .08, .26, .68, paperTransform(-.04, 0)),
          oneShot(byId('tail-backing'), paperTransform(.5, .2), paperTransform(.12, .04), .12, .32, .74, paperTransform(-.03, 0)),
          oneShot(head, 'rotate(-16deg)', 'rotate(-4deg)', .16, .36, .8),
          oneShot(byId('head-backing-rim'), paperTransform(.45, .25), paperTransform(.12, .06), .2, .42, .88),
          oneShot(wing, 'rotate(-24deg)', 'rotate(-6deg)', .1, .28, .72),
          oneShot(byId('wing-mid'), paperTransform(.8, .3, .5), paperTransform(.2, .08, .12), .1, .3, .68, paperTransform(-.05, 0, -.04)),
          oneShot(byId('wing-under-seam'), paperTransform(.8, .3, .5), paperTransform(.2, .08, .12), .1, .3, .68, paperTransform(-.05, 0, -.04)),
          oneShot(byId('wing-top'), paperTransform(1.1, .35, -.8), paperTransform(.24, .08, -.16), .16, .4, .78, paperTransform(.04, 0, .04)),
          oneShot(byId('wing-mid-seam'), paperTransform(1.1, .35, -.8), paperTransform(.24, .08, -.16), .16, .4, .78, paperTransform(.04, 0, .04)),
        ].filter(Boolean);
        contactMotions.set(id, { token, animations });
        if (seekPose) {
          for (const animation of animations) {
            animation.pause();
            animation.currentTime = 450;
          }
        }
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
          if (contactMotions.get(id)?.token !== token) return;
          contactMotions.delete(id);
          record.controller.setActive(raceWasActive && !racePaused && !raceComplete && !reduced);
        });
      }
    },
    resetContactMotions() { cancelContactMotions(true); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (media?.removeEventListener) media.removeEventListener('change', onMotionChange);
      else media?.removeListener?.(onMotionChange);
      cancelContactMotions();
      for (const scope of container.querySelectorAll('[data-race-contact-layer]')) {
        for (const animation of scope.getAnimations?.() ?? []) animation.cancel();
      }
      destroyLoops();
    },
  };
}
