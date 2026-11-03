/** Produce a separate note-duration experiment without mutating raw events. */
export function shortenDurations(data, factor) {
  if (![0.75,0.5].includes(factor) || !data || !Array.isArray(data.notes) || data.notes.length===0)
    throw new Error('invalid duration experiment');
  const notes=data.notes.map(note=>{
    if (!Number.isFinite(note.start) || !Number.isFinite(note.end) || note.end<=note.start || note.part==='drums')
      throw new Error('unsupported note for duration experiment');
    return {...note,end:note.start+factor*(note.end-note.start)};
  });
  return {...data, programs:{...data.programs}, omitted:[...data.omitted], notes,
          duration_experiment:{factor,formula:'end = start + factor × (original end − start)',
          note:'Onsets, pitches, programs and assigned velocities unchanged; no quantization.'}};
}
