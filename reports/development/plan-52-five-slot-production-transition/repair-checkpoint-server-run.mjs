import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['--max-old-space-size=512','node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5173','--strictPort','--base','/Quackpot/'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
let log='';server.stdout.on('data',x=>log+=x);server.stderr.on('data',x=>log+=x);
try {
 let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Server exited: '+log);try{const r=await fetch('http://127.0.0.1:5173/Quackpot/');if(r.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Server did not start: '+log);
 const child=spawn(process.execPath,['--max-old-space-size=1024',process.argv[2]],{stdio:'inherit',windowsHide:true});const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve)});if(code!==0)throw Error('Browser recipe failed: '+code);
} finally {server.kill();await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));}
