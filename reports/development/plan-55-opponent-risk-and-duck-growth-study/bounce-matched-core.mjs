import {injuryStageInput} from './injury-stage2-core.mjs';
export const MATCH_ARMS=Object.freeze(['none','bounce-partial','bounce-full','crowd']);
export function matchedInput(i,arm){if(!Number.isInteger(i)||i<0||i>=8||!MATCH_ARMS.includes(arm))throw RangeError('invalid matched input');const x={...injuryStageInput(i,'clearance','medium'),playerBaseSpeed:8,fieldBaseSpeed:8,restFactor:1};if(arm!=='none'){const [mode,protection='none']=arm.split('-');x.studyAbility={mode,protection}}return x}
