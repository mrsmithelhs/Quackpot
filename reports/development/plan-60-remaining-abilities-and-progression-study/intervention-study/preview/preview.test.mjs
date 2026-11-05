import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseWitness,sharedBounds,frameAtOrBefore,CONTACT_TICK,WINDOW } from './preview-data.mjs';

const file='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/screen-000-004.jsonl';
const text=readFileSync(file,'utf8');
test('fixed source is pinned and three actual same-contact cases are admitted',()=>{
  assert.equal(createHash('sha256').update(text).digest('hex'),'26cefdc875b8cff52cee0d37c7e990d9baf54f46b9ec5b76afdb676dde5a11ab');
  const rows=parseWitness(text);assert.deepEqual(rows.map(r=>r.arm),['none','quick-recovery','straight-shooter']);
  assert.deepEqual(rows.map(r=>r.contact.tick),[CONTACT_TICK,CONTACT_TICK,CONTACT_TICK]);
  assert.deepEqual(rows.map(r=>r.starts.length),[0,1,1]);
});
test('missing or altered actual event is rejected',()=>{
  assert.throws(()=>parseWitness(text.replace('duck-contact-259-A-P','unexpected-contact')),/Unexpected contact/);
});
test('one shared camera bounds all three recorded paths for each view',()=>{
  const rows=parseWitness(text);
  for(const mode of ['whole','contact']) {
    const bounds=sharedBounds(rows,mode);
    for(const row of rows) for(const f of row.frames) if(mode==='whole'||(f.tick>=WINDOW[0]&&f.tick<=WINDOW[1])) {
      assert.ok(f.x>=bounds.minX&&f.x<=bounds.maxX&&f.y>=bounds.minY&&f.y<=bounds.maxY);
    }
  }
  for(const row of rows) assert.ok(frameAtOrBefore(row.frames,CONTACT_TICK).tick<=CONTACT_TICK);
});
