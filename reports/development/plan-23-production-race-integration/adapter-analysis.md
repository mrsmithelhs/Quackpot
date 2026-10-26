# Plan 23 speed-adapter and payload investigation

**Date:** 2026-10-26
**Stage:** Report-only numerical investigation authorized by QP Orch. No mapping is approved for production.

## Method

`adapter-analysis.mjs` reads the accepted Plan 13 `race-physics.mjs` and changes no source file. It loads an in-memory copy with a single post-sampling adapter inserted between `sampledPerformance` and `topSpeed`, leaving the selected model, random keys, event order, and physical rules unchanged. An unchanged direct reference call for the named Plan 13 R03 input produced fingerprint SHA-256 `e3e31dbfd758f6ff76ad11e897c0e5c06b5721413aae77ccba60a7a120036cf0`, finished at 22.159874 seconds, and used 443.1975 ticks. This confirms the unmodified reference path for that witness; it does not certify an eventual production port.

Each tested mapping ran 432 races: three production stat tiers (10/14/20 m/s), both existing fields and race IDs (Tutorial 8 m/s / R01; Finale 11.2 m/s / R03), Safe and Sprint, trial absent/present, neutral/25%/50% rest factors, and six paired deterministic seeds. The combined rank-weave/contact model was used throughout. The 10/14/20 values cover all current roster identities by stat; no new identity mechanics were simulated. There are only six seeds, so outcomes are a screening signal, not fairness or balance evidence.

The raw speed domain was bounded from the current supported inputs: 4.4 m/s = Common 10 × 50% rest × Sprint 1.10 × low random factor .80; 27.72 m/s = Legendary 20 × trial 1.05 × Sprint 1.10 × high random factor 1.20. Existing opponent speeds (including ±5%) fall inside this domain. All speed values are transformed once after the original stance/trial sampling and before physics. Future rest factors are analysis inputs only; no rest-history or Plan 22 behavior is implemented.

## Candidate mapping comparison

| Mapping | Common 10 | Rare 14 | Legendary 20 | Trial delta at base 10 / 14 / 20 | 432-race finish time (min / median / max) | Share in 17–23s | Identity win rates Common / Rare / Legendary |
|---|---:|---:|---:|---|---|---:|---|
| Existing clamp to 8–12 | 10.000 | 12.000 | 12.000 | 0.500 / 0 / 0 m/s | 21.67 / 22.27 / 30.52s | 71.5% | 25.7% / 62.5% / 88.2% |
| Affine 4.4–27.72 → 8–12 | 8.961 | 9.647 | 10.676 | 0.086 / 0.120 / 0.172 m/s | 22.06 / 26.97 / 28.77s | 4.4% | 28.5% / 63.2% / 88.9% |
| Log 4.4–27.72 → 9–12 | 10.300 | 10.854 | 11.449 | 0.080 / 0.081 / 0.082 m/s | 21.89 / 23.84 / 25.13s | 27.1% | 29.9% / 64.6% / 90.3% |
| Square root 4.4–27.72 → 9–12 | 10.470 | 10.925 | 11.454 | 0.064 / 0.069 / 0.077 m/s | 21.89 / 23.60 / 24.56s | 30.6% | 28.5% / 64.6% / 89.6% |

For all 1,728 races across the four rows, every race crossed the finish line; no watchdog outcome occurred. The logarithmic and square-root candidates improve on the affine candidate's timing, but neither meets the 23-second upper edge for all supported cases: respectively 72.9% and 69.4% of their runs were outside the band, mostly above it. These runs included rest and stance conditions that the production slice currently does not compose; the 20-second/±15% pacing requirement remains unmet by the tested global mappings. No course, cap, turn, collision, or pacing constant was altered to force a fit.

Every candidate is mathematically strictly increasing across the tested domain. That does not mean modifiers retain their authored magnitude: the selected +5% Plan 17 input becomes only about +0.06–0.08 m/s for the square-root mapping and +0.08 m/s for the logarithmic mapping at each base tier. Across 36 paired condition-cell mean comparisons (same field, stance, rest and seed set), adding the trial changed mean player place by −0.19 and median finish time by −0.064 seconds under square root; under log it changed them by −0.19 place and −0.083 seconds. This is an aggregate measured effect, not proof every seed benefits. The true raw +5% value and its once-only consumption must remain explicit in the committed input evidence; do not describe mapped speed as still being 5% faster.

The log map retains a somewhat larger low-speed distinction than square root: a 10 m/s base maps 0.465 m/s above its 7.5 m/s (25%-rest) input and 1.104 m/s above its 5 m/s (50%-rest) input; square root gives 0.376 and 0.989 m/s. Those figures help Plan 22 reason about whether its selected rest penalties stay perceptible after a global conversion. They are not a Plan 22 balance verdict. Sprint versus Safe also remained outcome-relevant in aggregate: across 36 paired condition-cell means, Sprint improved mean place by 0.31–0.39 and shortened median finish by 0.057–0.077 seconds for the two smooth mappings; seed-specific effects vary.

The tier advantage remains large across mappings: in 144 runs per selected stat tier, Legendary won 89.6–90.3% under smooth maps, versus 28.5–29.9% for Common. This is consistent with the existing 10/14/20 speed spread and must not be “corrected” with per-duck modifiers. It is a material owner-facing balance result from this small screening design, not a claim that the adapter alone caused the gap. The old clamp already erased Rare versus Legendary ordering at the 12 m/s ceiling and erased all +5% trial increments at the 14/20 m/s tiers.

## Recommendation and failed invariants

There is **no passing mapping to recommend for adoption** from this screen. If QP Orch needs one candidate to carry into a broader, owner-approved pacing analysis, use the square-root 9–12 mapping as the first candidate because it had the highest target-band share and lowest maximum finish time of the smooth mappings. Keep logarithmic 9–12 as the alternative if preserving lower-speed/rest distinctions is more important. Reject affine 8–12 for the observed timing failure. Reject the existing clamp for its hard tier/trial plateaus.

The square-root candidate still fails these proposed acceptance checks:

- 69.4% of its tested finishes fell outside 17–23 seconds, so the accepted pacing tolerance is not established.
- The mapped Plan 17 bonus is only 0.064–0.077 physics m/s at the three base tiers. Whether this smaller delta remains an adequate player-visible trial effect needs an owner decision; do not assert the original 5% effect survives unchanged.
- The Legendary-to-Common advantage is substantial and repeated in this small sample. No per-variant correction is authorized.
- Six seeds per cell are insufficient for broad distribution claims; the runs do not demonstrate every seed or every later state.

If preserving trial magnitude, rest readability, the existing physics domain, and pacing cannot all be achieved by one global monotonic function, the owner must choose which constraint can move. Do not tune the 20-second target, course, accepted Plan 13 mechanics, Plan 17 rule, or roster stats silently.

## Follow-up for the owner's late-race tolerance

The owner is willing to accept up to about 5% of races over 23 seconds, and prefers a faster skew over a slow tail. A further report-only screen used the same Plan 13 in-memory adapter, fixed course and mechanics, and the square-root mapping with a 10.45 m/s lower output endpoint:

```text
f(x) = 10.45 + 1.55 × sqrt((x − 4.4) / (27.72 − 4.4)), for 4.4 ≤ x ≤ 27.72
```

It ran 30 deterministic seeds for each of the 72 input cells (three speed tiers × two production race/field combinations × two stances × trial on/off × three future rest factors), for 2,160 finished races and no unresolved outcomes. The measured distribution was: mean 22.391s, SD 0.260s, median 22.358s, p90 22.748s, p95 22.893s, p99 22.986s, range 21.685–23.060s. Nineteen races (0.88%) exceeded 23s; none finished under 17s; 99.12% landed in 17–23s. The sample skew was +0.28. This is a narrow, near-symmetric screening distribution, not proof of a normally distributed production population.

The late tail was concentrated in the future 50%-rest group: 2.64% of that group's 720 trials exceeded 23s; the rested and 25%-rest groups had none. Common-tier runs had 1.67% late finishes, Rare 0.97%, and Legendary none. Tier ranking remained distinct: mean place Common 2.71, Rare 1.61, Legendary 1.17; win rates 34.7%, 60.8%, and 84.6% respectively. No per-variant adjustment was made. No run was pushed below 17 seconds by this mapping; the fastest observed was 21.685s.

The +5% trial remained strictly ordered but was heavily compressed: it changed mapped base speed by only 0.033–0.040 m/s across the three tiers. Across 36 paired condition-cell averages it shifted mean place by 0.113 and finish time by 0.022s; that is a small aggregate effect, not a guaranteed per-seed benefit. Sprint shifted mean place by 0.159 and saved 0.040s across paired cell means. A 10 m/s Common base maps to 11.210; its 25% and 50% rest inputs map 0.194 and 0.511 m/s lower. Thus this mapping fits the requested late tail and retains mathematical ordering, while weakening the trial and rest effects. It cannot be represented as preserving the original physical +5% speed benefit unchanged.

This follow-up makes the pacing trade-off more concrete: **sqrt10.45 is the best current report-only candidate if the owner accepts the smaller mapped trial/rest deltas.** It does not authorize production integration. The earlier no-candidate statement applies to the first screen's stricter modifier-preservation gate; this candidate now passes the owner's approximate 5% late-race tolerance, but does not pass the stronger modifier-magnitude expectation. The choice remains owner-gated before any source or browser work.

## Payload and diagnostic sizing

Byte counts are UTF-8 JSON before and after gzip. The named direct Plan 13 R03 reference resolution is 299,215 JSON bytes / 54,790 gzip bytes with 443.1975 ticks, 15 mechanical events, and 33 opportunity diagnostics. Five first-seed full reference results for each mapping were measured; across those 20 samples, the largest full result was 371,551 bytes and smallest was 288,986 bytes. The five square-root samples were 296,850–319,315 bytes full JSON, 91,191–99,406 bytes under the report-only compact candidate encoding, and 53,263–57,019 gzip bytes full / 27,053–29,486 compact.

The candidate encoding stores one fixed entrant order, integer trajectory rows (`tick×1e6`, `progress/lateral/speed×1e3`, `heading×1e4`), deduplicates identical adjacent terminal samples, derives world `x/y`, and retains actual inputs, finish, mechanical records, opportunity diagnostics, and trial consumption. It reduced those five sample JSON payloads by roughly 69–70%. This is only a sizing model: it has not passed round-trip, accuracy, schema, or corruption tests and must not be treated as the production format yet. Since keyed draws derive from the versioned seed/race/input, a long draw-key list is not a mutable stream continuation; retaining or deriving it should be decided explicitly.

The actual reference module returned unresolved guard witnesses of 15,648 bytes at the opportunity-diagnostic guard (24 ticks, no committed diagnostic rows after rollback) and 17,827 bytes at a one-event mechanical cap (26 ticks, one retained mechanical event, one opportunity). Across the 1,728 sampled completed races, the highest observed counts were 27 mechanical events and 47 diagnostics; the accepted limits remain 128 and 84. No 800-tick watchdog result was observed in the valid matrix, so this report does **not** invent a watchdog payload measurement. The full trajectory plus full event/diagnostic/draw-key arrays are substantially redundant: proposed storage keeps one canonical versioned resolution under run state, logs a compact commit/input hash and bounded mechanical event facts for Receipt integrity, and appends displayed-event/action facts only as they occur. Do not duplicate the full trajectory into the hash-chained log.

## Source and lifecycle clarifications from the proposal

- Exact race input order: validate that the selected `duckId` exists in the current owned roster; derive its authored base speed; apply a `restFactor` input (default 1, owned by Plan 22 later); apply the committed Plan 17 `1.05` once if eligible; apply the selected Safe/Sprint sampling formula with the accepted keyed performance draw; apply the selected global adapter once; then enter Plan 13 acceleration/turn/contact physics. Plan 17 eligibility/consumption remains commit-once. The production resolver must not receive an already modified `effectiveSpeed` and also apply stance/trial again. Plan 13's direct reference input mode stays available unchanged for parity witnesses.
- The current `runRace` silently substitutes the first roster duck when an ID lookup misses. Validate ownership and reject before appending a race-choice event or changing trial/RNG/reward state; do not race an unowned fallback.
- Old completed races receive the now-approved summary-only legacy presentation. Never rerun them or synthesize missing trajectories, mechanical events, or displayed cues.
- Normal-motion playback uses the committed trajectory with the selected two-second highlight. Five fixed checkpoints are the reduced-motion/static default, with event stills/seeking retaining truthful event linkage. The selected highlight changes wall playback only.
- Prefer a new race-specific motion wrapper/controller after Plan 20 handoff; keep Plan 20 card motion lifecycle read-only unless its owner explicitly approves a bounded extension.
- `EventLog.append` already accepts arbitrary immutable, hash-chained event types. No `event-log.mjs` rewrite is proposed. Add compact mechanical event and result records there as needed; `receipt.mjs` is the exact projection file if race facts must appear in Receipt registers. Do not duplicate full trajectory/state into the event log.

## Reproducibility and limits

Run from repository root: `node reports/development/plan-23-production-race-integration/adapter-analysis.mjs` for the first six-seed screen and `node reports/development/plan-23-production-race-integration/pacing-sweep.mjs` for the 30-seed sqrt10.45 follow-up. Their machine-readable outputs are `adapter-analysis-results.json` and `pacing-sweep-results.json`. The follow-up substitutes only the PRNG URL in an in-memory reference-module copy and inserts the mapping before `topSpeed`; it changes no accepted source. Both scripts write only within this Plan 23 report folder. No browser, build, repository test, or production source command was run. Current in-flight Plan 20 `src/` changes were left untouched.
