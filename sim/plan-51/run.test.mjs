import test from 'node:test';
import assert from 'node:assert/strict';
import {studyManifest,balancedTrace,earlyBedComparison,recoveryComparison,playRoute,pairedCandidates,seededCohort,noCashNoJobTrace,overtimeComparison,oldPolicyDayControl,rentOvertimeTrace} from './run.mjs';
test('study identifies shared authority and fixed routes',()=>{const m=studyManifest(); assert.equal(m.scheduler,'plan51-experimental'); assert.equal(m.seeds.length,5); assert.ok(m.routes.includes('rent-zero-hp'));});
test('balanced schedule-only trace uses shared transitions for seven days',()=>{const r=balancedTrace(); assert.deepEqual(r.final,{day:8,slot:'morning',cash:416,health:100}); assert.equal(r.ledger.length,49); assert.ok(r.assumptions[1].includes('no rent'));});

test('early-bed candidates use actual scheduler and preserve opportunity cost',()=>{const v=earlyBedComparison(); assert.deepEqual(v.map(x=>x.endingHP),[95,100]); assert.ok(v.every(x=>x.nextDay===3 && x.nextSlot==='morning'));});

test('recovery slot candidates expose distinct work opportunity',()=>{const v=recoveryComparison(); assert.deepEqual(v.map(x=>x.slot),['midday','early-evening']); assert.deepEqual(v.map(x=>x.scheduledShiftStillAvailable),[true,false]);});

test('named symbolic routes expose work and meal displacement and extension',()=>{const w=playRoute('missed-work'), d=playRoute('dinner-play'), e=playRoute('session-extension'); assert.equal(w.final.obligations['2:shift'],'missed'); assert.equal(d.final.obligations['2:dinner'],'missed'); assert.equal(d.final.health,95); assert.equal(e.final.slot,'late-evening'); assert.equal(e.final.fatigue.pending,true);});

test('paired candidate traces preserve intentions and show infeasibility',()=>{const p=pairedCandidates(); assert.deepEqual(p.earlyBed.map(x=>x.final.health),[85,90]); assert.ok(p.earlyBed.every(x=>x.final.rent==='overdue')); assert.equal(p.recovery[0].stopped,null); assert.deepEqual(p.recoveryFallback.map(x=>x.final.cash),[182,122]); assert.deepEqual(p.recoveryFallback.map(x=>x.final.health),[20,20]); assert.equal(p.recovery[1].stopped.reason,'work_unavailable'); assert.equal(p.recovery[1].stopped.slot,'early-evening');});

test('seeded hypothetical action cohort is reproducible and varies by seed',()=>{const a=seededCohort(5),b=seededCohort(5); assert.deepEqual(a,b); assert.equal(a.length,5); assert.ok(new Set(a.map(x=>JSON.stringify(x.ledger.map(y=>y.kind)))).size>1);});

test('no-cash no-job route progresses without gacha or hidden subsidy',()=>{const r=noCashNoJobTrace(); assert.equal(r.blocked,'rent_escalation_unresolved'); assert.deepEqual(r.final,{day:4,slot:'morning',cash:0,health:80,rent:'pending'}); const hypothetical=noCashNoJobTrace({continueHypothetical:true}); assert.deepEqual(hypothetical.final,{day:18,slot:'morning',cash:0,health:15,rent:'overdue'}); assert.equal(r.ledger.some(x=>x.intent==='play'),false);});

test('candidate overtime comparison shares context and reveals cash and HP tradeoff',()=>{const c=overtimeComparison(); assert.deepEqual(c.map(x=>x.final.cash),[80,140]); assert.deepEqual(c.map(x=>x.final.health),[80,65]); assert.ok(c.every(x=>x.final.plans.ren.status==='notice'));});

test('old-policy control calls the pinned pure authority, not a rewritten schedule',()=>{const r=oldPolicyDayControl(); assert.equal(r.final.day,2); assert.equal(r.final.cash,128); assert.equal(r.ledger[0].phase,'morning'); assert.equal(r.ledger.find(x=>x.intent==='depart_work').phase,'afternoon');});

test('rent overtime trace pays consciously before reserved work and pays wages on completion',()=>{const r=rentOvertimeTrace();assert.equal(r.stopped,null);assert.deepEqual([r.final.cash,r.final.health,r.final.rent,r.final.slot],[64,80,'paid','late-evening']);});
