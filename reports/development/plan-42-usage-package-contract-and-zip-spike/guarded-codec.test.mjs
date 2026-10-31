import assert from 'node:assert/strict';
import {setWasmExports, DecompressionStreamZlib} from './guarded-codec.mjs';
function fake(mode) {
  const memory = new WebAssembly.Memory({initial:2}); let consumed=0, calls=0, freed=0;
  const api={memory,malloc:(n)=>n===65536?64:64,free:()=>freed++,inflate_new:()=>1,inflate_init_raw:()=>0,inflate_end:()=>0,inflate_last_consumed:()=>consumed,inflate_process:(_h,_in,n,_out,_sz,flush)=>{ calls++; consumed=n; if(mode==='process' && !flush) return 5; if(mode==='flush' && flush) return 5; return (1<<24); }};
  return {api,get freed(){return freed},get calls(){return calls}};
}
for(const mode of ['process','flush']) {
  const f=fake(mode);setWasmExports(f.api);const stream=new DecompressionStreamZlib('deflate-raw',{maxOutput:4});
  const read=(async()=>{const r=stream.readable.getReader(); try {while(!(await r.read()).done) assert.fail('oversized output reached reader')} catch(e){assert.match(String(e),/output limit/)} })();
  const writer=stream.writable.getWriter();
  if(mode==='process') await assert.rejects(writer.write(new Uint8Array([1])),/output limit/);
  else await assert.rejects(writer.close(),/output limit/);
  await read;assert.ok(f.freed>=2,`${mode} disposes buffers`);assert.ok(f.calls>0);
}
console.log('PASS fake process and flush reject before output; state disposed');
