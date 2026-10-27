# Podium lighting and ambient motion review

2026-10-27. Root inspected committed presentation changes7a930fb and progress2fec165 after the owner approved the enlarged podium but requested full-environment lighting parity and looping first-place bob/second-third paddle. No model/production edits or numerical rerun were needed. Prior numerical and first-crossing evidence remains separate.

## Independent rendered verification

Fresh isolated IAB tab on approved localhost preview, selected individual-crossing default, normal Skip to settled result:

- Computed `#environment` filter was `brightness(0.43) saturate(0.75)`, matching race drama. Root saw pond/shore/track dimmed while podium ducks, names/Gems and upper racers stayed bright. This resolves the visible bright-pond mismatch in the owner's screenshots.
- Three separate podium shells had roles paddle, graceful-bob, paddle in left-second/centre-first/right-third display order. Root observed changing computed transforms after completion.
- Dedicated Pause podium motion held all three recorded shell transforms across400ms. Resume changed them again. A repeated Skip while explicitly paused retained the Resume podium motion choice and did not restart the loops.
- Manual static/reduced motion removed active transforms (all three `none`) and hid the ambient control. Poses stayed unchanged across300ms; matching stable environment lighting remained.
- Restart removed podium motion shells, hid the podium and restored environment filter `none`. Captured warning/error logs were empty. Root closed the isolated tab and released browser control.

Source review confirmed a separate accepted Plan20 controller instance and distinct race-induced pause tracking; shared motion source remains unchanged. The implementer's evidence additionally covers550ms race-pause stability during reveal, post-finish loops, scenario/seek cleanup and the controller's existing8tests including visibility handling. Root did not repeat physical document visibility or device/AT testing. No production save/Receipt/reward lifecycle claim follows.

**Disposition:** ready for owner visual review of matching lighting and podium loops. Packet remains in-progress; production integration and final owner acceptance remain open. No push/deployment. Implementer should hold changes/browser use pending owner feedback.
