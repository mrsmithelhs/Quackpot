import { renderScene } from '../assets/apartment/index.mjs';

const EMPTY_PHONE = { status: '', brand: '', heading: [], body: [], note: '' };

/** Build the static side-desk illustration and its separate accessible HTML phone content. */
export function buildApartmentDesk({ returning = false, companion = {} } = {}) {
  const scene = renderScene({
    area: 'desk-side',
    idPrefix: 'production-desk',
    duckView: 'side',
    light: 'neutral',
    phone: EMPTY_PHONE,
    decorative: true,
  });
  const phone = returning
    ? { heading: 'Welcome back', message: 'Your game is ready when you are.', action: 'Open Quackpot' }
    : { heading: 'Welcome Festival', message: '10 FREE pulls waiting!', action: 'Open Quackpot & Claim 10-Pull' };

  return {
    scene: scene.svg,
    companionName: String(companion.name || 'Professor Quacks'),
    companionStyle: String(companion.style || 'classic-yellow'),
    returning: Boolean(returning),
    phone,
  };
}
