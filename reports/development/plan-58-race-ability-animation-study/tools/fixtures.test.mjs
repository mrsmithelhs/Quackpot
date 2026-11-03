import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, stateAt } from '../gallery/fixtures.mjs';

test('predictive Bounce follows authored threat, while contact is independent',()=>{
 const events=scenarios.bounce.events, threat=events.find(e=>e.type==='threat'), bounce=events.find(e=>e.type==='bounce');
 assert.ok(threat.at < bounce.at); assert.equal(events.some(e=>e.type==='contact'),false);
 assert.equal(stateAt(scenarios.control.events,1.4).some(e=>e.type==='bounce'),false);
 assert.equal(stateAt(scenarios.control.events,1.4).some(e=>e.type==='contact'),true);
});
test('independent overlap, end boundaries and backward seek derive only from requested time',()=>{
 const events=scenarios.combo.events;
 assert.deepEqual(stateAt(events,2).map(e=>e.type),['crowd','bounce']);
 assert.deepEqual(stateAt(events,3).map(e=>e.type),['bounce']);
 assert.deepEqual(stateAt(events,3.4),[]);
 assert.deepEqual(stateAt(events,0),[]);
 assert.deepEqual(stateAt(events,2).map(e=>e.type),['crowd','bounce']);
});
