import { launchIsolatedChrome, closeIsolatedChrome } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { writeFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import { visits } from './scenarios.mjs';
const dir = 'reports/development/plan-54-gacha-progression-and-return-visits/comparison/evidence';
let browser, error = null, cleanup = null;
try {
  for (const scenario of Object.values(visits)) for (const model of ['collection','competition','event']) for (const version of ['lean','richer']) {
    const item = scenario[model][version];
    assert.doesNotMatch([item.title,item.lead,item.card,...item.choices].join(' '), /\b(proposed|illustrative|illustrated|this example)\b/i);
  }
  browser = await launchIsolatedChrome();
  const { targetId } = await browser.cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params = {}) => browser.cdp.send(method, params, sessionId);
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:5173/Quackpot/reports/development/plan-54-gacha-progression-and-return-visits/comparison/' });
  let ready = false;
  for (let i=0;i<60;i++) { if (await evaluate('document.readyState === "complete" && !!document.querySelector("#screen h2")')) { ready=true; break; } await new Promise(r=>setTimeout(r,100)); }
  assert.ok(ready, 'comparison loaded');
  for (const model of ['collection','competition']) {
    await evaluate(`(() => { for (const [id,value] of Object.entries(${JSON.stringify({visit:'return',variant:'richer'})})) { const el=document.getElementById(id); el.value=value; el.dispatchEvent(new Event('change',{bubbles:true})); } const el=document.getElementById('model'); el.value=${JSON.stringify(model)}; el.dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('.phone').scrollIntoView({block:'start'}); })()`);
    const shown = await evaluate('document.querySelector("#screen").innerText');
    assert.doesNotMatch(shown, /\b(proposed|illustrative|illustrated|this example)\b/i);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), true);
    const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(`${dir}/final-narrow-${model}-richer.png`,Buffer.from(png.data,'base64'));
  }
} catch (failure) { error=String(failure?.stack || failure); }
finally {
  if (browser) cleanup=await closeIsolatedChrome(browser);
  const summary=cleanup && {residual:cleanup.residual,uncertainty:cleanup.uncertainty,childExitCode:cleanup.childExitCode,treeTerminationConfirmed:cleanup.treeTerminationConfirmed,profileRemoved:cleanup.profileRemoved,remainingCount:cleanup.remainingDescendants?.length};
  await writeFile(`${dir}/wording-observations.json`,JSON.stringify({checkedBodies:18,captures:['return/collection/richer','return/competition/richer'],error,cleanup:summary},null,2));
  console.log(JSON.stringify({error,cleanup:summary})); if(error)process.exitCode=1;
}
