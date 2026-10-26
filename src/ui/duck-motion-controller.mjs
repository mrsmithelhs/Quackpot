const MOTION_DOMAIN = 'quackpot:gacha-card-motion:v1';
const PAPER_FACTOR = 4;

export function selectGachaDuckMotion(commitSeq, identity) {
  const key = `${MOTION_DOMAIN}:${commitSeq}:${identity}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 2 === 0 ? 'paddle' : 'graceful-bob';
}

function paperTransform(x, y, degrees = 0) {
  return `translate(${x * PAPER_FACTOR}px, ${y * PAPER_FACTOR}px) rotate(${degrees * PAPER_FACTOR}deg)`;
}

function animationTracks(record) {
  const { motion, shell, svg, prefix } = record;
  const byId = (id) => svg.querySelector(`#${prefix}-${id}`);
  const root = shell;
  const head = byId('head-group');
  const wing = byId('wing-group');
  const identity = 'translate(0px, 0px) rotate(0deg)';
  const targets = [];
  const add = (element, frames, duration, delay = 0) => {
    if (element?.animate) targets.push({ element, frames, duration, delay });
  };
  const paper = (id, peak, partial, duration, lagMs) => {
    add(byId(id), [
      { transform: identity, offset: 0 },
      { transform: identity, offset: lagMs / duration },
      { transform: peak, offset: .48 },
      { transform: partial, offset: .74 },
      { transform: identity, offset: 1 },
    ], duration);
  };

  if (motion === 'paddle') {
    add(root, [
      { transform: 'translateY(1%) rotate(-1.5deg)' },
      { transform: 'translateY(-6%) rotate(2deg)', offset: .25 },
      { transform: 'translateY(1%) rotate(-2deg)', offset: .5 },
      { transform: 'translateY(7%) rotate(1.5deg)', offset: .75 },
      { transform: 'translateY(1%) rotate(-1.5deg)' },
    ], 1600);
    add(wing, [{ transform: 'rotate(-24deg)' }, { transform: 'rotate(20deg)' }, { transform: 'rotate(-24deg)' }], 800);
    add(head, [{ transform: 'rotate(6deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], 1600);
    paper('body-backing-rim', paperTransform(.35, .2), paperTransform(.15, .08), 1600, 90);
    paper('tail-backing', paperTransform(.35, .15), paperTransform(.14, .06), 1600, 130);
    paper('head-backing-rim', paperTransform(.25, .12), paperTransform(.1, .05), 1600, 160);
    paper('wing-mid', paperTransform(.4, .12, .3), paperTransform(.16, .05, .12), 800, 60);
    paper('wing-under-seam', paperTransform(.4, .12, .3), paperTransform(.16, .05, .12), 800, 60);
    paper('wing-top', paperTransform(.65, .2, -.5), paperTransform(.22, .07, -.18), 800, 110);
    paper('wing-mid-seam', paperTransform(.65, .2, -.5), paperTransform(.22, .07, -.18), 800, 110);
  } else {
    add(root, [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-5%) rotate(1.2deg)', offset: .35 },
      { transform: 'translateY(-6%) rotate(0deg)', offset: .55 },
      { transform: 'translateY(1%) rotate(-1deg)', offset: .8 },
      { transform: 'translateY(0) rotate(0deg)' },
    ], 2400);
    add(head, [{ transform: 'rotate(4deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(4deg)' }], 2400, 180);
    add(wing, [{ transform: 'rotate(3deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(3deg)' }], 2400, 320);
    paper('body-backing-rim', paperTransform(.2, .12), paperTransform(.08, .05), 2400, 180);
    paper('tail-backing', paperTransform(.2, .1), paperTransform(.08, .04), 2400, 200);
    paper('head-backing-rim', paperTransform(.15, .1), paperTransform(.06, .04), 2400, 220);
    paper('wing-mid', paperTransform(.22, .1, .18), paperTransform(.09, .04, .07), 2400, 160);
    paper('wing-under-seam', paperTransform(.22, .1, .18), paperTransform(.09, .04, .07), 2400, 160);
    paper('wing-top', paperTransform(.38, .15, -.32), paperTransform(.14, .06, -.12), 2400, 240);
    paper('wing-mid-seam', paperTransform(.38, .15, -.32), paperTransform(.14, .06, -.12), 2400, 240);
  }
  return targets;
}

function setGroupTransformOrigins(record) {
  for (const [groupName, x, y] of [['head-group', 48, 46], ['wing-group', 52, 56]]) {
    const group = record.svg.querySelector(`#${record.prefix}-${groupName}`);
    if (!group) continue;
    group.style.transformBox = 'view-box';
    group.style.transformOrigin = `${x}px ${y}px`;
  }
  for (const layerName of ['wing-mid', 'wing-under-seam', 'wing-top', 'wing-mid-seam']) {
    const layer = record.svg.querySelector(`#${record.prefix}-${layerName}`);
    if (!layer) continue;
    layer.style.transformBox = 'view-box';
    layer.style.transformOrigin = '52px 56px';
  }
}

function neutralize(record) {
  record.shell.style.transform = '';
  for (const element of record.svg.querySelectorAll('[id]')) {
    if (element.id.startsWith(`${record.prefix}-`)) element.style.transform = '';
  }
}

export function createDuckMotionController(container, {
  active = true,
  paused = false,
  onPauseChange = () => {},
  matchMedia = globalThis.matchMedia?.bind(globalThis),
  documentRef = globalThis.document,
  IntersectionObserverRef = globalThis.IntersectionObserver,
} = {}) {
  const cards = [...container.querySelectorAll('[data-duck-motion]')];
  const pauseButton = container.querySelector('[data-duck-motion-toggle]');
  const status = container.querySelector('[data-duck-motion-status]');
  const media = matchMedia?.('(prefers-reduced-motion: reduce)');
  const canObserveVisibility = typeof IntersectionObserverRef === 'function';
  const records = cards.map((shell) => {
    const prefix = shell.dataset.duckPrefix;
    const svg = shell.querySelector('svg');
    const record = { shell, svg, prefix, motion: shell.dataset.duckMotion, animations: [], visible: true };
    setGroupTransformOrigins(record);
    return record;
  });
  let userPaused = Boolean(paused);
  let contextActive = Boolean(active);
  let destroyed = false;
  let observer = null;

  const isReduced = () => Boolean(media?.matches);
  const canRun = (record) => !destroyed && contextActive && !userPaused && !isReduced()
    && documentRef?.visibilityState !== 'hidden' && record.visible && record.shell.isConnected !== false;

  const syncButton = (announce = false) => {
    if (!pauseButton) return;
    const visibilityUnavailable = !canObserveVisibility && records.length > 0;
    const disabled = isReduced() || records.length === 0 || visibilityUnavailable;
    pauseButton.disabled = disabled;
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    pauseButton.textContent = isReduced()
      ? 'Motion off (reduced motion)'
      : visibilityUnavailable ? 'Motion off (visibility unavailable)'
      : userPaused ? 'Resume duck motion' : 'Pause duck motion';
    if (announce && status) status.textContent = userPaused ? 'Duck motion paused.' : 'Duck motion resumed where visible.';
  };

  const cancel = (record, reset = true) => {
    for (const animation of record.animations) animation.cancel();
    record.animations = [];
    if (reset) neutralize(record);
  };

  const suspend = (record) => {
    for (const animation of record.animations) animation.pause();
  };

  const resume = (record) => {
    if (!record.animations.length) {
      record.animations = animationTracks(record).map(({ element, frames, duration, delay }) => {
        const animation = element.animate(frames, {
          duration,
          delay,
          iterations: Infinity,
          easing: 'ease-in-out',
          fill: 'both',
        });
        return animation;
      });
    } else {
      for (const animation of record.animations) animation.play();
    }
  };

  const reconcile = () => {
    if (destroyed) return;
    for (const record of records) {
      if (isReduced()) cancel(record);
      else if (canRun(record)) resume(record);
      else if (userPaused && contextActive && documentRef?.visibilityState !== 'hidden' && record.visible && record.shell.isConnected !== false) suspend(record);
      else cancel(record);
    }
    syncButton();
  };

  const onVisibilityChange = () => reconcile();
  const onMotionChange = () => reconcile();
  const onToggle = () => {
    userPaused = !userPaused;
    onPauseChange(userPaused);
    syncButton(true);
    reconcile();
  };
  pauseButton?.addEventListener('click', onToggle);
  documentRef?.addEventListener('visibilitychange', onVisibilityChange);
  if (media?.addEventListener) media.addEventListener('change', onMotionChange);
  else media?.addListener?.(onMotionChange);

  if (typeof IntersectionObserverRef === 'function') {
    for (const record of records) record.visible = false;
    observer = new IntersectionObserverRef((entries) => {
      for (const entry of entries) {
        const record = records.find((item) => item.shell === entry.target);
        if (record) record.visible = entry.isIntersecting && (entry.intersectionRatio === undefined || entry.intersectionRatio > 0);
      }
      reconcile();
    }, { threshold: 0.01 });
    for (const record of records) observer.observe(record.shell);
  } else {
    for (const record of records) record.visible = false;
  }

  reconcile();
  return {
    setActive(value) {
      contextActive = Boolean(value);
      reconcile();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      pauseButton?.removeEventListener('click', onToggle);
      documentRef?.removeEventListener('visibilitychange', onVisibilityChange);
      if (media?.removeEventListener) media.removeEventListener('change', onMotionChange);
      else media?.removeListener?.(onMotionChange);
      observer?.disconnect();
      for (const record of records) cancel(record);
      if (status) status.textContent = '';
    },
  };
}
