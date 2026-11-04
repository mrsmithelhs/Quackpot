import {createServer} from 'vite';
const server=await createServer({configFile:false,root:process.cwd(),base:'/Quackpot/',server:{host:'127.0.0.1',port:4192,strictPort:true}});await server.listen();const timer=setTimeout(()=>server.close().then(()=>process.exit(0)),85000);timer.unref();console.log('Bounded component server ready');
