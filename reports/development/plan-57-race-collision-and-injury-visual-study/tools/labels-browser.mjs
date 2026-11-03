// Finite screenshot matrix for root review; synthetic gallery only.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'reports/development/plan-57-race-collision-and-injury-visual-study/';
const dir = `${base}evidence/gallery-04`;
await mkdir(dir, { recursive:false });
let browser, error = null, cleanup = null;
const pins = {}, captures = [], exceptions = [], navigations = [];
try {
  for (const path of ['gallery/index.html','gallery/gallery.css','gallery/gallery.mjs','gallery/fixtures.mjs','art/impact-burst.svg','art/paper-splash.svg','art/adhesive-bandage.svg','art/status-tab-icon.svg','tools/labels-browser.mjs']) pins[path] = createHash('sha256').update(await readFile(base + path)).digest('hex');
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
    const selected = width === 390 ? cases.filter(item => ['white-both','existing-contact','wall-static'].includes(item.name)) : cases.filter(item => item.name === 'white-both');
    for(const item of selected){
      const observed = await ev(`(() => { const cfg=${JSON.stringify(item)}, a=document.querySelector('.study:first-child'); const set=(key,value)=>{const el=a.querySelector('[data-'+key+']'); el.value=value; el.dispatchEvent(new Event('input',{bubbles:true}));}; set('fixture',cfg.fixture);set('cue',cfg.cue);set('duration',cfg.duration);set('marker',cfg.marker);set('time',cfg.time); for(const key of ['drama','static']) {const el=a.querySelector('[data-'+key+']'); const wanted=key==='drama'?cfg.drama:cfg.still; if(el.checked!==wanted)el.click();} const stage=a.querySelector('.stage').getBoundingClientRect(), labels=[...a.querySelectorAll('.runner')].map(r=>{const x=r.querySelector('.name').getBoundingClientRect();return {left:x.left,right:x.right,top:x.top,bottom:x.bottom};}); const inside=labels.every(r=>r.left>=stage.left && r.right<=stage.right && r.top>=stage.top && r.bottom<=stage.bottom); const overlap=labels.some((r,i)=>labels.some((s,j)=>j>i && r.left<s.right && r.right>s.left && r.top<s.bottom && r.bottom>s.top)); return {narrative:a.querySelector('.narrative').textContent,duckWidth:a.querySelector('.runner').getBoundingClientRect().width,stageWidth:stage.width,stageHeight:stage.height,labels,inside,overlap}; })()`);
      if (!observed.inside || observed.overlap) throw Error(`${width}/${item.name}: label bounds/overlap ${JSON.stringify(observed.labels)}`);
      await ev("Promise.all([...document.querySelectorAll('img:not([hidden])')].map(image=>image.decode()))");
      const rect=await ev("(() => { const r=document.querySelector('.study:first-child .stage').getBoundingClientRect(); return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}; })()");
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});
      await writeFile(`${dir}/${width}-${item.name}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
      if(navigations.length!==navCount || exceptions.length) throw Error(`${width}: navigation or exception`);
      captures.push({width,...item,...observed});
    }
    if (width === 1024) {
      await ev(`(() => {const b=document.querySelector('.study:nth-child(2)');for(const [key,value] of [['fixture','both'],['time','1.2']]){const el=b.querySelector('[data-'+key+']');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}})()`);
      await ev("Promise.all([...document.querySelectorAll('img:not([hidden])')].map(image=>image.decode()))");
      const rect=await ev("(() => {const r=document.querySelector('.study:nth-child(2) .stage').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};})()");
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});
      await writeFile(`${dir}/1024-closeup.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
      captures.push({width,name:'closeup-both',fixture:'both',time:'1.2'});
      await ev(`(() => {const a=document.querySelector('.study:first-child');for(const [key,value] of [['fixture','both'],['cue','burst'],['duration','1'],['time','0.9']]){const el=a.querySelector('[data-'+key+']');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));} if(a.querySelector('[data-static]').checked)a.querySelector('[data-static]').click();a.querySelector('[data-play]').click();})()`);
      for (const [name,delay] of [['onset',180],['middle',300],['return',400]]) {
        await new Promise(resolve=>setTimeout(resolve,delay));
        const sample=await ev("(() => {const a=document.querySelector('.study:first-child'),r=a.querySelector('.stage').getBoundingClientRect();return {time:Number(a.querySelector('[data-time]').value),rect:{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}};})()");
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...sample.rect,scale:1}});
        await writeFile(`${dir}/1024-motion-${name}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
        captures.push({width,name:`motion-${name}`,time:sample.time,detail:'Playback-clock screenshot; not a listening or continuous visual perception test.'});
      }
      await ev("document.querySelector('.study:first-child [data-play]').click()");
    }
    const dynamics=await ev(`(async () => { const a=document.querySelector('.study:first-child'), b=document.querySelector('.study:nth-child(2)'); const set=(key,value)=>{const el=a.querySelector('[data-'+key+']');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}; set('fixture','both');set('cue','burst');set('duration','0.5');set('time','1.2'); if(a.querySelector('[data-static]').checked)a.querySelector('[data-static]').click(); const before=a.querySelector('.shell svg > g[id$="-root"]').style.getPropertyValue('--duck-body-fill');set('time','1.6');const after=a.querySelector('.shell svg > g[id$="-root"]').style.getPropertyValue('--duck-body-fill');set('time','0.5');const rewind=a.querySelectorAll('[data-status] .status').length===0 && a.querySelector('.collision-art').hidden;const btime=b.querySelector('[data-time]').value; a.querySelector('[data-play]').click();await new Promise(r=>setTimeout(r,200));a.querySelector('[data-play]').click();const paused=a.querySelector('[data-time]').value;await new Promise(r=>setTimeout(r,150));const stable=paused===a.querySelector('[data-time]').value && btime===b.querySelector('[data-time]').value;a.querySelector('[data-reset]').click();const replay=Number(a.querySelector('[data-time]').value)===0; const {mount}=await import('/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/gallery.mjs');const el=document.createElement('section');document.body.append(el);const destroy=mount(el);const old=el.querySelector('.stage');el.querySelector('[data-play]').click();destroy();const animations=old.getAnimations({subtree:true}).length;await new Promise(r=>setTimeout(r,100));const emptied=el.childElementCount===0;el.remove();return {before,after,rewind,stable,replay,animations,emptied};})()`);
    if(dynamics.before===dynamics.after || !dynamics.rewind || !dynamics.stable || !dynamics.replay || dynamics.animations!==0 || !dynamics.emptied) throw Error(`${width}: dynamic check failed ${JSON.stringify(dynamics)}`);
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await new Promise(resolve=>setTimeout(resolve,100));
    const reduced=await ev(`(() => {const a=document.querySelector('.study:first-child');const set=(key,value)=>{const el=a.querySelector('[data-'+key+']');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};set('fixture','both');set('time','1.2');return {participants:[...a.querySelectorAll('[data-contact-text]')].filter(e=>e.textContent==='✦').length, animations:a.querySelector('.stage').getAnimations({subtree:true}).length};})()`);
    if(reduced.participants!==2 || reduced.animations!==0) throw Error(`${width}: emulated reduced motion failed ${JSON.stringify(reduced)}`);
    captures.push({width,dynamics,reduced,detail:'Emulated preference; not a physical OS or assistive technology test.'});
    await send('Emulation.setEmulatedMedia',{features:[]});
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
