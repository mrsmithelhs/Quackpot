import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine} from '../core/game-engine.mjs';
import {renderHud} from './hud.js';

test('header omits End Run and its Uninstall control still reaches the Receipt',()=>{
 const e=new GameEngine('header-removal',{lifePolicy:'five-slot-v1',raceV2:true,messagesPolicy:'messages-v2'});e.start();e.setupCompanion();let handler=null;
 const uninstall={addEventListener:(name,fn)=>{if(name==='click')handler=fn;}};
 const container={innerHTML:'',querySelector:selector=>selector==='#btn-uninstall'?uninstall:null};
 renderHud(container,e,'duck.svg',{showEndRun:true,onEndRun:()=>{throw Error('obsolete control fired');},onUninstall:()=>e.clickUninstall()});
 assert.ok(!container.innerHTML.includes('btn-end-run'));assert.ok(!container.innerHTML.includes('End run &amp; view Receipt'));assert.ok(container.innerHTML.includes('btn-uninstall'));assert.ok(handler);handler();assert.equal(e.state.activeModal,'retention');assert.equal(e.leaveUninstall(),'uninstall');const receipt=e.presentReceipt();assert.equal(receipt.terminalRoute,'uninstall');
});
