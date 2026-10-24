---
id: plan-08
title: Duck visual-direction prototypes and owner gallery
status: ready
depends_on: [plan-02]
gate: "Owner selects one or more visual directions before production SVG revision."
superseded_by: null
resolution: null
summary: >-
  A separate Gemini thread generates five visual styles with three shape variants
  each and builds a local HTML gallery for owner comparison before SVG authoring.
---
# Plan 08: Duck visual-direction prototypes and owner gallery

## Packet Metadata

- Packet id: `plan-08`
- Packet title: Duck visual-direction prototypes and owner gallery
- Status: (see frontmatter)
- Owner/model: one visual-exploration implementer in the owner's separate Gemini thread
- Date: 2026-10-24
- Packet type: investigation and visual prototype
- Mutation level: concept content and local preview HTML
- Approval gate: owner chooses directions; production SVG and animation follow separately
- Depends on: `plan-02` (accepted local build and paths)
- Expected artifacts: 15 generated concept images, local preview HTML, generation manifest, progress report

## Goal and context — self-contained Gemini brief

Quackpot is a fictional, static browser gacha game for high-school game-design students studying microtransaction design. The player operates a character in an apartment/life metagame who owns a physical rubber duck. Affection for that real-in-the-fiction object draws the character into a fictional gacha video game with digital collectible ducks. The game's eventual Receipt reports displayed cues and player actions, then asks about impact without asserting motives.

The current `src/assets/duck-placeholder.svg` is a build-spike placeholder. The owner wants a stronger base look. **Use your actual image-generation tool to create five distinct styles, three substantive variants per style: 15 individual concept images. Then assemble a local HTML comparison gallery.** This task ends with owner review, not an automatically selected winner or a production asset. If image generation or local file output is unavailable, report the actual limitation before spending effort; do not replace the requested generated concepts with CSS ducks, downloaded art, or empty placeholders.

Two representations matter. Gacha ducks are digital characters, primarily 2D, with eventual expressive animations and modular hats/accessories. The metagame companion is an inanimate physical toy: later camera angles, lighting and apartment backgrounds may suggest side-eye or emotion without autonomous duck animation. The same visual language may serve both, or the owner may select compatible different treatments. Do not impose one rig on both. This packet explores the base look; metagame view/lighting sheets and gacha motion have separate packets.

## Authority and non-goals

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/repo-structure.md`, canonical `docs/founding/design.md` Assets/Duck companion sections and `reports/orchestration/duck-representation-boundary.md`. Run `node scripts/dev/plan-status.js check plan-08` before work; stop if it fails.

The owner authorizes generated raster **concept references** in this report folder. Shipped game assets must still be authored as SVG; a raster embedded in an SVG wrapper is not SVG authoring. No game implementation, changes to Plan 02, production SVG revision, animation, real brands/people, remote preview assets, or publication. Work only in `reports/development/plan-08-duck-visual-direction-prototypes/`; other implementers may be active and their files must remain untouched.

## Required concept matrix

Use this fixed comparison setup: square canvas, full duck visible, consistent left-facing three-quarter view, centered, similar occupied area, warm yellow body/orange beak/dark eye, no text, hats, accessories, scenery, water, logos or dramatic pose. Ask for transparent backgrounds where the tool supports them; otherwise use one uniform neutral background and label it honestly. Each should clearly read as a rubber duck and remain plausible to reauthor with a modest number of SVG paths, groups and gradients.

| IDs | Style direction | Distinguishing visual language |
|---|---|---|
| A1–A3 | Bold friendly vector | Strong clean silhouette, confident outline, flat fills and minimal shading |
| B1–B3 | Soft rounded toy | Fuller volume, gentle limited gradients/highlights, smooth curves and restrained detail |
| C1–C3 | Quirky geometric cartoon | Economical geometric curves, slightly unusual proportions, playful fixed eye/beak placement |
| D1–D3 | Graphic arcade cel | Chunky shapes, decisive shadow planes, stronger contrast and angular accents |
| E1–E3 | Layered paper-cut | Overlapping flat shapes, subtle depth from a few layers, tactile impression without raster texture |

Across **every** style, variant 1 is balanced/classic, variant 2 is squat/wide with a broader beak, and variant 3 is upright/compact with a more distinctive head/tail silhouette. Variants must change proportions or construction, not merely recolor the same image. Keep palette, view and staging comparable so style and shape can be judged. These are descriptive directions, not instructions to imitate a named artist, franchise or company.

Generate actual individual files, not just a contact sheet. Inspect every result; repair missing/cropped/malformed ducks rather than silently substituting an unrelated image. Keep the requested scope at 15 concepts; report any failed calls and extra attempts honestly. Do not claim unobserved model identity, dimensions or transparency. Record the effective prompt and available generation metadata for each concept.

Keep provenance sanitized: no API keys, account details, signed download links or raw provider responses containing private fields in this public repository.

## Local owner-review gallery

Create `preview.html` with relative local image paths, HTML labels and minimal inline/local CSS/JS. It must open directly via `file://` without a build, fetch, CDN, external font, telemetry or account. Embed manifest data in the page or render it into HTML so file access restrictions do not force network loading.

Show all five clearly labelled style rows, each with its three A1–E3 cards. Supply comparison sizes (32/64/128/256 CSS pixels), light/dark/neutral backgrounds, an enlarged view, and a simple way to pin up to three candidates side by side. Preserve uncropped full-image inspection. If a generated image has an opaque background, do not present a CSS checkerboard as proof of alpha transparency.

For each card allow short notes and multiple choices such as “digital gacha direction,” “physical companion direction,” “borrow a feature,” and “discard.” Build a copyable review summary containing stable IDs and notes; use a selectable text area as the reliable fallback. The owner may choose multiple directions or combinations. No storage, upload or submission service is needed. Ensure controls work with keyboard focus and that labels do not rely on color alone.

Include short, clearly labelled observations about small-scale readability, silhouette differences, apparent SVG-authoring effort, attachment room for hats/accessories, and possible use for the physical metagame prop. These are qualitative judgments, not a selected winner or verified performance claims. Include a short note about which shapes seem promising for coherent close-ups/alternate views; do not generate extra view sheets in this packet.

## Work, validation and handoff

1. Inspect repository state and required sources, then generate the 15 concepts using this matrix. The owner has authorized this investigation; a second pre-generation permission question is unnecessary.
2. Build the gallery and generation `manifest.json` under the owned report folder. Use `concepts/a1.png` etc. (or actual tool-returned formats), `preview.html`, and `progress.md`. Keep generated-image provenance and final filenames consistent.
3. Open and inspect the actual gallery at a desktop width and at narrow width. Verify 15 working images, all style/variant IDs, size/background controls, pinning, keyboard focus and copyable summary. Check small thumbnails and enlarged views; note limitations rather than claiming SVG quality from raster enlargement.
4. Report where the preview is, actual generated outputs, which observations were checked, and remaining owner choices. Include the required consultation/degraded-mode declaration based on this thread's real tools. Do not set status, edit orchestrator notes, or declare production readiness. Commit only owned files, with the progress report last; never push.

**Stop after the gallery is reviewable.** The owner sends chosen IDs/features back to orchestration for Plan 04's base SVG. Keep Plan 02 closed as the build spike. No automatic production adoption is authorized.

## Delivery checklist

- [ ] Fifteen actual images and stable IDs match the manifest and gallery.
- [ ] The gallery opens locally; images, scale/background controls, keyboard focus and copyable owner notes were inspected.
- [ ] `progress.md` records observations, provenance, limitations and the consultation declaration.
- [ ] Only owned files changed; owner selection gate is preserved; no packet completion or ship readiness is self-certified.
