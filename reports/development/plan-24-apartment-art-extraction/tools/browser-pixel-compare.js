// Review tool (NOT runtime): numeric pixel comparison for gallery.html, run inside the gallery page (same origin).
// Load with:  (0, eval)(await (await fetch('tools/browser-pixel-compare.js')).text())   — then use window.__plan24.
//
// What it does: serialises the baseline's live `#stage` (from the unchanged Plan 10 iframe, with that page's own CSS) and
// the kit's `#kitStage` (with the gallery CSS) into SVG <foreignObject> images, rasterises both with the same browser at the
// baseline's measured stage size, and reports per-pixel differences (max channel delta). It drives the gallery's own
// controls, so each case is the same area/framing/light/duck/furnishing state on both sides.
// Limits: it measures the browser's foreignObject raster of the DOM, not the on-screen paint; it ignores the 0.2 s fade
// (the serialised copy has no transition). Timers are used instead of requestAnimationFrame so it also runs in a hidden pane.
(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ser = new XMLSerializer();
  async function raster(markup, css, W, H) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;height:${H}px;margin:0;background:#fff"><style>${css}</style>${markup}</div></foreignObject></svg>`;
    const img = new Image();
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = () => bad(new Error('raster image failed to load')); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    return x.getImageData(0, 0, W, H);
  }
  const frameDoc = () => document.querySelector('#baseClip iframe').contentDocument;
  async function set(k, v) {
    const s = document.querySelector(`#cmpControls select[data-k="${k}"]`); if (String(s.value) === String(v)) return;
    s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); await sleep(k === 'width' ? 1800 : 350);
  }
  /** Measure the current gallery state. `keep` stores both images on window.__plan24.last for display. */
  async function measure(keep) {
    const d = frameDoc(), bcss = [...d.querySelectorAll('style')].map(s => s.textContent).join('\n'), gcss = [...document.querySelectorAll('head style')].map(s => s.textContent).join('\n');
    const st = d.querySelector('#stage').getBoundingClientRect(), W = Math.round(st.width), H = Math.round(st.height);
    const a = await raster(ser.serializeToString(d.querySelector('#stage')), bcss, W, H), b = await raster(ser.serializeToString(document.getElementById('kitStage')), gcss, W, H);
    const n = W * H; let sum = 0, c8 = 0, c24 = 0, mx = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, mean = 0;
    for (let i = 0, p = 0; i < a.data.length; i += 4, p++) {
      const dd = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
      sum += dd; mean += a.data[i]; if (dd > 8) c8++; if (dd > mx) mx = dd;
      if (dd > 24) { c24++; const x = p % W, y = (p / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    let v = 0; const m = mean / n; for (let i = 0; i < a.data.length; i += 4) v += (a.data[i] - m) ** 2;
    if (keep) window.__plan24.last = { a, b };
    return { W, H, mean: +(sum / n).toFixed(2), p8: +(100 * c8 / n).toFixed(3), p24: +(100 * c24 / n).toFixed(3), max: mx, bbox24: c24 ? [x0, y0, x1, y1] : null, contentSd: +Math.sqrt(v / n).toFixed(1) };
  }
  const rows = [];
  async function run(o, keep) {
    const s = { area: 'living', framing: 'wide', light: 'neutral', duckView: 'side', couch: 'present', tv: 'present', ...o };
    for (const k of ['area', 'framing', 'light', 'duckView', 'couch', 'tv']) await set(k, s[k]);
    await sleep(150); const r = { ...s, ...(await measure(keep)) }; rows.push(r); return r;
  }
  const fmt = r => `${r.area}/${r.framing}/${r.light}/${r.duckView}/c${r.couch[0]}t${r.tv[0]} ${r.W}x${r.H} mean${r.mean} p8=${r.p8} p24=${r.p24} max${r.max}${r.bbox24 ? ' bb' + r.bbox24.join(',') : ''} sd${r.contentSd}`;
  /** Draw a stored image pair (and their difference, amplified x4) at the top-left of the page for a screenshot. */
  function show(scale = 0.33) {
    document.getElementById('p24show')?.remove(); const { a, b } = window.__plan24.last; const box = document.createElement('div'); box.id = 'p24show';
    box.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#000;padding:2px;display:flex;gap:2px;flex-wrap:wrap;width:100vw';
    const diff = new ImageData(a.width, a.height); for (let i = 0; i < a.data.length; i += 4) { for (let c = 0; c < 3; c++) diff.data[i + c] = Math.min(255, Math.abs(a.data[i + c] - b.data[i + c]) * 4); diff.data[i + 3] = 255; }
    for (const im of [a, b, diff]) { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').putImageData(im, 0, 0); c.style.cssText = `width:${Math.round(im.width * scale)}px;height:${Math.round(im.height * scale)}px`; box.append(c); }
    document.body.append(box);
  }
  /**
   * Host-mode check: the kit rendered with overlay:'none', placed in a clone of the baseline's own stage, with the baseline's
   * `.lighting` div driven by the returned `lighting` hints (--px/--py/--rx/--ry) and the baseline's own CSS, compared with the
   * unmodified baseline stage. Near-zero difference shows the hints are sufficient to reproduce the original page lighting.
   */
  async function hostMode(o) {
    const mod = await import(/* @vite-ignore */ new URL('../../../src/assets/apartment/index.mjs', location.href).href);   // gallery.html sits three levels below the repo root
    const s = { area: 'living', framing: 'wide', light: 'warm', duckView: 'side', couch: 'present', tv: 'present', ...o };
    for (const k of ['area', 'framing', 'light', 'duckView', 'couch', 'tv']) await set(k, s[k]);
    await sleep(200);
    const d = frameDoc(), bcss = [...d.querySelectorAll('style')].map(x => x.textContent).join('\n'), st = d.querySelector('#stage'), r = st.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height);
    const res = mod.renderScene({ area: s.area, idPrefix: 'hm', framing: s.framing, light: s.light, duckView: s.duckView, furnishings: { couch: s.couch, tv: s.tv }, overlay: 'none' });
    const clone = st.cloneNode(true); clone.querySelector('#desk-layer').innerHTML = res.svg;
    const lt = clone.querySelector('.lighting'); lt.removeAttribute('style'); const L = res.lighting;
    if (L.center) { lt.style.setProperty('--px', L.center.x + '%'); lt.style.setProperty('--py', L.center.y + '%'); }
    if (L.rx != null) { lt.style.setProperty('--rx', L.rx + '%'); lt.style.setProperty('--ry', L.ry + '%'); }
    const a = await raster(ser.serializeToString(st), bcss, W, H), b = await raster(ser.serializeToString(clone), bcss, W, H);
    let sum = 0, mx = 0, c24 = 0; for (let i = 0; i < a.data.length; i += 4) { const dd = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])); sum += dd; if (dd > mx) mx = dd; if (dd > 24) c24++; }
    return `host-mode ${s.area}/${s.framing}/${s.light} ${W}x${H} hints=${JSON.stringify(L)} mean${(sum / (W * H)).toFixed(2)} max${mx} p24=${(100 * c24 / (W * H)).toFixed(3)}`;
  }
  window.__plan24 = { sleep, set, measure, run, rows, fmt, show, hostMode, hide: () => document.getElementById('p24show')?.remove() };
})();
