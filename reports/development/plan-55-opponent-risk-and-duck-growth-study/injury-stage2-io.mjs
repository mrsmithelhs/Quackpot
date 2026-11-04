import {boundedRead,checkPins,sha} from './predictive-stage-io.mjs';import {stat} from 'node:fs/promises';
const base='reports/development/plan-55-opponent-risk-and-duck-growth-study/',stage1='bddb34ca78161f49adbc920113ea4586295af473fa59a96751edc031c346b1d0',clearance='65c458b92329c4e76d0c3aa7efa5b22255669b182222fc826e3b26b28dda6fb6';
export async function absent(p){try{await stat(p);return false}catch(e){if(e.code==='ENOENT')return true;throw e}}
async function manifest(path,expected){const b=await boundedRead(path,32768);if(sha(b)!==expected)throw Error('manifest drift '+path);for(const line of b.toString().trim().split(/\r?\n/)){const [h,p]=line.split('  ');if(sha(await boundedRead(p,2*1024*1024))!==h)throw Error('pin drift '+p)}}
export async function injuryPins(expected){if(!/^[a-f0-9]{64}$/.test(expected??''))throw Error('missing pin digest');await checkPins(stage1);await manifest(base+'clearance-stage-pins.txt',clearance);await manifest(base+'injury-stage2-pins.txt',expected)}
export async function exclusiveWrite(path,bytes){const h=await (await import('node:fs/promises')).open(path,'wx');try{await h.writeFile(bytes)}finally{await h.close()}}

export async function claimShard(root,name){for(const suffix of ['.started.json','.json','.complete.json','.failure.json'])if(!await absent(root+name+suffix))throw Error('shard already consumed: '+name);await exclusiveWrite(root+name+'.started.json',JSON.stringify({name,version:'plan55-shard-start/v1'}));}
