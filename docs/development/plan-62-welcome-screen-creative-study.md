---
id: plan-62
title: Welcome Screen Creative Study
status: complete
resolution: "Owner accepted revision 04. Frozen creative reference b739fb33 and handoff e7f3f447. Production integration and audio delivery are gated in Plan 64."
depends_on: []
gate: "Owner selects a creative direction and auditioned passage; root reviews the report-local interaction mechanism before prototype construction. Production integration requires a separate packet."
summary: >-
  Explore an animated whole-experience welcome and naming transition using Sonnet
  and Flash consultation, both Codex and Gemini image-generation concepts, existing
  SVG art and local music; deliver a focused interactive study and production handoff.
---
# Plan 62: Welcome Screen Creative Study

## Packet Metadata

- Packet id: `plan-62`
- Packet title: Welcome Screen Creative Study
- Status: (see frontmatter)
- Owner/model: Codex lead; Sonnet and Flash creative consultants; Haiku/Sonnet bounded drawing support
- Date: 2026-11-04
- Packet type: prototype
- Mutation level: generated-local
- Approval gate: selected concept, confirmed prototype mechanism, final owner experience review; no production port
- Depends on: none; live production changes require a fresh source pin, not closure of unrelated plans
- Expected artifacts: `reports/development/plan-62-welcome-screen-creative-study/` containing proposal, concepts/provenance, gallery, flow mapping, selected handoff and progress report

## Goal

### Owner revision checkpoint — 2026-11-05

Latest revision03 selects title A as the baseline and requests embedded-duck title variants, revised room/title placement and desk geometry, slower furniture fades, richer cosmetic duck groups, one-second sound-stop fades and the existing half-piano-duration M5 audition. `reports/orchestration/plan-62-owner-revision-03-background-clearance.md` records the exact current scope, source provenance, provisional timing interpretation and background-work limits; it supersedes conflicting revision02 details. Owner review is deferred while unavailable, not waived.

The owner rejected closure of the initial flat desk/primitive-hook checkpoint and requested further report-local experiments: custom SVG title in the upper space, occasional digital-duck groups, a slowly rotating phone with eased quarter-turn screen counter-rotation, TV/couch background fades, dimmed naming with the desk lamp switched on to illuminate the still companion, full Plan53 M1/M3/M5 reconstructed-track auditions plus 30-second 3/24/3 faded repetitions, and a reusable accessible sound icon. These are authorized study directions, not accepted final assets, soundtrack or production behavior. The concrete scope, provider/resource allowance, source audio paths, mock boundaries and validation stretch are in `reports/orchestration/plan-62-owner-revision-02.md`; it supersedes conflicting initial checkpoint scope. Plan62 remains in progress and production integration remains separately packeted.

Find a distinctive, inviting opening for Quackpot as a whole experience: an animated welcome with game motifs and local MIDI-derived music, followed by a brief duck-naming transition into apartment life. Compare genuinely different compositions before expensive drawing or coding. Deliver enough interaction evidence to choose a production target without replacing production with a mockup.

## Non-goals

No production mounting, boot/storage/save/Receipt changes, new economy or scheduler rules, soundtrack publication/adoption, full credits-system rewrite, new ending, deployment or push. No runtime provider calls. No claim that generated bitmap concepts are production SVG assets.

## Depends on

No blocking packet dependency. Read current interfaces and pin the inspected source; Plan52 and other integrations may still be changing production. This isolated study must not write their files. Existing music is an audition source, not an obligation to adopt a particular track.

## Why this packet exists

The current first-run kitchen mixes duck naming and autosave setup with apartment play. The owner wants an intentional welcome, clean saved-run continuation and a return destination after Receipt review. Prior preview integrations have overwritten better neighboring UI; this study must identify exactly what it proposes to replace and what remains a stand-in.

## Authority and contracts

Required reading:

- `AGENTS.md`, `docs/repo-structure.md`, `docs/README.md`, `docs/decision-log.md`, `docs/development/README.md`
- `docs/founding/design.md`, `docs/five-slot-life-schedule.md`
- `reports/orchestration/welcome-screen-owner-direction.md` (DECISION-090)
- `reports/orchestration/gemini-image-generation-research.md`
- `reports/orchestration/gemini-image-capability-probe/findings.md`
- `docs/workflows/production-integration-review.md`
- `reports/orchestration/temporary-resource-and-preview-addendum.md`
- Relevant Plan24 art-kit, Plan39 music and Plan50 cross-harness evidence: locate actual current paths through the source map and reports, rather than assuming a renderer or provider capability.

Preserve static local-only runtime, local manual usage download, supported save safeguards, immediate exit, reduced motion and the inanimate physical companion. Settings/Credits are factual experience controls. The title introduces the whole experience; do not silently equate it with the fictional gacha launch promotion or reveal the later narrative arc.

## Scope

### In scope

Own only the Plan62 report folder. Read-only imports of existing art/music/helpers are allowed; pin them. Author report-local SVG/CSS/JS and synthetic menu states. Keep generated images, private provider receipts and incidental logs ignored unless root explicitly reviews a sanitized artifact for tracking. Public concept indexes record safe relative paths, prompts, provenance and hashes. Preserve source/creator/license/change records for any reused asset or library.

### Out of scope

No writes to `src/`, shared tools, packages, other reports or canonical decisions. No real browser save mutation, real usage exports in Git, inferred soundtrack redistribution rights, global installs or new provider authentication. Provider failure is not permission to substitute a backend or silently multiply attempts.

## Implementation Requirements

### 1. Map the actual replacement and flow

Inspect current boot/restore routes and `src/ui/kitchen-setup-view.js`; check whether historical naming/autosave controls in `src/ui/desk-view.js` are reachable. Record the exact replaced controls and route, selected additions, preserved context, placeholders and deferred choices in one compact table with source commit/hashes. No second onboarding flow.

Owner-selected behavior:

- Fresh run begins at welcome. Naming appears during transition into apartment life, with an editable default; physical duck does not animate as a living creature.
- Continue goes directly to the supported saved location and bypasses naming/introduction. Never reset a run just by inspecting welcome.
- Settings or Credits pauses opening presentation; dismissal restores it cleanly with focus returned. Start/Continue remain usable without waiting for an animation.
- Welcome offers Settings, Credits and usage download. After Receipt: Start another run, Download usage file and View Receipt. Preserve export semantics; propose empty/no-data and unsupported-save states rather than inventing retention or migration.
- Music fades out/in between opening and apartment; no overlapping full-volume tracks or abrupt restart. Exact durations and passage are audition choices. Playback begins only after an appropriate user gesture and supports mute/static use.
- Preserve autosave preference; propose its new placement to the owner. Do not quietly remove it or change its default.

### 2. Creative rounds before heavy implementation

Round 1: give Sonnet and Flash the same self-contained project brief, accepted visual references, whole-experience purpose and constraints. Ask each for a small set of distinct compositions, transition/naming ideas, motion/static equivalents, soundtrack fit and likely failure modes. Consultants advise; the Codex lead integrates, checks project implications and recommends roughly three coherent directions. Reuse consultant sessions for targeted follow-up when their context helps. Keep provider identity and requested/observed capabilities distinct; do not repeat failed audio-comprehension trials or treat model taste as owner acceptance.

Round 2: visualize the strongest directions using a mix of Codex image generation and Gemini through `agy`, before detailed SVG authoring. Start with at most four top-level image requests total, normally two per route, including a reference-guided variant where useful. This is not an exact backend-attempt or billing cap: the Gemini tool may retry internally. Record actual calls/artifacts and uncertainty; do not spend additional image quota without owner clearance. Use the applicable image-generation skill for Codex calls. Give explicit destination paths, but verify actual image files, format, dimensions and hashes rather than trusting a successful CLI exit or a promised copy. Copy verified artifacts into the ignored report-local concept folder when necessary. Supply existing art as actual reference inputs where supported; record text-only limitations. Never assume reference editing preserves layout exactly.

Show actual concepts to the owner with strengths, tradeoffs and a recommendation. Concept typography/buttons are illustrative; layout and palette selections are separate from final text, interaction and export behavior. Collect the owner's preferred direction and unresolved experience choices in the implementer chat. Ask the owner directly for meaningful choices; ordinary iteration needs no relay through root.

Then obtain one purposeful Sonnet/Flash critique round on the selected direction, focused on unresolved composition/transition issues. Haiku may draw small bounded SVG motifs; Sonnet handles larger drawing or writing batches. Reuse a drawing chat for revisions. Codex visually inspects rendered assets, not just markup. Keep authoring disjoint and integrate with one writer. No fixed subagent count; be mindful that the owner is a teacher using limited subscriptions and batch useful questions instead of repetitive tiny calls.

### 3. Mechanism gate and focused interactive study

Before building the interactive prototype, send root a compact mechanism proposal: state/transition table, source/art/music pins, placeholder boundaries, owned files, lifecycle/cleanup, validation and resource needs. Wait for root approval of that mechanism. Creative ideation and owner selection may proceed before this gate.

After clearance, build the selected composition as a report-local HTML gallery with representative fresh/saved/finished/no-data states and a naming transition. Treat saves and Receipt/export content as labelled synthetic examples. Do not import a live boot module or touch owner browser storage. Include a comparison/reference view so the owner can compare against the original concepts without replaying the full game.

Use existing local audio rendering/playback where practical. Audition a few short passages from available MIDI-derived work, disclose provenance and placeholder apartment audio, and let the owner select by listening. No new long composition project, ML transcription or automatic music-analysis calls. Test pause/resume, fade cancellation, repeated navigation and single audio ownership. No controls hidden behind a cinematic wait. No real soundtrack or credits completeness claim from a placeholder.

Reduced motion gets a composed still, direct naming and equivalent access; opening animation must not be required to understand how to start. Prototype mobile/desktop focus, readable text and visible controls before polishing effects.

### 4. Evidence and production handoff

Deliver selected additions / preserved context / placeholders and omissions / deferred choices, exact proposed production seams, required assets, music/rights status, interface contracts and meaningful checks. Specify what is intentionally absent from the gallery. In particular, a mock saved-run, Receipt or Settings view is not authority to replace its production counterpart. Production integration requires a separate packet and current-source review.

## Validation Checklist

- [ ] Distinct concepts and both image-generation routes are evidenced, or unavailable routes and their limits are reported without silent substitution.
- [ ] Owner concept, naming/autosave placement and music choices are recorded with provenance; proposals are not labelled decisions.
- [ ] Root confirmed mechanism before interactive construction.
- [ ] Actual rendered images/SVGs and prototype inspected at desktop and narrow viewports, with source-bound captures; no screenshot-only claim for behavior.
- [ ] Fresh/Continue/post-Receipt/no-data states, focus return, Settings/Credits interruptions, static/reduced motion, repeated starts and audio handoff checked to the extent implemented.
- [ ] No owner storage changes, runtime network dependency, duplicate onboarding or production source writes.
- [ ] Use bounded execution and root-assigned resource stretch; no unbounded watchers, orphan servers or invented cleanup certainty.
- [ ] Declare advisor-consultation posture under repository rules. One read-only Terra-medium pre-delivery reviewer is authorized for the interactive study; record findings/dispositions and observed settings. Model critique does not replace owner taste or root visual review.
- [ ] Root visually reviews actual selected renders and material lifecycle evidence before owner-ready delivery.
- [ ] Progress report states verified behavior and limits; scoped files committed, report last, no push.

## Stop Conditions

Stop for a load-bearing conflict with accepted flow, missing rights/assets, provider access or output uncertainty that changes the method, new quota spend beyond the initial image batch, production/shared-source writes or a failed validation requiring a changed mechanism. Ordinary owned edits and bounded corrected reruns within an approved stretch do not require repeated orchestration permission.

The implementer may not set packet completion status, edit root/owner disposition records, or declare the feature complete/ready to ship/done. Report against the actual objective, not test counts; owner and root retain acceptance. Do not turn a creative preference into a new save, narrative or scheduler rule.

## Progress Report

`reports/development/plan-62-welcome-screen-creative-study/progress.md`

Include current phase, source pins, provider tasks and artifact provenance, owner selections, rejected alternatives, visual/lifecycle observations, commands and resource receipts, unresolved production work and readiness for root review. Keep raw private harness traces, absolute machine paths and personal data out of committed reports.
