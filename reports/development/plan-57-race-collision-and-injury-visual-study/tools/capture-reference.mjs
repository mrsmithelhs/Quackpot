// Pre-art synthetic references only. Run solely in a root-coordinated browser window.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const dir = 'reports/development/plan-57-race-collision-and-injury-visual-study/evidence/reference-02';
await mkdir(dir, { recursive: false }); // Never overwrite an earlier attempt.
let browser, error = null, cleanup = null, httpStatus = null, moduleStatus = null;
const exceptions = [], navigations = [];
const paths = ['gallery/index.html', 'gallery/gallery.css', 'gallery/gallery.mjs', 'gallery/fixtures.mjs', 'tools/capture-reference.mjs'];
const source = 'reports/development/plan-57-race-collision-and-injury-visual-study/';
const pins = {};
try {
  for (const path of paths) pins[source + path] = createHash('sha256').update(await readFile(source + path)).digest('hex');
  for (const path of ['src/ui/duck-rig-view.mjs', 'src/core/duck-rig.mjs', 'src/ui/race-motion-controller.mjs', 'src/ui/duck-motion-controller.mjs']) pins[path] = createHash('sha256').update(await readFile(path)).digest('hex');
  const response = await fetch('http://localhost:5173/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/', { signal: AbortSignal.timeout(5000) });
  httpStatus = response.status;
  if (!response.ok || !(await response.text()).includes('Collision and injury visual study')) throw Error(`Gallery HTTP/body check failed: ${httpStatus}`);
  const moduleResponse = await fetch('http://localhost:5173/Quackpot/src/ui/race-motion-controller.mjs', { signal: AbortSignal.timeout(5000) });
  moduleStatus = moduleResponse.status;
  if (!moduleResponse.ok || !(await moduleResponse.text()).includes('createRaceMotionController')) throw Error(`Motion module HTTP/body check failed: ${moduleStatus}`);
  browser = await launchIsolatedChrome();
  browser.cdp.socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails?.text ?? 'runtime exception');
    if (message.method === 'Page.frameNavigated' && !message.params.frame.parentId) navigations.push(message.params.frame.url);
  });
  const page = await createPage(browser.cdp, 'http://localhost:5173/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/', { viewport: { width: 1024, height: 900 } });
  const send = (method, params = {}) => browser.cdp.send(method, params, page.sessionId);
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (await evaluate(browser.cdp, page.sessionId, "document.querySelectorAll('.runner svg').length === 8")) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw Error('Gallery did not render eight synthetic ducks');
  const navigationCount = navigations.length;
  await evaluate(browser.cdp, page.sessionId, `(async () => {
    const { createRaceMotionController } = await import('/Quackpot/src/ui/race-motion-controller.mjs');
    window.referenceControllers = [...document.querySelectorAll('.stage')].map(stage => {
      const controller = createRaceMotionController(stage, { active: false });
      controller.playContact({ type: 'duck-contact', participants: ['A', 'B'] }, { seekPose: true });
      return controller;
    });
  })()`);
  for (const [name, selector] of [['race', '.study:first-child .stage'], ['closeup', '.study:nth-child(2) .stage']]) {
    if (navigations.length !== navigationCount || exceptions.length) throw Error('Navigation or runtime exception interrupted reference capture');
    const rect = await evaluate(browser.cdp, page.sessionId, `(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
    await writeFile(`${dir}/${name}.png`, Buffer.from(shot.data, 'base64'), { flag: 'wx' });
  }
  if (navigations.length !== navigationCount || exceptions.length) throw Error('Navigation or runtime exception interrupted reference capture');
  await browser.cdp.send('Target.disposeBrowserContext', { browserContextId: page.contextId });
} catch (e) { error = String(e); }
finally {
  if (browser) cleanup = await closeIsolatedChrome(browser);
  const accepted = cleanup?.rootExited === true && cleanup?.observedProcessesExited === true && cleanup?.inspectionFailed === false && cleanup?.residual === false && cleanup?.coverage === 'sampled-only' && cleanup?.uncertainty === true && cleanup?.profileRetained === true && cleanup?.treeTerminationConfirmed === false;
  const receipt = { disclaimer: 'Synthetic reference scene; production rig and paused contact pose, simplified course and placement; no race or injury outcome.', httpStatus, moduleStatus, pins, navigations, exceptions, error, cleanup, accepted };
  await writeFile(`${dir}/receipt.json`, JSON.stringify(receipt, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(receipt));
  if (error || !accepted) process.exitCode = 1;
}
