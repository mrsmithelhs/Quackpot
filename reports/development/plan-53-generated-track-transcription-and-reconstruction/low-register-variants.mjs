/** Map the existing half-duration piano events for a bounded listening experiment. */
export function lowRegisterVariant(data, kind) {
  if (!['quiet','electric'].includes(kind) || data?.duration_experiment?.factor!==0.5 ||
      data?.programs?.acoustic_piano!==0 || !Array.isArray(data.notes) || !data.notes.length)
    throw Error('invalid low-register experiment');
  const notes=data.notes.map(n=>{
    if(n.part!=='acoustic_piano' || !Number.isInteger(n.pitch) || n.pitch<0 || n.pitch>127 || n.velocity!==85 ||
       !Number.isFinite(n.start) || !Number.isFinite(n.end) || n.end<=n.start) throw Error('invalid piano note');
    const low=n.pitch<=55;
    return {...n, velocity:low&&kind==='quiet'?60:85, render_program:low&&kind==='electric'?4:0};
  });
  return {...data, programs:{...data.programs}, omitted:[...data.omitted], notes,
    low_register_experiment:{kind, threshold_inclusive:55, low_velocity:kind==='quiet'?60:85,
      low_program:kind==='electric'?4:0, upper_velocity:85, upper_program:0,
      note:'Pitch split is a rendering heuristic, not recovered source parts.'}};
}
