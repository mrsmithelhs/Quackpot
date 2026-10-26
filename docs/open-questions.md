# Open Questions

This file lists questions that are **genuinely unresolved** - pending investigation, prototype, or owner decision. Resolved questions move to `docs/decision-log.md`.

*(For the canonical list of founding design and simulation open questions — including final title, day count, storage engine, replay tracking, pity thresholds, near-miss candidates, fatigue-obscuring choices, odds-button detail, export fields, local teacher analyzer implementation, music provenance, and PNG delivery — see [`docs/founding/design.md` §Open questions](founding/design.md#open-questions). The physical metagame duck is outside the digital collection; see DECISION-003.)*

## General / architecture

1. Which visual directions should inform the production SVG (Plan 08), which digital gacha motions work after rig approval (Plan 09), and which coherent 2D views/lighting/apartment compositions suit physical-duck conversations at wide and close zoom (Plan 10)? No 3D source pipeline is selected.
2. How should the headless model's existing physical `own-duck` race slot be reconciled before the playable slice? See `reports/orchestration/duck-representation-boundary.md`; it is not an adopted game rule.

## Plan 12 follow-on rules (2026-10-25)

- Plan 17's bounded trial rules/evidence are accepted (DECISION-013); do not reopen 3/6 prices, +5% one-race/non-stacking effect or normal duplicate/pity/reset rules. Remaining questions concern production consume/cancel/reload/log/Receipt behavior, larger rosters, future banner policy and whole-run economy effects beyond the tested cells.
- Plan 15: Which commercial urgency cues, if any, should ship, with what game-clock/expiry rules and accessible dismissal? No countdown rule is selected.
- Plan 14: How should the selected fictional-phone quarter-turn/full-stage transition adapt to narrow screens and reduced motion? No physical-device rotation or fixed aspect ratio is required.
- Final fictional app title remains unselected. The interview's candidate list is not approval; exclude the existing real title Duck Dynasty under the fiction constraint.

## Audio-source policy (2026-10-25)

The source-policy question is resolved by DECISION-010: CC/CC0 local audio and factual Credits are permitted. Which specific recordings, roles, edits, levels and credits should be selected? Draft Plan 18 owns the bounded audition/provenance recommendation; no recording or production integration is selected yet. Model-generated music provenance remains open separately.

## Process / workflow

## Collection, race selection and duck rest (owner questions, 2026-10-26)

- Canonical design already promises a standing Duck-Dex shelf, owned identities and missing silhouettes. Current mechanism slice does not deliver a dedicated always-available collection inspection area. Plan20 integrates art/motion only; a bounded collection/inspection and entry-selection follow-on is needed. Owner wants voluntary collection access without requiring a story beat. Propose focused identity cards/details and return navigation, preserving fictional content and local-only state; no new set effects or duplicate mechanics by implication.
- Current race UI has an owned-duck dropdown defaulting to fastest plus stance controls. Owner asks for a more visual race preparation screen with recommended candidates foregrounded. Recommendation meaning and reconciliation with canonical one pre-race choice need a proposal; do not add a second independent strategy menu or expose review-only math panels by accident.
- Resolved direction: owner selects soft two-race rest penalties (zero intervening races50%, one25%, two or more none), with tired ducks still selectable. Draft Plan22 owns remaining commit/cancel/reload, trial/stance, duplicate identity and balance questions. Current production lastRacedId bookkeeping does not implement this rule; character sleep/fatigue remains separate. No paid recovery or forced pull.

1. *(Add questions about the handoff workflow, release gates, or agent assignment.)*
