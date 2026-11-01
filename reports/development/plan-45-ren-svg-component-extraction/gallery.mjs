import {renderRen, renderRenScene, renderFloorCandidate, REN_EXPRESSIONS} from '../../../src/assets/ren/index.mjs';
const put=(id,svg)=>document.getElementById(id).innerHTML=svg;
for(const [i,e] of REN_EXPRESSIONS.entries()) for(const [id,framing] of [['avatars','avatar'],['busts','bust']]){
 const el=document.createElement('div');el.className=framing==='avatar'?'avatar':'bust';el.title=e;el.innerHTML=renderRen({idPrefix:`${id}-${i}`,expression:e,framing}).svg;document.getElementById(id).append(el);
}
const door=prefix=>renderRenScene({idPrefix:prefix,scene:'door'}).svg;
put('door',door('gallery-door')); put('door-before',door('door-before'));
// Owner-directed new hand/wrist drawing: keep the original concept source untouched.
function handVariant(prefix) {
 let svg=door(prefix); const c=`ren-${prefix}`;
 const old=`<path class="${c}-skin ${c}-l3" d="M216 300 L200 262 L178 268 L192 300Z"/>\n  <ellipse class="${c}-skin ${c}-l3" cx="186" cy="262" rx="13" ry="9" transform="rotate(-20 186 262)"/>\n  <path class="${c}-l2" fill="none" d="M176 258 Q182 262 190 258"/>`;
 const revised=`<path class="${c}-skin ${c}-l3" d="M216 300 L207 281 Q205 276 205 270 Q205 265 204 263 Q208 257 205 254 Q202 252 199 259 Q197 258 195 259 L190 259 Q187 259 187 262 Q187 264 190 265 L187 265 Q184 265 184 268 Q184 271 187 271 L189 271 Q186 271 186 274 Q186 277 190 277 L192 277 Q189 277 189 280 Q189 282 192 282 L195 281 Q198 282 199 285 L192 300Z"/><path class="${c}-l2" fill="none" d="M190 265 L198 264 M189 271 L198 270 M192 277 L200 275"/>`;

 if(!svg.includes(old)) throw Error('Door hand source drift');
 return svg.replace(old,revised);
}
const handCrop=svg=>svg.replace('viewBox="0 0 960 540"','viewBox="520 430 150 110"');
put('hand-original',handCrop(door('hand-original')));put('hand-candidate',handCrop(handVariant('hand-candidate')));put('door-candidate',handVariant('door-candidate'));
const couch=prefix=>renderRenScene({idPrefix:prefix,scene:'couch-close'}).svg;
put('couch',couch('gallery-couch')); put('couch-before',couch('couch-before'));
// Gallery-only candidate: reposition the existing figure upward and move the viewport.
const oldPlacement='translate(735.8 405.4) scale(0.2436)';
let raised=couch('couch-raised');
if(!raised.includes(oldPlacement)||!raised.includes('viewBox="536 100 400 225"')) throw Error('Couch candidate source drift');
raised=raised.replace(oldPlacement,'translate(735.8 316.4) scale(0.2436)').replace('viewBox="536 100 400 225"','viewBox="536 -10 400 225"');
put('couch-raised',raised);
const floor=(prefix)=>renderFloorCandidate({idPrefix:prefix}).svg;
put('floor',floor('gallery-floor'));
const detail=svg=>svg.replace('viewBox="0 0 960 540"','viewBox="150 285 700 195"');
put('detail',detail(floor('gallery-detail')));
const crop=svg=>svg.replace('viewBox="0 0 960 540"','viewBox="300 160 500 281.25"');
put('crop',crop(floor('gallery-crop')));
const original=await fetch('../plan-41-ren-friend-character-and-social-life-study/concepts/apartment-scenes/scenes/ren-floor-game-night.svg').then(r=>{if(!r.ok)throw Error('original missing');return r.text()});
// The original is displayed as an image to prevent its original CSS/IDs affecting the extracted instances.
const url=URL.createObjectURL(new Blob([crop(original)],{type:'image/svg+xml'}));
const img=document.createElement('img');img.alt='Original floor scene, derived close crop';img.src=url;document.getElementById('crop-original').append(img);

const detailUrl=URL.createObjectURL(new Blob([detail(original)],{type:'image/svg+xml'}));
const detailImg=document.createElement('img');detailImg.alt='Original floor scene detail showing Ren behind the table and duck on the blue book';detailImg.src=detailUrl;document.getElementById('detail-original').append(detailImg);
