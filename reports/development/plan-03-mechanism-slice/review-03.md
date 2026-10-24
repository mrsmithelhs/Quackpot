# Plan 03 Repair 02 — technically accepted for owner play review

**Date:** 2026-10-24. **Reviewed implementation:** `f04a11b`. **Disposition:** technically acceptable for the owner-approved bounded three-day trial. Keep packet `delivered` pending owner played-slice acceptance. No Repair 03 or new preflight is requested, and no push/publication is authorized.

## Independent verification

Root ran `npm test`: **98 tests pass**. Root also ran a fresh `npm run test:smoke`, including a current Vite production build and isolated local Chrome profile. All **11 phases** pass. The implementer's original `repair-02-observations.json` was retained unchanged; independent evidence is `review-03-observations.json`.

The browser run observes:

- Build assets match this build, the placeholder SVG decodes, and initial load/reload work under `/Quackpot/`. The bounded observed session reports no external requests or console/runtime errors. Local no-slash 404 remains a Vite-preview observation, not live Pages behavior.
- Early Uninstall reaches Receipt and removes the Uninstall control afterward. The existing terminal guards and tests complement this UI check.
- The full starter purchase → rent shortfall → extra-shift recovery → finale → Receipt route completes.
- Reload after two revealed cards preserves exactly two revealed/eight unrevealed, then finishes the reveal sequence.
- Reload after the tutorial preserves its result/Continue screen and exactly 50 gems, without another Start Race button.
- Starter, zero-cash and unpaid-escalation contexts survive the exercised interruptions/reloads; declining extra shift advances to the couch offer.
- All three zero-cash choices are now **actual UI clicks in separate played frugal runs**. Continue yields $5 and 100 HP after scheduled wage/food; extra shift yields $15 and 85 HP; couch yields $15 and 100 HP. These are asserted resource consequences, not a claim that final apartment art has been accepted.
- Keeping an invalid save preserves its primary record and a backup copy; automatic and manual injected write failures show persistent warnings. Autosave-off at start avoids writing, while explicit manual Save works.

Root separately reran the prior adverse probes: missing reveal queue, cloned pending entry and substituted Down are rejected. Deleting race completion/results and resetting the step is rejected; even direct hydration of that inconsistent envelope reconstructs the logged result so another race call adds no prize. Repeating the same paid rent produces `alreadySettled:true` with unchanged log length, cash and phase. Node tests also cover preservation mode and backup-key failure while primary-key writes remain available.

These observations satisfy the Repair 02 requirements at the approved trial boundary. They are not a full audit of arbitrary edited saves, physical classroom devices, assistive technology, all possible event combinations or released-site behavior.

## Review finding retained for later scope

The requested fresh read-only `gpt-6-luna` at high effort identified a remaining Skip Lunch edge case (`src/core/game-engine.mjs:566–581`). A food bill waived through that method logs `expense_paid` without `billId` and does not add the occurrence to `billsSettled`. Recalling the same food bill can therefore process it again. Root confirmed the source mechanism; this needs a focused waived-bill idempotency/restore regression and settlement record before food-shortfall gameplay is expanded.

**Classification:** non-blocking for this approved trial. The reachable UI has only the optional $0.99 starter cash spend; normal food is affordable on every continuing branch: Day 1 starts at $15 before its $5 food, Day 2 has at least $19.01 before food, and the lowest continuing Day 3 branch has $10 before food. Rent refusal ends before Day 3; recovery/zero-cash options increase available cash. There is no reachable food-shortfall/Skip Lunch action in the selected UI route. This accepts a bounded slice, not a claim that every exported engine method is ready for broader gameplay. Do not silently carry this edge case into an extended economy.

## Owner gate and next work

Owner play review should judge whether the starter-versus-bills pressure is understandable, choices/Uninstall feel accessible, the recovery and Receipt are clear, and saving/resuming feels coherent. The short 3–5-minute trial and its Common-only tactical comparison remain the accepted scope; no claim is made for the roughly 15-minute floor, final balance or roster-wide tactical depth.

After explicit owner played-slice acceptance, close Plan 03 with those limits in its resolution. Production rig/motion/composition work remains in its separate draft packets and is not implicitly started by this technical acceptance. A later economy-extension packet must consume the Skip Lunch follow-up above before adding reachable food shortfalls.
