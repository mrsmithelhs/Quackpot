// Exactly one predeclared mixed case; no seed search or altered physics.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolveIntegerRace } from './integer-kernel.mjs';
import { encodeResult, decodeResult } from './codec.mjs';
import { fixedInput } from './fixtures.mjs';
const [seed,path]=process.argv.slice(2);
if(!['pair-0','pair-1'].includes(seed)||!path)throw new RangeError('invalid reproduction');
const table=JSON.parse(readFileSync(new URL('../reference-v1.json',import.meta.url),'utf8'));
const result=resolveIntegerRace(fixedInput(seed,{mixed:true}),table),encoded=await encodeResult(result);
const decoded=await decodeResult(encoded);
if(await encodeResult(decoded)!==encoded)throw new Error('roundtrip mismatch');
writeFileSync(path,encoded,{flag:'wx'});
console.log(JSON.stringify({seed,status:decoded.status,clock:decoded.clock,unresolved:decoded.unresolved,bytes:Buffer.byteLength(encoded),roundtrip:true}));
