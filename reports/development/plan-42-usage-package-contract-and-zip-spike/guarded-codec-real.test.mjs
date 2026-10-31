import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
import {setWasmExports, DecompressionStreamZlib} from './guarded-codec.mjs';
const bytes=await readFile(new URL('./inspection-2.18/package/lib/core/streams/zlib-wasm/zlib-streams.wasm',import.meta.url));
const {instance}=await WebAssembly.instantiate(bytes);setWasmExports(instance.exports);assert.equal(instance.exports.memory.buffer.byteLength,258*65536);
async function inflate(input,limit){const s=new DecompressionStreamZlib('deflate-raw',{maxOutput:limit});const chunks=[];let size=0;const read=(async()=>{for await(const chunk of s.readable){chunks.push(chunk);size+=chunk.length}})();const w=s.writable.getWriter();const write=(async()=>{try{await w.write(input);await w.close()}catch(e){throw e}})();await Promise.all([read,write]);return Buffer.concat(chunks,size)}
const raw=Buffer.alloc(100_000,65), compressed=deflateRawSync(raw);assert.deepEqual(await inflate(compressed,100_000),raw);await assert.rejects(inflate(compressed,99_999),/output limit/);assert.equal(instance.exports.memory.buffer.byteLength,258*65536);console.log(`PASS real WASM roundtrip and over-budget rejection: ${raw.length} raw / ${compressed.length} deflate bytes`);
