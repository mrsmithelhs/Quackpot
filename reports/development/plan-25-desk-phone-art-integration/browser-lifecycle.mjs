// Isolated Plan 25 production desk lifecycle witness. Uses a temporary Chrome profile and local preview only.
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.resolve('reports/development/plan-25-desk-phone-art-integration');
mkdirSync(outputDir, { recursive: true });
const profile = mkdtempSync(path.join(os.tmpdir(), 'quackpot-plan25-'));
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const previewPort = 4174;
const debugPort = 9223;
let preview;
let chrome;
let ws;
let overallTimer;
let pending = new Map();
let chromeStopPromise;
let previewStopPromise;
let previewError = null;
let chromeError = null;
let chromeExit = null;
let chromeStderr = '';
let targetDiscoveryError = 'not started';
const CHROME_STDERR_LIMIT = 8192;
const RUN_TIMEOUT_MS = 90000;
const SOCKET_TIMEOUT_MS = 5000;
const COMMAND_TIMEOUT_MS = 6000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function rejectPending(error) {
  for (const entry of pending.values()) {
    clearTimeout(entry.timer);
    entry.reject(error);
  }
  pending.clear();
}

async function until(fn, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await fn();
    if (value) return value;
    await delay(100);
  }
  throw new Error(`Timed out after ${timeout}ms`);
}

function assertPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => reject(new Error(`Refusing to use busy port ${port}: ${error.message}`)));
    server.listen(port, '127.0.0.1', () => server.close((error) => error ? reject(error) : resolve()));
  });
}

async function fetchJson(url, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchReady(url, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function waitForExit(child, timeout = 3000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return Promise.race([
    new Promise((resolve) => child.once('close', () => resolve(true))),
    delay(timeout).then(() => false),
  ]);
}

async function stopOwnedChild(child, processTree = false) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return true;
  if (processTree && process.platform === 'win32' && child.pid) {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    killer.on('error', () => {});
    await Promise.race([new Promise((resolve) => killer.once('close', resolve)), delay(3000)]);
    if (killer.exitCode === null && killer.signalCode === null) killer.kill();
  } else {
    child.kill();
  }
  return waitForExit(child);
}

function stopOwnedChrome() {
  if (!chromeStopPromise) chromeStopPromise = stopOwnedChild(chrome, true);
  return chromeStopPromise;
}

function stopOwnedPreview() {
  if (!previewStopPromise) previewStopPromise = stopOwnedChild(preview);
  return previewStopPromise;
}

function currentBuildAssets() {
  const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => reference.includes('/assets/'));
  return references.map((reference) => {
    const name = path.basename(reference);
    const assetPath = path.join(root, 'dist/assets', name);
    const hash = createHash('sha256').update(readFileSync(assetPath)).digest('hex');
    return { name, sha256: hash };
  });
}

try {
  overallTimer = setTimeout(() => {
    const error = new Error(`Overall Plan 25 browser witness exceeded ${RUN_TIMEOUT_MS}ms`);
    rejectPending(error);
    try { ws?.close(); } catch {}
    void stopOwnedChrome();
    void stopOwnedPreview();
  }, RUN_TIMEOUT_MS);
  await assertPortFree(previewPort);
  await assertPortFree(debugPort);
  preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'], { cwd: root, stdio: 'ignore' });
  preview.on('error', (error) => { previewError = error; });
  const url = `http://127.0.0.1:${previewPort}/Quackpot/`;
  await until(async () => { if (previewError) throw new Error(`Vite preview launch failed: ${previewError.message}`); return fetchReady(url); });
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`, '--remote-allow-origins=*',
    `--user-data-dir=${profile}`, '--window-size=1280,800', url,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  chrome.on('error', (error) => { chromeError = error; });
  chrome.stderr.on('data', (chunk) => {
    chromeStderr = (chromeStderr + chunk.toString('utf8')).slice(-CHROME_STDERR_LIMIT);
  });
  chrome.on('exit', (code, signal) => { chromeExit = { code, signal }; });
  let target;
  try {
    target = await until(async () => {
      if (chromeError) throw new Error(`Chrome launch failed: ${chromeError.message}`);
      if (chromeExit) throw new Error(`Chrome exited before target discovery (code=${chromeExit.code}, signal=${chromeExit.signal}); stderr=${chromeStderr || '(empty)'}`);
      try {
        const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
        const pageTarget = targets.find((item) => item.type === 'page' && item.url.startsWith(url));
        targetDiscoveryError = pageTarget ? 'target found' : `debug endpoint responded but no page target matched ${url}`;
        return pageTarget;
      } catch (error) {
        targetDiscoveryError = String(error?.message || error).slice(0, 500);
        return null;
      }
    });
  } catch (error) {
    throw new Error(`${error.message}; last target-discovery detail: ${targetDiscoveryError}; Chrome exit: ${JSON.stringify(chromeExit)}; stderr: ${chromeStderr || '(empty)'}`);
  }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error('CDP WebSocket connection failed'));
    }),
    delay(SOCKET_TIMEOUT_MS).then(() => { throw new Error(`CDP WebSocket open timed out after ${SOCKET_TIMEOUT_MS}ms`); }),
  ]);
  let nextId = 1;
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const entry = pending.get(message.id);
    if (entry) {
      pending.delete(message.id);
      clearTimeout(entry.timer);
      message.error ? entry.reject(new Error(message.error.message)) : entry.resolve(message.result);
    }
  };
  ws.onerror = () => rejectPending(new Error('CDP WebSocket reported an error'));
  ws.onclose = () => rejectPending(new Error('CDP WebSocket closed before the run completed'));
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP command "${method}" timed out after ${COMMAND_TIMEOUT_MS}ms`));
    }, COMMAND_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result?.value;
  };
  const waitForPage = (expression, timeout = 2000) => until(async () => evaluate(expression), timeout);
  const glowDebug = () => evaluate(`(() => { const g=document.querySelector('.apartment-phone-glow'),r=g?.getBoundingClientRect(),shells=[...document.querySelectorAll('[data-duck-motion]')],duckAnimations=[...document.querySelectorAll('[data-duck-motion] *')].flatMap(el=>el.getAnimations()),toggle=document.querySelector('[data-duck-motion-toggle]'); return {preference:matchMedia('(prefers-reduced-motion: reduce)').matches,visibility:document.visibilityState,connected:!!g?.isConnected,geometry:r&&{x:r.x,y:r.y,width:r.width,height:r.height},glowAnimations:g?.getAnimations().map(a=>({playState:a.playState,opacity:getComputedStyle(g).opacity,duration:a.effect.getTiming().duration})),duckShells:shells.length,duckAnimations:duckAnimations.map(a=>a.playState),motionToggleDisabled:toggle?.disabled}; })()`);
  const press = async (key, code, windowsVirtualKeyCode) => {
    const keyDown = { type: 'keyDown', key, code, windowsVirtualKeyCode };
    if (key === 'Enter') { keyDown.text = '\r'; keyDown.unmodifiedText = '\r'; }
    await send('Input.dispatchKeyEvent', keyDown);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode });
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await until(async () => evaluate('Boolean(document.querySelector("#btn-start-app"))'));
  const glowProgression = await evaluate(`(async () => {
    const glow = document.querySelector('.apartment-phone-glow');
    const samples = [];
    for (let i=0; i<5; i++) { samples.push(Number(getComputedStyle(glow).opacity)); await new Promise(resolve=>setTimeout(resolve,250)); }
    return { samples, animations: glow.getAnimations().map(a=>({duration:a.effect.getTiming().duration, infinite:a.effect.getTiming().iterations===Infinity && !Number.isFinite(a.effect.getTiming().iterations)})) };
  })()`);
  if (!glowProgression.animations.some((animation) => animation.duration === 3000 && animation.infinite)
      || Math.max(...glowProgression.samples) - Math.min(...glowProgression.samples) < .04) {
    throw new Error(`Normal-motion phone glow did not show the approved 3-second opacity cycle: ${JSON.stringify(glowProgression)}`);
  }
  const fresh = await evaluate(`(() => {
    const scene = document.querySelector('.apartment-desk-scene');
    const phone = document.querySelector('.apartment-phone-content');
    const button = document.querySelector('#btn-start-app');
    return { heading: document.querySelector('.apartment-phone-heading')?.textContent, message: document.querySelector('.apartment-phone-message')?.textContent,
      scene: scene && { width: scene.getBoundingClientRect().width, height: scene.getBoundingClientRect().height },
      button: button && { type: button.type, label: button.getAttribute('aria-label'), rect: (() => { const r=button.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })() },
      phoneRect: phone && (() => { const r=phone.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })(), overflow: document.documentElement.scrollWidth > innerWidth,
      controls: [...document.querySelectorAll('#companion-name-input,#desk-autosave-checkbox')].map((el) => el.id), svgText: scene?.querySelector('svg')?.textContent?.trim() || '' };
  })()`);
  await send('Page.captureScreenshot', { format: 'png' }).then(({ data }) => writeFileSync(path.join(outputDir, 'desk-desktop.png'), Buffer.from(data, 'base64')));
  const keyboard = await evaluate(`(() => { document.querySelector('#companion-name-input').focus(); return document.activeElement.id; })()`);
  await press('Tab', 'Tab', 9);
  const keyboardAutosave = await evaluate('document.activeElement.id');
  await press('Tab', 'Tab', 9);
  const keyboardLaunch = await evaluate('document.activeElement.id');
  if (keyboard !== 'companion-name-input' || keyboardAutosave !== 'desk-autosave-checkbox' || keyboardLaunch !== 'btn-start-app') {
    throw new Error(`Keyboard setup-to-launch order was unexpected: ${JSON.stringify({keyboard, keyboardAutosave, keyboardLaunch})}`);
  }
  const reduceMotion = async (value) => {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] });
    const expected = value === 'reduce';
    await waitForPage(`matchMedia('(prefers-reduced-motion: reduce)').matches === ${expected}`);
  };
  await reduceMotion('reduce');
  try {
    await waitForPage(`(() => { const glow=document.querySelector('.apartment-phone-glow'); return glow.getAnimations().length===0 && Math.abs(Number(getComputedStyle(glow).opacity)-.16)<.02; })()`);
  } catch {
    throw new Error(`Reduced-motion phone glow did not settle within 2 seconds: ${JSON.stringify(await glowDebug())}`);
  }
  const reducedGlow = await evaluate(`(() => { const glow=document.querySelector('.apartment-phone-glow'); return { opacity:Number(getComputedStyle(glow).opacity), animations:glow.getAnimations().length }; })()`);
  if (reducedGlow.animations !== 0 || Math.abs(reducedGlow.opacity - .16) > .02) throw new Error(`Reduced motion did not leave the static halo baseline: ${JSON.stringify(reducedGlow)}`);
  await reduceMotion('no-preference');
  await evaluate('document.querySelector("#btn-open-settings").click()');
  await until(async () => evaluate('Boolean(document.querySelector("[data-settings-phone-glow]"))'));
  await evaluate(`(() => { const input=document.querySelector('[data-settings-phone-glow]'); input.checked=false; input.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  const phoneGlowSettingOff = await evaluate(`document.querySelector('[data-settings-phone-glow]').checked`);
  await evaluate('document.querySelector("[data-settings-done]").click()');
  await until(async () => evaluate('!document.querySelector("[role=dialog]")'));
  await waitForPage('document.activeElement.id === "btn-open-settings"');
  const settingsFocus = await evaluate('document.activeElement.id');
  if (settingsFocus !== 'btn-open-settings') throw new Error(`Settings dismissal did not restore focus to its trigger: ${settingsFocus}`);
  const manualGlowOff = await evaluate(`(() => { const glow=document.querySelector('.apartment-phone-glow'); return { checked:${phoneGlowSettingOff}, opacity:Number(getComputedStyle(glow).opacity), animations:glow.getAnimations().length }; })()`);
  if (manualGlowOff.checked || manualGlowOff.animations !== 0 || Math.abs(manualGlowOff.opacity - .16) > .02) throw new Error(`Manual phone-glow pause did not leave the static baseline: ${JSON.stringify(manualGlowOff)}`);
  await evaluate('document.querySelector("#btn-open-settings").click()');
  await until(async () => evaluate('Boolean(document.querySelector("[data-settings-phone-glow]"))'));
  await evaluate(`(() => { const input=document.querySelector('[data-settings-phone-glow]'); input.checked=true; input.dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('[data-settings-done]').click(); })()`);
  await until(async () => evaluate('!document.querySelector("[role=dialog]")'));
  await waitForPage(`document.querySelector('.apartment-phone-glow')?.getAnimations().some(a=>a.effect.getTiming().duration===3000)`);
  const manualGlowOn = await evaluate(`(() => { const glow=document.querySelector('.apartment-phone-glow'); return { checked:true, animations:glow.getAnimations().map(a=>a.effect.getTiming().duration) }; })()`);
  if (!manualGlowOn.animations.includes(3000)) throw new Error(`Re-enabled phone glow did not resume its cycle: ${JSON.stringify(manualGlowOn)}`);
  await evaluate(`(() => { const input=document.querySelector('#companion-name-input'); input.value='Ada'; input.dispatchEvent(new Event('input',{bubbles:true})); input.focus(); })()`);
  await press('Tab', 'Tab', 9);
  await press('Tab', 'Tab', 9);
  const launchKeyboardTarget = await evaluate('document.activeElement.id');
  if (launchKeyboardTarget !== 'btn-start-app') throw new Error(`Keyboard setup did not reach the phone launch action after Settings: ${launchKeyboardTarget}`);
  await press('Enter', 'Enter', 13);
  await until(async () => !(await evaluate('Boolean(document.querySelector(".apartment-desk-scene"))')));
  await evaluate('location.reload()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-return-apartment"))'));
  const afterReload = await evaluate(`({ title: document.querySelector('.hud-companion-info')?.textContent.trim(), step: window.GameEngine ? 'engine-present' : 'no-engine', desk: Boolean(document.querySelector('.apartment-desk-scene')) })`);
  await evaluate('document.querySelector("#btn-return-apartment").click()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-start-app"))'));
  const returned = await evaluate(`({ heading: document.querySelector('.apartment-phone-heading')?.textContent, message: document.querySelector('.apartment-phone-message')?.textContent,
    companion: document.querySelector('.apartment-desk-copy')?.textContent.includes('Ada'), action: document.querySelector('#btn-start-app')?.textContent.trim(),
    overflow: document.documentElement.scrollWidth > innerWidth })`);

  await send('Emulation.setDeviceMetricsOverride', { width: 640, height: 720, deviceScaleFactor: 1, mobile: false });
  const intermediate = await evaluate(`(() => { const scene=document.querySelector('.apartment-desk-scene'), phone=document.querySelector('.apartment-phone-content'), glow=document.querySelector('.apartment-phone-glow'),s=scene.getBoundingClientRect(),p=phone.getBoundingClientRect(),g=glow.getBoundingClientRect(); return { requestedWidth:640, innerWidth, clientWidth:document.documentElement.clientWidth, visualViewportWidth:visualViewport.width, scrollbarWidth:innerWidth-document.documentElement.clientWidth, scene:{left:s.left,right:s.right,width:s.width}, phone:{left:p.left,right:p.right,width:p.width}, glowWidth:g.width, glowPosition:getComputedStyle(phone).position, glowAnimations:glow.getAnimations().length, scrollWidth:document.documentElement.scrollWidth }; })()`);
  if (intermediate.innerWidth !== 640 || intermediate.clientWidth > intermediate.innerWidth || intermediate.scrollbarWidth < 0 || intermediate.scrollbarWidth > 20
      || Math.abs(intermediate.visualViewportWidth - intermediate.clientWidth) > 1 || intermediate.scrollWidth > intermediate.clientWidth + 1
      || intermediate.scene.left < 0 || intermediate.scene.right > intermediate.clientWidth
      || intermediate.phone.left < intermediate.scene.left || intermediate.phone.right > intermediate.scene.right
      || intermediate.glowPosition !== 'relative' || intermediate.glowWidth > intermediate.phone.width + 1) {
    throw new Error(`Intermediate 640px CSS layout escaped its requested viewport: ${JSON.stringify(intermediate)}`);
  }

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 520, deviceScaleFactor: 1, mobile: false });
  const narrow = await evaluate(`(() => { const scene=document.querySelector('.apartment-desk-scene'), button=document.querySelector('#btn-start-app'), phone=document.querySelector('.apartment-phone-content'), glow=document.querySelector('.apartment-phone-glow'); const s=scene.getBoundingClientRect(),r=button.getBoundingClientRect(),p=phone.getBoundingClientRect(),g=glow.getBoundingClientRect(); return { requestedWidth:390, innerWidth, clientWidth:document.documentElement.clientWidth, visualViewportWidth:visualViewport.width, scrollbarWidth:innerWidth-document.documentElement.clientWidth, pageWidth:document.documentElement.scrollWidth,
    scene:{left:s.left,right:s.right,width:s.width}, phone:{left:p.left,right:p.right,width:p.width}, glowWidth:g.width, glowPosition:getComputedStyle(phone).position, button:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}, buttonWithinViewportWidth:r.width>0&&r.height>0&&r.left>=0&&r.right<=document.documentElement.clientWidth }; })()`);
  if (narrow.innerWidth !== 390 || narrow.clientWidth > narrow.innerWidth || narrow.scrollbarWidth < 0 || narrow.scrollbarWidth > 20
      || Math.abs(narrow.visualViewportWidth - narrow.clientWidth) > 1 || narrow.pageWidth > narrow.clientWidth + 1
      || narrow.scene.left < 0 || narrow.scene.right > narrow.clientWidth || narrow.phone.left < narrow.scene.left || narrow.phone.right > narrow.scene.right
      || narrow.glowPosition !== 'relative' || narrow.glowWidth > narrow.phone.width + 1 || !narrow.buttonWithinViewportWidth || narrow.button.height < 44) {
    throw new Error(`Narrow 390px CSS layout escaped its requested viewport: ${JSON.stringify(narrow)}`);
  }
  await send('Page.captureScreenshot', { format: 'png' }).then(({ data }) => writeFileSync(path.join(outputDir, 'desk-narrow.png'), Buffer.from(data, 'base64')));
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: false });
  const tiny = await evaluate(`(() => { const scene=document.querySelector('.apartment-desk-scene'),phone=document.querySelector('.apartment-phone-content'),button=document.querySelector('#btn-start-app'),r=button.getBoundingClientRect(),s=scene.getBoundingClientRect(),p=phone.getBoundingClientRect(); return { requestedWidth:320,innerWidth,clientWidth:document.documentElement.clientWidth,visualViewportWidth:visualViewport.width,scrollbarWidth:innerWidth-document.documentElement.clientWidth,buttonWithinViewportWidth:r.width>0&&r.height>0&&r.left>=0&&r.right<=document.documentElement.clientWidth,buttonWidth:r.width,buttonHeight:r.height,buttonTop:r.top,scene:{left:s.left,right:s.right,bottom:s.bottom},phone:{left:p.left,right:p.right},glowPosition:getComputedStyle(phone).position,scrollWidth:document.documentElement.scrollWidth }; })()`);
  if (tiny.innerWidth !== 320 || tiny.clientWidth > tiny.innerWidth || tiny.scrollbarWidth < 0 || tiny.scrollbarWidth > 20
      || Math.abs(tiny.visualViewportWidth - tiny.clientWidth) > 1 || tiny.scrollWidth > tiny.clientWidth + 1
      || tiny.scene.left < 0 || tiny.scene.right > tiny.clientWidth || tiny.phone.left < tiny.scene.left || tiny.phone.right > tiny.scene.right
      || tiny.glowPosition !== 'relative' || !tiny.buttonWithinViewportWidth || tiny.buttonHeight < 44) {
    throw new Error(`Tiny 320px CSS layout escaped its requested viewport: ${JSON.stringify(tiny)}`);
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await evaluate('document.querySelector("#btn-start-app").click()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-claim-pull"))'));
  const starterCopy = await evaluate('document.querySelector(".gacha-prompt")?.textContent.trim()');
  if (starterCopy !== 'Your first flock starts here. Ten free pulls—meet your racing team.') throw new Error(`Unexpected starter copy: ${starterCopy}`);
  await evaluate('document.querySelector("#btn-claim-pull").click()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-reveal-next"))'));
  await evaluate('document.querySelector("#btn-reveal-next").click()');
  await until(async () => evaluate('!document.querySelector("[data-duck-motion-toggle]").disabled'));
  await waitForPage(`[...document.querySelectorAll('[data-duck-motion] *')].some(el=>el.getAnimations().length>0)`);
  const motionButton = await evaluate(`(() => { const button=document.querySelector('[data-duck-motion-toggle]'); const all=document.querySelector('#btn-reveal-all'); const b=button.getBoundingClientRect(), a=all.getBoundingClientRect(); return { before:{label:button.getAttribute('aria-label'), title:button.title, pressed:button.getAttribute('aria-pressed'), size:{width:b.width,height:b.height}, rightOfRevealAll:b.left>=a.right-1} }; })()`);
  if (motionButton.before.size.width < 44 || motionButton.before.size.height < 44 || !motionButton.before.rightOfRevealAll) throw new Error(`Motion toggle target/placement failed: ${JSON.stringify(motionButton)}`);
  await evaluate('document.querySelector("[data-duck-motion-toggle]").click()');
  const motionPaused = await evaluate(`(() => { const b=document.querySelector('[data-duck-motion-toggle]'); const animations=[...document.querySelectorAll('[data-duck-motion] *')].flatMap(el=>el.getAnimations()); return {label:b.getAttribute('aria-label'),title:b.title,pressed:b.getAttribute('aria-pressed'),icon:b.querySelector('[data-duck-motion-icon]').textContent,liveAnimations:animations.length,pausedAnimations:animations.filter(a=>a.playState==='paused').length}; })()`);
  await evaluate('document.querySelector("[data-duck-motion-toggle]").click()');
  const motionResumed = await evaluate(`(() => { const b=document.querySelector('[data-duck-motion-toggle]'); const animations=[...document.querySelectorAll('[data-duck-motion] *')].flatMap(el=>el.getAnimations()); return {label:b.getAttribute('aria-label'),title:b.title,pressed:b.getAttribute('aria-pressed'),icon:b.querySelector('[data-duck-motion-icon]').textContent,liveAnimations:animations.length,runningAnimations:animations.filter(a=>a.playState==='running').length}; })()`);
  if (motionPaused.pressed !== 'true' || motionPaused.label !== 'Resume duck motion' || motionPaused.title !== motionPaused.label || motionPaused.icon !== '▶'
      || motionPaused.liveAnimations === 0 || motionPaused.pausedAnimations !== motionPaused.liveAnimations
      || motionResumed.pressed !== 'false' || motionResumed.label !== 'Pause duck motion' || motionResumed.title !== motionResumed.label || motionResumed.icon !== 'Ⅱ'
      || motionResumed.liveAnimations === 0 || motionResumed.runningAnimations !== motionResumed.liveAnimations) {
    throw new Error(`Motion toggle accessible state did not update: ${JSON.stringify({motionPaused,motionResumed})}`);
  }
  await evaluate('document.querySelector("#btn-reveal-all").click()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-gacha-proceed"))'));
  const allRevealedMotion = await evaluate(`(() => { const button=document.querySelector('[data-duck-motion-toggle]'); const actions=document.querySelector('.gacha-theater-actions'); const r=button.getBoundingClientRect(); return { exists:!!button, insideActions:actions?.contains(button), size:{width:r.width,height:r.height}, revealAllRemoved:!document.querySelector('#btn-reveal-all') }; })()`);
  if (!allRevealedMotion.exists || !allRevealedMotion.insideActions || allRevealedMotion.size.width < 44 || allRevealedMotion.size.height < 44 || !allRevealedMotion.revealAllRemoved) throw new Error(`All-revealed motion control did not persist correctly: ${JSON.stringify(allRevealedMotion)}`);
  const preReducedDuckMotion = await evaluate(`(() => { const shells=[...document.querySelectorAll('[data-duck-motion]')]; const animations=[...document.querySelectorAll('[data-duck-motion] *')].flatMap(el=>el.getAnimations()); return {shellCount:shells.length,liveAnimations:animations.length}; })()`);
  if (preReducedDuckMotion.shellCount === 0 || preReducedDuckMotion.liveAnimations === 0) throw new Error(`Reduced-motion parity check had no live digital-duck motion to stop: ${JSON.stringify(preReducedDuckMotion)}`);
  await reduceMotion('reduce');
  try {
    await waitForPage(`(() => { const button=document.querySelector('[data-duck-motion-toggle]'); const animated=[...document.querySelectorAll('[data-duck-motion] *')].reduce((n,el)=>n+el.getAnimations().length,0); return button.disabled && animated===0; })()`);
  } catch {
    throw new Error(`Reduced-motion duck state did not settle within 2 seconds: ${JSON.stringify(await glowDebug())}`);
  }
  const reducedDuckMotion = await evaluate(`(() => { const button=document.querySelector('[data-duck-motion-toggle]'); const animated=[...document.querySelectorAll('[data-duck-motion] *')].reduce((n,el)=>n+el.getAnimations().length,0); return { disabled:button.disabled, pressed:button.getAttribute('aria-pressed'), reason:document.querySelector('#gacha-motion-help').textContent, animated }; })()`);
  if (!reducedDuckMotion.disabled || !reducedDuckMotion.reason.includes('reduced motion') || reducedDuckMotion.animated !== 0) throw new Error(`Reduced-motion duck state was not static and explained: ${JSON.stringify(reducedDuckMotion)}`);
  const record = { browser: 'Chrome isolated temporary profile', build: 'local Vite preview from current production build', buildAssets: currentBuildAssets(), glowProgression, reducedGlow, manualGlowOff, manualGlowOn, keyboard:{ setup:keyboard, autosave:keyboardAutosave, launch:keyboardLaunch, launchAfterSettingsFocus:launchKeyboardTarget }, settingsFocus, starterCopy, motionButton, motionPaused, motionResumed, allRevealedMotion, preReducedDuckMotion, reducedDuckMotion, fresh, afterReload, returned, intermediate, narrow, tiny };
  writeFileSync(path.join(outputDir, 'browser-lifecycle.json'), JSON.stringify(record, null, 2));
  ws.close();
  console.log(JSON.stringify(record, null, 2));
} catch (error) {
  const failure = {
    occurredAt: new Date().toISOString(),
    error: String(error?.stack || error).slice(0, 12000),
    buildAssets: (() => { try { return currentBuildAssets(); } catch (assetError) { return { error: String(assetError?.message || assetError) }; } })(),
    targetDiscoveryError,
    chromeExit,
    chromeStderr,
  };
  writeFileSync(path.join(outputDir, 'browser-lifecycle-failure.json'), JSON.stringify(failure, null, 2));
  throw error;
} finally {
  clearTimeout(overallTimer);
  rejectPending(new Error('Plan 25 browser witness is cleaning up'));
  try { ws?.close(); } catch {}
  const chromeStopped = await stopOwnedChrome();
  const previewStopped = await stopOwnedPreview();
  if (chromeStopped && previewStopped) {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); }
    catch (error) { console.warn(`Temporary profile cleanup note: ${error.message}`); }
  } else {
    console.warn('Owned browser or preview child did not exit before cleanup timeout; preserved its profile for inspection.');
  }
}
