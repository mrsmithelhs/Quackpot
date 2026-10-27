# Duck-Dex copy and catalog-growth recommendations

Date: 2026-10-27. Owner generally approves the rendered feature and asks for friendlier detail-screen language and a scaling assessment. These are recommendations, not implemented copy, catalog expansion or packet closure. Technical acceptance remains recorded in review04.

## Proposed player copy

For an undiscovered duck, title **Not collected yet**, retain the rarity badge and silhouette. Avoid “Unowned Identity.” Suggested compact fields:

| Field | Example |
|---|---|
| Collection | Not collected yet / In your collection |
| Speed | 20 |
| Set | Pond of Destiny |
| Racing | Collect this duck to race it / Ready to race |
| Chance to pull this duck | 2% starting chance |

Use one identity-specific chance in the primary panel rather than two adjacent technical rows. It must be derived from canonical banner weights and clearly labeled as starting odds; it is not the current conditional chance. For the current sole Legendary, the starting chance is2%; that must not silently remain each Legendary identity's chance after catalog expansion. If current adjusted odds are shown instead, label that explicitly and use the actual pity/banner state. Necessary odds/terms remain accessible; no pressure-analysis helper is added to live play.

Optional plain explanation: “Your chance of a Legendary grows after enough pulls without one. You're guaranteed a Legendary by your50th pull without one.” This is the current rule; the guarantee is for the rarity, not a specific duck once multiple Legendary ducks exist. Do not use “guaranteed at50 pity.” Derive details from the real rule rather than duplicating thresholds in copy. Future rest should replace unconditional readiness with supported actual availability/effective Speed.

Other copy candidates: “Your collection” rather than “Total Roster Discovered”; “Display shelf” or simply “Ducks” rather than requiring players to understand “Curio Shelf.” No unselected set bonus/value is invented.

## Source-based scaling assessment

Good foundations: stable duck IDs; collection projection uses roster iteration and Sets; actual counts derive from roster length; rig composition and cosmetic mapping are separate from inspector rendering; CSS grid adapts to available width; newly discovered state is per identity rather than tied to a particular card slot.

Limits verified in current source:

- `src/ui/duck-dex-view.mjs` hardcodes tier pool counts/identity probabilities in `TIER_POOL_INFO`, selects only `sets[0]`, and hardcodes the inspector's set name. Adding catalog records alone makes these facts stale.
- `src/core/game-engine.mjs` binds the projection to `BANNER_1_ROSTER` and constructs one set. It does not yet express a cross-banner catalog with explicit set membership, availability and banner weighting.
- Opening/closing the inspector calls `renderView()`, rebuilding all shelf SVGs and handlers. Per-slot `.find()` over the roster also adds avoidable quadratic lookup work. The acquisition controller independently renders the complete shelf for each new discovery. This has no measured large-catalog performance result yet.
- No search/filter/grouping/pagination, visible-range rendering or shelf position restoration is implemented for large browsing sets. Decide what is needed from actual synthetic-roster browser measurements rather than claiming a supported duck-count limit now.

Recommended bounded follow-up before substantial expansion: one catalog/banner/set source with stable IDs and derived odds; a focused inspector mount that leaves the shelf intact; reuse shelf rendering/data rules for acquisition; practical grouping/filtering with preserved navigation/focus; measure realistic synthetic30/100/300-entry fixtures on target viewport/device classes before adding virtualization or a framework. Validate existing-save compatibility when extending the catalog, plus multi-banner/weighted identity odds and reveal secrecy. A new framework or broad engine rewrite is not required by the current evidence.

These growth obligations do not retroactively invalidate the delivered six-duck mechanism feature. Owner can approve wording refinement separately from the future catalog integration.
