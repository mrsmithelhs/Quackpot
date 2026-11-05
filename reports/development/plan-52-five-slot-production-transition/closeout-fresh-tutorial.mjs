import http from 'node:http';
import path from 'node:path';
import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {validateSave} from '../../../src/core/storage.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate,waitFor,clickPointer} from '../../../scripts/dev/checkpoints/cdp.mjs';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'closeout-fresh-tutorial-attempt1',script=base+'closeout-fresh-tutorial.mjs';
if(await stat(dir).catch(()=>null))throw Error('Attempt already exists');await mkdir(dir);
const put=(name,data)=>writeFile(`${dir}/${name}`,data,{flag:'wx'});let server,browser,error=null;const evidence={errors:[],observations:[]};
try {
 const source=await currentPlan52SourceClosure();if(source.sha256!=='dd32f612945bd11196ddf3a16dcfc2c8f33c1b8288c88fa7d169dbd163ca040c')throw Error('source changed');evidence.source=source.sha256;evidence.harness=sha256(await readFile(script));
 const catalog=JSON.parse(await readFile('scripts/dev/checkpoints/catalog.json','utf8')),entry=catalog.checkpoints['plan52.fresh-tutorial.v1'];const bytes=await readFile(entry.fixture);
 if(sha256(bytes)!==entry.sha256)throw Error('parent changed');const parent=JSON.parse(bytes),valid=validateSave(parent,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});if(!valid.valid)throw Error(`invalid parent ${JSON.stringify(valid.errors)}`);
 evidence.parent={path:entry.fixture,sha256:entry.sha256};const dist=path.resolve('dist'),index=await readFile(path.join(dist,'index.html'),'utf8');const files=['index.html',...Array.from(index.matchAll(/(?:src|href)="(?:\/Quackpot\/)?(assets\/[A-Za-z0-9_.-]+)"/g),m=>m[1])];evidence.build={};for(const f of files)evidence.build[f]=sha256(await readFile(path.join(dist,f)));
 server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1');if(!['/Quackpot/','/Quackpot/index.html'].includes(u.pathname)&&!/^\/Quackpot\/assets\/[A-Za-z0-9_.-]+$/.test(u.pathname)){res.writeHead(404).end();return;}const f=u.pathname==='/Quackpot/'?'index.html':u.pathname.slice('/Quackpot/'.length);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(f)]??'application/octet-stream');res.end(await readFile(path.join(dist,f)));}catch{res.writeHead(404).end();}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const timer=setTimeout(()=>server.close(),15*60*1000);timer.unref();
 browser=await launchIsolatedChrome();browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')evidence.errors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Page.javascriptDialogOpening'){evidence.errors.push(`unexpected dialog: ${m.params.message}`);browser.cdp.send('Page.handleJavaScriptDialog',{accept:false},m.sessionId).catch(()=>{});}});
 const page=await createPage(browser.cdp,`http://127.0.0.1:${server.address().port}/Quackpot/`,{viewport:{width:1280,height:800},fixtureRaw:bytes.toString('utf8')}),s=page.sessionId;
 const ev=expression=>evaluate(browser.cdp,s,expression);await browser.cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},s);
 await waitFor(browser.cdp,s,"document.readyState==='complete' && !!document.querySelector('.life-view')",'fresh tutorial');
 const snapshot=async name=>{const raw=await ev("localStorage.getItem('quackpot_save_v1')");await put(`${name}.save.json`,raw);await put(`${name}.txt`,await ev('document.body.innerText'));const shot=await browser.cdp.send('Page.captureScreenshot',{format:'png'},s);await put(`${name}.png`,Buffer.from(shot.data,'base64'));return JSON.parse(raw);};
 const before=await snapshot('before');if(before.schemaVersion!==5||before.state.life.schedule.day!==1||before.state.life.schedule.slot!=='morning')throw Error('wrong startup boundary');
 await clickPointer(browser.cdp,s,'button[data-obj="plate"]');await delay(200);await clickPointer(browser.cdp,s,'.life-popover [data-act="confirm"]');await delay(250);await clickPointer(browser.cdp,s,'.life-popover [data-act="done"]');
 await waitFor(browser.cdp,s,"document.body.innerText.includes('Midday')",'midday');const after=await snapshot('after');const result=validateSave(after,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});
 if(!result.valid||after.state.life.schedule.day!==1||after.state.life.schedule.slot!=='midday'||after.state.cash!==74)throw Error(`unexpected continuation ${JSON.stringify(result.errors)}`);
 if(JSON.stringify(after.eventLog.slice(0,parent.eventLog.length))!==JSON.stringify(parent.eventLog)||JSON.stringify(after.prngStreams)!==JSON.stringify(parent.prngStreams))throw Error('history or RNG changed unexpectedly');
 evidence.observations.push({case:'fresh-tutorial',day:1,slot:'midday',cash:74,nodeValidation:true,historyPrefix:true,rngUnchanged:true});
 await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
 if((await currentPlan52SourceClosure()).sha256!==source.sha256)throw Error('source changed during capture');
}catch(e){error=String(e);}finally{
 let cleanup=null;try{cleanup=browser?await closeIsolatedChrome(browser):null;}catch(e){error=error??`cleanup ${e}`;}finally{if(server)await new Promise(resolve=>server.close(()=>resolve()));}
 const fully=Boolean(cleanup&&cleanup.rootExited&&cleanup.observedProcessesExited&&cleanup.inspectionFailed===false&&cleanup.residual===false&&cleanup.uncertainty===false&&cleanup.treeTerminationConfirmed===true);
 await put('trace.json',JSON.stringify({...evidence,error,cleanup,artifactChecksPassed:!error&&!evidence.errors.length,cleanupFullyVerified:fully},null,2));
 console.log(JSON.stringify({observations:evidence.observations,error,cleanupFullyVerified:fully,errors:evidence.errors}));if(error||evidence.errors.length||!fully)process.exitCode=1;
}
