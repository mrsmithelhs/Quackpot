import { launchIsolatedChrome, closeIsolatedChrome } from './cdp.mjs';
const browser=await launchIsolatedChrome();let error=null,cleanup=null;
try { const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'});if(!targetId)throw Error('Blank target missing'); }
catch(e){error=String(e);} finally {cleanup=await closeIsolatedChrome(browser);}
const ok=!error && cleanup?.rootExited===true && cleanup?.observedProcessesExited===true && cleanup?.inspectionFailed===false && cleanup?.residual===false && cleanup?.coverage==='sampled-only' && cleanup?.uncertainty===true && cleanup?.treeTerminationConfirmed===false && cleanup?.profileRetained===true;
console.log(JSON.stringify({witness:'blank-page-graceful-close',error,cleanup,limit:'Sampled identities do not prove complete descendant coverage; profile intentionally retained.'}));
if(!ok)process.exitCode=1;
