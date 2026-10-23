# Quackpot project seed

## What it is

Quackpot is a free, static browser gacha game used in CourseVGD to teach critical analysis of microtransaction design. Its canonical design document is [`docs/founding/design.md`](founding/design.md). Keep durable design definitions there; this seed brief records setup context and proposals without copying its tables.

CourseVGD is a user of Quackpot, not a dependency. The two projects have independent repositories and release cadences.

## Owner decisions recorded 2026-10-23

These decisions are adopted direction and await reconciliation into the founding document during Stage 3. Do not edit the founding document before that owner triage.

- **SVG-first art.** Author characters, environments, gameplay elements, and suitable animation as SVG source. Serve SVG directly or render an individual asset to PNG where that is a better fit. Do not use SVG as ordinary text rendering unless a text effect is impractical in CSS and JavaScript. This replaces the founding draft's generated banner/background plan; generated-image licensing is no longer a concern.
- **Immersion and vibe over readability.** Quackpot should feel like a game and a learning experience, not a website. It need not render every event as readable text or explain each interaction. Accessibility remains in scope; an accessible presentation may reduce spectacle while conveying core gameplay information.
- **Tooling proposals are open.** Libraries may be proposed, including CDN loading or a build tool that tree-shakes dependencies into shipped files. This conflicts with founding hard constraint #2 (no network calls) and #7 (no build step unless a later decision adds one). GATE-53B must reconcile those constraints, including whether build-time bundling is preferred to runtime CDN loading. No tooling or network policy change is decided here.
- **Player's own duck.** The story opens with the player's existing rubber duck. Setup names the duck and selects its look, reusing less extreme gacha duck assets. Recurring conversation moments use a silent duck, camera movement where useful, and the player's replies to carry the inner narrative. This feature is owner-directed; the reviews assess its placement, frequency, comedy timing, and contribution to the Receipt.
- **Shared review goals.** Seek high-valence wins and weighty metagame trade-offs, surprising shareable "Did you see that?" moments, and run-to-run variety that supports classroom comparison while reinforcing comparable lessons. No variant may soft-lock or prematurely end a run, trivialize its economy, or make its Receipt inaccurate. This is a guardrail, not a request for exhaustive per-variant fairness simulation.
- **Founding design review comes before development orchestration.** No development packets are authorized until GATE-53C.

## Founding review hold

The two independent design reviews and their synthesis are upstream of customization and development planning. Keep the founding document unchanged during review. After review, the owner triages recommendations and approves one integrated revision at GATE-53B. Do not create development packets before GATE-53C.

## Tooling intent (open, not decided)

- **Hosting:** serve the game as a static site from GitHub Pages.
- **CDN libraries and tree-shaking build:** the owner has opened these as proposals. They remain pending GATE-53B wording against hard constraints #2 and #7. Runtime CDN use introduces a network request; build-time bundling changes the no-build-step assumption.
- **Development-only tooling:** a local server, tests, and simulation are expected during development and are not shipped to players.
- **Asset source and rendering:** keep SVG source in the repository. Some assets may be rendered to PNG for Pages; whether any render step is needed remains open for review.

## Proposed structure (to be ratified later)

This is a proposal, not an approved architecture. Ratify it after the first build and deployment spike, because their constraints determine where sources, generated outputs, and Pages-publishable files belong. Publishing from `docs/` would collide with Bootstrap material.

```text
site-root/
assets/
  svg/       # authored SVG source
  rendered/  # optional rendered assets
game/      # game modules
sim/
tests/
docs/founding/
```

The eventual `game modules` location and build-output arrangement remain open; do not treat this sketch as a final folder contract.

## Expected first packets (prose only; after customization)

1. Seedable random-number generation and a headless economy simulation, using the founding design's broad checks rather than exhaustive per-variant balancing.
2. A v1 vertical slice that demonstrates the core five-minute experience and Receipt.
3. An SVG art system and sound effects.
4. A GitHub Pages deployment spike.

These are expected outlines, not packet files or authorization to begin. The founding review, owner triage, and customization gates come first.

## Open questions carried forward

From the founding draft:

- What is the final title?
- Is a teacher view compatible with the no-data-collection constraint? The draft suspects it is not.
- How much of the metagame belongs in five minutes, versus a longer optional play?

Additional questions:

- Which individual assets should ship as SVG and which should be rendered to PNG?
- What source/provenance notes are needed for manually generated jsfxr sound effects?
- What library or build proposals, if any, best support agentic development while satisfying the network-call and static-site constraints?
