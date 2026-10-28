import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:net';

const root = process.cwd();
const outDir = path.resolve('reports/development/plan-22-race-entry-and-duck-rest');
const origin = 'http://127.0.0.1:5181/Quackpot/';
const host = '127.0.0.1';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, host, resolve); });
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}
async function waitUrl(url, timeout = 12000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
const browserPath = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
if (!browserPath) throw new Error('No Chrome or Edge executable in the approved system install paths.');
await waitUrl(origin, 3000);
const cdpPort = await freePort();
const profileRoot = path.resolve(outDir);
const profileDir = mkdtempSync(path.join(profileRoot, '.plan22-isolated-profile-'));
let browser;
let socket;
let browserErrorOutput = '';
const results = { url: origin, browserPath, viewportCases: [], observations: [] };

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 0; this.pending = new Map(); }
  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', ({ data }) => {
      const msg = JSON.parse(data); if (!msg.id) return;
      const pending = this.pending.get(msg.id); if (!pending) return;
      this.pending.delete(msg.id); msg.error ? pending.reject(new Error(msg.error.message)) : pending.resolve(msg.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Page evaluation failed');
    return result.result?.value;
  }
  async waitFor(expression, label, timeout = 8000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { if (await this.evaluate(expression)) return; await wait(50); }
    throw new Error(`Timed out waiting for ${label}`);
  }
  async click(selector) {
    const ok = await this.evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
    if (!ok) throw new Error(`Missing element ${selector}`);
  }
  async screenshot(name) {
    const shot = await this.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(outDir, name), Buffer.from(shot.data, 'base64'));
  }
  async fullPageScreenshot(name) {
    const metrics = await this.send('Page.getLayoutMetrics');
    const size = metrics.cssContentSize;
    const shot = await this.send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: size.width, height: size.height, scale: 1 },
    });
    writeFileSync(path.join(outDir, name), Buffer.from(shot.data, 'base64'));
  }
  close() { this.socket.close(); }
}

try {
  browser = spawn(browserPath, [
    '--headless=new', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profileDir}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
    '--remote-allow-origins=*', '--disable-crash-reporter', '--disable-crashpad',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  browser.stderr.on('data', (chunk) => { browserErrorOutput += chunk.toString(); });
  const endpoint = `http://${host}:${cdpPort}/json/version`;
  const endpointDeadline = Date.now() + 12000;
  while (Date.now() < endpointDeadline && browser.exitCode === null) {
    try { const response = await fetch(endpoint); if (response.ok) break; } catch {}
    await wait(100);
  }
  if (browser.exitCode !== null) throw new Error(`Isolated browser exited before CDP startup (code ${browser.exitCode}, signal ${browser.signalCode}): ${browserErrorOutput}`);
  await waitUrl(endpoint, 1000);
  const targets = await (await fetch(`http://${host}:${cdpPort}/json/list`)).json();
  const target = targets.find((item) => item.type === 'page');
  if (!target) throw new Error('Isolated browser did not expose a page target.');
  socket = new Cdp(target.webSocketDebuggerUrl);
  await socket.connect();
  await socket.send('Page.enable');
  await socket.send('Runtime.enable');
  await socket.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

  const viewports = [
    { width: 1280, height: 720, motion: 'reduce' },
    { width: 390, height: 844, motion: 'reduce' },
    { width: 1280, height: 720, motion: 'no-preference' },
  ];
  for (const viewport of viewports) {
    await socket.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: viewport.motion }] });
    await socket.send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.width < 500 });
    await socket.send('Page.navigate', { url: origin });
    await socket.waitFor('Boolean(document.querySelector("#btn-start-app"))', 'fresh isolated desk');
    await socket.evaluate('localStorage.clear(); sessionStorage.clear()');
    const storageBefore = await socket.evaluate('({save:localStorage.getItem("quackpot_save_v1"), origin:location.origin})');
    if (storageBefore.save !== null) throw new Error('Owned isolated profile storage reset did not leave a fresh app state.');
    await socket.click('#btn-start-app');
    await socket.waitFor('Boolean(document.querySelector("#btn-claim-pull"))', 'welcome gacha');
    await socket.click('#btn-claim-pull');
    await socket.waitFor('Boolean(document.querySelector("#btn-reveal-all"))', 'pull reveal controls');
    await socket.click('#btn-reveal-all');
    await socket.waitFor('Boolean(document.querySelector("#btn-gacha-proceed"))', 'completed welcome pull');
    await socket.click('#btn-gacha-proceed');
    await socket.waitFor('Boolean(document.querySelector("[data-race-form]"))', 'race-entry form');
    await socket.evaluate('window.scrollTo(0,0)');
    const entryAtPageTop = await socket.evaluate(`(() => ({
      viewport:{width:innerWidth,height:innerHeight},scrollY,
      candidateCount:document.querySelectorAll('.race-candidate-card').length,
      choiceEvents:JSON.parse(localStorage.getItem('quackpot_save_v1')||'null')?.eventLog?.filter(e=>e.type==='race_choice_offered').length||0,
      trialEvents:JSON.parse(localStorage.getItem('quackpot_save_v1')||'null')?.eventLog?.filter(e=>e.type==='race_trial_offer_shown').length||0
    }))()`);
    await socket.evaluate(`(() => {
      document.querySelector('.race-view-header')?.scrollIntoView({block:'start'});
      const header=document.querySelector('.race-view-header')?.getBoundingClientRect();
      const hud=document.querySelector('#hud-container')?.getBoundingClientRect();
      if(header&&hud)window.scrollBy(0,header.top-hud.bottom+12);
    })()`);
    await wait(150);
    const listTopExposure = await socket.evaluate(`(() => {
      const save=JSON.parse(localStorage.getItem('quackpot_save_v1')||'null');
      const cardIds=[...document.querySelectorAll('.race-candidate-card')].filter(card=>{
        const r=card.getBoundingClientRect();const h=document.querySelector('#hud-container')?.getBoundingClientRect();
        const covered=h&&getComputedStyle(document.querySelector('#hud-container')).position==='sticky'&&h.top<=0&&h.bottom>0&&r.top<h.bottom&&r.right>h.left&&r.left<h.right;
        return !covered&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;
      }).map(card=>card.dataset.candidateId);
      const event=save?.eventLog?.filter(e=>e.type==='race_choice_offered').at(-1);
      return {fullyVisibleDuckIds:cardIds,loggedDuckIds:event?.payload?.candidates?.map(c=>c.duckId)||[],trialEvents:save?.eventLog?.filter(e=>e.type==='race_trial_offer_shown').length||0};
    })()`);
    if (JSON.stringify([...listTopExposure.fullyVisibleDuckIds].sort()) !== JSON.stringify([...listTopExposure.loggedDuckIds].sort())) {
      throw new Error(`Choice exposure did not match fully visible cards at the scrolled race entry: ${JSON.stringify(listTopExposure)}`);
    }
    const suffix = viewport.width < 500 ? '390x844' : `${viewport.width}x${viewport.height}-${viewport.motion}`;
    await socket.screenshot(`entry-${suffix}.png`);
    await socket.fullPageScreenshot(`entry-full-${suffix}.png`);
    const observation = await socket.evaluate(`(() => {
      const cards=[...document.querySelectorAll('.race-candidate-card')];
      const form=document.querySelector('[data-race-form]');
      const submit=form?.querySelector('button[type="submit"]');
      const active=document.activeElement;
      const rect=(el)=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
      return {viewport:{width:innerWidth,height:innerHeight},url:location.href,title:document.querySelector('.race-view-header h2')?.textContent,
        cards:cards.map(c=>({id:c.dataset.candidateId,name:c.querySelector('.race-candidate-name')?.textContent,
          authored:c.querySelector('.race-candidate-meta')?.textContent,effective:c.querySelector('.race-candidate-effective')?.textContent,
          reason:c.querySelector('.race-candidate-reason')?.textContent,checked:c.querySelector('input')?.checked,rect:rect(c),
          art:{svg:!!c.querySelector('.race-candidate-art svg'),label:c.querySelector('.race-candidate-art svg')?.getAttribute('aria-label'),rect:rect(c.querySelector('.race-candidate-art'))},
          display:getComputedStyle(c).display,visibility:getComputedStyle(c).visibility})),
        allSelectable:cards.length>0&&cards.every(c=>!c.querySelector('input').disabled),
        restExplanation:document.querySelector('.race-rest-note')?.textContent,
        trial:document.querySelector('[data-race-trial]')?.innerText,trialInput:!!document.querySelector('input[name="useTrial"]'),
        submit:submit?.innerText,submitDisabled:submit?.disabled,formRect:rect(form),
        scroll:{height:document.documentElement.scrollHeight,client:document.documentElement.clientHeight,y:scrollY},activeTag:active?.tagName,activeName:active?.getAttribute('aria-label')||active?.textContent};
    })()`);
    if (!observation.cards.length || !observation.allSelectable || observation.cards.some((c) => c.display === 'none' || c.visibility === 'hidden' || !c.art.svg || c.art.rect.width === 0)) {
      throw new Error(`Candidate exposure/selectability failed at ${viewport.width}: ${JSON.stringify(observation)}`);
    }
    await socket.evaluate('document.querySelectorAll("input[name=duckId]")[1]?.focus()');
    await socket.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 });
    await socket.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 });
    const keyboardSelection = await socket.evaluate('({active:document.activeElement?.value,selected:document.querySelector("input[name=duckId]:checked")?.value})');
    if (!keyboardSelection.selected || keyboardSelection.active !== keyboardSelection.selected) throw new Error(`Keyboard radio selection failed: ${JSON.stringify(keyboardSelection)}`);
    observation.keyboardSelection = keyboardSelection;
    await socket.evaluate('document.querySelector("input[name=duckId]:checked")?.blur()');
    await socket.evaluate('document.querySelector("[data-race-trial]")?.scrollIntoView({block:"center"})');
    await wait(150);
    const trialPanelVisible = await socket.evaluate(`(() => {const e=document.querySelector('[data-race-trial]');const r=e?.getBoundingClientRect();return !!r&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()`);
    if (!trialPanelVisible) throw new Error('Harness failed to bring the trial choice fully into the viewport before interaction.');
    const trialButtonEnabled = await socket.evaluate('Boolean(document.querySelector("[data-buy-race-trial]:not(:disabled)"))');
    if (trialButtonEnabled) {
      await socket.click('[data-buy-race-trial]');
      await socket.waitFor('Boolean(document.querySelector("input[name=useTrial]"))', 'purchased one-race speed upgrade choice');
      await socket.evaluate('document.querySelector("input[name=useTrial]").click()');
      await socket.evaluate(`(() => {
        document.querySelector('.race-view-header')?.scrollIntoView({block:'start'});
        const header=document.querySelector('.race-view-header')?.getBoundingClientRect();
        const hud=document.querySelector('#hud-container')?.getBoundingClientRect();
        if(header&&hud)window.scrollBy(0,header.top-hud.bottom+12);
      })()`);
      await wait(150);
      const trialValues = await socket.evaluate('[...document.querySelectorAll("[data-candidate-effective]")].map(e=>e.textContent)');
      if (!trialValues.every((value) => value.includes('with upgrade'))) throw new Error(`Displayed candidate race ratings did not refresh for the selected one-race speed upgrade: ${JSON.stringify(trialValues)}`);
      observation.trialSelection = { checked: true, displayedRatings: trialValues };
      await socket.screenshot(`trial-entry-${suffix}.png`);
    } else observation.trialSelection = { available: false, note: 'Isolated deterministic free pull yielded insufficient Down for purchase; no synthetic state was inserted.' };
    const firstExposure = await socket.evaluate(`(() => {
      const save=JSON.parse(localStorage.getItem('quackpot_save_v1')||'null');
      const event=save?.eventLog?.filter(e=>e.type==='race_choice_offered').at(-1);
      return {visibleDuckIds:event?.payload?.candidates?.map(c=>c.duckId)||[],trialEvents:save?.eventLog?.filter(e=>e.type==='race_trial_offer_shown').length||0};
    })()`);
    await socket.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await wait(150);
    const finalExposure = await socket.evaluate(`(() => {
      const save=JSON.parse(localStorage.getItem('quackpot_save_v1')||'null');
      const events=save?.eventLog?.filter(e=>e.type==='race_choice_offered')||[];
      return {candidateIds:[...new Set(events.flatMap(e=>e.payload?.candidates?.map(c=>c.duckId)||[]))],
        expectedIds:[...document.querySelectorAll('.race-candidate-card')].map(c=>c.dataset.candidateId),
        trialEvents:save?.eventLog?.filter(e=>e.type==='race_trial_offer_shown').length||0};
    })()`);
    if (JSON.stringify([...finalExposure.candidateIds].sort()) !== JSON.stringify([...finalExposure.expectedIds].sort())) {
      throw new Error(`Scrolling did not record all owned candidates actually exposed across viewports: ${JSON.stringify({ firstExposure, finalExposure })}`);
    }
    if (viewport.width < 500 && entryAtPageTop.candidateCount > firstExposure.visibleDuckIds.length) {
      results.observations.push({ narrowInitialPartialExposure: true, firstVisible: firstExposure.visibleDuckIds.length, totalOwned: entryAtPageTop.candidateCount });
    }
    observation.exposureProof = { entryAtPageTop, listTopExposure, firstExposure, finalExposure };
    results.viewportCases.push(observation);
    results.observations.push({ screenshot: `entry-${suffix}.png`, fullPageScreenshot: `entry-full-${suffix}.png`, mechanism: 'separate Chrome process', profileIsolated: true, reducedMotionPreference: viewport.motion });
    await socket.evaluate('localStorage.clear(); sessionStorage.clear()');
    const priorTimeOrigin = await socket.evaluate('performance.timeOrigin');
    await socket.send('Page.reload', { ignoreCache: true });
    await socket.waitFor(`performance.timeOrigin !== ${priorTimeOrigin} && document.readyState === 'complete' && Boolean(document.querySelector("#btn-start-app"))`, 'isolated storage reset after viewport case');
  }
  // A real story journey: race the same owned identity twice, with the existing
  // story's rent/recovery segment between races. This demonstrates tired-card
  // selectability and a committed 0.50 factor without inserting history.
  await socket.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await socket.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await socket.send('Page.navigate', { url: origin });
  await socket.waitFor('Boolean(document.querySelector("#btn-start-app"))', 'fresh story journey desk');
  await socket.evaluate('localStorage.clear(); sessionStorage.clear()');
  await socket.click('#btn-start-app');
  await socket.waitFor('Boolean(document.querySelector("#btn-claim-pull"))', 'story welcome gacha');
  await socket.click('#btn-claim-pull');
  await socket.waitFor('Boolean(document.querySelector("#btn-reveal-all"))', 'story pull reveal controls');
  await socket.click('#btn-reveal-all');
  await socket.waitFor('Boolean(document.querySelector("#btn-gacha-proceed"))', 'story completed pull');
  await socket.click('#btn-gacha-proceed');
  await socket.waitFor('Boolean(document.querySelector("[data-race-form]"))', 'story race one entry');
  await socket.evaluate('document.querySelector(".race-candidate-list")?.scrollIntoView({block:"start"})');
  const raceOneDuckId = await socket.evaluate('document.querySelector("input[name=duckId]:checked")?.value');
  if (!raceOneDuckId) throw new Error('Story race one had no selected owned duck.');
  await socket.evaluate('document.querySelector(".race-start-button")?.scrollIntoView({block:"center"})');
  await wait(100);
  await socket.click('.race-start-button');
  await socket.waitFor('Boolean(document.querySelector("[data-race-result-summary]")) && Boolean(document.querySelector("[data-race-proceed]:not(:disabled)"))', 'story race one completed result', 45000);
  const raceOne = await socket.evaluate(`(() => JSON.parse(localStorage.getItem('quackpot_save_v1')||'null'))()`);
  const raceOneResult = raceOne?.eventLog?.find(entry=>entry.type==='race_result'&&entry.payload.raceNumber===1);
  if (!raceOneResult || raceOneResult.payload.duckId !== raceOneDuckId) throw new Error('First story race did not finish with the selected identity.');
  await socket.click('[data-race-proceed]');
  await socket.waitFor('Boolean(document.querySelector("#btn-buy-starter"))', 'story starter offer');
  await socket.click('#btn-buy-starter');
  await socket.waitFor('Boolean(document.querySelector("#btn-pay-rent"))', 'story rent bill');
  await socket.click('#btn-pay-rent');
  await socket.waitFor('Boolean(document.querySelector("#btn-accept-escalation"))', 'story rent recovery choice');
  await socket.click('#btn-accept-escalation');
  await socket.waitFor('Boolean(document.querySelector("[data-race-form]"))', 'story race two entry', 12000);
  const escapedRaceOneId = JSON.stringify(raceOneDuckId);
  await socket.evaluate(`document.querySelector('[data-candidate-id='+${escapedRaceOneId}+']')?.scrollIntoView({block:'center'})`);
  await wait(120);
  const tiredCard = await socket.evaluate(`(() => {
    const card=document.querySelector('[data-candidate-id='+${escapedRaceOneId}+']');
    const input=card?.querySelector('input[name="duckId"]');
    const rating=Number(card?.querySelector('.race-candidate-meta')?.textContent.match(/speed rating ([\\d.]+)/)?.[1]);
    return {id:card?.dataset.candidateId,reason:card?.querySelector('.race-candidate-reason')?.textContent,
      raceRating:card?.querySelector('.race-candidate-effective')?.textContent,authoredRating:rating,
      selectable:!!input&&!input.disabled,checked:input?.checked,svg:!!card?.querySelector('.race-candidate-art svg')};
  })()`);
  if (!tiredCard.selectable || !tiredCard.reason?.includes('50% lower') || !tiredCard.raceRating?.includes(`Race rating ${tiredCard.authoredRating * 0.5}`)) {
    throw new Error(`Previously raced duck was not visibly selectable with its 50% rest input: ${JSON.stringify(tiredCard)}`);
  }
  await socket.evaluate(`document.querySelector('[data-candidate-id='+${escapedRaceOneId}+'] input[name="duckId"]')?.click()`);
  if (!(await socket.evaluate(`document.querySelector('[data-candidate-id='+${escapedRaceOneId}+'] input[name="duckId"]')?.checked`))) {
    throw new Error('Tired duck could not be selected on the second story race.');
  }
  await socket.screenshot('tired-selectable-390x844.png');
  await socket.evaluate('document.querySelector(".race-start-button")?.scrollIntoView({block:"center"})');
  await wait(100);
  await socket.click('.race-start-button');
  await socket.waitFor('Boolean(document.querySelector("[data-race-result-summary]")) && Boolean(document.querySelector("[data-race-proceed]:not(:disabled)"))', 'story race two completed result', 45000);
  const raceTwo = await socket.evaluate(`(() => JSON.parse(localStorage.getItem('quackpot_save_v1')||'null'))()`);
  const raceTwoResult = raceTwo?.eventLog?.find(entry=>entry.type==='race_result'&&entry.payload.raceNumber===2);
  const raceTwoAttempt = raceTwo?.state?.raceAttempts?.[2];
  const raceTwoAction = raceTwo?.eventLog?.find(entry=>entry.type==='action'&&entry.payload?.kind==='race_choice'&&entry.payload?.raceId==='R02');
  const raceTwoResolution = raceTwo?.state?.raceResolutions?.R02?.metadata?.inputs;
  if (!raceTwoResult || raceTwoResult.payload.duckId !== raceOneDuckId || raceTwoResult.payload.restEvidence?.restFactor !== 0.5
    || raceTwoAttempt?.restEvidence?.restFactor !== 0.5 || raceTwoAction?.payload?.restEvidence?.restFactor !== 0.5
    || raceTwoResolution?.restFactor !== 0.5 || raceTwoResolution?.playerBaseSpeed !== tiredCard.authoredRating * 0.5) {
    throw new Error(`The actual second story race failed to persist the selected tired input consistently: ${JSON.stringify({ raceOneDuckId, tiredCard, result: raceTwoResult?.payload, attempt: raceTwoAttempt, action: raceTwoAction?.payload, inputs: raceTwoResolution })}`);
  }
  await socket.click('[data-race-proceed]');
  await socket.waitFor('Boolean(document.querySelector("#receipt-paper"))', 'story receipt after race two');
  const receiptText = await socket.evaluate('document.querySelector("#receipt-paper")?.innerText');
  if (!receiptText?.includes('50% rest penalty')) throw new Error('Actual story Receipt did not attribute the logged tired race choice.');
  results.tiredSecondRace = {
    screenshot: 'tired-selectable-390x844.png', storyJourney: ['race 1 finished', 'starter purchase', 'rent recovery choice', 'race 2 finished'],
    duckId: raceOneDuckId, candidate: tiredCard, selected: true, committedRestFactor: raceTwoResult.payload.restEvidence.restFactor,
    attemptRestFactor: raceTwoAttempt.restEvidence.restFactor, actionRestFactor: raceTwoAction.payload.restEvidence.restFactor,
    resolverRestFactor: raceTwoResolution.restFactor, receiptMentionsPenalty: true,
  };
  await socket.evaluate('localStorage.clear(); sessionStorage.clear()');
  await socket.send('Page.reload', { ignoreCache: true });
  results.cleanup = { localStorageCleared: true, profilePath: profileDir };
} catch (error) {
  results.error = error.stack || String(error);
  results.browserExit = browser ? { code: browser.exitCode, signal: browser.signalCode, stderr: browserErrorOutput } : null;
  throw error;
} finally {
  socket?.close();
  if (browser && browser.exitCode === null) { browser.kill(); await wait(300); if (browser.exitCode === null) browser.kill(); }
  const resolvedRoot = path.resolve(profileRoot) + path.sep;
  const resolvedProfile = path.resolve(profileDir);
  if (!resolvedProfile.startsWith(resolvedRoot)) throw new Error(`Refusing cleanup outside exact Plan 22 profile root: ${resolvedProfile}`);
  rmSync(resolvedProfile, { recursive: true, force: true });
  results.cleanup ??= {};
  results.cleanup.profileRemoved = true;
  writeFileSync(path.join(outDir, 'browser-results.json'), `${JSON.stringify(results, null, 2)}\n`);
}
