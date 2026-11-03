# Plan 54 comparison proposal — draft pending consultation and owner decision

This proposal is for an isolated comparison, not an adopted game design. Baseline and source pins are in `current-state.md`. Three models are deliberately distinct; their examples and copy are illustrative and do not set prices, awards, banner policies, or new stats. Consultation and owner disposition will be added before this draft is offered for approval.

## Candidate structures

| Model | Player's next question and lean path | Optional spending temptation | Cost and weakness |
| --- | --- | --- | --- |
| Collection-led: **My flock** | “Who have I met, and which identity am I hoping to find?” Browse the existing Duck-Dex, enjoy known characters, and choose a missing identity as a personal aim. An ordinary race can earn Gems; a duplicate adds Down under current rules. No completion prize or set bonus is presumed. | A bundle could bring the next existing pull closer; no purchase is needed to browse or choose a racer. | Six identities can exhaust discovery quickly; a target may be inaccessible or frustrating, and a collection target alone may not make a return meaningful. More identities need writing/art and future odds/economy work. |
| Competition-led: **One more pond story** | “Which duck and pace will I try next?” Treat the next existing race as the central occasion; choosing among rested and tired owned ducks and watching actual results creates a small recurring story. Use existing race Gem awards and optional 3-Down upgrade. No invented league, rival rules or rewards are assumed. | Buy Gems toward an existing pull in hopes of another racer; the upgrade consumes earned duplicate Down, not cash directly. | A stronger rested duck can dominate choices; a small roster makes variation thinner. Copy can frame rivals but cannot claim a persistent rivalry or fair match without a mechanism. |
| Event-led: **Today's pond bulletin** | “What is happening at the pond?” A proposed fictional bulletin frames an ordinary pull/race with a different occasion and characters. Reading and browsing remain free. The lean comparison uses editorial framing only; no extra race, reward or deadline. | A fictional promotion could draw attention to the existing offer, with actual costs and odds; no event purchase is required. | Even copy-only occasions need ongoing authorship and a truthful availability rule. An event with exclusive rewards, expiry or altered fields is a separate mechanism with substantial economy, clock and evidence implications. |

Initial recommendation: test competition-led as primary, with collection as a personal attachment and occasional event flavor. It gives a repeatable decision using existing race and rest mechanics and does not depend on completing a six-item catalog. It may fail if the race choice is obvious, the presentation repeats, or the player prefers discovery to racing; the comparison must allow either rival to win. The smallest potential integration is a contextual next-race invitation using actual owned/rest state, subject to a later source and evidence gate; it is not a commitment to create a league or add rewards.

## Matched comparison situations

Each row uses the same illustrative balances, roster and allowance across all three models. Actual simulated outcomes must not be implied. These are scripted snapshots, not recorded saves.

| Situation | Collection-led question | Competition-led question | Event-led question |
| --- | --- | --- | --- |
| Early: welcome ten-pull, two owned common identities, duplicates, no spare cash; pull used, race ready | Inspect new identities and pick a missing one to hope for; duplicates are Down, not a new identity. | Pick one of the owned ducks and pace for the remaining race; optional upgrade only if actual Down is sufficient. | Read a proposed pond bulletin and enter the same remaining race or leave; bulletin changes framing, not odds or prizes. |
| Return: three owned, previous racer tired, 150 Gems, rent approaching; pull and race ready | Browse collection and save Gems rather than promise an unaffordable single. | Compare a tired previous racer with a rested alternative; race can earn an actual placement award but no award is guaranteed. | Read an occasion and choose the same race or leave; no ticking deadline is implied. |
| Later: five owned including legendary, repeated duplicates, 3 Down, social visit competes with play; race already used | Enjoy existing collection or wait for an opportunity; a missing identity is not guaranteed. | Inspect rest and plan a future race; the consumed race cannot be replayed for another award. | Read the bulletin and defer it; it grants no extra session or social exemption. |
| Optional-spend contrast: same relevant state, 150 Gems and sufficient fictional cash | Compare keeping cash with the currently visible 330-Gem/$4.99 bundle and its implications; no forced transaction. | Same offer, same wallet, same race choices. | Same offer, contextual promotional copy only; no exclusivity or invented reward. |

Each presentation must show the actual remaining allowance and a free way to leave or inspect. If illustrative fictional cash is needed, label it as an example and show competing obligations; never suggest that 150 Gems buys a 160-Gem single. If a 6-Down action is shown at all, label it owner-selected but not implemented, and do not conflate it with the live baseline. Successful extra play must use the shared commitment and disclosed consequences; this preview does not implement that scheduler.

## Hypotheses and discriminating observations

| Hypothesis | Observation that would challenge it |
| --- | --- |
| Collection creates a personal next-visit goal with the current catalog. | A reviewer feels finished after seeing the small roster, or finds the missing duck only an abstract checklist with no interesting decision. |
| Rest and pace create an interesting recurring choice without added systems. | One duck/pace remains the obvious choice across the matched situations, or the same race framing feels repetitive despite the choices. |
| A bulletin adds variety at modest cost. | It takes several clocks or new rules to understand, requires exclusive rewards to matter, or looks interchangeable with cosmetic wording. |
| A free path remains meaningful under limited cash. | The player sees no desirable action after a duplicate or a used allowance except buying or sacrificing a life obligation. |

These are interview/clarity checks, not measures of population retention or educational effect. Record what the owner actually notices, competing explanations and untested alternatives; do not convert preference into a falsified universal claim.

## Exact proposed comparison mechanism

After approval, create `comparison/index.html`, `comparison/comparison.css`, `comparison/comparison.mjs` and `comparison/scenarios.mjs` under this report folder. A compact reviewer control chooses one matched scenario and one model; a student-facing phone composition shows only that scenario's in-world copy, factual illustrative balances, allowance and plausible choices. Adjacent reviewer notes identify what is proposed and what would change. Native buttons, visible focus, semantic headings, keyboard operation and narrow layout are required; static text is sufficient and there is no simulated engine, timer, purchase, persisted save or random roll. A plain-language textual comparison is available without motion. Avoid exposing the reviewer annotations inside the fictional game surface.

| Classification | Content in comparison |
| --- | --- |
| Selected/preserved | Five-slot/session contract; free navigation; existing six identities and rest, race/pace, duplicate conversion and 3-Down upgrade; prices and odds when shown; truthful result evidence and immediate exit in eventual port. |
| Context | Plan 12 opening; Plan 17 selected 6-Down terms; Plans 21–23; Plan 52 in-flight integration; Plans 11/15 own visual composition and reveal theater. |
| Placeholder | Scripted examples, sample balances, in-world bulletin/rival/copy, all nonfunctional mock controls and fictional state. No real save, log, draw or payment is produced. |
| Deferred | Banner rotation, expiry, carry/reset, new identities, event/rival mechanics, rewards, league, set effects, power curve, economy calibration and production integration. |

## Prebuild decision batch

Approve or amend the three structures, matched scenarios, and the lightweight comparison mechanism above. The preliminary competition-led recommendation is a hypothesis to compare, not a request to adopt it now. Approval permits report-local comparison construction and iterative experience review only; production integration and new economic rules remain separate gates.
