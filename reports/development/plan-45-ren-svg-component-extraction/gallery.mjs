import {renderRen, renderRenScene, renderFloorCandidate, REN_EXPRESSIONS} from '../../../src/assets/ren/index.mjs';
const put=(id,svg)=>document.getElementById(id).innerHTML=svg;
for(const [i,e] of REN_EXPRESSIONS.entries()) for(const [id,framing] of [['avatars','avatar'],['busts','bust']]){
 const el=document.createElement('div');el.className=framing==='avatar'?'avatar':'bust';el.title=e;el.innerHTML=renderRen({idPrefix:`${id}-${i}`,expression:e,framing}).svg;document.getElementById(id).append(el);
}
const door=prefix=>renderRenScene({idPrefix:prefix,scene:'door'}).svg;
put('door',door('gallery-door'));
const handCrop=svg=>svg.replace('viewBox="0 0 960 540"','viewBox="520 430 150 110"');
put('hand-candidate',handCrop(door('hand-candidate')));
put('door-candidate',door('door-candidate'));
const couch=prefix=>renderRenScene({idPrefix:prefix,scene:'couch-close'}).svg;
put('couch',couch('gallery-couch'));
put('couch-raised',couch('couch-raised'));
const couchOriginal=document.createElement('img');couchOriginal.alt='Previous close couch';couchOriginal.src='../plan-41-ren-friend-character-and-social-life-study/concepts/apartment-scenes/scenes/ren-couch-medium.svg';document.getElementById('couch-before').append(couchOriginal);
const doorOriginal=await fetch('../plan-41-ren-friend-character-and-social-life-study/concepts/door-scene-v2.svg').then(r=>{if(!r.ok)throw Error('original door missing');return r.text()});
for(const [id,svg,alt] of [['hand-original',handCrop(doorOriginal),'Original door hand'],['door-before',doorOriginal,'Original door']]) {
 const img=document.createElement('img');img.alt=alt;img.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));document.getElementById(id).append(img);
}
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
