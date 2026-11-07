# Cross-runtime race replay evidence

This is the retained evidence for the diagnostic described in `midday-phone-bridge-progress.md`. The witness `midday-phone-bridge-attempt3/day2-session-finished.save.json` was generated in an isolated browser from the tracked synthetic parent `session-panel-witness-attempt1/finished.save.json`, using `midday-phone-bridge-capture-v3.mjs`. It is not an owner's browser save. Its SHA-256 is `fa2b8bedd68bd90e62304d376561a679f1dccdef706ad4e7037db24951479acc`.

The browser and Node harnesses pin source closure `e21451a4f1d9ce50e69ff44080b197f6f15189aa206571b45b59b4b10e39349f` and the witness above. Their retained computed resolutions and summaries, plus `race-cross-runtime-browser-attempt1/comparison.json`, support the reported 16 differing fields and first lateral-coordinate mismatch. These are historical investigation artifacts, not claims that the scripts can run against today's source or build without restoring the pinned inputs. The browser job's process cleanup remained sampled-only and unproven; the evidence does not establish clean full-tree teardown. No replay tolerance or policy fix is implied.

Raw process traces and other attempt artifacts remain local and were not included in this evidence selection.
