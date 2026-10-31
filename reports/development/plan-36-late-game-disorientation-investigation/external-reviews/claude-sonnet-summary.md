# Summary: `claude-sonnet` review of Quackpot and Plan 36

Report-only; nothing here is adopted or authorized. Repo revision read: `main` at `d367b97`. Full detail is in `claude-sonnet-review.md`.

## Strongest recommendation

**Orient the player, disorient the character.** Make *unreliable narration* the spine of Plan 36, and build the rest around it:

- A first-person caption layer in which each rationalization ("Rent's fine. Rent's always fine.") is bound to a checkable fact in the run record.
- A diegetic **plain version** always one action away (a fridge ledger/bill the narration never mentions but the student can open).
- A Receipt section that audits **what the character said against what the record shows**, in the existing three registers, without saying what the student felt.

Why this over the more obvious "weird transitions" set: it works in text and stills (reduced-motion native), it needs no control sabotage, it uses facts the engine already logs (day, food expenses, sold assets, debt), and it teaches a transferable design idea (rationalizing language in live-service games), not just a mood.

## Proposed experience arc

About 36-50 minutes core (assumed, unmeasured), built as four chapters over roughly 10-11 in-game days: a calm baseline (Days 1-3, essential, because effects mean nothing without it), a squeeze with the first intrusion, a spillover chapter where arcs diverge, and a short resolution. Each day closes with a brief apartment scene where life choices live. Nights are save points with a "Previously" recap read from the log. A rapid low-reading route is ~15-20 minutes. Early Uninstall at any point reaches the Receipt; the Receipt names only beats that actually fired.

Three contrasting arcs, determined by declared fictional state (never click behavior):
- **Tide:** spillover intensifies; collection delight is rendered as delight; endings include Collection, Running on Empty, Uninstall.
- **Tether:** the student answers a neighbor's knock; spillover turns playful; gacha play can continue.
- **Window Shopper:** the student barely spends and the narration rationalizes *watching* the banner, which shows that the lesson is about attention, not spending.

## Three priorities

1. **Narration-to-fact contract sheet** (docs only): twelve candidate lines, each bound to an exact log event or state field. Cheapest test of the spine; finds missing events before anything is built.
2. **Determinism spike** (pure functions): a `pressureBand(state)` and a stateless cosmetic draw `createRng(seed).fork('cosmetic').fork(beatKey)`, with tests that save/restore gives equal output and draw/race/event streams are bit-identical.
3. **Verify apartment Leave** before any apartment beat. By my reading of `src/main.js:604-612` and `:268-275` versus `:496`, choosing Leave while on the apartment desk sets the Receipt step but leaves `phoneOpen` false, so the Receipt may appear only after pressing the desk phone. If a rendered check confirms it, that is a current gap against immediate Leave, independent of Plan 36.

## Shortlist of four effects

(A) Margin Notes plus the unmentioned object; (B) Receipt cards (meal receipts shown in Duck-Dex frames, amounts from real expense records); (C) "Where you land": Quiet Return stays the default, with rare landings in another authored room and a phone-buzz **offer** instead of a snapback; (D) Maintenance Day, a quiet recovery beat with an apology-gift offer as a nameable technique.

## Main pushback

- **Do not slow, restart or fake-fail the return.** Today the apartment is unreachable until the animation completes and a second press restarts it, so "slower" means waiting. Replace the snapback wobble with a summons the student can accept or decline; that gives the same pull and a loggable choice.
- **"Disorientation" should apply to prose and composition, never to input.**
- **Plan 36 cannot be "late-game" yet.** The production route is three days; the beats depend on Plan 28/29 length and apartment work.
- The brief's no-click-inference rule is right, but it removes the most natural gate for habit content; I gated on world state instead.

## Owner decisions needed (each flagged in the review)

Persisted apartment location (schema bump); a Receipt section for narration/presentation that is not a manipulation technique; a global "Sensory effects: Standard/Calm" setting; second-press-skips-return (alters accepted Shell A behavior); compensation gems as a new technique and economy grant; whether the neighbor thread collides with the deferred Mom/streamer material; Envelope Night as a new mechanic; sequencing against Plans 28/29.

## What would falsify the favorite idea

Students cannot name any caption/record divergence even when prompted; they treat captions as instructions and miss a bill; they open the plain ledger first and ignore the narration; a screen-reader pass hears contradictory text with no "this is a character's voice" cue; or reading time per beat is long enough to push the run well past a class period.
