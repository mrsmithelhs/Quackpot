// Presentation-only timeline. The caller supplies cosmetic randomness; no game state or PRNG is used.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function createCosmeticTimeline(random=Math.random){
 const rand=()=>clamp(Number(random())||0,0,.999999),hold=()=>22+16*rand();
 const firstHold=hold(),secondHold=hold();const furniture=[{phase:'hold',elapsed:0,duration:firstHold},{phase:'hold',elapsed:0,duration:Math.abs(secondHold-firstHold)<3?(secondHold<=35?secondHold+3:secondHold-3):secondHold}];
 let group=null,gap=3,serial=0,time=0;
 function advanceFurniture(item,delta){let left=delta;while(left>0){const take=Math.min(left,item.duration-item.elapsed);item.elapsed+=take;left-=take;if(item.elapsed>=item.duration-1e-9){item.elapsed=0;if(item.phase==='hold'){item.phase='out';item.duration=5;}else if(item.phase==='out'){item.phase='in';item.duration=5;}else{item.phase='hold';item.duration=hold();}}}return item.phase==='hold'?1:item.phase==='out'?1-smooth(item.elapsed/5):smooth(item.elapsed/5);}
 function newGroup(){const count=1+Math.floor(rand()*5),ducks=[];for(let i=0;i<count;i++)ducks.push({palette:['classic-yellow','mallard-green','bubblegum-pink'][Math.floor(rand()*3)],hat:['none','tiny-top-hat','sailor-cap'][Math.floor(rand()*3)],accessory:['none','bow-tie','monocle'][Math.floor(rand()*3)],lane:rand()});return {id:++serial,elapsed:0,duration:15,ducks};}
 function groupView(){if(!group)return null;const p=clamp(group.elapsed/group.duration,0,1),count=group.ducks.length,converge=count>1?Math.max(0,1-Math.abs(p-.48)/.12):0;return {id:group.id,progress:p,ducks:group.ducks.map((d,i)=>({...d,x:-.20+p*1.40+(i-(count-1)/2)*.075*(1-.8*converge),y:12+d.lane*48+Math.sin(p*Math.PI*2+i)*10*(1-converge)+converge*(35-(12+d.lane*48)),paddle:Math.sin(group.elapsed*8+i)})),contact:count>1&&p>=.455&&p<.505,bounce:count>1&&p>=.51&&p<.64,crowd:count>1&&p>=.68&&p<.82};}
 return {step(delta){delta=clamp(Number(delta)||0,0,.1);time+=delta;const tv=advanceFurniture(furniture[0],delta),couch=advanceFurniture(furniture[1],delta);if(group){group.elapsed+=delta;if(group.elapsed>=group.duration){group=null;gap=8+12*rand();}}else{gap-=delta;if(gap<=0)group=newGroup();}return {time,tv,couch,group:groupView()};},snapshot(){return {time,furniture:furniture.map(x=>({...x})),group:groupView(),gap};}};
}
