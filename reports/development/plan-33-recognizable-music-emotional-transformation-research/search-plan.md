# Plan 33 — Search plan (recorded before dispatch)

Date: 2026-10-28 (system clock). Integrator: fresh Sonnet thread (self-reported model: Sonnet 5.5, `claude-sonnet-5-5`). Authority: owner assignment 2026-10-28 via `reports/orchestration/plan-33-sonnet-research-handoff.md` and `docs/development/plan-33-…md`. This plan operates **inside the already approved budget**; it is recorded, not re-requested.

Packet preflight: `bounded-node-run.ps1 node.exe @('scripts/dev/plan-status.js','check','plan-33')` → `RUNNABLE: plan-33 is ready to implement` (exit 0, 0.55 s, sampled owned-tree private bytes 3,923,968, no stop reason). No other Node/build/test/server work is run.

## Approved budget (not exceeded)

| Item | Limit | Plan |
|---|---|---|
| Haiku researcher tasks | 4 total | t1 identity, t2 tension, t3 game practice, t4 browser |
| Concurrency | ≤ 2 | t1 + t2 first; t3 starts when one finishes; t4 starts when another slot frees |
| Nested agents | none | Forbidden in each brief |
| Write scope per worker | own `research/tN-*/` folder only, files `sources.md` + `findings.md` | Enforced by brief; verified by `git status` after each task |
| Central synthesis | Sonnet only | `recommendation.md`, `transformation-matrix.md`, `composition-brief.md`, `transition-contract.md`, `sources/index.md`, `progress.md` |
| Fifth task / reviewer / advisor / audio generation | none | Material gaps are surfaced, not filled by extra spending |

Worker agent type: `general-purpose` with `model: haiku`, because the `researcher` agent type has no Write tool. The brief restricts it to web research + writing its two files. This is a tooling workaround, not a scope widening; Bash and code are forbidden by the brief.

## Cold-start briefs

- Shared rules: `research/common-brief.md` (owner objective, hard limits, source standards, evidence tags E/T/P/H, output format).
- Task briefs: `research/t1-identity/brief.md`, `research/t2-tension/brief.md`, `research/t3-game-practice/brief.md`, `research/t4-browser/brief.md`.

## Source standard

Prefer primary empirical papers and systematic reviews, primary composer/developer accounts, and official specifications/documentation (W3C, WHATWG, MDN as official reference, Chrome/WebKit/Mozilla docs). Secondary pages are leads only. Every finding is tagged **[E]** empirical, **[T]** theory/description, **[P]** practitioner/craft, or **[H]** hypothesis. Access level (full text vs abstract vs snippet) is recorded per source. Aim: ~8–16 distinct strong sources per task, no quota padding.

## Question per task

1. **t1 identity** — which anchors (contour, rhythm, interval, tempo, key, timbre, harmony) carry "same tune" across arrangements; how robust; limits for a *newly composed* hook (most studies use already-familiar tunes).
2. **t2 tension** — harmony/voicing, bass/drone, register, density, articulation/timbre, rhythm/meter, unresolved phrases, selective dissonance; separating theory, practice and empirical results; major/minor as one variable.
3. **t3 game practice** — composer/developer accounts of recognizable themes changing with state; patterns (variants, stems, transitions); stated intent vs measured response; feasible-for-small-game filter.
4. **t4 browser** — Web Audio/HTMLMediaElement loop, scheduling, crossfade, autoplay/user activation, interrupted/hidden contexts, master volume/headroom, decode memory, static/offline limits; alternatives, not dependencies.

## Integration plan (after all four return)

1. Verify each worker wrote only its own two files (`git status`), and spot-check sources (open a sample of the claimed primary sources where my own fetch tools allow) — worker reports are claims, not proof.
2. Reconcile conflicts and mark evidence strength; keep [E]/[P]/[T]/[H] labels through synthesis.
3. Write the five synthesis deliverables plus `progress.md`; no audio, score, trigger schedule, source/library adoption or production edit.
4. Commit explicit owned paths only; progress last; never push; no packet status.

## Amendments recorded during the run (2026-10-28)

1. **Delivery change after T2.** The harness refused subagent writes of report files (T1 and T2 each wrote `sources.md` but were refused `findings.md`). For T3 and T4 the shared brief was amended so workers return both files as text; the integrator saved them. T1/T2 `findings.md` were likewise saved by the integrator from returned text. Each saved file carries a provenance note.
2. **Owner-authorized browser pass.** After T1–T4 and a question about full-text reading, the owner replied in chat "Yes, after T3/T4" to a proposal for one or two additional Haiku tasks (6–8 named sources each) reading specific sources through the harness browser pane. This extends the original four-task budget by two tasks (B1, B2), run one at a time because the pane is shared, with write-nothing/download-nothing rules (`research/browser-pass-common.md`). Total Haiku tasks: 6 (4 original + 2 authorized).
3. **Downloads.** Two browser-pane navigations to PDF URLs triggered browser downloads despite the "stop on download" rule (workers stopped and reported). A downloaded PDF (`paper_106.pdf`, the Plut & Pasquier paper) was read by the integrator from an isolated scratch copy; the file is not committed.

## Stop conditions

Return to owner/orchestration (instead of spending beyond budget) if: a worker cannot reach key sources and a load-bearing claim would rest on a snippet; evidence conflicts on a decision-shaping point; a worker writes outside its folder; the preflight or `git status` shows overlap with another thread's files.
