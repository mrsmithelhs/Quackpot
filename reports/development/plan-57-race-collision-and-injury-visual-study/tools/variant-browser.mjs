// Finite screenshot matrix for root review; synthetic gallery only.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'reports/development/plan-57-race-collision-and-injury-visual-study/';
const dir = `${base}evidence/gallery-02`;
await mkdir(dir, { recursive:false });
let browser, error = null, cleanup = null;
const pins = {}, captures = [], exceptions = [], navigations = [];
try {
  for (const path of ['gallery/index.html','gallery/gallery.css','gallery/gallery.mjs','gallery/fixtures.mjs','art/impact-burst.svg','art/paper-splash.svg','art/adhesive-bandage.svg','art/status-tab-icon.svg','tools/variant-browser.mjs']) pins[path] = createHash('sha256').update(await readFile(base + path)).digest('hex');
  const url = 'http://localhost:5173/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/';
  const response = await fetch(url, { signal:AbortSignal.timeout(5000) });
  if (!response.ok || !(await response.text()).includes('Collision and injury visual study')) throw Error(`HTTP/body: ${response.status}`);
  browser = await launchIsolatedChrome();
  browser.cdp.socket.addEventListener('message', event => { const m=JSON.parse(String(event.data)); if(m.method==='Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails?.text ?? 'exception'); if(m.method==='Page.frameNavigated' && !m.params.frame.parentId) navigations.push(m.params.frame.url); });
  for (const [width,height] of [[1024,900],[390,844]]) {
    const page = await createPage(browser.cdp, url, { viewport:{ width,height } });
    const send = (method,params={}) => browser.cdp.send(method,params,page.sessionId), ev = expression => evaluate(browser.cdp,page.sessionId,expression);
    let ready=false; for(let i=0;i<30;i++){ if(await ev("document.querySelectorAll('.runner svg').length === 8")){ready=true;break;} await new Promise(resolve=>setTimeout(resolve,100)); } if(!ready) throw Error(`${width}: gallery not ready`);
    const navCount=navigations.length;
    const cases = [
      {name:'burst-neither',fixture:'neither',cue:'burst',duration:'0',marker:'bandage',time:'1.2',drama:false,still:false},
      {name:'splash-one-dim',fixture:'first',cue:'splash',duration:'0.5',marker:'tab',time:'1.2',drama:true,still:false},
      {name:'white-both',fixture:'both',cue:'none',duration:'1',marker:'bandage',time:'1.2',drama:false,still:false},
      {name:'wall-static',fixture:'wall',cue:'burst',duration:'0',marker:'tab',time:'1.2',drama:false,still:true},
      {name:'existing-contact',fixture:'existing',cue:'burst',duration:'0.5',marker:'tab',time:'1.2',drama:false,still:false},
    ];
    for(const item of cases){
      const observed = await ev(`(() => { const cfg=${JSON.stringify(item)}, a=document.querySelector('.study:first-child'); const set=(key,value)=>{const el=a.querySelector('[data-'+key+']'); el.value=value; el.dispatchEvent(new Event('input',{bubbles:true}));}; set('fixture',cfg.fixture);set('cue',cfg.cue);set('duration',cfg.duration);set('marker',cfg.marker);set('time',cfg.time); for(const key of ['drama','static']) {const el=a.querySelector('[data-'+key+']'); const wanted=key==='drama'?cfg.drama:cfg.still; if(el.checked!==wanted)el.click();} return {narrative:a.querySelector('.narrative').textContent,duckWidth:a.querySelector('.runner').getBoundingClientRect().width}; })()`);
      await ev("Promise.all([...document.querySelectorAll('img:not([hidden])')].map(image=>image.decode()))");
      const rect=await ev("(() => { const r=document.querySelector('.study:first-child .stage').getBoundingClientRect(); return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}; })()");
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});
      await writeFile(`${dir}/${width}-${item.name}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
      if(navigations.length!==navCount || exceptions.length) throw Error(`${width}: navigation or exception`);
      captures.push({width,...item,...observed});
    }
    await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  for(const [path,hash] of Object.entries(pins)) if(createHash('sha256').update(await readFile(base+path)).digest('hex')!==hash) throw Error(`Source changed: ${path}`);
} catch(e){ error=String(e); }
finally {
  if(browser) cleanup=await closeIsolatedChrome(browser);
  const accepted=cleanup?.rootExited===true && cleanup?.observedProcessesExited===true && cleanup?.inspectionFailed===false && cleanup?.residual===false && cleanup?.coverage==='sampled-only' && cleanup?.uncertainty===true && cleanup?.profileRetained===true && cleanup?.treeTerminationConfirmed===false;
  const receipt={disclaimer:'Synthetic gallery states; fixed presentation clock snapshots, not race outcomes.',pins,captures,exceptions,navigations,error,cleanup,accepted};
  await writeFile(`${dir}/receipt.json`,JSON.stringify(receipt,null,2),{flag:'wx'}); console.log(JSON.stringify(receipt)); if(error || !accepted) process.exitCode=1;
}
