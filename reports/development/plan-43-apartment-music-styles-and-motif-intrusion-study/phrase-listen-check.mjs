import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate, waitFor } from '../../../scripts/dev/checkpoints/cdp.mjs';
const url='http://localhost:5173/Quackpot/reports/development/plan-43-apartment-music-styles-and-motif-intrusion-study/phrase-listen.html';let browser;
try {browser=await launchIsolatedChrome();const page=await createPage(browser.cdp,url,{viewport:{width:390,height:844}});await waitFor(browser.cdp,page.sessionId,"document.querySelectorAll('audio').length===4",'players',10000);
const result=await evaluate(browser.cdp,page.sessionId,`(async()=>{const a=[...document.querySelectorAll('audio')];const defaults=a.map(x=>x.volume);document.querySelector('#raw').click();const raw=a.map(x=>x.volume);document.querySelector('#aligned').click();const restored=a.map(x=>x.volume);const slider=document.querySelector('input[type=range]');slider.value='50';slider.dispatchEvent(new Event('input'));const manual=a[0].volume;const media=await Promise.all(a.map(x=>new Promise(resolve=>{x.onloadedmetadata=()=>resolve({ok:true,duration:x.duration});x.onerror=()=>resolve({ok:false});x.load();setTimeout(()=>resolve({ok:false,timeout:true}),5000)})));return {defaults,raw,restored,manual,media,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
console.log(JSON.stringify(result,null,2));if(result.overflow||result.media.some(x=>!x.ok)||result.raw.some(x=>x!==1)||result.manual!==.5||result.defaults.some((x,i)=>x!==result.restored[i]))process.exitCode=1;
}catch(e){console.error(String(e.stack||e));process.exitCode=1;}finally{if(browser){const cleanup=await closeIsolatedChrome(browser);console.log('Browser cleanup:',JSON.stringify(cleanup));if(cleanup.residual||cleanup.uncertainty)process.exitCode=1;}}



