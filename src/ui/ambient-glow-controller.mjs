/** Own the non-layout phone halo and stop it whenever motion is not appropriate. */
export function createAmbientGlowController(container, {
  active = true,
  animateEnabled = true,
  matchMedia = globalThis.matchMedia?.bind(globalThis),
  documentRef = globalThis.document,
  IntersectionObserverRef = globalThis.IntersectionObserver,
} = {}) {
  const glow = container.querySelector('.apartment-phone-glow');
  const media = matchMedia?.('(prefers-reduced-motion: reduce)');
  let contextActive = Boolean(active);
  let enabled = Boolean(animateEnabled);
  let visible = false;
  let destroyed = false;
  let animation = null;
  let observer = null;

  const blocked = () => destroyed || !glow || !contextActive || !enabled
    || Boolean(media?.matches) || documentRef?.visibilityState === 'hidden'
    || !visible
    || typeof glow.animate !== 'function';

  const stop = () => {
    animation?.cancel();
    animation = null;
    if (glow) glow.style.opacity = '';
  };

  const reconcile = () => {
    if (destroyed || !glow) return;
    if (blocked()) {
      stop();
      return;
    }
    if (animation) return;
    animation = glow.animate([
      { opacity: .16 },
      { opacity: .4, offset: .5 },
      { opacity: .16 },
    ], { duration: 3000, iterations: Infinity, easing: 'ease-in-out' });
  };

  const onVisibilityChange = () => reconcile();
  const onMotionChange = () => reconcile();
  documentRef?.addEventListener('visibilitychange', onVisibilityChange);
  if (media?.addEventListener) media.addEventListener('change', onMotionChange);
  else media?.addListener?.(onMotionChange);

  if (typeof IntersectionObserverRef === 'function' && glow) {
    observer = new IntersectionObserverRef((entries) => {
      for (const entry of entries) {
        if (entry.target === glow) visible = entry.isIntersecting && (entry.intersectionRatio === undefined || entry.intersectionRatio > 0);
      }
      reconcile();
    }, { threshold: 0.01 });
    observer.observe(glow);
  } else {
    // Without a visibility observer, keep a static halo rather than animate offscreen content.
    visible = false;
  }

  reconcile();
  return {
    setActive(value) { contextActive = Boolean(value); reconcile(); },
    setEnabled(value) { enabled = Boolean(value); reconcile(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      documentRef?.removeEventListener('visibilitychange', onVisibilityChange);
      if (media?.removeEventListener) media.removeEventListener('change', onMotionChange);
      else media?.removeListener?.(onMotionChange);
      observer?.disconnect();
    },
  };
}
