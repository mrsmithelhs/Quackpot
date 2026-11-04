// Change only the existing piano channel's program; do not mutate the schedule.
export function marimbaPrograms(schedule){const ch=schedule?.channels?.acoustic_piano;if(!Number.isInteger(ch)||schedule.programs?.[ch]!==0)throw Error('missing or unexpected piano program');return {...schedule.programs,[ch]:12}}
