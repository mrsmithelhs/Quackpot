// Root-coordinated isolated gallery validation; no game storage or routes.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = 'reports/development/plan-57-race-collision-and-injury-visual-study/';
const dir = `${base}evidence/gallery-01`;
await mkdir(dir, { recursive: false });
let browser, error = null, cleanup = null;
const results = [], exceptions = [], navigations = [], pins = {};
try {
  for (const path of ['gallery/index.html','gallery/gallery.css','gallery/gallery.mjs','gallery/fixtures.mjs','art/impact-burst.svg','art/paper-splash.svg','art/adhesive-bandage.svg','art/status-tab-icon.svg','tools/gallery-browser.mjs']) pins[path] = createHash('sha256').update(await readFile(base + path)).digest('hex');
  const url = 'http://localhost:5173/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/';
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok || !(await response.text()).includes('Collision and injury visual study')) throw Error(`HTTP/body failed: ${response.status}`);
  browser = await launchIsolatedChrome();
  browser.cdp.socket.addEventListener('message', event => { const message = JSON.parse(String(event.data)); if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails?.text ?? 'exception'); if (message.method === 'Page.frameNavigated' && !message.params.frame.parentId) navigations.push(message.params.frame.url); });
  for (const [width, height] of [[1024,900],[390,844]]) {
    const page = await createPage(browser.cdp, url, { viewport: { width, height } });
    const send = (method, params = {}) => browser.cdp.send(method, params, page.sessionId);
    const ev = expression => evaluate(browser.cdp, page.sessionId, expression);
    let ready = false;
    for (let i = 0; i < 30; i++) { if (await ev("document.querySelectorAll('.runner svg').length === 8")) { ready = true; break; } await new Promise(resolve => setTimeout(resolve, 100)); }
    if (!ready) throw Error(`${width}: gallery not ready`);
    const navCount = navigations.length;
    const check = await ev(`(() => {
      const a = document.querySelector('.study:first-child'), b = document.querySelector('.study:nth-child(2)');
      const set = (root, key, value) => { const el = root.querySelector('[data-' + key + ']'); el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); };
      set(a,'fixture','both'); set(a,'time','1.2');
      const injury = [...a.querySelectorAll('[data-status]')].map(x => x.textContent.trim());
      const independent = [...b.querySelectorAll('[data-status]')].every(x => !x.textContent.trim());
      set(a,'time','0.5'); const backward = [...a.querySelectorAll('[data-status]')].every(x => !x.textContent.trim());
      set(a,'fixture','repeated'); set(a,'time','1.8'); const overlap = a.querySelector('.narrative').textContent.includes('A and B') && a.querySelector('.narrative').textContent.includes('B and C');
      set(a,'fixture','both'); set(a,'time','1.2'); a.querySelector('[data-static]').click();
      const staticText = [...a.querySelectorAll('[data-contact-text]')].filter(x => x.textContent.includes('✦')).length;
      return { injury, independent, backward, overlap, staticText, closeupWidth: b.querySelector('.runner').getBoundingClientRect().width, raceWidth: a.querySelector('.runner').getBoundingClientRect().width };
    })()`);
    if (check.injury.filter(Boolean).length !== 2 || !check.independent || !check.backward || !check.overlap || check.staticText !== 2) throw Error(`${width}: event/seek/static/instance check failed: ${JSON.stringify(check)}`);
    const lifecycle = await ev(`(async () => {
      const a = document.querySelector('.study:first-child'); const time = a.querySelector('[data-time]'), play = a.querySelector('[data-play]');
      time.value = 0; time.dispatchEvent(new Event('input',{bubbles:true})); play.focus();
      return { focused: document.activeElement === play };
    })()`);
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:' ', code:'Space', windowsVirtualKeyCode:32 });
    await send('Input.dispatchKeyEvent', { type:'keyUp', key:' ', code:'Space', windowsVirtualKeyCode:32 });
    await new Promise(resolve => setTimeout(resolve, 250));
    const played = await ev("Number(document.querySelector('.study:first-child [data-time]').value)");
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:' ', code:'Space', windowsVirtualKeyCode:32 });
    await send('Input.dispatchKeyEvent', { type:'keyUp', key:' ', code:'Space', windowsVirtualKeyCode:32 });
    const paused = await ev("Number(document.querySelector('.study:first-child [data-time]').value)");
    await new Promise(resolve => setTimeout(resolve, 200));
    const pausedLater = await ev("Number(document.querySelector('.study:first-child [data-time]').value)");
    const teardown = await ev(`(async () => { const { mount } = await import('/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/gallery.mjs'); const el = document.createElement('section'); document.body.append(el); const destroy = mount(el); el.querySelector('[data-play]').click(); destroy(); const empty = el.childElementCount === 0; el.remove(); return empty; })()`);
    if (!lifecycle.focused || played <= 0 || paused !== pausedLater || !teardown) throw Error(`${width}: keyboard/play/pause/teardown failed`);
    await ev(`(() => { const a=document.querySelector('.study:first-child'); a.querySelector('[data-time]').value='1.2'; a.querySelector('[data-time]').dispatchEvent(new Event('input',{bubbles:true})); const b=document.querySelector('.study:nth-child(2)'); b.querySelector('[data-fixture]').value='both'; b.querySelector('[data-fixture]').dispatchEvent(new Event('input',{bubbles:true})); b.querySelector('[data-time]').value='1.2'; b.querySelector('[data-time]').dispatchEvent(new Event('input',{bubbles:true})); if (!b.querySelector('[data-static]').checked) b.querySelector('[data-static]').click(); })()`);
    await ev("Promise.all([...document.querySelectorAll('img:not([hidden])')].map(image => image.decode()))");
    for (const [name, selector] of [['race','.study:first-child .stage'],['closeup','.study:nth-child(2) .stage']]) {
      const rect = await ev(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height }; })()`);
      const shot = await send('Page.captureScreenshot', { format:'png', captureBeyondViewport:true, clip:{...rect,scale:1} });
      await writeFile(`${dir}/${width}-${name}.png`, Buffer.from(shot.data,'base64'), { flag:'wx' });
    }
    if (navigations.length !== navCount || exceptions.length) throw Error(`${width}: navigation or exception during capture`);
    results.push({ width, height, ...check, captureMode:'static, both injured, angular burst, attached bandage', keyboardPlay: played > 0, pausedStable: paused === pausedLater, teardownDomEmpty: teardown });
    await browser.cdp.send('Target.disposeBrowserContext', { browserContextId: page.contextId });
  }
  for (const [path, before] of Object.entries(pins)) if (createHash('sha256').update(await readFile(base + path)).digest('hex') !== before) throw Error(`Source changed during capture: ${path}`);
} catch (e) { error = String(e); }
finally {
  if (browser) cleanup = await closeIsolatedChrome(browser);
  const accepted = cleanup?.rootExited === true && cleanup?.observedProcessesExited === true && cleanup?.inspectionFailed === false && cleanup?.residual === false && cleanup?.coverage === 'sampled-only' && cleanup?.uncertainty === true && cleanup?.profileRetained === true && cleanup?.treeTerminationConfirmed === false;
  const receipt = { disclaimer:'Synthetic events and stand-in scene; no production game or saves.', pins, results, exceptions, navigations, error, cleanup, accepted };
  await writeFile(`${dir}/receipt.json`, JSON.stringify(receipt, null, 2), { flag:'wx' });
  console.log(JSON.stringify(receipt));
  if (error || !accepted) process.exitCode = 1;
}
