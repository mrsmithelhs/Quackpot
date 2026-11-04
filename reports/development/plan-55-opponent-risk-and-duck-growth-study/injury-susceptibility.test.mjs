import test from 'node:test';
import assert from 'node:assert/strict';
import { rollInjury,extensionOnce } from './injury-susceptibility-state.mjs';
const base={stance:'steady',seed:'s',raceId:'R1',contactId:'contact-1'};
test('same first contact couples both policies without coupling participants',()=>{const a=rollInjury({id:'A'},{...base,policy:'first'}),b=rollInjury({id:'A'},{...base,policy:'contact'}),c=rollInjury({id:'B'},{...base,policy:'contact'});assert.deepEqual(a,b);assert.notEqual(a.key,c.key);assert.equal(a.probability,.2);});
test('first policy stops after one roll, contact policy rolls distinct events until injury',()=>{const a={id:'A'},b={id:'A'};rollInjury(a,{...base,policy:'first'});rollInjury(b,{...base,policy:'contact'});assert.equal(rollInjury(a,{...base,policy:'first',contactId:'contact-2'}),null);assert.ok(rollInjury(b,{...base,policy:'contact',contactId:'contact-2'}));b.susceptibilityInjured=true;assert.equal(rollInjury(b,{...base,policy:'contact',contactId:'contact-3'}),null);});
test('stance conditional probabilities and input validation',()=>{assert.equal(rollInjury({id:'P'},{...base,stance:'sprint',policy:'first'}).probability,.4);assert.throws(()=>rollInjury({id:'P'},{...base,stance:'bad',policy:'first'}),/invalid/);});
test('existing injury extension decision records once only for completed race',()=>{const s={injured:true},x={seed:'s',raceId:'R1',id:'P'};assert.deepEqual(extensionOnce(s,{...x,status:'unresolved'}),s);const next=extensionOnce(s,{...x,status:'finished'});assert.equal(Object.keys(next.extensionDecisions).length,1);assert.throws(()=>extensionOnce(next,{...x,status:'finished'}),/already/);});

