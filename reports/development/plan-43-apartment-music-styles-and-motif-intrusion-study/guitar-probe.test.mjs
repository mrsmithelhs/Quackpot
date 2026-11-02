import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateEvents,synthesize,LIMITS} from './guitar-pluck.mjs';
const e={midi:60,velocity:90/127,start:.5,duration:.6,seed:1};
const hash=a=>createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
test('finite repeatable excitation, bounded output and declared tuning estimate',()=>{
 for(const midi of [40,48,60,72,84]){const v=validateEvents([{...e,midi}]);const a=synthesize(v.events[0],v),b=synthesize(v.events[0],v);assert.equal(hash(a),hash(b));assert(a.every(Number.isFinite));assert(a.some(x=>x!==0));assert(Math.abs(v.events[0].estimatedCents)<25);assert(a.length<=3*48000);}
});
test('invalid input and simultaneous overload are rejected before allocation',()=>{
 for(const bad of [{midi:NaN},{midi:39},{velocity:0},{velocity:Infinity},{duration:3.1},{start:-1},{seed:0}])assert.throws(()=>validateEvents([{...e,...bad}]));
 assert.throws(()=>validateEvents([e],{decay:1}));assert.throws(()=>validateEvents([e],{damping:-.1}));assert.throws(()=>validateEvents(Array(9).fill(e)));assert.throws(()=>validateEvents(Array(17).fill(e)));assert.throws(()=>validateEvents([e],{sampleRate:44100}));
});
test('note gate is finite and allocations stay within budget',()=>{const v=validateEvents([e]),a=synthesize(v.events[0],v);assert.equal(v.totalBytes,a.byteLength+v.events[0].delay*4);assert(v.totalBytes<=LIMITS.maxPcmBytes);assert(a.slice(Math.ceil((e.duration+.1)*48000)).every(x=>x===0));});
test('measured autocorrelation pitch stays within 25 cents in the declared guitar range',(t)=>{
 for(const midi of [40,48,60,72,84]){
  const v=validateEvents([{...e,midi,duration:1}]);const event=v.events[0],a=synthesize(event,v);const expected=48000/event.frequency;const center=Math.round(expected);let best=0,bestScore=-Infinity;const scores=new Map();
  for(let lag=Math.max(2,center-3);lag<=center+3;lag++){let sum=0;for(let i=4800;i<14400;i++)sum+=a[i]*a[i+lag];scores.set(lag,sum);if(sum>bestScore){bestScore=sum;best=lag;}}
  const left=scores.get(best-1),mid=scores.get(best),right=scores.get(best+1);assert(Number.isFinite(left)&&Number.isFinite(right),'peak outside search');const offset=.5*(left-right)/(left-2*mid+right);const hz=48000/(best+offset),cents=1200*Math.log2(hz/event.frequency);t.diagnostic(`midi ${midi}: ${cents.toFixed(2)} cents`);assert(Math.abs(cents)<25,`midi ${midi}: ${cents.toFixed(2)} cents`);
 }
});

test('cumulative PCM plus delay-line budget is enforced',()=>{
 const many=Array.from({length:16},(_,i)=>({...e,start:i*.38,duration:3,seed:i+1}));
 assert.throws(()=>validateEvents(many),/PCM budget/);
});
