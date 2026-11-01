# Plan 41 — Ren friend character and social life study: progress

## Current delivery summary (root-requested reconciliation, 2026-10-31)

The S1–S58 ledger is authoritative and its numbered choices remain unchanged. Files 01, 03–06 and 09 now describe current owner-selected directions separately from unresolved mechanism details and unreviewed art. Plan29 and Plan37 remain closed investigations; Plan38 remains the accepted production base; any Ren lifecycle implementation needs a new bounded mechanism packet. Plan44 is the active production Receipt consumer. No render, test, build or new visual review was performed for this documentation reconciliation. Puffer vest v3, dust looks, and the floor game-night scene still await owner visual acceptance where noted.

Date: 2026-10-31 (system clock). Lead/integrator: Claude Sonnet 5.5 in Claude Code. Packet readiness: `node scripts/dev/plan-status.js check 41` returned `RUNNABLE: plan-41 is ready to implement` (exit 0) before any edits. I did not edit packet status, resolution, the generated packet table, or any file outside `reports/development/plan-41-ren-friend-character-and-social-life-study/`.

## Overall summary

I ran the packet's workflow with the owner: a short conversation (two rounds, eight selections), research by two Haiku helpers, three SVG concept rounds, an interaction menu, a consequence model with symbolic traces, a possession-sale study, a synthetic storyboard, and an integration boundary proposal. **This is a coherent owner-review package, not a final design and not an adoption of any rule.** Owner selections and lead proposals are separated in `01-owner-selections-and-proposals.md`; every other document restates its own labels.

**Owner selected (this thread):** Ren is a neighbor down the hall (S1); a tinkerer/maker (S2); present through phone plus door/hallway (S3); they/them (S4); art direction A soft flat (S5); short tapered curls (S6, complexion range remains a lead proposal); a visit is a bounded restore with Ren having their own load (S7); relationship tracked by small qualitative flags with no number (S8; names and thresholds are proposals).

## Files (all new, in the owned folder)

| File | Purpose |
|---|---|
| `01-owner-selections-and-proposals.md` | Selections S1–S8 vs. proposed/open items; coordination boundaries |
| `02-character-brief.md` | Who Ren is, voice, wants, boundaries, heritage-as-characterization; labelled |
| `03-interaction-menu.md` | Six interactions (quiet text, door chat, shared activity, ask-Ren, invitation replies, repair), each with eligibility, class, commitment, display, effect, limits, save/reload, Uninstall/static, Receipt mapping |
| `04-consequence-model-and-traces.md` | Flag model, exploit check, Traces A–F, save/reload requirements |
| `05-possession-sale-examples.md` | Couch/game-night consequential example; ordinary TV example; optional gifted-shelf example |
| `06-integration-boundaries-proposal.md` | Asset/module/state/event needs, dependencies, risks, next decisions |
| `research/visual-reference-provenance.md` | Sources, licenses as reported, how each informs the design |
| `research/friendship-mechanics-provenance.md` | Sources and patterns for friendship, declining, decay, well-being |
| `concepts/round-01-directions.html` | Three original SVG directions × two variants, avatar and silhouette checks |
| `concepts/round-02-refinement.html` | Direction A refined: complexion range, five expressions, door/hallway scene, phone avatar mock |
| `concepts/round-03-storyboard.html` | Synthetic storyboard: six scenarios with a separate reviewer control panel and static transcript |

## Delegation and tools actually used

- **Haiku researcher helpers (read-only web), two:** one for visual/character-design references, one for friendship/availability/decay mechanics. Disjoint outputs; neither wrote files. The lead wrote both provenance sheets from the helpers' hand-backs and **did not re-fetch their pages**. Helper-reported "fetched" vs. "snippet" status is preserved; many mechanics sources are fan wikis, blogs or forum posts, and some pages were unreachable. No model identity or artist attribution claims were accepted without evidence, and none were relied on.
- **Image generation: not used.** This session exposes no image-generation tool (a ToolSearch for image-generation tools found none, and the repo's `.claude/agents` definitions contain no image-generation agent; I did not complete a skill search, so a skill-based route is unchecked. Earlier packets used a Gemini image subagent that is not part of this harness), so I produced **original SVG studies by hand** instead and did not claim generated images. No raster concept files, prompts, model metadata or generation provenance exist for this packet.
- **SVG authoring:** done by the lead (Sonnet, per `AGENTS.md` routing); no Haiku drawing helpers were used.
- **Single writer:** only the lead wrote files. No git-index writes happened concurrently.

## Commands run and results

- `node scripts/dev/plan-status.js check 41` → `RUNNABLE`, exit 0.
- Read-only file/search commands; `git status`, `date`.
- The Plan 25 bounded Node launcher was **not needed**: no Node or build job was run. The only scripting was `sed` to splice the shared SVG sprite into the storyboard page.
- Browser: the built-in browser pane opened the three HTML files as static `file://` snapshots. No dev server was started or stopped; no network was used by the pages.

## What was actually viewed (validation)

- **Round 1** viewed at about 448 px width: all three direction cards (six figures) rendered; direction A's avatar crops (96/48 px) and silhouette test viewed; B and C avatar/silhouette rows were **not** individually inspected.
- **Round 2** viewed at about 616 px width: expressions row (five faces at bust scale, 64/40 px avatars partially seen), door scene and the close crop. The complexion row, phone mock and the final text sections were checked only through the DOM/text, not by screenshot.
- **Round 3 storyboard:** viewed at about 616 px and at 1200 px width (no horizontal overflow: scroll width 1185 at 1200 px). A script stepped all six scenarios and their transcripts (counts matched steps); synthetic keyboard events confirmed Left/Right stepping; no console errors. The page reads `localStorage` and the game nowhere; in the preview it was blocked (storage count read as "blocked"), which does not matter because it never uses it.
- **Not done:** no real keyboard (hardware) pass, no screen-reader pass, no real contrast-ratio computation (colors were chosen by eye), no check against actual apartment-kit renders, no reduced-motion test (the pages have no animation or audio).

## Problems and limits observed

- Built-in browser screenshots timed out until the pane was fronted; thereafter some screenshots lagged behind scripted state changes. I reported only what a settled screenshot showed.
- The door scene always draws Ren's default face; the storyboard step "grin" therefore shows the default face in door scenes (cosmetic limit of the concept).
- The "not tonight (kind)" face reads somewhat sad at larger sizes; an owner call whether that is acceptable or should be softened.
- Direction B's long-hair variant reads more feminine than the intended ambiguity; that is why it was not recommended.
- Tattoo ink is low-contrast on the deepest fill; acknowledged in the page.

## Unsolved owner choices (also listed in each file)

1. Approve/amend interaction menu: Evening-only first wave; ask-Ren feature; dinner-on-visit-night behavior; Ren's give-back as story only (03).
2. Approve/amend consequence rules: strained/drifting reducing Ren's initiative; counted events; exemptions for "tell Ren I can't" and forced bedrest; flag names and whether the Receipt shows them by name (04). **These alter future invitation eligibility, so they need explicit adoption.**
3. Complexion/blend, tattoo placement, pencil/overalls, expression set (round 2).
4. Possession-sale principle and Example 1 as the single consequential case; whether to include the gifted-shelf case (05).
5. How much heritage detail, if any, is written (02).

## Dependencies and coordination

Plan 37 (accepted; phase/anchor labels used as-is; no private clock), Plan 29 (all numbers symbolic, plus a Ren-dominance strategy check recommended), Plan 40 (Call Mom stays its candidate; no copy coordination done), Plan 36 (no restyled-offer messages), Plan 27 (Receipt rows needed). None were edited.

## Consultation posture

**Branch B — advisor consultation not warranted.** This thread matches the `claude-code` entry in `advisor-capable-providers.json` (the Agent tool takes a model override), but the deliverable is report-local research, documents and a non-persistent synthetic HTML demo with no production behavioral surface; the packet states no premium advisor is required for research/concept-only delivery. This is a declaration, not a skipped step. No higher-tier reviewer ran, so nothing in this package has had an independent review beyond owner review.

## Working-tree notes

- Untracked, not mine, left alone: `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/previews/`.
- A staged, modified `reports/development/plan-27-receipt-reflection-and-evidence-hierarchy/progress.md` was present in the index and is not mine; I commit only my explicit paths so that change is not included.
- No push.

## Remaining risks and follow-ups

- Nothing here has had an independent review; the rules are proposals, the art is concept.
- The consequence model's numbers (`B`, `U`, `g_R`, `h`) are placeholders until Plan 29/owner select values; the HP-exploit check depends on `h` relative to meal and Call Mom effects.
- A later bounded SVG packet and a Plan 38 amendment would be needed before any in-game Ren.

Ready for orchestrator review: **yes** (owner review of the package, not of any production change).

## Addendum: outfit/hair generation hand-off (2026-10-31, after delivery)

- Owner direction: base art style is settled; outfit and hair-state/covering variations to be explored next with a separate Gemini Flash thread (each generated image a 2x2 grid), then Haiku SVG drawing passes after the lead selects candidates. Owner selections for those variations remain **OPEN** until the images are reviewed.
- Added `prompts/gemini-outfit-and-hair-prompt.md` (paste-ready; up to 10 outfit grids and exactly 4 hair grids; outputs to `concepts/gemini-round-01/`; manifest and provenance required; stop-and-report on quota).
- Added `concepts/reference/`: four reference PNGs exported from the lead's own SVG pages (`ren-ref-halfbody-mid-warm`, `ren-ref-complexions`, `ren-ref-expressions`, `ren-ref-door-scene`) plus their source HTML. Export used Edge headless screenshots (a local browser, no network, no Node job). I viewed the complexions and door-scene PNGs after export; I did not open the half-body and expressions PNGs individually.
- No generated images exist yet. Nothing about the Gemini thread's output has been reviewed.

## Addendum 2: Gemini round 01 returned; SVG drawing pass (2026-10-31)

- Gemini thread returned 10 outfit grids and 1 hair grid (11 of 14); generation stopped on an HTTP 429 quota error. Provenance caveats and my viewing-based drift findings are in `07-gemini-round-01-review-and-selection.md`; the thread's "model" claim was `not exposed`, and its own drift notes overstated fidelity.
- Per the owner's instruction I selected six outfits and (the four cells of the one hair sheet) for drawing, and fanned out **ten Haiku helpers** (one per drawing, concurrent, disjoint output folders, no helper wrote outside its folder as far as the file listing shows). All ten returned SVG, preview PNG and notes. I scanned the SVG sources for forbidden constructs and viewed all ten on a contact sheet; results and verdicts are in section 6 of file 07.
- Two drawings (slicker, bedhead) need a revision pass and one (cardigan) a small fix; no revision has been done.
- Resources: ten model helpers (Haiku) plus headless Edge renders (a local browser; no network use by the pages); no Node, no installs, no git by helpers. Large files: the 11 Gemini PNGs total about 11 MB and are committed as report-local concept references; they are not game assets.
- Still unselected by the owner: any final outfit or hair; whether to rerun the three missing hair grids after the quota reset or draw them directly.

## Addendum 3: revision pass (2026-10-31)

Three more Haiku helpers (slicker, bedhead, cardigan) wrote v2 files beside the originals; results, with my own judgement and the v1/v2 comparison sheet, are in section 7 of `07-gemini-round-01-review-and-selection.md`. Slicker v2 is a clear improvement; cardigan v2 is improved with small buttons; bedhead v2 is only a partial fix (spiky triangle tufts). Total Haiku drawing helpers so far: 13 (10 first pass, 3 revision). No additional Gemini generation was run; the three missing hair grids remain ungenerated. Nothing here is owner-approved.

## Addendum 4: owner corrections, hood-up slicker, bedhead v3, apartment scenes (2026-10-31)

- Owner feedback: the neck "tattoo" read as a mistake; the pencil read as jewelry; the hood should be up; bedhead was unclear; Ren should be composed into the apartment. Done as recorded in `08-ren-in-apartment-camera-notes.md` and section 8 of file 07.
- Delegation this round: one Haiku researcher (bedhead references; text only, no images viewed) and two Haiku drawers (slicker v3, bedhead v3). Total Haiku drawing helpers so far: 15 (10 first pass, 3 revision, 2 this round). The lead replaced the pencil and removed the neck tattoo in all 14 existing SVGs by text replacement, added arm tattoos to two outfits by hand, and wrote and ran the apartment composition script.
- Executable work: `concepts/apartment-scenes/compose-ren-apartment.mjs` ran serially through the unchanged Plan 25 bounded launcher (exit 0, about 0.6 s, under 10 MB sampled memory, no stop reason; run several times while placement was fixed). Edge headless was used for renders. Many other `node` processes exist on this machine and none were touched.
- What I viewed: the contact sheet after the pencil/tattoo change; the apartment scenes page after each run (final state at desktop width); the round 3 comparison sheet. Not checked: avatar scale, other complexions, hardware keyboard or screen reader (no interactive page in this round).
- Still open: bedhead is not convincing; the three ungenerated Gemini hair grids; any owner selection of outfits or hair. The old `ren-ref-*.png` references show the removed neck tattoo; the Gemini prompt now points to the updated template PNG.
- Public-repo hygiene: reference and concept images contain no real people or private data.

## Addendum 5: remaining Gemini hair grids and second hair pass (2026-10-31)

- Owner dropped bedhead. The Gemini thread then finished the three missing hair grids (14 of 14 images; model `not exposed`; references attached unverifiable). Review, provenance caveats and drawing verdicts are in section 9 of `07-gemini-round-01-review-and-selection.md`.
- Delegation: ten more Haiku drawing helpers (hair and headgear), each in its own folder under `concepts/svg-round-01/hair/`, guided by new shared brief `concepts/svg-round-01/BRIEF-HEADGEAR.md`. Total Haiku drawing helpers so far: 25 (10 first pass, 3 revision, 2 hood/bedhead, 10 hair). Plus two Haiku researchers earlier (visual references, friendship mechanics) and one for bedhead references: 28 Haiku helpers overall.
- Viewed: the ten new drawings together on `contact-sheet-hair.png` (desktop width). Sources scanned for forbidden constructs (none). Not checked: avatar scale, other complexions, apartment placement of the headgear drawings.
- No executable work this round beyond headless Edge renders; no Node jobs.
- Open: owner selection of final outfits/hair; whether to fix the sleep bonnet and the pencil collisions; whether the sawdust and attic-dust ideas are wanted; a 'Ren in the apartment' refresh with the newer drawings has not been done.
- Public-repo note: Gemini PNG concept sheets (now about 14 MB total) are committed as report-local concept references, not game assets.

## Addendum 6: bandana, bonnet and pencil placements (2026-10-31)

- Owner feedback: bandana v1 read as a blob with an unattached bit; asked for a bonnet fix, two beanie pencil variants (behind the head tip up and right, tucked into the beanie) and an overalls pocket-pencil look. Details and verdicts in section 10 of `07-gemini-round-01-review-and-selection.md`.
- Delegation: none. The lead drew the six SVGs directly (a short report-local Python build script in the scratchpad, not committed). Haiku helper totals unchanged: 25 drawing helpers plus 3 researchers.
- Viewed: `concepts/svg-round-01/compare-round-4.png` and the bonnet preview. Sources scanned for forbidden constructs (none). Not checked: avatar scale, other complexions, apartment placement.
- Open: owner choice of one pencil rule; the weak spots left are thin bandana tails and the squared bonnet band ends. Nothing here is owner-approved.

## Addendum 7: pencil options kept; drawing kit index (2026-10-31)

- Owner kept all pencil placements as options (ledger S12). Added S9 to S12 to `01-owner-selections-and-proposals.md` (tattoo arm-only, hood up, bedhead dropped, pencil options) and created `09-ren-drawing-kit-index.md`, a parts index with owner-kept / lead-pick / unreviewed status and a PROPOSED pencil pairing rule. No new drawings; no executable work; no helpers.

## Addendum 8: owner walkthrough of the review package (2026-10-31)

- **What happened:** the owner went through the package one section at a time; every answer is a numbered row in `01-owner-selections-and-proposals.md` (S9 to S58, with S13 to S58 recorded in this walkthrough). Files 02 to 05 carry a short "Status after owner review" note; file 06 and the kit index (`09-ren-drawing-kit-index.md`) were refreshed.
- **Adopted (owner direction):** the consequence model (initiative drops when drifting or strained; broken commitments and expired unanswered invitations count; the flag names and the floor at strained; the "Tell Ren I can't" and forced-bedrest exemption; the flag is never shown to the player; recovery is one repair scene plus one honored visit); the interaction menu with an Evening-only first wave; the character brief as written; the possession-sale principle, the couch and game-night example, a gifted-item reaction and a neutral "tv's gone" line; the first art packet covering phone bust with six faces, the half-body door view and in-apartment close scenes; the Plan 29 exploit check as advisory; outdoor scenes, Ren's home, endings and a gift economy kept out.
- **Direction on illustrative numbers (Plan 29 owns calibration):** `B` = 2, `U` = 3 in a row, memory window of the last 6 opportunities, visits at most every other Evening.
- **Art delivered this stretch:** listening face and reframed door scene (round 4 page and `door-scene-v2.svg`); tool apron (helper) and open puffer vest v3 (lead, after two failed versions); sawdust and attic-dust looks (lead, from the plaster drawing); the kit index; complexion, avatar-size, outfit and hair contact sheets; apartment scenes in close framing plus the floor game-night scene with the duck on the blue book; the storyboard art refreshed to the current rules (no neck tattoo, new pencil, reframed door) with its state chips marked reviewer-only.
- **Delegation:** two more Haiku drawing helpers (apron, vest v1). Totals: 27 Haiku drawing helpers and 3 Haiku researchers (30 helpers); the lead drew the bandana, bonnet, beanie and overalls pencil variants, the faces and door scene, vest v2 and v3, the dust looks and the scenes directly.
- **Executable work:** the apartment composition script ran several times serially through the Plan 25 bounded launcher in a child shell (exit 0 each time, about 0.6 s, under 5 MB sampled memory, no stop reason). Many other `node` processes exist on this machine and none were touched. Headless Edge made the PNG previews. No tests, builds, `src/` changes, save-schema changes or status changes.
- **Viewed:** every contact sheet and page named above in the browser pane or as renders at desktop width, including the avatar-size sheet (96, 64 and 40 px face crops). **Not checked:** other complexions on the apartment scenes, hardware keyboard or screen-reader use of the storyboard (not an interactive game page), real avatar use in a game layout, the owner's reaction to the latest puffer vest (v3), sawdust, attic dust and floor scene.
- **Still open (owner or later packets):** a bounded art packet (production SVGs, door and hallway view, shelf prop, side and turned poses); a bounded mechanism proposal (Plan 38 amendment with Plan 37 and Plan 29 values); the reviewer-requested check that Ren is not a dominant HP source (advisory); final selection of which outfits and hair looks ship (all current looks were kept, none declared final art).
- **Public-repo note:** Gemini PNG concept sheets (about 14 MB) remain committed as report-local concept references, not game assets; no real people or private data in any image.

## Addendum 9: root-requested status reconciliation (2026-10-31)

- Reconciled current summaries in files 01, 03–06 and 09 to the unchanged S1–S58 owner-choice ledger; retained prior walkthrough/addenda as historical evidence.
- Clarified that Plan29 and Plan37 are closed investigations, Plan38 is the accepted production base, Plan44 is the active Receipt consumer, and any Ren lifecycle implementation needs a new bounded mechanism proposal. S55–S58 remain selected working directions pending calibration; exact opportunity, expiry/reset/window, visit-gap and couch-reconfirmation mechanics remain unresolved implementation details.
- Corrected selected apartment pose/framing, complexion, six-face scope, hidden-flag/Receipt boundary, and current visual acceptance limits. No new render, test, build or visual review was performed.
