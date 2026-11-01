# Possession-sale examples with and without a social consequence (draft 1)

The examples distinguish selected cases from illustrative implementation details. The owner-selected sale direction is that a social effect occurs only where a prior scene establishes a concrete shared context; do not automatically punish every sale, equate financial distress with being a bad friend, imply Ren owns the player's things, or invent shared history just to attach a penalty. Sale amounts, item availability and Receipt taxonomy remain outside this study. Plan37 requires material consequences to be disclosed **before** the commitment when action-time rules apply.

## Principle [PROPOSED]

A sale has a social effect only if **a prior, player-visible scene established the context**: a plan the player accepted, or an item whose meaning was shown. The sale itself never writes "Ren is upset." What changes is a concrete, disclosed effect on *that plan*, plus an in-character reaction line that can be warm, worried or neutral. The relationship flag (see 04) changes only if the player then **breaks** the affected commitment without telling Ren, exactly as for any other commitment.

## Example 1 — A sale with a concrete social consequence: the couch and the game night

**Established context (must exist before the sale can matter).** On Day 3 Evening, Ren texts: "can i come by thurs with the board game? ur couch is the only seat that fits two." The player taps **Sure, Thursday evening**. This is an accepted commitment (Evening of Day 5) in the invitation ledger and is visible as "Ren is coming by, Day 5 Evening" on the phone.

**The sale.** On Day 4 the player has Proactive Liquidation available [LEDGER-11] and picks **Sell the couch**.

**Disclosure before the commit (neutral, not a lecture):**
The selected direction includes a request to reconfirm Ren's plan after disclosure of the seating change (S19). This example does not specify the prompt's timing or branch behavior, and does not prescribe a forced choice.

**What happens next, by player choice:**
- The sale and seating change are disclosed; the selected request asks the player to reconfirm the existing plan. Exact UI timing and branches are implementation details for a later mechanism proposal. If the plan is honored, the visit uses the **floor version** and gives the normal `+h`; the sale itself changes no flag or HP.
- **Keep it.** Nothing changes; the couch scene plays.
- **Sell, then break the plan (no show, no "Tell Ren I can't").** One counted broken commitment, exactly as in Trace C. The sale is not the cause; the broken plan is.

**Social downside, in plain words:** the hosting scene gets *rougher* (floor seating and Ren's reaction line), and Ren asks the player to confirm the plan again. This is the "additional downside beyond an empty room" LEDGER-11 asks for, kept to a concrete, recoverable cost. It does not depend on guessing why the player sold.

**What this does not do:**
- It does not say Ren owns the couch or can veto the sale.
- It does not read financial distress as being a bad friend; Ren's line offers help ("you ok?") rather than a verdict.
- It does not require the established context to exist at the moment of every sale, only when Ren's plan genuinely depends on the item.

**Receipt mapping:** *Displayed* — the pre-commit disclosure text and Ren's invitation. *You did* — sold the couch; chose whether to tell Ren; honored or did not honor the Day 5 plan. *Automatic consequence* — the scene variant (floor) and the confirm request. Reflection question: "When the sale and Ren's plan overlapped, what did you weigh?" The Receipt does not assert the sale was about money or about gacha.

## Example 2 — An ordinary sale with no social consequence: the TV

**Context.** The TV sits in the living room. No scene has tied the TV to any plan with Ren. The player picks **Sell the TV** (proactive or via the escalation ladder).

**Disclosure.** The existing sale disclosure ("the TV is gone from the room") and nothing about Ren.

**After.** Ren has no required reaction. A light, optional line may appear on the next *normal* contact ("tv's gone, huh. my bike stand's free if you need a project") as flavor with **no flag change, no HP change, no counted event**. Selling the TV is a sale, not a social act.

**Why it matters:** the same action can be neutral or consequential depending only on whether a concrete shared context exists. That keeps sales from being automatically punished and keeps Ren from becoming a moral monitor of the player's finances.

## Example 3 — Item that carries Ren's gift [OWNER-SELECTED]

Ren builds a small shelf for the player after a shelf-carry visit (I3). Later the player sells it. Ren is not an owner; it was a **gift**. Ren's reaction can be nuanced: "money's money, i'm glad it went to rent" (if sold during the rent crunch) or a quiet "oh" (if sold sooner), chosen from **facts about the sale** (was it in the escalation ladder or proactive?) and never from a guess about motive. No flag change; at most a single story line. Only worth building if the owner wants gifts to carry emotional weight; otherwise skip.

## Historical owner questions (closed by ledger)

1. Approve the principle: a social consequence only where a prior scene established a concrete shared context.
2. Approve Example 1 as the single consequential case (hosting/seating), or choose a different shared context.
3. Is Example 3 (gifted item) wanted?
4. Should the neutral "tv's gone" flavor line exist at all?

## Status after owner review (2026-10-31)

Owner approved the principle (a social effect only where a prior scene established a concrete shared context), Example 1 as the single consequential case, the gifted-item reaction (Example 3) and the neutral "tv's gone" line (ledger S18 to S21). The floor game-night scene for Example 1 is drawn: `concepts/apartment-scenes/scenes/ren-floor-game-night.svg` (S52 to S54).

The couch-sale reconfirm request remains selected (S19). Its exact timing and branch behavior are future mechanism details; this report does not choose a forced choice or invent when confirmation occurs.
