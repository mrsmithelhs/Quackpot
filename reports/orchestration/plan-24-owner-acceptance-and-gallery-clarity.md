# Plan24 conditional owner acceptance and comparison clarification

2026-10-27. Owner accepts extracted artwork and scene-anchored lighting with host-overlay retained; further drawing polish is future work. Owner reports furniture choices not removing items except both-removed, with screenshots showing Display side and the first comparison panel.

Root and read-only Terra-medium review traced this to the unchanged baseline panel: gallery drives it to full unless BOTH flags are removed because the old page has no independent states. Extracted kit is the second panel, which may wrap below the first. `rooms/specs.mjs` independently controls couch and TV, and its interface tests cover all four combinations. No kit defect was reproduced. Root independently ran12/12 kit tests; reviewer also ran89/89 structural checks. Those establish source/interface evidence, not owner's visual acceptance of mixed scenes.

Root moved comparison labels above images and made the mixed-state warning explicit: original baseline remains fully furnished, choose Display only-kit to inspect selected removals. Labels show actual kit furniture flags. Gallery syntax checked; this small text/layout clarification was not browser-tested because Plan26 is allocated next. Kit and Plan26 pinned input unchanged.

Plan24 remains open only for disposition of this reported issue/remaining mixed-state look and recorded coverage limits. Do not reinterpret broad acceptance as approval of malfunctioning behavior. Ask owner to inspect only-kit; if removal still fails there, obtain exact state and repair it. Original baseline is intentionally unchanged. No source asset redraw, push/deploy or weather dependency.
