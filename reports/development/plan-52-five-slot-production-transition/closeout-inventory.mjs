// Read-only inventory of historic parent bytes; it does not certify a browser continuation.
import {readFile,writeFile} from 'node:fs/promises';
import {currentPlan52SourceClosure,currentValidationLoaderSha256,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {GameEngine} from '../../../src/core/game-engine.mjs';
const catalog=JSON.parse(await readFile('scripts/dev/checkpoints/catalog.json','utf8'));
const closure=await currentPlan52SourceClosure(),loader=await currentValidationLoaderSha256();
const rows=[];
for(const [id,entry] of Object.entries(catalog.checkpoints).filter(([key])=>key.startsWith('plan52.'))) {
  const bytes=await readFile(entry.fixture),hash=sha256(bytes),env=JSON.parse(bytes),opts={experimentalFiveSlot:true,requireFiveSlotTutorial:true};
  const validation=validateSave(env,opts);let hydration='not-attempted';
  if(validation.valid){try{GameEngine.fromEnvelope(env);hydration='accepted';}catch(e){hydration=String(e);}}
  rows.push({id,status:entry.status,fixture:entry.fixture,hash,expectedHash:entry.sha256,hashMatch:hash===entry.sha256,
    schema:env.schemaVersion,day:env.state?.life?.schedule?.day,slot:env.state?.life?.schedule?.slot,
    nodeValidation:validation.valid,errors:validation.errors,hydration});
}
const result={purpose:'Historical parent inventory only; no current-source browser continuation or acceptance',node:process.version,v8:process.versions.v8,
  sourceClosure:closure.sha256,validationLoader:loader,catalogLoader:catalog.plan52ValidationLoaderSha256,rows};
await writeFile('reports/development/plan-52-five-slot-production-transition/closeout-parent-inventory.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({sourceClosure:closure.sha256,loader,rows:rows.map(({id,hashMatch,nodeValidation,errors})=>({id,hashMatch,nodeValidation,errors}))}));
