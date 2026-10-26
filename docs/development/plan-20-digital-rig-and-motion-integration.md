---
id: plan-20
title: Digital rig and accepted motion integration
status: in-progress
depends_on: [plan-04, plan-09, plan-19]
gate: "QP Orch may approve the bounded source/lifecycle proposal and supervise implementation; owner reviews the rendered production result. Race-event wiring awaits accepted Plan 13 semantics."
summary: >-
  Integrate the accepted Mode C digital rig and factor-four motion controller
  through focused source modules; preserve the physical companion and defer
  race-event wiring until its mechanics are accepted.
---
# Plan 20: Digital rig and accepted motion integration

## Packet Metadata

- Packet id: `plan-20`
- Status: (see frontmatter)
- Date: 2026-10-26
- Owner/model: one implementation writer; orchestrator review and owner gates
- Type: bounded production integration
- Mutation: focused production view/motion modules and relevant checks after outline approval
- Expected artifacts: `reports/development/plan-20-digital-rig-and-motion-integration/proposal.md`, implementation evidence and `progress.md`

## Goal and why now

**Owner-feedback repair delivered, 2026-10-26:** `3899610`/`4017e0e` preserves mounted revealed cards and animation phase across further reveals, flips only newly revealed backs, and suppresses old flips on rebuild/reload. Root reproduced8focusedtests and inspected source; implementer direct witness plus isolated8-journey smoke accepted in `review-03.md`. Return for owner acceptance, no variety/race scope expansion. Plan23 remains proposal-only pending production handoff.

**Technical delivery, 2026-10-26:** `94333a6` plus `011e758`, final report `655aa8e`, accepted for owner rendered review in report-folder `review-02.md`. Real revealed cards now use Mode C/factor-four keyed loops with cleanup/pause, and source fidelity defects are repaired. Root reproduced six focused tests; implementer isolated smoke and bounded three-card pre/post reload comparison recorded. Actual system reduced-motion=true remains unverified beyond fake-media tests. No race/Dex/rest/audio expansion or closure.

Plans 04 and 09 supply an accepted Mode C rig and motion set, while production still uses a placeholder. Port the selected construction into maintainable reusable source, with correct per-instance animation lifecycle, rather than importing the report gallery. Owner approved Plan09's factor-four paper-layer result.

**Owner assignment and delegated gate, 2026-10-26:** Owner starts Plan20 and authorizes QP Orch to approve a bounded proposal and supervise implementation through rendered owner review. A Codex chat will be connected by the owner; no recipient has been assigned yet. Current playable mechanism slice provides the production review surface. Significant new mechanics/asset choices remain owner-gated. Preserve concurrent Plan13 report-folder work and coordinate browser turns.

## Required reading and preflight

Read AGENTS.md, docs/repo-structure.md, docs/decision-log.md, canonical design Assets/Immersion/Receipt and two-duck boundary, Plan09 proposal/refinement/gallery and reviews02–05, Plan19 accepted lifecycle, current src/main.js and relevant UI views, rig composer and SVG hierarchy. Run `node scripts/dev/plan-status.js check plan-20` after assignment; stop if blocked. Read current Plan13 event status before proposing race hooks.

## First return: source and trigger proposal

**Owner layout/first-duplicate repair, 2026-10-26:** Reopen after screenshot review: revealed art must not increase grid/card dimensions or overflow the container. Investigate intrinsic min-content/track sizing; fit the intended larger card size from the start, widen desktop container if appropriate and preserve responsive narrow layout. Owner also requests first-revealed-duplicate attached explanatory callout: duplicates are automatically returned/converted to rarity-based Down, actual award stated, dismissible x, approximately75% background alpha/full on hover or focus, opaque readable text and touch/keyboard support. Return bounded source/displayed-cue/once-per-run/reload proposal before implementation; no currency/reveal/engine-rule changes. Plan23 is proposal-only until this repair's production handoff. These teaching cues do not authorize a modal trap, hidden-result reveal or manipulation-analysis panel.

**Owner reveal-lifecycle feedback, 2026-10-26:** Reopen for focused repair: revealing one card must not replay flips on previously revealed cards or restart their motion. Each loop begins on its own actual reveal and preserves phase through later card reveals. Investigate current full-render/remount path and return minimal keyed-update/lifecycle fix to QP Orch before structural changes; preserve pause/static/modal/cleanup behavior, no extra reviewer. Current composition is intentionally classic-yellow/no-hat/no-accessory for all identities; visual mapping/catalog variety needs a separate proposal, not random cosmetic rerolls during this repair.

**Proposal approved by QP Orch, 2026-10-26:** Owner-authorized chat QP Impl20 (`01a179ee-8bcf-7d40-8494-d1457e405508`, local) returned report-folder `proposal.md`. Root approves revealed-card rig/controller integration with ownership of new `src/ui/duck-rig-view.js`, `duck-motion-controller.js`, optional `duck-motion.css`, `src/ui/gacha-view.js`, focused `src/main.js` wiring and corresponding focused tests/reports. Shared rig/engine/storage/race/global stylesheet/package and settings-modal remain read-only without bounded expansion. New Duck-Dex and rest mechanics route to draft Plans21/22; no implicit Plan20 scope expansion. Browser turns remain coordinated.

Inspect actual digital duck placements and physical companion rendering. Map exactly which placeholder uses are digital; never replace/animate the physical companion globally because a shared asset URL is reused. Propose focused rig-view and animation-controller modules, scoped CSS, per-instance unique SVG IDs/filter references and cleanup ownership. Identify exact render/unmount/navigation/Settings/Uninstall/save/reload boundaries. Keep main/global styles small; no broad engine refactor.

**Selected first trigger:** When a gacha card flips to its revealed duck, choose paddle or graceful bob per card and loop it while that revealed card remains visibly presented, unless reduced motion is active. Use a separate cosmetic keyed choice (e.g. immutable pull/card identity) so re-render/reload does not reroll the visible choice and no mechanical PRNG stream is consumed. Different card instances may use different motions. No animation or rarity teaser before reveal. Pause/suspend when hidden/offscreen or context/modal makes the view inactive, resume only live instances, cancel on unmount/Uninstall and preserve static card information. This is an owner-selected exception to limiting motion to one inspected duck; verify the real ten-card grid and offer an accessible pause-animation control for continuing motion without changing draw outcomes/costs or requiring OS settings. Collection shelves stay static by default; building a collection screen is outside this packet.

Return the exact source/lifecycle/trigger mapping and static equivalents for QP Orch approval before coding. Additional motion placements may be recommended but require selection before implementation. Do not invent rarity cues, near-miss theater or whole-shelf motion.

## Implementation boundary after outline gate

Own the production-writing lane only after assignment and explicit file ownership. Plan13 owns its isolated reports and may continue in parallel. Port the accepted factor-four local paper transforms, matched seams, existing parent motion and durations into reusable modules; no production imports from reports or cloned game rules. Preserve hats/accessories, shadows, view-scale readability and complete transform resets. Support multiple instances, replay cancellation and stale-callback protection. Honor system reduced-motion changes as well as static alternatives; no forced tweening on manual activation when reduced motion applies.

Engine outcomes/log/RNG and storage remain authoritative. Presentation has no mechanical randomness, extra rewards, draw costs or save-schema changes. Record displayed cues honestly if they become Receipt evidence; never label a scheduled/skipped effect as shown. Leave costs/odds/terms and immediate exit available.

**Race dependency boundary:** Build reusable motion capability without adopting Plan13 prototype mechanics. No production collision trigger, recovery duration, race choreography or outcome model is authorized here. After Plan13 event semantics are accepted, a separate bounded follow-on or explicit packet amendment maps event IDs/participants/timing to paddle/impact/recovery and reduced-motion race views. Until then, runtime race-event wiring is deferred; do not fire impact animations arbitrarily to demonstrate integration. Production-representative local fixtures may exercise the controller with clearly labeled synthetic triggers outside student flow.

**Race selection resolved, 2026-10-26:** Owner closed Plan13 with combined rank-weighted weave/strong-contact and2s highlight selected. Draft Plan23 now owns the proposed production race/motion port; that selection does not expand delivered Plan20's source scope. Owner card-motion acceptance remains pending.

**Owner race-motion direction retained for follow-on:** Normally paddle; the current leading two race slots may use graceful bob. Logged duck-to-duck and wall impacts use impact/recovery with priority over ordinary locomotion, then return to the appropriate rank-based loop. Define rank sampling/switch hysteresis and visual-versus-mechanical recovery mapping against accepted Plan13 events before wiring; don't repeatedly restart one-shots on each collision tick or imply that cosmetic graceful bob grants a speed advantage. This direction is recorded, not permission to bypass the dependency above.

**Owner future production presentation note, 2026-10-26:** Plan13's detailed narrative/diagnostic tables are useful investigation tools, not selected player UI. Race integration should offer concise plain-language commentary and accessible event-linked playback without exposing the technical table by default. Keep actual participant/cause/outcome truth; do not turn this into a blocker or scope expansion for current rig/card work. Crowd-reaction/contact audio search and synthesis fallback are future separate audio work with local licenses/provenance, not implied by motion integration.

No audio selection/integration, new anatomy/variant stats, environment art, reveal anticipation/near-miss mechanics, physical-companion animation, economy, export schema, framework migration, package dependency expansion or deployment. Ask before shared rig structural changes, rather than compensating with silent art edits.

## Verification and delivery

Check build, relevant repository tests and smoke paths appropriate to changed UI. Add meaningful lifecycle/multi-instance tests for cancellation, neutral cleanup, ID isolation and reduced-motion switching; do not merely mirror constants. Browser-inspect actual production integration on desktop/narrow views, selected attachments, multiple visible ducks, static/reduced mode, navigation/Uninstall during animation and save/reload, with exact viewport/evidence limits. Use coordinated QP Orch browser turns. Confirm game requests remain local and production has no report dependency. Present rendered result to owner; commit scoped implementation and final report with required consultation declaration. No implementer packet-status changes, push or deployment.
