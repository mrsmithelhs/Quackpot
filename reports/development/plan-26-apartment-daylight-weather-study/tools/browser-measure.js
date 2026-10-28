// Plan 26 review tool (NOT runtime): numeric diagnostics for gallery.html, run inside the gallery page.
// Load with:  await import('./tools/browser-measure.js')   — then use window.__p26.
// For the gallery's current state it rasterises each cell's stage (SVG <foreignObject>, the same browser) and reports, against the first
// cell of the chosen grid ('#grid' = daylight comparison with neutral first; '#wgrid' = weather comparison with the clear-sun reference
// first), the mean/max channel difference, the share of pixels differing by more than 24, and the mean luminance change.
// regions() reports mean luminance and warmth (R-B) inside named scene regions for every cell, which separates "the lamp markup is
// unchanged" from "the final composite around the lamp/duck changed". Diagnostic only; it does not judge the art, and it does not
// render the 'diff' display mode (use state.mode = 'columns').
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
  async function capture(gridSel, W) {
    const figs = [...document.querySelectorAll(`${gridSel} figure`)], st = figs.map(f => f.querySelector('.stage')), ratio = st[0].getBoundingClientRect(), H = Math.round(W * ratio.height / ratio.width);
    const imgs = []; for (const s of st) imgs.push(await raster(s, W, H));
    return { W, H, imgs, names: figs.map(f => f.querySelector('figcaption strong').textContent.split(' (')[0].split(':')[0]) };
  }
  async function compare(W = 800, gridSel = '#grid') {
    const { H, imgs, names } = await capture(gridSel, W), base = imgs[0], out = [];
    for (let k = 1; k < imgs.length; k++) { let sum = 0, mx = 0, c24 = 0, dl = 0; const n = W * H, a = base.data, b = imgs[k].data; for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); sum += d; if (d > mx) mx = d; if (d > 24) c24++; dl += lum(b, i) - lum(a, i); } out.push(`${names[k]}: mean ${(sum / n).toFixed(2)} max ${mx} p24 ${(100 * c24 / n).toFixed(1)}% dLum ${(dl / n).toFixed(1)}`); }
    return { size: `${W}x${H}`, base: names[0], rows: out };
  }
  /** Mean luminance and warmth (R-B) per cell inside regions given as fractions of the stage [x0, y0, x1, y1]. */
  async function regions(boxes, W = 800, gridSel = '#wgrid') {
    const { H, imgs, names } = await capture(gridSel, W), out = {};
    for (const [rname, [x0, y0, x1, y1]] of Object.entries(boxes)) out[rname] = imgs.map((im, k) => { let l = 0, w = 0, n = 0; for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y++) for (let x = Math.floor(x0 * W); x < Math.floor(x1 * W); x++) { const i = (y * W + x) * 4; l += lum(im.data, i); w += im.data[i] - im.data[i + 2]; n++; } return `${names[k]}: lum ${(l / n).toFixed(0)} warmth ${(w / n).toFixed(0)}`; });
    return { size: `${W}x${H}`, regions: out };
  }
  async function set(k, v) { const s = document.querySelector(`#controls select[data-k="${k}"]`); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); await sleep(300); }
  window.__p26 = { compare, regions, set, sleep };
})();
