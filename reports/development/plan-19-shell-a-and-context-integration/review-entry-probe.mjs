// Reuse the isolated browser harness setup/cleanup, replacing its journey only.
import fs from 'node:fs';
const harness = fs.readFileSync('scripts/dev/plan-19-browser-check.mjs', 'utf8');
const start = harness.indexOf('  // A pre-setup manual save');
const end = harness.lastIndexOf('} finally {');
if (start < 0 || end < start) throw new Error('Browser harness markers changed');
const journey = `
  await click('#btn-start-app');
  await wait(410);
  await evaluate('document.getAnimations().forEach(a => { a.pause(); a.currentTime = 350; })');
  const observations = await evaluate(\`(() => {
    const p = document.querySelector('.stage-transition-phone');
    const m = document.querySelector('#main-content');
    const r = x => { const b=x.getBoundingClientRect(); return {left:b.left,top:b.top,width:b.width,height:b.height}; };
    return { viewport:[innerWidth,innerHeight], phone:r(p),stage:r(m), transform:getComputedStyle(p).transform, phoneCssWidth:getComputedStyle(p).width,phoneCssHeight:getComputedStyle(p).height };
  })()\`);
  console.log(JSON.stringify(observations,null,2));
  const capture=await cdp.send('Page.captureScreenshot',{format:'png'});
  await import('node:fs').then(fs => fs.writeFileSync('reports/development/plan-19-shell-a-and-context-integration/review-entry-desktop.png',Buffer.from(capture.data,'base64')));
  await click('#btn-open-settings');
  const tabStops=[];
  for(let i=0;i<6;i++) {
    tabStops.push(await evaluate('({tag:document.activeElement.tagName,text:document.activeElement.textContent.trim(),type:document.activeElement.type})'));
    await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  }
  console.log(JSON.stringify({settingsKeyboardTabStops:tabStops},null,2));
  await import('node:fs').then(fs => fs.writeFileSync('reports/development/plan-19-shell-a-and-context-integration/review-entry-observations.json',JSON.stringify({observations,settingsKeyboardTabStops:tabStops},null,2)));
`;
const modified = (harness.slice(0, start) + journey + harness.slice(end))
  .replace('width: 390, height: 520, deviceScaleFactor: 1, mobile: true', 'width: 1440, height: 900, deviceScaleFactor: 1, mobile: false');
await import(`data:text/javascript;base64,${Buffer.from(modified).toString('base64')}`);
