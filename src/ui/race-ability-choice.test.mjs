import test from 'node:test';
import assert from 'node:assert/strict';
import {raceAbilityChoiceMarkup} from './race-ability-choice.mjs';

test('both assignment surfaces explain the selected abilities without invented guarantees',()=>{
  for(const surface of ['race','dex']){
    const html=raceAbilityChoiceMarkup(surface),attribute=surface==='race'?'data-assign-ability':'data-dex-assign';
    assert.match(html,new RegExp(`${attribute}="bounce" aria-describedby="ability-${surface}-bounce"`));
    assert.match(html,new RegExp(`${attribute}="crowd" aria-describedby="ability-${surface}-crowd"`));
    assert.match(html,/contact threat is predicted, this duck may leap/);
    assert.match(html,/protected from collision injury during the leap and landing/);
    assert.match(html,/does not guarantee avoiding contact or heal an injury/);
    assert.match(html,/nearby ducks are on the ground, this duck may gain acceleration/);
    assert.match(html,/activates independently and does not require the duck to be catching up/);
    assert.doesNotMatch(html,/\d+\s*%|guaranteed to avoid|heals an injury/i);
  }
  assert.throws(()=>raceAbilityChoiceMarkup('other'),/unknown/);
});
