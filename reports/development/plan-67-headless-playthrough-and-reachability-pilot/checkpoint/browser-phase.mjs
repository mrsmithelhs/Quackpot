import {preview} from 'vite';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate,waitFor,mounted,clickPointer} from '../../../../scripts/dev/checkpoints/cdp.mjs';
const out='reports/development/plan-67-headless-playthrough-and-reachability-pilot/checkpoint/browser';
const file='reports/development/plan-67-headless-playthrough-and-reachability-pilot/checkpoint/pre-setup.save.json';
const sha=x=>createHash('sha256').update(x).digest('hex');
await mkdir(out,{recursive:true});let browser,server,page,cleanup,err=null;const record={sourceRevision:'7945bb26ee1a0570d3ac455d5639488447f578a2',sourceTree:'fe6677436e36581d78f8d87af07a14fed9864990',port:5197,actions:[],observations:{}};
async function shot(name){const {data}=await browser.cdp.send('Page.captureScreenshot',{format:'png'},page.sessionId);await writeFile(`${out}/${name}.png`,Buffer.from(data,'base64'));}
async function textButton(label){await waitFor(browser.cdp,page.sessionId,`[...document.querySelectorAll('button')].some(b=>b.textContent.trim()===${JSON.stringify(label)}&&!b.disabled)`,label);await evaluate(browser.cdp,page.sessionId,`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}).setAttribute('data-plan67-target','yes')`);await clickPointer(browser.cdp,page.sessionId,'[data-plan67-target="yes"]');}
try {
 const raw=await readFile(file,'utf8');record.fixtureSha256=sha(raw);
 const index=await readFile('node_modules/plan67-frozen/dist/index.html');record.builtIndexSha256=sha(index);
 server=await preview({configFile:false,root:'node_modules/plan67-frozen',base:'/Quackpot/',preview:{host:'127.0.0.1',port:5197,strictPort:true}});
 browser=await launchIsolatedChrome();page=await createPage(browser.cdp,'http://127.0.0.1:5197/Quackpot/',{fixtureRaw:raw});
 await textButton('Continue');record.actions.push('Continue from welcome');
 await mounted(browser.cdp,page.sessionId,'#morning-duck-name','restored setup');await shot('setup');
 record.observations.setup=await evaluate(browser.cdp,page.sessionId,"document.querySelector('#main-content').innerText");
 await textButton('Start the morning');record.actions.push('Start the morning');
 await mounted(browser.cdp,page.sessionId,'#btn-uninstall','HUD uninstall');await shot('before-uninstall');
 record.observations.before=await evaluate(browser.cdp,page.sessionId,"JSON.parse(localStorage.getItem('quackpot_save_v1'))");
 await clickPointer(browser.cdp,page.sessionId,'#btn-uninstall');record.actions.push('Uninstall');await mounted(browser.cdp,page.sessionId,'#btn-retention-leave','retention');await shot('retention');
 await clickPointer(browser.cdp,page.sessionId,'#btn-retention-leave');record.actions.push('Leave');
 await mounted(browser.cdp,page.sessionId,'#btn-fresh-run','Receipt');await shot('receipt');
 record.observations.receipt=await evaluate(browser.cdp,page.sessionId,"document.querySelector('#main-content').innerText");
 record.observations.after=await evaluate(browser.cdp,page.sessionId,"JSON.parse(localStorage.getItem('quackpot_save_v1'))");
 const a=record.observations.after,b=record.observations.before;record.comparison={terminalRoute:a?.state?.terminalRoute,delta:a?.eventLog?.slice(b.eventLog.length).map(x=>({type:x.type,payload:x.payload})),expectedTerminal:a?.state?.terminalRoute==='uninstall'};
 if(!record.comparison.expectedTerminal)throw Error('terminal route mismatch');
} catch(e){err=String(e.stack??e);record.error=err;if(browser&&page)try{await shot('failure');record.observations.failureText=await evaluate(browser.cdp,page.sessionId,'document.body.innerText');}catch{}}
finally {if(browser)cleanup=await closeIsolatedChrome(browser);record.cleanup=cleanup??null;if(server)await new Promise(resolve=>server.httpServer.close(resolve));await writeFile(`${out}/result.json`,JSON.stringify(record,null,2));}
process.stdout.write(JSON.stringify({error:record.error??null,actions:record.actions,comparison:record.comparison??null,cleanup:record.cleanup})+'\n');if(err||cleanup?.residual||cleanup?.uncertainty)process.exitCode=1;

