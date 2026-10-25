# Plan 04 delivery review — authoritative preview repair

**Date:** 2026-10-24. **Reviewed:** implementation `6056c3c`, report `aecc1db`. **Disposition:** return to `ready` for narrow Repair 01; owner rendered/sound acceptance remains open.

## Confirmed blocker

The controlling prebuild condition required the gallery to reuse the actual source composer/synth without a separately maintained implementation. Instead `preview.html:464–613` defines separate palettes and `composeDuck()` SVG construction; `preview.html:693–771` defines its own sound parameters and Web Audio scheduler. The tested implementations are `src/core/duck-rig.mjs` and `src/audio/synth.mjs`. The static `src/assets/svg/duck-rig.svg` is a third rendition with no documented derivation relationship.

The inline comment claiming identical logic does not establish parity. The source composer emits an accessible SVG label at `duck-rig.mjs:210`, while the gallery's own SVG implementation differs. Its audio startup/validation/fallback paths are also separately maintained. Source tests can pass while the owner reviews different markup or sound scheduling. This is an evidence/maintenance defect, not a judgment that the selected art direction is wrong.

## Verified and unverified

Root independently ran `npm test`: **122 tests pass**, including composer and audio tests. Source inspection confirms the requested head/hat/eye parentage and body-neck attachment, prefixed SVG references for explicit distinct prefixes, three palettes, two hats/two accessories and one effect. The bounded proof remains separate from production game UI. These facts do not establish visual quality or audible quality.

A requested cold read-only `gpt-6-luna` at high effort identified the duplicate-preview implementation; root verified the actual function bodies and source/gallery mismatch. Direct file-origin browser inspection was blocked by the browser tool's protocol policy; no browser workaround was attempted. No independent live rendered/audio, acoustic-level, device-compatibility or performance acceptance is claimed. The existing game smoke exercises unchanged gameplay, not this gallery, so it cannot prove source/gallery parity.

## Required return

Use `repair-01.md`. Preserve the current art direction, small proof set and source ownership. Generate or serve a preview that uses the real modules and document the single vector-source relationship. Return that witness for visual/sound review. No additional generic preflight, full asset catalog, animation production or gameplay integration is requested.
