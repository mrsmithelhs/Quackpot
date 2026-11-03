import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateSave} from '../../../src/core/storage.mjs';
const name=process.argv[2]??'production-day1-repair';
if(!['production-day1-repair','production-day1-seeded'].includes(name))throw Error('Unknown captured Day 1 directory');
const dir=`reports/development/plan-52-five-slot-production-transition/${name}`;
const trace=JSON.parse(await readFile(`${dir}/trace.json`,'utf8'));
const pins=[];for(const [path,expected] of Object.entries(trace.pins)){const actual=createHash('sha256').update(await readFile(path)).digest('hex');pins.push({path,expected,actual,match:actual===expected});}
const files=(await readdir(dir)).filter(name=>name.endsWith('.save.json')).sort(),saves=[];
for(const file of files){const bytes=await readFile(`${dir}/${file}`),envelope=JSON.parse(bytes);const result=validateSave(envelope,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});saves.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),valid:result.valid,errors:result.errors,day:envelope.state.life.schedule.day,slot:envelope.state.life.schedule.slot,story:envelope.state.life.story47?.stage??null});}
const evidence={origin:'actual isolated browser localStorage captured after real UI actions; no save contents edited',browserTraceError:trace.error,browserCleanup:trace.cleanup,sourceCommit:trace.sourceCommit,pins,saves};
await writeFile(`${dir}/validation.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify({count:saves.length,invalid:saves.filter(x=>!x.valid),mismatchedPins:pins.filter(x=>!x.match),browserTraceError:trace.error}));
if(!saves.length || saves.some(x=>!x.valid) || pins.some(x=>!x.match))process.exitCode=1;
