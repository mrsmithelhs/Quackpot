// Authored presentation fixtures; these do not describe race mechanics or outcomes.
export const fixtures = {
  neither: { label: 'Contact; neither injured', events: [{ at: 1, type: 'collision', ids: ['A', 'B'] }] },
  first: { label: 'Contact; A injured', events: [{ at: 1, type: 'collision', ids: ['A', 'B'] }, { at: 1.15, type: 'injury', ids: ['A'] }] },
  second: { label: 'Contact; B injured', events: [{ at: 1, type: 'collision', ids: ['A', 'B'] }, { at: 1.15, type: 'injury', ids: ['B'] }] },
  both: { label: 'Contact; both injured', events: [{ at: 1, type: 'collision', ids: ['A', 'B'] }, { at: 1.15, type: 'injury', ids: ['A', 'B'] }] },
  existing: { label: 'Already injured A contacts B; injury clears', events: [{ at: 0, type: 'injury', ids: ['A'] }, { at: 1, type: 'collision', ids: ['A', 'B'] }, { at: 2.5, type: 'clear', ids: ['A'] }] },
  wall: { label: 'Wall impact; no injury', events: [{ at: 1, type: 'collision', ids: ['A'], wall: true }] },
  healthy: { label: 'Healthy control; no collision', events: [] },
  injured: { label: 'Injured control; no collision', events: [{ at: 0, type: 'injury', ids: ['A'] }] },
  repeated: { label: 'Two separated synthetic contacts', events: [{ at: 1, type: 'collision', ids: ['A', 'B'] }, { at: 1.7, type: 'collision', ids: ['B', 'C'] }] },
};

export function stateAt(events, time, duration = 0.5) {
  const injured = new Set();
  const contacts = [];
  for (const event of events) {
    if (event.at > time) continue;
    if (event.type === 'injury') event.ids.forEach(id => injured.add(id));
    if (event.type === 'clear') event.ids.forEach(id => injured.delete(id));
    if (event.type === 'collision' && time - event.at <= Math.max(duration, 1.1)) contacts.push({ ...event, age: time - event.at });
  }
  return { injured, contacts };
}
