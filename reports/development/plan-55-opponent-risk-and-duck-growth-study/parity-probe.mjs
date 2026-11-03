import assert from 'node:assert/strict';
import { resolveSeededRace as original, serializeRaceResolution as serializeOriginal } from '../../../src/core/race-resolver.mjs';
import { resolveSeededRace as adapter, serializeRaceResolution as serializeAdapter } from './race-adapter.mjs';
let completed=0, contacts=0, playerContacts=0;
for(let i=0;i<6;i++) for(const choice of ['steady','sprint']) {
  const input={seed:`plan55-check-${String(i).padStart(2,'0')}`,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1};
  const a=original(input), b=adapter(input);
  assert.deepEqual(b,a,`full resolution differs ${input.seed}/${choice}`);
  assert.deepEqual(serializeAdapter(b),serializeOriginal(a),`serialized resolution differs ${input.seed}/${choice}`);
  const events=a.eventRecords.filter(e=>e.type==='duck-contact');
  assert.ok(events.length<=1); contacts+=events.length; playerContacts+=events.filter(e=>e.participants.includes('P')).length;
  completed+=1;
}
process.stdout.write(JSON.stringify({pairs:completed,resolverCalls:completed*2,contacts,playerContacts})+'\n');
