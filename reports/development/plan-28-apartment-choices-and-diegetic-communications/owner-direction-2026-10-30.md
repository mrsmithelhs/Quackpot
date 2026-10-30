# Plan 28 — Owner direction, 2026-10-30, and lead notes for orchestration

Source: a direct conversation between the owner and the lead after the Stage 1 proposal (`8efd5c1`). The handoff
allows the owner to discuss scope with the lead directly. This file records what the owner decided. Items that would
change packet boundaries are flagged for orchestration. **No item here grants production or new-rule authority on its
own.**

## 1. Decisions recorded

| # | Owner direction | Effect |
|---|---|---|
| D1 | **Direction A ("Things in their places") selected.** The owner accepts A's extra cognitive load because it introduces the metagame early as a necessary layer. Early play must still be sequenced so it guides without overwhelming. | Proposal §0 and §8 Q1. Direction B is kept only as the contrast that informed the choice. |
| D2 | **Duck placement.** The duck stays still within any one composition, but it can appear in several scenes. The character tends to carry it around, especially in later stages that use one-sided duck dialogue trees. | Proposal §2.7 is revised. The kit already has duck anchors on the coffee table, the kitchen bar, the desk and a bedroom shelf. |
| D3 | **Styled HTML paper is acceptable.** | Q2 is resolved. No SVG paper props are needed. |
| D4 | **Guidance relaxes over the run.** Tutorial "training wheels" come off over time. As they do, more of the character's time becomes the player's choice, so the life-management sim visibly conflicts with the gacha's invitation to engage and progress. | This is a design direction for later stages. It needs a time model and rules that do not exist yet. See §2. |
| D6 | **The rent comes from the property office** (Harbor Court Property Office), chosen after the explanation in §3. Named people are kept for optional lanes and messages. | Storyboards use the institutional bill for rent. The rent-sender toggle in §4 is dropped. |
| D7 | **Action-based time is approved** (owner, relayed with root's prebuild review `reports/orchestration/plan-28-prebuild-review-01.md`, `e7cf2a0`). The exact slot rules and the optional-life consequences belong to draft Plan 37, coordinated with Plan 29. The owner also routes this implementer to **Branch C (orchestrator-gate-only, no advisor call)** and approves authoring the Direction A prototype. | Plan 28 leaves presentation seams only. No time, wage, health, ending or autonomous-action rules are added. |
| D5 | **Optional lanes are wanted.** Examples: skipping a meal "because the player wasn't looking", skipping a work shift, and possibly being fired as an alternate ending. Each lane is an on-ramp or off-ramp, never a requirement. | These are new rules. See §2 for candidates and the routing question. |

## 2. Optional lanes: candidates and what each would need

The owner's examples all assume something Quackpot does not have yet: **time the gacha can consume.** The current
slice has no clock-driven choices. Days advance only at fixed controller points.

My recommendation is an **action-based day budget**. Each day has a few named slots, such as morning, midday, afternoon
and evening. Gacha sessions, races and life tasks each use a slot, and the remaining slots are always visible.

"Wasn't looking" would then mean that the player spent the morning slot in Quackpot, so breakfast didn't happen. It
would never mean that real seconds passed. This keeps the hard constraints intact:
- no compulsory waits;
- reading never costs anything;
- reduced motion and assistive technology are not penalized;
- immediate Uninstall is unaffected.

A wall-clock version would punish slow readers and would conflict with the pacing contract.

| Lane | On- or off-ramp | Exists today? | New rule needed | Interacts with |
|---|---|---|---|---|
| **Missed meal (passive).** Spending the breakfast slot in the gacha skips the meal. Cash is saved and health is lost. | On-ramp: the gacha costs life | The effect exists as `skip_lunch`, but only inside the escalation ladder | Slot model; a passive trigger; the values (Plan 29) | Receipt "you did" must say the meal was missed while in Quackpot, without asserting a motive |
| **Skip a shift.** A scheduled shift appears on paper in the kitchen. Skipping it frees a slot but loses the wage. | On-ramp | No; shifts today are only the emergency `extra_shift` | Shift schedule; wage-loss rule | Plan 29 economy |
| **Fired (alternate ending).** Repeated skips lead to a warning note and then dismissal. | Ending | No | New terminal route, its Receipt framing, warning thresholds | Receipt/terminal schema (Plan 27); must stay a disclosed consequence, never a surprise |
| **Cook vs. order in.** Cooking costs a slot and little cash. Ordering in costs no slot and more cash. | Mirrors "pay to save time" in the gacha | No | Meal options and prices | Plan 29. This makes the gacha's time-for-money logic visible in ordinary life. |
| **Sell things proactively.** A marketplace listing for the couch or TV can be posted at any time, not only under rent pressure. | On-ramp: sell the couch to buy gems | The sale effects exist, but only in the zero-cash prompt and the ladder | Availability rule outside rent | The Receipt can show furniture → cash → gems as a chain. This is strong evidence for the debrief. |
| **The phone bill.** If it goes unpaid, the phone and so Quackpot access is suspended. | Off-ramp, ironic | No | New bill; a suspension state | Must never block Uninstall or the Receipt. This needs careful honesty design. |
| **Go outside with the duck** (a walk, the library, a park bench). Costs a slot, is free, and restores a little. | Off-ramp away from the phone | No | Activity and its effect | A natural home for later duck dialogue scenes (D2). This needs no new art if it is framed inside the existing rooms, for example leaving and returning by the door. |
| **Call someone** (design.md lists "borrow from Mom" as a deferred ladder step). | On-ramp to cash at a relational cost | Deferred in design.md:121-123 | Dialogue, limits | Plan 36 narrative reviews may already touch this |
| **Late-night pulls vs. sleep.** The evening slot goes to the gacha, and the next morning starts with less health. | On-ramp | No | Sleep/health rule | Must use the slot model, never a real-time clock |
| **Put the phone face-down for a day.** Gacha check-in rewards are skipped, and the day's slots go to life. | Off-ramp | No | Interacts with check-in rewards (separate direction doc) | Shows what not logging in costs. Record only displayed cues. |

**Routing question for orchestration:** these lanes are new story, economy and ending rules. Plan 28 is report-only
presentation, and Plan 29 owns economy and pacing. I suggest one of two routes:
- a new packet for a slot-based day model with optional lanes, depending on Plan 29; or
- an amendment folding the time model into Plan 29.

Plan 28 would then supply only the presentation seams those lanes need: where each lane's paper or message lives, and
how its consequence appears in the room.

**Guidance gradient (D4), as I would sequence it:**
- **Day 1:** fully routed. Every life moment arrives in order and there is one obvious next action. This is the
  current Plan 28 scope.
- **Day 2:** routed, but the rent bill is visible on the desk ahead of time.
- **Later days:** the apartment becomes a hub. The day's paper sits on its surfaces: the meal note in the kitchen, the
  shift schedule, any bill on the desk. The player chooses the order, and unhandled items resolve honestly when their
  slot passes.

Only the Day 1 and Day 2 behavior is possible with today's three-day slice and rules.

## 3. The "landlord voice" question, explained

The question was not about audio. It asks **who the rent comes from, and how that sender talks.** In Direction A the
rent bill is paper on the desk, so someone wrote it. Two drafts were offered:

- **An institution:** "Harbor Court Property Office. Rent for Unit 4B is due today: $15.00. Payment below."
  - Effect: neutral and bureaucratic. Rent feels like a system, and failing to pay feels like a process, not a betrayal.
    The bill carries no moral pressure.
- **A person:** "Hi, dear. Rent's $15.00 today. Tap below when you're ready. — Ruth, 1st floor."
  - Effect: warm, and the world gains a neighbor. But an unpaid bill now means letting a kind person down. That adds
    guilt, which can tip into moralizing. A recurring character also creates story obligations: what does Ruth say on
    the unpaid path or after the couch disappears?

Why it matters now: the rent bill is the first non-gacha communication with a sender. Its voice sets the emotional
register for every later bill, shift note and message.

**My recommendation:** use the institution's paper bill for the money itself. Amounts stay neutral, and paid-zero and
unpaid states never carry guilt. Leave named people (the shift lead, neighbors buying furniture, and possibly a building
owner later) for optional lanes and messages, where warmth helps and no debt is owed to them. If you'd rather have a
person behind the rent, Ruth works, but the unpaid-path copy then needs care so it doesn't scold.

## 4. Suggested change to the next build, for root

With A selected, building a full executable B mainly re-litigates a settled choice. Proposed alternative:
- Build **A only**, executable, for the required moments: breakfast, paid-zero, unpaid ladder and return from gacha.
- Use **two duck-placement treatments** as the remaining comparison: the duck stays at the desk, or the duck travels
  with the character, per D2.
- ~~Include two rent senders as a copy toggle.~~ This is no longer needed, because the owner chose the property office (D6).

Nothing else in proposal §6 changes: files, imports, in-memory fixtures, H1–H3, and one shared browser turn. The
relaxed later-day hub stays a text storyboard until its rules are routed. This needs root's agreement because the
packet text asks for two compared directions.
