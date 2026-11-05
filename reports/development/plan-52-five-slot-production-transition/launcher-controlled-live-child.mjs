// Harmless owned long-lived child, used only with the sampled-child stop fault.
import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['-e','setTimeout(()=>{},20000)'],{stdio:'ignore',windowsHide:true});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
setTimeout(()=>{},20000);
