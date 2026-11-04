// Read-only diagnostic of enlarged collision paint; no game storage or production writes.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='reports/development/plan-57-race-collision-and-injury-visual-study/',dir=`${base}evidence/burst-paint-diagnostic-03`;
await mkdir(dir,{recursive:false});
let browser,error=null,cleanup=null; const pins={},cases=[],exceptions=[],navigations=[];
try{
  const paths=['gallery/index.html','gallery/boot.mjs','gallery/gallery.mjs','gallery/gallery.css','gallery/fixtures.mjs','gallery/burst-timeline.mjs','art/burst-continuation/A-expansion.svg','tools/burst-paint-diagnostic.mjs'];
  for(const path of paths)pins[path]=createHash('sha256').update(await readFile(base+path)).digest('hex');
  const sources=['src/ui/duck-rig-view.mjs','src/core/duck-rig.mjs','src/ui/race-motion-controller.mjs','src/ui/duck-motion-controller.mjs'];
  for(const path of sources)pins[`root:${path}`]=createHash('sha256').update(await readFile(path)).digest('hex');
  const url='http://localhost:5173/Quackpot/reports/development/plan-57-race-collision-and-injury-visual-study/gallery/';
  const response=await fetch(url,{signal:AbortSignal.timeout(5000)});if(!response.ok||!(await response.text()).includes('Collision and injury visual study'))throw Error(`HTTP/body: ${response.status}`);
  browser=await launchIsolatedChrome();
  browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Page.frameNavigated'&&!m.params.frame.parentId)navigations.push(m.params.frame.url);});
  for(const [name,whitening,motion] of [['normal',true,true],['no-white',false,true],['no-motion',true,false],['neither',false,false]]){
    const page=await createPage(browser.cdp,url,{viewport:{width:1024,height:900}}),send=(method,params={})=>browser.cdp.send(method,params,page.sessionId),ev=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(result.exceptionDetails)throw Error('Browser evaluation: '+(result.exceptionDetails.exception?.description??result.exceptionDetails.text));return result.result?.value;};
    let ready=false;for(let i=0;i<30;i++){if(await ev("document.querySelectorAll('.runner svg').length===8")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${name}: gallery not ready`);
    const navCount=navigations.length;
    const observed=await ev(`(async()=>{const a=document.querySelectorAll('.study')[1],set=(key,value)=>{const el=a.querySelector('[data-'+key+']');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};set('cue','A');set('duration',${JSON.stringify(whitening?'1':'0')});set('time','1.2');if(!${motion})for(const animation of a.querySelector('.stage').getAnimations({subtree:true}))animation.cancel();await Promise.all([...a.querySelectorAll('img:not([hidden])')].map(img=>img.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const styles=el=>{const s=getComputedStyle(el);return{opacity:s.opacity,transform:s.transform,fill:s.fill,filter:s.filter,visibility:s.visibility};};const ducks=[...a.querySelectorAll('.runner')].map(r=>{const svg=r.querySelector('svg'),p=r.querySelector('[data-duck-prefix]').dataset.duckPrefix;return{id:r.dataset.id,svg:styles(svg),body:styles(svg.querySelector('#'+p+'-body-base')),head:styles(svg.querySelector('#'+p+'-head-base')),shell:styles(r.querySelector('.shell')),animations:r.getAnimations({subtree:true}).map(x=>({time:x.currentTime,state:x.playState}))};});const ids=[...document.querySelectorAll('[id]')].map(x=>x.id),duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);return{ducks,duplicates,src:a.querySelector('.collision-art')?.getAttribute('src'),time:Number(a.querySelector('[data-time]').value)};})()`);
    if(observed.duplicates.length||!observed.src?.endsWith('A-expansion.svg')||observed.time!==1.2)throw Error(`${name}: fixture/ID mismatch`);
    if(!motion && observed.ducks.some(duck=>duck.animations.length))throw Error(`${name}: animations reappeared after settling`);
    const rect=await ev("(()=>{const r=document.querySelectorAll('.study')[1].querySelector('.stage').getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};})()");
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});await writeFile(`${dir}/${name}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
    if(navigations.length!==navCount||exceptions.length)throw Error(`${name}: unexpected navigation or exception`);cases.push({name,whitening,motion,...observed});await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  for(const [path,hash] of Object.entries(pins))if(createHash('sha256').update(await readFile(path.startsWith('root:')?path.slice(5):base+path)).digest('hex')!==hash)throw Error(`Source changed: ${path}`);
}catch(e){error=String(e);}finally{
  if(browser)cleanup=await closeIsolatedChrome(browser);const accepted=cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.coverage==='sampled-only'&&cleanup?.uncertainty===true&&cleanup?.profileRetained===true&&cleanup?.treeTerminationConfirmed===false;
  const receipt={disclaimer:'Diagnostic presentation toggles only; synthetic scenario.',pins,cases,exceptions,navigations,error,cleanup,accepted};await writeFile(`${dir}/receipt.json`,JSON.stringify(receipt,null,2),{flag:'wx'});console.log(JSON.stringify(receipt));if(error||!accepted)process.exitCode=1;
}
