# Plan 20 main implementation source review

Date: 2026-10-26. Verdict: focused fidelity repair and remaining browser evidence required before owner rendered review.

Root inspected `94333a6` and reproduced all six focused controller tests. Independent read-only Luna-high review confirms two concrete mismatches against the owner-selected Plan09 reference; no new owner design decision is needed to preserve the selected motion.

1. `duck-motion-controller.mjs` paper() currently emits peak → partial → peak, never identity, and uses WAAPI delay/fill-both so the initial waiting pose is already separated. Restore the accepted gallery's identity-at-zero, identity-at-in-cycle-lag, peak at .48, partial settle at .74 and identity-at-one sequence, with existing factor-four values and durations. Preserve the approved parent assembly tracks. Do not import reports into production; port the actual selected construction faithfully.
2. Internal wing-mid/top and associated seam paths lack the gallery's view-box transform origins at52,56. Set the local origins for every rotated wing layer/seam, preserving head/group origins and ID isolation. Otherwise rotations occur about the SVG origin and add unintended displacement.

Extend focused tests to inspect animation keyframes/options and internal path pivots, catching these actual integration regressions without testing only literal counts. Preserve user pause, reduced motion, offscreen/inactive behavior, cleanup and neutral reset. No extra implementer reviewer for this focused correction; the main review consultation already belongs to this delivery.

Existing implementer production browser observations are encouraging but do not yet establish saved/reloaded revealed-card rigs or actual system-media true. Isolated smoke failed Chrome startup before page checks, so that is environment failure evidence only. Once browser slot is free, retry the existing temporary-profile harness with approved process escalation if necessary; request precise additional witness scope for specific gaps. Keep owner profile/settings untouched and no policy bypass.

No engine/schema/rig/race/Dex/rest expansion, package migration, status mutation or push. Return scoped fixes, meaningful checks, successful or explicitly limited isolated lifecycle evidence, main-review dispositions and final progress commit. Root will inspect the rendered corrected integration before owner acceptance.
