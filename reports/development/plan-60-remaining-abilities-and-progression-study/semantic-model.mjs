// Authored event-ordering study only; not a race solver or production contract.
export function simulate(events, { ability = 'none', risk = 0.10, injuredA = false } = {}) {
  const state = { A: 'ground', B: 'ground' }, injured = { A: injuredA, B: false };
  const finished = new Set(), trace = [];
  let activeUntil = -1, cooldownUntil = -1, target = null;
  const priority = { finish: 0, crossing: 0, land: 1, surface: 1, contact: 2, opportunity: 3, flight: 3, dive: 3, flap: 3, weave: 3, obstacle: 3, recovery: 3, crowd: 3 };
  const sorted = events.map((e,i) => ({ ...e, ordinal:i })).sort((a,b) => a.t-b.t || (priority[a.type] ?? 99)-(priority[b.type] ?? 99) || a.ordinal-b.ordinal);
  for (const e of sorted) {
    const who = e.who ?? 'A', other = e.other ?? 'B';
    if (activeUntil >= 0 && e.t >= activeUntil) { trace.push({type:'window-ended', t:activeUntil}); activeUntil = -1; target = null; }
    if (e.type === 'finish' || e.type === 'crossing') {
      if (!finished.has(who)) { finished.add(who); trace.push({ type:'crossing-witness', who, t:e.t }); if (who === 'A' || target === who) { activeUntil = -1; target = null; } }
      continue;
    }
    if (finished.has(who)) { trace.push({ type:'rejected-finished', who, t:e.t }); continue; }
    if (e.type === 'opportunity') {
      const eligible = e.eligible !== false && e.succeeds !== false && e.t >= cooldownUntil;
      if (ability === e.ability && eligible && (!e.target || !finished.has(e.target))) {
        activeUntil = e.t + 500; cooldownUntil = activeUntil + 1000; target = e.target ?? null;
        trace.push({ type:'activation', ability, who, target, t:e.t, end:activeUntil, cooldownEnd:cooldownUntil });
      } else trace.push({ type:'no-activation', who, t:e.t });
    } else if (e.type === 'dive' || e.type === 'flight') {
      if (ability === (e.type === 'dive' ? 'dive' : 'flap-ahead')) { state[who] = e.type === 'dive' ? 'submerged' : 'air'; trace.push({ type:'state', who, state:state[who], t:e.t }); }
    } else if (e.type === 'surface' || e.type === 'land') {
      state[who] = 'ground'; trace.push({ type:'state', who, state:'ground', t:e.t });
    } else if (e.type === 'contact') {
      if (finished.has(other)) { trace.push({type:'rejected-finished', who:other, t:e.t}); continue; }
      if (state[who] !== state[other]) { trace.push({type:'separate-layer', who, other, t:e.t}); continue; }
      trace.push({type:'contact', who, other, t:e.t});
      for (const id of [who, other]) {
        if (injured[id]) continue;
        let threshold = risk;
        if (id === 'A' && ability === 'guard' && e.t < activeUntil) threshold *= .5;
        if (id === 'A' && ability === 'bounce' && e.t < activeUntil) threshold = 0;
        const draw = e.draws?.[id] ?? (id === 'A' ? .075 : .15);
        if (draw < threshold) { injured[id] = true; trace.push({type:'injury', who:id, t:e.t}); }
      }
    } else if (e.type === 'flap') {
      if (ability === 'wide-flap' && e.target) trace.push({ type:'authored-displacement', target:e.target, t:e.t });
    } else if (e.type === 'weave') {
      trace.push({ type:'authored-weave', degrees: ability === 'steady-nerves' ? 12 : 16, t:e.t });
    } else if (e.type === 'recovery') {
      trace.push({ type:'authored-recovery', seconds:ability === 'quick-recovery' ? .7 : 1, t:e.t });
    } else if (e.type === 'obstacle') {
      trace.push({ type:'authored-obstacle-label', path:e.path, t:e.t });
    } else if (e.type === 'crowd') {
      trace.push({ type:'independent-crowd-opportunity', t:e.t });
    }
  }
  return { trace, injured, state, target };
}
