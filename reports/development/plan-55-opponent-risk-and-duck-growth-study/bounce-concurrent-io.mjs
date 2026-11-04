import {exposurePins} from './bounce-exposure-io.mjs';
import {boundedRead,sha} from './predictive-stage-io.mjs';
const base='reports/development/plan-55-opponent-risk-and-duck-growth-study/';
export async function concurrentPins(expected){
 await exposurePins('3233cd05cd2273133916b0ac7ea62a353f708f6843b3b603dbd234c0d6800f98');
 const b=await boundedRead(base+'bounce-concurrent-pins.txt',32768);
 if(!/^[a-f0-9]{64}$/.test(expected??'')||sha(b)!==expected)throw Error('concurrent pin mismatch');
 for(const line of b.toString().trim().split(/\r?\n/)){const [h,path]=line.split('  ');if(sha(await boundedRead(path,2*1024*1024))!==h)throw Error('concurrent source drift '+path)}
}
