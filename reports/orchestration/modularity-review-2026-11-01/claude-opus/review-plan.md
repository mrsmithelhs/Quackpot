# Review plan — claude-opus lead (Stage A)

- Startup HEAD: `383765b63f0a188fe889800118515dff8a6f3a0a` (adds only the review handoff docs on top of pinned baseline `96c1b96`). Working tree clean at start.
- Lead: Claude Opus 5.5 (`claude-opus-5-5`, harness-configured; effort not exposed to me beyond session defaults). Helpers requested: `model: haiku` via the Agent tool; actual identity not independently observable.

## Causal hypotheses (to confirm or refute)

H1 **Surface-replacement on integration.** Integration packets add one selected behavior by building a new surface/route (e.g. Plan38 `life_phone` hub) rather than editing the existing seam; the new surface inherits the *prototype's* surroundings, so accepted adjacent presentation silently drops out.
H2 **Provenance loss.** Owner selections are recorded as "selected mix / accept preview" without an explicit split of selected-new vs faithful-context vs placeholder; qualifications decay across synthesis → packet → handoff.
H3 **Verification aimed at the new feature only.** Checks assert the new behavior (often on synthetic component mounts) and do not assert neighbouring accepted behavior; tests were updated to the new DOM rather than failing.
H4 **Semantic ownership gaps.** `main.js` + phase/phone-context state are shared contracts with no single owner; disjoint-file packets still collide semantically (e.g. phone artwork keyed on phase vs target keyed on work availability).
H5 (competing) **Intentional direction change / late discovery**: some "regressions" are owner-changed direction or things no implementer could know.
H6 (competing) **Rushed amendments/orchestration sequencing**, not architecture, explain most repairs.

## First-pass cases
1. Plan13 → Plan23 race (orientation/camera/motion/lighting/podium/labels).
2. Plan28 → amended Plan38 life integration and its repair series (02/03/05).
3. Session hub vs accepted gacha UI; HUD/phone-context; resolved-object (2026-10-31/11-01 repairs).
4. Comparison: Plans 24/34 extraction (unmounted) and Plans 19/44 shell/Receipt.
5. Checkpoint tooling Plans 16/35 + `apartment-layout-check.mjs` witness.
6. Active Plan47/45 safeguards and future stress paths (47/48/46/weather/audio/36).

## Initial Haiku helpers (6, read-only, compact handbacks)
- A race chain history; B Plan28→38 chain; C session-hub/HUD/resolved-object origin; D success comparison; E checkpoint tooling & write side effects; F `main.js`/engine coupling map + Plan47/45/46/48 touchpoints.
Lead keeps synthesis, verifies load-bearing claims directly against git/source. Execution only if it discriminates; default is source/history evidence.
