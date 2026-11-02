// One finite isolated-browser study witness. Never opens the game or reads/writes its storage.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';

const output = path.resolve('reports/development/plan-49-diegetic-apartment-action-map/afternoon-captures');
await mkdir(output, { recursive: true });
let browser, failureSnapshot; const events = []; const trace = [];
try {
  browser = await launchIsolatedChrome();
  const { targetId } = await browser.cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId, flatten: true });
  browser.cdp.socket.addEventListener('message', e => { const m = JSON.parse(String(e.data)); if (m.sessionId === sessionId && m.method === 'Runtime.exceptionThrown') events.push(m.params.exceptionDetails.text); });
  const send = (method, params = {}) => browser.cdp.send(method, params, sessionId);
  const evalJs = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.text); return result.result.value; };
  const wait = async expression => { for (let i = 0; i < 80; i++) { if (await evalJs(`Boolean(${expression})`)) return; await new Promise(r => setTimeout(r, 100)); } throw Error(`Timeout: ${expression}`); };
  const snap = async name => { const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(path.join(output, `${name}.png`), Buffer.from(data, 'base64')); trace.push({ name, focus: await evalJs('document.activeElement?.textContent'), text: await evalJs('document.body.innerText'), scrollWidth: await evalJs('document.documentElement.scrollWidth'), clientWidth: await evalJs('document.documentElement.clientWidth') }); };
  failureSnapshot = () => snap('witness-failure');
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url: 'http://localhost:5173/Quackpot/reports/development/plan-49-diegetic-apartment-action-map/preview.html' });
  await wait('document.querySelector(".target") && document.querySelector("#scene svg")');
  const restoration = await evalJs(`(async()=>{const {ROOM_SPECS}=await import('/Quackpot/src/assets/apartment/rooms/specs.mjs'); const {bedroomStudyScene}=await import('./bedroom-study.mjs'); const original=ROOM_SPECS.bedroom; const snapshot=JSON.stringify({anchor:original.anchor,onTable:original.onTable,surfaces:original.surfaces,items:original.items({couch:'present',tv:'present'})}); bedroomStudyScene('valid-check'); const afterSuccess=ROOM_SPECS.bedroom===original && JSON.stringify({anchor:original.anchor,onTable:original.onTable,surfaces:original.surfaces,items:original.items({couch:'present',tv:'present'})})===snapshot; let threw=false; try{bedroomStudyScene('!invalid')}catch{threw=true} return {afterSuccess,threw,afterFailure:ROOM_SPECS.bedroom===original && JSON.stringify({anchor:original.anchor,onTable:original.onTable,surfaces:original.surfaces,items:original.items({couch:'present',tv:'present'})})===snapshot}})()`);
  trace.push({ name: 'room-spec-restoration', ...restoration });
  if (!restoration.afterSuccess || !restoration.threw || !restoration.afterFailure) throw Error('Original bedroom spec restoration check failed');
  await snap('desktop-bedroom');
  // Exercise actual key activation and Escape/focus return, not a programmatic click.
  await evalJs('document.querySelector(".target").focus()');
  const focus = await evalJs('({target: document.activeElement === document.querySelector(".target"), window: document.hasFocus(), tag: document.activeElement?.tagName})');
  trace.push({ name: 'before-enter', ...focus });
  if (!focus.target) throw Error('Bed target did not receive focus');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await wait('!document.querySelector("#decision").hidden'); await evalJs('document.querySelector("#decision").scrollIntoView({block:"nearest"})'); await snap('desktop-bed-decision');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  trace.push({ name: 'escape-return', hidden: await evalJs('document.querySelector("#decision").hidden'), returnedToBed: await evalJs('document.activeElement === document.querySelector(".target")') });
  if (!trace.at(-1).hidden || !trace.at(-1).returnedToBed) throw Error('Escape did not close the decision and restore bed focus');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await snap('narrow-bedroom');
  await evalJs(`document.querySelector('#scenario').value='recovery'; document.querySelector('#scenario').dispatchEvent(new Event('change',{bubbles:true}));`);
  await evalJs('document.querySelector(".target").click(); document.querySelector("#decision").scrollIntoView({block:"nearest"})'); await snap('narrow-recovery');
  await evalJs(`document.querySelector('#scenario').value='used'; document.querySelector('#scenario').dispatchEvent(new Event('change',{bubbles:true})); [...document.querySelectorAll('#rooms button')].find(b=>b.textContent==='Desk').click(); document.querySelector('.target').click();`);
  await evalJs('document.querySelector("#decision").scrollIntoView({block:"nearest"})'); await snap('narrow-used-phone');
  await evalJs(`document.querySelector('#scenario').value='late'; document.querySelector('#scenario').dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('.target').click(); document.querySelector('#decision').scrollIntoView({block:'nearest'});`); await snap('narrow-late');
  await evalJs(`document.querySelector('#scenario').value='future'; document.querySelector('#scenario').dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('.target').click(); document.querySelector('#decision').scrollIntoView({block:'nearest'});`); await snap('narrow-future');
  await evalJs(`document.querySelector('#scenario').value='used'; document.querySelector('#scenario').dispatchEvent(new Event('change',{bubbles:true})); [...document.querySelectorAll('#rooms button')].find(b=>b.textContent==='Desk').click(); document.querySelector('[aria-label="Phone"]').focus();`);
  const phoneFocused = await evalJs(`document.activeElement?.getAttribute('aria-label')==='Phone'`);
  if (!phoneFocused) throw Error('Phone did not receive initial focus');
  await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', text:'\r', unmodifiedText:'\r', windowsVirtualKeyCode:13 }); await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
  await wait('!document.querySelector("#decision").hidden'); await evalJs(`document.querySelector('#decision').scrollIntoView({block:'nearest'})`); await snap('narrow-phone-example');
  await evalJs(`[...document.querySelectorAll('#decision button')].find(b=>b.textContent==='Try a pull example').click(); document.querySelector('#decision').scrollIntoView({block:'nearest'});`); await snap('narrow-pull-warning');
  await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 }); await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  const phoneReturn = await evalJs(`document.querySelector('#decision').hidden && document.activeElement?.getAttribute('aria-label')==='Phone'`);
  const noStandaloneStay = await evalJs(`![...document.querySelectorAll('button')].some(b=>b.textContent.includes('Stay up'))`);
  trace.push({ name:'phone-example-escape-return', phoneFocused, phoneReturn, noStandaloneStay });
  if (!phoneReturn || !noStandaloneStay) throw Error('Phone focus return or selected control treatment failed');
  for (const scenario of ['afternoon','afternoon-unemployed','afternoon-used']) {
    await evalJs(`document.querySelector('#scenario').value=${JSON.stringify(scenario)}; document.querySelector('#scenario').dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('[aria-label="Dinner · proposed evening route"]').focus();`);
    await snap(`narrow-${scenario}-plate`);
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', text:'\r', unmodifiedText:'\r', windowsVirtualKeyCode:13 }); await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
    await wait('!document.querySelector("#decision").hidden');
    await evalJs(`[...document.querySelectorAll('#decision button')].find(b=>b.textContent==='Buy dinner example').click(); document.querySelector('#decision').scrollIntoView({block:'nearest'});`);
    await snap(`narrow-${scenario}-confirm`);
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 }); await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
    const returned = await evalJs(`document.querySelector('#decision').hidden && document.activeElement?.getAttribute('aria-label')==='Dinner · proposed evening route'`);
    trace.push({name:`${scenario}-escape-return`, returned}); if (!returned) throw Error('Dinner example focus did not return');
  }
  if (events.length) throw Error(`Runtime exceptions: ${events.join('; ')}`);
  await writeFile(path.join(output, 'trace.json'), JSON.stringify({ description: 'Synthetic report-local fixtures, isolated browser, reduced motion; not a production journey.', trace, runtimeExceptions: events }, null, 2));
} catch (error) {
  try { await failureSnapshot?.(); } catch { /* retain original failure */ }
  await writeFile(path.join(output, 'witness-failure.json'), JSON.stringify({ error: String(error), trace, runtimeExceptions: events }, null, 2));
  throw error;
} finally { if (browser) console.log('Owned Chrome cleanup:', JSON.stringify(await closeIsolatedChrome(browser))); }
