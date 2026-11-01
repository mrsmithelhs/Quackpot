import test from 'node:test';
import assert from 'node:assert/strict';
import { payslipAmountText } from './life-story-view.mjs';
import { storyBackdrop } from './life-story-backdrop.mjs';

test('work and commute decoration remains local, static and hidden from assistive output', () => {
  for (const stage of ['commute','work','payslip']) {
    const svg=storyBackdrop(stage);
    assert.match(svg, /<svg\b/); assert.match(svg, /aria-hidden="true"/);
    assert.doesNotMatch(svg, /<script|<image|href=|https?:|<animate/i);
  }
  assert.equal(storyBackdrop('scene'),'');
});

test('payslip formats the actual supplied wage and acknowledges missing evidence', () => {
  assert.equal(payslipAmountText(60), 'Net take-home cash: $60.00');
  assert.equal(payslipAmountText(73.5), 'Net take-home cash: $73.50');
  assert.equal(payslipAmountText(undefined), 'Wage amount unavailable');
});
