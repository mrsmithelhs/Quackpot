# Plan 33 research workers — common brief (read this fully, then your own `brief.md`)

You are a Haiku research worker for **Plan 33** of the Quackpot repository (`C:/AI/Quackpot`). You have a cold start: everything you need is in this file and your task's `brief.md`. Do not assume any other context.

## Owner objective (why this research exists)

Quackpot is a static, offline browser game used in a high-school/college course to help students critically examine gacha/microtransaction design. The game's fictional "gacha app" will have a **familiar, recognizable looping tune**. The owner wants that tune to **keep its identity but sound progressively more uneasy and then dire** as the *authored story* circumstances of the fictional character worsen (so the same tune can show the character's changing relationship to the same game). The tune will be **original and synthesized/locally rendered** in a later packet (Plan 32). Plan 33 (this research) only supplies source-grounded evidence and craft guidance for how to do that transformation, and for how to crossfade between apartment music and gacha music in a browser.

This is an *expressive design device*. It is **not** a diagnosis of any real player, not proof of dopamine/addiction effects, and not a way to detect or label a player's motives. Do not research or assert anything of that kind.

## Hard limits (violating any of these is a failure)

- **Web research only.** Use WebSearch / WebFetch / Read of the briefs. **No Bash/shell, no code, no audio/music/sample downloads, no audio generation, no library installs, no browser-control/owner browser tabs, no accounts, no payments, no datasets or student data.**
- **No nested agents.** Do not spawn or delegate to any other agent.
- **Write only inside your own task folder** (path given in your `brief.md`): exactly `sources.md` and `findings.md`. Do not touch any other file in the repository, any other task folder, or any shared synthesis/report file.
- **No fabrication.** Never invent a citation, quote, page number, date, DOI, URL or study result. Never claim you read a source you did not open. If you could only see an abstract, snippet, search result, or a publisher's landing page, say so in the access column. If something is paywalled or unreachable, record it as a gap rather than guessing.
- **Quotes:** at most one short excerpt (under ~15 words) per source, in quotation marks with attribution; otherwise paraphrase. Never reproduce song lyrics or long passages. Never transcribe copyrighted melodies/notation.
- **Do not copy or imitate copyrighted melodies** in your recommendations; extract transferable *design patterns* only.
- **No listening claims.** You cannot listen to anything. Do not describe how any recording "sounds" from your own hearing; attribute descriptions to the cited authors.
- Be proportionate: aim for **~8–16 distinct, strong sources** that you actually opened (fewer is fine if the topic is thin — say so). Prefer ~40 or fewer web calls. Stop when marginal returns drop.

## Source standards

Prefer, in this order: (1) peer-reviewed empirical papers / primary datasets descriptions and systematic reviews; (2) primary composer/developer accounts (talks, postmortems, interviews by the person themselves, official documentation); (3) well-regarded music-theory/pedagogy texts; (4) reputable secondary summaries only to find primary sources. Wikipedia, blog listicles and AI summaries are *leads*, not sources — follow them to the primary page. Prefer open-access full text; note when only the abstract was available.

Tag **every finding** with exactly one evidence type:

- **[E] Empirical** — a measured result from a study with participants or a corpus (state N / population / stimuli kind where available, and the limits: e.g., Western undergraduates, short excerpts, self-report).
- **[T] Theory/description** — music-theory or acoustics description of what a technique is/does (not proof of listener effect).
- **[P] Practitioner/craft** — composer/designer's stated method or intent (not measured audience response).
- **[H] Hypothesis/inference** — your own reasoned synthesis; label as such and say what would test it.

Never present [P] or [T] material as if it were [E]. Where evidence is mixed, culture/training-dependent, or context-dependent, say so plainly. Major/minor mode, tempo, loudness, dissonance etc. are **variables with context-dependent effects, not universal mood switches.**

## Delivery amendment (added by the integrator after T2 returned; applies to T3/T4 and any task that sees a refused write)

The harness may refuse subagent report-file writes. **Do not write files. Return the complete contents of `sources.md` and `findings.md` as text in your final reply**, under the headings `=== sources.md ===` and `=== findings.md ===`, following the formats below exactly. The integrator (Sonnet) will save them verbatim into your task folder and mark them as worker-authored. If you already wrote a file successfully before seeing this note, say so.

## Required output files (formats; delivered as text per the amendment above, or written to your task folder only if the write is permitted)

### `sources.md`
A table with one row per source actually opened:

| # | Title | Creator(s) | Venue/publisher | Date/year | URL | Access (full text / abstract only / snippet only / docs page) | Accessed (2026-10-28) | Evidence type(s) | Note on limits |

Then a **Claim-to-source map**: each numbered claim in `findings.md` → the source number(s) that support it. Then a **Gaps** section listing sources you wanted but could not open, and any claim you could only partially verify.

### `findings.md`
Concise (roughly 600–1100 words), structured as:
1. **Key findings** — numbered, each tagged [E]/[T]/[P]/[H], each with source number(s).
2. **Uncertainty and context limits** — what the evidence does *not* show; cultural, training, stimulus, and ecological-validity limits; conflicting results.
3. **Transferable recommendations for the owner's goal** — concrete, small, testable musical or technical decisions, each labelled with its evidence type and confidence (low/med/high). Include what a later small paired-listening comparison could test. No claims of clinical or addictive effect.
4. **Open questions** worth passing to the owner.

Finish by replying with a 5–8 line summary: files written, number of sources opened, top 3 findings, biggest gap. Do not paste the files into the reply.
