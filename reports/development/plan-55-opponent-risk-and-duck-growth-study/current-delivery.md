# Plan 55 - report delivery

Status: report delivery for QP Orch review, not packet closure, a production port or owner acceptance of an integrated race. This consolidates selected intent, evidence and known gaps as of 2026-11-04. The report-local study and simulations are not runtime dependencies. DECISION-084/085 and `growth-injury-slice-design.md` supersede earlier open-choice notes; historical reports and failed receipts remain evidence.

## Selected working experience

- Preserve current Plan 23 race/individual finishes, existing rest and the no-injury baseline as controls. Support multiple distinct collisions, anticipatory risk-conditioned defensive steering, automatically activated Bounce usable while weaving or recovering, and genuine occupied-landing contacts. The Bounce duck has full injury protection during its active window; another duck retains an independent chance of injury. Existing injuries and collision consequences are not undone.
- Each completed entered-duck race earns 2 progress, plus 1 for top-three; first point at 4. A point may be banked and permanently assigned to Bounce or crowd acceleration without a life slot. Preserve all earned progress; later redemption, rarity starting abilities and additional thresholds remain open. A top-three result does not accelerate this particular first point at threshold 4.
- Starting injury values are a 10% race-rating penalty during the injury race, two actual in-game day changes to recover and a disclosed 25% chance per completed race entered already injured of adding one day. Injured ducks remain raceable, with no paid recovery requirement. On an unresolved attempt, retain validated injury consistently even when playback is skipped/reduced-motion and explain it accessibly; guard-discarded events do not apply, and no finish reward, progress or completed-race extension is granted. Exact atomic commit/fallback is an implementation gate.
- Free-entry short events and the separate one-day Gem accelerator are forward proposals, not first-slice mechanics. Their prices, benefit amounts, later thresholds, overlaps and schedules are not selected. `limited-time-events-proposal.md` and `gem-one-day-progression-proposal.md` preserve owner intent and factual Receipt boundaries.

## What was actually learned

The initial fixed growth/forecast comparison found the candidate point reachable for a repeatedly raced duck, but not for rotated ducks under that earlier three-race threshold; the current four-progress rule was selected afterward and is not validated by that older run. Burst/Guard placement comparisons encountered a last-place floor; forecast changes did not reverse the modeled preferred pace. These outcomes do not prove no alternative can work (`preliminary-comparison.md`).

The final matched-stat exposure screen ran 24 new races on eight paired seeds with Bounce partial/full and crowd-only, plus an earlier matched no-ability control reused on one-seed deep parity and source-path inspection. Each Bounce arm had six activations in three races; three real P protected contacts were paired across arms and had identical non-injury outcomes. That is three paired contacts, not six independent observations; it neither shows full protection is overpowered nor proves equal power. `bounce-reconciled-screen-results.md` provides each result and limitations. This was not a sample of rarities, longer progression, student behavior, production save/replay or a watched-owner acceptance test.

An initial screen stopped at occupied landing. After an owner-selected real-contact policy, 17 bounded correctness calls checked selected landing cases and rollback; a later matched attempt stopped at the same contact being recognized again on the next boundary. Eight further correctness calls checked narrow same-boundary reconciliation, including the failed seed's original event, impulse and independent injury rolls exactly once. The reconciled 24-call screen finished. Multiple-overlap/unrearmed/corridor cases can still guard; these checks do not constitute general physical or production nonfinish validation. Preserve failed data and diagnostic receipts.

## Study constants are candidates, not owner selections

| Candidate dimension | Exact report-local comparison values |
|---|---|
| Collision injury susceptibility | Medium diagnostic: 5% steady / 10% sprint per eligible distinct real contact until injured; low 2.5%/5%, high 10%/20% were alternate diagnostic bands. Owner has not selected final occurrence odds. |
| Defensive advice | Sample every 5 ticks = 0.25 s at 0.05 s/tick; 1 s closest-approach horizon, 1.4-unit predicted separation, <=6 spatial and <=8 course distance; follow probability .75 steady/.35 sprint; selected target lasts 20 ticks. Active Bounce multiplies follow probability by .8 in this candidate. |
| Bounce trigger and phases | 0.25 s sampling; <=0.5 s predicted closest approach, <1.2-unit separation; one keyed attempt per latched opportunity at .75 activation; rearm after two absent checks. Rising 0.10 s, airborne 0.50 s, landing 0.10 s, then 2 s cooldown. Full injury protection is selected, not these timing or probability constants. |
| Crowd acceleration | At least two grounded neighbors within 4 spatial / 8 course units; .75 keyed activation per latched opportunity; +1.5 course units/s² acceleration for 0.50 s toward the inherited target, then 2 s cooldown. It is not a guaranteed speed gain or a global speed-12 cap. |
| Contact rearm | Prior pair must show >=1.2-unit separation and at least 10 ticks (0.5 s); landing boundary reconciles a matching already-recorded fraction-1 contact without duplicate impulse or injury roll. |

These exact values are tied to the pinned report experiment and must be deliberately evaluated/approved for a production packet, not silently transplanted or represented as the owner's decisions. The experimental matrix assigned the studied ability to the player duck only; it does not validate broad multi-ability opponent combinations.

## Required next gate

`next-production-slice-brief.md` identifies the smallest proposed implementation boundary and source/evidence pins. QP Orch should reconcile the remaining occurrence odds, risk/activation constants and actual animated experience, resolve nonfinish/partial-outcome handling and source/versioned save ownership, then assign a new bounded packet after Plan52's stable shared-state checkpoint. The owner must see the integrated race/ability and growth flow. These are technical and experience gates, not a requirement to finalize every rarity, future ability, Gem product or event before a first slice. No new experiment, source edit, push or deployment is authorized by this delivery.
