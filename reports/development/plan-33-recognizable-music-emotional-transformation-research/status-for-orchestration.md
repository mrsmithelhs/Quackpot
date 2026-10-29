# Plan 33 — status for QP Orchestration (2026-10-28, after delivery)

Author: Plan 33 Sonnet integrator (QP Impl 33). The owner is low on Claude usage this week and expects to hand deep-research integration to another model provider, so this note is written for a cold reader. Packet status was **not** set by me; Plan 33 remains whatever orchestration has it as.

## State in one paragraph

The Plan 33 research report is **delivered and committed** (`b1bd633` synthesis and deliverables; `a22e750` progress report; nothing pushed). Since then the owner ran the two external deep-research prompts (A: identity vs arrangement/tension; B: adaptive game music and theme transformation) on three providers each and dropped the six raw outputs into `deep-research/prompt-a/` and `deep-research/prompt-b/`. **They are untracked, unedited, unverified, and not yet integrated.** I checked only that the files exist and are readable; I did not read them in depth or verify any citation.

## Delivered (committed, all under `reports/development/plan-33-recognizable-music-emotional-transformation-research/`)

`recommendation.md` (start here) · `transformation-matrix.md` · `composition-brief.md` (for Plan 32) · `transition-contract.md` · `sources/index.md` · `deep-research-prompts.md` · `search-plan.md` · `progress.md` · `research/` (T1–T4 and browser passes B1–B2: briefs, sources, findings, results).

Headline recommendation: hold the hook's pitches and rhythm, tempo, key, lead timbre, loop length and loudness constant across base/uneasy/dire; put the change in the accompaniment (harmony/voicing, bass register or drone, roughness, a withheld cadence). Confidence is mixed and stated per claim. Nothing was composed, rendered, adopted or scheduled.

## Deep-research files received (untracked; raw)

| File | Words |
|---|---|
| `deep-research/prompt-a/chatgpt-research-a.md` | ~4,200 |
| `deep-research/prompt-a/claude-research-a.md` | ~5,500 |
| `deep-research/prompt-a/gemini-research-a.md` | ~4,900 |
| `deep-research/prompt-b/chatgpt-research-b.md` | ~4,300 |
| `deep-research/prompt-b/claude-research-b.md` | ~5,400 |
| `deep-research/prompt-b/gemini-research-b.md` | ~5,800 (110 KB on disk, largest) |

From the opening lines only (not verified): all three A reports lead with the same direction as my report (melody contour/intervals carry identity; harmonic and timbral changes cost little to identity). The B reports open with "narrow measured evidence" (ChatGPT, Claude), but Gemini's opening says adaptive audio "significantly modulates subjective tension and physiological arousal", which may overstate what I could verify (the one adaptive-music study I read in full, Plut & Pasquier 2019, N=30, used self-report only). Treat that as a claim to check, not a finding.

## New facts since the committed report (not yet folded into it)

- **Kuusi 2009 (ESCOM), full text read** from a PDF that finished downloading outside the repo: 46 listeners, 19 familiar tunes. Melody with harmony vs melody alone: professionals 81.3% vs 76.1%, amateurs 68.0% vs 67.4%, non-musicians 53.9% vs 53.3%; full tune 96%/94%/87% vs melody alone 76%/67%/53% (my arithmetic: removing rhythm cost 20–33 points, supporting "keep the rhythm fixed"). It does **not** test replacing the harmony under a fixed melody; every harmony version used the correct chords. The sources index and `recommendation.md` still list Kuusi as abstract-only.
- **Plut & Pasquier 2019** was read in full (already in the committed report).

## Not done

1. Reading or verifying the six deep-research reports; deciding whether any **upgrades the evidence on the two core gaps** (replacing accompaniment under a fixed melody; drone, sub-bass, detuning, withheld cadence) or on gacha/mobile composer accounts.
2. Folding Kuusi into `sources/index.md` and `recommendation.md`.
3. Any paired-listening comparison, Plan 32 hook composition, or story-state schedule (all owner/orchestration-gated).

## Instructions for whoever integrates next

- Do **not** edit the raw files. Put notes in `deep-research/prompt-a/verification.md` and `prompt-b/verification.md`.
- Every provider citation is an unverified lead until the source is opened. Weight claims by depth read; keep the E-full / E-abs / P / T / H labels used in `recommendation.md`.
- Highest-value checks: (a) any study where melody is fixed and harmonization or arrangement varies, with tune-identity or "same tune" judgments; (b) any empirical test of drone, sub-bass, detuning or withheld cadence; (c) any measured adaptive-game-music study beyond Plut & Pasquier and its N; (d) any gacha/mobile composer first-person account. Compare the three providers' overlap: a source named by several independently is more likely to exist, but still must be opened.
- Haiku budget for this packet is **spent (6 of 6, two beyond the original four by owner authorization)**. More workers need a new owner authorization.
- **PDFs stay outside the repository** (public repo; owner decision 2026-10-28). `Read` cannot render PDF pages on this machine (no `pdftoppm`); `pdftotext` works on a scratch copy. Two paper PDFs (`paper_106.pdf`, `urn_nbn_fi_jyu-2009411339.pdf`) and a leftover `.tmp` sit in the owner's Downloads folder.
- Rules unchanged: no audio, downloads of music, libraries, production edits, status edits or push; commit explicit paths only; commit the progress/status note last.

## Owner decisions still pending (from `recommendation.md` and `transition-contract.md`)

Define "same tune" (melody vs specific sound) · accompaniment-first vs also testing Approach 3 · approve a paired-listening comparison (owner as sole listener, no student data) · abrupt vs gradual state steps · whether to adopt the deep-research results into the recommendation · story-state source (flag / counters / scene map), fade lengths, hidden-tab policy, Uninstall and Receipt audio behavior, loop-continuity choice.
