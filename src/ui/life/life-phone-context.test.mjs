import test from 'node:test';
import assert from 'node:assert/strict';
import { renderScene } from '../../assets/apartment/index.mjs';
import { lifePhoneKind, lifePhoneScreen, lifePhoneResolved } from './life-phone-context.mjs';
import { GameEngine } from '../../core/game-engine.mjs';

test('five-slot phone shows the scheduled shift but not work blocked by a due loan',()=>{
 const e=new GameEngine('five-slot-phone',{lifePolicy:'five-slot-v1'});const life=e.state.life;
 life.schedule.day=2;life.schedule.slot='midday';assert.equal(lifePhoneKind(life),'work');assert.deepEqual(lifePhoneScreen(life,false).body,['Shift today']);
 life.finance.loans.push({id:'loan-1',totalCents:150,due:{day:2,slot:'midday'},status:'pending',latched:false});
 assert.equal(lifePhoneKind(life),'app');
 life.finance.loans=[];life.schedule.day=4;life.schedule.overtimeReservation={id:'extra',day:5,slot:'evening',status:'reserved',rentId:'rent-1'};
 assert.equal(lifePhoneKind(life),'work');
 life.finance.loans.push({id:'loan-1',totalCents:150,due:{day:4,slot:'midday'},status:'pending',latched:false});
 assert.equal(lifePhoneKind(life),'app');
});

test('a replied invitation is resolved only until the phone has a new purpose', () => {
  const life = { day: 1, phase: 'morning', employed: true, anchor: null, work: null, rent: { status: 'pending' } };
  const entries = [{ type: 'action', payload: { kind: 'launch_reply' } }];
  assert.equal(lifePhoneResolved(life, []), false);
  assert.equal(lifePhoneResolved(life, entries), true);
  assert.deepEqual(lifePhoneScreen(life, false, entries).body, ['On the list!']);
  life.phase = 'afternoon';
  assert.equal(lifePhoneResolved(life, entries), false); // work messages
  life.phase = 'evening';
  assert.equal(lifePhoneResolved(life, entries), false); // actual gacha entry
});

test('phone artwork follows work availability and switches back to launch after completion', () => {
  const life = { day: 1, phase: 'afternoon', employed: true, anchor: null, work: null, rent: { status: 'pending' } };
  assert.equal(lifePhoneKind(life), 'work');
  assert.deepEqual(lifePhoneScreen(life, false).heading, ['Work']);
  life.anchor = 'work-1'; life.work = { id: 'work-1', status: 'doing' };
  assert.deepEqual(lifePhoneScreen(life, false).body, ['Shift underway']);
  life.work = null;
  assert.equal(lifePhoneKind(life), 'invitation');
  assert.deepEqual(lifePhoneScreen(life, false).heading, ['Tonight!']);
  assert.deepEqual(lifePhoneScreen(life, false).body, ['Reply LAUNCH']);
});

test('morning invitation and unlocked app use the same contextual source as the target', () => {
  const life = { day: 1, phase: 'morning', employed: true, anchor: null, work: null, rent: { status: 'pending' } };
  assert.equal(lifePhoneKind(life), 'invitation');
  life.phase = 'evening';
  assert.equal(lifePhoneKind(life), 'app');
  assert.deepEqual(lifePhoneScreen(life, false).body, ['Open the app']);
  assert.deepEqual(lifePhoneScreen(life, true).body, ['Return to app']);
  life.day = 2; life.phase = 'morning';
  assert.equal(lifePhoneKind(life), 'app');
});

test('every life phase and real phone context fits the actual apartment art contract', () => {
  const entries=[[],[{type:'action',payload:{kind:'launch_reply'}}]];
  for (const phase of ['morning','afternoon','evening','lateNight']) {
    for (const day of [1,2]) for (const work of [null,{id:'work-1',kind:'scheduled',status:'doing'}]) {
      for (const rent of [{status:'pending'},{status:'due'},{status:'overdue'}]) for (const welcome of [false,true]) for (const history of entries) {
        const life={day,phase,employed:true,anchor:work?.id ?? null,work,rent,rentSurfaced:false,recovery:null};
        const phone=lifePhoneScreen(life,welcome,history);
        assert.doesNotThrow(()=>renderScene({area:'desk-side',idPrefix:'phonecontract',duck:false,phone}), `${phase} day ${day} ${JSON.stringify(phone)}`);
      }
    }
  }
});
