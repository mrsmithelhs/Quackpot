// Unmounted selected Plan 57 cue projection. Caller supplies the visual event;
// collision, injury and variant selection are independent external facts.
const assets = Object.freeze({
  pop: new URL('../../assets/svg/race-effects/pop.svg', import.meta.url).href,
  chip1: new URL('../../assets/svg/race-effects/chip1.svg', import.meta.url).href,
  chip2: new URL('../../assets/svg/race-effects/chip2.svg', import.meta.url).href,
  chip3: new URL('../../assets/svg/race-effects/chip3.svg', import.meta.url).href,
  chip4: new URL('../../assets/svg/race-effects/chip4.svg', import.meta.url).href,
  onset: new URL('../../assets/svg/race-effects/A-onset.svg', import.meta.url).href,
  expansion: new URL('../../assets/svg/race-effects/A-expansion.svg', import.meta.url).href,
  breakup: new URL('../../assets/svg/race-effects/A-breakup.svg', import.meta.url).href,
  settle: new URL('../../assets/svg/race-effects/A-settle.svg', import.meta.url).href,
  bandage: new URL('../../assets/svg/race-effects/adhesive-bandage.svg', import.meta.url).href,
});
const clamp = (n) => Math.max(0, Math.min(1, n));
const lerp = (a,b,t) => a+(b-a)*clamp(t);

/** progress is normalized; null represents no authored event. */
export function collisionVisual({ kind, progress, idPrefix, pose = {} }) {
  if (!['pop','fragments','burst','injury','white-return'].includes(kind)
      || typeof idPrefix !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(idPrefix) || !pose || typeof pose !== 'object'
      || (progress !== null && (!Number.isFinite(progress) || progress < 0 || progress > 1))
      || (pose.still !== undefined && typeof pose.still !== 'boolean')) throw new RangeError('invalid visual input');
  if (progress === null) return { kind, active: false, frames: [], whiteMix: 0 };
  const still = Boolean(pose.still), age = progress * .85, frames = [];
  if (kind === 'injury') frames.push({ id: `${idPrefix}-bandage`, asset: assets.bandage, x: 0, y: 0, width: 1, scaleX: 1, scaleY: 1, opacity: 1 });
  if (kind === 'pop' && age < .65) {
    const size = still ? 1 : age < .12 ? lerp(.35,1,age/.12) : age < .24 ? 1 : lerp(1,.5,(age-.24)/.41);
    frames.push({ id: `${idPrefix}-pop`, asset: assets.pop, x: 0, y: 0, width: 1, scaleX: size, scaleY: size,
      opacity: still || age < .24 ? 1 : 1-clamp((age-.24)/.41) });
  }
  if (kind === 'fragments' && age < .85) {
    const travel = still ? 1 : 1-(1-clamp(age/.5))**2, opacity = still || age < .5 ? 1 : 1-clamp((age-.5)/.35);
    const points = still ? [[-.24,-.20],[.25,-.20],[-.23,.21],[.24,.22]] : [[-.31,-.29],[.31,-.27],[-.30,.30],[.30,.31]];
    points.forEach(([x,y],i) => frames.push({ id: `${idPrefix}-chip${i+1}`, asset: assets[`chip${i+1}`], x: x*travel, y: y*travel,
      width: .18, scaleX: 1, scaleY: 1, opacity }));
  }
  if (kind === 'burst' && age < .85) {
    const name = still ? 'expansion' : age < .12 ? 'onset' : age < .30 ? 'expansion' : age < .52 ? 'breakup' : 'settle';
    frames.push({ id: `${idPrefix}-burst`, asset: assets[name], x: 0, y: 0, width: 1, scaleX: 1, scaleY: 1, opacity: 1, frame: name });
  }
  return { kind, active: kind === 'white-return' || frames.length > 0, frames,
    whiteMix: kind === 'white-return' ? (still ? 0 : 1-progress) : 0 };
}
