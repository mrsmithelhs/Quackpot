import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const viewUrl = new URL('./race-view.js', import.meta.url);
const cssUrl = new URL('./race-entry.css', import.meta.url);

test('Plan 22 race entry source keeps all owned candidates keyboard-selectable and displays actual rest inputs', async () => {
  const [view, css] = await Promise.all([readFile(viewUrl, 'utf8'), readFile(cssUrl, 'utf8')]);
  assert.match(view, /input type="radio" name="duckId"/);
  assert.match(view, /duckSvg\(duck\.id/);
  assert.match(view, /race-candidate-art/);
  assert.match(view, /restCandidates\.map/);
  assert.match(view, /effectiveBaseInput/);
  assert.match(view, /historyLimited/);
  assert.match(view, /speed rating/);
  assert.match(view, /Opening Pond Trial/);
  assert.equal(view.match(/Use purchased one-race speed upgrade: \+5% base speed on this race\./g)?.length, 2,
    'the initial and post-purchase checkbox copy use the same one-race upgrade name');
  assert.match(view, /Exchange 3 Down for a \+5% one-race speed upgrade/);
  assert.match(view, /with upgrade/);
  assert.doesNotMatch(view, /with trial|Use purchased race trial|Exchange 3 Down for \+5% speed on one race/);
  assert.match(view, /Needs rest/);
  assert.match(view, /50% lower immediately after racing, 25% lower after one other race finishes/);
  assert.match(view, /recordEntryShown\(\)/);
  assert.match(view, /function isFullyVisibleInViewport/);
  assert.match(view, /rect\.bottom <= window\.innerHeight/);
  assert.match(view, /stickyHudCoversCandidate/);
  assert.match(view, /restCandidates\.filter\(\(duck\) => visibleIds\.has\(duck\.id\)\)/);
  assert.match(view, /window\.addEventListener\('scroll', onViewportChange/);
  assert.match(view, /document\.addEventListener\('visibilitychange', onViewportChange\)/);
  assert.match(view, /formatRaceRating\(candidate\.effectiveWithTrialInput\)/);
  assert.match(view, /sort\(\(a, b\) => b\.effectiveBaseInput - a\.effectiveBaseInput/);
  assert.match(css, /:focus-within/);
  assert.match(css, /@media \(max-width: 32rem\)/);
});
