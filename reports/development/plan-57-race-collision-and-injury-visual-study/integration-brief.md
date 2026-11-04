# Selected collision visuals — future integration brief

The owner selects **Angular pop**, **Scattered fragments** and **earlier burst A**, with the one-second white return on collision participants and attached bandage on an independently injured duck. Directional tear is not selected. Varying cues is selected forward intent; exact choice/versioning and production integration require a separate gate. No injury mechanic is selected.

The exact report-local assets shown to the owner, SHA-256:

| Role | File under this report | SHA-256 |
|---|---|---|
| Codex-authored pop | `art/distinct-motion-codex/pop.svg` | `463e90ab1ab3baf8c57f55ce2590c6736b77c7c44f56947058d131c704b8747c` |
| Fragment 1 | `art/distinct-motion-normalized/chip1.svg` | `18005d3d628a543b25a309db47735519debc14f3c3b63b20f98fcfb7dbd5e497` |
| Fragment 2 | `art/distinct-motion-normalized/chip2.svg` | `ee42c215a36266fb2f43f63211464269d932b6e5e880d508723d9aca71439eb0` |
| Fragment 3 | `art/distinct-motion-normalized/chip3.svg` | `d66050ca5dbf0f4382dc79e8fbe74a8d6b824133bff78e8da8d7d018f93fd851` |
| Fragment 4 | `art/distinct-motion-normalized/chip4.svg` | `9d5a96b35d5c651d3e9c72491de5982ecd6e6f55b6df55bc530f2f2f4ffa6856` |
| Earlier A onset | `art/burst-normalized/A-onset.svg` | `2ec65052f1810989c356605dc2d6c62c39eccdb8b8138eebe1f37250029dcd25` |
| Earlier A expansion | `art/burst-normalized/A-expansion.svg` | `9efad9cc32f99b2f76bbca7a98483767aacffd21b71c6ddbc46bcb5d859c26bb` |
| Earlier A breakup | `art/burst-normalized/A-breakup.svg` | `ae003f071a224e9a62b3398bf1f74d7cb97079bdece99f499b91b04fdd01c827` |
| Earlier A settle | `art/burst-normalized/A-settle.svg` | `2c393e87358416a1ba1cfcfd2e375b3ac60707eb5a0726522e5529d79a14677c` |
| Bandage | `art/adhesive-bandage.svg` | `008179e47152fac72ea0496d383e6b3f534e666b34001a38d6920849ee2f69a1` |

Earlier A means the **normalized** family viewport `18 25 138 138`, not the raw 256-square files. Its original-to-derived hashes are in `art/burst-normalized/manifest.json`; the fragment relationship is in `art/distinct-motion-normalized/manifest.json`. The pop is Codex-authored; the other selected SVGs came from documented bounded Haiku calls. Report artifacts do not become game dependencies.

## Gallery presentation contract

The owner reviewed clock-derived presentation in `gallery/gallery.mjs` (`23cdaaf72fa6cd59ed7b9b764ecafae9ca9d3b42cd9489efb253f0c89f0fe561`), `gallery/distinct-motion.mjs` (`446be5191357e9c2c27624827a1e4c2a38fd8c18b17c3eee8c19391878323b94`) and `gallery/burst-timeline.mjs` (`d8d77babe6c8ba5dc72323e318ca106a71352481e1ed0b476e70b68a2b125a26`). These exact gallery timings are review context, not selected production mechanics:

- **Pop:** contact-centered 0.8-duck-width box; scale 0.35 to 1 over 0–0.12 s, hold until 0.24 s, contract/fade through 0.65 s.
- **Fragments:** four chips each 0.18 of that cue box, moving along distinct fixed outward paths through 0.5 s and fading by 0.85 s.
- **Earlier A:** onset `[0,.12)`, expansion `[.12,.30)`, breakup `[.30,.52)`, settle `[.52,.85)`; common normalized viewport, cue at contact up to 0.8 duck width.
- **White and bandage:** selected participants' artwork fills ease from white over one second, retaining dark details and edge; the bandage is attached inside digital-duck artwork and follows its orientation. It persists only according to separately supplied injury state.

The report's foreground layer is pointer-inert and contact-centered; labels are independently positioned and upright. The scene, approach, trajectory, lighting, timing and controls are synthetic stand-ins, not the production camera or event contract.

## Future event, choice and lifecycle seam

An adapter needs authoritative **contact identity**, time, type and complete participant IDs; distinguish actual wall impact from non-impact overlap. Separately supply actual per-duck injury onset, current status and clearing. A collision cue never creates or infers injury; already-injured contact does not automatically extend it. Inspect current production and Plan55 semantics rather than adopting gallery fixtures as a schema.

Recommended exploration: derive the variant with a **presentation-only versioned keyed hash** of a stable run seed and contact ID, without consuming gameplay PRNG streams or changing race outcomes. This is a recommendation, not an implemented or selected algorithm. A later packet must choose hash/version, stable ID and ordering semantics, missing-ID behavior and whether variant choice is recorded or reconstructed across save/replay versions. Verify replay, repeated contacts and overlapping participants without outcome changes.

The future presentation interface must receive an explicit clock or reconstructed event age. Pause freezes it; seek/replay reconstructs cues and injury state without duplicate overlays or future injuries. A cropped view must not imply an absent participant was visible. Static/reduced motion suppresses pulses and travel and supplies a stable participant marker and textual injury equivalent. End, cancellation, navigation and teardown must clear owned nodes, animations, observers and listeners; instances cannot share IDs or clock state. Validate actual camera, turns, labels, dimming, wall geometry and contact placement.

## Evidence and gate

Root and lead reviewed the actual report-local comparison, including corrected narrow stills. Tests and isolated GPU-permitted captures support exercised states only. Earlier `--disable-gpu` headless sequences lost duck layers; the exercised AMD GPU-permitted configuration rendered intact. The owner's headed browser, other devices, assistive technology, continuous perception and general accessibility remain unverified. A separately scoped production packet and root/owner review are required; no production port, game-rule change, push or deployment is authorized by this selection.
