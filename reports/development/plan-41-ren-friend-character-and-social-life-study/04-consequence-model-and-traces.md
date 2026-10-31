# Ren — consequence model and symbolic traces (draft 1)

Labels as in `03-interaction-menu.md`. **Owner-selected shape (S7, S8):** a visit is a bounded, once-per-opportunity restore and Ren has their own load/availability; relationship is tracked by **small qualitative flags with no number**. **Everything below that fills in thresholds, names of transitions and numbers of strikes is PROPOSED and unselected.** The rule that Ren's initiative changes with the flag state alters which invitations the player sees, so it is surfaced here for explicit owner approval before any adoption (packet requirement).

## 1. The model in one table [PROPOSED]

| Flag (name is proposed) | What it means in the fiction | What Ren does | Entered by | Left by |
|---|---|---|---|---|
| **connected** (default) | normal neighbors-who-are-friends | offers invitations at Ren's usual pace; replies warmly | starting state; completing a visit while drifting or reconnecting | a counted event (below) |
| **drifting** | it has been a while and Ren has noticed | offers less often (every other usual opportunity); tone is lighter, e.g. "been a minute"; no guilt lines | `B` broken commitments (no-show without telling Ren) **or** `U` consecutive invitations that **expired unanswered** | one completed visit, or one accepted invitation honored |
| **strained** | Ren was let down more than once | stops initiating; leaves one plain door-open message; Ren still answers if the player writes first | a further broken commitment while drifting | the player takes the repair scene (I6) |
| **reconnecting** | repaired, easing back | offers return gradually (every other opportunity, then normal) | completing the repair scene | after one more honored visit → connected |

- **Floor:** the relationship never ends. The worst state is strained, and recovery is always one repair scene away. No ending, termination or hidden permanent loss is proposed.
- **Counted events only:** (a) a *broken commitment* = accepted a specific Evening, then took a conflicting anchor or let the Evening pass **without** choosing "Tell Ren I can't"; (b) an invitation *expired unanswered* = never replied to by the time its named Evening passed (measured in game phases, **never real time**, and reading it does not count as a reply or a penalty).
- **Not counted:** not reading, declining, one reschedule, "Tell Ren I can't", a single decline of any kind, or reading speed/accessibility.
- **Symbolic parameters:** `B` (broken commitments to drift) ≈ "2" and `U` (expired unanswered to drift) ≈ "3" are *illustrative values only* [OPEN, Plan 29/owner]. Window = the last N Ren opportunities [OPEN].
- **What the flag does to HP:** nothing directly. HP changes only when a visit is completed (`+h`). The flag changes how often the player sees invitations.

### Why this satisfies the constraints
- One reasonable refusal never changes the flag. Two declines also never do. The only path to drifting is a pattern of broken commitments or several expired-unanswered invitations.
- Ren has availability of their own (`g_R` gap, "plans till Thursday"), so Ren is not an infinitely repeatable HP source.
- No real-time deadline anywhere; only game phases.
- A player with an accessibility need who reads slowly is never penalized, because invitations expire in game phases and reading consumes none.

## 2. HP-from-contact: exploit check (no free-HP loop) [PROPOSED]

An exploit would need to complete many accepted visits cheaply. These stops exist:
1. **One anchor per phase** [PLAN37]: at most one visit per Evening.
2. **Ren's gap `g_R`**: after a visit Ren is unavailable for `g_R` Evenings; the cue explains why.
3. **No restore for reading/replying** (I1 gives 0).
4. **Once per opportunity**: each invitation is one `+h`; accepting twice does not restore twice.
5. **Meals remain separate**: skipping meals costs −5 HP each [PLAN37]; a visit does not replace dinner.
6. **Opportunity cost**: each visit Evening is an Evening without Call Mom, gacha or overtime.
Open risk: if `h` is tuned large relative to meal/skip costs, a visit-every-available-Evening loop becomes a dominant HP strategy. That is a **Plan 29 calibration question**, not a Plan 41 rule; listed in the integration proposal.

## 3. Symbolic traces

Phase labels and anchor rules are Plan 37's. Day numbers are examples. Costs and HP deltas are symbols; `−5` for a skipped meal is a [PLAN37] selection. Every trace row says whether an item is *displayed*, a *player action*, or an *automatic story consequence* (the three registers the Receipt keeps separate).

### Trace A — Normal friendship route (no break)
| Step | Day / phase | Displayed | Player action | Automatic / state |
|---|---|---|---|---|
| 1 | Day 2 Evening (after dinner eaten, maintenance) | Ren text: "got spare bulbs if the hall's dark" + reply buttons | replies "Sure, when?" | invitation open; Ren proposes "Evening, day 4" |
| 2 | Day 3 Evening | no message; Call Mom is available | chooses Call Mom (anchor) | `HP += H_leisure`; Ren is not affected |
| 3 | Day 4 Evening | Ren knocks | opens the door; door chat I2 | `HP += h` once; flag connected; Ren gap `g_R` begins |
| 4 | Day 5 Evening | Ren text "plans till Thursday" | reads it | nothing; HP unchanged |
| 5 | Day 6 Evening | invitation to carry the shelf | accepts; completes I3 | `HP += h`; gap begins; Ren gives a spare part as a story beat |
Result: connected throughout. No time penalty from reading. Total contact HP is bounded by the gap, not by the player's tolerance.

### Trace B — Declined and rescheduled invitation (no harm)
| Step | Day / phase | Displayed | Player action | Automatic / state |
|---|---|---|---|---|
| 1 | Day 3 Evening | Ren: "shelf carry thurs?" | "Maybe later" | one reschedule used; Ren: "ok, ping me" |
| 2 | Day 5 Evening | Ren: "still got the shelf, tonight or next week?" | "Can't this week" | declined; Ren: "all good, next time" |
| 3 | Day 7 Evening | no message from Ren (normal pacing) | gacha session | nothing; flag connected |
Result: connected. Two non-visits are not counted. The "next time" invitation returns at normal pace.

### Trace C — Repeated broken commitment (drift, strain) and repair
| Step | Day / phase | Displayed | Player action | Automatic / state |
|---|---|---|---|---|
| 1 | Day 4 Evening | Ren invitation "come help w the herb box tonight?" | accepts | commitment: Evening, Day 4 |
| 2 | Day 4 Evening | Evening anchor options | picks **Gacha** and confirms the conflict dialog with "Continue anyway", **not** "Tell Ren I can't" | **broken commitment #1** (counted); Ren is not shown reacting yet |
| 3 | Day 5 Evening | Ren: "no worries, rain check?" | accepts again for Day 6 Evening | commitment |
| 4 | Day 6 Evening | conflict dialog | picks Overtime and continues anyway | **broken commitment #2**; flag → drifting (B reached); Ren offers every other opportunity; copy "been a minute" |
| 5 | Day 7 Evening | Ren: "i'm around this weekend if you want" | does not reply; Evening passes | invitation expires unanswered (counts as `U` 1) |
| 6 | Day 8 Evening | no new offer (drifting pace) | gacha | nothing |
| 7 | Day 9 Evening | Ren offers again | accepts, then breaks it a third time (no "Tell Ren") | **broken commitment #3 while drifting → strained** |
| 8 | Day 10 Evening | Ren leaves one message: "door's open when you're ready" | does not reply | no further counted event; Ren stops initiating |
| 9 | Day 11 Evening | player sees the message again (no repeat, no badge) | picks **Come by** | repair scene I6; `HP += h` once; flag strained → reconnecting |
| 10 | Day 12–13 Evenings | Ren offers every other opportunity | accepts one and completes it | flag → connected |
Result: a visible, recoverable arc from a **pattern** of broken agreements, never one decline. The player could have chosen "Tell Ren I can't" at steps 2, 4 or 7 and no flag would have moved.

### Trace D — "Tell Ren I can't" instead of a break
Day 4 Evening: accepted → player picks Gacha → conflict dialog → **"Tell Ren I can't"** → Ren: "np, thursday?" → Gacha session proceeds. Flag unchanged, no counted event, no HP change. Shows a boundary being communicated rather than a break.

### Trace E — Early Uninstall mid-arc
Any step: Uninstall stays in the canopy; Ren's pending invitation is a factual item on the Receipt: *displayed* "Ren: shelf carry thurs?" / *you did* nothing recorded. No inference of motive; question: "What made you leave? What did the game show you right before?"

### Trace F — Zero cash and HP interplay (does not distort Ren)
Day 5 morning: HP low from skipped meals; Evening: player accepts a visit; completes → `HP += h`. HP rises, but cash and meals are untouched. Ren is not a substitute for dinner; if HP is low enough that Plan 37's critical bedrest triggers (HP ≤ 0), the phase becomes bedrest and any accepted Ren Evening is a **forfeited anchor**, treated like an illness case: Ren is shown receiving the cancellation automatically, **not** recorded as a broken commitment (the player did not choose a conflicting action) [PROPOSED]. Ren's message is neutral ("rest up, rain check").

## 4. Save / reload and idempotency [PROPOSED requirements for an integration proposal, not implemented]

- Invitation id, state (open/accepted/declined/rescheduled/expired/completed/cancelled-with-notice/broken), Ren availability gap counter, and flag are saved. An HP gain is applied exactly once per completed contact (a once-only transaction id, consistent with Plan 37's closeout).
- Reload mid-scene resumes at the same line; scene variants selected cosmetically use a separate seeded fork, never the draw/race/event streams.
- Expiration counts are computed from phase transitions, never from timers.

## 5. Open choices (owner)

1. Approve that a *drifting/strained* flag reduces how often Ren initiates (an eligibility change), as proposed.
2. Approve the counted events (broken commitment, expired unanswered) and the exemption for "Tell Ren I can't" and for forced bedrest.
3. Are the flag names right, or should the tone be different ("busy", "distant")? Names are display copy only.
4. Does the Receipt show the flag by name, or only the facts that led to it?
