import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ZipReader, ZipWriter, Uint8ArrayReader, Uint8ArrayWriter, configure} from './inspection-2.18/package/lib/zip-core.js';
import {setWasmExports, DecompressionStreamZlib} from './guarded-codec.mjs';
const wasm=await readFile(new URL('./inspection-2.18/package/lib/core/streams/zlib-wasm/zlib-streams.wasm',import.meta.url));
setWasmExports((await WebAssembly.instantiate(wasm)).instance.exports);
let calls=0; class Guarded {constructor(format){calls++;return new DecompressionStreamZlib(format,{maxOutput:4096})}}
configure({useWebWorkers:false,useCompressionStream:false,DecompressionStreamFallback:Guarded});
// Produce a genuine DEFLATE ZIP with the built-in Node codec rather than a hand-written ZIP structure.
const input=new TextEncoder().encode('a'.repeat(3000));
configure({useCompressionStream:true});const writer=new ZipWriter(new Uint8ArrayWriter());await writer.add('usage.json',new Uint8ArrayReader(input));const zip=await writer.close();
configure({useCompressionStream:false});const reader=new ZipReader(new Uint8ArrayReader(zip),{strictness:'strict'});const entries=await reader.getEntries();const result=await entries[0].getData(new Uint8ArrayWriter(),{checkCrc32:true,useWebWorkers:false,useCompressionStream:false});assert.deepEqual(result,input);assert.equal(calls,1);await reader.close();console.log('PASS reader selected guarded fallback for ZIP DEFLATE and returned matching bytes');
