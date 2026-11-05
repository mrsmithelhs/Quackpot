import {parentPort} from 'node:worker_threads';
globalThis.self={addEventListener(type,fn){if(type==='message')parentPort.on('message',data=>fn({data}));},postMessage(data){parentPort.postMessage(data);}};
await import('../../../../src/core/race-v2/race-worker.mjs');
