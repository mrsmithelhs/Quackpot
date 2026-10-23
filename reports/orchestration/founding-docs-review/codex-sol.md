# Quackpot founding design review — codex-sol

## Executive summary and coverage

Quackpot has a strong premise: make the duck chase feel rewarding, then let a candid Receipt show how that feeling was produced. The draft specifies its economy and manipulation catalog more clearly than its five-minute dramatic arc. The main experience risks are timing, solved race choices, and persuasive effects the Receipt cannot accurately explain. These findings are claims for owner triage, not approval to develop.

Coverage at commit f0fe34e: [x] README.md, [x] docs/project-seed.md, [x] docs/founding/design.md, [x] reports/orchestration/founding-docs-review/baseline.md. I read all four in full. I treat the later owner decisions as adopted direction: all art begins as SVG source, immersion and vibe take priority, tooling proposals are open, the player has a named duck and silent conversations, and the shared review goals apply. The draft's generated backgrounds and missing own-duck scenes await reconciliation; they are not defects.

## Ranked findings

### 1. The five-minute clock lacks a scene budget — high impact

**Anchor:** docs/founding/design.md, “Life metagame” and “The five-minute experience”; docs/project-seed.md, “Owner decisions recorded 2026-10-23.” **Claim and consequence:** Fifteen 20-second days consume exactly five minutes before duck setup, reveals, races, conversations, or Receipt. Rent first comes on day 7, about 140 seconds in. The first minute may deliver three races but no rent trade-off. A live clock could punish students for watching the spectacle. **Evidence/confidence:** Direct arithmetic, high confidence in the scheduling conflict; actual play duration unknown. **Smallest change:** Define action-paced day advancement and storyboard a first reveal by about 30 seconds, a consequential choice by about 60 seconds, a midpoint squeeze, and the Receipt inside the class bound. Test with a stopwatch. **Type:** defect. **Goals:** 1, 3, 4, 5.

### 2. The first minute needs a playable hook — high impact

**Anchor:** docs/founding/design.md, “The five-minute experience” and “Core loop”; docs/project-seed.md, “Player's own duck.” **Claim and consequence:** Free gems, a pull, and an automatic best-duck race may be charming but leave the student watching. The owner-adopted duck setup creates attachment only if it matters immediately. **Evidence/confidence:** Explicit sequence and best-duck rule; interface unspecified, medium confidence. **Smallest change:** Name and style the familiar duck in a few taps; race it once against an ostentatious rival; offer the free pull after the loss. Use a big reveal and one comic silent-duck beat without opening exposition. **Type:** idea about placement of adopted direction. **Goals:** 1, 2, 5.

### 3. “Race your best duck” can solve the loop — high impact

**Anchor:** docs/founding/design.md, “Core loop” and “Life metagame.” **Claim and consequence:** Rarity controls speed, later banners add about 15%, and the best duck auto-races. The practical strategy may be pull for speed, auto-race, repeat. The extra shift's “slower reflexes” has no defined player action to affect. **Evidence/confidence:** Direct rule reading; medium confidence because race controls are absent. **Smallest change:** Give one readable pre-race choice, such as loved duck for a modest bond reward versus a faster duck for placement. Make fatigue affect a real small action or remove the reflex claim. **Type:** defect in interaction definition, with an owner choice on the exact action. **Goals:** 1, 2, 3.

### 4. The squeeze may be too weak or too abrupt — high impact

**Anchor:** docs/founding/design.md, “Core loop” and “Tuning.” **Claim and consequence:** Stronger pulls win more gems and fund further pulls, but gift, wage, payout, and expense amounts are missing. Fifty single pulls at 160 gems cost 8,000 gems before bundles or earnings; pity could be unreachable in five minutes. The opposite risk is a self-funding win loop. **Evidence/confidence:** Arithmetic and missing values are direct; actual economy unknown. **Smallest change:** Use planned broad headless checks to inspect free pulls, first shortfall, pity visibility, and one credible “rent or pull” moment. Review a few human-readable seed traces for choice quality. This is a guardrail, not exhaustive per-variant balancing. **Type:** simulation question. **Goals:** 1, 4, 5.

### 5. V1 has no declared complete classroom arc — high impact

**Anchor:** docs/founding/design.md, “Hard constraints” #4, “Scope,” “Endings,” and “The Receipt.” **Claim and consequence:** The product promises about 15 days; v1 specifies one in-game week, three of eight techniques, and no full ending set. A one-week slice may reach the Receipt before a substantial reversal or the strongest confession. **Evidence/confidence:** Direct scope comparison, high confidence. This does not require all v2 content in v1. **Smallest change:** Declare a v1 ending and Receipt at a known duration, with three techniques selected for a rise and reversal. Keep the 15-day full-game promise separate until demonstrated. **Type:** defect in scope definition. **Goals:** 1, 3, 5.

### 6. Every persuasive cue needs a Receipt trace — high impact

**Anchor:** docs/founding/design.md, “Manipulation catalog” and “The Receipt”; docs/project-seed.md, “Shared review goals.” **Claim and consequence:** New spectacle or event variants can influence a choice without being accounted for. Gold glow is especially hard to describe accurately when pity odds change; a rare fakeout or streamer surge could be exciting yet absent from the confession. **Evidence/confidence:** Catalog and Receipt fields are explicit; specific new events are proposals, medium-high confidence in the gap. **Smallest change:** Give each persuasive cue an event record: day, cue ID, banner and odds state, actual outcome, and any consequential action. Name a technique only if its cue fired. Summarize counts and timing plainly. **Type:** defect in a stated invariant. **Goals:** 2, 3, 4, 5.

### 7. The player's own duck needs a metagame stake — medium-high impact

**Anchor:** docs/project-seed.md, “Player's own duck”; docs/founding/design.md, “Life metagame” and “Endings.” **Claim and consequence:** The adopted companion can make the chase emotional, but current sacrifices concern furniture, lunch, and loans. A faster gacha duck displaces the named duck with no keep-or-trade decision. **Evidence/confidence:** Direct comparison of adopted direction and draft choices; medium confidence about attachment in actual play. **Smallest change:** Protect the named duck's slot and offer one optional choice to keep it or trade it for a tempting banner advantage. Change one silent scene and one Receipt line; never make either path block progress. **Type:** idea. **Goals:** 1, 3, 5.

### 8. Variety needs bounded event slots — medium-high impact

**Anchor:** docs/project-seed.md, “Shared review goals”; docs/founding/design.md, “Core loop” and “Endings.” **Claim and consequence:** Variable pulls are present, but few authored discoveries exist. Runs may differ only in luck; unconstrained surprises could erase rent pressure or misstate the Receipt. **Evidence/confidence:** Current mechanics and owner goal are explicit; prospective outcome, medium confidence. **Smallest change:** Try one early oddity, one midpoint temptation, and one late reversal per run, selected from a small event deck. Tag each to a catalog technique, bound its reward, guarantee a path to Receipt, and check representative seed traces for reachability and accuracy. Keep number tuning at the planned broad checks. **Type:** idea with guardrail. **Goals:** 2, 3, 4, 5.

### 9. Silent-duck scenes lack rhythm and run awareness — medium impact

**Anchor:** docs/project-seed.md, “Player's own duck”; docs/founding/design.md, “The five-minute experience” and “The Receipt.” **Claim and consequence:** Recurring conversations are adopted, but frequency and triggers are not set. Fixed daily dialogue would interrupt pulls; generic replies cannot reflect different choices. **Evidence/confidence:** Owner decision explicit, scene schedule absent; medium confidence. **Smallest change:** Prototype three short, skippable scenes: after first upgrade, after first sacrifice or refusal, and just before Receipt. Use a held silent beat and a small camera shift, then a brief player reply. Select lines from actual events, with a neutral fallback. **Type:** idea. **Goals:** 1, 3, 5.

### 10. Some Receipt copy claims more than the game observes — medium impact

**Anchor:** docs/founding/design.md, “Manipulation catalog,” “The Receipt,” and “Hard constraints” #4. **Claim and consequence:** “You opened the game on 15 of 15 days” treats accelerated in-game days as real logins. “You spent $38 chasing pity” assumes motive. “The starter pack made $49.99 look reasonable” asserts a mental effect the game cannot measure. That weakens the confession's credibility. **Evidence/confidence:** Exact draft examples, high confidence. **Smallest change:** Report observable events first: daily bonuses claimed within this session, gem purchase while 12 pulls from pity, and a displayed 400% claim before the $49.99 offer. Then label the intended technique as interpretation. **Type:** defect in accuracy. **Goals:** 3, 5.

## Secondary notes: juice, immersion, and SVG art

The student-facing game should have places and beats: duck on the desk, pond race, bills crowding an apartment, intrusive shop, then a quiet Receipt. Short labels and an accessible reduced-spectacle presentation can preserve core information while the main view favors immersion.

| Cue | Value and Receipt link | Rough SVG/CSS/JS cost | Timing |
|---|---|---|---|
| Pull reveal theater | Anticipation and payoff; log cue and result | Medium: SVG layers, CSS transitions, JS phases | v1 |
| Rarity tells | Quick status recognition; separate look from odds | Low: palette, silhouette, sound motif | v1 |
| Near-miss gold | Shock and discussion; count every false tell | Low-medium: controlled cue and event log | v1 only with Receipt explanation; else v2 |
| Pity build-up | One-more-pull tension; show actual odds state | Low-medium: counter and animation | v1 |
| Race feedback | Make speed change legible; replay decisive finish | Medium: SVG lanes, impact frame, results | v1 |
| Currency counters | Make gain and bill loss felt together | Low: number tween and paired state | v1 |
| Banner timer | Urgency; log countdown seen at purchase | Low: local clock and cue log | v1 |
| Sound | Reveal, race, bill, then silence; mute works | Low-medium: authored effects and playback | v1 |
| Motion, camera, screen effects | Rare spectacle and visual jokes; reduced motion retains result | Medium: SVG groups and transforms | one hero beat v1; expand v2 |

All art begins as SVG source under the adopted decision. Layered bodies, hats, accessories, and palette swaps can make many combinations cheaply, but a curated mechanically identifiable subset makes “every duck” countable. SVG suits apartment depletion, bill overlays, environments, characters, and simple motion. Render a complex static background or repeated decorative layer to PNG only if a measured browser test shows a benefit; retain SVG source. Keep ordinary text in HTML/CSS for scaling and assistive technology.

## Bounded research and mechanics map

A read-only **gpt-6-luna (Luna)** subagent performed the required mechanics research. Luna was available, so no higher-tier substitute was used. I reviewed the returned sources and applied the map to the baseline; I alone wrote this report. The sources are a [qualitative interview study of loot-box buyers](https://pmc.ncbi.nlm.nih.gov/articles/PMC8153174/) (research; moderate for reported motivations), an [adolescent loot-box motive and RAFFLE study](https://pmc.ncbi.nlm.nih.gov/articles/PMC8707097/) (research; moderate for some adolescent motives), and a [rare-reward response study](https://pmc.ncbi.nlm.nih.gov/articles/PMC7882574/) (research; limited for enjoyment because arousal or urge is not pleasure). These do not establish that a five-minute classroom simulation reproduces commercial-game responses. No game's success is treated as proof. Sexualized content and character design were excluded.

| Mechanic | Evidence strength | Quackpot status | Would strengthening it serve the Receipt? |
|---|---|---|---|
| Anticipation and reveal | Interview research, moderate for reported excitement | Pull and rarity yes; theater unspecified | Yes, if reveal cues and outcomes are logged |
| Collection | RAFFLE research, moderate for some adolescents | Yes; collection boundary unclear | Yes, with visible ownership and end cost |
| Functional progression | Interview research, moderate for valued progress and pressure | Speed to gems to pulls yes | Yes, with before/after race placement |
| Attachment | Interview research, limited and indirect | Named duck adopted; game role open | Yes, if keep or trade changes story and Receipt |
| Rare surprise | Interview and rare-reward research, moderate for interest/arousal; weak for broad enjoyment | Legendary and pity yes; authored events open | Yes, with bounded rewards and event traces |
| Near misses and scarcity | Research describes engagement and urge, not reliably delight; limited | Glow and timer in catalog | Yes as analyzable manipulation, not presumed pleasure |
| Social comparison | Interview research, limited for status and competition; sharing untested | Classroom discussion yes; streamer branch v2 | Yes through different stories and comparable Receipt fields, without class data collection |

The research supports anticipation, collection, and progression as plausible pleasures. Quackpot has those foundations. Attachment and talkable surprise are promising design hypotheses to test, not established effects here.

## “Did you see that?” candidates

- **First minute:** the familiar duck nearly wins, then a sponsored rival rockets past; the free pull appears after the sting. Tag: progression pressure and power creep.
- **Early or middle pull:** a plain-looking accessory unfolds into a spectacular rare reveal while the pond reacts. Tag: anticipation; record cue and true odds.
- **Mid-run bill:** a secret accountant duck appears in the rent envelope and leaves a tiny, bounded find. Tag: currency framing; never erase rent pressure.
- **Middle streamer moment:** a fictional streamer echoes the player's largest purchase while the apartment visibly empties. Tag: social proof or anchoring, only if cataloged on the Receipt.
- **Final third:** a near-win race freezes, a banner timer pulses, and the familiar duck looks toward the rent envelope. Tag: near miss and FOMO; preserve a real refusal path.
- **Receipt:** the loud game falls silent; the named duck sits beside a miniature timeline that differs for keeping, trading, debt, and refusal. This is payoff, not another prompt.

These are candidates. Hidden SVG layers and palette-swapped ducks are cheap; branches and alternate endings need more state, dialogue, and Receipt text. Every variant needs a normal path to the Receipt and bounded economic effect.

## Tooling proposal

**Vite for development and build, conditional on GATE-53B.** It speeds multi-module scene/state work, local iteration, asset references, and reproducible GitHub Pages builds. **Runtime library payload: 0 KB**; Vite is a development dependency and emits static files, while Quackpot's own JS/SVG size must be measured in a spike. Licence: MIT ([Vite licence](https://github.com/vitejs/vite/blob/main/LICENSE)). Maintenance: active release and support policy ([Vite releases](https://vite.dev/releases), checked 2026-10-23). Delivery: bundled at build time, no runtime Vite CDN request. Its [static deployment guide](https://vite.dev/guide/static-deploy.html) describes building for GitHub Pages. This proposal changes hard constraint #7's no-build-step wording but need not change #2's no-runtime-network rule. A runtime CDN library would change #2 and could log visitor requests; it needs a separate owner decision. Native CSS animation, SVG transforms, and Web Audio can support the first slice without a runtime library.

## Methodology and limitations

I read the four required files at f0fe34e in full and did not consult another review. I compared explicit mechanics with later owner decisions, calculated timing and pity cost, and used the bounded research above. I did not run a game, simulate the economy, inspect assets, or edit repository files. This is a review of design material, not a readiness verdict. Confidence is lower where play feel depends on a prototype. Broad headless checks plus representative traces are the intended validation scale; exhaustive variant balancing is outside scope.

## Most important open questions

1. Does the five-minute classroom bound include setup and Receipt?
2. Is v1 a complete one-week arc or a narrow 15-day arc?
3. What does a player actually do in a race, and when does the named duck matter more than the fastest duck?
4. Which sacrifice or refusal should most students encounter by the midpoint?
5. Which visual and audio cues count as manipulations requiring Receipt records?
6. What is the smallest event deck that makes runs talkable without bypassing the squeeze?
7. Will GATE-53B adopt a build step while keeping all shipped runtime assets local?

