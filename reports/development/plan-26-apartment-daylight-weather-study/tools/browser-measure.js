// Plan 26 review tool (NOT runtime): numeric diagnostics for gallery.html, run inside the gallery page.
// Load with:  await import('./tools/browser-measure.js')   — then use window.__p26.
// For the gallery's current state it rasterises each column's stage (SVG <foreignObject>, the same browser) and reports, against
// the neutral column, the mean/max channel difference, the share of pixels differing by >24, and the mean luminance change.
// Diagnostic only: a difference image does not show whether the art is good, and the rasteriser ignores browser zoom/antialiasing
// of the on-screen paint. It does not render the 'diff' display mode (use state.mode = 'columns').
(() => {
  const ser = new XMLSerializer(), sleep = ms => new Promise(r => setTimeout(r, ms));
  const css = () => [...document.querySelectorAll('head style')].map(s => s.textContent).join('\n');
  async function raster(el, W, H) {
    const clone = el.cloneNode(true); clone.style.width = `${W}px`; clone.style.height = `${H}px`; clone.style.aspectRatio = 'auto';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;height:${H}px;background:#fff"><style>${css()}</style>${ser.serializeToString(clone)}</div></foreignObject></svg>`;
    const img = new Image(); await new Promise((ok, bad) => { img.onload = ok; img.onerror = () => bad(new Error('raster failed')); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H);
  }
  const lum = (d, i) => .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
  async function compare(W = 800) {
    const figs = [...document.querySelectorAll('#grid figure')], st = figs.map(f => f.querySelector('.stage')), ratio = st[0].getBoundingClientRect(); const H = Math.round(W * ratio.height / ratio.width);
    const imgs = []; for (const s of st) imgs.push(await raster(s, W, H));
    const names = figs.map(f => f.querySelector('figcaption strong').textContent.split(' (')[0].split(':')[0]);
    const base = imgs[0], out = [];
    for (let k = 1; k < imgs.length; k++) { let sum = 0, mx = 0, c24 = 0, dl = 0; const n = W * H, a = base.data, b = imgs[k].data; for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); sum += d; if (d > mx) mx = d; if (d > 24) c24++; dl += lum(b, i) - lum(a, i); } out.push(`${names[k]}: mean ${(sum / n).toFixed(2)} max ${mx} p24 ${(100 * c24 / n).toFixed(1)}% dLum ${(dl / n).toFixed(1)}`); }
    return { size: `${W}x${H}`, rows: out };
  }
  async function set(k, v) { const s = document.querySelector(`#controls select[data-k="${k}"]`); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); await sleep(250); }
  window.__p26 = { compare, set, sleep };
})();
