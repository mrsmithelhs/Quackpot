import test from 'node:test';
import assert from 'node:assert/strict';
import {wideAlternative,aheadAlternative,draftAlternative,aerodynamicPose} from '../gallery/alternatives-effects.mjs';
const geometry={width:400,height:260,leaderX:100,followerX:220,y:130,duckWidth:40};
test('each ability provides meaningfully different A and B inert graphics',()=>{
 for(const f of [wideAlternative,aheadAlternative]){const a=f(.5,'a'),b=f(.5,'b');assert.notEqual(a,b);for(const svg of [a,b])assert.doesNotMatch(svg,/<script|on\w+\s*=|href\s*=|url\(|https?:/i);}
 for(const layer of ['back','front']){const a=draftAlternative(.5,'a',layer,geometry),b=draftAlternative(.5,'b',layer,geometry);assert.notEqual(a,b);assert.doesNotMatch(a+b,/<script|on\w+\s*=|href\s*=|url\(|https?:|NaN/i);}
});
test('draft links follow the explicit leader, mirror and end without arrowheads',()=>{
 const left=draftAlternative(.5,'b','front',geometry),right=draftAlternative(.5,'b','front',{...geometry,leaderX:300,followerX:180});assert.notEqual(left,right);assert.match(left,/opacity="1"/);assert.match(draftAlternative(0,'b','front',geometry),/opacity="0"/);assert.match(draftAlternative(1,'b','back',geometry),/opacity="0"/);assert.doesNotMatch(left,/<polygon|marker-end/);
});
test('aerodynamic pose engages and returns to neutral at both boundaries',()=>{
 assert.deepEqual(aerodynamicPose(0),{dx:0,dy:0,angle:0,bridge:0});assert.deepEqual(aerodynamicPose(1),{dx:0,dy:0,angle:0,bridge:0});const p=aerodynamicPose(.5);assert.ok(p.dx<0&&p.dy>0&&p.bridge>0);assert.equal(p.angle,-18);
});

test('flight ground shadow grows and becomes more transparent during its active interval',()=>{
 const early=aheadAlternative(.25,'a'),late=aheadAlternative(.75,'a');const attr=(s,n)=>Number(s.match(new RegExp(n+'="([0-9.]+)"'))[1]);assert.ok(attr(late,'rx')>attr(early,'rx'));assert.ok(attr(late,'opacity')<attr(early,'opacity'));
});
