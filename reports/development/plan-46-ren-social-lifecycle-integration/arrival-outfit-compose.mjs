// Report-only mechanical comparison. No runtime import or accepted source mutation.
import {renderRenScene,renderFloorCandidate} from '../../../src/assets/ren/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import path from 'node:path';
const dir=path.resolve('reports/development/plan-46-ren-social-lifecycle-integration/arrival-outfit-empty');await mkdir(dir,{recursive:true});
const hash=s=>createHash('sha256').update(s).digest('hex');const prefix='outfit';
const door=renderRenScene({idPrefix:prefix,scene:'door'}).svg;
const donors={pajamas:renderRenScene({idPrefix:prefix,scene:'couch-close'}).svg,cardigan:renderFloorCandidate({idPrefix:prefix}).svg};
function exact(s,from,to,label){const i=s.indexOf(from);if(i<0||s.indexOf(from,i+from.length)!==-1)throw Error(`${label}: non-unique`);return s.slice(0,i)+to+s.slice(i+from.length);}
function group(s,id){const start=s.indexOf(`<g id="${id}"`);if(start<0||s.indexOf(`<g id="${id}"`,start+1)!==-1)throw Error(`missing/nonunique ${id}`);const re=/<\/?g(?=[\s/>])[^>]*>/g;re.lastIndex=start;let depth=0,m;while((m=re.exec(s))){depth+=m[0].startsWith('</')?-1:m[0].endsWith('/>')?0:1;if(depth===0)return s.slice(start,re.lastIndex);}throw Error(`unclosed ${id}`);}
function element(s,tag,id){const begin=s.indexOf(`<${tag} id="${id}"`);if(begin<0||s.indexOf(`<${tag} id="${id}"`,begin+1)!==-1)throw Error(`missing/nonunique ${id}`);const end=s.indexOf(`</${tag}>`,begin);if(end<0)throw Error(`unclosed ${id}`);return s.slice(begin,end+tag.length+3);}
const sample='<svg><g id="sample"><g/><g id="nested"><g /></g></g><g id="later"/></svg>';
if(group(sample,'sample')!=='<g id="sample"><g/><g id="nested"><g /></g></g>')throw Error('nested/self-closing group extraction failed');
const info={door:hash(door),donors:{},candidates:{}};
for(const [name,donor] of Object.entries(donors)){
 const key=name==='pajamas'?'couch-medium':'floor-game-night';const stem=`${prefix}-ren-${key}`;
 const torso=group(donor,`${stem}-LAYER-torso`),collar=group(donor,`${stem}-LAYER-collar`);
 const clip=name==='cardigan'?element(donor,'clipPath',`${stem}-base-tclip`):'';
 const start='<g transform="translate(306 105) scale(1.45)">';const at=door.indexOf(start);
 if(at<0||door.indexOf(start,at+1)!==-1)throw Error('door figure group not unique');
 const end=door.indexOf('</g>',at);if(end<0)throw Error('door figure group unclosed');
 const original=door.slice(at,end+4);
 let derived=exact(original,`<use href="#${prefix}-r4-torso"/>`,`<use href="#${stem}-LAYER-torso"/>`,'door torso');
 derived=exact(derived,`<use href="#${prefix}-r4-box-arm"/>`,'','door box-arm');
 derived=exact(derived,`<use href="#${prefix}-r4-neck"/>`,`<use href="#${prefix}-r4-neck"/><use href="#${stem}-LAYER-collar"/>`,'door neck');
 let svg=exact(door,original,derived,'door figure');
 svg=exact(svg,'</defs>',`${clip}${torso}${collar}</defs>`,'defs');
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]),refs=[...svg.matchAll(/(?:href="#|url\(#)([^"\)]+)/g)].map(x=>x[1]);
 const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i),missing=refs.filter(r=>!ids.includes(r));const unsafe=/<script\b|<foreignObject\b|\son\w+=|(?:href|src)="(?:https?:|\/\/)/i.test(svg);if(duplicates.length||missing.length||unsafe)throw Error(JSON.stringify({name,duplicates,missing,unsafe}));
 await writeFile(path.join(dir,`${name}.svg`),svg);info.donors[name]=hash(donor);info.candidates[name]=hash(svg);
}
await writeFile(path.join(dir,'original.svg'),door);await writeFile(path.join(dir,'source-pins.json'),JSON.stringify(info,null,2));
