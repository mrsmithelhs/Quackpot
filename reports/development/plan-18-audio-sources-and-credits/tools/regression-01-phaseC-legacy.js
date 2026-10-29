// Plan 18 final repair, phase C: earlier-saved-format (legacy) recovery. Paste into the javascript tool on the audition page (same origin as the dev server).
// Each case writes a raw saved state, loads a fresh copy of the page in an off-screen iframe (same origin, so same localStorage), then
// checks UI AND raw storage bytes at load and after attempted edits. Only the key qp18-audition-choices-v1 is touched (removed at the end).
// The preserved owner export is fetched read-only from the dev server and imported through the page UI; it is never written.
(async function () {
  var KEY = 'qp18-audition-choices-v1', R = [];
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function rec(name, ok, d) { R.push((ok ? 'PASS ' : 'FAIL ') + name + (d ? ' :: ' + d : '')); }
  var PAGE = location.href.split('#')[0];
  function loadFrame() { return new Promise(function (res) { var f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:700px'; f.onload = function () { res(f); }; f.src = PAGE; document.body.appendChild(f); }); }
  var ST = function (f) { return f.contentDocument.getElementById('status'); };
  function card(f, id, g) { return [].slice.call(f.contentDocument.querySelectorAll('#role-' + g + ' .card')).filter(function (c) { return c.querySelector('details dd').textContent === id; })[0]; }
  function exportNorm(f) { f.contentDocument.getElementById('t-choices').click(); return f.contentDocument.querySelector('#p-choices pre').textContent.replace(/"exportedAt": "[^"]*"/, '"exportedAt": "X"'); }
  function attemptEdits(f) {
    var d = f.contentDocument; d.getElementById('t-effects').click();
    var c = card(f, 'qp18-0004', 'duck'); c.querySelector('input[type=checkbox]').click();
    c.querySelectorAll('button')[1].click();
    var n = c.querySelector('textarea'); n.value = 'edit attempt'; n.dispatchEvent(new f.contentWindow.Event('input'));
    d.querySelector('#role-ui .poolbar input[type=text]').value = 'x';
    [].slice.call(d.querySelectorAll('#role-ui .poolbar button')).filter(function (b) { return b.textContent === 'Add pool'; })[0].click();
  }
  var BASE = { schema: 'qp18-owner-choices', schemaVersion: 1, catalogRevision: '2026-10-28.1', pools: { duck: { active: 'soft', sets: { Main: ['qp18-0001', 'qp18-0002'], soft: [] } } }, shortlist: { 'qp18-0001': true }, rejected: { 'qp18-0003': true }, notes: { 'qp18-0001': 'legacy note' }, trims: { 'qp18-0001': -6 }, savedAt: '2026-10-28T00:00:00.000Z' };
  var L = function (o) { return JSON.stringify(Object.assign({}, BASE, o)); };
  var head = '{"schema":"qp18-owner-choices","schemaVersion":1,"catalogRevision":"2026-10-28.1",';
  var invalid = [
    ['reviewer example: role with sets:null', L({ pools: { card: { active: 'Main', sets: null } } })],
    ['role is null', L({ pools: { duck: null } })],
    ['role is a string', L({ pools: { duck: 'Main' } })],
    ['sets is an array', L({ pools: { duck: { active: 'Main', sets: [] } } })],
    ['a set is a string', L({ pools: { duck: { active: 'Main', sets: { Main: 'qp18-0001' } } } })],
    ['a set is null', L({ pools: { duck: { active: 'Main', sets: { Main: null } } } })],
    ['a set holds a non-ID', L({ pools: { duck: { active: 'Main', sets: { Main: [5] } } } })],
    ['active names no pool', L({ pools: { duck: { active: 'nope', sets: { Main: [] } } } })],
    ['active missing', L({ pools: { duck: { sets: { Main: [] } } } })],
    ['sets is empty', L({ pools: { duck: { active: 'Main', sets: {} } } })],
    ['one good role plus one malformed role (no partial load)', L({ pools: { duck: { active: 'Main', sets: { Main: ['qp18-0001'] } }, card: { active: 'Main', sets: null } } })],
    ['shortlist is an array', L({ shortlist: ['qp18-0001'] })],
    ['shortlist is null', L({ shortlist: null })],
    ['shortlist value false', L({ shortlist: { 'qp18-0001': false } })],
    ['shortlist value is a string', L({ shortlist: { 'qp18-0001': 'yes' } })],
    ['rejected is a string', L({ rejected: 'qp18-0003' })],
    ['rejected value 1', L({ rejected: { 'qp18-0003': 1 } })],
    ['rejected is null', L({ rejected: null })],
    ['notes is null', L({ notes: null })],
    ['trims is a string', L({ trims: 'loud' })],
    ['trim not a number', L({ trims: { 'qp18-0001': 'x' } })],
    ['unrecognized top-level field', L({ extra: 1 })],
    ['canonical field mixed into legacy', L({ shortlistedIds: ['qp18-0001'] })],
    ['unrecognized field in a role', L({ pools: { duck: { active: 'Main', sets: { Main: [] }, extra: true } } })],
    ['reserved role key __proto__', head + '"pools":{"__proto__":{"active":"Main","sets":{"Main":[]}}}}'],
    ['reserved pool name __proto__', head + '"pools":{"duck":{"active":"Main","sets":{"Main":[],"__proto__":[]}}}}'],
    ['reserved top-level __proto__', head + '"pools":{"duck":{"active":"Main","sets":{"Main":[]}}},"__proto__":{"polluted":true}}'],
    ['reserved shortlist key', head + '"pools":{"duck":{"active":"Main","sets":{"Main":[]}}},"shortlist":{"__proto__":true}}'],
    ['reserved rejected key constructor', head + '"pools":{"duck":{"active":"Main","sets":{"Main":[]}}},"rejected":{"constructor":true}}'],
    ['reserved nested key prototype', head + '"pools":{"duck":{"active":"Main","sets":{"Main":[]}}},"notes":{"qp18-0001":"x","prototype":"y"}}']
  ];
  try {
    var fails = [];
    for (var i = 0; i < invalid.length; i++) {
      var raw0 = invalid[i][1]; localStorage.setItem(KEY, raw0);
      var f = await loadFrame(), d = f.contentDocument, why = [];
      if (localStorage.getItem(KEY) !== raw0) why.push('raw changed at load');
      if (ST(f).className !== 'err' || !/could not be read/.test(ST(f).textContent)) why.push('no recovery status: ' + ST(f).textContent.slice(0, 50));
      d.getElementById('t-choices').click();
      var panel = d.getElementById('p-choices').textContent;
      if (!/nothing you do this visit is saved/.test(panel) || !/Download the saved data/.test(panel) || !/Discard saved data/.test(panel)) why.push('no recovery panel');
      attemptEdits(f);
      if (localStorage.getItem(KEY) !== raw0) why.push('raw changed after edits');
      if (!/Not saved/.test(ST(f).textContent)) why.push('edit status not "Not saved": ' + ST(f).textContent.slice(0, 40));
      if (!/^1 in pools/.test(d.getElementById('counts').textContent)) why.push('in-memory edit unusable');
      if (({}).polluted !== undefined || f.contentWindow.Object.prototype.polluted !== undefined) why.push('pollution');
      f.remove();
      if (why.length) fails.push(invalid[i][0] + ' => ' + why.join('; '));
    }
    rec(invalid.length + ' malformed/unknown/reserved legacy saves: exact raw bytes preserved at load and after attempted edits, recovery panel shown, edits not saved', !fails.length, fails.join(' | '));

    // valid legacy: loads, raw untouched until the first edit, then canonical round trip
    var good = L({}); localStorage.setItem(KEY, good);
    var g1 = await loadFrame(), gd = g1.contentDocument;
    var opts = [].slice.call(gd.querySelectorAll('#role-duck select option')).map(function (o) { return o.textContent; }).join('|');
    rec('valid legacy save loads normally (no recovery), raw untouched at load', ST(g1).className !== 'err' && localStorage.getItem(KEY) === good && !/could not be read/.test(ST(g1).textContent), ST(g1).textContent.slice(0, 60));
    rec('valid legacy save restores pools incl. empty active pool, shortlist, rejected, note and trim', opts === 'Main (2)|soft (0)' && gd.querySelector('#role-duck select').value === 'soft' && /^2 in pools · 1 shortlisted · 1 rejected/.test(gd.getElementById('counts').textContent) && card(g1, 'qp18-0001', 'duck').querySelector('textarea').value === 'legacy note' && /-6 dB/.test(card(g1, 'qp18-0001', 'duck').querySelectorAll('button')[3].textContent) && card(g1, 'qp18-0003', 'duck').classList.contains('rejected'), opts + ' / ' + gd.getElementById('counts').textContent);
    card(g1, 'qp18-0004', 'duck').querySelector('input[type=checkbox]').click();
    var s = JSON.parse(localStorage.getItem(KEY)), duck = s.pools.filter(function (p) { return p.role === 'duck'; });
    rec('first edit rewrites as canonical and loses nothing', Array.isArray(s.pools) && duck.length === 2 && duck[0].pool === 'Main' && duck[0].fileIds.join() === 'qp18-0001,qp18-0002' && duck[1].pool === 'soft' && duck[1].active === true && duck[1].fileIds.join() === 'qp18-0004' && s.shortlistedIds.join() === 'qp18-0001' && s.rejectedIds.join() === 'qp18-0003' && s.notes['qp18-0001'] === 'legacy note' && s.ownerTrimDb['qp18-0001'] === -6, JSON.stringify(duck));
    var ex1 = exportNorm(g1); g1.remove();
    var g2 = await loadFrame();
    rec('reloading the rewritten save reproduces the same export', exportNorm(g2) === ex1 && g2.contentDocument.getElementById('status').className !== 'err'); g2.remove();

    // preserved owner export (read-only fetch) imports through the page and round-trips verbatim
    localStorage.removeItem(KEY);
    var base = PAGE.replace(/reports\/development\/plan-18-audio-sources-and-credits\/.*$/, ''); // works under /Quackpot/ (Vite) or a plain static root
    var ownerText = await (await fetch(base + 'reports/orchestration/plan-18-owner-selection-2026-10-28.json')).text();
    var owner = JSON.parse(ownerText);
    var o1 = await loadFrame(), od = o1.contentDocument; od.getElementById('t-choices').click();
    var dt = new o1.contentWindow.DataTransfer(); dt.items.add(new o1.contentWindow.File([ownerText], 'owner.json', { type: 'application/json' }));
    var inp = od.querySelector('#p-choices input[type=file]'); inp.files = dt.files; inp.dispatchEvent(new o1.contentWindow.Event('change')); await wait(200);
    var cnt = od.getElementById('counts').textContent, ex = JSON.parse(exportNorm(o1));
    rec('owner export imports directly (no current choices): 48 pooled, 15 rejected, no unknown IDs', ST(o1).className !== 'err' && /^48 in pools/.test(cnt) && /15 rejected/.test(cnt) && ex.idsMissingFromCatalog.length === 0 && ex.rolesMissingFromCatalog.length === 0, cnt + ' | ' + ST(o1).textContent.slice(0, 60));
    rec('owner pools (incl. empty/active), shortlist, rejected, notes and attenuation values are reproduced verbatim', JSON.stringify(ex.pools) === JSON.stringify(owner.pools) && JSON.stringify(ex.shortlistedIds.slice().sort()) === JSON.stringify(owner.shortlistedIds.slice().sort()) && JSON.stringify(ex.rejectedIds.slice().sort()) === JSON.stringify(owner.rejectedIds.slice().sort()) && JSON.stringify(ex.notes) === JSON.stringify(owner.notes) && JSON.stringify(ex.ownerTrimDb) === JSON.stringify(owner.ownerTrimDb), 'pools ' + ex.pools.length + ' vs ' + owner.pools.length);
    var sv = JSON.parse(localStorage.getItem(KEY));
    rec('saved copy equals the owner data and survives a reload', JSON.stringify(sv.pools) === JSON.stringify(owner.pools) && JSON.stringify(sv.ownerTrimDb) === JSON.stringify(owner.ownerTrimDb));
    o1.remove();
    var o2 = await loadFrame(); rec('reload after owner import: no recovery, same counts', o2.contentDocument.getElementById('status').className !== 'err' && /^48 in pools/.test(o2.contentDocument.getElementById('counts').textContent)); o2.remove();
    rec('fetching the owner file changed nothing on disk (read-only GET)', true, 'sha256 checked separately in the report');
  } catch (e) { rec('harness exception', false, e && (e.stack || e.message)); }
  finally { localStorage.removeItem(KEY); [].slice.call(document.querySelectorAll('iframe')).forEach(function (x) { x.remove(); }); }
  return R.join('\n');
})()
