import {mkdir,open,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {completionValid,REPLAY_NAMES} from './injury-motion-gate.mjs';
const root='reports/development/plan-55-opponent-risk-and-duck-growth-study/', source=root+'injury-motion-replay-output/', dest=root+'injury-motion-recovered-output-corrected/';
const expected={pins:'4856561b71a59b43946d5b455209e2e1fd3ffd13d60911b03c05a1c71b0baf10',first:'6b71561d3b6f8fbb367704363840769e52c0f1e8fb7ce7cb7d92baba75e2ef61',contact:'0ee9b64069e70999002505e3be9c310f4b10229df999e917ba3325f5b25efe9d'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const write=async(p,b)=>{const h=await open(p,'wx');try{await h.writeFile(b)}finally{await h.close()}};
await mkdir(dest);let published=false;
try{
 const files=await readdir(source);if(files.length!==6||!['complete.pending','failure.json',...REPLAY_NAMES].every(n=>files.includes(n)))throw Error('unexpected failed-attempt contents');
 const pending=await readFile(source+'complete.pending'),failure=await readFile(source+'failure.json'),manifest=JSON.parse(pending);
 if(!completionValid(manifest,false,false)||manifest.historicalPinSha256!==expected.pins||!isDeepStrictEqual(manifest.savedSourceSha256,{first:expected.first,contact:expected.contact}))throw Error('invalid retained manifest');
 const failed=JSON.parse(failure);if(failed.calls!==4||!failed.failure.includes('EPERM'))throw Error('unexpected original failure');
 const pinbytes=await readFile(root+'injury-susceptibility-pins.txt');if(sha(pinbytes)!==expected.pins)throw Error('historical manifest changed');
 for(const line of pinbytes.toString('utf8').trim().split(/\r?\n/)){const [hash,path]=line.split('  ');if(sha(await readFile(path))!==hash)throw Error('historical source changed: '+path)}
 const saved={};for(const arm of ['first','contact']){const b=await readFile(`${root}injury-susceptibility-results/${arm}.json`);if(sha(b)!==expected[arm])throw Error('historical output changed');saved[arm]=JSON.parse(b);if(saved[arm].failure||saved[arm].cases.length!==8||saved[arm].arm!==arm)throw Error('invalid historical output')}
 const blobs=[];let total=pending.length;const original={pending:sha(pending),failure:sha(failure),cases:{}};
 for(const e of manifest.cases){const b=await readFile(source+e.name);total+=b.length;if(b.length!==e.bytes||sha(b)!==e.sha256)throw Error('retained bytes mismatch');original.cases[e.name]=sha(b);const x=JSON.parse(b);const match=/^p55m-(000|001)-(first|contact)\.json$/.exec(e.name);if(!match||x.version!=='plan55-injury-motion/v1'||x.seed!==`p55m-${match[1]}`||x.arm!==match[2]||!isDeepStrictEqual(x.case,saved[x.arm].cases[Number(match[1])]))throw Error('stored case differs');if(!Number.isFinite(x.dt)||x.dt<=0||!Array.isArray(x.trajectory)||x.trajectory.length<2)throw Error('invalid trajectory');let prev=-1;for(const f of x.trajectory){if(!Number.isFinite(f.tick)||f.tick<0||f.tick<=prev||(!Number.isInteger(f.tick)&&!x.case.crossings.some(c=>Math.abs(c.time-f.tick*x.dt)<1e-7))||!Array.isArray(f.entrants)||f.entrants.length!==6)throw Error('invalid frame');prev=f.tick;const ids=f.entrants.map(q=>q.id);if(new Set(ids).size!==6||!['P','A','B','C','D','E'].every(id=>ids.includes(id))||f.entrants.some(q=>!Number.isFinite(q.x)||!Number.isFinite(q.y)))throw Error('invalid positions')}blobs.push({name:e.name,bytes:b});}
 if(total>8*1024*1024)throw Error('size cap exceeded');
 for(const x of blobs)await write(dest+x.name,x.bytes);
 const receipt=Buffer.from(JSON.stringify({version:'plan55-replay-recovery/v1',resolverCalls:0,reason:'Recovered retained parity-checked bytes after failed hard-link publication; original preserved',original,manifestSha256:sha(pending)}));await write(dest+'recovery-receipt.json',receipt);
 await write(dest+'complete.json',pending);published=true;
 for(const x of blobs)if(sha(await readFile(dest+x.name))!==sha(x.bytes))throw Error('output verification failed');
 if(sha(await readFile(dest+'complete.json'))!==sha(pending)||!completionValid(JSON.parse(await readFile(dest+'complete.json')),false,false))throw Error('completion verification failed');
 process.stdout.write(JSON.stringify({resolverCalls:0,original,manifestSha256:sha(pending),receiptSha256:sha(receipt),bytes:total})+'\n');
}catch(e){await write(dest+'failure.json',JSON.stringify({resolverCalls:0,published,error:String(e?.stack??e)}));process.stderr.write(String(e?.stack??e)+'\n');process.exitCode=1}
