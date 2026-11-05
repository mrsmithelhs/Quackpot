// Harmless short-lived child for bounded-launcher exit-race and output-cap observation.
import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['-e','process.exit(0)'],{stdio:'ignore',windowsHide:true});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',()=>{process.stdout.write('X'.repeat(70000));setTimeout(()=>{},600);});
