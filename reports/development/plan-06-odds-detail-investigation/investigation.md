# Optional odds detail: investigation for owner review

2026-10-31 · Report-only recommendation; no wording or rule is adopted by this report.

## Current evidence and limits

The playable slice has a promotional free ten-pull, not a demonstrated paid-pull or rotating-banner implementation. `src/ui/gacha-view.js:151` shows Common 80%, Rare 18%, Legendary 2%; `src/core/game-engine.mjs:159` commits ten ordered draws from the first roster before reveal, using `calculatePreDrawOdds` each time, logging the odds and `advancesPity: false`. The loop does not change pity, including on a Legendary. On an ordinary fresh state (`pityCount: 0`), all ten therefore use 80/18/2. This is a free-opening exception; do not promise that it progresses a future guarantee.

The engine's calculation at `src/core/game-engine.mjs:63` has a 2% Legendary base, a linear rise starting at draw 35 and 100% at draw 50; the remaining probability is split between Common and Rare in the 80:18 ratio. This function's defaults are implemented calculations, not proof that eligible production draws can reach those states or that those thresholds are final owner policy. The separate `sim/model.mjs:20` and `:94` uses configurable assumptions; `:253` supports carry or reset, with carry as a simulation default, and `:325` advances eligible pity and resets it on a Legendary. Neither the simulation default nor a numerical example decides banner policy. DECISION-013 selects normal pity advancement and Legendary reset for the bounded 6-Down trial contract, while production lifecycle and wider rules remain unverified.

`src/core/receipt.mjs:44` projects each committed draw's logged pre-draw odds, even when the outcome was not revealed; `src/ui/receipt-view.js:111` displays those odds per ledger row, rounded to four decimal places. This establishes the current ledger path, not optional-detail evidence: no detail availability/open/content events were found in the traced production flow. `docs/founding/design.md:48,78,210` and owner triage D3/T6/T7 preserve conditional odds, optional extra detail and unresolved banner carry/reset. O1 requires separate displayed evidence, player actions and a question about impact; do not infer motive.

## Two optional contents

Both options leave the actual next-draw rarity odds, price and applicable purchase terms visible without opening the detail, alongside the action they qualify. A batch must say that later draws can have different odds and retain each draw's actual odds in the Receipt; do not present a single next-draw figure as every draw's probability. The optional material is factual purchase context, not a live explanation of manipulation or a claim about player behavior. Place critical reflection on the Receipt.

**A — “Odds details”: base and rule summary.** Example text, conditional on eventual rule approval: “Base chance: Common 80%, Rare 18%, Legendary 2%. Legendary chance rises from eligible draw 35; an eligible draw 50 is guaranteed Legendary. The counter resets after an eligible Legendary. [Banner policy, once selected.]” The next-draw probabilities remain outside the disclosure. Compact and stable, but the player must connect the schedule to their own current state. A full schedule or exact formula would require additional approved copy if this option is expected to explain every intermediate value.

**B — “Odds details”: current-state explanation (recommended).** Example text, conditional on the actual eligible rule and state: “Base Legendary chance: 2%. For the next eligible draw, your chance is [current]%. [State sentence.] [Banner policy, once selected.]” State sentences: “The chance is at its base rate.” / “The chance has increased for this draw.” / “This draw is guaranteed to be Legendary.” Include the other rarity odds visibly near the purchase, not only here. This ties base and conditional chance together without giving advice or analyzing pressure. It needs state-specific copy, accurate refresh when the state changes, and careful treatment of non-advancing promotional draws. No wording about a featured identity follows from a rarity guarantee.

The promotional version should instead say: “These free draws do not advance the pity counter.” Show it only if the actual draw contract confirms it, and do not imply the free pull can reach draw 50. If a rule, banner outcome, or exact value is unknown, do not substitute either speculative banner sentence into live purchase copy; resolve the rule before implementation.

## Worked states and banner alternatives

Illustrations below apply the engine function's current defaults to **hypothetical eligible draws**, not states reachable in the existing promotional flow. Counter means eligible non-Legendary draws since reset, and draw number is counter + 1. Percentages total 100. Values for A/B are derived from the same state, not independent rules.

| State | Counter → next draw | Base C/R/L | Current C/R/L | Candidate B sentence |
|---|---|---|---|---|
| Before soft pity | 0 → 1 | 80/18/2% | 80/18/2% | “The chance is at its base rate.” |
| First soft-pity draw | 34 → 35 | 80/18/2% | 75/16.875/8.125% | “The chance has increased for this draw.” |
| Guarantee | 49 → 50 | 80/18/2% | 0/0/100% | “This draw is guaranteed to be Legendary.” |
| Before banner change | 34 → 35 | 80/18/2% | 75/16.875/8.125% | Current state as above. |
| After change, **if carry** | 34 → 35 | 80/18/2% | 75/16.875/8.125% | Conditional copy: “Your counter carries to the new banner.” |
| After change, **if reset** | 0 → 1 | 80/18/2% | 80/18/2% | Conditional copy: “Your counter resets when the banner changes.” |

Carry and reset are rival unselected policies, not promises. Exact banner scope, transition timing, eligibility and whether a guarantee covers rarity or a featured identity must be resolved before accurate transition copy. The simulation's featured-rate model is not a production promise. A Legendary on an eligible draw would reset the simulated counter; the next draw in a batch would then use its new state. A guaranteed rarity is not necessarily a guaranteed new duck.

## Source-to-copy and evidence map

| Source or contract | Supported proposal / qualification | Evidence needed for a future Receipt |
|---|---|---|
| `game-engine.mjs:63–83` calculation; `gacha-view.js:156–159` current labels | Base 80/18/2 in this slice; distinguish base from state-dependent next draw. Future numbers must come from the active rule, not static copy. | Record actual displayed values and version/state; do not infer a display merely from a calculation. |
| `game-engine.mjs:159–203` opening and logged `draw_committed` | Free opening does not advance pity; outcome and actual odds committed before reveal. | Keep per-draw logged odds and committed versus revealed status. |
| `sim/model.mjs:94–119,325–374`; `design.md:48` | Hypothetical ramp and eligible reset; thresholds and scope await owner rule. | Capture rule/version and pre-draw state with each applicable draw; Receipt uses stored odds even if detail was never opened. |
| `sim/model.mjs:253–257`; triage T7 | Both transition sentences are conditional alternatives; simulation default is not owner policy. | If implemented, log banner transition, relevant before/after counter and selected rule, without assuming one. |
| `receipt.mjs:44–61`; `receipt-view.js:111–135`; O1 | Each applicable ledger row retains actual pre-draw odds regardless of disclosure use. | Preserve source sequence links and the displayed/action/reflection distinction. |
| D3 and `design.md:78` | Optional information can be available without being opened. | Separate availability, opening and content-display records as below. |

## Disclosure interaction and Receipt design

Use a native button labelled “Odds details”, associated with a disclosure region and its expanded state. Tab reaches it in logical order; Enter and Space toggle it; visible focus and the expanded/collapsed state are exposed to assistive technology. The revealed text follows the button in reading order, can be closed with the same button, and does not steal focus or require motion, color or a pointer. Keep readable text at narrow widths and zoom; verify with keyboard and screen reader during a separately authorized implementation. Announce changed values accessibly without repeated disruptive announcements. The odds and terms needed for the purchase remain available without opening it.

Future local append-only evidence should distinguish: (1) **available/shown**, when the control is actually rendered and available, with banner, context, timestamp/sequence and copy/rule version; (2) **opened**, an actual player activation associated with that instance; (3) **content displayed**, recorded only when the region actually renders, with exact displayed values/text or an immutable reconstructable snapshot, rule version and state. A close/reopen or a state change while open needs a new display snapshot when the shown content changes. Do not equate an activation with successful content display or claim the player read or understood it. Use existing local clock/sequence conventions, avoid unnecessary personal data, and design event volume and restore/deduplication in the follow-up. O1 Receipt example: “We displayed: Odds details was available; the detail was opened and showed [snapshot]. You did: opened it [count] times. Did this information affect your decision?” If it was never opened, say availability was shown and no opening was recorded; do not claim detail content was displayed. The ledger remains independent of all three events.

## Comparison and owner decisions

Rival hypotheses with falsifiers: **H1:** A's base plus schedule is sufficient; falsified if substantially more participants using A than B confuse the current chance or batch progression in the same scenarios. **H2:** B's current-state explanation improves comprehension; falsified if B does not improve those answers or increases mistaken beliefs about guarantees relative to A. **H3:** extra detail adds confusion; falsified if opening either option improves or preserves comprehension relative to visible odds alone without increasing guarantee errors. These are testable predictions, not measured outcomes.

For a future bounded, accessible, counterbalanced comprehension comparison, use identical fictional states and visible odds for A, B and a no-extra-detail baseline; randomize order/assignment, allow normal optional opening, and record whether opened. Ask separately: “What is the Legendary chance on the next draw?”, “Is that the base rate?”, “What is guaranteed, if anything?”, “Will all ten draws necessarily have the same odds?” and, with explicitly stated carry or reset rules, “What happens to the counter after this banner changes?” Include before-soft, first-soft, guarantee, and both explicitly labelled transition conditions. Compare correct answers and mistaken guarantee/featured-identity claims by condition, including non-openers; a small exploratory sample cannot establish population effects. Avoid treating speed or opening as evidence of understanding.

Owner choices: (1) A, B, another concise content, or no additional content; (2) button label and placement; (3) exact wording, including how much schedule detail is useful; (4) final eligible thresholds/ramp, reset and promotional exceptions, banner carry/reset/scope and featured-versus-rarity terms through the proper rule process; (5) whether to commission the comprehension comparison. Recommend B because it connects the current probability to the base with the least arithmetic; A is shorter but requires more interpretation. Rule selection and factual terms must precede implementation, and root/owner review remains outstanding. A bounded follow-up should implement only selected copy and evidence semantics, verify per-draw Receipt accuracy and accessibility, and cover saves, batch pulls and banner transitions once those flows exist.
