// Report-local scene witness for the dev server: production HUD/life view, synthetic engine, study SVG substituted in-page. ?v=current|codex|same|proposed
import {GameEngine} from '../../../../src/core/game-engine.mjs';
import {renderHud} from '../../../../src/ui/hud.js';
import {renderLifeView} from '../../../../src/ui/life/life-view.js';
import {candidateKeysTray} from '../keys-art-review/candidate.mjs';
import {sonnetKeys} from './keys-study.mjs';
const e=new GameEngine('keys-art-report',{lifePolicy:true,tutorialShift:true});e.start();e.setupCompanion();e.applyLifeIntent({type:'meal',choice:'buy'});e.state.step='life_breakfast';
renderHud(document.querySelector('#hud-container'),e,'../../../../src/assets/duck-placeholder.svg');
renderLifeView(document.querySelector('#main-content'),e,{place:'desk-phone'},{});
const v=new URLSearchParams(location.search).get('v')||'current',b=document.querySelector('[data-obj="work-keys"]');
if(v==='codex')b.querySelector('svg').outerHTML=candidateKeysTray();
if(v==='same'||v==='proposed')b.querySelector('svg').outerHTML=sonnetKeys();
if(v==='proposed'){const [l,t,w]=(new URLSearchParams(location.search).get('box')||'34,69,12.5').split(',');b.style.left=l+'%';b.style.top=t+'%';b.style.width=w+'%';b.style.height='auto';}
window.ready=true;
