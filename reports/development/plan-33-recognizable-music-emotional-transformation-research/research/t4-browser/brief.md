# Task T4 — Official browser-audio constraints for loops, synthesis, layering and crossfades

Read `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/common-brief.md` first; its limits and output format bind this task.

**Write only:** `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/t4-browser/sources.md` and `.../findings.md`.

## Question

For a **static, offline, no-network-at-runtime browser game** (Vite build, local bundled assets, GitHub Pages hosting; vanilla JS ES modules; students on typical school desktop browsers — Chrome, Edge, Firefox, Safari), what do **current official documentation and specifications** say about the constraints and options for:

1. Playing looping music from local files vs. rendering/synthesizing it in-browser (Web Audio `AudioBufferSourceNode` with `loop/loopStart/loopEnd`; `HTMLAudioElement` looping; `MediaElementAudioSourceNode`; `OscillatorNode`/scheduled synthesis; `AudioWorklet`; `OfflineAudioContext` pre-render).
2. **Gapless looping** accuracy and codec concerns (MP3 encoder padding vs. Ogg/Opus/AAC/WAV; format support across browsers) — as documented, not folklore.
3. **Layering/stems** (several synchronized sources) — scheduling on the audio clock (`AudioContext.currentTime`, `start(when)`), look-ahead scheduling vs. `setTimeout`/`setInterval` timer throttling in background tabs.
4. **Crossfades** — `GainNode` + `AudioParam` automation (`linearRampToValueAtTime`, `exponentialRampToValueAtTime`, `setTargetAtTime`, `setValueCurveAtTime`, `cancelScheduledValues`, `cancelAndHoldAtTime`), equal-power vs. linear crossfade, avoiding clicks (never ramp to exactly 0 with exponential), cancelling or superseding an in-progress fade on interruption.
5. **User activation / autoplay policy** — Chrome, Safari/WebKit, Firefox autoplay rules; `AudioContext` starting in `suspended` state; `resume()`; what counts as a user gesture; **interrupted** state (Safari/iOS) and `statechange` events; tab hidden/visible behavior (Page Visibility API), and what happens to audio when a tab is backgrounded.
6. **Master volume / mute / headroom** — a single master `GainNode`, optional `DynamicsCompressorNode` for safety, summing multiple sources and clipping, per-bus gains (music bus vs. effects bus), perceptual (logarithmic) volume mapping, honoring a player mute control.
7. **Decode, memory and performance** — `decodeAudioData` produces uncompressed PCM (memory estimate per minute of stereo audio at 44.1/48 kHz float32), streaming via media element vs. fully decoded buffers, CPU cost of many simultaneous nodes/stems, `baseLatency`/`outputLatency`, sample-rate handling.
8. **Static/offline constraints** — fetching bundled local audio with the same origin only; no CDN; behavior with `file://` vs. GitHub Pages (note if docs say anything); caching considerations only if official docs address them.
9. Optional: `navigator.audioSession` / Media Session interactions if officially documented and relevant (keep short).

## Source standards specific to this task

- **Only official/primary sources:** W3C Web Audio API specification (current Working Draft/Recommendation text), WHATWG HTML Standard (media elements), MDN Web Docs (cite as secondary-official reference; note page "last modified" date if visible), Chrome developer documentation (developer.chrome.com / web.dev), WebKit blog/documentation (webkit.org), Mozilla documentation, caniuse for support tables (as a compatibility reference, say so). Avoid forum posts and blogs except to find the official page.
- Record the **version/date** of each spec or doc page you read (e.g., "W3C Working Draft, <date>"; MDN "Last modified <date>") so the owner can see how current it is.
- Where official docs are silent on a numeric limit (e.g., "how many simultaneous nodes is safe"), **say the docs are silent**; do not invent a number. You may give arithmetic you can show (e.g., PCM bytes = seconds × sampleRate × channels × 4) and label it as [T] arithmetic.

## `findings.md` extra requirements

1. **Implementation considerations** (not production code, not a chosen dependency): for each topic above, a short bullet with the official constraint, the source number, and the practical consequence for a looping music + crossfade design.
2. **A few alternatives (2–3) for how to play/loop/layer** — e.g., (a) pre-rendered stems decoded into `AudioBuffer`s and scheduled on the audio clock; (b) media-element streamed tracks with gain-node crossfade; (c) live synthesis from an event list — each with pros/cons strictly from the sources. Do not recommend a third-party library.
3. **A single-audio-owner crossfade checklist** derived from the docs: state to check, automation to cancel before starting a new fade, behavior on `suspended`/`interrupted`, on hidden tab, and on user mute.
4. A table-like list of **known browser differences/risks** to test later (Safari/iOS especially) — each tied to an official source.
5. Items the owner should verify later on the actual target school machines (flag as unmeasured).
