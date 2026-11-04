// Derive one shared square viewport per family from original polygon geometry.
// Run only after root allocation; no original asset is modified.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='reports/development/plan-57-race-collision-and-injury-visual-study/';
const input=`${base}art/burst-continuation/`, output=`${base}art/burst-normalized/`;
const frames=['onset','expansion','breakup','settle'];
const sha=text=>createHash('sha256').update(text).digest('hex');
const manifest={method:'union polygon vertices across all four frames; add conservative 6-unit margin for <=3-unit stroke and default miter limit <=4; square about union center',families:{}};
const results=[];
for(const family of ['A','B','C']){
  let xmin=Infinity,ymin=Infinity,xmax=-Infinity,ymax=-Infinity,maxStroke=0;
  const originals=[];
  for(const frame of frames){
    const name=`${family}-${frame}.svg`,svg=await readFile(input+name,'utf8');
    if(!/^<svg\b[^>]*\bviewBox="0 0 256 256"[^>]*>/.test(svg)||/<(?:path|rect|circle|ellipse|polyline|line|g)\b|\btransform\s*=|<!|<\?xml/i.test(svg))throw Error(`${name}: unexpected geometry`);
    const polygons=[...svg.matchAll(/<polygon\b([^>]*)\/>/g)]; if(!polygons.length)throw Error(`${name}: no polygons`);
    for(const [,attrs] of polygons){
      const points=/\bpoints="([^"]+)"/.exec(attrs)?.[1],stroke=/\bstroke-width="([\d.]+)"/.exec(attrs)?.[1];
      const miter=/\bstroke-miterlimit="([\d.]+)"/.exec(attrs)?.[1];
      if(!points||!stroke||Number(stroke)>3||(miter&&Number(miter)>4))throw Error(`${name}: unsupported stroke/points`);
      const numbers=points.trim().split(/[\s,]+/).map(Number);if(numbers.length<6||numbers.length%2||numbers.some(x=>!Number.isFinite(x)))throw Error(`${name}: malformed points`);
      for(let i=0;i<numbers.length;i+=2){xmin=Math.min(xmin,numbers[i]);xmax=Math.max(xmax,numbers[i]);ymin=Math.min(ymin,numbers[i+1]);ymax=Math.max(ymax,numbers[i+1]);}
      maxStroke=Math.max(maxStroke,Number(stroke));
    }
    originals.push({name,svg,sha256:sha(svg)});
  }
  const margin=6,size=Math.max(xmax-xmin+2*margin,ymax-ymin+2*margin),x=(xmin+xmax-size)/2,y=(ymin+ymax-size)/2;
  const viewBox=[x,y,size,size].join(' ');
  manifest.families[family]={union:[xmin,ymin,xmax,ymax],maxStroke,viewBox,frames:{}};
  for(const original of originals){const derived=original.svg.replace('viewBox="0 0 256 256"',`viewBox="${viewBox}"`);if(derived===original.svg)throw Error(`${original.name}: no viewBox replacement`);manifest.families[family].frames[original.name]={original:original.sha256,derived:sha(derived)};results.push({name:original.name,svg:derived});}
}
await mkdir(output,{recursive:false});
for(const result of results)await writeFile(output+result.name,result.svg,{flag:'wx'});
await writeFile(output+'manifest.json',JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(manifest));
