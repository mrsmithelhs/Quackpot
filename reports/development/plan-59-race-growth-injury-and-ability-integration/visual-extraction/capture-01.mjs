// Finite isolated report-only capture. No gameplay state or production mount.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, mkdtemp, copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { assessCapture, publicCleanup } from './capture-policy.mjs';

const base = 'reports/development/plan-59-race-growth-injury-and-ability-integration/visual-extraction/';
const out = `${base}capture-01`;
await mkdir(out, { recursive: false });
const art = ['pop','chip1','chip2','chip3','chip4','A-onset','A-expansion','A-breakup','A-settle','adhesive-bandage'];
const paths = [
  ...['index.html','visual-fixture.css','visual-fixture.mjs','timeline-fixture.mjs','capture-policy.mjs','capture-01.mjs'].map((x) => base+x),
  'src/ui/race-effects/ability-effects.mjs','src/ui/race-effects/collision-effects.mjs','src/ui/race-effects/visual-effects.test.mjs','src/ui/duck-rig-view.mjs','src/core/duck-rig.mjs',
  ...art.map((x) => `src/assets/svg/race-effects/${x}.svg`),
  ...['revision-effects.mjs','candidate-effects.mjs','alternatives-effects.mjs','final-three-effects.mjs','fixtures.mjs'].map((x) => `reports/development/plan-58-race-ability-animation-study/gallery/${x}`),
  'reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',
  'scripts/dev/checkpoints/cdp.mjs','scripts/dev/checkpoints/process-cleanup-policy.mjs','scripts/dev/checkpoints/process-tree.mjs',
];
const kinds = ['bounce','crowd','guard','recovery','dive','wide','ahead','draft','straight','steady','wake','pop','fragments','burst','injury','white-return'];
const pins = {}, results = [], exceptions = [], navigations = [];
let browser, server, root, serverExit = null, cleanup = null, error = null, focusedTest = null;
try {
  root = await mkdtemp(join(tmpdir(), 'plan59-visual-snapshot-'));
  for (const path of paths) {
    const data = await readFile(path); pins[path] = createHash('sha256').update(data).digest('hex');
    const target = join(root,path); await mkdir(dirname(target), { recursive: true }); await copyFile(path,target);
  }
  focusedTest = await new Promise((resolve,reject) => {
    const child = spawn(process.execPath,['--test','src/ui/race-effects/visual-effects.test.mjs'],{ cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true });
    let stdout='',stderr=''; child.stdout.on('data',(data)=>{ stdout+=data; }); child.stderr.on('data',(data)=>{ stderr+=data; });
    child.once('error',reject); child.once('exit',(code,signal)=>resolve({code,signal,stdout,stderr}));
  });
  if (focusedTest.code !== 0 || focusedTest.signal !== null) throw Error('focused snapshot tests failed');
  server = spawn('C:/Program Files/Python314/python.exe', ['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',root], { stdio:['ignore','pipe','pipe'], windowsHide:true });
  const origin = await new Promise((resolve,reject) => {
    let output=''; const timer=setTimeout(() => reject(Error('server readiness timeout')),5000);
    server.stdout.on('data',(chunk) => { output+=chunk; if (output.includes('\n')) { clearTimeout(timer); resolve(output.trim()); } });
    server.once('error',reject); server.once('exit',(code) => reject(Error(`server exited before readiness ${code}`)));
  });
  if (!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin)) throw Error('unexpected endpoint');
  const url = `${origin}${base}`;
  const response = await fetch(url,{ signal:AbortSignal.timeout(5000) });
  if (!response.ok || !(await response.text()).includes('Unmounted visual extraction')) throw Error('snapshot body failed');
  browser = await launchIsolatedChrome();
  browser.cdp.socket.addEventListener('message',(event) => { const m=JSON.parse(String(event.data));
    if (m.method === 'Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails?.text ?? 'exception');
    if (m.method === 'Page.frameNavigated' && !m.params.frame.parentId) navigations.push(m.params.frame.url); });
  for (const [width,height] of [[1024,900],[390,844]]) {
    const page = await createPage(browser.cdp,url,{viewport:{width,height}});
    const send = (method,params={}) => browser.cdp.send(method,params,page.sessionId);
    const ev = (expression) => evaluate(browser.cdp,page.sessionId,expression);
    let ready=false;
    for (let i=0;i<30;i++) { if (await ev("document.querySelectorAll('.body > svg').length === 2 && document.querySelector('#kind').options.length === 16")) { ready=true; break; } await new Promise((r)=>setTimeout(r,100)); }
    if (!ready) throw Error(`fixture not ready ${width}`);
    const navCount=navigations.length;
    const state = await ev(`(async()=>{const set=(id,v,type='change')=>{const e=document.querySelector(id);e.value=v;e.dispatchEvent(new Event(type,{bubbles:true}));};const pause=document.querySelector('#pause'),play=document.querySelector('#play'),clear=document.querySelector('#clear'),slider=document.querySelector('#progress');set('#kind','dive');set('#progress','.5','input');const underwater=[...document.querySelectorAll('.label')].every(e=>e.textContent.includes('underwater'));clear.click();const clearReset=[...document.querySelectorAll('.label')].every(e=>!e.textContent.includes('underwater'))&&[...document.querySelectorAll('.layer')].every(e=>!e.children.length)&&[...document.querySelectorAll('.body')].every(e=>!e.style.transform&&!e.style.opacity);set('#progress','.5','input');set('#kind','pop');const switchReset=[...document.querySelectorAll('.label')].every(e=>!e.textContent.includes('underwater'))&&[...document.querySelectorAll('.body')].every(e=>!e.style.transform&&!e.style.opacity);set('#kind','white-return');set('#progress','0','input');play.click();await new Promise(r=>setTimeout(r,550));const mid=Number(slider.value);pause.click();const frozen=slider.value;await new Promise(r=>setTimeout(r,150));const paused=slider.value===frozen;play.click();await new Promise(r=>setTimeout(r,650));pause.click();const end=Number(slider.value);set('#kind','bounce');set('#progress','.3','input');const moving=document.querySelector('.water').innerHTML;const still=document.querySelector('#still');still.checked=true;still.dispatchEvent(new Event('change',{bubbles:true}));const staticA=document.querySelector('.water').innerHTML;set('#progress','.8','input');const staticB=document.querySelector('.water').innerHTML;still.checked=false;still.dispatchEvent(new Event('change',{bubbles:true}));return {underwater,clearReset,switchReset,paused,whiteOneSecond:mid>.35&&mid<.75&&end===1,staticStable:staticA===staticB&&moving!==staticA};})()`);
    if (Object.values(state).some((v) => v !== true)) throw Error(`lifecycle ${width} ${JSON.stringify(state)}`);
    for (const kind of kinds) {
      const phases = kind === 'dive' || kind === 'steady' ? [.2,.5,.8] : kind === 'white-return' ? [0,.5,1] : [.5];
      for (const progress of phases) {
        await ev(`(()=>{const k=document.querySelector('#kind');k.value=${JSON.stringify(kind)};k.dispatchEvent(new Event('change',{bubbles:true}));const p=document.querySelector('#progress');p.value=${JSON.stringify(String(progress))};p.dispatchEvent(new Event('input',{bubbles:true}));})()`);
        const facts=await ev(`(async()=>{await Promise.all([...document.images].map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const images=[...document.images],ids=[...document.querySelectorAll('[id]')].map(e=>e.id),stages=[...document.querySelectorAll('.stage')],rigs=[...document.querySelectorAll('.body > svg')],kind=document.querySelector('#kind').value,expected={pop:2,fragments:8,burst:2,injury:2,'white-return':0}[kind];return {imagesLoaded:images.every(i=>i.complete&&i.naturalWidth>0),expectedArt:expected===undefined?[...document.querySelectorAll('.stage')].every(s=>s.querySelector('.layer svg')):images.length===expected,idsUnique:new Set(ids).size===ids.length,rigs:rigs.length===2&&rigs.every(r=>r.querySelector('[id$="-head-group"]')&&r.querySelector('[id$="-wing-group"]')&&r.querySelector('[id$="-slot-hat"]')&&r.querySelector('[id$="-slot-neck"]')),stagesInside:stages.every(s=>{const r=s.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth,kind};})()`);
        if (!facts.imagesLoaded || !facts.expectedArt || !facts.idsUnique || !facts.rigs || !facts.stagesInside || !facts.noHorizontalOverflow || facts.kind !== kind) throw Error(`capture facts ${width}/${kind}/${progress} ${JSON.stringify(facts)}`);
        const metrics=await send('Page.getLayoutMetrics'); const size=metrics.cssContentSize ?? metrics.contentSize;
        const shot=await send('Page.captureScreenshot',{ format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:Math.ceil(size.height),scale:1} });
        await writeFile(`${out}/${width}-${kind}-${String(progress).replace('.','_')}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
        results.push({ width,height,kind,progress,...facts });
      }
    }
    if (exceptions.length || navigations.length !== navCount) throw Error('exception or unexpected navigation');
    results.push({width,height,lifecycle:state});
    await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  for (const [path,hash] of Object.entries(pins)) if (createHash('sha256').update(await readFile(path)).digest('hex') !== hash) throw Error(`source drift ${path}`);
} catch (e) { error=String(e); } finally {
  if (browser) cleanup=await closeIsolatedChrome(browser);
  if (server) { if (server.exitCode===null && server.signalCode===null) { server.kill(); await new Promise((resolve)=>{ server.once('exit',resolve); setTimeout(resolve,3000); }); } serverExit={code:server.exitCode,signal:server.signalCode}; }
  const serverObservedExited=Boolean(server) && (server.exitCode!==null || server.signalCode!==null);
  const browserObservedExited=cleanup?.rootExited===true && cleanup?.observedProcessesExited===true && cleanup?.inspectionFailed===false && cleanup?.residual===false;
  const raw={pins,focusedTest,results,exceptions,navigations,error,cleanup,serverExit,serverObservedExited,browserObservedExited,snapshotRetained:true};
  const outcome=assessCapture(raw);
  await writeFile(`${out}/receipt.private.log`,JSON.stringify(raw,null,2),{flag:'wx'});
  const receipt={ disclaimer:'Synthetic visual fixtures only; no production race, device or accessibility proof.',pins,results,
    focusedTest:focusedTest ? {code:focusedTest.code,signal:focusedTest.signal} : null,
    exceptionsCount:exceptions.length,navigationsCount:navigations.length,error:error?'Capture failure; see ignored local diagnostics.':null,
    cleanup:publicCleanup(cleanup),serverExit,serverObservedExited,browserObservedExited,snapshotRetained:true,...outcome };
  await writeFile(`${out}/receipt.json`,JSON.stringify(receipt,null,2),{flag:'wx'});
  console.log(JSON.stringify(receipt));
  if (!outcome.accepted) process.exitCode=1;
}
