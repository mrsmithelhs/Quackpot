// Non-audio, isolated-browser startup/cleanup diagnostic; no page navigation or server.
import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
const started=performance.now();let browser;
try { browser=await launchIsolatedChrome(); console.log(JSON.stringify({stage:'startup',elapsedMs:performance.now()-started,blankOnly:true})); }
catch(error) { console.error(JSON.stringify({stage:'startup-failed',elapsedMs:performance.now()-started,error:String(error?.stack||error)})); process.exitCode=1; }
finally { if(browser){const result=await closeIsolatedChrome(browser);console.log(JSON.stringify({stage:'cleanup',elapsedMs:performance.now()-started,result}));if(result.residual||result.uncertainty)process.exitCode=1;} }
