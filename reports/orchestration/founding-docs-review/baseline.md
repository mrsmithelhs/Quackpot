# Quackpot founding design baseline

- Baseline path: `docs/design.md`
- SHA-256: `BD50ADF55F92CCD8003160541BE67FC8BB6CBC47BEBCB37913C2DD825BBE6999`
- Observation date: 2026-10-23
- Current location after Bootstrap initialization: `docs/founding/design.md`
- Integrity check: the moved file's SHA-256 matches the pre-move hash; no design edits were made.

## Owner decisions recorded after this baseline

The following owner decisions were recorded on 2026-10-23 after the design baseline was captured. They are adopted direction for review and later reconciliation, not edits to the baseline document:

- The repository is **Quackpot**, public, and hosted on the owner's personal account. The canonical founding document is `docs/founding/design.md`.
- **All art is authored as SVG source**: characters, environments, gameplay elements, and animation where appropriate. Each asset may be served as SVG or rendered to PNG when appropriate; SVG is not used for ordinary text. This replaces the baseline's generated-banner/background plan and removes generated-image licensing as a concern.
- Immersion and vibe take priority over readability. The product should feel like a game and a learning experience rather than a website. Accessible presentation may reduce spectacle while preserving core gameplay information.
- Libraries and tooling may be proposed, including CDN loading or a tree-shaking build. This opens a conflict with hard constraints #2 (no network calls) and #7 (no build step unless later decided); GATE-53B must reconcile the wording. No library, CDN, or build choice is adopted here.
- The opening begins with the player's own rubber duck: the player names and styles it using less extreme gacha duck assets. Recurring silent-duck conversation scenes use the camera and the player's replies to carry the inner narrative. Reviewers assess pacing, frequency, and Receipt value; the feature itself is owner-directed.
- A two-lens founding design review must precede development orchestration.
- Shared review goals are high valence, surprising and shareable "Did you see that?" moments, talkability across different runs, and variety that cannot soft-lock, prematurely end, trivialize, or misreport a run. These are guardrails, not a request for exhaustive fairness simulation.
- Each reviewer conducts bounded research on enjoyable gacha mechanics from its own lens, excludes sexualized content and character design, cites sources, and maps mechanics to Quackpot and the Receipt.

