# Plan 28 — owner composition and interaction revision

Date:2026-10-30. This is substantive owner experience feedback, not a technical
test failure. Reopen the report prototype for revision; production is not approved.
Expanded delivery clearance04 remains in force, including in-scope edits, bounded
tests/browser work, direct owner questions and lead-directed Haiku use. Branch C,
no advisor. Return a coherent revised delivery, not a request per experiment.

## What the owner found

The paper styling is generally attractive, but cards often look suspended in front
of side/top desk views instead of belonging to the room. The phone succeeds at
being an object in the scene. Paper forms with software buttons combine an official
letter metaphor with application controls and break immersion. This is a composition
AND interaction-language problem; changing shadows or paper texture alone won't
address it. Earlier technical approval didn't establish that this experience worked.

Direction A's objective stays selected: life choices belong to apartment life.
The specific floating-card/embedded-form treatment is NOT selected for integration.
Reconsider the complete notice -> inspect -> choose -> consequence sequence.

The owner supplied examples, not a selected replacement:
- Player-written notes to self could carry intentions/choices.
- A rent notice could be an object the player picks up, followed by an explicit
  payment confirmation interface instead of buttons pretending to be on the letter.

## Lead's next work — use your experience judgment

Develop a small set of distinct alternatives using rent and one contrasting moment
(meal, work or sale). Judge them in the surrounding room, not just as isolated cards.
Don't rebuild every branch for each idea before there is a useful comparison.
You decide the research/draft/Haiku tasks and may discuss questions directly with
the owner, select with them, then carry the chosen treatment through the prototype
and final integration proposal without another routine orchestration gate.

For each alternative, make clear:
1. What physically exists before interaction, its location/orientation/scale, and
   how it belongs to a surface or device. Distinguish world objects from explicitly
   foregrounded inspection/decision UI. A picked-up object can occupy the foreground
   intentionally; an unexplained hovering form is the problem.
2. Why/how the player notices and activates it, with obvious keyboard and pointer
   access. No unmarked pixel hunt or a need to read perspective-distorted small text.
3. Whose words are on it: property-office notice, character's note, work message,
   or the game's actual confirmation controls. Don't make an institution appear
   to have printed software buttons in its letter.
4. When a real commitment happens. Picking up/reading something is not automatically
   payment, work acceptance or a time cost. Show amount/consequence at the actual
   commitment and preserve cancel/back behavior without invented mechanics.
5. How the result changes the object/room and what happens next. Keep the scene
   comprehensible without explanatory developer labels in the player composition.

Do not constrain yourself to root's examples. You may argue that an intentional
inspection overlay, a scene action, personal annotation, phone message or another
treatment works best. Compare tradeoffs: physical plausibility, readability,
discoverability, added taps, repeated-use fatigue, emotional tone and narrow layout.
More skeuomorphism is not automatically better; an honest, deliberately presented
confirmation can be less intrusive than a form disguised as paper.

Existing art may be reused/composed freely within the report. Small report-local
HTML/SVG sketch elements for the comparison are allowed; no apartment-kit/source
asset edits, raster-generation quota, new art pipeline or dependencies. If a concept
truly needs substantial new artwork, propose that need rather than silently expanding.

## Preserve and validate

Preserve the owner's chosen property-office sender, wide-Day1/medium-later framing,
tap-to-pay breakfast, still travelling companion and no life-display logging in
first integration. Presentation choices don't adopt Plan37 time or optional-lane
rules. No new expense, reward, wage, health effect or terminal behavior.

You may adjust report-local control structure, DOM and corresponding interaction
tests for the new design. Preserve outcome/idempotency/price/disclosure assertions;
don't freeze obsolete card markup just to keep a test unchanged. Recheck financial
states, accidental/double activation, inspect versus commit, cancelling inspection,
keyboard/focus, motion-off, narrow composition and save-independent memory behavior.
Use the existing bounded resource/server/storage rules and clean up owned processes.
Ordinary defects may be fixed and retested under clearance04 without returning here.

Keep prior prototype/browser reports as history. Show the owner the new alternatives,
record what they actually select, then revise the integration proposal to fit the
selected interaction model. The previously suggested six-module structure is a
proposal, not a reason to force the design back into renderCard.

## Return at delivery or a substantive boundary

Deliver the selected experience, before/after composition, owner decision record,
actual bounded test/browser evidence and limits, and updated production proposal.
Call out any additional action/ordering changes that genuinely need owner approval.
No product-code implementation, packet closure or automatic production permission.
Escalate only a substantive contract/scope/resource issue; use the expensive lead's
judgment and owner conversation for the experience work rather than another set of
micro-clearances. Commit scoped reports/prototype, progress last, no push.
