# Later Ren dialogue graph — proposed immutable topology

Owner selected the illustrated two-path, multi-exchange depth as a starting point. These are finite candidate nodes for one root review, not yet implemented. Every spoken node is display-gated, every option records its bounded choice, and reload preserves the cursor without duplicate display. Finish at the ending is the sole route to the existing completion/HP/relationship transaction; leaving, Uninstall and recovery never imply completion. Copy appears in `later-ren-branch-draft.md` unless stated below. No new RNG, score, commitment or invented object/result follows from a conversational option.

Shared entry: `s0` at the door offers two activity-specific greetings; they lead to distinct `s1a`/`s1b` replies, then Continue to the appropriate activity root. Chat: “Good to see you too” / “How are you?”; game: “Come on in” / “Ready to play?”; repair: “I’d like to talk” / “Thanks for coming”. Chat remains at the door; game moves to actual couch/floor. Couch has the existing pajama cue; floor respects sold TV. Repair uses its actual scene setting. Do not say the player entered a place the visual does not show.

| Activity | Node | Content and choices | Next nodes |
|---|---|---|---|
| Chat | `c0` | “how’s your day going?”; busy / ask about making | `c-busy` / `c-making` |
| Chat | `c-busy` | “same here. i’m glad we found a minute.”; “Me too” / “It’s nice to take a break” | `c-busy-a` / `c-busy-b` |
| Chat | `c-making` | “i’ve been tinkering. half the fun is figuring out what to try next.”; “What do you enjoy about it?” / “That sounds fun” | `c-making-a` / `c-making-b` |
| Chat | `c-busy-a`, `c-busy-b` | “me too.” / “a break sounds like a solid plan.”; Continue | `c-end` |
| Chat | `c-making-a`, `c-making-b` | “when something finally fits together. even better when i can figure out why.” / “usually. the stubborn bits make the good bits better.”; Continue | `c-end` |
| Chat | `c-end` | “i should get going. glad we had a minute.”; Finish | existing completion |
| Game | `g0` | “i remember the rules being simpler than this. possibly because i was winning.”; “I think you’re remembering it wrong” / “Want to figure them out together?” | `g-tease` / `g-together` |
| Game | `g-tease` | “that’s a serious accusation. do you have evidence?”; “That sounds very convenient” / “Your memory is suspicious” | `g-tease-a` / `g-tease-b` |
| Game | `g-together` | “yes, please. i was hoping one of us had read them.”; “We can learn as we go” / “Let’s start with the basics” | `g-together-a` / `g-together-b` |
| Game | `g-tease-a`, `g-tease-b` | “inconclusive. we’ll need a rematch.” / “my memory has an excellent reputation. according to me.”; Continue | `g-end` |
| Game | `g-together-a`, `g-together-b` | “excellent. confusion is better with company.” / “good plan. we can take it one step at a time.”; Continue | `g-end` |
| Game | `g-end` | “good game. we should do that again sometime.”; Finish | existing completion, no new scheduled plan |
| Repair | `r0` | “we can take a little time and figure this out together.”; “How can we reconnect?” always; “I’m sorry I missed our plan” only when `hasUncommunicatedBreak` | `r-reconnect` / `r-apology` |
| Repair | `r-apology` | “thanks for saying that. i didn’t know what happened.”; “I should have told you” / “I’d like to do better” | `r-apology-a` / `r-apology-b` |
| Repair | `r-reconnect` | “i’d like us to make a plan we can both count on.”; “Let’s take it one step at a time” / “Thanks for being honest” | `r-reconnect-a` / `r-reconnect-b` |
| Repair | `r-apology-a`, `r-apology-b` | “a message next time would help.” / “we can take it one plan at a time.”; Continue | `r-end` |
| Repair | `r-reconnect-a`, `r-reconnect-b` | “works for me.” / “thanks for asking.”; Continue | `r-end` |
| Repair | `r-end` | “i’m glad we talked.”; Finish | existing repair completion and reconnection rule |

`hasUncommunicatedBreak` is captured at begin from actual bounded history `outcome === broken`; ignored knock, refusal, notice, recovery and unanswered offer never satisfy it. The graph never mentions a repair object or determines a winner. Context flags control only factual text/availability, not the established relationship outcome.

## Message surface and explicit scope

Invitation retains Accept / Another evening / Not this time and existing confirmation for a proposed new date. Acknowledgment, communicated cancellation, decline and broken-plan messages use the current factual response and close. The finite optional message-reply graph is specified in the later subsection below; its explicit response-reply intent preserves earlier direct-close histories. Sales disclosure/floor reconfirmation and conflict warning remain factual operational controls, not forced dialogue.

## Compatibility and evidence gates

Only a NEW `social46_begin` intent carrying a supported dialogue version creates graph state; an existing begin without it preserves old revision2 three-beat behavior on replay. Revision1 and no-social replay remain unchanged; unknown graph versions fail. State stores finite node/choices, shown status and frozen factual context; each logged action deterministically transitions it. Actual presented text is projected to Receipt from an allowlist, never arbitrary state. Each graph edge/conditional and both art contexts need tests, including saved progress, old/new replay, keyboard/focus/reduced motion, interruptions, context disclosure and neutral RNG/health/history before Finish. Actual desktop and true 390 CSS-pixel views and owner experience review follow root's mechanism/source gate.

### Fixed entry replies

For `s1a`/`s1b` respectively, chat replies are “you too.” / “pretty good. glad we could catch up.”; game replies “thanks for having me.” / “as ready as i’m going to be.”; repair replies “okay. i’m listening.” / “of course.” Each has exactly one Continue to its root. The couch pajama cue is a separate shown Continue node: “i dressed for a pajama game night. comfort is a competitive advantage.”

### Finite optional message replies for the same batch

After a displayed declined-offer response (“all good. another time.”), choices **Thanks for understanding** / **Sounds good** lead to “of course.” / “see you around.” respectively, then Close. After a displayed communicated-cancellation response (“okay. thanks for telling me. another time.”), **Thanks for understanding** / **I appreciate it** lead to “of course.” / “we’ll find another time.” then Close; the latter expresses intent, not a scheduled plan. After an actual broken-plan response (“didn’t see you. let me know if another time works.”), **I’m sorry I missed it** / **Can we talk later?** lead to “thanks for saying so.” / “yeah. let me know when works.” then Close; neither reverses the recorded break or guarantees availability. In each case **Close message** remains a direct exit. Branch lines are separately displayed evidence; a choice does not reschedule, repair or change relationship. Existing invitations already branch into accept, decline and reschedule with their current explicit mechanical effects and confirmation.

Proposed distinct version boundary: only a new `social46_response_reply` intent with a supported finite choice creates an optional reply node; existing `social46_response_dismiss` remains valid for older histories and direct Close. A new display intent logs the chosen line once, and a final dismiss removes the response. Do not add fields to historical state before such an explicit intent. Root must approve this response-node extension alongside the scene graph before code; replay old response events unchanged.
