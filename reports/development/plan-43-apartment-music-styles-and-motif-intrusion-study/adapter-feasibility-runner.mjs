// One isolated feasibility witness using the existing Plan 35 CDP lifecycle helper.
// Run only in a coordinated browser slot through the unchanged Plan 25 launcher.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, waitFor } from '../../../scripts/dev/checkpoints/cdp.mjs';
const url='http://localhost:5173/Quackpot/reports/development/plan-43-apartment-music-styles-and-motif-intrusion-study/adapter-feasibility.html';
let browser;
try {
 browser=await launchIsolatedChrome();
 const page=await createPage(browser.cdp,url);
 const result=await waitFor(browser.cdp,page.sessionId,"(() => { const s=document.querySelector('#result')?.textContent; return s && s !== 'PENDING' ? s : false; })()",'completed audio feasibility',15000);
 console.log(result);
 if(!JSON.parse(result).success)process.exitCode=1;
} catch(e) { console.error(String(e.stack||e)); process.exitCode=1; }
finally {
 if(browser) {
  const cleanup=await closeIsolatedChrome(browser);
  console.log('Browser cleanup:',JSON.stringify(cleanup));
  if(cleanup.residual || cleanup.uncertainty)process.exitCode=1;
 }
}

