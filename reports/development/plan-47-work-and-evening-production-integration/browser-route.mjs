// Finite isolated production-route witness. Run only during the coordinated browser turn.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';

const mode = process.argv[2];
if (!['baseline','current','boundary','final','final-family','wage-final'].includes(mode)) throw Error('Expected baseline, current or boundary');
const base = path.resolve(mode === 'baseline' ? 'node_modules/.cache/plan47-baseline-4c56b0f/dist' : 'dist');
const out = path.resolve('reports/development/plan-47-work-and-evening-production-integration/browser');
await mkdir(out,{recursive:true});
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    const route = url.pathname.startsWith('/Quackpot/') ? url.pathname.slice('/Quackpot'.length) : url.pathname;
    const file=path.resolve(base, `.${decodeURIComponent(route === '/' ? '/index.html' : route)}`);
    if (!file.startsWith(base+path.sep)) throw Error('outside root');
    const ext=path.extname(file); res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[ext]||'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
let browser, sessionId, send, evaluate;
const trace=[], runtimeEvents=[];
let phase = 'start';
try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await launchIsolatedChrome();
  const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'});
  ({sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true}));
  browser.cdp.socket.addEventListener('message', event => { try { const m=JSON.parse(String(event.data)); if (m.sessionId === sessionId && ['Runtime.exceptionThrown','Runtime.consoleAPICalled','Log.entryAdded'].includes(m.method)) runtimeEvents.push(m); } catch {} });
  send=(method,params={})=>browser.cdp.send(method,params,sessionId);
  evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=async expression=>{for(let i=0;i<80;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,100));}throw Error(`Timed out: ${expression}; page=${await evaluate('document.body.innerText')}`);};
  const click=async selector=>{await wait(`document.querySelector(${JSON.stringify(selector)})`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);};
  const textClick=async text=>{const q=`[...document.querySelectorAll('button')].find(b=>!b.disabled && b.textContent.includes(${JSON.stringify(text)}))`;await wait(q);await evaluate(`${q}.click()`);};
  const snap=async name=>{trace.push({name,text:(await evaluate('document.querySelector("#main-content").innerText')).slice(0,1200)});const image=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(out,`${mode}-${name}.png`),Buffer.from(image.data,'base64'));};
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.__qpDialogs=[]; window.confirm=(message)=>{window.__qpDialogs.push({kind:"confirm",message});return true}; window.alert=(message)=>window.__qpDialogs.push({kind:"alert",message});'});
  await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/Quackpot/`});
  phase='morning setup'; await click('#morning-setup-form button');
  phase='breakfast'; await click('[data-obj="plate"]'); await click('[data-act="confirm"]'); await click('[data-act="done"]'); await new Promise(r=>setTimeout(r,300));
  phase='departure'; await textClick('Go to work');
  phase='work'; if (mode === 'baseline') {
    await wait('document.querySelector("[data-obj=phone]")'); await snap('work');
    await click('[data-obj="phone"]'); await click('[data-act="toggle"]'); await click('[data-act="confirm"]'); await snap('payslip'); await click('[data-act="done"]'); await textClick('Continue to evening');
  } else {
    await wait('document.querySelector(".life-story47")'); await snap('commute');
    await textClick('Arrive at work'); await snap('work');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true}); await snap('work-narrow');
    await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
    await send('Page.reload'); await wait("performance.getEntriesByType('navigation')[0]?.type === 'reload' && document.querySelector('.life-story47')"); await snap('work-reloaded');
    if (['boundary','final','wage-final'].includes(mode)) {
      await click('#btn-open-settings'); await click('[data-settings-done]'); await wait("document.querySelector('.life-story47')"); await snap('work-settings');
      await click('#btn-uninstall'); await click('#btn-retention-stay'); await wait("document.querySelector('.life-story47')"); await snap('work-stayed');
    }
    await textClick('Complete shift'); await snap('payslip');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true}); await snap('payslip-narrow');
    await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false}); await textClick('Return home');
  }
  await wait('document.querySelector("[data-obj=plate]")'); await snap('evening-kitchen');
  if (mode !== 'baseline') { await click('[data-obj="plate"]'); await click('[data-act="confirm"]'); await click('[data-act="done"]'); await new Promise(r=>setTimeout(r,300)); }
  await textClick('The desk'); await snap('evening-desk');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true}); await snap('evening-narrow');
  if (['current','final-family'].includes(mode)) {
    await textClick('Call Mom'); await snap('family-scene');
    await send('Page.reload'); await wait("performance.getEntriesByType('navigation')[0]?.type === 'reload' && document.querySelector('.life-story47')");
    await snap('family-reloaded'); await textClick('Finish the call'); await snap('family-result'); await textClick('Continue');
  } else if (['boundary','final','wage-final'].includes(mode)) {
    await click('[data-obj="quiet-duck"]'); await click('[data-act="confirm"]'); await wait("document.querySelector('.life-story47')");
    await snap('quiet-scene'); await textClick('Finish your break'); await snap('quiet-result'); await textClick('Continue');
  }
  await click('[data-obj="phone"]'); await wait('document.querySelector("#main-content") && !document.querySelector(".stage-transition")'); await snap('phone');
  if (['boundary','final','wage-final'].includes(mode)) {
    // An isolated synthetic unknown story must trigger the real startup preservation UI.
    await evaluate(`(()=>{const e=JSON.parse(localStorage.getItem('quackpot_save_v1'));e.state.life.story47={version:999,kind:'unknown'};const raw=JSON.stringify(e);localStorage.setItem('quackpot_save_v1',raw);sessionStorage.setItem('expected-unknown',raw)})()`);
    await send('Page.reload'); await wait("document.querySelector('#btn-corrupt-backup')"); await snap('unknown-save-notice');
    await click('#btn-corrupt-backup'); await wait("document.querySelector('#morning-setup-form')");
    await click('#morning-setup-form button');
    const intact=await evaluate(`localStorage.getItem('quackpot_save_v1')===sessionStorage.getItem('expected-unknown') && localStorage.getItem('quackpot_save_backup')===sessionStorage.getItem('expected-unknown')`);
    if (!intact) throw Error('Unknown save was not preserved through startup and temporary autosave');
    trace.push({name:'unknown-save-preserved', primaryAndBackupUnchanged:true});
  }
  if (runtimeEvents.some(event => event.method === 'Runtime.exceptionThrown')) throw Error('Runtime exception occurred during route');
  await writeFile(path.join(out,`${mode}-trace.json`),JSON.stringify({mode,source:mode==='baseline'?'4c56b0f':'working tree',route:'fresh production app → breakfast → scheduled work → evening → phone',trace,runtimeEvents},null,2));
} catch (error) {
  let diagnostic = null;
  try { diagnostic = await evaluate(`({url:location.href,readyState:document.readyState,bodyText:document.body.innerText,mainHtml:document.querySelector('#main-content')?.outerHTML,dialogs:window.__qpDialogs,save:localStorage.getItem('quackpot_save_v1')})`); } catch (captureError) { diagnostic={captureError:String(captureError)}; }
  await writeFile(path.join(out,`${mode}-failure.json`),JSON.stringify({mode,source:mode==='baseline'?'4c56b0f':'working tree',phase,error:String(error),diagnostic,runtimeEvents},null,2));
  throw error;
} finally {
  if (browser) console.log('Chrome cleanup',JSON.stringify(await closeIsolatedChrome(browser)));
  await new Promise(resolve=>server.close(resolve));
}
