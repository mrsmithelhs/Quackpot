# Quackpot founding design review

**Reviewer ID:** `codex-astra`  
**Baseline:** `f0fe34e201c6688053cc6e8ec88389338cd9fd6f`  
**Date:** 2026-10-23  
**Authority:** Independent blind review only. Findings are claims for owner evaluation, not approvals.

## Executive summary

The strongest premise is the collision between a delightful acquisition loop and an apartment that visibly deteriorates to fund it. The owner's existing-duck direction gives that collision an emotional witness. Quackpot includes the main acquisition mechanisms associated with excitement and progression motives in the bounded research. Its largest experience risk is delivering those mechanisms as buttons and meters before giving the player anything worth losing.

The draft does not yet specify a coherent v1 duration, the player's role in racing, or how five-minute attention is divided among customization, pulls, races, life choices, and conversations. The Receipt has the right purpose but needs to distinguish actual odds, staged cues, observed decisions, and unobservable feelings. A few event-based variations could create classroom stories without multiplying economic systems. Preserve the broad economy checks; do not turn variety into a comprehensive balance project.

This review does not conclude that the design is ready for development. Adopted SVG, immersion, tooling-openness, and own-duck decisions are direction, not defects or questions to reopen.

### Coverage checklist

- [x] Read `README.md` in full at the baseline.
- [x] Read `docs/project-seed.md` in full at the baseline.
- [x] Read `docs/founding/design.md` in full at the baseline.
- [x] Read `reports/orchestration/founding-docs-review/baseline.md` in full at the baseline.
- [x] Applied the post-draft owner decisions.
- [x] Completed bounded mechanics research before writing findings.
- [x] Covered both lenses, all five goals, juice, own-duck scenes, SVG delivery, and variety-to-Receipt mapping.
- [x] Consulted no other review; changed no repository file.

### Goal scorecard

Scores assess the written design, not a built game: **1** little support; **2** material gap; **3** promising but unresolved; **4** coherent support; **5** unusually strong support. These are judgments, not measurements.

| Goal | Score | Assessment |
|---|---:|---|
| G1 — High valence | 3/5 | Wins and sacrifices exist, but v1 defers much of the sacrifice and leaves race agency and attachment timing unresolved. |
| G2 — “Did you see that?” | 2/5 | Rare pulls and absurd escalation offer ingredients; concrete staging and discoverable events are mostly unspecified. |
| G3 — Talkability | 3/5 | Spending paths and the Receipt can support comparison; palette diversity alone will not produce different stories. |
| G4 — Variety cannot break the run | 2/5 | Seedable randomness and broad checks help; finite collection, event effects, and terminal ordering remain undefined. |
| G5 — The Receipt lands | 3/5 | Excellent premise; changing odds and claims about internal reactions need more exact accounting. |

## Ranked findings

Anchors identify headings at the baseline. Confidence separates textual evidence from predictions about play. Ranking reflects consequence for this five-minute experience.

### 1. The v1 scope does not yet describe the promised experience

**Impact:** High — a functioning pull interface could lack the emotional arc under review.  
**Anchors:** `docs/founding/design.md#scope`, `#hard-constraints`, `#life-metagame`, `#manipulation-catalog`.

**Claim/consequence:** v1 specifies one in-game week and three techniques; the overall contract says about fifteen days, while the catalog says every technique is implemented. Seven twenty-second days provide 140 seconds, versus 300 for fifteen. Most memorable sacrifices and all five endings are deferred to v2. A literal minimal v1 may reach a Receipt before the student cares. This is an internal scope ambiguity, separate from later owner directions.

**Evidence/confidence:** High for the conflicting scope statements; medium for the experiential prediction.

**Smallest change:** Define whether v1 is a mechanism prototype or the classroom experience. If the latter, state its duration, one consequential life choice, terminal routes including Uninstall, and exactly which techniques its Receipt reports. Keep the full ladder deferred.

**Type:** defect. **Goals:** G1, G3, G5.

### 2. The clock leaves no explicit room for the hook or for savoring wins

**Impact:** High — pacing could erase both joy and pressure.  
**Anchors:** `docs/founding/design.md#the-five-minute-experience`, `#life-metagame`; `docs/project-seed.md#owner-decisions-recorded-2026-10-23`.

**Claim/consequence:** Fifteen twenty-second days already consume five minutes. Customization, conversations, pulls, shopping, and fifteen races must fit inside that time or extend it. Continuous time can punish admiration of a win; unbounded modal pauses extend the lesson. A two-hour fictional warning corresponds to about 1.7 real seconds if the twenty-second day maps linearly—poor time for a meaningful purchase decision.

**Evidence/confidence:** High for arithmetic and absent timing policy; medium for likely frustration.

**Smallest change:** Write one beat budget and clock rule. Include setup and ordinary transitions in the duration target. Give banner urgency explicit game-time labels and an actionable decision window rather than literal compression. Sketch the opening as own duck → welcome reveal → race payoff → temptation; the staging proposal below is illustrative.

**Type:** defect. **Goals:** G1, G2, G4, G5.

### 3. The race is automatic but also implied to require reflexes

**Impact:** High — the central reward loop may be an interstitial rather than play.  
**Anchors:** `docs/founding/design.md#core-loop`, `#life-metagame`.

**Claim/consequence:** The best duck races and speed determines placement, but extra shifts make race reflexes feel slower. No racing input is described. Without choice, better stats are the obvious racing answer and the player waits for payout. With reaction input, its relationship to speed, exhaustion, and accessible play is undefined. Losses could feel arbitrary rather than exposing power creep.

**Evidence/confidence:** High for the agency gap; medium for boredom. Automatic races can entertain when stakes and staging work.

**Smallest change:** Choose the race's job. The smaller option is a brief auto-race with clear stakes, visible relative speed, overtaking feedback, and faithful results; remove the reflex claim. Alternatively define one pre-race choice and its trade-off without adding a reflex minigame. Life choices can supply agency while racing supplies spectacle.

**Type:** owner choice. **Goals:** G1, G2, G5.

### 4. The Receipt can confess things that did not happen

**Impact:** High — inaccurate confession weakens the entire experience.  
**Anchors:** `docs/founding/design.md#the-receipt`, `#manipulation-catalog`, `#core-loop`.

**Claim/consequence:** A flat 2% legendary-odds statement is insufficient once soft pity raises probability and hard pity guarantees a result. The starter-pack example asserts that a price looked reasonable, which the game cannot observe. Fifteen automatic day transitions do not establish fifteen voluntary logins or loss aversion. New sound, delay, camera, or social-proof variants also disappear if only purchases/outcomes are recorded.

**Evidence/confidence:** High: conditional odds differ from base odds; behavior does not establish private motive.

**Smallest change:** Define a local record for offers/cues actually presented, choices, costs, outcomes, and actual pre-draw probability. Distinguish “we displayed,” “you did,” and “did this affect you?” Record pity and near-miss rules. Separate decoration from deliberate manipulation; no remote telemetry or general analytics platform is needed.

**Type:** defect. **Goals:** G3, G4, G5.

### 5. Pity may be unreachable or consume the whole session

**Impact:** High — one of v1's three mechanisms could be inert or crowd out the game.  
**Anchors:** `docs/founding/design.md#core-loop`, `#tuning`, `#scope`.

**Claim/consequence:** Soft pity at 35 pulls and the guarantee at 50 imply 5,600 and 8,000 gems at the listed price. Income, race payouts, and pack prices are unspecified. Fifty individually staged reveals would consume substantial attention. The draft correctly calls for measuring pity reachability; the experience question is whether a meaningful approach-to-pity decision occurs before the Receipt.

**Evidence/confidence:** High for arithmetic/missing inputs; low for actual reachability. This is not a finding that the numbers are wrong.

**Smallest change:** Use the existing broad simulation's pull-count and pity-timing results to choose whether to compress thresholds or stage multi-pulls compactly. Budget reveal time. Define banner carry-over/reset so the sunk-cost example is interpretable. Do not add per-variant fairness simulation.

**Type:** simulation question. **Goals:** G1, G4, G5.

### 6. Attachment needs a payoff before the own duck becomes decoration

**Impact:** Medium-high — the personal anchor may never acquire emotional weight.  
**Anchors:** `docs/project-seed.md#owner-decisions-recorded-2026-10-23`; `docs/founding/design.md#core-loop`, `#life-metagame`, `#the-receipt`.

**Claim/consequence:** Naming, styling, and silent conversations are adopted. Best-duck racing can immediately make the original duck mechanically irrelevant. Without recurring placement, customization becomes an introductory form. Selling that duck is not an approved mechanic and must not be silently assumed.

**Evidence/confidence:** High that placement/frequency are unspecified; medium that the proposed staging builds attachment.

**Smallest change:** Keep the own duck visible at home; use three short event-triggered scenes: opening, first sacrifice or pressure declined, ending. Camera hold, empty space, and player self-justification carry the joke; the duck stays silent. Use fast customization defaults. If selling it is later proposed, obtain a separate owner choice and provide an empty-place conversation fallback.

**Type:** idea. **Goals:** G1, G2, G3, G5.

### 7. Combinatorial art is not yet a finite collectible game

**Impact:** Medium-high — completion can be unreachable while ordinary pulls become noise.  
**Anchors:** `docs/founding/design.md#assets`, `#core-loop`, `#endings`.

**Claim/consequence:** Eight colors, eight hats, and six accessories allow 384 combinations; collectible roster and duplicate identity are undefined. If every combination is collectible, fifty distinct pulls cannot complete it. The draft promises hundreds of visual variations, not necessarily a 384-entry roster, so this is ambiguity rather than proof of impossible completion. Nearly useless duplicate currency also removes a consolation beat.

**Evidence/confidence:** High for the absent roster contract and conditional counting argument; medium for duplicate fatigue.

**Smallest change:** Separate finite collectible identities from cosmetic variation. Define the completed set and whether the own duck counts. Consider one bounded cosmetic use for Down while preserving poor economic value. Avoid a profitable duplicate loop.

**Type:** defect. **Goals:** G1, G2, G3, G4.

### 8. The escalation ladder offers breadth before a weighty decision

**Impact:** Medium-high — the squeeze can become rapid debt-menu clicking.  
**Anchors:** `docs/founding/design.md#life-metagame`, `#endings`, `#scope`.

**Claim/consequence:** Seven options, multiple meters, loans, rent, and streaming compete for five minutes. Keeping the apartment and making another pull both need emotional appeal. “Always tempting” is an aspiration, not a consequence model. Money reaching zero may end the run just as borrowing becomes interesting.

**Evidence/confidence:** High for feature density and undefined insolvency ordering; medium for overload predictions.

**Smallest change:** Give the first classroom slice one staged trade-off, such as keeping visible furniture versus buying enough gems for a tempting pull. Show the consequence immediately. Later branches reuse that structure. Define whether zero cash prompts a choice or terminates; terminal states always reach the Receipt. Refusing an offer should not produce a contentless wait.

**Type:** scope deferral — full ladder in v2. **Goals:** G1, G3, G4, G5.

### 9. Random rarity alone leaves many students without a story

**Impact:** Medium — highlights may concentrate in a few lucky runs.  
**Anchors:** `docs/founding/design.md#core-loop`, `#technology`; `docs/project-seed.md#owner-decisions-recorded-2026-10-23`.

**Claim/consequence:** Ten independent 2% draws, without pity, give about an 18.3% chance of at least one legendary. This is an illustration, not Quackpot's predicted distribution. A memorable run cannot depend solely on a legendary. The adopted variety goal is not yet expressed as concrete discoverable events.

**Evidence/confidence:** High for the conditional probability; medium for the staging recommendation.

**Smallest change:** Give each ordinary run one surprise opportunity with a few seeded presentations, plus genuinely rare optional moments. A common duck causing a ridiculous race interruption can be memorable without changing rewards or placement. Keep shared economy rules and log manipulative presentations. Discovery must not require repeat sessions or fast clicking.

**Type:** idea. **Goals:** G1–G5.

### 10. Ending labels can replace reflection with an obvious moral answer

**Impact:** Medium — students may optimize for the apparent teacher answer.  
**Anchors:** `docs/founding/design.md#hard-constraints`, `#endings`, `#classroom-use`, `#the-receipt`.

**Claim/consequence:** Uninstall is explicitly the best ending; that requirement stands. Announcing its superiority before temptation makes the metagame obviously optimal and spoils the confession. Withholding it or forcing a minimum session would instead violate agency. The consequential choice is when evaluation appears.

**Evidence/confidence:** High for the best-ending rule; medium for the classroom prediction.

**Smallest change:** Keep Uninstall visible and usable; reserve “best ending” recognition for the ending. Accurately acknowledge even zero-pull exits. Give other endings complete, non-mocking Receipts. Do not force every technique or prolong an early exit to fill five minutes.

**Type:** owner choice. **Goals:** G1, G3, G4, G5.

## Secondary notes and staging

### First minute and silent-duck scenes

Illustrative budget: 0–10 seconds, own duck at home with default name/look and quick alternatives; 10–18, welcome reveal; 18–27, race payoff; 27–42, spend-or-keep decision; 42–60, next-banner temptation and everyday expense. These are untested targets within the run, not extra time added to fifteen full days.

Use roughly three silent-duck beats, not daily conversations. The opening establishes companionship. The middle selects an actual event: furnishing sold, purchase, or offer declined. The camera reveals an empty couch space, holds on the duck, and the player says, “More room for the collection.” A rare win might instead produce “We are very good at probability.” The ending recalls the actual choice. Do not assert regret or pride as measured emotion.

Allow a few seconds per later scene, permit advancement, and preserve the consequence in reduced motion. An early Uninstall goes directly to its ending; it does not wait for three scenes.

### Juice inventory

Costs are relative effort, not measured hours: **low** reuses groups/transitions; **medium** coordinates art/state/sound; **high** adds a complex interaction. Artwork starts as SVG; ordinary text remains HTML/CSS.

| Element | Addition | SVG/CSS/JS cost | Scope and Receipt |
|---|---|---|---|
| Pull theater | Squash, suspended lid, pause, spring reveal; compact ten-pull summary | Medium: grouped transforms and cancellable sequence | v1; record deliberately manipulative anticipation variants |
| Rarity tells | Shape, color, accent ring and sound signature | Low–medium: shared overlays/classes | v1; record cue/result; never color alone for core information |
| Near-misses | Apparent gold resolves lower | Medium: staged cue tied to determined outcome | v2; log cue rule, never invented “almost won” odds |
| Pity build-up | Counter becomes conspicuous near-full arc | Low: stroke progression and HTML count | v1; log counter, probability and prompt |
| Race feedback | Wakes, overtakes, finish hold, podium bounce | Medium: translated groups and race timeline | v1; faithful results; complex photo finish v2 |
| Currency counters | Transfer trail and brief number roll | Low: display tween | v1; authoritative balance changes once; leftovers auditable |
| Banner timers | Scene signage changes and one salient warning | Low: shared clock/style | v1; log offer/warning/expiry |
| Sound | Pull tension, reveal accent, race finish, sparse ambience | Medium: exported effects/cue coordination | v1 small set; musical layering v2; deliberate pressure cues logged |
| Motion | Bob, squash and wakes | Low–medium: reusable transforms | v1; decoration need not be called manipulation |
| Camera | Room → missing furniture → silent duck | Medium: container transforms/composition | v1 key scenes; reduced motion preserves consequence |
| Screen effects | Celebration ring/confetti; restrained pressured-offer vignette | Low–medium; complex filters can be costly | v1 one celebration; elaborate effects v2; pressure variant logged |

Muted/unavailable audio still conveys core information. Exiting mid-reveal, canceling spectacle, or reducing motion must not cancel the outcome or strand the Receipt. These are lifecycle checks, not added balance work.

### Immersion and all-SVG delivery

Compose one apartment/pond world with a shop object or overlay instead of equally weighted webpage cards. Show wages arriving, furniture disappearing, and the own duck waiting. Keep detailed explanations for the Receipt, which can resemble itemized paper while retaining factual clarity and accessible HTML semantics.

Layered SVG makes accessory variants, palettes, props, signs, and room deterioration cheap. Reuse anchors/draw order; palette changes should not silently change identity, stats, or odds. Repeated reeds, tiles, windows, and furniture groups build environments. Prefer transform animation over complex path morphing where sufficient.

PNG delivery may help dense static backgrounds or baked textures if profiling shows expensive paths/filters. Keep ducks and interactive layers vector where recoloring and motion benefit. PNG trades independent layers and resolution flexibility for a fixed image; it is not inherently smaller or faster. Keep SVG sources. No asset work is authorized here.

## Research and mechanics map

**Research performer:** Read-only delegation to **`gpt-6-luna`**, the requested Luna tier. The tool accepted that exact model selection; this is available selection evidence, not independent service-internals attestation. The primary reviewer is sole report author. The agent saw no other review and changed no files. The parent checked selected source pages. Research preceded findings and excluded sexualized content and character-design analysis.

### Sources and evidence strength

- **R1 — Research, controlled experiments.** Larche et al., *Rare Loot Box Rewards Trigger Larger Arousal and Reward Responses, and Greater Urge to Open More Loot Boxes* (2021). Rarer outcomes produced stronger reported responses; the second experiment also measured physiological anticipation/responses. Stronger evidence for responses in that setting than for classroom enjoyment. It does not isolate a particular animation or prove Quackpot will be fun. [Study record](https://pubmed.ncbi.nlm.nih.gov/31760581/).
- **R2 — Research, qualitative interviews.** Nicklin et al., *“It’s the Attraction of Winning That Draws You in”* (2021), 28 adult UK gamers who had purchased loot boxes. Accounts include opening excitement, progression, social influences, and time pressure. Useful motives, not causal effects or a representative high-school sample. [Full article](https://pmc.ncbi.nlm.nih.gov/articles/PMC8153174/).
- **R3 — Research, motivation-scale development/validation.** Lloyd et al., *Development and Validation of the RAFFLE* (2021). Collection, opening excitement, gameplay enhancement and social pressure are differentiated motives. Self-report does not identify which addition improves this game. It overlaps R2's research program and is not wholly independent corroboration. [Full article](https://pmc.ncbi.nlm.nih.gov/articles/PMC8707097/).
- **R4 — Research, qualitative interpretation.** Woods, *The affective embeddings of gacha games* (2024). The institutional abstract describes collection/curation and mediated self-expression among young Singapore-based players. Used only for attachment/curation mechanics. Contextual evidence; parent verification covered the abstract, not the complete study. [Institutional record](https://ink.library.smu.edu.sg/soss_research/3506/).
- **R5 — Industry practice, implementation documentation.** Heroic Labs' gacha guide documents reward-pool/system implementation. It supports implementation vocabulary, not effectiveness or enjoyment. Its server-based tooling is not proposed here. [Official guide](https://heroiclabs.com/docs/hiro/guides/gameplay-mechanics/gacha/).

Evidence supports plausible pleasures in uncertainty, acquisition, progress, and comparison. Transfer to five-minute fictional-money classroom play is uncertain. Sharing evidence is mainly reported social motivation, not measured neighbor-turning. No successful game's popularity is treated as proof. Staging proposals in this report are design judgments, not research findings.

| Enjoyable mechanic | Evidence | Quackpot coverage | Receipt value of adding/strengthening |
|---|---|---|---|
| Anticipation/reveal | R1, R2 | Rarity and near-miss concept; staging open | Compare staged cue with actual odds; longer delay is not necessarily better |
| Rare surprise | R1 | 2% base legendary and pity | Distinguish luck/guarantee; keep ordinary-run highlights |
| Collection/specific-item pursuit | R3 | Featured duck and completion ending; finite set unclear | Record targets only if actually chosen, plus outcomes/duplicates |
| Progress/functional reward | R2, R3 | Speed, race gems, new banners | Show improvement and later power creep |
| Attachment/curation | R4 | Adopted name/style and silent companion | Recall actual choices/sacrifices without claiming measured attachment |
| Social comparison/status | R2, R3 | Classroom discussion; streamer branch deferred | Comparable categories and visible highlights without accounts |
| Novelty/limited opportunity | R2 | Three-day banners and urgency | Log offer/time pressure; cosmetic novelty must not fabricate scarcity |
| Progress toward desired reward | R5 practice plus design inference | Pity explicit, reachability unknown | Show guarantee and sunk-cost prompts; threshold enjoyment is unproven |

## “Did you see that?” candidates

Proposals, not a requirement to ship all. Budget one ordinary-run surprise opportunity plus optional rarities. Cosmetic events give no cash or speed bonus; economic events use existing rules.

| Moment | Where it fires | Theme / Receipt | Cost / scope |
|---|---|---|---|
| Welcome duck lands dramatically; tiny hat arrives late | First reveal | Celebration; disclose staged welcome results/cues if used | Low, v1 |
| Common duck crosses finish backward; board remains correct | First/second race, seeded presentation | Neutral delight/comparison; no manipulation label required | Low–medium, v1 |
| Rival arrives with absurd oversized speed attachment | Later-banner race | Power creep, actual performance comparison | Low art/medium staging, v2 |
| Camera reveals missing couch, then silent duck | First furnishing sale | Sacrifice and spending; no fabricated regret | Low–medium, bounded v1 option |
| Foreground reed reveals a secret accessory | Optional pond discovery, keyboard equivalent | Novelty, cosmetic only, excluded from required collection | Low, v1 candidate |
| Gold theater resolves into rare duck with cheap gold hat | Selected near-miss pull | Exact misleading cue and real outcome | Medium, v2 |
| Fictional streamer overlay celebrates a tiny benefit enormously | Streaming branch after spending | Social proof/status, trigger and benefit logged | Medium, v2 |
| Quiet ordinary room and own duck after Uninstall | Any exit | Best-ending recognition and tonal release into Receipt | Low–medium, v1 |

Use a small local event vocabulary: trigger, eligibility, one-time flag, presentation, allowed existing effect, Receipt category. Provide an ineligible-event fallback. No discovery may be needed to pay rent, finish, or open the Receipt. Rare streamer events remain inside that branch. Different stories converge on exposure, decision, outcome, and actual cost; not every run must exhibit every technique.

## Tooling proposals

No external library is recommended at this stage. Shared SVG groups, CSS transitions, a small JavaScript sequence layer, and exported sound effects suffice to test these proposals; a framework has not demonstrated value yet. This is a scope judgment, not a prohibition.

There is therefore no proposed third-party payload, licence, maintenance status, or CDN dependency to evaluate. The existing jsfxr workflow was not audited; manual generation alone is not provenance/licence analysis. Source notes remain an open seed question.

The policy conflict remains: runtime CDN loading makes network requests and permits CDN visitor logging, affecting hard constraint #2. Build-time bundling can ship local assets but adds a build step, affecting #7. Neither policy changed. A later dependency proposal should state pinned version, measured compressed payload, licence, maintenance evidence, and loading mode before owner selection.

## Methodology and limitations

Read all four required files using `git show` at the resolved baseline commit. A scoped diff found those files unchanged in the current checkout; conclusions nevertheless target the requested baseline. No other reviewer report was consulted. No repository edit, packet/status change, remote configuration, commit, or push occurred.

Deep coverage: duration/scope, race agency, Receipt truth, own-duck placement, collectible identity, and branch pacing. Swept coverage: SVG delivery, accessibility equivalents, sound, library policy, terminal routing. No game, rendered scene, device, assistive technology, audio mix, or economy was tested. Production costs and emotional predictions are estimates. Research is bounded, not systematic.

Numerical reasoning is direct draft arithmetic plus a conditional independent-draw example. The existing four broad economy checks remain the entire tuning budget. Focused lifecycle examples—exit during reveal, zero cash on an expense, ineligible secret, banner transition near a terminal event—can check Receipt continuity without exhaustive per-variant fairness simulations.

The report contains no participant data and is saved outside the repository in the provider workspace. No repository file was written. Recommendations do not grant development, tooling, publication, or gate authority.

## Most important open questions

1. Is v1 a mechanism prototype or the classroom experience, and does its week mean seven or fifteen days?
2. Which clock policy includes customization/spectacle while preserving decision windows and immediate exit?
3. Is racing automatic, and where does consequential player agency live?
4. What pity carry-over rule, finite collection set, and duplicate identity should broad tuning evaluate?
5. Which single sacrifice anchors the first slice, and what happens when cash first reaches zero?
6. Is the own duck an unsellable companion, or is selling it a separately approved branch?
7. Which cues count as manipulation, and will the Receipt distinguish base/conditional odds, observed behavior, and player interpretation?
