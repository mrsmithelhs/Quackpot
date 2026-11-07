import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {resolveSeededRace,serializeRaceResolution} from '../../../src/core/race-resolver.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {validateFiveSlotTransactionHistory} from '../../../src/core/life-replay.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'race-cross-runtime-node-attempt1',script=base+'race-cross-runtime-node.mjs',file=base+'midday-phone-bridge-attempt3/day2-session-finished.save.json';
if(await stat(dir).catch(()=>null))throw Error('Output exists');await mkdir(dir);
const write=(name,data)=>writeFile(`${dir}/${name}`,data,{flag:'wx'});let error=null,report={};
try{
 const closure=await currentPlan52SourceClosure(),raw=await readFile(file),witness=JSON.parse(raw);report={source:closure.sha256,witness:sha256(raw),script:sha256(await readFile(script)),runtime:process.versions};
 if(report.source!=='e21451a4f1d9ce50e69ff44080b197f6f15189aa206571b45b59b4b10e39349f'||report.witness!=='fa2b8bedd68bd90e62304d376561a679f1dccdef706ad4e7037db24951479acc')throw Error('Source or witness pin mismatch');
 const input=witness.state.raceResolutions.R01.metadata.inputs,result=resolveSeededRace(input),encoded=serializeRaceResolution(result).encoded;
 report.input=input;report.validation=validateSave(witness,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});report.replay=validateFiveSlotTransactionHistory(witness);report.storedDigest=witness.state.raceResolutions.R01.digest;report.computedDigest=encoded.digest;report.finish=result.finish;report.winner=result.winner;
 await write('computed.json',JSON.stringify(encoded));await write('summary.json',JSON.stringify(report,null,2));
 if((await currentPlan52SourceClosure()).sha256!==closure.sha256 || sha256(await readFile(file))!==report.witness)throw Error('Source or witness changed');
}catch(e){error=String(e);}finally{await write('result.json',JSON.stringify({error,report},null,2));console.log(JSON.stringify({error,source:report.source,witness:report.witness,node:report.runtime?.node,v8:report.runtime?.v8,storedDigest:report.storedDigest,computedDigest:report.computedDigest,validation:report.validation,replay:report.replay}));if(error)process.exitCode=1;}
