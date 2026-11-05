# Proposed authored fixtures — pending review, not run

This table refines `semantic-protocol-draft.md`. All inputs below are synthetic discrete event scripts, not actual race paths. No executable exists yet and the exact executable representation/trace must be reviewed before use. Each named row is one case; where meaningful it compares control and candidate on identical scripted facts. The point is event semantics and counterexamples, not statistical effectiveness. Empty-ability control has no activation; actual contact is scripted separately. Time is seconds from a synthetic race start. `A` is studied duck, `B` another entrant. Unless overridden: A/B healthy and grounded, steady injury risk 0.10 each, independent injury draws A=.075 and B=.15, duration .5, cooldown 1.0, chance-to-activate succeeds. A's Guard halves only its injury threshold while active; these values are diagnostic only. The model must never infer a collision from a prediction or animation. Expected injuries in a real contact are A yes/B no without Guard; with active Guard A no/B no. For contact simultaneous with first prediction, this draft tests a **candidate** tie order: prior finish/end, contact and injury, then new activation; it is not an adopted production policy.

| Case | Script / differing input | Expected observation and paired counterexample |
|---|---|---|
| G1 | Predict .1, real contact .2. | Guard activates .1–.6; A no injury vs control A injured, B no injury in either. |
| G2 | G1, A draw .025. | A injured in both despite Guard; independent B unchanged. |
| G3 | G1, A draw .15. | Neither A nor B injured in either. |
| G4 | G1, A already injured. | Existing injury remains; no additional injury stack; no extension modeled. |
| G5 | G1 with sprint risk .20 for both, independent A=.15/B=.15 draws shared across paired arms. | A no injury with Guard vs injury in control; B injured in both. |
| G6 | Predict .1, contact exactly .6. | Window is half-open; ordinary A injury applies at end; no retroactive protection. |
| G7 | Predict .1, contact .8. | Guard cooldown active; A injury uses ordinary threshold. |
| G8 | Predict and contact both .1. | In this draft tie convention contact/injury first, then brace; A injury remains. This is a comparison convention requiring technical review. |
| G9 | Predict .1, no contact. | Brace and end/cooldown may be recorded; zero contact and injury in both. |
| Q1 | Real contact .2, A draw .075; authored recovery baseline 1.0 s, candidate .7 s. | Both record contact/A injury; candidate recovery ends .3 s earlier, with no claim about actual controller. |
| Q2 | Q1, A already injured. | Injury remains, candidate recovery milestone changes, no healing or change to injury rating factor. |
| Q3 | No contact. | No recovery activation or injury, control and candidate same event facts. |
| S1 | Real contact .2; scripted heading deviation 20°, Quick Recovery returns lane after .7 s, Straight Shooter initially retains 10° deviation but returns after 1.0 s. | Different authored heading and recovery consequences; real physical feasibility unobserved. |
| S2 | S1 plus a scripted obstacle on original heading. | Straight-line path is marked blocked; do not invent actual collision. |
| S3 | S1 plus scripted obstacle off original heading. | Recovery path marked blocked; do not invent actual collision. |
| D1 | Dive begins .1, grounded B occupies same horizontal position .2; no surface event. | No grounded contact while submerged; locator/state is a semantic label, not proof of visual behavior. |
| D2 | Dive .1; surface .4 at B's occupied position. | A real surface contact and independent injury draws; no teleport, no inferred protection on contact. |
| D3 | Dive .1; authored eligible crossing .3. | Record genuine crossing at .3 and end active effect; chosen synthetic crossing eligibility is not production approval. |
| F1 | Flight begins .1; grounded B shares horizontal position .2. | No air-to-ground contact; candidate slowdown on separate later landing is a declared value, not measured path. |
| F2 | Flight .1; airborne B and A meet .2. | Real air-to-air contact, independent injury draws; no Bounce protection. |
| F3 | Flight .1; occupied landing .4. | Real landing contact and independent injury; A injury remains possible. |
| W1 | Flap opportunity .1, no nearby target. | No target effect and no fabricated contact/injury. |
| W2 | Flap .1 names B, then separately authored actual contact .3. | Named lateral displacement is not injury; only .3 contact generates independent injury draws. |
| DR1 | Leader B qualifies .1; Draft starts .1. | Named target active until .6 unless terminated earlier; no predicted race placement. |
| DR2 | Draft opportunity .1, no qualifying leader. | No activation or speed-effect evidence. |
| DR3 | DR1, B genuinely finishes .3. | Named Draft terminates .3; no later effect and no artificial finish. |
| WB1 | Follower B qualifies .1. | A's Wake Break targets B during temporary window; no impulse/contact/injury. |
| WB2 | WB1, B finishes .3. | Target effect terminates .3, no post-finish influence. |
| N1 | Self-weave begins .2, authored deviation 16°, active Nerves reduces it to 12°. | Candidate self-weave deviation differs; no contact or injury implied. |
| N2 | Actual contact .2 creates 16° deflection. | Nerves does not modify contact deflection or injury eligibility. |
| X1 | Bounce active .1–.6, occupied landing .4, A draw .075/B .05. | Contact real; Bounce A fully protected; B independently injured. |
| X2 | Crowd and Draft independently eligible .1. | Distinct opportunities/activations; simultaneous speed-composition stays unspecified, so no claimed speed or placement. |

This table contains **32** rows, including two explicit Guard boundary/false-prediction cases added before any run. It is below the original 60-case ceiling, but expands the earlier 30-case draft and therefore requires root's express protocol clearance before execution. G8's tie rule, synthetic submerged crossing eligibility, recovery milestones, hazard labels, timing and thresholds are illustrative comparison assumptions, not owner-approved physics. If the eventual implementation cannot output an expected distinction without inventing a physical solver, label that comparison unobserved rather than force a pass.
