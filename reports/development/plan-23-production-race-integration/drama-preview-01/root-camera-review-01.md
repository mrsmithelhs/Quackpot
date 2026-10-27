# Camera repair — independent verification

Date: 2026-10-27. Owner reported missing camera zoom before reviewing the isolated race. Root assigned a bounded presentation-only repair. The cause was the preview defaulting to Locked wide; the scripted easing path was already present. The default is now explicitly Eased close mid-race, then wide, while Locked wide remains available.

Root verified in a fresh isolated in-app tab: the new default is selected; Skip to finish produces identity camera transform; seeking the recorded8.15s/tick163 weave event gives `matrix(1.0708 0 0 1.0708 -165.84 -92.11)`; enabling static/reduced motion at that event returns identity. Captured warning/error logs were empty. Root then closed its tab and released the browser slot.

Implementer evidence additionally samples the easing ramp during ordinary playback, pause stability, early/late seek, restart, locked-wide override and unchanged committed-resolution fingerprint. See the camera section of `evidence/browser-observations.md`. Root's independent check is narrower; it does not claim exhaustive camera trajectories or production behavior.

This repair is accepted for the report preview. No physics, outcome, seed, payout, save or Receipt behavior changed. Owner should reload the existing preview tab to load the revised default, or explicitly select the eased camera mode. Numerical candidate adoption, production integration and packet closure remain open.
