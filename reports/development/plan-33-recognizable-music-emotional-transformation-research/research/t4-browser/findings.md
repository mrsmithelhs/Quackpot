# T4 findings: official browser-audio constraints for a static offline game

**Provenance:** Authored by Haiku worker T4 (Plan 33); saved by the Sonnet integrator from the worker's returned text, reformatted but not substantively edited. Source numbers refer to `sources.md` in this folder. Pages were read through summarizing fetches; not independently re-opened by the integrator.

**Integrator flag:** F1's sentence "resume() from an interrupted state moves the context to 'interrupted' and rejects" reads oddly and is not trusted until checked against the spec text. Chrome's autoplay page (src 7) has a date conflict. The 0.1 s lookahead, 25 ms timer and throttling numbers (F10) are example/Chrome-specific figures, not general limits.

All findings here are **[T]** (specification/documentation description) unless marked. None measures audible results or player effect.

## 1. Key findings

- **F1 [T] (src 1)** The Web Audio spec defines four context states: suspended (context time stops, hardware may be released), running, closed, and interrupted. The visible text does not say what causes an interruption. *(See integrator flag on the `resume()` wording.)*
- **F2 [T] (src 7, 5)** Chrome guidance: a context created before a user gesture starts "suspended"; call `resume()` inside a click handler; read `state` after creation and listen for `statechange`. Starting a source with `start()` outside a user input event is subject to autoplay rules (src 5). Chrome's page is dated 2017 but describes 2018 changes.
- **F3 [T] (src 5)** MDN documents the Firefox pref `media.autoplay.block-webaudio` (when true, contexts play only after sticky activation). `navigator.getAutoplayPolicy("audiocontext")` returns allowed / allowed-muted / disallowed; MDN recommends checking at page load because there is no change notification.
- **F4 [T] (src 1, 8)** `start(when)` schedules on the context clock. A `when` in the past starts immediately; negative throws RangeError. A buffer source plays only once, so a new node is needed per start. Loop uses `loop`, `loopStart`, `loopEnd` (seconds); `loopEnd <= 0` or beyond buffer duration loops the whole buffer. MDN calls source nodes "very inexpensive to create."
- **F5 [T] (src 3, 1, 17)** No visible spec or MDN text addresses encoder delay, padding, or gapless looping for any codec. The HTML `loop` attribute seeks to the earliest position at end of resource, with no documented timing guarantee. So a looping media element is not documented as seamless; a decoded-buffer loop is sample-indexed, but leading/trailing codec padding is not addressed.
- **F6 [T] (src 17, 22)** MDN: MP3 is supported in MP4 and ADTS containers; global caniuse support about 97.5% (Chrome 4, Edge 12, Firefox 22 with partial support from 3.5–21, Safari 4, iOS Safari 4). Ogg Opus and Vorbis in Ogg arrived in Safari 18.4+ (iOS 18.4+). WAV LPCM supported. FLAC unavailable on iOS.
- **F7 [T] (src 13, 1)** AudioBuffer stores non-interleaved 32-bit float PCM in −1..1. MDN says buffers are for snippets "typically less than 45 s" and suggests media elements for longer sounds. `decodeAudioData` sniffs MIME type, decodes only the first audio track, resamples to the context rate, detaches the input ArrayBuffer, and rejects with EncodingError on failure.
- **F8 [T arithmetic]** Memory = seconds × sampleRate × channels × 4 bytes. Stereo 44.1 kHz: 352,800 B/s (≈ 21.2 MB/min). Stereo 48 kHz: 384,000 B/s (≈ 23.0 MB/min). Mono is half. Example: six 60 s stereo 48 kHz stems ≈ 138 MB. No source gives a device or memory budget.
- **F9 [T] (src 1, 9, 11)** Automation: `linearRampToValueAtTime`, `setTargetAtTime`, `setValueCurveAtTime`, `cancelScheduledValues`, `cancelAndHoldAtTime`. The spec says `exponentialRampToValueAtTime` throws RangeError if the target is 0, and if start and end have opposite signs or start is 0 the value holds until the end time — so an exponential fade to or from zero is not valid. MDN's example envelope uses `cancelScheduledValues`, `setValueAtTime(0)`, and a linear ramp.
- **F10 [T] (src 11, 18, 19)** MDN's scheduler example wakes with `setTimeout` every 25 ms and schedules nodes up to 0.1 s ahead using `currentTime`. Background timers are throttled (src 18). Chrome intensive throttling (src 19): a hidden page is limited to about one timer wake per minute when hidden over 5 minutes, with a timer chain count of 5+ and silent for 30+ s; pages that made sound in the last 30 s are exempt. MDN's wording of the numbers differs; do not rely on it as a number.
- **F11 [T] (src 18, 20)** MDN: tabs playing audio are treated as foreground and not throttled. MDN does not say browsers pause media in hidden tabs. WebKit bug 237878 records AudioContext suspension on iOS when backgrounded; marked FIXED in 2022, but later comments report persistence on iOS 16.x (anecdotal).
- **F12 [T] (src 2)** Audio Session API draft: an AudioContext defaults to type "ambient", is suspended on interruption and unsuspended on resume; "playback" is exclusive. Nothing about the hardware mute switch; open issues; no browser support statement.
- **F13 [T] (src 16, 3, 1)** `createMediaElementSource` gives one output with the media's channel count. The one-node-per-element rule and cross-origin silence behavior were not reached in the spec text. WHATWG `crossorigin` is a CORS setting.
- **F14 [T] (src 14, 1)** `OfflineAudioContext` renders as fast as possible into an AudioBuffer (no real-time output); `startRendering()` returns a promise. Default render quantum is 128 frames per spec.
- **F15 [T] (src 15)** `AudioWorkletNode` runs on a rendering thread, loaded via `audioWorklet.addModule()`; secure-context only in some or all browsers per MDN. The 128-frame block size and performance claims are absent from the visible text. An unhandled processor error silences that node.
- **F16 [T] (src 21)** Unprefixed Web Audio: Chrome 14+, Edge 12+, Firefox 25+, Safari 6+ (desktop and iOS). Global usage 97.28%. Silent on AudioWorklet and getAutoplayPolicy.
- **F17 [T] (src 23)** GitHub Pages: site at most 1 GB; soft bandwidth limit 100 GB/month; 10-minute deployment timeout. No per-file limit, MIME or caching statement.
- **F18 [T] (src 1)** Suspending a context stops `currentTime`, so scheduled automation and stems pause with it; media-element output is ignored until resume. Fades keep their scheduled positions but time does not advance while suspended.

Other checked items: `baseLatency`/`outputLatency` described without example values (src 12). Spec limits named: context count (implementation-defined) and the `createBuffer` minimum of 32 channels (src 1). **No node-count limit exists in the visible text.**

## 2. Uncertainty and context limits

- The docs are silent on: node-count limits, memory or CPU budgets, decode time, gapless MP3 playback, equal-power crossfades, mute semantics, headroom/limiter guidance, `file://` fetching, GitHub Pages MIME types.
- Several specs were read in summarized chunks. AudioWorklet, `createMediaElementSource`, DynamicsCompressorNode and the interrupted-state cause remain unverified.
- Conflicts: Chrome autoplay page date (2017) vs content (2018); MDN vs Chrome throttling numbers; WebKit bug FIXED vs later iOS reports.
- Browser documentation does not measure audible results; perceptual claims about crossfade shape are not from these sources.
- No coverage of Safari or Firefox background-timer behavior.

## 3. Recommendations (worker)

- **R1 [T, high]** One AudioContext, resumed inside the first user gesture. Treat "suspended" as the normal starting state, offer a click-to-start control, handle `statechange` (src 7, 5, 1). Test: state before and after first click in Chrome, Edge, Firefox, Safari.
- **R2 [T, med]** For the looping tune, decode short stems (under about 45 s, src 13) into AudioBuffers; loop each with `loop`/`loopStart`/`loopEnd`; start all stems with the same `when` on one context so they share a clock. Test without listening: render the loop boundary with OfflineAudioContext and inspect sample values at the seam.
- **R3 [T, med]** Each layer gets its own GainNode. Before a new fade call `cancelAndHoldAtTime(now)` (or `cancelScheduledValues`), then ramp with linear or `setTargetAtTime`. Do not ramp exponentially to or from zero. Equal-power is a design choice (docs silent); `setValueCurveAtTime` could carry a precomputed curve. Its perceptual merit is [H] and needs paired listening.
- **R4 [H, med]** Keep scheduled audio at least the 0.1 s lookahead horizon. Because hidden-tab timers can be throttled, prefer a longer pre-scheduled horizon when backgrounded; test by hiding the tab 10+ minutes in each browser.
- **R5 [T, med]** One master GainNode for volume and a separate mute path that ramps gain to 0 rather than `suspend()`, since suspend stops the timeline. Any log/perceptual volume curve is a design choice; sources give none.
- **R6 [T, med]** Media element with `loop` is simplest for long audio but has no documented seamless loop; decoded buffers give sample-indexed loops.
- **R7 [T, high for the facts]** MP3 has the widest documented support; Ogg Opus needs a fallback (Safari 18.4+ only).
- **R8 [T, med]** Plan the memory budget with F8 arithmetic before deciding stem count and length; verify actual device use.

## 4. Alternatives (from sources only; no library recommended)

- **A. Pre-rendered stems decoded to AudioBuffers**, looped and scheduled on the context clock (optionally produced with OfflineAudioContext). Pros: sample-indexed loops, shared clock, documented scheduling. Cons: memory per stem (F8), decode time, many nodes with no documented limit.
- **B. HTMLAudioElement tracks via MediaElementAudioSourceNode with gain crossfades.** Pros: streams long files at lower memory. Cons: loop seam not documented as gapless; element and context timing are separate; autoplay rules still apply.
- **C. Live synthesis from an event list** (OscillatorNode with `start(when)` or an AudioWorklet). Pros: no audio files; parametric transformation. Cons: AudioWorklet is secure-context only and needs a module file; synthesis cost undocumented.

## 5. Single-audio-owner crossfade checklist (derived from the docs)

- **State:** one AudioContext; read `state` after creation and on `statechange`; do not start fades unless "running".
- **New fade:** `cancelAndHoldAtTime(now)` (or `cancelScheduledValues`) on each affected gain; set the start value explicitly.
- **Suspended/interrupted:** pause the game's own cue logic; do not queue fades that assume time advances; on resume re-check state and continue from the saved cue position.
- **Hidden tab:** already-playing audio is not throttled (src 18); keep the scheduler horizon long enough (R4).
- **User mute:** ramp the master/mute gain; keep the timeline running so positions stay in sync.
- **`close()`:** release the context only at game exit.

## 6. Known browser differences/risks to test later

- Chrome/Edge: autoplay blocks AudioContext until a gesture (src 7); intensive-throttling exemption for recent sound (src 19).
- Firefox: block-webaudio pref can require sticky activation (src 5); background-timer rules not verified.
- Safari desktop/iOS: AudioContext suspension on background (src 20, conflicting reports); ambient session type (src 2); mute-switch behavior only from an unverified third-party post.
- Safari/iOS: Ogg Opus only from 18.4+ (src 17).
- AudioWorklet: secure-context requirement (src 15); `file://` behavior not verified.
- Firefox MP3: partial support in old versions (src 22).

## 7. Open questions for the owner (from worker)

Will the game run from `file://` on school machines, or only from GitHub Pages over HTTPS? What stem count/length budget fits the target machines? Pre-rendered stems (from Plan 32) or live synthesis? Is a click-to-start screen acceptable?

## 8. Verify later on actual school machines (unmeasured)

baseLatency/outputLatency; output sample rate (44.1 vs 48 kHz); decode time and memory for planned stems on low-RAM laptops and Chromebooks; autoplay under managed browser policies; background-tab behavior over 10+ minutes in each browser; iPad/Safari background and mute-switch behavior.
