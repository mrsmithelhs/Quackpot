# Symbolic trace and experiment contract

Selected: three phases with one anchor each; breakfast and dinner are maintenance, each skip costs 5 HP; scheduled work earns wages only when completed; evening work, leisure and gacha compete; Day 1 evening invitation; late-night play causes next-morning fatigue without removing morning; third missed shift closes scheduled work; Day 4 checks the remaining rent balance; one-phase bedrest at zero; voluntary sales and restorative leisure. No numerical social penalty is selected.

For initial cash C, HP H, meal M, scheduled wage W, purchases P1..3, rent R, fatigue F, leisure recovery L, sale V:

| Time | Cash | HP | Anchor / obligations |
|---|---|---|---|
| D1 morning | C−M | H | setup; breakfast alongside |
| D1 afternoon | C−M+W | H | completed shift earns W exactly once |
| D1 evening | C−2M+W−P1 | H | dinner and free introductory 10-pull; optional purchase; late-night flag |
| D2 morning | C−3M+W−P1 | H−F | fatigue then breakfast; morning remains available |
| D2 afternoon | C−3M+2W−P1 | H−F | work or warned missed shift (no W) |
| D2 evening | C−4M+2W−P1−P2 | min(100,H−F+L) | dinner and restorative leisure, or other exclusive anchor |
| D3 morning/afternoon | C−5M+3W−P1−P2 | previous HP | breakfast, then work |
| D3 evening | C−6M+3W−P1−P2−P3+V | previous HP | dinner; optional sale; pay early only if chosen and affordable |
| D4 morning | prior cash−M | previous HP | deadline check; if unpaid and short, escalation; if affordable, payment is a separate choice and can leave zero |

The order fatigue → breakfast → health check → anchor and Day 4 breakfast before deadline are model assumptions, not adopted rules. V=0 absent a sale; each item can be sold once. Earlier rent was paid before the run; no invented payment. A collapse converts the current phase to bedrest, restores positive B once, and forfeits that anchor; if it covers scheduled work count a miss. Ordering at the deadline and interruption/reload handling require design resolution. Uninstall remains immediate, not simulated as a timed commitment.

## Finite experiment, written before execution

`node.exe reports/development/plan-29-life-economy-scale-and-session-pacing/calibrate.mjs`, exclusively via the unchanged Plan25 launcher after process preflight; serial single job, 1 GiB Node heap, 2 GiB sampled tree and 90 seconds. Output `results.json` <5 MiB. Three illustrative configurations, six named strategies, seeds S01–S32, through Day 4 morning. All amounts cents; H starts 100; rent $15 remaining; free introductory 10-pull not cash income. A: C=$15, W=$10, M=$2.50, leisure +10, bedrest to 25, fatigue −10, overtime +$10, sale $10. B: C=$15, W=$10, M=$3.50, same recovery/other terms. C: A with fatigue −20 and low-HP wages halved below 30, overtime unavailable below 70. These are illustrative, not selected. Wages paid at completed afternoon shift, optional overtime exclusive to evening; purchases are 99-cent starter once and $4.99 bundle thereafter. No cash can go negative. Eating when unaffordable becomes an explicit skip; this is an experiment assumption, not a proposed forced player action. Payment is deliberately chosen at the deadline when affordable, after breakfast; unaffordable triggers shortfall, then report-only sale or illustrative credit if chosen. Credit is a principal advance with no modeled future cost and cannot establish affordability. Proactive sale value is illustrative, and no relationship variable is invented.

Strategies: restrained (work, eat, no purchases); small buyer (work, eat, starter plus repeated small bundles); mixed (work, one overtime, one leisure, one purchase); late spender (work, repeated purchases and late play); absence (three missed shifts with late play and skipped meals); sale/credit (two absences, purchase, one proactive sale and possible credit). A seeded toy Gem reward of 0/60/120 per gacha session illustrates noncash variability only; no cash redemption, draw odds, pity, Down, roster or race finish simulated. Thus seeds are not empirical outcome samples or validation of race economics. Compare deterministic money trajectories separately from toy reward range. Record day-by-day cash/HP, wages, purchases, strikes, bedrest, sale, shortfall and debt. Tests include zero/short rent, exactly-once payment and wage, recovery and attendance; illustrative stress cases are labeled, not probabilities. No human timing measured.

Trace above is one specific route: it works all three shifts, takes D2 leisure and uses no sale unless V is explicitly chosen. Alternative anchors remove the corresponding wage or recovery; the generic P terms denote purchases only when affordable. The main model does not implement afternoon bedrest; a separate artificial work-phase-collapse and six-day recovery probe explores that fork without claiming actual transition/reload support. Its extension assumes scheduled employment continues, one free leisure anchor each evening, no additional housing expense, and no purchase; those assumptions cannot establish whole-run escape from a debt spiral.
