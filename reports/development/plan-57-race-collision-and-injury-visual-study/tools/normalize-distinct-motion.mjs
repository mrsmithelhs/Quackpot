// Generate fixed family viewports once; original provider SVG bytes remain unchanged.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='reports/development/plan-57-race-collision-and-injury-visual-study/art/',input=base+'distinct-motion-original/',output=base+'distinct-motion-normalized/';
const families={pop:['pop'],tear:['tear'],fragments:['chip1','chip2','chip3','chip4']};
const sha=text=>createHash('sha256').update(text).digest('hex');
const manifest={method:'union vertices per motion family with conservative half-stroke times default miter limit 4; square around union; fixed across all animation poses',families:{}};
const derived=[];
for(const [family,names] of Object.entries(families)){
  let xmin=Infinity,ymin=Infinity,xmax=-Infinity,ymax=-Infinity,maxStroke=0;const originals=[];
  for(const name of names){
    const svg=await readFile(`${input}${name}.svg`,'utf8');
    if(!/^<svg\b[^>]*\bviewBox=['"]0 0 256 256['"][^>]*>/.test(svg)||/<(?:path|rect|circle|ellipse|line|g)\b|\btransform\s*=|<!|<\?xml/i.test(svg))throw Error(`${name}: unexpected geometry`);
    const shapes=[...svg.matchAll(/<(?:polygon|polyline)\b([^>]*)\/>/g)];if(!shapes.length)throw Error(`${name}: no supported geometry`);
    for(const [,attrs] of shapes){
      const points=/\bpoints=['"]([^'"]+)['"]/.exec(attrs)?.[1],stroke=/\bstroke-width=['"]([\d.]+)['"]/.exec(attrs)?.[1],miter=/\bstroke-miterlimit=['"]([\d.]+)['"]/.exec(attrs)?.[1];
      if(!points||!stroke||Number(stroke)>8||(miter&&Number(miter)>4))throw Error(`${name}: unsupported stroke or points`);
      const values=points.trim().split(/[\s,]+/).map(Number);if(values.length<4||values.length%2||values.some(x=>!Number.isFinite(x)))throw Error(`${name}: malformed points`);
      for(let i=0;i<values.length;i+=2){xmin=Math.min(xmin,values[i]);xmax=Math.max(xmax,values[i]);ymin=Math.min(ymin,values[i+1]);ymax=Math.max(ymax,values[i+1]);}maxStroke=Math.max(maxStroke,Number(stroke));
    }
    originals.push({name,svg});
  }
  const margin=maxStroke*2,size=Math.max(xmax-xmin+2*margin,ymax-ymin+2*margin),x=(xmin+xmax-size)/2,y=(ymin+ymax-size)/2,viewBox=[x,y,size,size].join(' ');
  manifest.families[family]={union:[xmin,ymin,xmax,ymax],maxStroke,margin,viewBox,components:{}};
  for(const original of originals){const svg=original.svg.replace(/viewBox=(['"])0 0 256 256\1/,`viewBox='${viewBox}'`);if(svg===original.svg)throw Error(`${original.name}: no viewport replacement`);manifest.families[family].components[original.name]={original:sha(original.svg),derived:sha(svg)};derived.push({name:original.name,svg});}
}
await mkdir(output,{recursive:false});for(const item of derived)await writeFile(`${output}${item.name}.svg`,item.svg,{flag:'wx'});await writeFile(`${output}manifest.json`,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(manifest));
