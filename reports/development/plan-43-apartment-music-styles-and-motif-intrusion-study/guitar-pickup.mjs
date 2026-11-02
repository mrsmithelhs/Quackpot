/* Report-local feedforward pickup-inspired coloration, not a calibrated pickup. */
export function pickupColor(samples,noteDelay,depth){
 if(!(samples instanceof Float32Array)||!Number.isSafeInteger(samples.length)||samples.length<1||samples.length>144000)throw Error('invalid PCM source');
 if(!Number.isSafeInteger(noteDelay)||noteDelay<2||noteDelay>48000)throw Error('invalid string period');
 if(!Number.isFinite(depth)||depth<0||depth>1)throw Error('invalid depth');
 for(const x of samples)if(!Number.isFinite(x))throw Error('nonfinite PCM');
 const delay=Math.max(1,Math.round(.20*noteDelay));if(delay>=samples.length)throw Error('delay exceeds PCM');
 const output=new Float32Array(samples.length),scale=1/(1+depth);
 if(depth===0){output.set(samples);return {output,delay,depth,scale};}
 for(let i=0;i<samples.length;i++)output[i]=(samples[i]-depth*(i>=delay?samples[i-delay]:0))*scale;
 return {output,delay,depth,scale};
}

