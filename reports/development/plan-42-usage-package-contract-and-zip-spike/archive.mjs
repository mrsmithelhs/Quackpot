import {ZipReader, ZipWriter, Uint8ArrayReader, Uint8ArrayWriter, configure} from './vendor-2.18/lib/zip-core.js';
import {DecompressionStreamZlib,setWasmExports} from './guarded-codec.mjs';
import {parseBoundedJson,validateUsage} from './usage-contract.mjs';
const FILE_LIMIT=8*1024*1024, OUTPUT_LIMIT=2*1024*1024;
class CappedReader extends Uint8ArrayReader {
 readUint8Array(offset,length){if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(length)||offset<0||length<0||offset+length>this.size||length>FILE_LIMIT)throw Error('archive read bounds');return super.readUint8Array(offset,length)}
}
export async function initCodec(wasmBytes){const {instance}=await WebAssembly.instantiate(wasmBytes);setWasmExports(instance.exports)}
export async function decodeZip(bytes,{limit=OUTPUT_LIMIT,signal,onExpanded=()=>{}}={}){
 if(!(bytes instanceof Uint8Array)||bytes.length>FILE_LIMIT)throw Error('archive byte limit');
 if(!Number.isSafeInteger(limit)||limit<0||limit>OUTPUT_LIMIT)throw Error('invalid output limit');
 let codecCalls=0;class Guarded {constructor(format){if(format!=='deflate-raw')throw Error('unsupported codec');codecCalls++;return new DecompressionStreamZlib(format,{maxOutput:limit,outBuffer:65536,inBufferSize:65536,onProduced:onExpanded})}}
 configure({useWebWorkers:false,useCompressionStream:false,DecompressionStreamFallback:Guarded,chunkSize:65536});
 const reader=new ZipReader(new CappedReader(bytes),{strictness:'strict',useWebWorkers:false,useCompressionStream:false});let chunks=[],total=0;
 try {let entry;let count=0;for await(const e of reader.getEntriesGenerator()){if(++count>1)throw Error('extra ZIP member');entry=e}if(reader.warnings?.length)throw Error('unsupported archive warnings');if(count!==1||entry.filename!=='usage.json'||entry.directory||entry.symlink||entry.encrypted||entry.zip64||![0,8].includes(entry.compressionMethod)||entry.bitFlag?.dataDescriptor||((entry.rawBitFlag & ~0x806)!==0)||((entry.version & 255)>20))throw Error('unsupported ZIP member');if(entry.uncompressedSize>limit)throw Error('declared expanded limit');
 const sink=new WritableStream({write(chunk){if(chunk.length>limit-total)throw Error('actual expanded limit');total+=chunk.length;if(entry.compressionMethod===0)onExpanded(chunk.length);chunks.push(chunk.slice())}});
 await entry.getData(sink,{strictness:'strict',checkCrc32:true,checkOverlappingEntry:true,useWebWorkers:false,useCompressionStream:false,signal});if(entry.warnings?.length)throw Error('unsupported entry warnings');if(entry.compressionMethod===8&&codecCalls!==1)throw Error('guard bypass');const out=new Uint8Array(total);let pos=0;for(const chunk of chunks){out.set(chunk,pos);pos+=chunk.length}chunks=[];return {usage:validateUsage(parseBoundedJson(out)),expanded:total,compressed:bytes.length};
 }finally{chunks=[];await reader.close()}
}
export async function encodeZip(usage){validateUsage(usage);const raw=new TextEncoder().encode(JSON.stringify(usage));if(raw.length>OUTPUT_LIMIT)throw Error('JSON byte limit');configure({useWebWorkers:false,useCompressionStream:true});const w=new ZipWriter(new Uint8ArrayWriter(),{useWebWorkers:false});await w.add('usage.json',new Uint8ArrayReader(raw),{useWebWorkers:false,dataDescriptor:false});const bytes=await w.close();if(bytes.length>FILE_LIMIT)throw Error('archive byte limit');return {bytes,rawBytes:raw.length}}

