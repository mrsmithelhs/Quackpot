# Quackpot modularity and integration-process review — claude-opus first pass

Reviewer key `claude-opus`. Pinned baseline `96c1b96`; startup HEAD `383765b` (adds only review handoff docs; `src/` identical). All findings apply to the baseline unless marked otherwise. Repository was not modified. Status: **first pass complete; owner-approved W1 (blind provenance-card test) complete and integrated. W2 (Plan47 config-versioning check) is pending until the owner chooses it and Plan47's proposal exists.**

Labels: **[D]** demonstrated (source or execution), **[C]** corroborated historical account (multiple records/diffs agree), **[H]** hypothesis, **[R]** recommendation, **[O]** owner decision needed.

---

## Executive summary

1. **The pattern is real but mixed.** Across the race (Plan13→23), life (Plan28→38) and post-closure apartment repairs, integrations did lose or omit accepted behaviour. About half the owner-found "repairs" in those chains, though, were the owner changing direction on the same day, sometimes reversing a packet sentence written hours earlier. Neither "the implementers are careless" nor "the owner keeps changing their mind" explains the record alone. [C]

2. **The dominant mechanism is not overwriting an accepted surface. It is building a new route whose surroundings come from the prototype or from nothing.** Plan38 made every fresh run new-policy (`src/main.js:203`) and sent the session through a brand-new `life_phone` hub. That hub was a flat button list (`9d3f9d2:src/ui/life/life-phone-view.js`), while the styled gacha screen survived only for legacy saves. The duplicated footer cash and the phase-keyed phone art came in the same integration commit (`9bf4432`). The old surfaces were not edited badly; they were bypassed, so nobody compared the new route with them. [D/C]

3. **Prototype provenance is lost in both directions.** Plan28's delivery review says "HUD/Receipt/races are stand-ins"; that qualifier does not appear in the Plan38 packet or the Opus handoff [D]. Root then admits its Plan38 review "overweighted literal preservation of the prototype" [D]. With no artifact that says which parts of an approved preview were selected, which were context and which were placeholders, agents alternately copy too much and too little. Plan40 makes this concrete: it is a complete second simplified game (own HUD, $15 synthetic cash, mock "open gacha" resolver, 878-line storyboard controller), and Plan47 now has to warn implementers not to port the mock pieces [D].

4. **Verification before the owner sees a build is mostly implementer-observed or synthetic, so the owner is in practice the integration test.** Examples:
   - Plan23: root declared the build ready without driving a browser (`plan-23-production-review-02.md:21-23`).
   - Plan20: root declared ready on 140/140 tests and later wrote that this was "overreliance on reported/computed pointer evidence" (`review-05.md:5`).
   - The only end-to-end smoke has failed to launch Chrome since Plan23, and has targeted removed UI since Plan38 (static) [D].
   - Every Plan16/35 checkpoint is a legacy schema-3 save with no life state, and its source pins are stale, so none reaches the new-policy game [D].
   - Eight test files are outside `npm test`, including the 50-test Plan38 life-progression contract. They currently pass (87/87, E1), so this is an exposure, not rot [D].

5. **Semantic coupling now matters more than file size.**
   - `main.js` runs its own step machine (13-branch `renderApp`, 24 writes to `engine.state.step`) alongside engine-owned life phases and the pure `life-routing` surface choice [D].
   - Three upcoming packets (46/47/48) all claim the single `life.anchor` evening slot [D].
   - Save validation requires the saved life config to equal the *current* `LIFE_CONFIG` exactly (`src/core/life-config.mjs:10-14`, `life-validation.mjs:10`). Changing any number, such as Plan47's selected +5 "call Mom" against today's `leisureHealth: 10`, would make every in-progress new-policy save open in the corrupt-save dialog (`main.js:129-149`) unless versioning is added. Plan47 asks for a "migration/version strategy" in prose, but the code makes that a hard requirement, not an option [D code; consequence not executed].

6. **Smallest change with the widest payoff (confidence: medium):** a one-screen **preview provenance card** that travels verbatim from the owner's selection into the packet, paired with a **root-viewed before/after render of the touched state plus one neighbouring state** at the root "ready for owner" gate.
   - Both are cheap, and together they cover different halves of the documented cases.
   - The owner-approved blind test W1 (`experiments/w1-results.md`) backs this up. Cards written blind at the pre-integration commits caught 3.5/8 (Plan38) and 3.5/10 (Plan23) of the defects found later, and predicted none of the control direction changes.
   - The card caught stand-ins, framing and lifecycle items. It missed fine visual fidelity, which the render gate covers, and surfaces created by later amendments, so the card must be re-issued at each amendment. A config-versioning fix and new-policy checkpoints are the two bounded technical packets worth doing before Plans 46/48 (ideally before Plan47 delivers).

7. **Healthy boundaries to keep:**
   - The engine owns outcomes and events.
   - `life-progression` is pure.
   - The append-only log feeds the Receipt projection.
   - Extraction kits stay unmounted with fingerprint tests (Plans 24/34).
   - Plan19's "design locked before code, review on the mounted page" pattern.

   No framework migration or rewrite is justified by this evidence.

---

## Historical cases

### Case 1 — Plan13 preview → Plan23 production race (2026-10-26/27) [C]
- **Chain:** Plan13 selected the race *model* (DECISION-018). The presentation target was "the latest preview" (DECISION-023, 15:35 on 10-27). That preview had changed its camera default at 06:56 and its lighting at 14:45 the same day.
- **First production commit `2609032` (16:57):** shipped with wrong start facing, a normal Skip still present, background not dimmed, leader motion not visible, and participant glow narrowed to contact/impact only (`9d03dcd`). Root review-02 (16:59) ran 168 tests and no browser. The owner rejected it at 17:49 (DECISION-025) and accepted it at 20:42 (DECISION-027) after two repair rounds.
- **Real regressions:** start facing, motion visibility, glow narrowing, wall-clock timeline labels. **Intentional changes:** Skip removed (overriding the 15:40 gate's "retain pause/skip"), shared Pause, copy removals, vertical timeline.
- **Tests at first delivery:** race-view had no test. The motion test asserted `animations.length === 1`, a transform-presence proxy, and was later rewritten stronger. The smoke was rewritten to click Skip and never got past launching Chrome.
- **What the implementer could know:** the presentation target had moved within hours, and Plan13 itself disclosed "labels/grid remain limits". Some "loss" was a target that never sat still.

### Case 2 — Plan28 selected mix → amended Plan38 (2026-10-30/31) [C]
- **Chain:**
  - The owner selected mix D20 on 10-30.
  - The first integration `9bf4432` (+2518/−276, 27 files) passed 284/284 tests plus browser checks.
  - The owner then returned nine items (review-02). These covered sequencing, a missing skip control (which Plan28 D9 had explicitly forbidden and the draft packet listed as a non-goal), auto-paid overtime, hardcoded clocks and no Day2 gacha.
  - A mid-flight amendment (`b409edd`) reassigned the work and replaced "presentation-only" with action-based progression.
- **Repairs, with their cause:**
  - **Implementer omissions caught by root/reviewer:** R0, R2, R3b.
  - **Owner direction that conflicted with the clearance:**
    - "Morning work proposal is rejected" (`plan-38-mechanism-clearance-01.md:11`), then the owner wanted Morning departure that same day.
    - The Codex handoff said $80/$6/$170 were "not selected"; DECISION-048 selected them that same day.
    - The install reassurance (repair 03) was replaced by an in-world LAUNCH reply (repair 05) that same day.
  - **Implementer presentation regression:** session hub, after closure.
  - **Genuine late discovery:** resolved invitation.
- **Provenance:** Plan28's "HUD/Receipt/races are stand-ins" and "Day1/2 past-tense projections" do not reach Plan38's packet or handoff.

### Case 3 — Post-closure apartment repairs (10-31/11-01) [D]
- **Session hub (`e6d15d3`):** before Plan38 there was no pull/race/shop menu. Gacha was a linear styled step, race its own route, shop a modal. Plan38 created a new hub with all actions in one container sized for a single call to action. The repair was 35 lines of grouping and CSS. Its browser witness asserts the *new* DOM order (first written against the old order, then corrected), so it guards the new layout and could not have caught the original omission.
- **Duplicate cash / phone art vs target mismatch (`5fb02be`):** both originate in `9bf4432`.
- **Resolved invitation (`ee7a851`):** originates in the Plan38 repair chain (`134e1dd`).
- **Conclusion:** all three are a single integration's unreviewed neighbourhood.

### Comparison — what went well [C]
| Plan | Outcome | Why (correlates, n is small) |
|---|---|---|
| 19 Shell A | 0 owner-found repairs; 2 P1s found by root with real browser probes at 1440×900/390×520 | Design "already selected" in the gate before code; root measured rendered geometry |
| 21 Duck-Dex | 0 owner-found; root found that unrevealed draws were shown as owned (semantic) | Root review of game integrity worked; owner review would not have caught it |
| 34 Weather extraction | 0 owner-found, but **unmounted**; acceptance = 61 tests + hashes | Proves isolation, not product behaviour. Not a success claim for integration |
| 44 Receipt | 0 so far; root caught 2 honesty defects; still **delivered, not owner-accepted** | Too early to call |
| 20 Rig/motion | 4+ owner-found visual defects after root accepted on test totals | Counter-example: test totals ≠ rendered fidelity |

The best predictor of few owner repairs was **design locked + the root reviewing the mounted page itself**. Unmounted extraction is low-risk precisely because it defers the integration problem.

### Competing explanations, weighed
| Explanation | Verdict |
|---|---|
| Surface bypass / new route without neighbour comparison | Supported, primary (Cases 2, 3; Plan40 shape) |
| Provenance loss (no selected/context/placeholder split) | Supported, primary (Cases 1, 2) |
| Owner same-day direction churn and rushed amendments | Supported, roughly equal weight for owner-found items; it raises the cost of every other weakness |
| Throughput/concurrency (145 commits on 10-31; Plans 38–44 repairing the same day) | Plausible amplifier [H]; it explains why root reviews were source/test-only |
| Insufficient unit tests | Weak. Unit tests were plentiful and passed; the failures were rendered/neighbour/meaning |
| Large files / no framework | Not supported as a cause; coupling is semantic, not size |
| Model incompetence | Not supported; the same implementers produced clean extraction and Duck-Dex work |
| No worktrees | Not supported; the collisions were semantic, not file-level |

---

## Findings ranked by impact × confidence

| # | Finding | Type | Impact | Confidence |
|---|---|---|---|---|
| F1 | Integrations create new routes whose surroundings aren't compared with the accepted surfaces they bypass | D/C | High | High |
| F2 | No provenance artifact; prototype qualifiers drop between synthesis, packet and handoff; agents over- and under-port | D/C | High | High |
| F3 | Root "ready" gates accept implementer-observed/synthetic evidence; the owner is the de facto integration test | D/C | High | High |
| F4 | No production-faithful path to the new-policy game: smoke stale (static), checkpoints legacy/stale, layout witness synthetic | D | High | High (smoke: static) |
| F5 | Exact-match `LIFE_CONFIG` validation turns any tuning into save invalidation | D (code) | High for 46/47/48 | High on code, medium on UX consequence |
| F6 | Shared semantic contracts (single evening anchor, leisure HP ×3 values, employment gating, `main.js` step machine) across file-disjoint packets | D | Medium-high | High |
| F7 | Same-day direction reversals and amendments while integration is in flight | C | Medium-high | Medium-high |
| F8 | 8 test files (incl. life-progression) outside `npm test`; all pass today | D | Medium | High |
| F9 | Tests rewritten to the new DOM/behaviour (Plan23 smoke→Skip click; hub witness re-ordered), with no protection for the prior accepted state. No bad intent seen; some rewrites strengthened assertions | C | Medium | Medium |

---

## Answers to the brief's eight questions (compressed)

1. **Historical causation:** mixed; see the cases. Meaning changed at preview snapshot (race), at handoff (Plan28 qualifiers), at implementation (new hub), and at verification (root accepts without rendering).
2. **Provenance:** recommend the provenance card below. Qualifiers vanished at Plan28→38 [D].
3. **Modularity:**
   - Healthy: engine/outcome, pure progression, event log → Receipt, CSS mostly scoped per feature, kit extraction.
   - Costly: `main.js` as a second step machine and surface router (with `life-routing` and `phone-context` as two more deciders), global `.btn-*`/`.banner-*` shared across gacha, modals and life, and config-as-identity.
   - Details in `modularity-map.md`.
4. **Focused review:**
   - Four tools exist, and none is production-faithful for the new-policy game:
     - the prototype/gallery (report-local; Plan40 is a second game);
     - the controlled component harness (`apartment-layout-check.mjs`: real renderers, synthetic state);
     - production checkpoints (Plan16/35: real captured saves, but legacy-only and stale);
     - full play.
   - What must stay real in a trustworthy focused preview: HUD, Settings/Uninstall entry, navigation back to the apartment, save/reload, reduced motion.
   - Worktrees don't address this.
5. **Preservation contracts:** add a short "surfaces in path" inventory to packets (below), not a giant checklist.
6. **Verification:** checks that would have failed on the real regressions:
   - a root-viewed before/after render pair (Plan23 facing, hub, duplicate cash);
   - a fresh-run smoke reaching the evening hub (hub, duplicate cash, phone context);
   - an assertion that neighbouring surfaces keep their action set and styled container (hub).

   Checks that passed while encoding the wrong interpretation: the Plan23 motion proxy, the smoke clicking Skip, the hub witness re-ordered to the new layout.
7. **Parallel development:**
   - 45 ∥ 47 is safe (Ren assets don't share code).
   - 46/47/48 can only *design* concurrently: they share the anchor, config, `main.js` callbacks and log/version strategy, so writes must be serialized.
   - Changes to a shared contract should go out as a one-paragraph contract notice to all active packets, recorded in the decision log.
8. **Future fitness:** see `modularity-map.md` stress paths. One shared seam should come first: the **evening-activity/anchor contract plus config versioning**, before 46 and 48.

---

## Interventions

### Immediate, low-cost process fixes [R]
1. **Preview provenance card** (≈15 lines, written at owner selection by root, confirmed by owner in one reply, copied verbatim into the packet).
   - Columns: *Selected* (exact behaviours/copy/geometry IDs) · *Faithful context* (must match named production source; port nothing) · *Placeholder / stand-in* (never port) · *Deliberately omitted* · *Open numbers / not selected*.
   - Root's ready-gate checks the delivery against it.
   - **Re-issue it at every scope amendment** (W1: Plan38's hub and phone-context defects arose from surfaces added after the original selection).
   - Applied to Plan40→47, see below. Two real blind examples are in `experiments/w1-results.md`.
2. **"Surfaces in path" section in the packet template**:
   - List each existing route/screen the change renders through. Mark it *edit-in-place* or *replace*.
   - For *replace*, the proposal checkpoint must include a render of today's production state of that surface and its action list.
   - This is the neighbour inventory, scoped to touched states only.
3. **Root ready-gate rule:** root itself views rendered production for the touched state and at least one neighbouring state, before and after, at laptop and narrow widths. Root does not rely on implementer IAB claims or test totals. This is a gate on evidence, not on a new tool.
4. **Direction-change buffering [O]:** while a packet is between clearance and delivery, root batches owner direction changes into one amendment at the next checkpoint (urgent safety issues excepted). This trades a little latency for fewer same-day reversals. It is the owner's call.
5. **Run every tracked test file in `npm test`** (add the 8 files or use a glob). One line; protects life-progression, Duck-Dex, Receipt adapter and motion controllers in every future packet.

### Bounded packets worth doing next [R]
| Packet | Effort (relative) | Why now | Ownership / risk |
|---|---|---|---|
| **A. Life config versioning:** registry `{policyVersion → config}`; validation replays with the saved version's config; new values go into a new version | Small | Plan47 may change leisure HP; 46/48 add values | core life-config/validation/storage; must keep existing policy-1 saves byte-identical; serialize with 47 (could be folded into 47's root-cleared proposal) |
| **B. New-policy production checkpoints + smoke repair:** capture 4–6 real-click schema-4 states (Day1 morning, afternoon work, evening hub with/without pending reveal, Day4 rent, Receipt); include `src/core/life*` and `src/ui/life/*` in the source closure; fix the smoke's fresh-run path | Medium | Gives 46/47/48 and the owner focused, faithful review starts; replaces synthetic witnesses for integration claims | scripts/dev/checkpoints + smoke; capture/pilot commands append evidence in-repo, so plan that deliberately |
| **C. Evening activity/anchor contract (design-only, then a small write):** anchor kinds, which consume a phase, which HP values, how gigs survive job loss | Small design | 46, 47, 48 all reserve `life.anchor` | owner selection of values; then one writer |

### Deferred [R]
- Extract `main.js` surface routing into a declarative route table, with `life-routing` as the single decider. Worth it only after B provides a safety net; small but central.
- A general "preview from real components" harness. Re-evaluate after B; checkpoints into the real game may make it unnecessary.
- Weather mounting, audio lifecycle, Plan36 disorientation: design-only until A–C exist (see map).

### Leave alone
The engine, event log and Receipt boundary; pure progression; kit extraction with fingerprint tests; Plan25 bounded launcher; one-writer discipline; the owner's focused-preview workflow itself (keep it, but label provenance).

---

## Minimal integration-review method, illustrated on Plan47 (active; proposed safeguards evaluated, no outcome presumed)

Plan47 already contains much of this in prose: "do not port the study's mock open-gacha action", "never copy the report controller/tracker", "do not infer that liking a storyboard selected every number", preserve "real gacha hub/card/race/Dex". What it lacks is structure and a neighbour render. Method:

1. **Provenance card (from Plan40 closeout + `plan-47:28-30`):**
   - *Selected:* one departure; commute-in default; two observations on one card; $60 payslip; Day1 kitchen/dinner return; Call Mom +5 HP.
   - *Faithful context:* production HUD, apartment scene/targets, session hub, Settings/Uninstall.
   - *Placeholder:* study HUD, $15 cash, reviewer selectors/badges, `experiment-tracker.mjs`, `open_gacha` resolver, tone scores in proposed events (`avgPreChoiceScore`, `integration-recommendation.md`).
   - *Omitted:* homeward commute playback, gigs.
   - *Not selected:* Sit-with-duck +2.
2. **Surfaces in path:**
   - `life_work` and `life_evening` (`life-view.js`): edit-in-place.
   - Payslip: new.
   - Evening hub entry from the phone: must remain the existing `life_phone`.
   - Kitchen: edit.
   - Root gets a current-production render of each before clearing.
3. **Contract checks at the proposal checkpoint:**
   - config version (finding F5);
   - anchor semantics (C);
   - no change to `main.js` step names without a route-table note.
4. **Ready gate:** root views before/after of afternoon work, payslip, evening and the session hub (neighbour) at 1366×768 and 390 px. Then fresh-run reload at each boundary. Then the provenance card checked line by line.
5. **Owner review:** the integrated game from a checkpoint (if B exists) or a fresh run.

---

## Ways to falsify my preferred explanation
- If Plan47's owner-found defects are mainly *new direction* rather than omitted neighbours or ported placeholders, F1/F2 are overweighted relative to F7.
- ~~If a retrospective card would not have flagged the defects, the card is overvalued.~~ **Tested in W1:** caught about 35–45% of reachable items. That is above the ≤1-item downgrade threshold but well short of sufficient, so the claim was narrowed to "card + render gate".
- If root-viewed before/after renders had been present at Plan23 review-02 and still missed start facing (an implementer had already claimed it fixed), the gate rule is insufficient and fidelity needs scripted visual assertions.

## First-pass sufficiency and evidence limits
- Sufficient for the process recommendations and packets A–C. Evidence is git history, reports and source.
- One bounded execution: 8 omitted test files, 87/87 pass.
- Not run: smoke, checkpoint revalidation (writes in-repo), any browser session. Smoke staleness and checkpoint freshness failure are static inferences.
- The corrupt-save consequence of config drift follows from code paths and was not executed.
- Helper findings were spot-verified on load-bearing claims (`evidence.md`). Some counts (Plan21 findings, the Plan20 owner list) are helper-derived and approximate.
- Owner intent behind the same-day reversals is inferred from decision-log and report text only.
