'use strict';

/**
 * plan-status.js unit tests
 *
 * NOTE: This is a standalone Node.js test/self-check script. It is NOT a
 * Vitest, Jest, Mocha, or Jasmine suite.
 *
 * If your project adopts a Vitest-based test setup (or similar test runner),
 * exclude this file from your test-collection glob (e.g., in vitest.config.ts's
 * `test.exclude` list) to avoid false test failures, and run it directly:
 *
 *   node scripts/dev/plan-status.test.js
 *
 * Uses synthetic in-memory fixture packets (no disk access for core logic).
 * Covers: parseFrontmatter, computeEffectiveStatus, detectCycles,
 *         generateIndexTable, and all lint rules.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  parseFrontmatter,
  frontmatterLength,
  computeEffectiveStatus,
  detectCycles,
  generateIndexTable,
  lintPackets,
  setPacketStatus,
  detectEol,
  normalizeNewlines,
  parsePacketSortKey,
  getCanonicalId,
  findClosestCanonicalId,
  packetNotFoundError,
  resolvePacketInput,
  readAllPackets,
  VALID_STATUSES,
  TERMINAL_STATUSES,
  INDEX_BEGIN,
  INDEX_END,
} = require('../../scripts/dev/plan-status');

// ── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label) {
  if (condition) {
    passed++;
    process.stdout.write('  PASS  ' + label + '\n');
  } else {
    failed++;
    failures.push(label);
    process.stdout.write('  FAIL  ' + label + '\n');
  }
}

function eq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    process.stdout.write('         actual:   ' + JSON.stringify(actual) + '\n');
    process.stdout.write('         expected: ' + JSON.stringify(expected) + '\n');
  }
  assert(ok, label);
}

function section(title) {
  process.stdout.write('\n── ' + title + ' ──\n');
}

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeFm(overrides) {
  return Object.assign(
    {
      id: 'plan-01',
      title: 'Plan One',
      status: 'complete',
      depends_on: [],
      gate: '',
      superseded_by: null,
      resolution: 'Delivered.',
      summary: 'Does the thing.',
    },
    overrides
  );
}

function makePacket(id, fmOverrides) {
  const fm = makeFm(Object.assign({ id }, fmOverrides));
  const filename = (fmOverrides && fmOverrides.filename) || id;
  return { filePath: `docs/development/${filename}.md`, basename: filename, text: '', fm };
}

function indexById(packets) {
  const map = {};
  for (const p of packets) {
    if (p.fm && p.fm.id) map[p.fm.id] = p;
  }
  return map;
}

function makePacketText(overrides) {
  const eol = overrides.eol || '\n';
  const status = overrides.status || 'draft';
  const dependsOn = overrides.depends_on || [];
  const summary = overrides.summary || 'Does the thing.';
  const gate = overrides.gate || '';
  const resolution = Object.prototype.hasOwnProperty.call(overrides, 'resolution')
    ? overrides.resolution
    : null;
  const supersededBy = Object.prototype.hasOwnProperty.call(overrides, 'superseded_by')
    ? overrides.superseded_by
    : null;
  const title = overrides.title || overrides.id || 'Packet';
  const body = overrides.body || '# Body';

  const lines = [
    '---',
    `id: ${overrides.id}`,
    `title: ${title}`,
    `status: ${status}`,
    `depends_on: [${dependsOn.join(', ')}]`,
    `gate: ${gate ? JSON.stringify(gate) : '""'}`,
    `superseded_by: ${supersededBy === null ? 'null' : supersededBy}`,
    `resolution: ${resolution === null ? 'null' : JSON.stringify(resolution)}`,
    `summary: >-`,
    `  ${summary}`,
    '---',
    body,
  ];

  return lines.join(eol) + eol;
}

function makeFixtureWorkspace(packets, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'techexam-plan-status-'));
  const docsDir = path.join(root, 'docs', 'development');
  const reportsDir = path.join(root, 'reports', 'development');
  fs.mkdirSync(docsDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });

  for (const packet of packets) {
    const text = makePacketText(packet);
    const filename = packet.filename || packet.id;
    fs.writeFileSync(path.join(docsDir, `${filename}.md`), text, 'utf8');
  }

  const readmeText = options.readmeText || `# Packets\n\n${INDEX_BEGIN}\n${generateIndexTable(packets.map((packet) => makePacket(packet.id, packet)), indexById(packets.map((packet) => makePacket(packet.id, packet))))}\n${INDEX_END}\n`;
  fs.writeFileSync(path.join(docsDir, 'README.md'), readmeText, 'utf8');

  return { root, docsDir, reportsDir, readmePath: path.join(docsDir, 'README.md') };
}

function readPacketObject(dir, id) {
  const filePath = path.join(dir, `${id}.md`);
  const text = fs.readFileSync(filePath, 'utf8');
  return {
    filePath,
    basename: id,
    text,
    fm: parseFrontmatter(text),
  };
}

// ── parseFrontmatter ─────────────────────────────────────────────────────────

section('parseFrontmatter — basic scalars');

{
  const text = `---
id: plan-01
title: Repo Scaffold
status: complete
superseded_by: null
resolution: Delivered.
---

# Body
`;
  const fm = parseFrontmatter(text);
  eq(fm.id, 'plan-01', 'id scalar');
  eq(fm.title, 'Repo Scaffold', 'title scalar');
  eq(fm.status, 'complete', 'status scalar');
  eq(fm.superseded_by, null, 'null value');
  eq(fm.resolution, 'Delivered.', 'resolution string');
  assert(fm !== null, 'returns object');
}

section('parseFrontmatter — inline array');

{
  const text = `---
id: plan-10
depends_on: [plan-01, plan-02]
---
`;
  const fm = parseFrontmatter(text);
  eq(fm.depends_on, ['plan-01', 'plan-02'], 'two-element array');
}

{
  const text = `---
id: plan-10
depends_on: []
---
`;
  const fm = parseFrontmatter(text);
  eq(fm.depends_on, [], 'empty array');
}

section('parseFrontmatter — quoted gate');

{
  const text = `---
id: plan-05
gate: "owner gate at completion: contract rungs"
---
`;
  const fm = parseFrontmatter(text);
  eq(fm.gate, 'owner gate at completion: contract rungs', 'double-quoted string with colon');
}

section('parseFrontmatter — >- folded scalar');

{
  const text = `---
id: plan-03
summary: >-
  First line of summary
  second line continues here.
---
`;
  const fm = parseFrontmatter(text);
  eq(fm.summary, 'First line of summary second line continues here.', 'folded scalar joins lines');
}

section('parseFrontmatter — no frontmatter returns null');

{
  const text = `# Plan 01

## Packet Metadata

- Status: complete
`;
  const fm = parseFrontmatter(text);
  eq(fm, null, 'no frontmatter → null');
}

section('frontmatterLength');

{
  const text = `---
id: plan-01
---
# Body starts here
`;
  const len = frontmatterLength(text);
  const body = text.slice(len);
  assert(body.startsWith('# Body'), 'body starts after frontmatter');
}

// ── computeEffectiveStatus ───────────────────────────────────────────────────

section('computeEffectiveStatus — not blocked if no deps');

{
  const byId = indexById([makePacket('plan-01', { status: 'complete' })]);
  eq(computeEffectiveStatus(makeFm({ id: 'plan-02', status: 'ready', depends_on: [] }), byId),
    'ready', 'ready with no deps → ready');
}

section('computeEffectiveStatus — blocked if dep not complete');

{
  const p1 = makePacket('plan-01', { status: 'ready' }); // dep is ready, not complete
  const byId = indexById([p1]);
  const fm = makeFm({ id: 'plan-02', status: 'ready', depends_on: ['plan-01'] });
  eq(computeEffectiveStatus(fm, byId), 'blocked', 'ready with non-complete dep → blocked');
}

section('computeEffectiveStatus — blocked if dep unknown');

{
  const byId = indexById([]);
  const fm = makeFm({ id: 'plan-05', status: 'ready', depends_on: ['plan-99'] });
  eq(computeEffectiveStatus(fm, byId), 'blocked', 'ready with unknown dep → blocked');
}

section('computeEffectiveStatus — complete dep unblocks');

{
  const p1 = makePacket('plan-01', { status: 'complete', resolution: 'Done.' });
  const byId = indexById([p1]);
  const fm = makeFm({ id: 'plan-02', status: 'ready', depends_on: ['plan-01'] });
  eq(computeEffectiveStatus(fm, byId), 'ready', 'ready with complete dep → ready');
}

section('computeEffectiveStatus — non-ready statuses pass through');

{
  const byId = indexById([makePacket('plan-01', { status: 'ready' })]);
  const draftFm = makeFm({ id: 'plan-02', status: 'draft', depends_on: ['plan-01'] });
  eq(computeEffectiveStatus(draftFm, byId), 'draft',
    'draft with incomplete dep → draft (blocked computed only for ready/in-progress)');

  const completeFm = makeFm({ id: 'plan-03', status: 'complete', resolution: 'Done.', depends_on: ['plan-01'] });
  eq(computeEffectiveStatus(completeFm, byId), 'complete',
    'complete with incomplete dep → complete (pass-through)');
}

section('computeEffectiveStatus — in-progress blocked');

{
  const p1 = makePacket('plan-01', { status: 'ready' });
  const byId = indexById([p1]);
  const fm = makeFm({ id: 'plan-02', status: 'in-progress', depends_on: ['plan-01'] });
  eq(computeEffectiveStatus(fm, byId), 'blocked', 'in-progress with incomplete dep → blocked');
}

section('computeEffectiveStatus — null fm → no-frontmatter');

{
  eq(computeEffectiveStatus(null, {}), 'no-frontmatter', 'null fm → no-frontmatter');
}

// ── detectCycles ─────────────────────────────────────────────────────────────

section('detectCycles — no cycles');

{
  const packets = [
    makePacket('plan-01', { depends_on: [] }),
    makePacket('plan-02', { depends_on: ['plan-01'] }),
    makePacket('plan-03', { depends_on: ['plan-02'] }),
  ];
  const byId = indexById(packets);
  const cycles = detectCycles(packets, byId);
  eq(cycles.length, 0, 'linear chain has no cycles');
}

section('detectCycles — direct cycle A→B→A');

{
  const packets = [
    makePacket('plan-01', { depends_on: ['plan-02'] }),
    makePacket('plan-02', { depends_on: ['plan-01'] }),
  ];
  const byId = indexById(packets);
  const cycles = detectCycles(packets, byId);
  assert(cycles.length >= 1, 'direct cycle detected');
  const flat = cycles.map(c => c.join('→')).join('; ');
  assert(flat.includes('plan-01') && flat.includes('plan-02'), 'cycle includes both nodes');
}

section('detectCycles — self-loop');

{
  const packets = [makePacket('plan-01', { depends_on: ['plan-01'] })];
  const byId = indexById(packets);
  const cycles = detectCycles(packets, byId);
  assert(cycles.length >= 1, 'self-loop detected');
}

section('detectCycles — triangle A→B→C→A');

{
  const packets = [
    makePacket('plan-01', { depends_on: ['plan-03'] }),
    makePacket('plan-02', { depends_on: ['plan-01'] }),
    makePacket('plan-03', { depends_on: ['plan-02'] }),
  ];
  const byId = indexById(packets);
  const cycles = detectCycles(packets, byId);
  assert(cycles.length >= 1, 'triangle cycle detected');
}

// ── parsePacketSortKey ───────────────────────────────────────────────────────

section('parsePacketSortKey — numeric order');

{
  const ids = ['plan-10b', 'plan-02', 'plan-10', 'plan-10c', 'plan-01', 'plan-02b'];
  const sorted = [...ids].sort((a, b) => {
    const [na, la] = parsePacketSortKey(a);
    const [nb, lb] = parsePacketSortKey(b);
    return na !== nb ? na - nb : la.localeCompare(lb);
  });
  eq(sorted, ['plan-01', 'plan-02', 'plan-02b', 'plan-10', 'plan-10b', 'plan-10c'],
    'packet ids sort numerically with letter suffix secondary');
}

// ── generateIndexTable ───────────────────────────────────────────────────────

section('generateIndexTable — basic output');

{
  const packets = [
    makePacket('plan-02', { title: 'Plan Two', status: 'ready', summary: 'Does two things.', depends_on: [] }),
    makePacket('plan-01', { title: 'Plan One', status: 'complete', resolution: 'Done.', summary: 'Does one thing.', depends_on: [] }),
  ];
  const byId = indexById(packets);
  const table = generateIndexTable(packets, byId);
  const lines = table.split('\n');
  assert(lines[0].includes('| id |'), 'header row present');
  assert(lines[1].includes('|---'), 'separator row present');
  assert(lines[2].includes('plan-01'), 'plan-01 appears before plan-02 (sorted)');
  assert(lines[3].includes('plan-02'), 'plan-02 appears second');
  assert(table.includes('Does one thing.'), 'summary included');
}

section('generateIndexTable — blocked effective status');

{
  const packets = [
    makePacket('plan-01', { status: 'ready', depends_on: [] }),
    makePacket('plan-02', { status: 'ready', depends_on: ['plan-01'] }),
  ];
  const byId = indexById(packets);
  const table = generateIndexTable(packets, byId);
  assert(table.includes('blocked'), 'plan-02 shows blocked effective status');
  // plan-01 with no complete deps shows ready
  const lines = table.split('\n');
  const p01line = lines.find(l => l.includes('plan-01'));
  assert(p01line && p01line.includes('ready'), 'plan-01 shows ready');
}

// ── lint rules (inline via lintPackets helper) ───────────────────────────────

// We can't run the full cmdLint() (it reads from disk), but we can test the
// rule logic by exercising the same underlying helpers used by cmdLint.

section('lint logic — VALID_STATUSES covers all vocabulary');

{
  const expected = ['draft', 'ready', 'in-progress', 'delivered', 'complete', 'superseded', 'parked'];
  for (const s of expected) {
    assert(VALID_STATUSES.has(s), `VALID_STATUSES includes "${s}"`);
  }
  assert(!VALID_STATUSES.has('blocked'), 'blocked is not a hand-set status');
  assert(!VALID_STATUSES.has('deferred'), 'deferred is not a valid status (was renamed parked)');
}

section('lint logic — TERMINAL_STATUSES');

{
  for (const s of ['complete', 'superseded', 'parked']) {
    assert(TERMINAL_STATUSES.has(s), `TERMINAL_STATUSES includes "${s}"`);
  }
  assert(!TERMINAL_STATUSES.has('ready'), 'ready is not terminal');
  assert(!TERMINAL_STATUSES.has('draft'), 'draft is not terminal');
}

section('lint logic — superseded requires superseded_by (simulated)');

{
  const fm = makeFm({ status: 'superseded', superseded_by: null, resolution: 'Replaced by plan-02.' });
  const violations = [];
  if (fm.status === 'superseded' && !fm.superseded_by) {
    violations.push('superseded without superseded_by');
  }
  eq(violations.length, 1, 'superseded with null superseded_by is a violation');
}

{
  const fm = makeFm({ status: 'superseded', superseded_by: 'plan-02', resolution: 'Replaced by plan-02.' });
  const violations = [];
  if (fm.status === 'superseded' && !fm.superseded_by) {
    violations.push('superseded without superseded_by');
  }
  eq(violations.length, 0, 'superseded with superseded_by set is clean');
}

section('lint logic — terminal status requires resolution (simulated)');

{
  for (const status of ['complete', 'superseded', 'parked']) {
    const fmMissing = makeFm({ status, resolution: null, superseded_by: status === 'superseded' ? 'plan-02' : null });
    const hasMissing = TERMINAL_STATUSES.has(fmMissing.status) && !fmMissing.resolution;
    assert(hasMissing, `${status} with null resolution triggers violation`);

    const fmOk = makeFm({ status, resolution: 'Done.', superseded_by: status === 'superseded' ? 'plan-02' : null });
    const hasOk = TERMINAL_STATUSES.has(fmOk.status) && !fmOk.resolution;
    assert(!hasOk, `${status} with resolution set is clean`);
  }
}

section('lint logic — unknown status (simulated)');

{
  const badStatuses = ['deferred', 'cancelled', 'wip', ''];
  for (const s of badStatuses) {
    assert(!VALID_STATUSES.has(s), `"${s || '(empty)'}" is not a valid status`);
  }
}

section('lint logic — dangling depends_on (simulated)');

{
  const byId = indexById([makePacket('plan-01')]);
  const fm = makeFm({ id: 'plan-02', depends_on: ['plan-01', 'plan-99'] });
  const dangling = (fm.depends_on || []).filter(dep => !byId[dep]);
  eq(dangling, ['plan-99'], 'plan-99 flagged as dangling');
}

section('lint logic — id/filename mismatch (simulated)');

{
  const p = makePacket('plan-01', { id: 'plan-02' }); // id in fm differs from basename
  const mismatch = p.fm.id !== p.basename;
  assert(mismatch, 'id/filename mismatch detected');
}

{
  const p = makePacket('plan-01', { id: 'plan-01' });
  const mismatch = p.fm.id !== p.basename;
  assert(!mismatch, 'matching id/filename is clean');
}

section('lint logic — duplicate ids (simulated)');

{
  const packets = [
    makePacket('plan-01', { id: 'plan-01' }),
    makePacket('plan-01-copy', { id: 'plan-01' }), // same id, different file
  ];
  const seenIds = {};
  const dupes = [];
  for (const p of packets) {
    if (!p.fm || !p.fm.id) continue;
    if (seenIds[p.fm.id]) dupes.push(p.fm.id);
    else seenIds[p.fm.id] = p.basename;
  }
  eq(dupes, ['plan-01'], 'duplicate id flagged');
}

// ── temp-fixture set verb ────────────────────────────────────────────────────

section('setPacketStatus — valid non-terminal transition writes and re-renders');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'draft', summary: 'Does one thing.' },
    { id: 'plan-02', title: 'Plan Two', status: 'complete', resolution: 'Done.', summary: 'Does two things.' },
  ]);
  const beforePacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');
  const beforeReadme = fs.readFileSync(workspace.readmePath, 'utf8');

  const result = setPacketStatus('plan-01', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(result.ok, 'non-terminal transition succeeds');
  const afterPacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');
  const afterReadme = fs.readFileSync(workspace.readmePath, 'utf8');
  assert(afterPacket !== beforePacket, 'packet file changed');
  assert(afterReadme !== beforeReadme, 'README index changed');
  eq(parseFrontmatter(afterPacket).status, 'ready', 'packet status updated to ready');
  assert(afterReadme.includes('`plan-01` | Plan One | ready'), 'README re-rendered with new status');
}

section('setPacketStatus — terminal without resolution is refused with no write');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'ready', summary: 'Does one thing.' },
  ]);
  const beforePacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');

  const result = setPacketStatus('plan-01', 'complete', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(!result.ok, 'missing resolution is rejected');
  assert(result.error.includes('--resolution'), 'error mentions resolution');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8'), beforePacket, 'packet file unchanged');
}

section('setPacketStatus — superseded without superseded_by is refused with no write');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'ready', summary: 'Does one thing.' },
    { id: 'plan-02', title: 'Plan Two', status: 'ready', summary: 'Does two things.' },
  ]);
  const beforePacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');

  const result = setPacketStatus('plan-01', 'superseded', {
    resolution: 'Replaced by plan-02.',
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(!result.ok, 'missing superseded_by is rejected');
  assert(result.error.includes('--superseded-by'), 'error mentions superseded_by');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8'), beforePacket, 'packet file unchanged');
}

section('setPacketStatus — invalid status string and missing id are refused with no write');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'draft', summary: 'Does one thing.' },
  ]);
  const beforePacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');

  const invalidStatus = setPacketStatus('plan-01', 'bogus', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });
  assert(!invalidStatus.ok, 'invalid status is rejected');
  assert(invalidStatus.error.includes('invalid status'), 'invalid status error reported');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8'), beforePacket, 'packet file unchanged after invalid status');

  const missingId = setPacketStatus('plan-99', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });
  assert(!missingId.ok, 'missing packet id is rejected');
  assert(missingId.error.includes('packet not found'), 'missing id error reported');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8'), beforePacket, 'packet file unchanged after missing id');
}

section('setPacketStatus — proposed lint failure is refused before write');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'draft', summary: 'Does one thing.' },
    { id: 'plan-02', title: 'Plan Two', status: 'bogus', summary: 'Broken on purpose.' },
  ]);
  const beforePacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');

  const result = setPacketStatus('plan-01', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(!result.ok, 'proposal with invalid sibling packet is rejected');
  assert(result.error.includes('unknown status'), 'lint error surfaced');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8'), beforePacket, 'packet file unchanged');
}

section('setPacketStatus — line endings preserved on edited packet');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'draft', summary: 'Does one thing.', eol: '\r\n' },
  ]);
  const before = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');
  assert(before.includes('\r\n'), 'fixture starts with CRLF');

  const result = setPacketStatus('plan-01', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(result.ok, 'CRLF transition succeeds');
  const after = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');
  assert(after.includes('\r\n'), 'CRLF preserved after edit');
  assert(detectEol(after) === '\r\n', 'edited packet still uses CRLF');
}

section('setPacketStatus — terminal close with resolution writes fields and passes lint');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', title: 'Plan One', status: 'ready', summary: 'Does one thing.' },
    { id: 'plan-02', title: 'Plan Two', status: 'complete', resolution: 'Already done.', summary: 'Does two things.' },
  ]);

  const result = setPacketStatus('plan-01', 'complete', {
    resolution: 'Closed cleanly.',
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(result.ok, 'terminal close succeeds');
  const afterPacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01.md'), 'utf8');
  const fm = parseFrontmatter(afterPacket);
  eq(fm.status, 'complete', 'status set to complete');
  eq(fm.resolution, 'Closed cleanly.', 'resolution written');
  const lint = lintPackets([
    readPacketObject(workspace.docsDir, 'plan-01'),
    readPacketObject(workspace.docsDir, 'plan-02'),
  ], {
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });
  eq(lint.errors.length, 0, 'lint has no errors after terminal close');
}

// ── Canonical ID checks ──────────────────────────────────────────────────────

section('getCanonicalId — resolving validation');

{
  eq(getCanonicalId('plan-101-charger-archetype'), 'plan-101', 'plan-101-charger-archetype resolves to plan-101');
  eq(getCanonicalId('plan-10b-something'), 'plan-10b', 'plan-10b-something resolves to plan-10b');
  eq(getCanonicalId('plan-10'), 'plan-10', 'plan-10 resolves to plan-10');
  eq(getCanonicalId('plan-10-'), null, 'plan-10- is invalid (null)');
  eq(getCanonicalId('plan-10bc-something'), null, 'plan-10bc-something is invalid (null)');
  eq(getCanonicalId('plan-abc'), null, 'plan-abc is invalid (null)');
}

section('resolvePacketInput — canonical, slug, bare number, suffix, and case-insensitive forms');

{
  const cases = [
    { input: 'plan-19', filename: 'plan-19', id: 'plan-19' },
    { input: 'plan-19-some-description', filename: 'plan-19-some-description', id: 'plan-19' },
    { input: '19', filename: 'plan-19', id: 'plan-19' },
    { input: '19b', filename: 'plan-19b-some-description', id: 'plan-19b' },
    { input: 'plan-19b-some-description', filename: 'plan-19b-some-description', id: 'plan-19b' },
  ];

  for (const testCase of cases) {
    const workspace = makeFixtureWorkspace([
      { id: testCase.id, filename: testCase.filename, title: 'Packet', status: 'draft', summary: 'Packet.' },
    ]);
    const packets = readAllPackets(workspace.docsDir);
    const result = resolvePacketInput(packets, testCase.input);
    eq(result.ok, true, `${testCase.input} resolves`);
    eq(result.canonicalId, testCase.id, `${testCase.input} resolves to the canonical id`);
  }

  const caseWorkspace = makeFixtureWorkspace([
    { id: 'plan-19', filename: 'plan-19-some-description', title: 'Packet', status: 'draft', summary: 'Packet.' },
  ]);
  const caseResult = resolvePacketInput(readAllPackets(caseWorkspace.docsDir), 'PLAN-19-SOME-DESCRIPTION');
  eq(caseResult.canonicalId, 'plan-19', 'case-insensitive slug resolves canonically');
}

section('resolvePacketInput — bare number never crosses to a suffixed sibling');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-19b', filename: 'plan-19b-some-description', title: 'Packet', status: 'draft', summary: 'Packet.' },
  ]);
  const packets = readAllPackets(workspace.docsDir);
  const bare = resolvePacketInput(packets, '19');
  assert(!bare.ok, 'bare number refuses when only a suffixed sibling exists');
  assert(bare.error.includes('Expected a canonical id like "plan-19"'), 'sibling refusal teaches the unsuffixed canonical form');
  assert(!bare.error.includes('Did you mean'), 'sibling refusal does not suggest the suffixed sibling');
  eq(resolvePacketInput(packets, '19b').canonicalId, 'plan-19b', 'bare letter suffix resolves its own canonical id');
}

section('packetNotFoundError — digits-only near-match fallback and no dangling hint');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-89', filename: 'plan-89', title: 'Packet', status: 'draft', summary: 'Packet.' },
  ]);
  const packets = readAllPackets(workspace.docsDir);
  const fallback = packetNotFoundError('89z', packets);
  eq(fallback, 'ERROR: packet not found: 89z. Expected a canonical id like "plan-89". Did you mean: plan-89?', 'unknown suffix falls back to the digits-only hint');
  const unknownSuffix = resolvePacketInput(packets, '89z');
  assert(!unknownSuffix.ok, 'unknown suffix does not resolve through the digits-only fallback');

  const noMatch = packetNotFoundError('999', packets);
  eq(noMatch, 'ERROR: packet not found: 999. Expected a canonical id like "plan-999".', 'no-near-match names the expected canonical form');
  assert(!noMatch.includes('Did you mean'), 'no-near-match has no dangling suggestion');
  const malformed = packetNotFoundError('not-a-packet', packets);
  eq(malformed, 'ERROR: packet not found: not-a-packet. Expected a canonical id like "plan-<number>".', 'malformed input names the canonical shape');
  assert(!malformed.includes('Did you mean'), 'malformed input has no dangling suggestion');
  eq(findClosestCanonicalId(packets, '89z'), 'plan-89', 'closest canonical id uses digits-only fallback');
}

section('lintPackets — duplicate canonical IDs cross-file validation');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-10', filename: 'plan-10-one', title: 'One', status: 'draft', summary: 'One summary.' },
    { id: 'plan-10', filename: 'plan-10-two', title: 'Two', status: 'draft', summary: 'Two summary.' },
  ]);

  const p1 = readPacketObject(workspace.docsDir, 'plan-10-one');
  const p2 = readPacketObject(workspace.docsDir, 'plan-10-two');
  const lint = lintPackets([p1, p2], { readmePath: workspace.readmePath, reportsDir: workspace.reportsDir });
  assert(lint.errors.some(e => e.includes('Duplicate canonical ID')), 'fails lint due to duplicate canonical ID');
}

section('lintPackets — verbose ID and mismatch validation');

{
  // Mismatched / Verbose ID fails lint
  const workspace = makeFixtureWorkspace([
    { id: 'plan-101-charger-archetype', filename: 'plan-101-charger-archetype', title: 'Charger', status: 'draft', summary: 'Does one thing.' },
  ]);
  const pVerbose = readPacketObject(workspace.docsDir, 'plan-101-charger-archetype');
  const lintVerbose = lintPackets([pVerbose], { readmePath: workspace.readmePath, reportsDir: workspace.reportsDir });
  assert(lintVerbose.errors.some(e => e.includes('does not match the canonical ID')), 'verbose ID fails lint with mismatch error');
}

{
  // Migrated / Correct ID passes lint
  const workspace = makeFixtureWorkspace([
    { id: 'plan-101', filename: 'plan-101-charger-archetype', title: 'Charger', status: 'draft', summary: 'Does one thing.' },
  ]);
  const pMigrated = readPacketObject(workspace.docsDir, 'plan-101-charger-archetype');
  const lintMigrated = lintPackets([pMigrated], { readmePath: workspace.readmePath, reportsDir: workspace.reportsDir });
  eq(lintMigrated.errors.length, 0, 'correct short ID matches canonical ID and passes lint');
}

section('setPacketStatus — refuses write if legacy verbose ID present');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-101-charger-archetype', filename: 'plan-101-charger-archetype', title: 'Charger', status: 'draft', summary: 'Does one thing.' },
  ]);
  const beforePacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-101-charger-archetype.md'), 'utf8');

  // Attempting set on a packet that contains a legacy verbose ID (which makes it lint-invalid)
  const result = setPacketStatus('plan-101', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(!result.ok, 'set refuses to run when legacy verbose ID makes the corpus lint-invalid');
  assert(result.error.includes('does not match the canonical ID'), 'error mentions ID mismatch');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-101-charger-archetype.md'), 'utf8'), beforePacket, 'file remains unchanged');
}

section('setPacketStatus — succeeds on descriptive filename with migrated ID');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-101', filename: 'plan-101-charger-archetype', title: 'Charger', status: 'draft', summary: 'Does one thing.' },
  ]);

  const result = setPacketStatus('plan-101', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(result.ok, 'set successfully updates descriptive filename when ID is migrated');
  const afterPacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-101-charger-archetype.md'), 'utf8');
  const fm = parseFrontmatter(afterPacket);
  eq(fm.status, 'ready', 'status updated to ready');
}

section('setPacketStatus — refuses write if duplicate canonical IDs present');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-10', filename: 'plan-10-one', title: 'One', status: 'draft', summary: 'One summary.' },
    { id: 'plan-10', filename: 'plan-10-two', title: 'Two', status: 'draft', summary: 'Two summary.' },
    { id: 'plan-99', filename: 'plan-99', title: 'Unique', status: 'draft', summary: 'Unique summary.' },
  ]);
  const beforeOne = fs.readFileSync(path.join(workspace.docsDir, 'plan-10-one.md'), 'utf8');
  const beforeTwo = fs.readFileSync(path.join(workspace.docsDir, 'plan-10-two.md'), 'utf8');

  // Attempting to set plan-10 resolves to multiple files
  const resultMultiple = setPacketStatus('10', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });
  assert(!resultMultiple.ok, 'set refuses when ID matches multiple files');
  assert(resultMultiple.error.includes('resolves to multiple files'), 'error mentions resolving to multiple files');

  // Attempting to set a completely separate unique packet plan-99 still refuses because the repository contains duplicate canonical IDs, failing pre-write lint check!
  const resultLintFail = setPacketStatus('plan-99', 'ready', {
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });
  assert(!resultLintFail.ok, 'set refuses to write if corpus is lint-invalid due to duplicate canonical IDs');
  assert(resultLintFail.error.includes('Duplicate canonical ID'), 'error mentions duplicate canonical ID');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-10-one.md'), 'utf8'), beforeOne, 'packet one remains unchanged');
  eq(fs.readFileSync(path.join(workspace.docsDir, 'plan-10-two.md'), 'utf8'), beforeTwo, 'packet two remains unchanged');
}

// ── Repair checks ────────────────────────────────────────────────────────────

section('lintPackets — malformed filename is discovered and rejected');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-abc', filename: 'plan-abc', title: 'Invalid Name', status: 'draft', summary: 'Does one thing.' },
  ]);

  const packets = readAllPackets(workspace.docsDir);
  const lint = lintPackets(packets, { readmePath: workspace.readmePath, reportsDir: workspace.reportsDir });

  assert(lint.errors.some(e => e.includes('filename does not match canonical ID grammar')), 'fails lint due to malformed filename');
}

section('lintPackets — short depends_on resolves between descriptive filenames');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', filename: 'plan-01-scaffold', title: 'Scaffold', status: 'complete', resolution: 'done', summary: 'Scaffold.' },
    { id: 'plan-02', filename: 'plan-02-feature', title: 'Feature', status: 'ready', depends_on: ['plan-01'], summary: 'Feature.' },
  ]);

  const packets = readAllPackets(workspace.docsDir);
  const lint = lintPackets(packets, { readmePath: workspace.readmePath, reportsDir: workspace.reportsDir });
  eq(lint.errors.length, 0, 'short canonical depends_on resolves successfully between descriptive filenames');
}

section('setPacketStatus — superseded by short ID resolves descriptive target');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', filename: 'plan-01-old-feature', title: 'Old Feature', status: 'complete', resolution: 'done', summary: 'Old.' },
    { id: 'plan-02', filename: 'plan-02-new-feature', title: 'New Feature', status: 'ready', summary: 'New.' },
  ]);

  const result = setPacketStatus('plan-01', 'superseded', {
    supersededBy: 'plan-02',
    resolution: 'Replaced by plan-02.',
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(result.ok, 'superseded transition with short ID succeeds');
  const afterPacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01-old-feature.md'), 'utf8');
  const fm = parseFrontmatter(afterPacket);
  eq(fm.status, 'superseded', 'status is set to superseded');
  eq(fm.superseded_by, 'plan-02', 'superseded_by matches the canonical short ID');
}

section('lintPackets — verbose dependency reference is rejected');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', filename: 'plan-01-scaffold', title: 'Scaffold', status: 'complete', resolution: 'done', summary: 'Scaffold.' },
    { id: 'plan-02', filename: 'plan-02-feature', title: 'Feature', status: 'ready', depends_on: ['plan-01-scaffold'], summary: 'Feature.' },
  ]);

  const packets = readAllPackets(workspace.docsDir);
  const lint = lintPackets(packets, { readmePath: workspace.readmePath, reportsDir: workspace.reportsDir });
  assert(lint.errors.some(e => e.includes('depends_on references unknown id "plan-01-scaffold"')), 'verbose dependency reference fails lint');
}

section('setPacketStatus — verbose supersession input normalizes to the canonical id');

{
  const workspace = makeFixtureWorkspace([
    { id: 'plan-01', filename: 'plan-01-old-feature', title: 'Old Feature', status: 'complete', resolution: 'done', summary: 'Old.' },
    { id: 'plan-02', filename: 'plan-02-new-feature', title: 'New Feature', status: 'ready', summary: 'New.' },
  ]);

  const result = setPacketStatus('plan-01', 'superseded', {
    supersededBy: 'plan-02-new-feature',
    resolution: 'Replaced by plan-02-new-feature.',
    docsDir: workspace.docsDir,
    readmePath: workspace.readmePath,
    reportsDir: workspace.reportsDir,
  });

  assert(result.ok, 'superseded transition with verbose ID succeeds');
  const afterPacket = fs.readFileSync(path.join(workspace.docsDir, 'plan-01-old-feature.md'), 'utf8');
  eq(parseFrontmatter(afterPacket).superseded_by, 'plan-02', 'verbose supersession input is stored canonically');
}

// ── INDEX markers ────────────────────────────────────────────────────────────

section('INDEX_BEGIN / INDEX_END constants');

{
  assert(INDEX_BEGIN === '<!-- plan-index:begin -->', 'INDEX_BEGIN correct');
  assert(INDEX_END === '<!-- plan-index:end -->', 'INDEX_END correct');
}

// ── Summary ──────────────────────────────────────────────────────────────────

process.stdout.write('\n');
if (failed === 0) {
  process.stdout.write(`plan-status tests: ${passed} passed, 0 failed\n`);
  process.exit(0);
} else {
  process.stdout.write(`plan-status tests: ${passed} passed, ${failed} failed\n`);
  process.stdout.write('\nFailed tests:\n');
  for (const f of failures) process.stdout.write(`  - ${f}\n`);
  process.exit(1);
}
