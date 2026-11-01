# Ren — interaction menu (draft 1)

Status: the interaction menu and Evening-only first wave were owner-approved (S16). Bracketed **[PROPOSED]** and **[OPEN]** labels below now refer only to unselected implementation details or examples; they do not reopen the menu decision. The selected at-most-every-other-Evening direction is in S58; exact opportunity mechanics remain for a future mechanism proposal. Visit HP remains symbolic; closed Plan29 supplies calibration evidence, and a future mechanism proposal must state exact working parameters. Phase labels are Plan37's (Morning, Afternoon, Evening, optional Late Night; one primary anchor per phase plus routine maintenance such as meals; reading, phone, inspection and putting the phone down cost no phase). Day numbers in examples are illustrations, not a calendar.

## 0. How Ren fits the existing day [PLAN37 + PROPOSED]

- Afternoon on introductory days is the scheduled work anchor [PLAN37]. The Evening anchor is exclusive among Restful Leisure (Call Mom, sit with the duck), a gacha session, or Overtime [PLAN37, LEDGER-06]. Dinner is maintenance and coexists [PLAN37].
- A visit with Ren is another **Restful Leisure** option in Evening, so it competes with Call Mom, gacha and overtime without auto-skipping any of them. It is never offered inside a work shift or as an automatic replacement for one (S16; Plan37).
- The owner selected an Evening-only first wave (S16). No additional morning/weekend placement is selected here.
- Ren's contact never consumes a phase by being read or by the phone being picked up [PLAN37]. A phase is committed only by an explicit action.
- Dinner stays separate maintenance even on a visit night; Ren does not hand out free food as part of contact (selected menu direction, S16).
- Ren's HP effect is **only on completing an accepted contact**, once per opportunity (S7). Opening or answering a message restores nothing.

Ren availability: at most every other Evening is the selected direction (S58). The exact opportunity definition, availability/expiry rule, consecutive-expiry reset and window aging belong in a future mechanism proposal. Do not infer a private clock or treat `g_R` as a settled algorithm.

## 1. Interaction menu

### I1. Quiet text exchange (casual contact) [OWNER-SELECTED DIRECTION]
- **Eligibility:** Ren has been introduced; any phase the phone is open.
- **Class:** none. Free phone use; no phase, no anchor [PLAN37].
- **Commitment:** none. Replies are optional.
- **Displayed:** short message, plain text, Ren avatar (the default face).
- **Effect:** **0** HP, no flag change. It is genuine enjoyment and a place for Ren's voice and for offering the next invitation. A single reply may open or answer an invitation (I2/I3).
- **Limits:** none. Ren sends a message only when they have something to say or offer; no streak, no unread badge pressure, no repeated nagging (research pattern P8, `research/friendship-mechanics-provenance.md`).
- **Save/reload:** the thread and which choice buttons were used persist; reload shows the same thread.
- **Uninstall / static equivalent:** Uninstall remains in the HUD canopy; thread is plain text anyway.
- **Receipt mapping:** *Displayed* — message text and avatar shown. *You did* — which reply was chosen, if any. No effect claims; reflection question asks, "Did the message change what you did next?" without asserting.

### I2. Door chat (short, low-effort visit) [OWNER-SELECTED DIRECTION]
- **Eligibility:** Ren is available this Evening; Ren has just knocked or the player picked "Open the door" on an invitation.
- **Class:** Evening **Restful Leisure anchor**, exclusive with Call Mom / gacha / Overtime [PLAN37].
- **Commitment:** choosing it commits the Evening anchor. A conflict confirmation appears **only** if it displaces a named obligation [PLAN37, LEDGER-03].
- **Displayed on the button:** "Chat at the door with Ren (uses this Evening)."
- **Effect:** `HP += h` once on completion [SELECTED shape: bounded restore; amount **OPEN**]. Ren's availability goes into the recovery gap `g_R`.
- **Limits:** once per Ren opportunity; one door chat cannot be repeated the same Evening (anchor exclusivity and Ren's gap).
- **Save/reload:** in-flight chat resumes at the same line; `h` is applied exactly once on completion.
- **Uninstall / static equivalent:** static: caption plus text choices; the scene is a still (see round 2 door scene).
- **Receipt mapping:** factual displayed text, player action and resulting consequence only. Never include a relationship flag label/status word (S32). Question: "What else could you have done that Evening?" (asks, does not assert).

### I3. Shared activity (herb box, shelf carry, bike fix) [OWNER-SELECTED DIRECTION]
- **Eligibility:** Ren has asked or the player accepted a proposal; Ren available; the activity's context has been established in a prior scene (see I5 for how).
- **Class:** Evening Restful Leisure anchor [PLAN37]; the same exclusivity as I2.
- **Commitment:** same. Practical mutual help is the **shared-activity variant**: Ren needs a second pair of hands, and Ren gives something back in kind: a working fix on a player item, or a spare part. The give-back is a story/object beat, **not cash**, so it does not alter Plan 29's economy (selected menu direction, S16).
- **Effect:** `HP += h` once, same `h` as I2 (S7 selects one bounded restore, not two sizes). **Difference from I2 is the story beat and the object, not a bigger number.**
- **Limits:** once per Ren opportunity; each distinct activity once. After it, Ren is in gap `g_R`.
- **Save/reload and static equivalent:** scene beats are idempotent; the HP change commits once at the end.
- **Receipt mapping:** as I2, plus *You did* — "carried the shelf" as a recorded activity, no motive inferred.

### I4. Mutual request: the player asks Ren for help [OWNER-SELECTED DIRECTION]
- **Eligibility:** the player has a concrete, already-established thing (e.g., a flickering lamp) and Ren is available.
- **Class:** a phone message is free; the help itself is an Evening Restful Leisure anchor on a later Evening.
- **Displayed:** "Ask Ren about the lamp" as a button on the message screen. Ren answers with one of three states: *yes (pick a time)* / *not now, how about a later Evening* / *not this week*, depending on availability, never on the player's history.
- **Effect:** same `h` on completion; a "not this week" outcome costs nothing and is not a refusal of the player.
- **Why:** reciprocity runs both ways, and a friend with limits is not a faucet (packet 5). It also gives a decline that is Ren's, so a refusal on Ren's side exists in the fiction.

### I5. Invitation, declined, rescheduled (the choices around an offer) [OWNER-SELECTED DIRECTION]
- **What it is:** the message that offers I2/I3 and its three replies: **Sure, when?** / **Maybe later** / **Can't this week**.
- **Distinctions that must stay separate** (packet 5):
  - *Not reading the message* — no immediate effect or refusal record; a later invitation expiring unanswered is a separate selected event. No real-time deadline. Reading/accessibility time costs nothing [PLAN37].
  - *Declining* ("Can't this week") — free; Ren replies kindly and may offer another time later; no flag change; one decline never changes the relationship.
  - *Rescheduling* ("Maybe later" / "How about …") — free; counts as an acknowledged reply; limited to one reschedule per invitation (a second becomes a decline), as selected in the reviewed menu. Timing/expiry integration remains a future mechanism detail.
  - *Breaking an agreed commitment* — only when the player **accepted** a specific Evening and then takes a conflicting anchor **without telling Ren first**; this is one of the two selected counted-event types (see 04).
  - *Communicating a boundary* — telling Ren in advance "can't tonight" (the "tell Ren" option in the conflict confirmation) is **not** a break. It reschedules or declines and costs no relationship.
- **Displayed on commitment:** accepting shows "Ren will expect you this Evening. You can tell Ren you can't make it from this screen."
- **Receipt mapping:** factual displayed invitation/cue, player action, and consequence only. Never expose a relationship flag label/status word or infer "you ignored Ren" (S32).

### I6. Repair / reconnection [OWNER-SELECTED DIRECTION]
- **Eligibility:** relationship flag is *drifting* or *strained* (see 04), or a gap of unanswered invitations.
- **Class:** the opening message is free; the repair scene is an Evening Restful Leisure anchor like I2.
- **Displayed:** Ren sends one plain message that names no blame ("hey, still alive? i fixed the herb box, come see"). Player picks **Come by** / **Maybe later** / **Not now**. "Not now" is allowed without harm; Ren waits.
- **Effect:** completing the repair scene gives `HP += h` once and moves the flag *strained → reconnecting* (see 04), or *drifting → connected*.
- **Limits:** one repair scene per strain event; offers return gradually after it. Never a quota or grind.
- **Receipt mapping:** factual displayed text, player action, and consequence only; never a flag label/status word (S32). Question: "What made this easier or harder to say yes to?"

## 2. Interaction versus gacha and ordinary work (no auto-skip)

| Evening anchor options [PLAN37] | What it costs | What stays free |
|---|---|---|
| Call Mom | the Evening anchor | dinner; reading Ren's texts |
| Visit Ren (I2/I3/I6) | the Evening anchor; Ren's gap `g_R` afterwards | dinner; replying; declining |
| Gacha session | the Evening anchor; extension past baseline triggers the existing neutral conflict confirmation | dinner; reading Ren's texts |
| Overtime | the Evening anchor | dinner; reading Ren's texts |

- Afternoon scheduled work is **not** affected by Ren. An invitation never lands on an Afternoon shift; if the player takes a gacha extension that preempts a *named Ren plan* in the next Evening, the existing conflict confirmation lists it neutrally: "Continuing will use this Evening. You told Ren you'd come by. [Tell Ren I can't] [Continue anyway]."
- A visit never advances time by being read or put down mid-way; closing the phone mid-scene preserves it.

## 3. Remaining mechanism details (not new owner choices)

The approved menu remains the selected design direction. Before implementation, a bounded mechanism proposal still needs to define opportunity creation and expiry, what resets a consecutive unanswered run, how the last-six-opportunity window ages, the visit gap and re-offer schedule, and how the selected couch-sale reconfirm request fits the branch flow. These are mechanics details, not new choices to invent in this reconciliation.

## Status after owner review (2026-10-31)

Owner approved the menu and Evening-only first wave (S16). Visits use close framing, front-facing, with Ren on the couch or on the floor behind the coffee table; no chair/armchair (S49–S53). Side and turned poses are later work (S51). Numbers remain symbolic pending calibration; Plan37 and Plan29 are closed investigations, not open implementation owners. A future mechanism proposal must define execution details. Relationship flags are never a player-facing or Receipt label/status word (S32); Receipt content is limited to facts, actions and consequences.
