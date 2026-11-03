import test from 'node:test';
import assert from 'node:assert/strict';
import {quietFallbackEligibility} from './quiet-fallback.mjs';

const quiet = {ok:true,proposal:{schedule:{conflicts:[],rentWorkConflict:false}}};

test('quiet fallback is unavailable when a usable free alternative remains',()=>{
  assert.deepEqual(quietFallbackEligibility({quiet,alternatives:[{available:true,free:true}]}),{ok:false,reason:'free_alternative_available'});
});

test('a purchase-only activity does not remove the free fallback',()=>{
  assert.deepEqual(quietFallbackEligibility({quiet,alternatives:[{available:true,free:false},{available:false,free:true}]}),{ok:true});
});

test('quiet fallback respects scheduler gates and existing commitments',()=>{
  assert.deepEqual(quietFallbackEligibility({quiet:{ok:false,reason:'financial_obligation_due'}}),{ok:false,reason:'financial_obligation_due'});
  assert.deepEqual(quietFallbackEligibility({quiet:{ok:false,reason:'recovery_pending'}}),{ok:false,reason:'recovery_pending'});
  assert.deepEqual(quietFallbackEligibility({quiet:{ok:true,proposal:{schedule:{conflicts:['ren-1']}}}}),{ok:false,reason:'commitment_pending'});
  assert.deepEqual(quietFallbackEligibility({quiet:{ok:true,proposal:{schedule:{rentWorkConflict:true}}}}),{ok:false,reason:'commitment_pending'});
});
