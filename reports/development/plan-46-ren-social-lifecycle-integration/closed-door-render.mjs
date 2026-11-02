import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { renderRenScene } from '../../../src/assets/ren/index.mjs';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';
const dir=path.resolve('reports/development/plan-46-ren-social-lifecycle-integration/closed-door-derived-review'); await mkdir(dir,{recursive:true});
const svg=await readFile('reports/development/plan-46-ren-social-lifecycle-integration/closed-door-derived-candidate.svg','utf8');
const open=renderRenScene({idPrefix:'doorcomparison',scene:'door',decorative:true}).svg;
let browser,cleanup; const results={candidateSha256:createHash('sha256').update(svg).digest('hex'),screens:[]};
try {
 browser=await launchIsolatedChrome(); const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'}); const {sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true});
 const send=(method,params={})=>browser.cdp.send(method,params,sessionId);
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable'); await send('Runtime.enable');
 const check=await evaluate(`(()=>{const doc=new DOMParser().parseFromString(${JSON.stringify(svg)},'image/svg+xml'); const root=doc.documentElement;const all=[...doc.querySelectorAll('*')]; const ids=all.map(e=>e.id).filter(Boolean);return {root:root.localName,parseErrors:doc.querySelectorAll('parsererror').length,viewBox:root.getAttribute('viewBox'),badElements:doc.querySelectorAll('script,foreignObject').length,external:all.flatMap(e=>[...e.attributes]).filter(a=>/^(?:href|xlink:href|src)$/i.test(a.name)&&!a.value.startsWith('#')).length,events:all.flatMap(e=>[...e.attributes]).filter(a=>/^on/i.test(a.name)).length,duplicateIds:ids.length-new Set(ids).size,styleURLs:/url\\s*\\(/i.test(root.outerHTML)};})()`);
 results.safety=check;if(check.root!=='svg'||check.parseErrors||check.viewBox!=='0 0 960 540'||check.badElements||check.external||check.events||check.duplicateIds||check.styleURLs)throw Error('SVG validation failed');
 const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#f5f0e6;font:16px system-ui}main{display:flex;gap:14px;align-items:start;padding:12px}section{flex:1;min-width:0}svg{display:block;width:100%;height:auto;border:1px solid #493f35}h2{font-size:16px;margin:4px 0 8px}@media(max-width:700px){main{display:block}section+section{margin-top:18px}}</style><main><section><h2>Accepted open doorway</h2>${open}</section><section><h2>Candidate closed door</h2>${svg}</section></main>`;
 await send('Page.setDocumentContent',{frameId:(await send('Page.getFrameTree')).frameTree.frame.id,html});
 for(const [name,width,height] of [['desktop',1366,768],['narrow',390,844]]){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='narrow'});const innerWidth=await evaluate('window.innerWidth');if(innerWidth!==width)throw Error('CSS viewport width mismatch');const img=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(path.join(dir,`${name}.png`),Buffer.from(img.data,'base64'));results.screens.push({name,width,height});}
} finally {if(browser) cleanup=await closeIsolatedChrome(browser);results.cleanup=cleanup && {residual:cleanup.residual,uncertainty:cleanup.uncertainty,childExitCode:cleanup.childExitCode,treeTerminationConfirmed:cleanup.treeTerminationConfirmed,profileRemoved:cleanup.profileRemoved,trackedCount:cleanup.trackedDescendants?.length,remainingCount:cleanup.remainingDescendants?.length};await writeFile(path.join(dir,'trace.json'),JSON.stringify(results,null,2));}
