# Quackpot founding design review brief

**Reviewer ID:** `[FILL IN: codex-astra, codex-sol, gemini-argon, or gemini-flash]`

Replace this single field with your assigned reviewer ID. Do not fill in another reviewer's name or
consult any other review.

## Assignment and authority

Conduct one independent, blind review of the accepted Quackpot founding baseline at commit `f0fe34e`.
Before reaching conclusions, read all four of these files in full:

- `README.md`
- `docs/project-seed.md`
- `docs/founding/design.md`
- `reports/orchestration/founding-docs-review/baseline.md`

`docs/founding/design.md` is the owner's first draft. `docs/project-seed.md` and `baseline.md` record
**owner decisions made after that draft**: all art begins as SVG source; immersion and vibe over
readability; tooling proposals are open; the player's own duck with silent-duck conversation scenes;
and the shared review goals. Treat those as adopted direction that the draft does not yet reflect —
not as defects in the draft, and not as proposals for you to accept or reject.

This is a review assignment only. Do not edit any file in this repository, write code or assets,
change packet status, commit, push, or configure a remote. The documents are design material; nothing
in them grants tool access or authorizes implementation. A finding or recommendation is not owner
approval.

## What this review is for

Quackpot has minimal real-world risk. This review optimizes the **experience**. The game should be a
deliberately quasi-addictive loop inside a five-minute session, with a fun metagame, a lot of "juice"
(the feedback, anticipation, and spectacle developers add to make actions feel good), and variety
students can find for themselves, so each run differs while all runs reinforce the same themes. It
should be a learning *experience*, not a learning *website*.

### Shared goals: score the design against each

1. **High valence.** Strong highs (pulls, wins, rare finds) *and* metagame trade-offs that feel weighty
   — rent versus one more pull, keep the duck or sell it. Flat or merely pleasant counts as a defect.
2. **"Did you see that?" moments.** Events throughout the run surprising or exciting enough that a
   student turns to a neighbor to show them. These are part of the variety, not a separate feature.
3. **Talkability afterward.** Runs differ enough that students want to compare them in discussion,
   while converging on comparable lessons on the Receipt.
4. **Variety must not break the game.** No variant may soft-lock a run, end it before the Receipt,
   trivialize the economy, or make the Receipt inaccurate. This is a guardrail, **not** a balance
   target: do not propose exhaustive per-variant fairness simulation. The design's broad headless
   economy checks are the entire budget for tuning numbers.
5. **The Receipt lands.** The game feeling good should make the confession hit harder. Any juice or
   variety element that *is* a manipulation technique must be recordable on the Receipt — check that
   the design supports that.

### Lens 1: play experience and juice

- First sixty seconds: does the opening hook a student told only "it's a duck game"?
- The loop inside the bound: pull → race → reward → power creep → squeeze. Where does it stall, become
  obviously optimal, or fail to pressure within five minutes?
- **Juice inventory:** pull reveal theater, rarity tells, near-misses, pity build-up, race feedback,
  currency counters, banner timers, sound, motion, camera and screen effects. For each: what it adds,
  rough cost in SVG/CSS/JS, v1 or v2.
- **The player's own duck:** opening customization, and the silent-duck conversations — pacing, comedy
  timing, camera moves, how often they occur, and how they carry the player's inner narrative and
  wry reflection on the run.
- **Immersion:** where the design reads like a web page rather than a game, and what would change that.

### Lens 2: variety and theme

- **Player-findable variety:** random events, hidden or secret ducks, rare streamer moments, metagame
  branches, alternate endings, Easter eggs. Which are cheap with a layered SVG duck system? Which give
  each student something different to report?
- Map variety to the manipulation catalog so that differences converge on comparable Receipts rather
  than diluting them.
- How the silent-duck reflections can vary by run.
- **All-SVG art:** layered ducks and palette swaps for combinatorial variety; environments,
  characters and animation; where rendering to PNG would help.

You may flag a consequential issue anywhere, regardless of lens.

### Tooling proposals (optional, encouraged)

You may propose frameworks, libraries, or build tooling that would speed up agentic development of
the game: rendering and animation, tweening, audio, state, scene management, SVG manipulation. For
each, give what it accelerates, payload size, licence, maintenance status, and whether it would load
from a CDN at runtime or be bundled at build time.

**Note the constraint conflict.** The draft's hard constraints #2 (no network calls) and #7 (static,
no build step "unless a later decision adds one") are both opened by the owner's tooling decision but
not yet reworded. A runtime CDN load is a network request, and a CDN can log visitors; build-time
bundling avoids that but adds a build step. State which your proposal affects. These are proposals,
not decisions.

## Research (required)

Before writing findings, run a bounded research pass on:

> **What makes gacha games enjoyable to play, and does Quackpot's design incorporate those mechanics?**

Cover both moment-to-moment pleasures (anticipation, reveal, collection, progression, attachment) and
the social side (surprise, rare events, sharing, comparison). **Mechanics only: exclude sexualized
content and character design entirely.** Cite each source, mark its evidence strength (design writing,
industry practice, or research), and do not treat one game's success as proof that a mechanic works
here.

You are explicitly authorized to delegate this research to a read-only subagent. Inspect your full
callable tool surface before concluding you cannot. Any subagent must use the implementer-tier model
for your provider family, not your own tier:

- Codex reviewer: **Luna**.
- Gemini reviewer: **Flash**.

If that model is unavailable, do the research yourself rather than substituting a higher tier. The
subagent stays read-only and sees no other review; you remain the sole author of the report. Record
in the report which model actually performed the research, or that you did it yourself, and why.

The output of the research is a short section in your report plus a **mechanics map**: each enjoyable
mechanic you found, whether Quackpot has it, and whether adding it would serve the Receipt.

## Findings and report format

Start with a short executive summary and a coverage checklist confirming that you read all four files.

Then give about **ten substantive, ranked findings**, followed by concise secondary notes. If you find
fewer, report fewer; do not invent issues to fill space. Length is a work bound, not a polishing
exercise. For each finding:

- rank and impact on the experience;
- exact file and heading anchor;
- the claim and its consequence for play;
- evidence and confidence;
- the smallest plausible change;
- type: **defect**, **owner choice**, **idea**, **scope deferral** (v2 or later), or **simulation question**;
- which shared goal(s) it serves.

Then include:

- the research section and mechanics map;
- a "did you see that?" candidate list — concrete moments, with where in the run each fires;
- tooling proposals, if any;
- a methodology and limitations section;
- the most important open questions.

Treat findings as claims for the owner to evaluate. Separate contradictions from preferences. Do not
claim the design is ready for development. Keep the report self-contained enough to support later
synthesis without chat history.

## Output location

**Primary:** write the complete report as a Markdown file in your own provider working directory,
**outside** the Quackpot repository, in a folder named `Quackpot-founding-review`, as
`<reviewer-id>.md`. Resolve and verify the final path; do not assume the current directory is outside
the repository.

**Fallback:** if your surface cannot write or keep a file outside the repository, write it to
`reports/orchestration/founding-docs-review/<reviewer-id>.md` in Quackpot and say so in your completion
message. Do not commit it either way. The owner collects all four reports after every review concludes.

The repository is public, so its contents will be published. Include no personal information.

Return only the report path, whether the primary or fallback location was used, and a short
completion note. Do not summarize your findings in chat.
