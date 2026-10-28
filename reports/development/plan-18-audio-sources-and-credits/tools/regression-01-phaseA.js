// Plan 18 repair 01 regression, phase A (in-page; paste into the browser console or the javascript tool on the audition page).
// Drives the real UI (import via the file input, clicks) and compares UI state AND raw localStorage before/after.
// Touches only the key qp18-audition-choices-v1 and temporarily patches Storage.prototype.setItem (restored in finally).
(async function () {
  var KEY = 'qp18-audition-choices-v1', R = [], $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function rec(name, ok, d) { R.push((ok ? 'PASS ' : 'FAIL ') + name + (d ? ' :: ' + d : '')); }
  var raw = function () { return localStorage.getItem(KEY); };
  var tab = function (n) { $('#t-' + n).click(); };
  var status = function () { return $('#status').textContent; };
  function preNorm() { tab('choices'); return $('#p-choices pre').textContent.replace(/"exportedAt": "[^"]*"/, '"exportedAt": "X"'); }
  function snap() { var p = preNorm(); return { raw: raw(), pre: p, counts: $('#counts').textContent, panel: !!$$('#p-choices .notice.warn').filter(function (n) { return /Replace your current choices/.test(n.textContent); }).length }; }
  function same(a, b) { return a.raw === b.raw && a.pre === b.pre && a.counts === b.counts; }
  async function imp(text) { tab('choices'); var dt = new DataTransfer(); dt.items.add(new File([text], 't.json', { type: 'application/json' })); var i = $('#p-choices input[type=file]'); i.files = dt.files; i.dispatchEvent(new Event('change')); await wait(150); }
  function btn(re) { return $$('#p-choices button').filter(function (b) { return re.test(b.textContent); })[0]; }
  async function clearAll() { tab('choices'); btn(/Clear all/).click(); btn(/Really clear/).click(); await wait(60); }
  function card(id, g) { return $$('#role-' + g + ' .card').filter(function (c) { return c.querySelector('details dd').textContent === id; })[0]; }
  function tick(id, g) { card(id, g).querySelector('input[type=checkbox]').click(); }
  function mk(o) { return JSON.stringify(Object.assign({ schema: 'qp18-owner-choices', schemaVersion: 1, catalogRevision: '2026-10-28.1', pools: [], shortlistedIds: [], rejectedIds: [], notes: {}, ownerTrimDb: {} }, o)); }
  var origSet = Storage.prototype.setItem;
  try {
    await clearAll(); tab('effects');
    rec('start clean: storage empty', raw() === null);

    // 1. exact empty active pool round-trip (and removing the last sound keeps the pools)
    tick('qp18-0001', 'duck'); $('#role-duck .poolbar input[type=text]').value = 'soft';
    $$('#role-duck .poolbar button').filter(function (b) { return b.textContent === 'Add pool'; })[0].click();
    card('qp18-0001', 'duck').querySelectorAll('button')[2].click(); // reject last pooled sound
    var before = snap(); var ex = JSON.parse(before.pre);
    var duck = ex.pools.filter(function (p) { return p.role === 'duck'; });
    rec('export keeps empty Main and empty active "soft"', duck.length === 2 && duck.some(function (p) { return p.pool === 'Main' && p.fileIds.length === 0 && !p.active; }) && duck.some(function (p) { return p.pool === 'soft' && p.fileIds.length === 0 && p.active; }), JSON.stringify(duck));
    rec('untouched purposes are not exported as noise', ex.pools.every(function (p) { return p.role === 'duck'; }));
    var exportText = $('#p-choices pre').textContent;
    await clearAll(); rec('clear removes raw storage', raw() === null);
    await imp(exportText); tab('effects');
    var sel = $('#role-duck select');
    rec('import restores empty pools and active selection', sel.value === 'soft' && sel.options.length === 2 && $$('#role-duck select option').map(function (o) { return o.textContent; }).join('|') === 'Main (0)|soft (0)', $$('#role-duck select option').map(function (o) { return o.textContent; }).join('|') + ' active=' + sel.value);
    rec('round trip is exact (export text equal, ignoring exportedAt)', preNorm() === before.pre);
    var saved = JSON.parse(raw()); rec('raw storage holds the same pools', JSON.stringify(saved.pools) === JSON.stringify(ex.pools));

    // 2. a valid earlier-format export still imports (no current choices => applies directly)
    await clearAll();
    var old = mk({ currentCatalogRevision: '2026-10-28.1', exportedAt: 'x', note: 'n', pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: ['qp18-0001', 'qp18-0002'] }], shortlistedIds: ['qp18-0001'], rejectedIds: ['qp18-0003'], notes: { 'qp18-0001': 'dry' }, ownerTrimDb: { 'qp18-0001': -6 }, files: {}, idsMissingFromCatalog: [] });
    await imp(old);
    var s0 = snap();
    rec('valid earlier-format export imports and saves', /^2 in pools · 1 shortlisted · 1 rejected/.test($('#counts').textContent) && JSON.parse(raw()).notes['qp18-0001'] === 'dry' && /Imported choices/.test(status()), $('#counts').textContent);

    // 3. invalid imports leave UI AND raw storage untouched
    var rawBefore = raw();
    var bad = [
      ['fileIds is a string', mk({ pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: 'qp18-0001' }] })],
      ['unsupported schemaVersion', mk({ schemaVersion: 2 })],
      ['schemaVersion missing', JSON.stringify({ schema: 'qp18-owner-choices', pools: [] })],
      ['foreign schema', JSON.stringify({ schema: 'other', schemaVersion: 1 })],
      ['not JSON', '{"schema":'],
      ['reserved pool name __proto__', mk({ pools: [{ role: 'duck', pool: '__proto__', active: true, fileIds: [] }] })],
      ['reserved pool name constructor', mk({ pools: [{ role: 'duck', pool: 'constructor', active: true, fileIds: [] }] })],
      ['reserved role id', mk({ pools: [{ role: '__proto__', pool: 'Main', active: true, fileIds: [] }] })],
      ['reserved notes key', '{"schema":"qp18-owner-choices","schemaVersion":1,"catalogRevision":"2026-10-28.1","notes":{"__proto__":"x"}}'],
      ['reserved key at top level with payload', '{"schema":"qp18-owner-choices","schemaVersion":1,"catalogRevision":"2026-10-28.1","__proto__":{"polluted":true},"pools":[]}'],
      ['reserved key nested in a pool record', '{"schema":"qp18-owner-choices","schemaVersion":1,"catalogRevision":"2026-10-28.1","pools":[{"role":"duck","pool":"Main","active":true,"fileIds":[],"constructor":{"x":1}}]}'],
      ['trim is a string', mk({ ownerTrimDb: { 'qp18-0001': 'loud' } })],
      ['trim out of range', mk({ ownerTrimDb: { 'qp18-0001': -40 } })],
      ['trim not finite (1e999)', '{"schema":"qp18-owner-choices","schemaVersion":1,"catalogRevision":"2026-10-28.1","ownerTrimDb":{"qp18-0001":1e999}}'],
      ['trim positive (would amplify)', mk({ ownerTrimDb: { 'qp18-0001': 6 } })],
      ['duplicate pool record', mk({ pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: [] }, { role: 'duck', pool: 'Main', active: false, fileIds: [] }] })],
      ['two active pools in one purpose', mk({ pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: [] }, { role: 'duck', pool: 'b', active: true, fileIds: [] }] })],
      ['duplicate file id in a pool', mk({ pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: ['qp18-0001', 'qp18-0001'] }] })],
      ['invalid file id with spaces', mk({ shortlistedIds: ['not an id'] })],
      ['rejected and pooled conflict', mk({ pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: ['qp18-0001'] }], rejectedIds: ['qp18-0001'] })],
      ['pool name with leading space', mk({ pools: [{ role: 'duck', pool: ' x', active: true, fileIds: [] }] })],
      ['note is not a string', mk({ notes: { 'qp18-0001': 5 } })]
    ];
    var badFail = [];
    for (var i = 0; i < bad.length; i++) {
      await imp(bad[i][1]); var a = snap();
      var ok = same(a, s0) && !a.panel && /Import rejected; nothing was changed/.test(status()) && !/Import failed/.test(status());
      if (!ok) badFail.push(bad[i][0] + ' => ' + status().slice(0, 90));
    }
    rec('all ' + bad.length + ' invalid imports rejected with UI and raw storage unchanged', !badFail.length, badFail.join(' ; '));
    rec('raw bytes identical after all rejected imports', raw() === rawBefore);
    rec('no prototype pollution', ({}).polluted === undefined && Object.prototype.polluted === undefined);

    // 4. cancelled valid replacement
    var V = mk({ pools: [{ role: 'ui', pool: 'Main', active: true, fileIds: ['qp18-0016'] }], shortlistedIds: ['qp18-0017'] });
    await imp(V); var p1 = snap();
    rec('valid import over existing choices waits for confirmation', p1.panel && same({ raw: p1.raw, pre: s0.pre, counts: p1.counts }, s0) && p1.raw === s0.raw && /NOT applied yet/.test(status()), 'panel=' + p1.panel);
    rec('state unchanged while pending (counts and raw)', p1.counts === s0.counts && p1.raw === s0.raw);
    btn(/Cancel import/).click(); await wait(50); var p2 = snap();
    rec('cancel leaves UI and raw unchanged and clears the panel', same(p2, s0) && !p2.panel && /cancelled/.test(status()));
    await imp(V); btn(/Replace current choices/).click(); await wait(80); var p3 = snap();
    rec('confirmed replace applies and persists', /^1 in pools · 1 shortlisted · 0 rejected/.test($('#counts').textContent) && JSON.parse(raw()).pools[0].fileIds[0] === 'qp18-0016' && /Imported choices/.test(status()), $('#counts').textContent);

    // 5. storage errors during import
    var s1 = snap(); var W = mk({ pools: [{ role: 'crowd', pool: 'Main', active: true, fileIds: ['qp18-0041'] }] });
    Storage.prototype.setItem = function () { throw new DOMException('quota', 'QuotaExceededError'); };
    await imp(W); btn(/Replace current choices/).click(); await wait(80); var e1 = snap();
    rec('import with failing storage is NOT applied; UI and raw unchanged; no "Import failed" wording', same(e1, s1) && /Import NOT applied/.test(status()) && !/Import failed/.test(status()) && !e1.panel, status().slice(0, 100));
    Storage.prototype.setItem = origSet;

    // 6. failed random playback is never labelled Played
    await clearAll(); tab('effects'); tick('qp18-0016', 'ui');
    var f = window.QP18_CATALOG.files.filter(function (x) { return x.id === 'qp18-0016'; })[0], keep = f.local.path; f.local.path = 'audio/ui/does-not-exist.wav';
    var out = $('#role-ui .poolbar .grow'); $$('#role-ui .poolbar button').filter(function (b) { return /Preview random/.test(b.textContent); })[0].click();
    var t0 = out.textContent; await wait(700); var t1 = out.textContent;
    rec('preview says Requested first, never "Played"', /^Requested from pool/.test(t0) && !/Played/.test(t0 + t1), t0.slice(0, 60));
    rec('failed playback reports the failure and the error class', /Could not play from pool/.test(t1) && out.className.indexOf('err') >= 0 && $('#status').className === 'err', t1.slice(0, 110));
    f.local.path = keep;
    $$('#role-ui .poolbar button').filter(function (b) { return /Preview random/.test(b.textContent); })[0].click(); await wait(700); var t2 = out.textContent;
    rec('working file: wording is "Playback started" (or an honest block message), never "Played"', /Playback started from pool|Finished:|Could not play from pool|Stopped:/.test(t2) && !/Played/.test(t2), t2.slice(0, 100));
    $('#stopAll').click();

    // 7. both music credit records
    tab('credits'); var cm = $$('#p-credits details[data-credit]'); var txt = cm.map(function (d) { return d.textContent; }).join(' || ');
    rec('Credits tab lists both music records with creator, source, exact license, credit and changes',
      cm.length === 2 && /omfgdude/.test(txt) && /qubodup/.test(txt) && /CC0/.test(txt) && /Kevin MacLeod/.test(txt) && /CC BY 3\.0|CC BY 3\.0 Unported|Creative Commons Attribution 3\.0 Unported/.test(txt) && /No changes/.test(txt) && cm.every(function (d) { return d.querySelectorAll('a[href^="https://creativecommons.org/"]').length === 1 && d.querySelectorAll('a').length === 2; }), 'records=' + cm.length);
    rec('Credits tab still lists all 63 effects', $$('#p-credits details:not([data-credit])').length === 63);
    await clearAll();
  } catch (e) { rec('harness exception', false, e && (e.stack || e.message)); }
  finally { Storage.prototype.setItem = origSet; }
  return R.join('\n');
})()
