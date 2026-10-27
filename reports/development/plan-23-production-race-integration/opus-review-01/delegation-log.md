# Delegation log — Opus review 01

Requested model for every child: **Haiku** (`model: haiku` on the Agent tool). The harness does not return an independent model attestation to the parent; the evidence below is each child's self-reported model line, which the brief required as its first output line. No Opus/Sonnet child was requested. Read-only researchers ran in parallel; experiment writers were serialized, each owning one numbered folder.

| # | Role / agent type | Requested | Self-reported | Scope | Writes |
|---|---|---|---|---|---|
| R1 | Read-only researcher (`explorer`) | haiku | `claude-haiku-5-5` | Canonical race rules: design.md, decision-log (013/017/018/019), Plan 22, Plan 13 guide/reviews/proposal-03 | none |
| R2 | Read-only researcher (`explorer`) | haiku | `claude-haiku-5-5` | Production race surface: game-engine, storage, receipt, event-log, race-view, main.js | none |
| E01 | — (Opus inline) | — | Opus | Speed envelope and start-grid diagnostic | `experiments/01-speed-envelope-and-grid/` |
| E02 | Experiment writer (`implementer`, no worktree) | haiku | `claude-haiku-5-5` | Paired production-case effects under affine: row 0, slot-balanced, no-weave control; 40 seeds `opus-r01-paired-*` | `experiments/02-paired-production-effects/` |
| E03 | Experiment writer (`implementer`, no worktree) | haiku | `claude-haiku-5-5` | Pace-scaling alternative: pre-registered P25/P15 calibration (12 seeds), frozen held-out validation (30 fresh seeds) vs affine; risk-only Sprint arm | `experiments/03-pace-scaling-candidate/` |
| E04 | — (Opus inline) | — | Opus | Affine with risk-only Sprint; affine with row spacing 1.5 (same 30 held-out seeds as E03) | `experiments/04-affine-sprint-and-grid/` |
| E05 | — (Opus inline) | — | Opus | Frozen combination (affine + risk-only Sprint + spacing 1.5) on 40 fresh seeds | `experiments/05-combined-bounded-candidate/` |

## E02 disposition

- Opus reviewed `run.mjs`: pairing keys on cell/seed/slot, rest-pair partner lookup by group key is correct, unresolved races stay in denominators, margin/lead-change definitions match the brief, map residual and slot checks are recorded. **Accepted.**
- Scope deviation disclosed by the child: one early shell command wrote `C:/Users/orion/AppData/Local/Temp/tables.md` outside the allowed folder; the child deleted it. Opus confirmed the file no longer exists. No repository file outside the folder was touched (`git status` checked at commit time). Recorded, not repeated in E03 (brief now names its folder for temporary files too).
- Lead-change counts sample every trajectory row and count near side-by-side swaps; treat as a drama proxy, not a perceptual measure.

## E03 disposition

- Opus reviewed `run.mjs`: each of the seven pace anchors is counted and verified per arm; the selection rule is applied to calibration only and picks the first passing candidate in the pre-registered order (P25, then P15); validation seeds are fresh; Sprint-neutral pairs against the pace arm's Steady cells. **Accepted.**
- Child disclosed one crashed run (a line-ending assertion failed after the races ran, before any output was written or printed) and two completed runs with identical numbers. Opus accepts this as not result-selective: the crash happened before any numbers were visible.
- Finding contrary to Opus's own hypothesis: pace scaling removed the saturation knee (finish × pace constant at 20.68–20.70 across ratings 5–27.7) and passed timing, but it produced processional races (lead changes 0.24 vs 1.05, margins 20.6 vs 6.7 lengths) and more certain wins. **Opus does not recommend it for adoption now**; it is retained as a documented alternative.
- `affine` production numbers in E03 were independently reproduced by E04 (row-0 win 63.3%, slot-balanced 47.4%).

## R1 findings and Opus disposition

- Six entrants in two lanes × three rows (0/−4/−8); grid advantage is a *disclosed limit* in Plan 13 reviews, and the player's row is not specified by any canonical doc. **Accepted**; Opus experiment 01 measured its size.
- Design intent "no choice is automatically correct" (`docs/founding/design.md:34`); no win-rate goals or rubber-band intent are canonical; rank-weighted cadence came from Plan 13 investigation inputs. **Accepted**, used in the Sprint analysis.
- Current slice has two races (`docs/development/plan-22-race-entry-and-duck-rest.md:36`). **Accepted and verified against `src/main.js` via R2.**
- No DECISION-021+ exists; Plan 13 proposal-03 still contains pre-DECISION-019 ±15% wording. **Noted** (documentation drift, not load-bearing).
- R1 could not find canonical 10/14/20 tier values in docs; **resolved** by R2 (they live in source).

## R2 findings and Opus disposition (spot-verified by Opus against source lines)

- Roster speeds Common 10 / Rare 14 / Legendary 20 at `src/core/game-engine.mjs:15-22`; field 8 / 11.2 at `:46-47`. **Verified.**
- Production `runRace` (`src/core/game-engine.mjs:412-499`) is a deterministic descending sort of `rating × (1 ± noise)`; an unknown duck silently falls back to `BANNER_1_ROSTER[0]` (`:423`). **Verified.** Consequence derived by Opus: today a rested Common Safe always beats the Tutorial field (9.5–10.5 > 8.4) and always places last against the Finale field (≤10.5 < 10.64).
- Plan 17 boost and rest are not implemented in production. **Accepted** (consistent with proposal/AGENTS).
- Race 1 = Tutorial (R01-equivalent), race 2 = Finale; only two races. **Verified** in engine. Opus consequence: in the current slice the 25% rest tier is unreachable; race 2 is either rested (different duck) or 50% (same duck).
- `race-view.js:258` renders "Finished 3th."; pre-result pill hard-codes "+50 Gems"; no reduced-motion handling in race view. **Verified the "3th" line**; others accepted as reported, outside this review's mechanics scope.
- Receipt race branches (`power_creep`, `social_comparison`) appear gated on cues that no production emitter fires (inference from grep). **Recorded as an open integration question**, not verified at runtime.
