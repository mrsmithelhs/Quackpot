import test from 'node:test';
import assert from 'node:assert/strict';
import { lifePhoneKind, lifePhoneScreen } from './life-phone-context.mjs';

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
