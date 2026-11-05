// Harmless child exits after it can be sampled; parent remains alive briefly.
import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['-e','setTimeout(()=>{},1500)'],{stdio:'ignore',windowsHide:true});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
setTimeout(()=>{},4000);
