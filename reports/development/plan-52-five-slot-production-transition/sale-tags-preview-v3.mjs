import {preview} from 'vite';
const server=await preview({configFile:false,base:'/Quackpot/',preview:{host:'127.0.0.1',port:4192,strictPort:true},build:{outDir:'node_modules/.cache/qp52-sale-tags-v3-20261104'}});
const timer=setTimeout(()=>{server.httpServer.close(()=>process.exit(0));setTimeout(()=>process.exit(1),1000).unref();},85000);timer.unref();
console.log('Bounded static preview ready on loopback:4192');
