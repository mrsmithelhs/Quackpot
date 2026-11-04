export function landingGeometry(a,b,{diameter=1,epsilon=.001}={}){
 if(!a||!b||typeof a.id!=='string'||typeof b.id!=='string'||a.id===b.id||![a.x,a.y,b.x,b.y,diameter,epsilon].every(Number.isFinite)||diameter<=0||epsilon<=0)throw RangeError('invalid landing geometry');
 const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy);if(distance>=diameter)return null;
 const nx=distance>1e-9?dx/distance:(a.id.localeCompare(b.id)<0?1:-1),ny=distance>1e-9?dy/distance:0;
 const displacement=(diameter-distance+epsilon)/2;
 return {normal:{x:nx,y:ny},distance,displacement,coincident:distance<=1e-9,deltaA:{x:-nx*displacement,y:-ny*displacement},deltaB:{x:nx*displacement,y:ny*displacement}};
}
export function landingImpulse(relativeNormal,restitution=.25){if(!Number.isFinite(relativeNormal)||!Number.isFinite(restitution)||restitution<0)throw RangeError('invalid contact velocity');return relativeNormal<0?-(1+restitution)*relativeNormal/2:0}
