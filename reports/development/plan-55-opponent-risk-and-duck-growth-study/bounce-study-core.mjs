import {injuryStageInput} from './injury-stage2-core.mjs';
export const ARMS=Object.freeze(['crowd','bounce-partial','bounce-full','combo-partial','combo-full']);
export function abilityStudyInput(i,traffic,arm){if(!Number.isInteger(i)||i<0||i>=8||!ARMS.includes(arm))throw RangeError('invalid ability screen input');const base=injuryStageInput(i,traffic,'medium'),[mode,protection='none']=arm.split('-');return {...base,studyAbility:{mode,protection}}}
