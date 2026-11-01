# Ren — future integration proposal and boundaries (draft 1)

**Not an authorization and not a plan to write production.** This lists what a later bounded packet would need, so the owner and root can judge size before asking for it. Plan 41 changed no `src/`, save schema, event taxonomy, numeric constants, fixtures, decision log or status. Nothing here is selected unless `01-owner-selections-and-proposals.md` says so.

## 1. What Plan 41 delivers vs. what stays outside

| Delivered here (report-local) | Not delivered / separately gated |
|---|---|
| Character brief, voice, owner-vs-proposal ledger | Final model sheet or final art |
| Direction A concept studies (round 1 and 2), five expressions, door/hallway composition, phone avatar mock | Production SVG assets (separate Sonnet SVG packet; `AGENTS.md` SVG routing) |
| Interaction menu, consequence model, six symbolic traces, possession-sale examples | Any rule adoption, numeric tuning, new event/save fields, new endings |
| A report-local storyboard with synthetic states | Anything that reads or writes game state |
| Research provenance (visual + mechanics); report-local Gemini concept sheets and SVG concept drawings (outfits, hair, headgear, pencil placements, apartment compositions; provenance in `07-...` and `concepts/gemini-round-01/manifest.md`) | Any of that as final game art; production image generation |

## 2. Dependencies on other plans (not resolved here)

- **Plan 37 / Plan 38 amendment:** phase, anchor, maintenance, "Tell/communicate" conflict confirmation, once-only transaction IDs, bedrest ordering and the Day 1 evening unlock. Ren's Evening anchor, gap counter and invitation expiry (by phase transition) must be modeled in the same resolver, not a private clock.
- **Plan 29:** `h` (visit restore), `H_leisure` (Call Mom), `g_R` (Ren gap), `B`/`U` (strain thresholds), meal skip −5 (selected). A visit-every-available-Evening strategy must be added to Plan 29's strategy set to check that Ren is not a dominant HP source.
- **Plan 40:** ordinary work/evening presentation. Plan 41's door scene and "Call Mom" are not coordinated copy; the first-evening candidate stays Plan 40/37's.
- **Plan 36:** perceptual spillover. Ren's messages are never restyled as offers or events in this study.
- **Plan 27:** Receipt Layout A. Ren facts need rows in the displayed/you-did/consequence registers (see 03/04).

## 3. Exact needs a future integration packet would have to answer

**Assets (SVG, authored in a later bounded task; the round 2 SVG is concept only):**
- Ren bust (message avatar) with the five expression faces (`warm`, `laugh`, `tease`, `not-tonight`, `long-day`), one selected complexion.
- Ren half-body for the door view with forearm/tattoo placement, holding-box variant.
- A door/hallway view in the apartment kit's language (no such view exists in `src/assets/apartment/`; the kit has `living`/`kitchen`/`bedroom`).
- Optional: couch-removed floor-seating variant for Example 1 (the kit already has `couch: removed`).

**Modules/state (names are suggestions, not contracts):**
- A tiny invitation/relationship ledger: `{invitationId, kind, phaseOffered, state, rescheduleCount}` plus `renGap` and `relationshipFlag`, saved with the existing envelope and versioned.
- A pure resolver extension (not new `main.js` logic) that evaluates availability, expiry-by-phase and flag changes, with `h` applied by a once-only transaction.
- A phone message view and a door view, reusing the Plan 28/38 message and conflict-confirmation grammar.

**Events (for the Receipt, **proposed taxonomy only**):** `ren_invitation_shown`, `ren_invitation_reply`, `ren_visit_completed`, `ren_plan_cancelled_with_notice`, `ren_plan_broken`, `ren_flag_changed`. All three registers must stay separate (displayed / you did / automatic consequence). No event may infer feelings, loneliness, addiction, intent or influence.

**Save/reload:** exact once-only HP application; mid-scene resume; cosmetic scene variants from a separate seeded fork (never the draw/race/event streams); expiry computed from phase transitions only.

**Uninstall/static equivalents:** Uninstall stays in the canopy; every scene has a text equivalent (see the storyboard transcript); no motion beyond what exists.

## 4. Risks to settle before any build

1. **HP exploit via visits:** a calibration question for Plan 29, not solved by the gap alone.
2. **Voice tone:** Ren's texts can drift toward "wholesome lecture" or "guilt notifier"; every line should be reviewed against the research patterns (no repeated sadness, no badge pressure).
3. **Heritage handling:** the brief puts it in optional family/craft details rather than a face; if the owner prefers none written, the character still works.
4. **Look consistency:** Direction A matches the kit's line weight on paper; actual fit with kit renders is **unchecked** because the apartment kit modules were not rendered here.
5. **Scope creep:** outside scenes, a Ren home, endings and gift economies are deliberately not proposed.

## 5. Suggested next owner decisions (in priority order)

1. Approve or amend the interaction menu (03), especially Evening-only first wave and the optional ask-Ren feature (I4).
2. Approve or amend the consequence model (04), including that *drifting/strained* reduces Ren's initiative.
3. Choose complexion/blend. (Updated 2026-10-31: tattoo is arm-only, S9; pencil placements are all kept as options, S12.)
4. Approve or change the possession-sale principle and Example 1 (05).
5. If approved, request a bounded art packet and a bounded mechanism proposal (Plan 38 amendment) as separate steps.

## 6. Owner answers recorded 2026-10-31 (see ledger S22 to S26)

- First art packet scope is all three tiers: phone bust with five faces, half-body door view, and in-apartment Ren (needs a chair/armchair prop and refreshed scenes).
- Add a shelf prop and a gifted-shelf scene; add gift-reaction and sale-reaction events to the proposed (non-binding) event vocabulary.
- The Plan 29 visit-every-Evening check is advisory, not blocking.
- Outdoor scenes, Ren's home, endings and a gift economy stay out of the first build.
