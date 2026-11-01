# Evidence

## Versions
- Pinned baseline `96c1b964d415f3468f9004a9e53b58accc7bb0ba`. Startup HEAD `383765b63f0a188fe889800118515dff8a6f3a0a` = baseline + review handoff docs only (`git log 96c1b96..HEAD`: one commit). Working tree clean at start and before E1. Plans 45/47 did not commit during the review.
- All source citations are identical at baseline and HEAD.

## Models
- Lead: Claude Opus 5.5 (`claude-opus-5-5`), as configured by the harness; effort setting not exposed to me.
- Helpers: six `general-purpose` agents requested with `model: haiku`. The actual served model is not independently observable. All six were instructed to stay read-only (read tools + read-only git, no node/npm/browser) and returned text only.

| Helper | Question | Disposition |
|---|---|---|
| A | Plan13→23 race chain | Accepted. Verified: review-02 no root browser (`plan-23-production-review-02.md:21-23`); smoke clicks `[data-race-skip]` in `2609032`; Chrome exit 2147483651 recorded (`reports/development/plan-23-.../progress.md:140`) |
| B | Plan28→38 chain | Accepted. Verified: "overweighted literal preservation" (`plan-38-owner-sequencing-review-02.md:3`); "stand-ins" (`plan-28-delivery-review.md:28`) absent from Plan38 packet/handoff (grep; packet's two "projection" hits are Receipt); "Morning work proposal is rejected" (`plan-38-mechanism-clearance-01.md:11`); `9bf4432` 27 files +2518/−276 |
| C | Session hub / HUD / resolved-object origin | Accepted. Verified `main.js:203` `lifePolicy: true`; `9d3f9d2:src/ui/life/life-phone-view.js` flat list (read in full) |
| D | Successful comparisons | Accepted with caveats on counts. Verified Plan19 gate "already selected"; Plan20 `review-05.md:5` "overreliance"; Plan24 owner-acceptance quote |
| E | Checkpoint tooling | Accepted. Verified `#btn-pay-rent` absent in `src/` (present only in `scripts/dev/smoke-browser.mjs:602,782` and `checkpoints/browser-phase.mjs`); `__E2E_INSTANT_RACE__` absent in `src/`. Source-hash drift claims are helper-computed, not re-hashed by the lead |
| F | Coupling/touchpoints | Accepted. Verified `life-config.mjs` exact-match (read in full); `life-validation.mjs:10`; `initialLife()` uses current `LIFE_CONFIG` (`life-progression.mjs:2-6`); corrupt-save path `main.js:129-149` |

## Key reproduction commands (read-only)
```
git show 9d3f9d2:src/ui/life/life-phone-view.js          # original bare hub
git show 96c1b96:src/main.js | grep -n "lifePolicy\|life_phone\|d1_morning_gacha"
git log -S 'Cash ${money(e.state.cash)}' --oneline       # 9bf4432, 5fb02be
grep -n "stand-in" reports/orchestration/plan-28-delivery-review.md
grep -c "stand-in" docs/development/plan-38-*.md reports/orchestration/plan-38-opus-starting-handoff.md
sed -n 1,15p src/core/life-config.mjs; sed -n 8,12p src/core/life-validation.mjs
git ls-files '*.test.mjs' | sort  vs  grep -o '[^ ]*\.test\.[mjs]*' package.json   # 8 omitted
grep -rn "btn-pay-rent\|__E2E_INSTANT_RACE__" src scripts
```

## Cadence observation
`git log --since=2026-10-26 --format=%ad --date=short | uniq -c`: 98, 112, 93, 76, 71, **145** (10-31), 5 (11-01 to startup). On 10-31, Plans 38, 39, 40, 41, 42 and 44 all recorded repair/review commits.

## W1 (owner-approved second wave)
Two blind Haiku card drafters, cutoffs `3f99a18` and `57756ff`. The rubric was pre-registered in `experiments/w1-rubric.md` and the results are in `experiments/w1-results.md`. No execution. One helper briefly wrote and deleted temporary copies in the session scratchpad (outside the repo). No leftovers found; repo unchanged.

## Execution
E1 only. See `experiments/README.md` (87/87 pass, 1.12 s, 94 MB peak, exit 0, no cleanup notes, launcher unchanged, cwd in scratch). No browser launched, no server touched, no repo write. Pre-existing node processes were observed for preflight only.
