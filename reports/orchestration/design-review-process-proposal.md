# Design-review process investigation

Date: 2026-10-30. Request: retain a fast owner-facing design interview while reducing
poorly contextualized choices and late orchestration confusion. This report proposes
a replacement; it does not adopt a new recording-authority policy automatically.

**Owner pilot approval, same date:** The owner approves the staged interview pilot
and will run it with Gemini Flash. Use
reports/orchestration/design-review-gemini-flash-pilot-handoff.md and the staged
prompt candidate. The current default prompt is not replaced yet; compare the first
coherent stage and orchestration checkpoint before selecting general rollout.

## What the existing prompt does well

It separates review from implementation, supports concrete requests without forcing
a menu, asks for options/tradeoffs, distinguishes greenfield from audit work, invites
source comparison and protects scoped commits. Keep those capabilities.

## Mechanisms that can produce the reported failure

These are source-grounded process risks, not a claim to have measured why every
past interview went wrong:

- Interaction Pattern limits tradeoffs to one line and always asks for a recommended
  option, without requiring a concrete play example, a cost of the favored option,
  explicit uncertainty or a prerequisite check before asking.
- Recording Discipline immediately propagates answers into decision log, open
  questions and every affected document. The only opportunity for a broader review
  may come after those records already present the lead's interpretation as settled.
- Owner selection, downstream interpretation and implementation/adoption authority
  aren't explicitly separate. A preference for optional lanes can become assumed
  time, penalty and terminal rules without another clear choice.
- Pacing checks exist after question batches, but there is no stage consequence
  summary, compact orchestration checkpoint or restriction on dependent propagation.
- The smell list is mostly generic system architecture. It doesn't ensure attention
  to player agency, friction, incentives, narrative implications or truthful debrief.
- Launch stage still named the closed GATE-53C. Root corrected that stale line in
  the active prompt as factual housekeeping; larger changes remain proposed here.

Open questions are also scattered and some central entries describe now-implemented
features as absent. A first-stage inventory must verify their status against current
decisions/reports/source, not turn that stale list directly into an interview script.
No broad open-question cleanup was attempted in this investigation.

## Recommended operating model

1. **Stage brief:** orient, establish what is settled, and order questions by
   dependencies. Use coherent topics, not a giant miscellaneous questionnaire.
2. **Context-rich choices:** short scene example, reason for choosing, fair viable
   alternatives, important downside/dependency, evidence limits and a conditional
   recommendation. Depth grows with consequences; small copy choices stay small.
3. **Implication check:** challenge consequential recommendations before asking
   the owner, using source research/one targeted low-tier critique when useful.
4. **Owner selection record:** preserve what the owner really chose, what remains
   open and what the agent inferred. No forced 'tentative' label for firm choices.
5. **Checkpoint:** after a coherent stage (often3–5 meaningful choices), and earlier
   if rules/contracts/cross-system consequences emerge, send a short delta review
   to root. Continue independent work while only dependent adoption waits.
6. **Reconcile:** apply the agreed meaning to canonical docs, then proceed. If root
   discovers a new ramification, explain it to the owner and revisit only that fork.

This is periodic review plus risk-triggered escalation, not approval of every choice.
The owner remains product authority; root provides implication/consistency review.
Do not solve overconfidence by replacing the owner with an automatic second model.

## Lower-cost alternatives and complements

- **Preflight the question sequence once.** For a broad interview, root reviews the
  proposed stages/dependencies before the session; the lead then runs the stage
  independently. Not necessary for every narrow wording discussion.
- **Targeted low-tier challenge before a consequential recommendation.** Ask for the
  strongest failure case, omitted alternative and source evidence, without first
  telling the critic which option the lead favors. Lead verifies and integrates.
  This reduces cheap mistakes; it is not a substitute for judgment or a premium
  advisor allowance. Avoid multi-agent voting or mandatory per-question critics.
- **Concrete comparison before commitment.** Two short scene treatments or a paper
  trace can reveal consequences better than another page of analysis. Executable
  prototypes still need the assignment's existing resource/write authority.
- **Decide experience before parameters.** Ask what the player should understand
  and be able to choose, then investigate implementation or numeric feasibility.
  Don't make the owner answer a hidden technical problem as a product preference.

## Example: already-approved action-based time

Bad question: 'Should gacha consume a slot? Yes is recommended for tension.' It omits
what the slot removes, what the player knows, and how presentation affects control.

Better context: 'Action-based time is already selected. We still need to decide how
the player learns that committing to another gacha session can close a meal
opportunity. One approach previews the consequence on the session commitment;
another brings the meal/gacha choice into the apartment first. The first keeps
attention in gacha but needs especially clear opportunity information; the second
makes the tradeoff tangible but adds an interruption. Neither charges time while
reading. Here is the same morning under each approach. Which experience do you want?'

Still open after that answer: action/session boundary, exact slot cost, warning
frequency, health values and deferred cancellation behavior. Record the selected
communication direction without claiming those questions were answered too.

## Proposed artifact and rollout

The full cold-start candidate is
`reports/orchestration/design-review-prompt-staged-draft.md`. It adds stage briefs,
decision context, implication checks, precise owner/review/adoption distinctions,
compact checkpoint handoff and reconciliation. It retains scoped docs-only role and
existing execution restrictions. Default report-only recording until disposition
is the substantive policy change requiring owner selection before activation.

Recommend one pilot interview on a coherent Plan37 topic using this candidate, with
one natural stage checkpoint. Evaluate whether the owner understood the stakes,
the summary preserved their actual choice, hidden dependencies were caught before
canonical propagation, and root could review from the compact file rather than
reconstructing a long chat. Track confusion/rework examples and actual overhead,
not a test count or invented efficiency percentage. Refine after that pilot; no
need to run the interview directly in an expensive orchestration session.

No new packet, agent invocation, browser/Node run or product change was needed for
this investigation. Only the active prompt's stale stage line was corrected; the
replacement and process are concrete proposals for owner review.
