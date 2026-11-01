// Generates synthetic, reachable pre-change schema-4 envelopes from tracked baseline 4c56b0f.
import { writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const modulePath=path.resolve('node_modules/.cache/plan47-baseline-4c56b0f/src/core/game-engine.mjs');
const { GameEngine }=await import(pathToFileURL(modulePath));
const e=new GameEngine('plan47-historical-fixture',{lifePolicy:true}); e.start(); e.setupCompanion();
function act(intent){const r=e.applyLifeIntent(intent);if(!r.ok)throw Error(JSON.stringify(r));}
const out=path.resolve('reports/development/plan-47-work-and-evening-production-integration/fixtures'); await mkdir(out,{recursive:true});
async function capture(name){await writeFile(path.join(out,`${name}.json`),JSON.stringify(e.toEnvelope()));}
act({type:'meal',choice:'skip'});act({type:'advance'});act({type:'agree_work',kind:'scheduled'});await capture('old-pending-work');
act({type:'complete_work',id:e.state.life.work.id});await capture('old-completed-work');
act({type:'advance'});act({type:'leisure'});await capture('old-resolved-leisure');
console.log('Captured three synthetic reachable baseline 4c56b0f envelopes.');
