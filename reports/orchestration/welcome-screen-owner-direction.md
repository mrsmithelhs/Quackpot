# Welcome screen — owner direction before packet creation

Date: 2026-11-04. This records selected intent and open design work, not production implementation or a started packet.

## Selected flow and controls

Owner wants an animated welcome screen for the whole experience, using game motifs and an auditioned locally rendered MIDI-derived soundtrack. Start a run from there rather than dropping directly into the apartment. Introduce/navigate toward the inanimate physical rubber duck and ask its name during the transition into apartment life. Existing kitchen naming UI is the replacement target, not another onboarding flow to retain alongside it.

Owner confirms:

- After Receipt review, return to the welcome screen with Start another run, Download usage file and access to View Receipt.
- Continue resumes a supported saved run at its saved location, bypassing naming/introduction.
- Opening Settings or Credits pauses the opening presentation and returns cleanly.
- Music hands off with fade out/in; exact durations and implementation remain unselected.
- The supplied screenshot identifies the existing kitchen duck-name field, automatic-saving checkbox and Start the morning submit as the current onboarding surface. Source inspection locates them in `src/ui/kitchen-setup-view.js`; `src/ui/desk-view.js` also retains historical naming/autosave UI and must be checked when mapping actual routes. Do not accidentally retain two reachable naming/initialization paths.

Preserve existing autosave preference and supported save safeguards; the checkbox's new placement/default presentation remains a proposal, not authority to silently remove the choice. Naming uses an editable default and must not require renaming on Continue. Physical companion remains inanimate; digital game ducks can have separately approved motion.

Settings, Credits and usage-file download are available from welcome. Existing export/storage/Receipt rules remain authoritative; no new package format, history retention or identity is selected. No-data download treatment, exact saved/finished-run menu composition, motion/static controls, interruption/focus and soundtrack passage/loop remain design details for the eventual packet. Never force a title animation/music wait before Start, Continue or exit.

## Creative process requested

Owner requests several purposeful creative rounds with Sonnet and Flash, then Haiku/Sonnet drawing support where new assets help. Explore original bitmap mockups from available image-generation routes, informed by accepted assets, before heavy code or drawing. Distinguish concept illustrations from actual SVG assets, runtime dependencies and selected UI. No generated mockup is production gospel.

Current bounded side investigation tests actual Antigravity `agy` image generation via a Terra-medium agent, informed by a separate official-source research agent. This does not generate production art or adopt a final welcome direction. Capability, model/backend identity, actual artifact generation/reference editing, private output placement, costs/attempt uncertainty and visual consistency must be reported from evidence. Do not assume the selected Flash reasoner is the image engine.

No welcome packet, source integration, soundtrack adoption/publication, push or deployment is authorized by this record alone.
