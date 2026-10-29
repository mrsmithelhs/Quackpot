# Browser pass B2 — game-music evidence and Web Audio spec verification

Read `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/browser-pass-common.md` first; its rules bind. Return text only (no file writes).

Priority order (about 6–8 items; about 50 browser actions):

1. **Plut & Pasquier, "Music Matters: An empirical study on the effects of adaptive music on experienced and perceived player affect"** (IEEE Conference on Games; 2019 or 2020 — resolve which). Try the METACREATION project page, an author/university PDF, or arXiv/Semantic Scholar reader. Earlier (snippet-only, unverified) claim: adaptive music raised experienced tension more than linear music; inverse-mapped music also raised tension; about 30 participants. *Owner question:* N, game/system used, conditions, measures, results, limits.
2. **Klimmt, Possler, May, Auge, Wanjek & Wolf (2019), "Effects of soundtrack music on the video game experience,"** *Media Psychology* 22(5). Earlier (snippet-only) claim: 68 and 59 players; *Assassin's Creed: Black Flag* and *Alien: Isolation*; music raised enjoyment via positive emotion; shocking music intensified horror. Try the publisher page, PsycNet, or a legitimate open copy. If paywalled, record that and stop.
3. **W3C Web Audio API specification** (https://www.w3.org/TR/webaudio/ or webaudio-1.1). Verify three points, quoting the exact section number and a short paraphrase:
   a. The `AudioContextState` values and what `suspended`, `running`, `closed`, and `interrupted` mean; **what the spec says `resume()` does when the state is `interrupted`** (earlier worker text said it "moves the context to interrupted and rejects", which looks wrong).
   b. `AudioParam.exponentialRampToValueAtTime` behavior when the target value is 0 or signs differ; `cancelAndHoldAtTime`.
   c. `AudioBufferSourceNode` `loop`, `loopStart`, `loopEnd` semantics (what happens if loopEnd ≤ 0 or beyond duration).
   Use `find` / `get_page_text` on the right sections; the page is large, so search for the section rather than reading everything.
4. **MDN "AudioContext" and "BaseAudioContext/state"** pages and the **WHATWG HTML Standard section on the `loop` attribute / "reaches the end of the media resource"** — only to confirm the `state` values and the loop end-of-resource behavior text, with last-modified dates.
5. **Chris Wilson, "A Tale of Two Clocks – Scheduling Web Audio with Precision"** (web.dev / html5rocks archive). Confirm the lookahead-scheduling recommendation and any stated numbers (record as practitioner article, not official spec).
6. **Chrome developer docs, current autoplay policy for Web Audio** (developer.chrome.com). Confirm current wording on AudioContext starting `suspended` and `resume()` after a user gesture, with the page's date.
7. If time remains: **Apple/WebKit or MDN** text on Safari's `interrupted` state or `navigator.audioSession` (record whether any official page exists; do not use forums).

For items 1–2 give the full per-source report; for items 3–7 give the short verified facts with section numbers/dates, and state **CONFIRMED / PARTLY / CONTRADICTED / CANNOT TELL** against the earlier T4 claim quoted above.
