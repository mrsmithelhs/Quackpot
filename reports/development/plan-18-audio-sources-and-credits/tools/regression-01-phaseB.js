// Plan 18 repair 01 regression, phase B: saved-state preservation across reloads (staged via sessionStorage key qp18t-stage / qp18t-expect).
// Run this same script, then navigate/reload the page, and run it again until it reports DONE. Touches only qp18-audition-choices-v1 and qp18t-*.
(async function () {
  var KEY = 'qp18-audition-choices-v1', R = [], $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function rec(name, ok, d) { R.push((ok ? 'PASS ' : 'FAIL ') + name + (d ? ' :: ' + d : '')); }
  var raw = function () { return localStorage.getItem(KEY); };
  var tab = function (n) { $('#t-' + n).click(); };
  var status = function () { return $('#status').textContent; };
  function btn(re) { return $$('#p-choices button').filter(function (b) { return re.test(b.textContent); })[0]; }
  function card(id, g) { return $$('#role-' + g + ' .card').filter(function (c) { return c.querySelector('details dd').textContent === id; })[0]; }
  function mk(o) { return JSON.stringify(Object.assign({ schema: 'qp18-owner-choices', schemaVersion: 1, catalogRevision: '2026-10-28.1', pools: [], shortlistedIds: [], rejectedIds: [], notes: {}, ownerTrimDb: {} }, o)); }
  async function imp(text) { tab('choices'); var dt = new DataTransfer(); dt.items.add(new File([text], 't.json', { type: 'application/json' })); var i = $('#p-choices input[type=file]'); i.files = dt.files; i.dispatchEvent(new Event('change')); await wait(150); }
  var stage = sessionStorage.getItem('qp18t-stage'), exp = sessionStorage.getItem('qp18t-expect');
  function next(st, rawText) { sessionStorage.setItem('qp18t-stage', st); sessionStorage.setItem('qp18t-expect', rawText); localStorage.setItem(KEY, rawText); }
  var origSet = Storage.prototype.setItem;
  async function blockedChecks(label) {
    var s0 = status(), cls0 = $('#status').className;
    rec(label + ': saved raw untouched at load', raw() === exp);
    rec(label + ': load status is an error saying saved choices are preserved/unreadable', cls0 === 'err' && /could not be read/.test(s0), s0.slice(0, 90));
    tab('effects'); card('qp18-0001', 'duck').querySelector('input[type=checkbox]').click();
    card('qp18-0001', 'duck').querySelectorAll('button')[1].click();
    var n = card('qp18-0001', 'duck').querySelector('textarea'); n.value = 'edit while blocked'; n.dispatchEvent(new Event('input'));
    $('#role-duck .poolbar input[type=text]').value = 'x'; $$('#role-duck .poolbar button').filter(function (b) { return b.textContent === 'Add pool'; })[0].click();
    rec(label + ': edits do not overwrite the preserved bytes', raw() === exp);
    rec(label + ': status says Not saved (error)', /Not saved/.test(status()) && $('#status').className === 'err', status().slice(0, 80));
    rec(label + ': page still usable in memory', /^1 in pools/.test($('#counts').textContent), $('#counts').textContent);
    tab('choices');
    rec(label + ': recovery banner offers download and discard', !!btn(/Download the saved data/) && !!btn(/Discard saved data/) && /nothing you do this visit is saved/.test($('#p-choices').textContent));
  }
  try {
    if (!stage) {
      next('1', '{"schema":"qp18-owner-choices","pools":[');
      return 'SETUP: stage 1 prepared (invalid JSON saved). Reload the page and run this script again.';
    }
    if (stage === '1') { await blockedChecks('invalid JSON'); next('2', '{"schema":"someone-elses-app","data":[1,2,3]}'); return R.join('\n') + '\nNEXT: reload; stage 2 (foreign schema).'; }
    if (stage === '2') { await blockedChecks('foreign schema'); next('3', JSON.stringify({ schema: 'qp18-owner-choices', schemaVersion: 2, catalogRevision: '2026-10-28.1', pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: ['qp18-0001'] }] })); return R.join('\n') + '\nNEXT: reload; stage 3 (unsupported version + recovery import).'; }
    if (stage === '3') {
      await blockedChecks('unsupported schemaVersion');
      var V = mk({ pools: [{ role: 'ui', pool: 'Main', active: true, fileIds: ['qp18-0016'] }] });
      await imp('{"bad":'); rec('invalid import while blocked leaves raw untouched', raw() === exp && /Import rejected/.test(status()));
      await imp(V);
      rec('valid import while blocked requires confirmation and warns it overwrites unreadable data', /overwrite the unreadable saved data/.test($('#p-choices').textContent) && raw() === exp);
      btn(/Cancel import/).click(); rec('cancel keeps preserved bytes', raw() === exp);
      await imp(V); Storage.prototype.setItem = function () { throw new DOMException('q', 'QuotaExceededError'); }; btn(/Replace current choices/).click(); await wait(80); Storage.prototype.setItem = origSet;
      rec('storage error during recovery import: not applied, preserved bytes intact', raw() === exp && /Import NOT applied/.test(status()) && !!btn(/Download the saved data/));
      await imp(V); btn(/Replace current choices/).click(); await wait(80);
      var saved = JSON.parse(raw());
      rec('confirmed recovery import writes canonical data and re-enables saving', saved.pools[0].fileIds[0] === 'qp18-0016' && !$('#p-choices').textContent.match(/nothing you do this visit is saved/));
      tab('effects'); card('qp18-0016', 'ui').querySelectorAll('button')[1].click(); rec('saving works again after recovery', JSON.parse(raw()).shortlistedIds.indexOf('qp18-0016') >= 0);
      next('4', JSON.stringify({ schema: 'qp18-owner-choices', schemaVersion: 1, catalogRevision: '2026-09-01.0', pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: ['qp18-0001', 'qp18-9999'] }], shortlistedIds: [], rejectedIds: [], notes: {}, ownerTrimDb: {} }));
      return R.join('\n') + '\nNEXT: reload; stage 4 (stale revision + mark reviewed).';
    }
    if (stage === '4') {
      rec('stale: raw untouched at load', raw() === exp); tab('choices');
      rec('stale: notice shown, nothing reset', /saved against catalog revision 2026-09-01\.0/.test($('#p-choices').textContent) && /^1 in pools|^2 in pools/.test($('#counts').textContent), $('#counts').textContent);
      Storage.prototype.setItem = function () { throw new DOMException('q', 'QuotaExceededError'); };
      btn(/Mark reviewed/).click(); await wait(60); Storage.prototype.setItem = origSet;
      rec('mark reviewed with failing storage: not claimed, raw unchanged, notice stays', /Not marked reviewed/.test(status()) && $('#status').className === 'err' && raw() === exp && !!btn(/Mark reviewed/) && !/marked as reviewed for the current catalog and saved/.test(status()), status().slice(0, 90));
      btn(/Mark reviewed/).click(); await wait(60);
      var s = JSON.parse(raw());
      rec('mark reviewed with working storage saves the new revision and keeps the unknown ID', s.catalogRevision === '2026-10-28.1' && s.pools[0].fileIds.indexOf('qp18-9999') >= 0 && !btn(/Mark reviewed/) && /qp18-9999/.test($('#p-choices').textContent));
      next('5', '{"schema":"qp18-owner-choices","schemaVersion":1,"catalogRevision":"2026-10-28.1","pools":{"duck":{"active":"Main","sets":{"Main":["qp18-0001","qp18-0002"],"soft":[]}}},"shortlist":{"qp18-0001":true},"rejected":{},"notes":{"qp18-0001":"legacy"},"trims":{}}');
      return R.join('\n') + '\nNEXT: reload; stage 5 (earlier saved format).';
    }
    if (stage === '5') {
      rec('legacy saved format: loaded without rewriting raw', raw() === exp);
      tab('effects'); var opts = $$('#role-duck select option').map(function (o) { return o.textContent; }).join('|');
      rec('legacy saved format: pools, empty pool, shortlist and note restored', opts === 'Main (2)|soft (0)' && /^2 in pools · 1 shortlisted/.test($('#counts').textContent) && card('qp18-0001', 'duck').querySelector('textarea').value === 'legacy', opts + ' / ' + $('#counts').textContent);
      card('qp18-0003', 'duck').querySelector('input[type=checkbox]').click();
      var s2 = JSON.parse(raw());
      rec('first edit rewrites it as the canonical array form with the empty pool kept', Array.isArray(s2.pools) && s2.pools.length === 2 && s2.pools[1].pool === 'soft' && s2.pools[1].fileIds.length === 0 && s2.pools[0].fileIds.length === 3 && s2.notes['qp18-0001'] === 'legacy');
      localStorage.removeItem(KEY); sessionStorage.removeItem('qp18t-stage'); sessionStorage.removeItem('qp18t-expect');
      return R.join('\n') + '\nDONE (test keys removed).';
    }
    return 'unknown stage ' + stage;
  } catch (e) { Storage.prototype.setItem = origSet; return R.join('\n') + '\nHARNESS EXCEPTION: ' + (e && (e.stack || e.message)); }
})()
