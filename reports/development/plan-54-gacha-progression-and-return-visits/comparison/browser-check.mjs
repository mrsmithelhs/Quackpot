import { launchIsolatedChrome, closeIsolatedChrome } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import { visits } from './scenarios.mjs';

const output = 'reports/development/plan-54-gacha-progression-and-return-visits/comparison/evidence';
await mkdir(output, { recursive: true });
const observations = [];
let browser, error = null, cleanup = null;
try {
  for (const [visit, scenario] of Object.entries(visits)) {
    assert.equal(scenario.wallet.length, 5, `${visit} wallet`);
    for (const model of ['collection', 'competition', 'event']) {
      for (const variant of ['lean', 'richer']) {
        const item = scenario[model][variant];
        for (const field of ['tag', 'title', 'lead', 'card', 'note', 'question']) assert.ok(item[field], `${visit}/${model}/${variant}/${field}`);
        assert.equal(item.choices.length, 3);
      }
    }
  }
  browser = await launchIsolatedChrome();
  const { targetId } = await browser.cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params = {}) => browser.cdp.send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/Quackpot/reports/development/plan-54-gacha-progression-and-return-visits/comparison/' });
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (await evaluate('document.readyState === "complete" && !!document.querySelector("#screen h2")')) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'comparison loaded');
  for (const [visit, scenario] of Object.entries(visits)) {
    for (const model of ['collection', 'competition', 'event']) {
      for (const variant of ['lean', 'richer']) {
        const state = { visit, model, variant };
        await evaluate(`(() => { const state = ${JSON.stringify(state)}; for (const [id, value] of Object.entries(state)) { const el = document.getElementById(id); el.value = value; el.dispatchEvent(new Event('change', { bubbles: true })); } })()`);
        const shown = await evaluate('({title:document.querySelector("#screen h2").textContent,context:document.querySelector("#review-context").textContent,wallet:document.querySelector("#wallet").innerText,note:document.querySelector("#notes").innerText})');
        assert.equal(shown.title, scenario[model][variant].title);
        assert.equal(shown.context, scenario.situation);
        assert.ok(shown.wallet.includes(scenario.wallet[3]));
        assert.ok(shown.note.includes(scenario[model][variant].question));
        observations.push({ ...state, title: shown.title });
      }
    }
  }
  // Exercise the first native select via actual keyboard events, not a synthetic change.
  await evaluate('document.querySelector("#visit").focus()');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  const keyboard = await evaluate('({value:document.querySelector("#visit").value,active:document.activeElement.id,context:document.querySelector("#review-context").textContent})');
  assert.equal(keyboard.active, 'visit'); assert.equal(keyboard.value, 'return'); assert.equal(keyboard.context, visits.return.situation);
  for (const [name, width, height, mobile] of [['desktop', 1280, 720, false], ['narrow', 390, 844, true]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    const geometry = await evaluate('({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,controls:[...document.querySelectorAll("select")].map(x=>({label:x.labels[0]?.innerText,disabled:x.disabled}))})');
    assert.ok(geometry.scroll <= geometry.viewport, `${name} horizontal overflow`);
    assert.ok(geometry.controls.every(x => x.label && !x.disabled), `${name} labeled controls`);
    const png = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(`${output}/${name}.png`, Buffer.from(png.data, 'base64'));
    await evaluate('document.querySelector(".phone").scrollIntoView({block:"start"})');
    const phone = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(`${output}/${name}-phone.png`, Buffer.from(phone.data, 'base64'));
    await evaluate('window.scrollTo(0,0)');
    observations.push({ name, geometry });
  }
  for (const model of ['collection', 'competition']) {
    await evaluate(`(() => { for (const [id, value] of Object.entries(${JSON.stringify({visit:'return',variant:'richer'})})) { const el=document.getElementById(id); el.value=value; el.dispatchEvent(new Event('change', {bubbles:true})); } const el=document.getElementById('model'); el.value=${JSON.stringify(model)}; el.dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('.phone').scrollIntoView({block:'start'}); })()`);
    const png = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(`${output}/narrow-${model}-richer.png`, Buffer.from(png.data, 'base64'));
  }
  const storage = await evaluate('({local:localStorage.length,session:sessionStorage.length,external:performance.getEntriesByType("resource").filter(e=>new URL(e.name).origin!==location.origin).length})');
  assert.deepEqual(storage, { local: 0, session: 0, external: 0 });
  observations.push({ keyboard, storage });
} catch (failure) { error = String(failure?.stack || failure); }
finally {
  if (browser) cleanup = await closeIsolatedChrome(browser);
  const cleanupSummary = cleanup && { residual: cleanup.residual, uncertainty: cleanup.uncertainty, childExitCode: cleanup.childExitCode, treeTerminationConfirmed: cleanup.treeTerminationConfirmed, profileRemoved: cleanup.profileRemoved, remainingCount: cleanup.remainingDescendants?.length };
  await writeFile(`${output}/browser-observations.json`, JSON.stringify({ observations, error, cleanup: cleanupSummary }, null, 2));
  console.log(JSON.stringify({ checks: observations.length, error, cleanup: cleanupSummary }));
  if (error) process.exitCode = 1;
}
