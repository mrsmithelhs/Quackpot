import { renderFloorCandidate } from '../../../src/assets/ren/index.mjs';
import { tvUnit } from '../../../src/assets/apartment/props/living.mjs';
import { createHash } from 'node:crypto';
const svg=renderFloorCandidate({idPrefix:'tvprobe',decorative:true}).svg;
const present=tvUnit(false), removed=tvUnit(true);
const count=svg.split(present).length-1;
console.log(JSON.stringify({count,presentLength:present.length,removedLength:removed.length,svgLength:svg.length,svgSha256:createHash('sha256').update(svg).digest('hex'),presentSha256:createHash('sha256').update(present).digest('hex'),removedSha256:createHash('sha256').update(removed).digest('hex')}));
