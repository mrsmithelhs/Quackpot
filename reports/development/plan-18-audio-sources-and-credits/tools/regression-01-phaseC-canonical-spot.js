// Plan 18 final repair: spot check that the UNCHANGED load paths still behave after the migrateStored change.
// Paste into the javascript tool on the audition page. Same iframe technique as phase C; touches only qp18-audition-choices-v1 (removed at the end).
(async function () {
  var KEY = 'qp18-audition-choices-v1', R = [], PAGE = location.href.split('#')[0];
  function rec(n, ok, d) { R.push((ok ? 'PASS ' : 'FAIL ') + n + (d ? ' :: ' + d : '')); }
  function loadFrame() { return new Promise(function (res) { var f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:700px'; f.onload = function () { res(f); }; f.src = PAGE; document.body.appendChild(f); }); }
  var base = { schema: 'qp18-owner-choices', schemaVersion: 1, catalogRevision: '2026-10-28.1', pools: [{ role: 'duck', pool: 'Main', active: false, fileIds: ['qp18-0001'] }, { role: 'duck', pool: 'soft', active: true, fileIds: [] }], shortlistedIds: ['qp18-0001'], rejectedIds: [], notes: { 'qp18-0001': 'n' }, ownerTrimDb: { 'qp18-0001': -6 } };
  var canon = JSON.stringify(base);
  var cases = [
    ['invalid JSON', '{"schema":"qp18-owner-choices","pools":[', true],
    ['foreign schema', '{"schema":"someone-elses-app","data":[1]}', true],
    ['canonical schemaVersion 2', JSON.stringify(Object.assign({}, base, { schemaVersion: 2 })), true],
    ['canonical with fileIds as a string', JSON.stringify(Object.assign({}, base, { pools: [{ role: 'duck', pool: 'Main', active: true, fileIds: 'qp18-0001' }] })), true],
    ['valid canonical', canon, false],
    ['valid canonical, stale revision', JSON.stringify(Object.assign({}, base, { catalogRevision: '2026-09-01.0' })), false]
  ];
  try {
    for (var i = 0; i < cases.length; i++) {
      localStorage.setItem(KEY, cases[i][1]); var f = await loadFrame(), d = f.contentDocument, st = d.getElementById('status'), why = [];
      if (localStorage.getItem(KEY) !== cases[i][1]) why.push('raw changed at load');
      if (cases[i][2]) { if (st.className !== 'err' || !/could not be read/.test(st.textContent)) why.push('no recovery'); d.querySelector('#role-duck .card input[type=checkbox]').click(); if (localStorage.getItem(KEY) !== cases[i][1] || !/Not saved/.test(st.textContent)) why.push('edit changed raw or lacks Not saved'); }
      else { var opts = [].slice.call(d.querySelectorAll('#role-duck select option')).map(function (o) { return o.textContent; }).join('|'); if (opts !== 'Main (1)|soft (0)') why.push('pools ' + opts); if (st.className === 'err') why.push('unexpected error status'); }
      f.remove(); rec(cases[i][0] + (cases[i][2] ? ': preserved + blocked' : ': loads'), !why.length, why.join('; '));
    }
  } catch (e) { rec('harness exception', false, e && (e.stack || e.message)); }
  finally { localStorage.removeItem(KEY); [].slice.call(document.querySelectorAll('iframe')).forEach(function (x) { x.remove(); }); }
  return R.join('\n');
})()
