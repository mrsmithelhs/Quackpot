---
id: plan-63
title: Messages production integration
status: in-progress
depends_on: [plan-61]
gate: "Root approves current source ownership and delivery/read/save/replay contract before production writes; owner reviews an early real integrated route and final experience."
summary: >-
  Integrate the selected Messages header, portrait inbox/conversations and separate
  decisions with authoritative communications, saved read state and actual display
  evidence; atomically preserve message access while reserving the desk phone for Quackpot.
---
# Plan 63: Messages production integration

## Packet Metadata

- Packet id: `plan-63`
- Packet title: Messages production integration
- Status: (see frontmatter)
- Owner/model: Codex integration lead; Sonnet for batched writing/experience support, Haiku for small original SVG needs
- Date: 2026-11-05
- Packet type: feature
- Mutation level: source-data
- Approval gate: root contract/source clearance, early owner production checkpoint, root technical/visual review and final owner acceptance
- Depends on: Plan61 closed study; stable technical seams from Plan52/59, not their whole-packet closure
- Expected artifacts: focused production modules/tests, bounded integration evidence, reconciled docs and `reports/development/plan-63-messages-production-integration/progress.md`

## Goal and why this packet exists

Mount a real Messages experience using Plan61's selected visual grammar, without copying its mock finance, storage or lifecycle. Current work, Ren and loan communications compete with the desk phone's expected app entry. Give them durable header access, preserve their existing actions and evidence, and switch the available desk phone to Quackpot only after replacement routes exist. Historical messages establish a life outside the app. This first slice establishes the reliable foundation; optional run-varying chatter is a follow-on.

## Non-goals and dependencies

No new financial/social rules, loan offer/deadline, calendar, Call Mom schedule, hidden rewards, unrelated gacha redesign, race mechanics, welcome onboarding or ending sequence. No optional randomized chatter engine, new Quackpot campaign cadence, runtime generation/network/accounts, audio, installations, push or deployment. No promises of old-development-save migration. Preserve supported policy dispatch and explicitly handle unsupported saves under the reviewed contract.

Plan61 is the sole completed packet dependency. Before production writes, root assigns exact shared source turns against current Plan52 repairs and Plan59 integration. A different branch/port or a historical source pin is not proof of safe overlapping ownership. Plan62 is report-local welcome work, not authority to change its future header/onboarding contracts here.

## Authority and contracts

Read `AGENTS.md`, the implementer starting prompt, `docs/repo-structure.md`, `docs/README.md`, `docs/decision-log.md`, `docs/open-questions.md`, `docs/founding/design.md`, `docs/five-slot-life-schedule.md`, `docs/development/README.md` and `docs/workflows/production-integration-review.md`.

Read Plan61's `selection-and-evidence.md`, `integration-brief.md`, `contract-and-provenance.md`, `source-pins.md`, `review-disposition.md`, `chatter-ideas/four-contact-sketches.md`, and root `reports/orchestration/plan-61-delivery-review-01.md` and `plan-61-investigation-closure.md`. Earlier pending-acceptance report statements are historical after closure. Inspect current HUD, main controller, life phone/context/view, social/finance/work story, log/storage/replay and actual message source records; report pins must be refreshed.

Preserve free reading/navigation, five-slot scheduling, once-only transactions, seeded mechanics, actual shown/action evidence, existing financial/recovery precedence and immediately available global Uninstall. Messages status never decides whether money is owed, a visit exists, a shift is accepted or a reward is earned. No action on mere opening, reading, dismissal or marking read.

## Selected experience

- Global Messages entry with overlapping-bubble icon, accessible unread-thread count and stronger finite arrival cue that settles to static status. No render/reopen-triggered repeated cue, aggressive perpetual pulse or color-only meaning; static/reduced-motion equivalents.
- Most recent actual delivery first, independent of unread. Portrait inbox with avatars, sender, preview and truthful time reference; thread Back returns to list. Visible close, Escape and backdrop dismissal preserve unanswered choices and restore context.
- Read delivered revisions independently of due/unresolved status. Inbox inspection, failed content mount and opening an offscreen newest message do not acknowledge it. Plan61's visible-intersection mock is evidence for a proposal, not an already approved production read algorithm; the contract must define meaningful display and accessible navigation precisely, without claiming perception.
- Consequential choices appear in a separate sibling Decide panel, initially collapsed, outside the phone. No automatic urgent-message expansion selected. Informational/resolved/expired content does not retain redundant action controls. Conversation text remains sender-authored; game state/explanation belongs outside it.
- Global-only Uninstall remains usable above layers at all sizes. Do not copy the gallery's inert header controls.
- Historical exchanges start read and action-free. Selected working contacts: Copy Counter, Lantern Laundry, Kit as casual neighborhood acquaintance, Mom as family contact. Reuse accepted Ren/avatar and established Marisol/property-office/Quackpot voices where chronology permits. New historical copy does not create an unpaid order, preexisting Ren relationship, obligation or current event. The owner accepted sketches as working material, not every sample verbatim.

## Scope and implementation requirements

### 1. Mechanism and source-ownership gate

Before writes, deliver one compact selected/context/placeholder/deferred record, current route/message inventory and pinned replacement seam with relevant neighbors. Propose small pure message projection/state modules and focused UI/controller helpers; do not grow main.js into another monolithic inbox or import report files at runtime. Enumerate exact files and assign one writer per shared turn with root.

Define stable thread/message/delivery/revision IDs, authoritative payload sources, deterministic ordering, duplicate handling, display/read acknowledgment, stale revision safety, cancel/expiry and action revalidation. Identify whether delivery/read/display facts are append-only events or validated separate state, and how actual manipulation-cue display reaches the Receipt. A shown promotion can matter without the player acting; never reduce evidence to acted-on messages. A balance rerender is not automatically a new delivery. Opening Messages must not consume the mechanics RNG.

Specify save envelope/version policy, replay, transaction adjacency, idempotency, payload limits, unsupported-save preservation and checkpoint effects before implementation. Plan52 exposed runtime-dependent race replay serialization: preserve that evidence and current dispatch, do not hide it with message validation changes. Root reviews any shared save version change with Plan59 rather than allowing competing cutovers.

### 2. Real communication adapters and atomic routing

Inventory and port existing work/Marisol, Ren, loan and launch invitation/reply/ack routes; include property-office information where already authoritative. Separate delivery, shown evidence, read and response. Preserve Ren's actual shown/commitment lifecycle, finance terms and deadlines, due-before-work and recovery/rescue exceptions. Dispatch consequential actions through existing engine transactions with fresh current facts and exactly-once guards; no balance edits or action flags inferred from inbox metadata.

Keep current communication routes until header replacements work. Then atomically reserve the unlocked desk phone for Quackpot, retaining prelaunch invitation/reply/ack and Day1 required shift. Preserve the temporary Plan52 Day2+ work-to-app bridge until equivalent access is present. Work keys still depart for work; opening or browsing the app remains free and first actual play owns the existing slot conflict. No navigation-only bottom-bar regressions.

Messages must not invent a fixed lender date. Preserve current factual terms/available deadline information and propose any necessary in-world wording to the owner without changing the underlying deadline. Explicitly defer a calendar system; illustrative Plan61 $120 is never a production default.

### 3. Lifecycle, historical content and early owner checkpoint

Specify opening/closing behavior during apartment, Settings/Uninstall Stay, active gacha session, pending reveal and race. Preserve committed outcomes, pause/resume ownership, focus and session location; no remount rerolls, duplicate payout or phase advance. If a context cannot safely show Messages, define a truthful availability/deferred-notification rule for root review rather than dropping deliveries or obscuring exit.

Ask Sonnet for one context-rich batched review/edit of the selected historical first-wave writing and consequential message tone if needed; reuse context or provide a self-contained brief. Haiku may supply small original sender motifs. Provider calls require a coherent root resource/transport clearance, not assumed access. Owner meaningful copy choices may happen directly in the implementer chat. No extra brainstorming quota or automatic repeated reviews.

Build an early real route: header/inbox, one ordinary existing communication, one read-but-unresolved finance message, a historical exchange, and actual return to Quackpot/apartment. Show desktop/narrow production captures with real neighbors before polishing every sender. Follow with remaining existing adapters and selected static history. Optional later chatter, occasional companion-message payoffs and frequent Quackpot return/event campaigns remain separately packeted rules, not silently added here.

### 4. Validation and delivery

Use genuine current-policy histories and isolated profiles, not edited owner saves or arbitrary state patches. Target ID/revision/order and duplicate delivery; failed/offscreen/stale read; read-but-due; dismissed/expired action; latest facts on confirmation; real chosen action exactly once; actual display/Receipt evidence; save/reload/replay and profile/storage safety. Historical entries must not count as new unread, trigger attention, award anything or create falsely current tasks.

Exercise real keyboard/back/close/Escape/backdrop, focus restoration, global Uninstall/Settings and enlarged-text geometry at desktop/narrow widths; readable newest content/action access, motion/static parity and finite cue replay behavior. Verify reveal/race/session boundaries with targeted lifecycle tests and observation; stills alone do not prove them. Report actual AT/OS/device limits honestly.

Pin actual source/state/build evidence. Root views before/after touched and neighboring production surfaces before owner-ready delivery. Preserve failed receipts and sampled cleanup uncertainty; artifact acceptance is separate from a clean job. Refresh only affected checkpoint starts after a coordinated final source freeze, preserving old attestations and not relabelling stale entries as current. No full-game replay requirement unless a concrete lifecycle risk justifies it.

## Validation checklist

- [ ] Root approved current source ownership and message/display/read/save/replay contract before writes.
- [ ] All existing communication/action routes preserved through an atomic replacement; desk phone and keys behave as selected.
- [ ] Existing engine outcomes, schedule/finance/social rules and critical Receipt evidence remain authoritative.
- [ ] Selected header, portrait inbox, separate collapsed Decide, finite/static cues and working historical contacts are present in production without gallery placeholders.
- [ ] Real lifecycle, focus, duplicate/read/due and persistence evidence cover the touched contracts; gaps are explicit.
- [ ] Provider requests/observed identity, private artifacts and consultation posture recorded. One read-only Terra-medium pre-delivery reviewer is authorized for this integration; no automatic repeated reviewer rounds.
- [ ] Resource addendum, host preflight, bounded finite jobs and explicit owned commits respected; no unrelated changes, push or runtime network.
- [ ] Root actual visual/technical review and final owner review performed; progress committed last.

## Stop conditions and progress report

Stop for a load-bearing unselected narrative/schedule, shared-file/version conflict, validation failure requiring a changed contract, unsafe duplicate/financial effect, new provider/installation authority or observed resource/cleanup problem. Routine owned repairs and bounded corrected reruns proceed within the agreed stretch. Implementers never set completion status or edit root dispositions, and never declare shipping readiness. Report what was actually verified, not just test counts.

`reports/development/plan-63-messages-production-integration/progress.md` must record source/contract pins, selected versus proposed behavior, meaningful owner decisions, actual validation and failures, consultancy/reviewer dispositions, remaining limits and production-review entry points. Optional randomized chatter is not a completion criterion for this packet.
