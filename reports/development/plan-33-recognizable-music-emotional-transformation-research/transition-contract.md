# Plan 33 — Transition and lifecycle considerations (options, nothing selected)

Prepared 2026-10-28. This document lists **options and constraints** for crossfading between apartment and gacha music and for the music's behavior across the game's lifecycle. It selects no implementation, library, source, trigger or schedule, and it does not touch production. It is derived from official documentation as read by research workers (see `research/t4-browser/` and `research/browser-pass-b2-results.md`) plus game-practice accounts [P]. Facts are tagged **[T]** (spec/documentation), **[P]** (practitioner), **[H]** (my inference). Nothing here was measured on target school machines.

## 1. Design principles (from the owner's brief; not new decisions)

- **Single audio owner.** One controller creates, fades, ducks and stops all game music; views request changes and never touch audio nodes. This is an architectural *option*; the design for where it lives is a later integration gate.
- **Serve context change and story, not obscure exit or costs.** Music must not delay, mask or alter the visibility of Uninstall, costs, odds or warnings.
- **Music expresses the character's story experience.** It is driven only by explicit, authored story state, never by an inferred player emotion or motive; the Receipt may say which music state was *displayed*, never why the player acted.
- **Player controls always win.** Mute and volume apply immediately to every music path.

## 2. Platform constraints that shape every option

| Constraint | What the documentation says | Consequence |
|---|---|---|
| Start/resume | A context created before a user gesture starts `suspended`; Chrome says call `resume()` after a gesture. Chrome pages read are dated 2017/2018 and need a current check [T]. Firefox has a pref that can require sticky activation and `navigator.getAutoplayPolicy()` [T: MDN]. | The first music start must follow a player gesture; the apartment's "first click" or start screen is the natural place. |
| States | `suspended`, `running`, `closed`, `interrupted` [T: Web Audio WD 2026-09-22]. In the `interrupted` case the spec's `resume()` steps set `interrupted` and reject with `InvalidStateError` when the control-thread state is interrupted [T]. MDN: `interrupted` is a pause caused by something outside the web app; the browser decides when it unpauses [T]. | Do not assume `resume()` succeeds; listen to `statechange` and re-check before any new fade. |
| Suspended time | Suspending stops `currentTime`; scheduled automation does not advance [T: spec, T4 F18]. | Never implement "mute" by `suspend()`: it freezes the loop clock and any in-progress fade. |
| Automation | Fade primitives: linear ramp, `setTargetAtTime`, `setValueCurveAtTime`, `cancelScheduledValues`, `cancelAndHoldAtTime`. An exponential ramp to 0 is not possible; the spec suggests `setTargetAtTime` as an approximation [T]. | Fades should be linear, set-target or curve-based; start every fade from the *current* value after cancel-and-hold. |
| Loops | `AudioBufferSourceNode` loop points (`loopStart`/`loopEnd`) are buffer-indexed; out-of-range values clamp to the buffer start/end [T]. The HTML `loop` attribute seeks to the start at end of resource and is not documented as gapless [T]. | Decoded-buffer loops are the documented way to loop precisely, subject to codec padding that the reviewed pages do not address. |
| Scheduling | Timer callbacks can be late by tens of milliseconds or more; schedule slightly ahead on the audio clock [P: Wilson 2013, practitioner article]. Hidden-tab timers are throttled; tabs playing audio are treated as foreground [T: MDN, Chrome docs] [T4 F10–F11]. | Pre-schedule loop starts and bar-aligned steps on the audio clock; do not rely on `setTimeout` for musical timing. |
| Equal-power / headroom / mute | The reviewed official pages say nothing about equal-power curves, headroom or limiter guidance, or mute semantics [T4 gaps]. | These are design choices to be settled by listening tests; no documented defaults exist. |
| Memory | Decoded audio is uncompressed 32-bit float PCM; a 19.2 s stereo stem at 48 kHz ≈ 7.4 MB [T arithmetic]. | Budget stems; avoid decoding unused states (see §7). |
| iOS/Safari | A WebKit bug records AudioContext suspension on background (marked fixed 2022, later reports of persistence anecdotal) [T4 src 20]. Safari 18.4+ supports Ogg Opus; MP3 is the widest-supported documented option [T4 F6]. | Test early on target devices; plan an MP3/AAC fallback or choose one format. |

## 3. Audio-owner state machine: options

**Option 3A — Two persistent loops, gain crossfade.** Both the apartment loop and the gacha loop are decoded and kept playing silently when not selected; switching moves gain. *Pros:* no restart latency; loops stay phase-continuous. *Cons:* memory for both sets; CPU for muted sources; the "silent" loop keeps advancing, so the gacha tune is at an arbitrary bar when entered.
**Option 3B — Start-on-entry.** The target loop starts at its first bar (or a designated entry bar) at the next bar boundary of its own timeline while the old loop fades out. *Pros:* gacha music always enters at a known place; less memory if unused loops are not decoded. *Cons:* needs decode-ahead; cold-start latency if not decoded.
**Option 3C — Hybrid.** Keep the base-state stems of the current context warm; start others on demand. *Pros/cons:* in between.

## 4. Crossfade semantics: options

| Dimension | Options | Notes |
|---|---|---|
| Duration | Short (about 0.5–1 s), medium (about 1.5–3 s), long (about 4+ s) — **owner/listening decision**; no evidence in the reviewed sources | Music should not outlast the screen change so that it obscures a modal or exit; for exits, prefer short. |
| Shape | Linear; equal-power (via a precomputed curve with `setValueCurveAtTime`); set-target | Perceptual merit untested [H]; test in paired listening. |
| Bounded overlap | Hard cap on simultaneous sources (e.g., the current + the incoming tune + a state-step stem) | A cap prevents doubling and CPU spikes; the specific number is a design choice. |
| Alignment | Immediate; next beat; next bar; next loop boundary | Bar-aligned steps are common practice [P: Phillips]; adds latency up to one bar (≈2.4 s at 100 bpm, 4/4) [T arithmetic]. |
| Entry point of the incoming loop | Bar 1; a designated entry bar; phase-continuous | Gacha tune "always starts from its hook" is an identity advantage [H]. |

## 5. Interrupted or superseded transitions: cancellation and resume

Proposed invariants (options for the owner/orchestrator to adopt, modify or reject):

1. **One transition at a time.** A new request supersedes the in-progress one; it never runs in parallel.
2. **Cancel, hold, then ramp.** On supersede, call cancel-and-hold on every affected gain at "now", read the held value, and ramp from that value to the new target. This avoids pops and the "snap to zero/one" artifact [T: `cancelAndHoldAtTime`].
3. **No doubling.** A source node is created once per start and stopped exactly once; after its gain reaches an inaudible value and the fade is done, stop and release the node. (A buffer source plays only once [T].)
4. **State is data, not audio.** The controller stores the *requested* context (apartment/gacha/silent) and music state (base/uneasy/dire); the audio graph is reconciled to that store, so a failed or delayed `resume()` can be retried without guessing where it was.
5. **Idempotent requests.** Requesting the current context and state is a no-op.

## 6. Loop continuity options

- **Persist the playhead per context.** Record the loop-relative bar when leaving a context and resume from it on return (phase-continuous). *Pro:* no repeated hook; *con:* complexity.
- **Restart at bar 1 on entry.** Simple; the hook is heard at the start of every visit; *risk:* more repetition of the first bars, so more fatigue [P: Phillips, Martins].
- **Re-enter at the next phrase boundary.** Compromise.
- **Seam hygiene.** Stems of identical length, boundary on a bar line, no tail crossing the seam (see `composition-brief.md`); verify the seam without listening by rendering the loop boundary offline and inspecting sample values [T: OfflineAudioContext, T4 R2].

## 7. Memory and decode options

Decode only the current context's stems plus the target's lead and rhythm; decode state-specific accompaniment stems lazily at the first story-state change, or all at the first user gesture if memory allows. Budget examples: five stems ≈ 37 MB, eight ≈ 59 MB at 19.2 s stereo 48 kHz [T arithmetic]; no measurement on target machines.

## 8. Story-state options (explicit only; no classifier)

The music state (base/uneasy/dire) must come from an **explicit authored story state**. Options to put to the owner:

| Option | What drives the state | Honesty/risks |
|---|---|---|
| S1 — Story flag | A single authored "music mood" value set by authored narrative beats (e.g., ending of a day, an apartment event) | Cleanest, auditable; the owner/author sets the schedule later |
| S2 — Existing explicit counters | A threshold on an existing displayed game value (e.g., a displayed stage/day or visible balance) chosen by the owner | Must state what displayed value is used; never an inferred psychological estimate |
| S3 — Authored scene map | Each scripted scene declares its music state | Easy to review; no automatic escalation |

**Excluded by design:** any inference of the *player's* emotion, motive, spending intent or "addiction level"; any adaptive response to input patterns presented as insight into the player. The Receipt may record the state displayed with the event log; it must not say the music reflects how the player felt.

## 9. Lifecycle behaviors to decide

| Situation | Options | Notes |
|---|---|---|
| **Mute / volume** | Mute ramps the master (or music bus) gain to ~0 over a short fade and keeps the timeline running; unmute ramps back | Use a gain, not `suspend()` [T]. Mute must be one click and persistent across screens. The perceptual volume curve is a design choice; the reviewed docs give none. |
| **Hidden tab / window blur** | (a) Leave music playing (browser keeps audio tabs foreground-ish [T: MDN]); (b) fade out and pause when hidden; (c) duck | Document the choice; test the 10+ minute hidden case per browser (Firefox/Safari timer behavior not verified). |
| **Context `suspended` / `interrupted`** | Pause cue logic, show nothing alarming, reconcile when `state` returns to `running` | Do not queue fades that assume time advances [T]. |
| **TV sale (apartment music source sold)** | Apartment-source music stops/fades to silence; **the gacha context's music is unaffected** | Apartment silence must not imply the gacha game stopped; the story-state music for gacha continues to follow its own state. Fade length is a design choice. |
| **Entering the Uninstall modal** | (a) No change; (b) brief duck of the music bus so text remains clear; (c) fade to silence | Must never delay, obscure or pressure the exit choice [hard design constraint]; (a) or (b) keep behavior predictable. |
| **Uninstall chosen** | Short fade to silence at the transition to the Receipt; Receipt screen silent or calm base; never dire | Immediate Uninstall must not wait on a fade; any fade is cosmetic and cancellable. |
| **Receipt** | Silent, or an owner-chosen neutral loop, with its own mute control | Receipt reflection should not be steered by music; this is a hypothesis-level preference, owner decision. |
| **Reduced-motion / reduced-audio preferences** | Offer a "music off / reduced" setting; consider a quieter or non-dire-only variant | The browser provides a motion preference, not a documented audio-reduction preference [T4]; treat as an in-game setting. |
| **Page reload/restore** | Restore the context and state from save data; wait for a user gesture before sound | Autoplay rules above. |
| **First-run** | Click-to-start before first sound | Required by autoplay policy in the browsers reviewed. |

## 10. Items to verify later on real machines (unmeasured)

`baseLatency`/`outputLatency`; device sample rate (44.1 vs 48 kHz); decode time and memory for planned stems on low-RAM laptops and Chromebooks; behavior under managed browser policies; hidden-tab behavior over 10+ minutes in each browser; iPad/Safari background and mute-switch behavior; the audibility of fades of different lengths and shapes (paired listening); whether `statechange` events arrive reliably in each target browser.

## 11. Not decided here

No library, no implementation, no fade length, no state schedule, no story trigger, no soundtrack adoption, no production edit. Apartment-music source search belongs to Plan 30; hook and arrangement composition to Plan 32.
