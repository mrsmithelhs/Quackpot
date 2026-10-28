# Owner sampling guide: Plan 18 expanded audition

Catalog revision `2026-10-28.1`. This is for choosing candidate sounds; nothing here is adopted for the game.

## Opening the page
Open `audition.html` in this folder in a current Chrome, Edge or Firefox (a double-click is the intent: it is built to run from `file://` with no server, because the catalog data is an ordinary local script and the audio is plain relative files). **That `file://` use has not been exercised in a browser yet** — see "What has and has not been checked" in `progress.md`. Nothing plays until you press Play; `Esc` or **Stop all** stops everything.

## How to choose
1. Go section by section on **Effects by purpose**. Each purpose has a **Pool**. Tick **In pool** on every sound you would accept for that purpose. A pool is a *proposed random-variation set*.
2. **Preview random from pool** plays one sound from the ticked ones only, never the same one twice in a row when you ticked two or more, and tells you which file it picked.
3. Use **Shortlist** for "maybe, listen again" and **Reject** for "never". These are different from pool membership. Rejecting a sound removes it from pools.
4. **Add pool** makes an extra named pool inside a purpose (for example "soft quacks" and "loud quacks" for ducks). The dropdown picks which pool your ticks go into.
5. Notes are saved per sound. **Quieter** is an audition-only extra attenuation (0, −6, −12 dB) for sounds that are too loud next to others.
6. **Audition mocks** layer two sounds from your pools to hear them together. They are not game events and show no outcome.
7. **My choices** → *Download choices (JSON)* is the file to send back. It lists stable file IDs, which pool each is in, shortlist/reject lists and notes, and the catalog revision. Choices are also kept in this browser; if the catalog changes later, nothing is reset, stale IDs are listed.

## What to listen for
- **Duck vocalizations:** three tone families. Several "cartoon" files are **people imitating ducks**, not duck recordings (labelled). The 3.0–4.0 s excerpts are trimmed from longer originals; the originals stay unmodified in `audio/_originals/freesound/`.
- **Loudness:** files are not loudness-matched. WAV files have a documented attenuation-only gain; MP3/Ogg files could not be measured without a decoder and play at their native level. Files marked "quiet" are quiet. Use master volume and **Quieter** to compare, and do not read the dB numbers as perceived loudness.
- **Gaps:** card anticipation accent, crowd gasp/aww, podium sting, toy horn and a soft rubber bump had no acceptable candidate (see Credits tab). They are reported, not padded.
- **Ambience (rain):** separate and optional; weather audio is not approved for production.

## Credits and licensing
The **Credits & notices** tab and `catalog/ATTRIBUTIONS.md` list source, creator, license and changes for *every* auditionable file. Eight effects (CC BY 3.0 or 4.0) and the "Fluffing a Duck" music track would need credit lines if kept; CC0 and public-domain credit is optional. The three Kenney files from the earlier audition are marked "provenance pending" (official pack pages are CC0, verified by root, but these files came from a mirror of a 2014 snapshot).

## Sound reasons to send back
Which sounds go in which pools, what you reject and why, any extra roles you want, and whether the gaps matter.
