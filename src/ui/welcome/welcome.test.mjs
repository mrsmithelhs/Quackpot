import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWelcomeAudio } from '../welcome-audio.mjs';
import { createCosmeticTimeline } from './cosmetic-timeline.mjs';
import { screenCounterAngle } from './stage.js';
import { createConfirmationGate } from './confirmation.mjs';
import { readWelcomeSnapshot, welcomeSnapshotMatches, welcomeResumeDisposition, preserveLiveReceipt, isRelevantStorageEvent } from './storage-snapshot.mjs';
import { shouldSaveReceiptPresentation } from './receipt-lifecycle.mjs';
import { replaceRestartSnapshot, restartConfirmationText } from './restart-storage.mjs';
import { GameEngine } from '../../core/game-engine.mjs';
import { validateSave } from '../../core/storage.mjs';

test('restart replacement accepts a valid new run and refuses stale or failed writes without rollback', () => {
  const engine = new GameEngine('restart-test', { lifePolicy: 'five-slot-v1', tutorialShift: true });
  engine.start(); engine.setupCompanion('Pip', 'classic-yellow'); engine.state.step = 'life_home';
  const candidate = engine.toEnvelope(); const valid = value => validateSave(value, { experimentalFiveSlot: true, requireFiveSlotTutorial: true }).valid;
  let raw = 'old', writes = 0;
  const storage = { getItem() { return raw; }, setItem(_key, value) { writes++; raw = value; } };
  assert.equal(replaceRestartSnapshot(storage, 'key', 'old', candidate, () => false).reason, 'invalid-candidate'); assert.equal(raw, 'old');
  assert.equal(replaceRestartSnapshot({ getItem() { throw Error('blocked'); } }, 'key', 'old', candidate, valid).reason, 'unavailable');
  assert.equal(replaceRestartSnapshot(storage, 'key', 'older', candidate, valid).reason, 'changed'); assert.equal(raw, 'old'); assert.equal(writes, 0);
  assert.equal(replaceRestartSnapshot(storage, 'key', 'old', candidate, valid).success, true); assert.equal(JSON.parse(raw).state.physicalCompanion.name, 'Pip');
  raw = 'old'; const failed = { getItem: () => raw, setItem() { throw Error('quota'); } };
  assert.equal(replaceRestartSnapshot(failed, 'key', 'old', candidate, valid).reason, 'write-or-readback-failed'); assert.equal(raw, 'old');
  raw = 'old'; const competing = { getItem: () => raw, setItem() { raw = 'other-tab'; } };
  assert.equal(replaceRestartSnapshot(competing, 'key', 'old', candidate, valid).reason, 'changed-after-write'); assert.equal(raw, 'other-tab');
});

test('restart copy distinguishes empty, terminal and separate active saves', () => {
  assert.match(restartConfirmationText(null, false, false), /new run will be saved only/);
  assert.doesNotMatch(restartConfirmationText(null, false, false), /existing saved record/);
  assert.match(restartConfirmationText('receipt_presented', true, true), /the saved record/);
  assert.doesNotMatch(restartConfirmationText('receipt_presented', true, true), /its saved record/);
  assert.match(restartConfirmationText('playing', true, false), /separate saved run/);
});

test('schema5 saves first Receipt presentation only; schema6 keeps existing behavior', () => {
  assert.equal(shouldSaveReceiptPresentation('terminal', false), true);
  assert.equal(shouldSaveReceiptPresentation('receipt_presented', false), false);
  assert.equal(shouldSaveReceiptPresentation('receipt_presented', true), true);
});

test('welcome rejects changed, cleared, or unreadable primary and ignores unrelated storage events', () => {
  let raw = 'saved'; const storage = { getItem: () => raw }, other = {};
  const previous = readWelcomeSnapshot(storage, 'key');
  assert.ok(welcomeSnapshotMatches(previous, readWelcomeSnapshot(storage, 'key')));
  raw = 'different'; assert.equal(welcomeSnapshotMatches(previous, readWelcomeSnapshot(storage, 'key')), false);
  assert.equal(welcomeResumeDisposition(previous, readWelcomeSnapshot(storage, 'key'), false), 'refuse');
  assert.equal(welcomeResumeDisposition(previous, readWelcomeSnapshot(storage, 'key'), true), 'temporary-receipt');
  raw = null; assert.equal(welcomeSnapshotMatches(previous, readWelcomeSnapshot(storage, 'key')), false);
  assert.equal(welcomeSnapshotMatches(previous, readWelcomeSnapshot({ getItem() { throw Error('unavailable'); } }, 'key')), false);
  assert.equal(welcomeResumeDisposition(previous, { readable: false }, true), 'temporary-receipt');
  assert.equal(welcomeResumeDisposition(previous, { readable: false }, false), 'refuse');
  assert.equal(isRelevantStorageEvent({ key: null, storageArea: storage }, storage, 'key'), true);
  assert.equal(isRelevantStorageEvent({ key: 'key', storageArea: other }, storage, 'key'), false);
  let writes = 0, preserves = 0; const live = { state: { phase: 'receipt_presented' }, autosaveEnabled: true, save() { writes++; } };
  assert.equal(preserveLiveReceipt(live, value => { if (value) preserves++; }), true);
  assert.equal(live.autosaveEnabled, false); assert.equal(preserves, 1); assert.equal(writes, 0);
});

test('confirmation permits retry after refusal or failure and suppresses concurrent activation', async () => {
  let calls = 0, resolve;
  const attempt = createConfirmationGate(() => { calls++; if (calls === 1) return false; if (calls === 2) throw Error('failed'); return new Promise(done => { resolve = done; }); });
  assert.equal(await attempt('one'), false); await assert.rejects(attempt('two'));
  const pending = attempt('three'); assert.equal(await attempt('duplicate'), false); assert.equal(calls, 3); resolve(true); assert.equal(await pending, true);
});

test('phone screen counter-rotation eases at quarter turns', () => {
  assert.ok(screenCounterAngle(0) === 0); assert.ok(screenCounterAngle(70) === 0);
  assert.equal(screenCounterAngle(80), -45); assert.equal(screenCounterAngle(90), -90);
});

test('cosmetic timeline pauses when not advanced and emits bounded illustrative groups', () => {
  const timeline = createCosmeticTimeline(() => .5);
  const initial = timeline.snapshot(); assert.deepEqual(timeline.snapshot(), initial);
  let frame; for (let i = 0; i < 40; i++) frame = timeline.step(.1);
  assert.equal(frame.group.ducks.length, 3); assert.ok(frame.group.ducks.every(d => Number.isFinite(d.x) && Number.isFinite(d.y)));
});

test('audio is gesture activated, honors pause blockers and disposes', async () => {
  let creations = 0, plays = 0, closes = 0;
  const param = () => ({ value: 0, setValueAtTime(v) { this.value = v; }, cancelScheduledValues() {}, linearRampToValueAtTime(v) { this.value = v; } });
  const ctx = { currentTime: 0, state: 'running', destination: {}, createGain: () => ({ gain: param(), connect() {}, disconnect() {} }), createMediaElementSource: () => ({ connect() {}, disconnect() {} }), async resume() {}, async suspend() {}, async close() { closes++; } };
  const media = { currentTime: 0, paused: true, async play() { plays++; this.paused = false; }, pause() { this.paused = true; }, removeAttribute() {}, load() {} };
  const audio = createWelcomeAudio({ source: 'local.wav', audioContext: () => { creations++; return ctx; }, createMedia: () => media });
  audio.transition('naming'); assert.equal(creations, 0);
  await audio.setEnabled(true); assert.equal(plays, 1); assert.equal(creations, 1); assert.equal(media.loop, true);
  audio.pause('hidden'); audio.pause('modal'); audio.resume('hidden'); assert.equal(plays, 1);
  audio.resume('modal'); await new Promise(resolve => setImmediate(resolve)); assert.equal(plays, 2);
  audio.dispose(); audio.dispose(); assert.equal(closes, 1); assert.equal(media.paused, true);
});

test('late media play cannot restart playback after mute', async () => {
  let complete; const param = () => ({ value: 0, setValueAtTime() {}, cancelScheduledValues() {}, linearRampToValueAtTime() {} });
  const ctx = { currentTime: 0, state: 'running', destination: {}, createGain: () => ({ gain: param(), connect() {}, disconnect() {} }), createMediaElementSource: () => ({ connect() {}, disconnect() {} }), async resume() {}, async suspend() {}, async close() {} };
  const media = { currentTime: 0, paused: true, play() { return new Promise(resolve => { complete = () => { this.paused = false; resolve(); }; }); }, pause() { this.paused = true; }, removeAttribute() {}, load() {} };
  const audio = createWelcomeAudio({ source: 'local.wav', audioContext: () => ctx, createMedia: () => media });
  const started = audio.setEnabled(true); await new Promise(resolve => setImmediate(resolve)); await audio.setEnabled(false); complete(); await started;
  assert.equal(media.paused, true); audio.dispose();
});

test('naming and apartment handoff use separate one-second scene gain ramps', async () => {
  const gains = [];
  const ctx = { currentTime: 4, state: 'running', destination: {}, createGain() { const gain = { value: 0, ramps: [], setValueAtTime(v) { this.value = v; }, cancelScheduledValues() {}, linearRampToValueAtTime(v, t) { this.ramps.push([v, t]); } }; gains.push(gain); return { gain, connect() {}, disconnect() {} }; }, createMediaElementSource: () => ({ connect() {}, disconnect() {} }), async resume() {}, async suspend() {}, async close() {} };
  const media = { currentTime: 0, paused: true, async play() { this.paused = false; }, pause() { this.paused = true; }, removeAttribute() {}, load() {} };
  const audio = createWelcomeAudio({ source: 'local.wav', audioContext: () => ctx, createMedia: () => media });
  await audio.setEnabled(true); assert.equal(gains[1].value, 1);
  audio.transition('naming'); audio.transition('opening'); audio.transition('apartment');
  assert.deepEqual(gains[1].ramps, [[.25, 5], [1, 5], [0, 5]]); audio.dispose();
});
