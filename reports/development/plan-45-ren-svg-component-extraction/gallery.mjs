import {renderRen, renderRenScene, renderFloorCandidate, REN_EXPRESSIONS} from '../../../src/assets/ren/index.mjs';
const put=(id,svg)=>document.getElementById(id).innerHTML=svg;
for(const [i,e] of REN_EXPRESSIONS.entries()) for(const [id,framing] of [['avatars','avatar'],['busts','bust']]){
 const el=document.createElement('div');el.className=framing==='avatar'?'avatar':'bust';el.title=e;el.innerHTML=renderRen({idPrefix:`${id}-${i}`,expression:e,framing}).svg;document.getElementById(id).append(el);
}
put('door',renderRenScene({idPrefix:'gallery-door',scene:'door'}).svg);
put('couch',renderRenScene({idPrefix:'gallery-couch',scene:'couch-close'}).svg);
const floor=(prefix)=>renderFloorCandidate({idPrefix:prefix}).svg;
put('floor',floor('gallery-floor')); put('detail',floor('gallery-detail'));
const crop=svg=>svg.replace('viewBox="0 0 960 540"','viewBox="300 160 500 281.25"');
put('crop',crop(floor('gallery-crop')));
const original=await fetch('../plan-41-ren-friend-character-and-social-life-study/concepts/apartment-scenes/scenes/ren-floor-game-night.svg').then(r=>{if(!r.ok)throw Error('original missing');return r.text()});
// The original is displayed as an image to prevent its original CSS/IDs affecting the extracted instances.
const url=URL.createObjectURL(new Blob([crop(original)],{type:'image/svg+xml'}));
const img=document.createElement('img');img.alt='Original floor scene, derived close crop';img.src=url;document.getElementById('crop-original').append(img);
