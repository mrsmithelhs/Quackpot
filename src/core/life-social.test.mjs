import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLife, transitionLife } from './life-progression.mjs';

const state = () => {
  const initial = initialLife();
  const paid = transitionLife(initial, { cash: 180, health: 50 }, { type: 'rent', choice: 'pay' });
  assert.equal(paid.ok, true);
  // These tests exercise pure Evening transitions, not an end-to-end day journey.
  paid.life.day = 2; paid.life.phase = 'evening'; paid.life.meals['d2-dinner'] = 'buy';
  return paid;
};
function apply(s, intent) {
  const result = transitionLife(s.life, s, intent);
  assert.equal(result.ok, true, JSON.stringify(result)); return result;
}
function initialized() {
  let s = state(); s = apply(s, { type: 'social46_activate', version: 1, revision: 1 });
  return apply(s, { type: 'social46_intro_shown' });
}
function offer(s) {
  s = apply(s, { type: 'social46_offer', day: s.life.day, initiator: 'ren', activity: 'door' });
  return s;
}
function shown(s) { return apply(s, { type: 'social46_offer_shown', id: s.life.social46.pending.id }); }
function tomorrow(s) { s = apply(s, { type: 'advance' }); s.life.phase = 'evening'; s.life.meals[`d${s.life.day}-dinner`] = 'buy'; return s; }
function readResponse(s) { const id = s.life.social46.response.id; s = apply(s, { type: 'social46_response_shown', id }); return apply(s, { type: 'social46_response_dismiss', id }); }

test('pre-activation life shape stays unchanged; activation is explicit and versioned', () => {
  const s = state();
  assert.equal(Object.hasOwn(s.life, 'social46'), false);
  assert.equal(transitionLife(s.life, s, { type: 'social46_activate', version: 2, revision: 1 }).ok, false);
  assert.equal(transitionLife(s.life, s, { type: 'social46_activate', version: 1, revision: 3 }).ok, false);
  const activated = apply(s, { type: 'social46_activate', version: 1, revision: 1 });
  assert.equal(transitionLife(activated.life, activated, { type: 'social46_activate', version: 1, revision: 1 }).ok, false);
});

test('unseen candidate does not reset unanswered or age counted opportunities', () => {
  let s = initialized();
  s = shown(offer(s)); s = tomorrow(s);
  assert.equal(s.life.social46.unanswered, 1);
  s = offer(s); s = tomorrow(s);
  assert.equal(s.life.social46.unanswered, 1);
  assert.equal(s.life.social46.history.length, 1);
  s = shown(offer(s)); s = tomorrow(s);
  s = shown(offer(s)); s = tomorrow(s);
  assert.equal(s.life.social46.unanswered, 3);
  assert.equal(s.life.social46.relationship, 'drifting');
});

test('visit requires displayed scene, completes once, and leaves an intervening evening', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s = apply(s, { type: 'social46_begin', id });
  assert.equal(transitionLife(s.life, s, { type: 'social46_complete', id }).reason, 'social_scene_not_shown');
  assert.equal(transitionLife(s.life, s, { type: 'social46_scene_next', id }).reason, 'social_scene_not_ready');
  s = apply(s, { type: 'social46_scene_shown', id });
  assert.equal(transitionLife(s.life, s, { type: 'social46_complete', id }).reason, 'social_scene_not_shown');
  for (let i = 0; i < 2; i++) { s = apply(s, { type: 'social46_scene_next', id }); s = apply(s, { type: 'social46_scene_shown', id }); }
  s = apply(s, { type: 'social46_complete', id });
  assert.equal(s.health, 55);
  assert.equal(transitionLife(s.life, s, { type: 'social46_complete', id }).ok, false);
  s = apply(s, { type: 'social46_dismiss', id }); s = tomorrow(s);
  assert.equal(transitionLife(s.life, s, { type: 'social46_offer', day: s.life.day, initiator: 'player', activity: 'door' }).ok, false);
  s = tomorrow(s);
  assert.equal(transitionLife(s.life, s, { type: 'social46_offer', day: s.life.day, initiator: 'player', activity: 'door' }).ok, true);
});

test('competing life intent requires explicit conflict handling and notice is exempt', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  assert.equal(transitionLife(s.life, s, { type: 'leisure' }).reason, 'social_conflict');
  let told = apply(s, { type: 'social46_cancel', id });
  told = apply(told, { type: 'leisure' });
  assert.equal(told.life.social46.history.at(-1).outcome, 'notice');
  const broken = apply(s, { type: 'leisure', socialConflict: 'continue' });
  assert.equal(broken.life.social46.history.at(-1).outcome, 'broken');
});

test('two breaks within six close opportunities drift, and a further break strains', () => {
  let s = initialized();
  const breakPlan = input => {
    let t = shown(offer(input)); const id = t.life.social46.pending.id;
    t = apply(t, { type: 'social46_reply', id, choice: 'accept' });
    return apply(t, { type: 'leisure', socialConflict: 'continue' });
  };
  s = breakPlan(s); s = tomorrow(s); s = readResponse(s);
  s = breakPlan(s);
  assert.equal(s.life.social46.relationship, 'drifting');
  s = tomorrow(s); s = readResponse(s);
  // Player-initiated plans are available independently of reduced initiative.
  s = apply(s, { type: 'social46_offer', day: s.life.day, initiator: 'player', activity: 'door' });
  s = shown(s); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s = apply(s, { type: 'leisure', socialConflict: 'continue' });
  assert.equal(s.life.social46.relationship, 'strained');
});

test('recovery closes a pending plan without a broken commitment', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s.life.meals['d2-dinner'] = undefined; s.health = 5;
  s = apply(s, { type: 'meal', choice: 'skip' });
  assert.equal(s.health, 0);
  assert.equal(s.life.social46.history.at(-1).outcome, 'recovery_exempt');
  assert.equal(s.life.social46.pending, null);
});

test('next-play entering a planned Evening is guarded before destination commit', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'reschedule', day: 3 });
  s = shown(s);
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s.life.day = 3; s.life.phase = 'afternoon'; s.life.session = { id: 'session-test', pull: true, race: false, suspended: false }; s.life.anchor = 'session-test';
  const result = transitionLife(s.life, s, { type: 'phone_commit_next', version: 1, confirmed: true, kind: 'pull' });
  assert.equal(result.reason, 'social_conflict');
  assert.equal(s.life.social46.pending.id, id);
});

test('recovery before a future visit does not automatically cancel it', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'reschedule', day: 3 });
  s = shown(s);
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s.life.meals['d2-dinner'] = undefined; s.health = 5;
  s = apply(s, { type: 'meal', choice: 'skip' });
  assert.equal(s.health, 0);
  assert.equal(s.life.social46.pending.id, id);
});

test('a failed staged pull does not publish a conflicting plan break or random changes', async () => {
  const { GameEngine } = await import('./game-engine.mjs');
  const e = new GameEngine('social-atomic', { lifePolicy: true }); e.start(); e.setupCompanion();
  const commit = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'social46_activate', version: 1, revision: 1 });
  commit({ type: 'social46_intro_shown' });
  commit({ type: 'social46_offer', day: 2, initiator: 'ren', activity: 'door' });
  const id = e.state.life.social46.pending.id;
  commit({ type: 'social46_offer_shown', id }); commit({ type: 'social46_reply', id, choice: 'accept' });
  const snapshot = () => JSON.stringify({ state: e.state, log: e.log.entries, root: e.rng.serialize(), draw: e.rngDraw.serialize(), race: e.rngRace.serialize(), event: e.rngEvent.serialize() });
  const before = snapshot();
  e.sampleLifeDraw = () => { throw new Error('injected draw failure'); };
  assert.throws(() => e.commitPromotionalTenPull({ confirmSocial: true }), /injected draw failure/);
  assert.equal(snapshot(), before);
});

test('social scene reload resumes without duplicate health and terminal records interruption', async () => {
  const { GameEngine } = await import('./game-engine.mjs');
  const { validateSave } = await import('./storage.mjs');
  const e = new GameEngine('social-reload', { lifePolicy: true }); e.start(); e.setupCompanion();
  const commit = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'social46_activate', version: 1, revision: 1 });
  commit({ type: 'social46_intro_shown' });
  commit({ type: 'social46_offer', day: 2, initiator: 'ren', activity: 'door' });
  const id = e.state.life.social46.pending.id;
  commit({ type: 'social46_offer_shown', id }); commit({ type: 'social46_reply', id, choice: 'accept' });
  commit({ type: 'social46_begin', id }); commit({ type: 'social46_scene_shown', id });
  assert.equal(validateSave(e.toEnvelope()).valid, true);
  e.clickUninstall();
  assert.equal(e.applyLifeIntent({ type: 'social46_complete', id }).reason, 'presentation_covered');
  e.stayUninstall();
  assert.equal(e.state.life.social46.scene.stage, 'scene');
  for (let i = 0; i < 2; i++) { commit({ type: 'social46_scene_next', id }); commit({ type: 'social46_scene_shown', id }); }
  commit({ type: 'social46_complete', id });
  assert.equal(validateSave(e.toEnvelope()).valid, true);
  assert.equal(e.applyLifeIntent({ type: 'social46_complete', id }).ok, false);
  e.finishRunComplete();
  assert.equal(e.log.entries.some(x => x.type === 'social46_interrupted'), false);
  assert.equal(validateSave(e.toEnvelope()).valid, true);
});

test('a failed staged race does not publish a conflicting plan break or random changes', async () => {
  const { GameEngine } = await import('./game-engine.mjs');
  const e = new GameEngine('social-race-atomic', { lifePolicy: true }); e.start(); e.setupCompanion();
  const commit = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); assert.ok(e.commitPromotionalTenPull()); e.revealAllPending();
  commit({ type: 'advance' }); commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'social46_activate', version: 1, revision: 1 }); commit({ type: 'social46_intro_shown' });
  commit({ type: 'social46_offer', day: 2, initiator: 'ren', activity: 'door' });
  const id = e.state.life.social46.pending.id;
  commit({ type: 'social46_offer_shown', id }); commit({ type: 'social46_reply', id, choice: 'accept' });
  const snapshot = () => JSON.stringify({ state: e.state, log: e.log.entries, root: e.rng.serialize(), draw: e.rngDraw.serialize(), race: e.rngRace.serialize(), event: e.rngEvent.serialize() });
  const before = snapshot();
  e.resolveRaceCandidate = () => { throw new Error('injected race failure'); };
  assert.throws(() => e.runRace(1, e.state.owned[0], 'safe', { confirmSocial: true }), /injected race failure/);
  assert.equal(snapshot(), before);
});

test('only established game-night context requires disclosure and floor reconfirmation', () => {
  let ordinary = initialized();
  ordinary = apply(ordinary, { type: 'sell', asset: 'couch' });
  assert.deepEqual(ordinary.life.sold, ['couch']);
  let s = initialized(); s.life.social46.couchContext = true;
  s = apply(s, { type: 'social46_offer', day: 2, initiator: 'ren', activity: 'game' });
  s = shown(s); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  assert.equal(transitionLife(s.life, s, { type: 'sell', asset: 'couch' }).reason, 'social_sale_disclosure_required');
  s = apply(s, { type: 'social46_sale_shown', id });
  s = apply(s, { type: 'sell', asset: 'couch' });
  assert.equal(s.life.social46.pending.seatingConfirmed, false);
  assert.equal(transitionLife(s.life, s, { type: 'social46_begin', id }).ok, false);
  assert.equal(transitionLife(s.life, s, { type: 'social46_confirm_floor', id }).ok, false);
  s = apply(s, { type: 'social46_floor_shown', id });
  s = apply(s, { type: 'social46_confirm_floor', id });
  s = apply(s, { type: 'social46_begin', id });
  assert.equal(s.life.social46.scene.seating, 'floor');
  s = apply(s, { type: 'social46_scene_shown', id });
  assert.equal(s.events[0].payload.seating, 'door');
  s = apply(s, { type: 'social46_scene_next', id });
  s = apply(s, { type: 'social46_scene_shown', id });
  assert.equal(s.events[0].payload.seating, 'floor');
  assert.deepEqual(s.life.sold, ['couch']);
});

test('repair earns once, then a broken reconnecting plan returns to the repair step', () => {
  let s = initialized(); s.life.social46.relationship = 'strained';
  s = apply(s, { type: 'social46_offer', day: 2, initiator: 'player', activity: 'repair' });
  s = shown(s); let id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s = apply(s, { type: 'social46_begin', id }); s = apply(s, { type: 'social46_scene_shown', id });
  for (let i = 0; i < 2; i++) { s = apply(s, { type: 'social46_scene_next', id }); s = apply(s, { type: 'social46_scene_shown', id }); }
  s = apply(s, { type: 'social46_complete', id }); assert.equal(s.health, 55);
  assert.equal(s.life.social46.relationship, 'reconnecting');
  assert.equal(transitionLife(s.life, s, { type: 'social46_complete', id }).ok, false);
  s = apply(s, { type: 'social46_dismiss', id }); s = tomorrow(s); s = tomorrow(s);
  s = apply(s, { type: 'social46_offer', day: s.life.day, initiator: 'player', activity: 'door' });
  s = shown(s); id = s.life.social46.pending.id; s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s = apply(s, { type: 'leisure', socialConflict: 'continue' });
  assert.equal(s.life.social46.relationship, 'strained');
});

test('leaving during a shown Ren scene records interruption without completing it', async () => {
  const { GameEngine } = await import('./game-engine.mjs');
  const { validateSave } = await import('./storage.mjs');
  const e = new GameEngine('social-interrupt', { lifePolicy: true }); e.start(); e.setupCompanion();
  const commit = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  commit({ type: 'meal', choice: 'skip' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'social46_activate', version: 1, revision: 1 }); commit({ type: 'social46_intro_shown' });
  commit({ type: 'social46_offer', day: 2, initiator: 'ren', activity: 'door' });
  const id = e.state.life.social46.pending.id;
  commit({ type: 'social46_offer_shown', id }); commit({ type: 'social46_reply', id, choice: 'accept' });
  commit({ type: 'social46_begin', id }); commit({ type: 'social46_scene_shown', id });
  e.clickUninstall(); e.leaveUninstall();
  assert.equal(e.log.entries.filter(x => x.type === 'social46_interrupted').length, 1);
  assert.equal(e.log.entries.filter(x => x.type === 'life_health' && x.payload.reason === 'ren_visit').length, 0);
  assert.equal(validateSave(e.toEnvelope()).valid, true);
});

test('an older policy-1 run activates after day two without rewriting its earlier log', async () => {
  const { GameEngine } = await import('./game-engine.mjs');
  const { validateSave } = await import('./storage.mjs');
  let e = new GameEngine('social-legacy-activation', { lifePolicy: true }); e.start(); e.setupCompanion();
  const commit = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' });
  commit({ type: 'meal', choice: 'buy' }); commit({ type: 'advance' }); commit({ type: 'advance' });
  const legacy = e.toEnvelope(); assert.equal(validateSave(legacy).valid, true);
  const originalLog = JSON.stringify(legacy.eventLog);
  e = GameEngine.fromEnvelope(legacy);
  assert.equal(e.applyLifeIntent({ type: 'social46_activate', version: 1, revision: 1 }).ok, true);
  assert.equal(JSON.stringify(e.log.entries.slice(0, legacy.eventLog.length)), originalLog);
  assert.equal(e.log.entries.slice(0, legacy.eventLog.length).some(x => x.type.startsWith('social46_')), false);
  assert.equal(validateSave(e.toEnvelope()).valid, true);
});

test('a declined invitation creates a free display-gated Ren response without relationship penalty', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'decline' });
  assert.equal(s.life.social46.relationship, 'connected');
  assert.equal(s.life.social46.response.kind, 'response_declined');
  assert.equal(transitionLife(s.life, s, { type: 'social46_response_dismiss', id }).ok, false);
  s = apply(s, { type: 'social46_response_shown', id });
  assert.equal(transitionLife(s.life, s, { type: 'social46_response_shown', id }).ok, false);
  s = apply(s, { type: 'social46_response_dismiss', id });
  assert.equal(s.life.social46.response, null);
  s = tomorrow(s);
  assert.equal(transitionLife(s.life, s, { type: 'social46_offer', day: s.life.day, initiator: 'player', activity: 'door' }).ok, true);
});

test('an unread benign response does not prevent a later invitation', () => {
  let s = shown(offer(initialized())); const first = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id: first, choice: 'decline' });
  s = tomorrow(s);
  s = apply(s, { type: 'social46_offer', day: s.life.day, initiator: 'ren', activity: 'door' });
  assert.equal(s.life.social46.response.shown, false);
  assert.equal(s.life.social46.pending.shown, false);
  s = tomorrow(s);
  assert.equal(s.life.social46.unanswered, 0);
  assert.equal(s.life.social46.history.length, 1);
});

test('an accepted plan can be rescheduled once without a break', () => {
  let s = shown(offer(initialized())); const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  s = apply(s, { type: 'social46_reschedule_plan', id, day: 3 });
  assert.equal(s.life.social46.pending.committed, false);
  assert.equal(s.life.social46.pending.day, 3);
  assert.equal(s.life.social46.history.length, 0);
  s = shown(s); s = apply(s, { type: 'social46_reply', id, choice: 'accept' });
  assert.equal(transitionLife(s.life, s, { type: 'social46_reschedule_plan', id, day: 4 }).ok, false);
});

test('relative invitation wording is recorded at the actual display day', () => {
  let s = initialized();
  s = apply(s, { type: 'social46_offer', day: 3, initiator: 'player', activity: 'door' });
  const id = s.life.social46.pending.id;
  s = apply(s, { type: 'social46_offer_shown', id });
  assert.match(s.events[0].payload.text, /tomorrow evening/);
  assert.equal(s.events[0].payload.atDay, 2);
  assert.equal(transitionLife(s.life, s, { type: 'social46_offer_shown', id }).ok, false);
  s = tomorrow(s);
  s = apply(s, { type: 'social46_offer_shown', id });
  assert.match(s.events[0].payload.text, /this evening/);
  assert.equal(s.events[0].payload.atDay, 3);
});

test('pre-delivery social snapshots without the release revision fail closed with an explicit reason', async () => {
  const { validateLifeHistory } = await import('./life-validation.mjs');
  const old = [
    { type: 'life_intent', payload: { intent: { type: 'social46_activate', version: 1 } } },
    { type: 'life_transition', payload: { life: { social46: {} } } },
  ];
  assert.match(validateLifeHistory(old, {})[0], /Unsupported pre-delivery Ren development snapshot/);
  const future = [
    { type: 'life_intent', payload: { intent: { type: 'social46_activate', version: 1, revision: 3 } } },
    { type: 'life_transition', payload: { life: { social46: { revision: 3 } } } },
  ];
  assert.match(validateLifeHistory(future, { life: { social46: { revision: 3 } } })[0], /Unsupported Ren social revision/);
  future[1].payload.life.social46.revision = 1;
  assert.match(validateLifeHistory(future, { life: { social46: { revision: 3 } } })[0], /revision does not match/);
});
