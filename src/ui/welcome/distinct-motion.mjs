// Synthetic presentation only: offsets are fractions of one shared cue box.
const clamp = x => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * clamp(t);
export function distinctMotionAt(kind, age, still = false) {
  if (!Number.isFinite(age) || age < 0 || age >= .85) return [];
  if (still) {
    if (kind === 'pop') return [{ name: 'pop', x: 0, y: 0, width: 1, scaleX: 1, scaleY: 1, opacity: 1 }];
    if (kind === 'tear') return [{ name: 'tear', x: 0, y: 0, width: .6, scaleX: 1, scaleY: 1, opacity: 1 }];
    if (kind === 'fragments') return [[-.24,-.20],[.25,-.20],[-.23,.21],[.24,.22]].map(([x,y],i)=>({name:`chip${i+1}`,x,y,width:.18,scaleX:1,scaleY:1,opacity:1}));
    return [];
  }
  if (kind === 'pop') {
    if (age >= .65) return [];
    const size = age < .12 ? lerp(.35, 1, age / .12) : age < .24 ? 1 : lerp(1, .5, (age - .24) / .41);
    return [{ name: 'pop', x: 0, y: 0, width: 1, scaleX: size, scaleY: size, opacity: age < .24 ? 1 : 1 - clamp((age - .24) / .41) }];
  }
  if (kind === 'tear') return [{ name: 'tear', x: lerp(-.2,.2,age/.5), y: 0, width: .6, scaleX: lerp(.3,1,age/.18), scaleY: 1, opacity: age < .5 ? 1 : 1-clamp((age-.5)/.35) }];
  if (kind === 'fragments') {
    const travel = 1-(1-clamp(age/.5))**2, opacity = age < .5 ? 1 : 1-clamp((age-.5)/.35);
    return [[-.31,-.29],[.31,-.27],[-.30,.30],[.30,.31]].map(([x,y],i)=>({name:`chip${i+1}`,x:x*travel,y:y*travel,width:.18,scaleX:1,scaleY:1,opacity}));
  }
  return [];
}
