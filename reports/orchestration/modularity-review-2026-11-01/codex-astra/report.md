# Quackpot independent modularity and integration-process review

**DONE — useful first pass completed; no additional investigative wave requested.**

Independent Codex Astra lead review, 2026-11-01. Baseline: `96c1b964d415f3468f9004a9e53b58accc7bb0ba`. Observed HEAD: `383765b63f0a188fe889800118515dff8a6f3a0a`; only the review dispatch documents differ. Repository remained read-only. The independent Claude lead was not consulted. All recommendations require later owner/orchestration adoption; this review accepts no implementation and changes no packet status.

## Lead judgment

**The perceived pattern is real, but narrower than “prototypes keep replacing the finished game.”** Race integration lost selected presentation details; apartment integration repeatedly needed context, navigation and presentation repairs. However, the earliest race problems were observed in unfinished, uncommitted integration, some later changes were new owner decisions, and the apartment session hub did not delete the accepted reveal theater or race components. Treating all of those as one kind of regression would lead to the wrong remedy. [E02–E05]

The best-supported causal explanation is a gap between **what a focused preview establishes** and **what a production integration has to preserve**, followed by verification that sometimes tested local implementation rather than the selected experience at its actual entry/exit boundaries. Existing modularity is substantial: pure life transitions, deterministic race resolution, playback/motion controllers, log-derived Receipt projection, reusable SVG and bounded checkpoint tooling. More modules or tests by themselves would not close the gap.

**Smallest intervention with the widest likely payoff:** add one compact selection-and-preservation record to each production integration packet, and require its few distinctive checks on a focused route through the real app before an owner-ready recommendation. The record alone is insufficient—the race packet already contained important requirements. Its value comes from making the production comparison an explicit delivery artifact. Confidence: high that this addresses the sampled failures; medium that it is the dominant cause across the entire repository, which was not exhaustively audited.

Keep the owner's focused HTML preview workflow. Use it for exploration and selection, then switch the acceptance surface to a current production checkpoint. Do not require replaying the entire game for each visual decision, and do not build another simplified game as the integration test.

## Ranked findings

| Priority / confidence | Finding | Consequence and response |
|---|---|---|
| High / high | **Selection fidelity was not consistently demonstrated before owner review.** Race camera/labels/podium were explicit, yet initially lost; later committed presentation required further fixes. | Link a handful of selected invariants to actual production observations. More handoff prose alone is unlikely to help. |
| High / high | **Navigation, phase and displayed evidence have shared semantic ownership.** The return-destination/hub-impression repair needed engine and controller changes even though the visual components were separate. | Give one integration writer ownership of each cross-layer transaction and its return/overlay/save contract. |
| High / high | **Focused production review exists, but its captured routes are not current life/work coverage.** All three Plan35 source maps differ in20/96 files from the reviewed source. | Reuse the tooling through a bounded new route/validation disposition. Preserve old capture provenance and fail-closed freshness. |
| Medium / high | **Prototype surroundings and selected behavior are distinguishable in some documents, but interpretation still drifted.** Root acknowledged over-literal Plan28 preservation; Plan40→47 now carries stronger explicit exclusions. | Carry qualifications into a short current integration record, not an expanding historical amendment stack. |
| Medium / medium-high | **The architecture can support upcoming work without a rewrite, but policy and lifecycle seams need deliberate ownership.**47/46/48 share anchors, effects, replay and public evidence. | Let47 establish a bounded work/presentation contract; sequence social/gig mutations against it. Defer broad controller/framework changes. |
| Low–medium / high | **Some current-direction summaries remain stale.** Open questions still describe Plan38 implementation as pending; a docs hub row calls45 draft while its packet is active. | Reconcile affected summaries at handoff/closure. Packet/index status should remain authoritative. Avoid another duplicate status registry. |

These are review findings about process and coupling. Historical defects are not asserted to remain present at the baseline. Active Plans45/47 are evaluated by their proposed safeguards, not judged as completed failures. [E01,E08]

## Historical cases and competing explanations

### Race: concrete fidelity loss, with an important chronology correction

Plan13 established the selected race mechanism; Plan23 explored and received approval for actual individual finishes and the later enlarged podium/lighting treatment. DECISION-023 pinned the production target, while the packet required shared projection, correct heading/labels, accepted motion and outcome/presentation separation.

The first owner/root production inspection found rotating labels, missing eased camera and incorrect podium composition. **That inspection was of uncommitted work before final delivery.** Direct source inspection of committed `2609032` shows the camera, independent orientation layer and2/1/3 podium already present. This review corrected an investigator's initial attribution rather than repeat it. The record establishes an integration detour and owner review burden, not loss in an accepted release. [E02]

Subsequent committed changes provide stronger exact before/after evidence: `7b69e6c` corrected the starting mirror, removed premature “Race complete,” changed camera-only dimming to whole-scene dimming, repaired contact/role presentation and delayed result disclosure. A later correction aligned timeline and course-clock domains. These are presentation/lifecycle defects that a passing resolver or local playback test could miss.

Some changes were intentional: actual individual crossing order superseded an older model; player emphasis/shared pause were later refinements; normal-motion Skip was explicitly removed by a new owner decision. Its tests were correspondingly changed to wait for natural settlement. I found no basis in this sample to call that dishonest test weakening. The owner eventually accepted Plan23 under DECISION-027, with recorded evidence limits intact.

The strongest competing explanation is ordinary iterative integration: a complex feature will need repairs, and the gates did catch them before acceptance. That is partly true. The avoidable cost was sending the owner discrepancies that were already selected and could have been checked against the existing preview. Gates worked as recovery; they were less effective at preventing repeated experience review.

### Apartment: scope expansion exposed old limitations and created new context problems

The final Plan28 selected-mix review explicitly said to port interaction grammar, preserve supported production states and avoid copying broad report routing. Initial Plan38 port `9bf4432` added focused apartment modules around the existing fixed route. Owner feedback then exposed contradictory time labels, no ordinary work/evening presentation, missing Day2 gacha access and collapsed shift/pay/rent semantics. Root's sequencing review acknowledged over-weighting literal prototype preservation. Several of those were shortcomings of the older mechanism slice, not features removed by the port. [E04]

Plan37/38 then deliberately introduced a new action-based policy. `9d3f9d2` added the phone session hub, which routed to existing production reveals and races. Its initial flat menu looked much poorer than its surroundings; `e6d15d3` grouped and sized it without changing action keys. Other repairs aligned phone artwork with the hotspot's meaning, fixed room/lighting/support context, and retired resolved-object affordances. Morning departure and the later LAUNCH reply were owner-directed changes, not proof the original implementation should have predicted those exact choices.

The precise failure is **incomplete preservation of the whole interaction context**, alongside genuine scope growth. Retaining the real card and race modules was good engineering, but it did not make a newly authored hub, room route or clock presentation faithful. Conversely, a modest hub is not evidence that someone replaced the real game with a prototype.

A small repair makes the coupling concrete: `0f9b74d` cleared stale phone-return destinations when phases changed, gated resume on a live session, and stopped Settings rerenders from creating repeated shop impressions. Rules, routing and factual display evidence intersect here. Splitting each into a different file or worktree would not define the required behavior. [E05]

### Comparison that went better: unmounted weather extraction

Plan34 extracted deterministic layers and controllers with explicit fallback, cleanup, shared flash arbitration and source fingerprints. The Git footprint avoids app entry, storage, events, production views and global CSS. A clip-target validation issue was found and repaired locally without forcing a game-wide redesign. This is a successful, bounded extraction with an honest unmounted claim. [E06]

It is a limited comparison: it deliberately postponed the difficult scene/settings/save/display integration seam. Therefore it supports preserving the project's pure helpers and extraction discipline; it does not prove that extracting everything first will solve production integration. Do not count non-mounting as successful gameplay adoption.

## Approval and preview provenance: one small artifact, used during review

Use four labels on the integration record:

| Label | Meaning | Actual Plan47 example |
|---|---|---|
| Selected addition | What the owner is adopting from a specific preview revision | One departure, one commute-in beat, two work observations together, $60 payslip, Day1 dinner return; selected Call Mom+5HP. |
| Preserved production context | Existing behavior that the preview does not replace | Real gacha hub/reveals/race/Dex; free phone entry; Settings/Uninstall/save; meals, phase authority and pending-session resume. |
| Placeholder / omission | Preview material with no adoption authority | Storyboard controller/tracker, mock open-gacha completion, reviewer controls and sample tone/export aggregates. |
| Deferred / unresolved | Explicit later work or owner choice | Gigs, Ren lifecycle, production audio, and unselected sit-with-duck+2 value. |

Add only: source/preview commit; exact replacement seam; compatibility choice;3–6 look-fors; one route/capture pointer; who verified which evidence. This can fit in the packet's existing proposal section. Do not create a separate ledger that competes with it.

Plan47 already carries most of these qualifications. That is progress. The missing proof is whether its delivered production route satisfies them. The recommendation is to make this existing discipline observable in the delivery, not to reset active work or impose a new interview. [E08]

Owner approval should mean “adopt these named additions with these surroundings preserved,” not “every button and number in this attractive preview becomes production.” The orchestrator must make that distinction legible before asking for selection. The owner should not have to infer hidden stand-ins or inspect implementation details to avoid accidentally approving them.

## Focused review and verification

Keep four artifact types distinct:

- **Exploratory prototype:** compares ideas; may use a local state machine, but its placeholders and unselected values are explicit.
- **Art gallery:** proves asset identity/composition under named inputs; does not prove saves, phase rules or production reachability.
- **Controlled component harness:** mounts real components with explicit synthetic inputs; excellent for layout, hotspot geometry and callback dispatch. It does not establish the route that produced the state.
- **Production checkpoint:** an identified valid save from a supported route, restored through ordinary startup, then advanced with real controls. This is the acceptance surface for integration behavior.

Plan16/35 already supply much of the fourth category: capture provenance, ordinary save validation/hydration, mounted actions, source identity, temporary browser contexts and isolation sentinels. Their limitations are specific: old route coverage, current hash mismatch, and a finite served-source list that omits newer life modules. A current-loadable catalog label is not a current validation result. Expanding this narrowly has more value than inventing a general snapshot framework. [E07]

For an integration checkpoint, preserve actual Settings, Uninstall/retention/Receipt, save/reload, navigation and relevant motion lifecycle. A harness may replace those for an isolated layout question, but must then say exactly that. Pixel comparison is useful for selected geometry; it cannot by itself establish honest payout or display evidence.

Use these five high-yield checks, scoped to the changed route:

1. **Selected-detail comparison.** For race: upright labels/right-facing start, camera, podium order/scale, visible role/contact motion and whole-scene dimming. For work: specified beat composition, clear payslip and kitchen continuity. Link each observation to selection provenance. This would have exposed the sampled fidelity losses.
2. **Boundary interruption.** Around a new commit/completion, exercise reload and Settings; use one separate Uninstall branch. Compare action IDs, balances, phase, RNG and event suffix. Check the neighboring return route, not just the new screen. E05 gives a concrete failure this addresses.
3. **Contradictory-state negative control.** Mutate one cached result/receipt-facing field while retaining the event history; require rejection where the contract promises consistency. E03 demonstrates its value despite many passing tests.
4. **Visibility and repeated activation.** Hidden-under-overlay or rerendered content must not create a new impression, wage or HP gain. Conversely, a newly visible supported occurrence must not be lost through excessive deduplication. A changing transform is not proof of the selected animation role.
5. **Freshness and alternate presentation.** Prove a changed participating source file invalidates stale evidence, then compare the same focused route under normal and reduced/static presentation with keyboard focus. Keep the claim to that route and viewport; no blanket accessibility/device guarantee.

Changing a test expectation requires a short reason: new owner decision, corrected test assumption, or repaired implementation. Sampled Skip and hub-order changes were legitimate. I found no demonstrated case of tests knowingly rewritten to bless an unauthorized regression. There are clear cases of checks asserting too little or operating at the wrong level.

## Minimal integration review illustrated on Plan47

1. **Before source clearance:** use the four-row selection record above. Pin the current engine/save baseline and show departure, doing, displayed content, completion/pay, dinner and leisure transitions. Keep content selection off draw/race RNG; identify the old-save policy. This is already substantially required by47.
2. **Before owner-ready delivery:** capture or derive one current, proven reachable work start using the bounded checkpoint tooling. Label any engine-only preparation honestly; do not claim it is mounted capture. Preserve source identity and an explicit recipe. One start plus two interruption branches is enough for the first integration review; no blanket recapture of the old catalog.
3. **Review the real route:** departure → one work anchor → selected reading/payslip → exactly one$60 credit → Day1 kitchen/dinner → chosen evening path → actual phone hub. Inspect desktop/narrow and static equivalents. Exercise Settings, reload around credit, and a separate Leave-to-Receipt branch. Assert no auto-rent, repeated HP/pay, lost pending cards or replacement of the genuine race/Dex components.
4. **Handback:** separate source/engine checks, component measurements, actual browser observations and remaining owner experience judgment. One small result table points to evidence. Stop treating mechanical correctness as visual acceptance or visual approval as permission to alter policy.

This is a proposed acceptance method, not an instruction from this review to47 or authority to spend another browser/testing wave now.

## Actionable rollout

Relative effort is qualitative, not a subscription-cost or calendar estimate.

| Timing | Proposed work / relative effort | Ownership and benefit | Risks / acceptance condition |
|---|---|---|---|
| Immediate process adoption | Add compact selection/preservation record and distinctive production comparison; **small** | Orchestrator + feature writer; reduces interpretation loss and repetitive owner review | Keep it within existing packet, not another document hierarchy. Already-present47 safeguards should be reused. |
| Immediate hygiene | Reconcile only affected current-direction summaries; **small** | Orchestrator; fewer stale pending claims | Preserve historical evidence; do not infer owner acceptance from tests. |
| Next bounded tooling work | One current work/evening checkpoint and necessary source-identity/loader adaptation; **medium** | Tooling writer coordinated with47; makes real experience reachable cheaply | New capture/validation evidence, preserved old provenance, isolated storage, finite execution. Do not silently rebind old attestations. |
| Conditional architecture work | Narrow new-policy command/routing/lifecycle helper around actual47 needs; **medium** | Same serialized core/controller owner; reduces repeated return/save/overlay glue | Demonstrate identical existing event/RNG/save behavior; leave legacy dispatch intact. No concurrent main.js extraction. |
| Later integration preparation | Shared presentation lifecycle signals for mounted weather/audio; **medium** | Composition-root owner plus effect authors | Only after selected triggers/settings policy and a real second consumer justify it; preserve local-only assets and immediate exit. |
| Defer | Framework migration, whole-engine rewrite, universal narrative state machine, all-view-model conversion, giant regression checklist, broad checkpoint recapture | No demonstrated decision value now | Reconsider only if measured change footprints remain high after the smaller intervention. |

The dependency map in modularity-map.md explains work/gigs, Ren, weather/audio and late disorientation in detail. Pure art/content work can proceed beside production implementation. Shared phase/anchor/replay/Receipt changes should be serialized even when new files are disjoint. A compact contract delta and acknowledgment should accompany a shared change; worktrees solve edit isolation, not conflicting semantics.

## What would falsify this diagnosis, and first-pass limits

The preferred explanation would weaken if the next two bounded integrations had explicit selection records and genuinely observed production-neighbor routes yet still lost the same behaviors. Examine the failures then: a lifecycle adapter or more substantial controller separation may become the better investment. It would also weaken if provenance showed the supposedly lost behavior was never selected; this review already narrowed claims in precisely that way for race timing, Skip, morning departure and early uncommitted work.

The case sample is purposeful, not a repository-wide regression rate or a model-performance comparison. Root reports and owner records corroborate history but do not reveal every contemporaneous conversation or uncommitted source state. No browser/test reproduction was performed in this review. Current source analysis and hash checks support bounded architectural/process conclusions, not runtime correctness, listening quality, balance, device or accessibility certification.

**First pass is sufficient for the decision at hand.** A further general static review has low expected value. The next useful evidence should come from the proposed method on an already-authorized integration, with owner/orchestration approval of any tooling scope. No additional investigation is requested and none will run after this handback without a new instruction.
