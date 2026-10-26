const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Runs the selected fictional-phone transition without changing game state. */
export function createStageTransition(container) {
  let active = null;

  function cancel() {
    if (!active) return;
    active.cancelled = true;
    for (const animation of active.animations) animation.cancel();
    active.element.remove();
    active = null;
  }

  async function run(direction) {
    cancel();
    const transition = { cancelled: false, animations: [], element: null };
    active = transition;

    const overlay = document.createElement('div');
    overlay.className = `stage-transition stage-transition-${direction}`;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="stage-transition-phone"><span class="stage-transition-brand">QUACKPOT</span></div>';
    container.append(overlay);
    transition.element = overlay;

    const stageBounds = container.getBoundingClientRect();
    const visibleLeft = Math.max(0, stageBounds.left);
    const visibleTop = Math.max(0, stageBounds.top);
    const visibleRight = Math.min(window.innerWidth, stageBounds.right);
    const visibleBottom = Math.min(window.innerHeight, stageBounds.bottom);
    const visibleWidth = Math.max(1, visibleRight - visibleLeft);
    const visibleHeight = Math.max(1, visibleBottom - visibleTop);
    Object.assign(overlay.style, {
      left: `${visibleLeft - stageBounds.left}px`,
      top: `${visibleTop - stageBounds.top}px`,
      right: 'auto',
      bottom: 'auto',
      width: `${visibleWidth}px`,
      height: `${visibleHeight}px`,
    });

    if (window.matchMedia?.(MOTION_QUERY).matches || typeof overlay.animate !== 'function') {
      overlay.classList.add('stage-transition-static');
      await new Promise((resolve) => requestAnimationFrame(resolve));
    } else {
      const phone = overlay.firstElementChild;
      const brand = phone.firstElementChild;
      const enter = direction === 'enter';
      if (!enter) brand.style.transform = 'rotate(-90deg)';
      const stageWidth = visibleWidth;
      const stageHeight = visibleHeight;
      const portraitWidth = Math.min(360, stageWidth * 0.62, stageHeight * 0.38);
      const portraitHeight = portraitWidth * (16 / 9);
      const landscapeWidth = stageHeight;
      const landscapeHeight = stageWidth;
      phone.style.width = `${portraitWidth}px`;
      phone.style.height = `${portraitHeight}px`;

      const animate = (element, frames, duration) => {
        const animation = element.animate(frames, {
          duration,
          easing: 'cubic-bezier(.16, 1, .3, 1)',
          fill: 'forwards',
        });
        transition.animations.push(animation);
        return animation.finished.then(() => true, () => false);
      };
      const playPhase = async (...animations) => {
        if (transition.cancelled) return false;
        const completed = await Promise.all(animations);
        return !transition.cancelled && completed.every(Boolean);
      };

      const phases = enter
        ? [
            () => playPhase(animate(phone, [
              { transform: 'rotate(0deg) scale(.72)', opacity: 0.45, borderRadius: '2rem' },
              { transform: 'rotate(0deg) scale(1)', opacity: 1, borderRadius: '2rem' },
            ], 240)),
            () => playPhase(
              animate(phone, [
                { transform: 'rotate(0deg)', borderRadius: '2rem' },
                { transform: 'rotate(90deg)', borderRadius: '1.5rem' },
              ], 420),
              animate(brand, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-90deg)' }], 420),
            ),
            () => playPhase(animate(phone, [
              { width: `${portraitWidth}px`, height: `${portraitHeight}px`, borderRadius: '1.5rem' },
              { width: `${landscapeWidth}px`, height: `${landscapeHeight}px`, borderRadius: '.75rem' },
            ], 480)),
          ]
        : [
            () => playPhase(animate(phone, [
              { width: `${landscapeWidth}px`, height: `${landscapeHeight}px`, transform: 'rotate(90deg)', borderRadius: '.75rem', opacity: 1 },
              { width: `${portraitWidth}px`, height: `${portraitHeight}px`, transform: 'rotate(90deg)', borderRadius: '1.5rem', opacity: 0.96 },
            ], 420)),
            () => playPhase(
              animate(phone, [
                { transform: 'rotate(90deg)', borderRadius: '1.5rem' },
                { transform: 'rotate(0deg)', borderRadius: '2rem' },
              ], 420),
              animate(brand, [{ transform: 'rotate(-90deg)' }, { transform: 'rotate(0deg)' }], 420),
            ),
            () => playPhase(animate(phone, [
              { transform: 'rotate(0deg) scale(1)', opacity: 0.96, borderRadius: '2rem' },
              { transform: 'rotate(0deg) scale(.72)', opacity: 0, borderRadius: '2rem' },
            ], 240)),
          ];
      for (const phase of phases) {
        if (!(await phase())) return false;
      }
    }

    if (transition.cancelled) return false;
    overlay.remove();
    if (active === transition) active = null;
    return true;
  }

  return { run, cancel };
}
