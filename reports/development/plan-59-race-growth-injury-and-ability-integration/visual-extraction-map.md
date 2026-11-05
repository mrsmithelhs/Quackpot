# Plan 59 — unmounted visual extraction map

Prepared before extraction on 2026-11-05. This map covers the source pins and planned outputs below. It authorizes no runtime mount, game semantics, production acceptance or new artwork. Owner selections are Plan58 `selection-and-evidence.md` and Plan57 `integration-brief.md`; effects remain separate from actual contact, injury, activation and rewards. No report file is a runtime dependency.

## Ability source and output map

All source paths below are relative to `reports/development/plan-58-race-ability-animation-study/gallery/`; SHA-256 is the current pin. Planned production-owned output is `src/ui/race-effects/ability-effects.mjs` with a pure `kind/progress/idPrefix/pose` input and separated layered markup/pose descriptors. `src/ui/race-effects/visual-effects.test.mjs` is the focused test. The report-local visual fixture/gallery stays under this Plan59 report directory.

| Source | SHA-256 | Selected output |
|---|---|---|
| `revision-effects.mjs` | `3EE89813F8D127452CF89F1F0D7B5430ABBD9BA7C408CA59CEC034033AC73A6E` | Bounce revised pad/arrows and Crowd revised wave and two-depth airflow |
| `candidate-effects.mjs` | `B3447007EB0F284F52466E9E6B163B75CB51FF4D4C6A90B3FFBCAB2B06831972` | Guard B arc, Quick Recovery A arc, Dive revised A layered spray and ring |
| `alternatives-effects.mjs` | `627C2409120F56DD9AFAD8C302375FB39AC94E748C7416687DB7DCCDBD03BD93` | Wide Flap A outline, Flap Ahead A shadow plus B arcs, Draft A layered wake, aerodynamic head pose |
| `final-three-effects.mjs` | `C281614986B4D0789E8D14BD47A590DE1EF32C8F7543FD375FC20318FA7E9693` | Straight Shooter A, Steady Nerves revised A, Wake Break B |
| `gallery.mjs` | `679B9EB7965F2369EAC82FD99DCF23C6F7417BA048C0C83643B819F0E02BA5F0` | Selected body/head/wing pose composition, Dive opacity/immersion, visual-only static values |
| `fixtures.mjs` | `8033BD125BAD70D9EA5D071F4223CFF34AF31A50BFAAB8C1AB2B0BA189FA43A2` | Illustrative ability preview durations, added to the map before the fixture timing repair |

The 11 named treatments are Bounce, Crowd Surge, Guard, Quick Recovery, Dive, Wide Flap, Flap Ahead, Draft, Straight Shooter, Steady Nerves and Wake Break. Burst is not an ability treatment. The dynamic Draft geometry is caller-supplied presentation geometry; no participant eligibility is inferred.

## Collision and injury source and output map

All paths in this section are relative to `reports/development/plan-57-race-collision-and-injury-visual-study/`. The named SVGs are to be copied byte-for-byte to `src/assets/svg/race-effects/` under the same basename (`pop.svg`, `chip1.svg`–`chip4.svg`, `A-onset.svg`, `A-expansion.svg`, `A-breakup.svg`, `A-settle.svg`, `adhesive-bandage.svg`). `src/ui/race-effects/collision-effects.mjs` ports only selected timing/visual descriptors, including the one-second white return and independent bandage visibility. No presentation choice draws game RNG.

| Source | SHA-256 |
|---|---|
| `gallery/distinct-motion.mjs` | `446BE5191357E9C2C27624827A1E4C2A38FD8C18B17C3EEE8C19391878323B94` |
| `gallery/burst-timeline.mjs` | `D8D77BABE6C8BA5DC72323E318CA106A71352481E1ED0B476E70B68A2B125A26` |
| `gallery/gallery.mjs` (white-return palette application) | `23CDAAF72FA6CD59ED7B9B764ECAFAE9CA9D3B42CD9489EFB253F0C89F0FE561` |
| `art/distinct-motion-codex/pop.svg` | `463E90AB1AB3BAF8C57F55CE2590C6736B77C7C44F56947058D131C704B8747C` |
| `art/distinct-motion-normalized/chip1.svg` | `18005D3D628A543B25A309DB47735519DEBC14F3C3B63B20F98FCFB7DBD5E497` |
| `art/distinct-motion-normalized/chip2.svg` | `EE42C215A36266FB2F43F63211464269D932B6E5E880D508723D9ACA71439EB0` |
| `art/distinct-motion-normalized/chip3.svg` | `D66050CA5DBF0F4382DC79E8FBE74A8D6B824133BFF78E8DA8D7D018F93FD851` |
| `art/distinct-motion-normalized/chip4.svg` | `9D5A96B35D5C651D3E9C72491DE5982ECD6E6F55B6DF55BC530F2F2F4FFA6856` |
| `art/burst-normalized/A-onset.svg` | `2EC65052F1810989C356605DC2D6C62C39ECCDB8B8138EEBE1F37250029DCD25` |
| `art/burst-normalized/A-expansion.svg` | `9EFAD9CC32F99B2F76BBCA7A98483767AACFFD21B71C6DDBC46BCB5D859C26BB` |
| `art/burst-normalized/A-breakup.svg` | `AE003F071A224E9A62B3398BF1F74D7CB97079BDECE99F499B91B04FDD01C827` |
| `art/burst-normalized/A-settle.svg` | `2C393E87358416A1BA1CFCFD2E375B3AC60707EB5A0726522E5529D79A14677C` |
| `art/adhesive-bandage.svg` | `008179E47152FAC72EA0496D383E6B3F534E666B34001A38D6920849EE2F69A1` |

## Review and limits

The Plan57 `gallery/gallery.mjs` row was added after the initial extraction map and implementation of white-return descriptors; its source hash matched the integration brief on the subsequent check. The initial pre-extraction map named the selected white return but omitted that source row. This ordering error is retained here rather than claiming the full source map preceded every extraction.

The historical `capture-03` launcher actually exited 0 after the visual assertions passed, but its cleanup observation explicitly had `uncertainty: true` and `treeTerminationConfirmed: false`. Its prior acceptance predicate was therefore defective. The 44 images remain an owner-reviewed unmounted artifact; historical exit 0 is not rewritten as strict cleanup success. Public capture receipts now separate `artifactChecksPassed` from `cleanupFullyVerified`; process identities and local paths are omitted, with byte-for-byte original receipts and launcher output retained locally in ignored `.log` files. The owned capture scripts were subsequently amended to fail closed unless the artifact checks and strict cleanup predicate both pass. Their source hashes therefore differ from their capture-time pins. The corrected policy and its focused test have not been run, and no fourth capture was made.

The report-local gallery/fixture will exercise static, paused, seek/replay and cleanup contracts without claiming rendered browser, device, accessibility, production or balance evidence. Pure outputs take explicit display progress/pose only; caller owns the clock and lifecycle. Asset and source pins must be verified again at extraction; the new modules must import no report files. Collision pop, fragments, burst and injury are distinct inputs, never inferred from each other. Source/art outputs and evidence stay unmounted pending separately scoped integration and root review.
