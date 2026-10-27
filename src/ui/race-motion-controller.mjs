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
  const roleStreaks = new Map();
  const runnerControllers = new Map();
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
      if (reduced || !snapshot || !Number.isFinite(snapshot.cursorTick) || snapshot.cursorTick - lastRankSample < 20) return;
      lastRankSample = snapshot.cursorTick;
      const ordered = [...snapshot.entrants].sort((a, b) => b.progress - a.progress || a.id.localeCompare(b.id));
      const leaders = new Set(ordered.slice(0, 2).map((entrant) => entrant.id));
      for (const [id, record] of runnerControllers) {
        const desired = leaders.has(id) ? 'graceful-bob' : 'paddle';
        const streak = desired === record.role ? 0 : (roleStreaks.get(id) ?? 0) + 1;
        roleStreaks.set(id, streak);
        if (desired === record.role || streak < 2) continue;
        record.controller.destroy();
        record.shell.dataset.duckMotion = desired;
        runnerControllers.delete(id);
        roleStreaks.set(id, 0);
        createRunnerController(record.scope);
      }
    },
    playContact(event) {
      if (reduced || !event || !['duck-contact', 'wall-impact'].includes(event.type)) return;
      const participantIds = event.participants ?? [];
      const recovery = event.recovery ?? {};
      for (const id of participantIds) {
        const record = runnerControllers.get(id);
        const layer = record?.scope.querySelector('[data-race-contact-layer]');
        if (!layer?.animate) continue;
        for (const animation of layer.getAnimations()) animation.cancel();
        const detail = recovery[id];
        const measured = detail?.recenteredAt && detail?.startedAt ? detail.recenteredAt - detail.startedAt : 0.7;
        const duration = clamp(measured * 1000, 300, 1200);
        const direction = id.charCodeAt(0) % 2 ? 1 : -1;
        layer.animate([
          { transform: 'translate(0, 0) rotate(0deg)' },
          { transform: `translate(${direction * 7}px, -2px) rotate(${direction * 10}deg)`, offset: 0.2 },
          { transform: `translate(${direction * -3}px, 1px) rotate(${direction * -5}deg)`, offset: 0.52 },
          { transform: 'translate(0, 0) rotate(0deg)' },
        ], { duration, easing: 'ease-out', fill: 'none' });
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (media?.removeEventListener) media.removeEventListener('change', onMotionChange);
      else media?.removeListener?.(onMotionChange);
      for (const scope of container.querySelectorAll('[data-race-contact-layer]')) {
        for (const animation of scope.getAnimations?.() ?? []) animation.cancel();
      }
      destroyLoops();
    },
  };
}
