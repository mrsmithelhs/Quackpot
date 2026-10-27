# Podium size and track dimming review

2026-10-27. Root reviewed b85accf/083f254 presentation-only changes and the implementer's desktop/narrow evidence. Controller syntax check passed. No model edits or numerical rerun were needed. Packet remains in-progress.

Root independently opened a fresh isolated IAB tab at the approved localhost preview, skipped to the settled result and inspected the rendered composition and DOM dimensions. Duck art is176×176 source units versus88×88 previously (2×); label/card width252 versus128 previously (about1.97×), label height126 versus72. Platform width216 versus120 (1.8×), with widened spacing and adapted vertical placement so upper finishers remain visible. A literal2× vertical expansion would crowd the500-unit stage; that adaptation is disclosed rather than described as exact uniform scaling.

All three current name/Gem labels fit their boxes without horizontal or vertical overflow. The track dim is now an even-odd path matching the oval ring at opacity0.52, replacing the former full-scene rectangle at0.34. Root saw the distinctly darker track, bright pond/podium, readable awards and finishers above the enlarged composition. A stable fresh-tab recheck after the final source commits confirmed the settled podium and label fit; root closed the tab and released browser control.

An earlier full-page screenshot unexpectedly showed a reset initial race after a settled viewport observation during delivery authoring. Root did not treat that capture as settled-state evidence and repeated the settled viewport check after commits. No additional runtime defect was established by that capture.

The implementer's390×844 check reports no current-label overflow, but effective text around8CSS pixels remains a phone-width readability limit; root did not independently repeat that viewport or establish future long-name fit. Desktop labels were about195.5×97.7CSS pixels with roughly17px effective text in its measured1280×720 session. This accepts the bounded owner-requested enlargement/dimming for renewed visual review, not a complete responsive production UI.

**Disposition:** ready for owner visual review of the larger podium/stronger track dim. Existing crossing mechanics and reveal timing remain unchanged; no production adoption, packet closure, push or deployment. Implementer should hold for owner feedback.
