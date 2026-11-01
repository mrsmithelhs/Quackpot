# W1 — Blind provenance-card test (owner-approved 2026-11-01)

## Question
Would a preview provenance card plus a "surfaces in path" list, written from only the information available before integration, have flagged the defects later found by the owner or root? Downgrade threshold (set in `checkpoint.md` before running): the card catches ≤1 of the reachable items.

## Method
- Two Haiku helpers (`general-purpose`, `model: haiku` requested; served model not observable).
- Each was restricted by instruction to `git show <cutoff>:<path>` reads and forbidden to read later history:
  - Plan38 cutoff `3f99a18` (parent of the first integration `9bf4432`).
  - Plan23 cutoff `57756ff` (the gate-approval commit; first production commit `2609032` came later).
- The lead wrote the scoring list `w1-rubric.md` after dispatch and before reading any output. It includes *control* items: owner direction changes made after the cutoff, which a card should not predict.
- Blindness was enforced by instruction only, not by sandbox.
- The Plan23 helper reported briefly writing four temporary copies of cutoff files into the session scratchpad and deleting them. A `find` afterwards showed no leftovers. Repo unchanged (`git status` clean, HEAD `383765b`).

## Scores (1 caught / ½ partial / 0 missed)

### Plan38 card
| # | Item | Score | Card evidence |
|---|---|---|---|
| 1 | Prototype HUD/Receipt/races are stand-ins | 1 | Placeholder column: "Stand-ins: Save, Settings, Uninstall, Receipt, races, gacha" |
| 2 | New session hub needs equivalent presentation | 0 | Not foreseeable at cutoff: the `life_phone` hub came from the later amendment (`b409edd` → `9d3f9d2`). The card listed `d1_morning_gacha` as edit-copy only |
| 3 | Duplicate cash display | ½ | HUD cash listed as faithful context; replaced rent surface "shows cash on hand"; no explicit duplication warning |
| 4 | Phone art vs target conditions | 0 | Not foreseeable at cutoff (phone context surfaces came after the amendment) |
| 5 | Breakfast skip tension | ½ | Recorded as "deliberately omitted (D9)"; risk 8 asks for an owner-visible decline path |
| 6 | Tutorial sequencing coherence | ½ | Risk 8: kitchen breakfast before phone changes onboarding (D4); no clocks/Day2 gacha |
| 7 | Day1 wide / later medium framing | 1 | Open column: "Day 1 wide / later medium framing (D8) has no production hook" |
| 8 | Extra shift must not auto-pay | 0 | — |
| 9, 10 | *controls* (Morning departure, LAUNCH reply) | not predicted ✓ | — |

**Plan38 total: 3.5 / 8 (3.5 / 6 reachable at cutoff).** The card also surfaced the Uninstall re-entry defect, the gallery `day >= 3` routing shortcut and the HUD-reachability contradiction between proposal sections. Each was a real later issue or a later review item already present in the inputs.

### Plan23 card
| # | Item | Score | Card evidence |
|---|---|---|---|
| 1 | Start facing right / Y-axis turns | 0 | — |
| 2 | Skip fate conflict | 0 | Listed Skip as a selected control; no conflict flagged (owner later removed it) |
| 3 | Whole-environment lighting | ½ | Selected filter values; risk 7 warns against overlay approximations |
| 4 | Podium motion roles visibly animated | ½ | Named in Selected; no warning about proxy assertions |
| 5 | Glow for all event participants | ½ | "event participant glow" named, without the all-vs-contact distinction |
| 6 | Shared eased camera | 1 | "eased close mid-race then wide; static/reduced stays wide" |
| 7 | Podium order 2/1/3, large ducks | 0 | — |
| 8 | Upright labels | 0 | — |
| 9 | Timeline on course clock | 0 | Risk 1 separates winner vs playback timing but not label times |
| 10 | Continue only after settle | 1 | "must appear only after the last crossing settles… must not advance the day before settle" |
| 11 | *control* (vertical timeline, "(you!)", copy) | not predicted ✓ | — |

**Plan23 total: 3.5 / 10.** The card also argued to keep *separate* race and podium pause preferences, which the owner merged soon after (DECISION-024). A card fixes intent at one moment; direction changes still need an amendment.

## Conclusion
- **Threshold not triggered.** The card caught roughly 35–45% of the items reachable at the cutoff, with no hindsight leakage on controls.
- **Where it helps:** provenance and semantics. It caught stand-ins not to port, framing, settle/Continue lifecycle and the gallery routing shortcut, plus Receipt-evidence and double-applied-effect risks.
- **Where it misses:** fine visual fidelity (facing, podium order, label rotation, timeline clock) and surfaces created *after* it was written.
- **Revised recommendation:**
  - Keep the card, but treat it as one of two complementary safeguards. The root-viewed before/after render gate covers the visual misses, and those are exactly the items the race owner found.
  - Re-issue the card at every scope amendment. Plan38's two biggest misses came from surfaces that did not exist when the card would have been written.
  - Confidence in "card + render gate = widest payoff" stays **medium**. The claim is narrower: the card alone is not sufficient.
- **Cost note:** each helper card took about 80–100 s and roughly 110–120k helper tokens to read the inputs. A root-authored card at selection time should be much cheaper, because root already holds that context. The useful content fits in about 15 table rows.

## Limits
- n = 2.
- Scored by the lead who proposed the card (bias risk mitigated only by pre-registration).
- Haiku card quality may differ from root's.
- Blindness enforced by instruction.
- Partial scores are judgment calls; swinging all ½ to 0 gives 2/8 and 2/10, still above threshold.
