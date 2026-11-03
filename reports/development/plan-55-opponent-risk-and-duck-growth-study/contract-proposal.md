# Plan 55 — contract-first proposal for owner and orchestration

Status: proposal only, 2026-11-02. No experiment, production change, preview, or candidate adoption has occurred. Owner experience choices and QP Orch technical/resource clearance are required before execution.

## Current mechanism and pin

Observed repository HEAD `fcf594f9d6a8c5675993d8f17f757eba5da36129`; Plan52 work is concurrent. SHA-256 at inspection: race-resolver `e6b27be361810fd4dfbc00f4e043a6353fb4b75aa17f7acadd03cd606880e129`, race-rest `56dceb4151c4453621eaa208ba57469e185b39fbdc8aed33199fe9b699946df0`, PRNG `7392e6c25ca356fbf253d9dfccd1562052577b2bfaca23720431b123364389a7`, engine `ea13cf6d1ddd4533d49ee390aaf6a36281c0a68b15aee6b503fa211988ae534a`, scheduler `5633dd45982444f18828321dffec8474d6d3196df229ff06f8f28da10002bdd4`. Recheck hashes before any imports or adapter execution and stop for review if changed; this pin is an observation, not a promise of future source stability.

- Six entrants: player P and fixed A–E; opponents share field rating and use ±5% sampled performance. Only player chooses steady ±5% or variable ±20%, both mean 1.00. Fixed identities are not independent strategic opponents. Race 1 field rating is 8; subsequent races 11.2. Common, rare and legendary authored ratings currently 10, 14 and 20. Mapping is 8.25 + 0.5 × sampled input. Accepted rank-weighted weave, contact and R2 assistance remain part of every actual-resolver arm.
- Rest uses completed-race evidence: immediately repeated duck 0.5, one intervening other duck 0.75, two or more 1.0; never raced is 1.0. Every owned duck stays selectable. The optional 3-Down upgrade multiplies input by 1.05 once; do not assume it is free or available in the nonspending routes. Unresolved races do not grant completed-race rewards. Engine commits a resolved race and recorded result once.
- Seeded PRNG forks and race event keys supply repeatability; shared seeds do not guarantee identical events after trajectories diverge. Five-slot sessions allow one pull action plus one race, with free reading and navigation; a race competes with actual life opportunities, and due financial obligations matter. A scenario budget is an assumption, not a demonstrated full-run route.
- Plan54 selected recurring fictional competition, bankable permanent no-slot assignment, progress after every completed race, automatic seeded abilities, and a raceable-injury investigation. Forecasts, odds, risk effects and numbers remain candidates. Authored backstory, displayed forecasts, actual committed rival actions and observed outcomes are four separate records.

## Small candidate comparison

A. **Current control:** current resolver, unchanged field, pace, rest and Down behavior; no growth or injury. No suggestion that a rival has a strategic history.

B. **Field-information candidate:** five recurring fictional names mapped to A–E. For a first contrast, two predeclared fields: mostly steady or mostly variable. A forecast discloses each rival's actual pre-race policy probability, not its hidden draw or a guarantee; separately seeded actual choices select the relevant existing ±5%/±20% spread. Player retains current two paces and current rest; no injury or growth. An explicit report-local adapter must change only entrant per-rival inputs while retaining all other race mechanics. Establish control parity before using it. A merely decorative field is a negative result.

C. **Risk/growth candidates:** same field rules and accepted pace mechanics. Compare injury off versus on, both with the same one-point growth choice. Candidate: each completed race grants one progress; after its third completed race, each duck earns exactly one bankable point for this study; no further levels or points are modeled. The point may be permanently assigned to *Burst* (one seeded 50% activation per race, +1 rating input before rest when active) or *Guard* (halve the candidate injury probability, no speed bonus). The +1 applies for the entire race when activated; it is a rating proxy, not an implemented brief visual speed burst. No slot, purchase or timing input. These are experimental values, not a requested production rule. With injury off, Guard has no purpose; report this as a design defect rather than claiming a meaningful choice in that control. A separate growth-off comparison isolates the point's effect.

Candidate injury: after a completed race with at least one actual recorded contact involving P, make exactly one new-injury roll for that race (not one per contact); the chance is 20% under steady or 40% under variable, halved by Guard. Injury applies a further 0.9 multiplier to rating after rest until one intervening completed race by another duck or an early-bed opportunity; the only duck remains raceable. Racing while injured has an independently seeded 50% chance to retain the injury; otherwise it clears after that race. Then evaluate a new injury from that race separately; if both occur, keep one injury and record both events. If already injured and extension succeeds, it remains injured regardless of a new injury. A race by another duck or an early bed clears the prior injury before the next race; early-bed injury healing is a proposed new rule, not existing behavior. Explain new injury and prolongation separately, and disclose the exact conditional odds. This deliberately modest rule does not claim opponent pace causes contact; if actual contact frequency is too low, or field profiles do not predict it, that is a failed candidate. Early-bed substitution consumes the actual Evening opportunity and must not be offered as a free extra recovery. Track injuries separately from rest, whether a contact occurred, displayed versus realized odds, and stacked input multipliers. No new injury changes motion or forces a result.

## Illustrative decision traces — not computed outcomes

1. A player sees a mostly steady field: Puddle is rested and the player chooses steady for consistency. In the mostly variable field, the player may prefer steady/Guard to limit a possible injury, or Burst/variable to pursue a higher placing. This is a proposed trade-off, not evidence that either is rational: compare policies and actual field-specific consequences; if decisions do not change under a stated objective, the forecast has failed its test.
2. A single common duck loses three completed races and earns a bankable point. The player can choose Burst for occasional speed or Guard for protection, or wait. Repeated entries retain the existing 0.5 rest factor; a further injury could compound the disadvantage. The no-injury comparison and early-bed option reveal whether the proposed addition makes a bad situation worse. No point is earned from an unresolved race. Three races may be infeasible for a given life route: measure rather than assume.

## Revised finite protocol for QP Orch review

This revision responds to QP Orch. The candidate design remains subject to owner choice; nothing here authorizes a run. No ability comparison is claimed in the injury-off ablation: Guard has no benefit there. The meaningful choice is evaluated only in the injury-on arm. A useful injury-free defensive alternative would be a different mechanic and is not silently selected.

### Stage 1: parity and observability

After a separate scoped implementation/test turn is cleared, use six fixed seeds `plan55-check-00`–`05`, both player paces, one common rested rating and current field: 12 paired original-versus-adapter resolutions, 24 calls. Compare finish status/order/times, payouts, mechanical events, seeded draw identity and serialized outcome where supported. Any mismatch stops the study. Inspect actual player-contact records and validate participant identity; no contact count is promised. Verify determinism, unresolved/no-award, one-point-per-duck, bank/assign once, injury ordering and only-duck availability through targeted negative cases. These checks are bounded correctness probes, not a calibration sample.

### Stage 2: exact principal matrix

Use exactly seeds `plan55-000`–`plan55-023`, no filtering, with one common and three common ducks, and alternating mostly-steady/mostly-variable rival fields. Each rival has variable-pace probability 0.2 in the mostly-steady field or 0.8 in the mostly-variable field; actual choices use separate stable rival/race forks. Forecast shows those probabilities, not actual draws. Six scheduled nominal opportunities per run, with the first three separately summarized; stop at a real unavailable/financial/recovery boundary. Every cell uses identical seed, roster, field sequence and life policy.

| Cell | Race field | Player policy | Growth and injury |
| --- | --- | --- | --- |
| A | Current equal steady opponents | Steady, favorite | Neither; exact current control |
| B1 | Forecast field | Steady, favorite | Neither |
| B2 | Forecast field | Variable, favorite | Neither |
| C1 | Forecast field | Steady, favorite | Burst when earned; injury off (ablation) |
| C2 | Forecast field | Steady, favorite | Burst when earned; injury on |
| C3 | Forecast field | Steady, favorite | Guard when earned; injury on |
| C4 | Forecast field | Variable, favorite | Burst when earned; injury on |
| C5 | Forecast field | Variable, favorite | Guard when earned; injury on |
| D | Forecast field | Steady, rotate available common ducks | Burst when each duck earns a point; injury on |

Thus 24 seeds × 2 rosters × 9 cells × at most 6 starts = 2,592 principal resolutions, which exceeds the original ceiling. To preserve that ceiling, use **16 seeds `plan55-000`–`015`**, yielding at most 1,728 principal resolutions; with 24 parity calls, at most 1,752 actual resolver calls, exclusive of small targeted deterministic unit checks, each explicitly bounded in the implementation manifest. No adaptive sample count. D equals C2's favorite selection in the single-duck case; retain it as a consistency check rather than an independent conclusion. No Down purchase is assumed. Start with current authored common rating, use accepted rest and exact accepted race mechanics; altered rival pace and Burst input are adapter differences only.

Forecast-value test: report field-stratified paired differences B1 versus B2 for placement/payout, and C2 versus C4 and C3 versus C5 for placement, injury and missed opportunities. Separately report contact and injury rates by field. A forecast has demonstrated modeled decision value only if a named fixed objective prefers different actions in the two fields; show the actual differences and uncertainty, and report no reversal as a negative result. Objectives are (i) mean race placement alone, and (ii) mean per-race score `-place - 1 × new-injury-indicator - 0.5 × extension-indicator`; these weights are illustrative sensitivity assumptions, not player preferences or calibrated value. Report both components unweighted too. This is an exploratory small sample, not proof of rational human behavior. A mostly-variable field alters speed spread; it does not establish more contact or that Guard is a sensible response. Report inability to detect a difference and unresolved cases explicitly.

### Life, cash and reachability

Use the actual production five-slot scheduler and finance/transaction boundary, pinned at execution, never the scheduler alone as a substitute for due-obligation enforcement. Nominal ceiling is one Evening race each day for six days; three is a prefix, not a separate route. Baseline starts Day 1 Morning with $80/100 HP, buys both $6 meals, completes each scheduled $60 Midday shift, pays the $170 bill on Day 4 when due, races at Evening where eligible, and sleeps at Late Evening. No purchases, loans, sales, extra sessions or unexplained advances. The single/three common rosters are controlled race fixtures, not engine saves or claims that all three are guaranteed by actual gacha. Run real engine-derived life-opportunity traces independently, then apply their reachable opportunity budget to those fixtures; never inject synthetic ownership into a forged save. Count actual permitted starts, balances, obligations and final slot; stop on rejection and record why. Under these arithmetic assumptions cash entering Day 4 Morning is $224 before the $170 payment; the driver must verify the actual transition, not treat arithmetic as a valid save.

A separate limited-cash deterministic route uses the same start but displaces Day 2 scheduled work with a permitted non-purchase race at Midday, then follows the same meal/work policy and explicitly pays the first bill only if affordable. On Day 4, pre-payment arithmetic predicts $164 after three days, so this route stops at the due bill unless the actual transaction rules provide a clearly specified, selected resolution; no automatic loan, sale, overtime or bypass. This path is a distinct bounded reachability probe, not an additional per-seed simulation matrix; record actual schedule/finance events and early stop. Day 2 Evening racing, where actually eligible, counts against the same six-opportunity ceiling. If a shared production driver cannot faithfully realize either route without changing production, stop and report a conditional scenario, not fabricated reachability. If optional early bed is evaluated as a recovery probe, it replaces that day's Evening race and clears injury only under the candidate rule; it is not added to the main fixed-policy matrix.

Record reachability, completed losses, point availability by opportunity 3 and 6, field-specific outcomes, injury/new versus extension, stacks, cash/HP, and the paired difference between a common duck with Burst versus its growth-off counterpart. Six races and 16 seeds cannot calibrate long-run runaway feedback; report growth and opponent power as bounded indicators. Record unresolved outcomes in denominators and keep each seed, including failures. Identical seed does not make diverged trajectory events identical.

Total ceiling: 1,752 principal plus parity resolver calls, plus explicitly enumerated small deterministic unit tests; 2,304 is an absolute overall ceiling. Use serial finite Node jobs after fresh real process preflight through the unchanged launcher: 1 GiB heap, 2 GiB sampled owned tree, 90 s each; stop on a limit, no retries or escalation. Launcher output caps 65,536 characters per stream; report summaries below 2 MiB, no full trajectory dumps. Coordinate all heavy/browser jobs and full stage-to-commit interval with QP Orch. Pin production hashes and adapter difference ledger; if source drifts, stop and review. The feasibility of this cost is unmeasured and is part of the technical gate.
## Gate and coordination

Owner: choose whether the proposed Burst-versus-Guard and raceable-injury trade-off is the right experience to investigate, including how recovery competes with early bed. QP Orch: review the candidate contract, adapter seam, matrix, scenario/decision objectives, budget and resource envelope before execution. Connect this chat to QP Orch and grant bidirectional communication; until then no claim of contacting or receiving clearance from orchestration. After clearance, one reserved read-only Terra-medium review applies to stable substantive code and results, not this proposal. The report-only investigation does not authorize production, status changes, push or deployment.



## Owner experience selection — 2026-11-03

The owner selected investigation of Burst versus Guard with raceable injury, while keeping current-race and injury-free comparisons. This authorizes the investigation direction, not adoption of candidate numbers, recovery rules or production behavior. QP Orch must review and clear the specific executable protocol and coordinate resources before runs.


## Fresh source observation — 2026-11-03

HEAD at inspection: `91afb62e894936c3ecc26bfd411a422211bd2a5d`. Plan52 remains active, so this is a proposed observation pin, not a stable execution baseline. The engine differs from the initial inspection and now imports quiet fallback. Confirm transitive imports and full hashes at clearance and recheck before jobs; drift requires review. Observed SHA-256:

- Engine: `bf36362f5ef9fad1383cd3caf2727504f684d2c3fa6fbad25ab9aa2c28581b69`
- Race resolver: `e6b27be361810fd4dfbc00f4e043a6353fb4b75aa17f7acadd03cd606880e129`
- Race rest: `56dceb4151c4453621eaa208ba57469e185b39fbdc8aed33199fe9b699946df0`
- PRNG: `7392e6c25ca356fbf253d9dfccd1562052577b2bfaca23720431b123364389a7`
- Five-slot scheduler: `5633dd45982444f18828321dffec8474d6d3196df229ff06f8f28da10002bdd4`
- Five-slot policy: `ad2b1756cbe8823cda34e567a328615d9cc9e1910f78c1adfb9bb3f3391ee259`
- Life finance: `64e0a5e1f26eaaaac5c837f641e74aa5a508fd901c3cc68c96554a1595c2513a`
- Life coordinator: `d0ab3b03e4db4b473edacdc1a70dcdef2170915c9b4396d82772c51fc22db0e0`

The engine still routes race selection through current rest evidence and the selected resolver; race one uses the tutorial field and subsequent races the finale field. The general `START_CASH` constant is $15, while five-slot initialization sets cash from `PRODUCTION.startCash` ($80); any real route must confirm initialization instead of assuming either in isolation. QP Orch is considering a first stage limited to report-local implementation/tests and 12 paired parity/observability probes, with actual resource cost measured before a decision on the main matrix. That possible staging is not clearance to execute either stage.

