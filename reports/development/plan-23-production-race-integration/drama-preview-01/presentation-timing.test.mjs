import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cameraFractionAtTick,
  individualPresentationTiming,
  raceFractionAtPlanWallClock,
  resultRevealDueAtElapsedMilliseconds,
  revealProgressAtElapsedMilliseconds,
  wallClockAtPlanFraction,
} from './presentation-timing.mjs';

function fixturePlan() {
  return individualPresentationTiming({ highlightSeconds: 2, checkpoints: [0, 100, 200, 300, 400] }, {
    finishTimeSeconds: 21.6,
    lastFinishTimeSeconds: 22.7,
  });
}

test('individual highlight stays centered on half of the original first-crossing segment', () => {
  const plan = fixturePlan();
  const firstCrossSeconds = 21.6;
  const center = (plan.highlightStartFraction + plan.highlightEndFraction) / 2 * plan.duration;
  assert.ok(Math.abs(center - firstCrossSeconds * 0.5) < 1e-12);
  assert.ok(Math.abs((plan.highlightEndFraction - plan.highlightStartFraction) * plan.duration - firstCrossSeconds * 0.06) < 1e-12);

  const centerFraction = (plan.highlightStartFraction + plan.highlightEndFraction) / 2;
  const centerWallSeconds = wallClockAtPlanFraction(centerFraction, plan);
  assert.ok(Math.abs(raceFractionAtPlanWallClock(centerWallSeconds, plan) - centerFraction) < 1e-12);
});

test('final crossing plus highlight uses millisecond elapsed time for the reveal boundary', () => {
  const plan = fixturePlan();
  const boundaryMs = plan.simulationWallSeconds * 1000;
  assert.equal(resultRevealDueAtElapsedMilliseconds(boundaryMs - 1, plan), false);
  assert.equal(resultRevealDueAtElapsedMilliseconds(boundaryMs, plan), true);
  assert.equal(resultRevealDueAtElapsedMilliseconds(boundaryMs + 1, plan), true);
  assert.equal(revealProgressAtElapsedMilliseconds(boundaryMs - 1, plan), 0);
  assert.equal(revealProgressAtElapsedMilliseconds(boundaryMs, plan), 0);
  assert.equal(revealProgressAtElapsedMilliseconds(boundaryMs + 500, plan), 0.5);
  assert.equal(revealProgressAtElapsedMilliseconds(boundaryMs + 1000, plan), 1);
  assert.equal(revealProgressAtElapsedMilliseconds(boundaryMs + 1001, plan), 1);
});

test('individual camera follows the original first-crossing segment and holds wide afterward', () => {
  assert.equal(cameraFractionAtTick(0, 450, 480), 0);
  assert.equal(cameraFractionAtTick(225, 450, 480), 0.5);
  assert.equal(cameraFractionAtTick(450, 450, 480), 1);
  assert.equal(cameraFractionAtTick(480, 450, 480), 1);
});
