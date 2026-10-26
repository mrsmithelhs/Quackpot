const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Runs the selected fictional-phone transition without changing game state. */
export function createStageTransition(container) {
  let active = null;

  function cancel() {
    if (!active) return;
    active.cancelled = true;
    active.animation?.cancel();
    active.element.remove();
    active = null;
  }

  async function run(direction) {
    cancel();
    const transition = { cancelled: false, animation: null, element: null };
    active = transition;

    const overlay = document.createElement('div');
    overlay.className = `stage-transition stage-transition-${direction}`;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="stage-transition-phone"><span class="stage-transition-brand">QUACKPOT</span></div>';
    container.append(overlay);
    transition.element = overlay;

    if (window.matchMedia?.(MOTION_QUERY).matches || typeof overlay.animate !== 'function') {
      overlay.classList.add('stage-transition-static');
      await new Promise((resolve) => requestAnimationFrame(resolve));
    } else {
      const phone = overlay.firstElementChild;
      const enter = direction === 'enter';
      const phases = enter
        ? [
            [{ transform: 'rotate(0deg) scale(.46)', borderRadius: '2rem' }, { transform: 'rotate(90deg) scale(.46)', borderRadius: '1.5rem' }],
            [{ transform: 'rotate(90deg) scale(.46)', borderRadius: '1.5rem' }, { transform: 'rotate(90deg) scale(1)', borderRadius: '.75rem' }],
          ]
        : [
            [{ transform: 'rotate(90deg) scale(1)', borderRadius: '.75rem', opacity: 1 }, { transform: 'rotate(90deg) scale(.46)', borderRadius: '1.5rem', opacity: .9 }],
            [{ transform: 'rotate(90deg) scale(.46)', borderRadius: '1.5rem', opacity: .9 }, { transform: 'rotate(0deg) scale(.46)', borderRadius: '2rem', opacity: 0 }],
          ];
      for (const frames of phases) {
        if (transition.cancelled) return false;
        transition.animation = phone.animate(frames, {
          duration: 360,
          easing: 'cubic-bezier(.16, 1, .3, 1)',
          fill: 'forwards',
        });
        try {
          await transition.animation.finished;
        } catch {
          return false;
        }
      }
    }

    if (transition.cancelled) return false;
    overlay.remove();
    if (active === transition) active = null;
    return true;
  }

  return { run, cancel };
}
