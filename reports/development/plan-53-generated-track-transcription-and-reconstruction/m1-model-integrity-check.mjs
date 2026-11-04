import {readFile} from 'node:fs/promises';import {verify} from './m1-model-integrity.mjs';import {buildSchedule} from './m1-model-comparison.mjs';
const read=async x=>readFile(new URL(x,import.meta.url));
const manifest=JSON.parse(await read('local/m1-medium-large-comparison/manifest.json'));
const files={medium:await read('local/m1-medium-large-comparison/medium-events.json'),large:await read('local/m1-medium-large-comparison/large-events.json')};
const sources={medium:await read('local/listening/raw-events.json'),large:await read('local/MuScriptor-Large-return/comparison/M1-excerpt/raw-events.jsonl')};
verify(manifest,files,sources);for(const name of ['medium','large']){const d=JSON.parse(files[name]);const s=buildSchedule(d);console.log(JSON.stringify({name,notes:d.notes.length,omitted:d.omitted.length,channels:s.channels,programs:s.programs,scheduledNoteOns:s.events.filter(e=>e.on).length}));}
