// Report-local scene comparison (NOT YET RUN). Same isolated-page technique as ../keys-art-review/compare.mjs:
// production HUD/life view with a synthetic engine run; the study SVG is substituted only inside this page.
// Variants: current production, Codex candidate (frozen), Sonnet study at the same hotspot box, Sonnet study with
// proposed local placement (visual box only; the button, label and keyboard target are unchanged in kind).
// Run only through ../../plan-25-desk-phone-art-integration/bounded-node-run.ps1 after root grants a slot.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../../scripts/dev/checkpoints/cdp.mjs';
const repo = process.cwd();
const study = 'reports/development/plan-47-work-and-evening-production-integration';
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/ui/shell.css"><link rel="stylesheet" href="/src/ui/life/life.css"><div class="game-wrapper"><div id="hud-container"></div><main class="main-content" id="main-content"></main></div><script type="module">
import {GameEngine} from '/src/core/game-engine.mjs';
import {renderHud} from '/src/ui/hud.js';
import {renderLifeView} from '/src/ui/life/life-view.js';
import {candidateKeysTray} from '/${study}/keys-art-review/candidate.mjs';
import {sonnetKeys} from '/${study}/keys-sonnet-study/keys-study.mjs';
const e=new GameEngine('keys-art-report',{lifePolicy:true,tutorialShift:true});e.start();e.setupCompanion();e.applyLifeIntent({type:'meal',choice:'buy'});e.state.step='life_breakfast';
renderHud(document.querySelector('#hud-container'),e,'/src/assets/duck-placeholder.svg');
renderLifeView(document.querySelector('#main-content'),e,{place:'desk-phone'},{});
const btn=()=>document.querySelector('[data-obj="work-keys"]');
window.use=(v)=>{const b=btn();if(v==='codex')b.querySelector('svg').outerHTML=candidateKeysTray();
 if(v==='sonnet-same'||v==='sonnet-proposed')b.querySelector('svg').outerHTML=sonnetKeys();
 if(v==='sonnet-proposed'){b.style.left='34%';b.style.top='69%';b.style.width='12.5%';b.style.height='auto';}};
window.ready=true;
</script>`;
const server = http.createServer(async (req, res) => { try { const p = new URL(req.url, 'http://localhost').pathname; if (p === '/') { res.setHeader('Content-Type', 'text/html'); res.end(html); return; } const f = path.resolve(repo, '.' + decodeURIComponent(p)); if (!f.startsWith(repo + path.sep)) throw Error('outside'); const b = await readFile(f); res.setHeader('Content-Type', ({ '.css': 'text/css', '.mjs': 'text/javascript', '.js': 'text/javascript', '.svg': 'image/svg+xml' })[path.extname(f)] || 'application/octet-stream'); res.end(b); } catch { res.writeHead(404).end(); } });
let browser; try {
  await new Promise(r => server.listen(0, '127.0.0.1', r)); browser = await launchIsolatedChrome();
  const { targetId } = await browser.cdp.send('Target.createTarget', { url: 'about:blank' }); const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (m, p = {}) => browser.cdp.send(m, p, sessionId);
  const evaluate = async x => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const wait = async x => { for (let i = 0; i < 80; i++) { if (await evaluate(`Boolean(${x})`)) return; await new Promise(r => setTimeout(r, 100)); } throw Error('Timed out ' + x); };
  const dest = path.resolve(study, 'keys-sonnet-study'); const evidence = [];
  const url = `http://127.0.0.1:${server.address().port}/`;
  const shots = async (size, tag) => {
    await send('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1 });
    for (const v of ['current', 'codex', 'sonnet-same', 'sonnet-proposed']) {
      await send('Page.navigate', { url }); await wait('window.ready'); if (v !== 'current') await evaluate(`window.use('${v}')`);
      const box = await evaluate(`(()=>{const r=document.querySelector('[data-obj="work-keys"]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
      const clip = { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 50), width: box.width + 80, height: box.height + 90, scale: tag === 'desktop' ? 4 : 6 };
      const full = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(path.join(dest, `${v}-${tag}.png`), Buffer.from(full.data, 'base64'));
      const zoom = await send('Page.captureScreenshot', { format: 'png', clip }); await writeFile(path.join(dest, `${v}-${tag}-zoom.png`), Buffer.from(zoom.data, 'base64'));
      evidence.push({ variant: v, viewport: tag, target: box });
    }
  };
  await send('Page.enable'); await send('Runtime.enable');
  await shots({ width: 1366, height: 768, mobile: false }, 'desktop'); await shots({ width: 390, height: 844, mobile: true }, 'narrow');
  await writeFile(path.join(dest, 'comparison.json'), JSON.stringify({ kind: 'synthetic component witness; study SVG substituted only in this isolated page; hotspot box restyled in-page for sonnet-proposed', evidence }, null, 2));
} finally { if (browser) console.log('Chrome cleanup', JSON.stringify(await closeIsolatedChrome(browser))); await new Promise(r => server.close(r)); }
