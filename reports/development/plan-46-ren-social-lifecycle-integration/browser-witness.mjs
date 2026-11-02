// Finite Plan 46 actual Vite route, isolated synthetic profile and storage only.
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';
import { buttonLookup, focusLookup } from './browser-query.mjs';
const out = path.resolve('reports/development/plan-46-ren-social-lifecycle-integration/browser');
await mkdir(out, { recursive: true });
const sourcePaths = ['src/main.js', 'src/core/game-engine.mjs', 'src/core/life-progression.mjs', 'src/core/life-social.mjs', 'src/core/life-validation.mjs', 'src/core/receipt.mjs', 'src/ui/receipt-view.js', 'src/ui/receipt-presentation.mjs', 'src/ui/life/life-view.js', 'src/ui/life/ren-channel-view.mjs', 'src/ui/life/ren-scene-view.mjs', 'src/ui/life/ren46.css', 'src/assets/ren/index.mjs', 'src/assets/ren/source.mjs', 'src/assets/ren/scene-patches.mjs', 'reports/development/plan-46-ren-social-lifecycle-integration/browser-witness.mjs', 'reports/development/plan-46-ren-social-lifecycle-integration/browser-query.mjs'];
const sourcePins = Object.fromEntries(await Promise.all(sourcePaths.map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
let browser, send, evaluate, phase = 'startup'; const trace = [], runtime = [];
try {
  browser = await launchIsolatedChrome();
  const { targetId } = await browser.cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId, flatten: true });
  browser.cdp.socket.addEventListener('message', event => { try { const msg = JSON.parse(String(event.data)); if (msg.sessionId === sessionId && msg.method === 'Runtime.exceptionThrown') runtime.push(msg); } catch {} });
  send = (method, params = {}) => browser.cdp.send(method, params, sessionId);
  evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const wait = async expr => { for (let i = 0; i < 80; i++) { if (await evaluate(`Boolean(${expr})`)) return; await new Promise(r => setTimeout(r, 100)); } throw Error(`Timed out ${expr}`); };
  const clickText = async text => { const q = buttonLookup(text); await wait(q); await evaluate(`${q}.click()`); };
  const keyboardText = async text => { const q = buttonLookup(text); await wait(q); const focused = await evaluate(focusLookup(text)); if (!focused) throw Error('Keyboard target did not receive focus'); await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); trace.push({ name: 'keyboard-enter', text, focused }); };
  const click = async sel => { await wait(`document.querySelector(${JSON.stringify(sel)})`); await evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`); };
  const viewport = async (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  const snap = async name => { await new Promise(r => setTimeout(r, 400)); const state = await evaluate(`(()=>{const r=JSON.parse(localStorage.getItem('quackpot_save_v1'));return {text:document.body.innerText,life:r?.state?.life,health:r?.state?.health,events:r?.eventLog?.map(e=>({type:e.type,payload:e.payload}))}})()`); trace.push({ name, ...state }); const img = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(path.join(out, `${name}.png`), Buffer.from(img.data, 'base64')); };
  await send('Page.enable'); await send('Runtime.enable'); await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.confirm=()=>true;window.alert=()=>{};sessionStorage.setItem('__nav',String(Number(sessionStorage.getItem('__nav')||0)+1));` });
  await viewport(1366, 768); await send('Page.navigate', { url: 'http://localhost:5173/Quackpot/' }); await wait('document.readyState === "complete"');
  phase = 'synthetic checkpoint';
  const fixture = await evaluate(`(async()=>{const {GameEngine}=await import('/Quackpot/src/core/game-engine.mjs');const {validateSave}=await import('/Quackpot/src/core/storage.mjs');const e=new GameEngine('plan46-browser-synthetic',{lifePolicy:true});e.start();e.setupCompanion();const run=i=>{const r=e.applyLifeIntent(i);if(!r.ok)throw Error(JSON.stringify({i,r}));};run({type:'meal',choice:'skip'});run({type:'advance'});run({type:'advance'});run({type:'meal',choice:'buy'});run({type:'advance'});run({type:'meal',choice:'skip'});run({type:'advance'});run({type:'advance'});run({type:'meal',choice:'buy'});e.state.step='life_evening';const env=e.toEnvelope();const valid=validateSave(env);if(!valid.valid)throw Error(JSON.stringify(valid.errors));localStorage.setItem('quackpot_save_v1',JSON.stringify(env));return {day:e.state.life.day,phase:e.state.life.phase,health:e.state.health,valid:valid.valid};})()`);
  trace.push({ name: 'synthetic-engine-checkpoint', ...fixture }); const nav = await evaluate(`sessionStorage.getItem('__nav')`); await send('Page.reload'); await wait(`sessionStorage.getItem('__nav')!==${JSON.stringify(nav)} && document.querySelector('.life-view')`);
  phase = 'unactivated'; await wait(buttonLookup('Messages: Ren')); await snap('before-desk-desktop'); await viewport(390, 844); await snap('before-desk-narrow');
  phase = 'introduction'; await keyboardText('Messages: Ren'); await snap('introduction-narrow'); await clickText('Nice to meet you'); await clickText('Messages: Ren'); await snap('invitation-narrow'); await clickText('Accept this evening'); await snap('accepted-narrow');
  phase = 'visit'; await clickText('Welcome Ren in'); await wait('document.querySelector(".ren46-scene")'); await snap('visit-narrow'); await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); await snap('visit-reduced-motion'); await send('Emulation.setEmulatedMedia', { features: [] }); await viewport(1366,768); await snap('visit-desktop');
  const beforeReload = await evaluate(`sessionStorage.getItem('__nav')`); await send('Page.reload'); await wait(`sessionStorage.getItem('__nav')!==${JSON.stringify(beforeReload)} && document.querySelector('.ren46-scene')`);
  await click('#btn-open-settings'); await click('[data-settings-done]'); await click('#btn-uninstall'); await click('#btn-retention-stay'); await wait('document.querySelector(".ren46-scene")');
  await clickText('Continue'); await clickText('Continue');
  await clickText('Finish the evening'); await snap('visit-completed'); await clickText('Continue');
  const result = await evaluate(`(()=>{const r=JSON.parse(localStorage.getItem('quackpot_save_v1'));return {health:r.state.health,hp:r.eventLog.filter(e=>e.type==='life_health'&&e.payload.reason==='ren_visit'),shown:r.eventLog.filter(e=>e.type==='social46_display'),outcomes:r.eventLog.filter(e=>e.type==='social46_outcome')}})()`);
  if (result.health !== 95 || result.hp.length !== 1 || result.hp[0].payload.delta !== 5 || result.shown.filter(e => e.payload.kind === 'scene').length !== 3) throw Error('Visit health, display, overlay or reload mismatch'); trace.push({ name: 'visit-once', ...result });
  phase = 'receipt'; await click('#btn-uninstall'); await click('#btn-retention-leave'); await wait('document.querySelector(".plan44-receipt")'); await snap('receipt-desktop');
  if (runtime.length) throw Error('Runtime exception in route');
  await writeFile(path.join(out, 'trace.json'), JSON.stringify({ sourcePins, fixture, trace, runtime }, null, 2));
} catch (error) { let diagnostic = null; try { diagnostic = await evaluate('({body:document.body.innerText,url:location.href})'); } catch {} await writeFile(path.join(out, 'failure.json'), JSON.stringify({ phase, error: String(error), diagnostic, trace, runtime }, null, 2)); throw error; }
finally { if (browser) console.log('Chrome cleanup', JSON.stringify(await closeIsolatedChrome(browser))); }
