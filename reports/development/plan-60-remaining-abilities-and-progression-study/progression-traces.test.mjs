import test from 'node:test';
import assert from 'node:assert/strict';

// Illustration only: cumulative thresholds [4,8] or [4,12], never repeated prices.
function trace(events, second) {
  const ducks = new Map();
  return events.map(event => {
    const state = ducks.get(event.duck) ?? { progress:0, earned:0, assigned:0 };
    if (event.completed) state.progress += 2 + (event.topThree ? 1 : 0);
    state.earned = Number(state.progress >= 4) + Number(state.progress >= second);
    if (event.assign) { if (state.earned <= state.assigned) throw new Error('no banked point'); state.assigned++; }
    ducks.set(event.duck,state);
    return { ...state, banked:state.earned-state.assigned };
  });
}
const races = (duck,n,topThree=false) => Array.from({length:n},()=>({duck,completed:true,topThree}));
test('favorite losses preserve overflow and reach illustrative second thresholds',()=>{
  assert.deepEqual(trace(races('A',6),8).map(x=>[x.progress,x.earned]),[[2,0],[4,1],[6,1],[8,2],[10,2],[12,2]]);
  assert.deepEqual(trace(races('A',6),12).map(x=>x.earned),[0,1,1,1,1,2]);
});
test('top-three bonus is retained but first point still arrives on second race',()=>{
  assert.deepEqual(trace(races('A',6,true),8).map(x=>[x.progress,x.earned]),[[3,0],[6,1],[9,2],[12,2],[15,2],[18,2]]);
  assert.deepEqual(trace(races('A',6,true),12).map(x=>x.earned),[0,1,1,2,2,2]);
});
test('rotation keeps individual progress separate',()=>{
  const events=[...['A','B','C'].map(duck=>({duck,completed:true,topThree:true})),...races('A',1),...races('B',1),...races('C',1)];
  assert.deepEqual(trace(events,8).map(x=>[x.progress,x.earned]),[[3,0],[3,0],[3,0],[5,1],[5,1],[5,1]]);
});
test('banking preserves the first point until assignment',()=>{
  const states=trace([...races('A',4),{duck:'A',completed:false,assign:true}],8);
  assert.deepEqual(states.map(x=>x.banked),[0,1,1,2,1]);
  assert.equal(states.at(-1).progress,8);
});
test('unresolved attempt earns no progress',()=>{
  assert.deepEqual(trace([{duck:'A',completed:true},{duck:'A',completed:false},{duck:'A',completed:true}],8).map(x=>x.progress),[2,2,4]);
});
test('illustrative rarity ceiling does not change earned progress',()=>{
  assert.deepEqual(trace(races('common',6),8).map(x=>x.progress),trace(races('rare',6),8).map(x=>x.progress));
});
