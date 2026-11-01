# Apartment viewport repair and Plan 40 simplification review

Owner request: fit the apartment and navigation in an ordinary laptop browser window; review Flash's simplified work sequence. No packet closure or production work-content integration was requested.

## Production layout

`src/ui/shell.css` uses a compact brand / resources / actions grid at widths of at least 1440 CSS pixels. Resource pills and controls retain wrapping when necessary. Smaller widths preserve the stacked layout. `src/ui/life/life.css` caps the complete 16:9 scene by viewport height as well as width, reserving space for the HUD, padding and navigation. Percentage-based art and targets scale together. No cropping, scroll suppression, engine, save or event changes.

Finite isolated Chrome component witness: `apartment-layout-check.mjs` mounts the real HUD and apartment renderers with an in-memory, explicitly synthetic Day 1 evening state. It does not load owner storage or run a full production journey. Results in `apartment-layout-results.json`; desktop screenshot in `apartment-layout-desktop.png` was visually inspected by root. Viewports: 1892×910, 1536×730, 1440×800, 1366×768, 1280×720, 1024×768 and 390×844. All desktop cases fit the scene and navigation without document scrolling; all cases have no horizontal overflow. At 1536×730 the header is 70.6px, scene is 842.7×474px, navigation bottom is 689.4px. Doubled text at 390px has no horizontal overflow; this is not browser-zoom or assistive-technology evidence. Very short windows and additional content may scroll normally.

The initial witness exposed 11px of bottom-padding overflow at 1536×730 despite navigation fitting. Increased the reserved wide-screen height by 1rem and added a whole-document-height assertion. Final bounded browser run: exit 0, 3.58s, peak sampled owned-tree private bytes 316,764,160, no stop/cleanup notes; browser tree termination and profile removal confirmed. Final bounded Vite build: exit 0, 1.04s, sampled 408,133,632 bytes. Ignored output regenerated. Existing owner server untouched.

## Plan 40 review

Reviewed Flash commits b178b30 and 8a3bb34. Requested read-only default-role reviewer `gpt-6.1-terra`, explicit `medium`, cold brief; tools accepted these settings, independently observed provider/model identity unavailable. The reviewer read source and evidence without running processes. Selected simplification is present: single departure, one direction of commute, two work paragraphs on one stage, then $60 payslip. Commute-in is default; homeward is a reviewer alternative. Investigation only, not imported by production.

Accepted and repaired both reviewer findings locally:

- Night-return gig card leaked the beat ID / author tone despite default hidden badges. Applied the same reviewer toggle there. Regression exercises real `renderStage` with badges off and on.
- Repeating one beat in both work selectors rendered two paragraphs but recorded one occurrence. Added explicit first/second occurrence slots, preserving rerender deduplication. Regression calls the real recording method twice per slot and expects exactly two exposures.

Focused bounded suite: 12/12 pass, exit 0, 0.54s, sampled 1,880,064 bytes, no stop/cleanup notes. First test attempt had an incomplete test fixture (missing prior committed-session marker), causing one failure; corrected the fixture and reran. No production rule or authored beat text changed. Prior Flash browser evidence covers default commute-in and the gig journey; the alternative commute-home path has progression tests, not equivalent rendered-walkthrough evidence. No new Plan 40 browser pass or causal claims about tone influencing players. Ready for owner experience review, not closed. Future production integration remains a separate packet/gate.
