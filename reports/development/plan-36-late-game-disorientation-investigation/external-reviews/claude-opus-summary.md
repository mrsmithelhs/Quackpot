# claude-opus — summary (Quackpot / Plan 36 external creative review)

Date 2026-10-30 · input `C:/AI/Quackpot` @ `d367b97` (read-only) · full argument in `claude-opus-review.md`.
All items below are **proposals for owner triage**, not adopted design.

## Strongest recommendation

**Make unreliability something the student can investigate, not something done to them.** Introduce one
standing verb, **Look again** (a "Second Look"). Whenever the story shows a disturbed version of the
apartment or a message, a small control cuts to a plain, factual framing. That framing is often taken from
the inanimate rubber duck's fixed vantage, using camera and composition rather than animation. It shows the
stove clock, the cold pot, the dashed space where the couch was, or a friend's text in plain words. The run
then closes with a **Napkin Tally**: the character's own rosy, rule-based self-accounting, set beside the
printed Receipt. The student gets the gap between the character's story and the facts twice: once in the
moment (optional) and once at the end (as the first discussion move). Controls are never sabotaged, and
the debrief never becomes unreliable.

Corollary: **put lost time in the cut, not in the animation.** Keep Shell A's accepted ~1 s return. Change
what the player arrives *to*: dusk instead of daylight, a later stove clock, a cold plate, and the line "Back.
That was quick."

## Proposed experience arc

The apartment needs a life before gacha can spill into it. I propose a ~7 in-game-day week with a pay cycle
(aligned with Plan 29's draft) and one outside friend, **Ren**. Ren texts, asks for help with a bookshelf,
invites the character to a Saturday picnic that collides with a banner's last day, and isn't wounded by a
no. Day 4's night is a natural save/break point. Rough pacing: **≈27–41 min core engaged; ≈14–17 min
rapid; Receipt/napkin reflection 5–8 min; replay open-ended**. These are assumptions, not measurements.
Early Uninstall still yields a short napkin note and a Receipt reflecting on what preceded the exit.

There are contrasting arcs, not one decline:
- **Spillover:** gacha grammar spreads, arrivals happen at odd hours, the napkin is rosy. The student may
  enjoy the week, and that answer is allowed.
- **Counterweight:** picnics, sleep and small doses; gentle echoes only.
- **Mixed:** pressure bands can *fall*, so recovery shows in the art.

New endings to consider: **Saturday** (went to the picnic) and **Good Week** (played a lot, enjoyed it, paid
rent). Both are owner-gated.

## Three priorities

1. **Shared apartment-beat contract (with Plan 28).** A persisted beat ledger that records the variant when
   it is shown, so reloads cannot reroll it. Pressure bands come only from declared story facts (day, sales,
   accepted/declined invites, bedtime), never click behaviour. Cosmetic variation uses a separate labelled
   PRNG fork; `prng.mjs` already guarantees that a new fork label never shifts `draw`/race streams. Every
   disturbed beat has a plain twin, which also serves as the reduced-motion and "Plain" form.
2. **Shortlist of four complementary effects:** Time in the Cut (transition); Receipt Dex and
   collection-shaped absences (environment, built from *real* meal/sale records); Look again plus
   gacha-styled personal messages (narration). Bills and prices are never restyled. Napkin Tally is the
   fourth.
3. **A Receipt "Story the game showed you" strand.** It sits separate from manipulation techniques and
   states why each scene looked as it did ("Day 5; couch sold"), what the napkin left out, and the story
   choices the student actually made. It asserts no felt effect.

## Main pushback

- **Slower and erratic transitions are the weakest carrier.** Stretching an `aria-hidden` overlay mostly
  delays focus return and looks like a bug, especially to keyboard and screen-reader users. If the owner
  still wants slowing, cap it at about +40%, keep it non-erratic and keep it cancellable.
- **"Someone else's apartment" and an apparent snapback to gacha** imitate routing and control failures. I
  keep only arrivals with a story cause (the buzzer, a parcel, Ren at the door). The urge to check the
  phone is shown as a still frame plus an ordinary choice. It is never motion and never an auto-open.
- **Music bleed is premature.** Production has no audio runtime and no mute or volume control. Sequence it
  after Plans 30/32 and an audio-settings packet. When it comes, caption it as "in their head" and keep it
  distinct from TV playback.
- **Code-reading flag (not runtime-tested):** Uninstall → Leave from the *desk* appears to set the
  Receipt step without opening the phone view. `main.js:604-612` vs `:268/:496`. The Receipt would then
  not draw until the phone is clicked. Apartment-heavy designs make this path more common, so I recommend
  a browser check before apartment work.

## Owner decisions

The ~7-day week; Ren as a standing character; Look again as a standing verb; Napkin Tally plus the Receipt
story strand; the Saturday and Good Week endings and their relation to Uninstall's "best ending" title;
fictional merch/plush purchases (a parcel that literally brings gacha home); an in-game **Story effects:
Full / Calm / Plain** setting; and whether to accept my reframing of the slow/erratic-transition seed
rather than the seed as written.

**What would falsify Look again:** storyboard readers never use it, or use it compulsively as
spot-the-difference, or read the duck-vantage view as the companion judging them, or the per-beat "plain
twin" costs more than the owner will fund.
