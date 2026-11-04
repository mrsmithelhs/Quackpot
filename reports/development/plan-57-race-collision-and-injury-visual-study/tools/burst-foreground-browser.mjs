// One coordinated bounded browser run for the report-local continuation.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from './gpu-cdp.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='reports/development/plan-57-race-collision-and-injury-visual-study/', dir=`${base}evidence/burst-foreground-gpu-01`;
await mkdir(dir,{recursive:false});
let browser,error=null,cleanup=null,gpu=null; const pins={},captures=[],exceptions=[],navigations=[];
try {
  const paths=['gallery/index.html','gallery/gallery.css','gallery/gallery.mjs','gallery/boot.mjs','gallery/fixtures.mjs','gallery/burst-timeline.mjs','tools/gpu-cdp.mjs','tools/burst-foreground-browser.mjs','art/burst-normalized/manifest.json', ...['A','B','C'].flatMap(id=>['onset','expansion','breakup','settle'].flatMap(frame=>[`art/burst-continuation/${id}-${frame}.svg`,`art/burst-normalized/${id}-${frame}.svg`]))];
  for(const path of paths) pins[path]=createHash('sha256').update(await readFile(base+path)).digest('hex');
  const sourcePaths=['src/ui/duck-rig-view.mjs','src/core/duck-rig.mjs','src/ui/race-motion-controller.mjs','src/ui/duck-motion-controller.mjs','scripts/dev/checkpoints/cdp.mjs','scripts/dev/checkpoints/process-tree.mjs','scripts/dev/checkpoints/process-cleanup-policy.mjs'];
  for(const path of sourcePaths)pins[`root:${path}`]=createHash('sha256').update(await readFile(path)).digest('hex');
  const url='http://localhost:5173/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/';
  const response=await fetch(url,{signal:AbortSignal.timeout(5000)}); if(!response.ok || !(await response.text()).includes('Collision and injury visual study')) throw Error(`HTTP/body: ${response.status}`);
  browser=await launchIsolatedChrome();
  try { const info=await browser.cdp.send('SystemInfo.getInfo'); gpu={devices:info.gpu?.devices?.map(d=>({vendorId:d.vendorId,deviceId:d.deviceId,vendorString:d.vendorString,deviceString:d.deviceString,driverVersion:d.driverVersion})),glVendor:info.gpu?.auxAttributes?.glVendor,glRenderer:info.gpu?.auxAttributes?.glRenderer,glVersion:info.gpu?.auxAttributes?.glVersion,featureStatus:info.gpu?.featureStatus}; } catch(e) {gpu={unavailable:String(e)};}
  browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Page.frameNavigated'&&!m.params.frame.parentId)navigations.push(m.params.frame.url);});
  for(const [width,height] of [[1024,900],[390,844]]) {
    const page=await createPage(browser.cdp,url,{viewport:{width,height}}), send=(method,params={})=>browser.cdp.send(method,params,page.sessionId), ev=expression=>evaluate(browser.cdp,page.sessionId,expression);
    let ready=false;for(let i=0;i<30;i++){if(await ev("document.querySelectorAll('.runner svg').length===8")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${width}: gallery not ready`);
    const navCount=navigations.length;
    const defaults=await ev("[...document.querySelectorAll('.study')].map(a=>({cue:a.querySelector('[data-cue]').value,duration:a.querySelector('[data-duration]').value,marker:a.querySelector('[data-marker]').value}))");
    if(defaults.some(x=>x.cue!=='A'||x.duration!=='1'||x.marker!=='bandage'))throw Error(`${width}: selected defaults wrong`);
    for(const id of width===1024?['A','B','C']:['B']) for(const frame of ['expansion']) {
      for(const [index,label] of (width===1024?(id==='B'?[[0,'race'],[1,'enlarged']]:[[1,'enlarged']]):[[0,'narrow']])) {
        const state=await ev(`(()=>{const a=document.querySelectorAll('.study')[${index}],cue=a.querySelector('[data-cue]');cue.value=${JSON.stringify(id)};cue.dispatchEvent(new Event('input',{bubbles:true}));a.querySelector('[data-frame=${frame}]').click();const art=a.querySelector('.collision-art'),stage=a.querySelector('.stage').getBoundingClientRect(),labels=[...a.querySelectorAll('.name')].map(x=>x.getBoundingClientRect());return {src:art?.getAttribute('src'),time:Number(a.querySelector('[data-time]').value),injuries:[...a.querySelectorAll('[data-status]')].filter(x=>x.textContent.includes('Injured')).length,inside:labels.every(r=>r.left>=stage.left&&r.right<=stage.right&&r.top>=stage.top&&r.bottom<=stage.bottom),overlap:labels.some((r,i)=>labels.some((s,j)=>j>i&&r.left<s.right&&r.right>s.left&&r.top<s.bottom&&r.bottom>s.top)),duckWidth:a.querySelector('.runner').getBoundingClientRect().width};})()`);
        if(!state.src?.endsWith(`${id}-${frame}.svg`) || state.injuries!==0 || !state.inside || state.overlap)throw Error(`${width}/${id}/${frame}/${label}: ${JSON.stringify(state)}`);
        await ev(`(async()=>{const stage=document.querySelectorAll('.study')[${index}];await Promise.all([...stage.querySelectorAll('img:not([hidden])')].map(image=>image.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));})()`);
        const rect=await ev(`(()=>{const r=document.querySelectorAll('.study')[${index}].querySelector('.stage').getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};})()`);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});
        await writeFile(`${dir}/${label}-${id}-${frame}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});captures.push({width,label,id,frame,...state});
      }
    }
    const dynamic=await ev(`(async()=>{const [a,b]=document.querySelectorAll('.study'),set=(key,value)=>{const x=a.querySelector('[data-'+key+']');x.value=value;x.dispatchEvent(new Event('input',{bubbles:true}));};set('fixture','both');set('time','0.9');const btime=b.querySelector('[data-time]').value;a.querySelector('[data-play]').click();await new Promise(r=>setTimeout(r,450));a.querySelector('[data-play]').click();const time=Number(a.querySelector('[data-time]').value),src=a.querySelector('.collision-art')?.getAttribute('src'),pause=a.querySelector('[data-time]').value;await new Promise(r=>setTimeout(r,150));const stable=pause===a.querySelector('[data-time]').value&&btime===b.querySelector('[data-time]').value;a.querySelector('[data-reset]').click();return{time,src,stable,reset:Number(a.querySelector('[data-time]').value)};})()`);
    if(dynamic.time<=.9||!dynamic.src||!dynamic.stable||dynamic.reset!==0)throw Error(`${width}: dynamic failed ${JSON.stringify(dynamic)}`);
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await new Promise(r=>setTimeout(r,100));
    const reduced=await ev(`(()=>{const a=document.querySelector('.study:first-child'),t=a.querySelector('[data-time]');const sample=v=>{t.value=v;t.dispatchEvent(new Event('input',{bubbles:true}));return{src:a.querySelector('.collision-art')?.getAttribute('src'),positions:[...a.querySelectorAll('.runner')].map(x=>[x.style.left,x.style.top,x.style.transform]),symbols:[...a.querySelectorAll('[data-contact-text]')].filter(x=>x.textContent==='✦').length};};return{first:sample('1.06'),second:sample('1.68'),animations:a.querySelector('.stage').getAnimations({subtree:true}).length};})()`);
    if(!reduced.first.src?.endsWith('-expansion.svg')||reduced.first.src!==reduced.second.src||JSON.stringify(reduced.first.positions)!==JSON.stringify(reduced.second.positions)||reduced.first.symbols!==2||reduced.animations!==0)throw Error(`${width}: reduced failed ${JSON.stringify(reduced)}`);
    await send('Emulation.setEmulatedMedia',{features:[]});
    const teardown=await ev(`(async()=>{const count=()=>({studies:document.querySelectorAll('.study').length,racers:document.querySelectorAll('.runner').length});const before=count(),{mount}=await import('/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/gallery.mjs');const e=document.createElement('section');document.body.append(e);const destroy=mount(e),stage=e.querySelector('.stage'),during=count();e.querySelector('[data-play]').click();destroy();const result={before,during,empty:e.childElementCount===0,animations:stage.getAnimations({subtree:true}).length};e.remove();result.after=count();return result;})()`);
    if(teardown.before.studies!==2||teardown.before.racers!==8||teardown.during.studies!==3||teardown.during.racers!==14||teardown.after.studies!==2||teardown.after.racers!==8||!teardown.empty||teardown.animations)throw Error(`${width}: teardown/instances failed ${JSON.stringify(teardown)}`);
    if(navigations.length!==navCount||exceptions.length)throw Error(`${width}: unexpected navigation or runtime exception`);
    captures.push({width,defaults,dynamic,reduced,teardown});await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  for(const [path,hash] of Object.entries(pins))if(createHash('sha256').update(await readFile(path.startsWith('root:')?path.slice(5):base+path)).digest('hex')!==hash)throw Error(`Source changed: ${path}`);
}catch(e){error=String(e);}finally{
  if(browser)cleanup=await closeIsolatedChrome(browser);
  const accepted=cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.coverage==='sampled-only'&&cleanup?.uncertainty===true&&cleanup?.profileRetained===true&&cleanup?.treeTerminationConfirmed===false;
  const receipt={disclaimer:'GPU permitted, not assumed; synthetic gallery scenarios, not race outcomes.',pins,gpu,captures,exceptions,navigations,error,cleanup,accepted};await writeFile(`${dir}/receipt.json`,JSON.stringify(receipt,null,2),{flag:'wx'});console.log(JSON.stringify({count:captures.length,gpu,error,exceptions,navigations,cleanup,accepted}));if(error||!accepted)process.exitCode=1;
}
