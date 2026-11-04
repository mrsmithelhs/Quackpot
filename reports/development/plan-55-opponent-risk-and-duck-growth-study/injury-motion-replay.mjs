import { mkdir,open,readFile,link,unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolveSeededRace } from './injury-susceptibility-adapter.mjs';
import { REPLAY_CASES,historicalInput,projectHistorical,requireHistoricalParity } from './injury-replay-core.mjs';
const root='reports/development/plan-55-opponent-risk-and-duck-growth-study/';
const output=root+'injury-motion-replay-output';
const expected={pins:'4856561b71a59b43946d5b455209e2e1fd3ffd13d60911b03c05a1c71b0baf10',first:'6b71561d3b6f8fbb367704363840769e52c0f1e8fb7ce7cb7d92baba75e2ef61',contact:'0ee9b64069e70999002505e3be9c310f4b10229df999e917ba3325f5b25efe9d'};
const hash=b=>createHash('sha256').update(b).digest('hex');
const fileHash=async path=>hash(await readFile(path));
const writeExclusive=async(path,text)=>{const h=await open(path,'wx');try{await h.writeFile(text);}finally{await h.close();}};
await mkdir(output);let calls=0;const cases=[];let failure=null;
try {
 const pinBytes=await readFile(root+'injury-susceptibility-pins.txt');if(hash(pinBytes)!==expected.pins)throw Error('historical pin manifest differs');
 const pins=pinBytes.toString('utf8').trim().split(/\r?\n/);
 const checkPins=async()=>{for(const line of pins){const [sha,path]=line.split('  ');if(await fileHash(path)!==sha)throw Error(`historical source drift: ${path}`);}};
 await checkPins();
 const saved={};for(const arm of ['first','contact']){const bytes=await readFile(`${root}injury-susceptibility-results/${arm}.json`);if(hash(bytes)!==expected[arm])throw Error(`historical output drift: ${arm}`);const data=JSON.parse(bytes);if(data.version!=='plan55-injury-susceptibility/v1'||data.arm!==arm||data.failure||data.cases.length!==8)throw Error(`invalid historical output: ${arm}`);saved[arm]=data;}
 for(const spec of REPLAY_CASES){
  const input=historicalInput(spec.seedIndex,spec.arm),old=saved[spec.arm].cases[spec.seedIndex];
  if(old.seed!==input.seed||old.arm!==spec.arm)throw Error('historical selection mismatch');
  await checkPins();calls++;const resolution=resolveSeededRace(input);await checkPins();
  const actual=projectHistorical(resolution,input,spec.arm);requireHistoricalParity(actual,old);
  if(resolution.status!=='finished')throw Error('historical replay unresolved');
  const data={version:'plan55-injury-motion/v1',seed:input.seed,arm:spec.arm,dt:resolution.dt,trajectory:resolution.trajectory,case:actual};
  const text=JSON.stringify(data);cases.push({name:`${input.seed}-${spec.arm}.json`,text,sha256:hash(text)});
 }
 const manifest={version:'plan55-injury-motion-manifest/v1',historicalPinSha256:expected.pins,savedSourceSha256:{first:expected.first,contact:expected.contact},calls,cases:cases.map(({name,text,sha256})=>({name,bytes:Buffer.byteLength(text),sha256}))};
 const manifestText=JSON.stringify(manifest),total=cases.reduce((n,c)=>n+Buffer.byteLength(c.text),0)+Buffer.byteLength(manifestText);
 if(total>8*1024*1024)throw Error(`replay output exceeds 8 MiB: ${total}`);
 for(const c of cases)await writeExclusive(`${output}/${c.name}`,c.text);
 await writeExclusive(`${output}/complete.pending`,manifestText);
 await link(`${output}/complete.pending`,`${output}/complete.json`);
 await unlink(`${output}/complete.pending`);
 process.stdout.write(JSON.stringify({calls,cases:cases.length,bytes:total,manifestSha256:hash(manifestText)})+'\n');
} catch(e) {
 failure=String(e?.stack??e);await writeExclusive(`${output}/failure.json`,JSON.stringify({calls,failure}));
 process.stderr.write(JSON.stringify({calls,failure})+'\n');process.exitCode=1;
}




