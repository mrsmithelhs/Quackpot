# Task T1 — Recognizable musical identity across arrangements

Read `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/common-brief.md` first; its limits and output format bind this task.

**Write only:** `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/t1-identity/sources.md` and `.../findings.md`.

## Question

What makes a tune remain **recognizably the same tune** when its arrangement changes? Which features carry identity (melodic contour, interval pattern, rhythm/metric profile, tempo, absolute pitch/key, instrumentation/timbre, harmony, repetition/familiarity), how robust is recognition when each is altered, and where are the limits (training, culture, familiarity, excerpt length)?

## Target decision it informs

The owner will have a short original synth hook in a gacha app. It will be arranged three ways (calm/enticing "base" → "uneasy" → "dire"). The owner needs to know **which anchors must stay fixed** for most listeners to say "that's the same tune", and **which parameters are safe to change**.

## Look for (leads only — verify by opening each; ignore any you cannot find)

- Melodic contour vs. exact-interval recognition, transposition recognition (e.g., work by W. Jay Dowling and colleagues).
- Recognition of familiar songs from very short excerpts and from timbre/"thin slices" (e.g., Krumhansl; Schellenberg et al.), and how much recognition depends on timbre vs. melody vs. rhythm.
- Absolute tempo/pitch memory for familiar songs (e.g., Levitin & Cook; Schellenberg & Habashi on tempo memory).
- Rhythm and meter as identity carriers (e.g., tunes recognized from rhythm alone).
- Cover-song / version identification research in music information retrieval and what invariants it exploits (tonal/chroma sequence, melody, structure vs. timbre/tempo/key changes).
- Familiarity/repetition and the role of context in recognizing novel vs. known melodies (e.g., Müllensiefen & Halpern).
- Leitmotif / theme-and-variation practice as *description* (clearly tag as [T]/[P], not [E]).
- Cultural/training limits (musicians vs. non-musicians; Western stimuli).

## Specific sub-questions for `findings.md`

1. Ranking of identity anchors by robustness (contour/rhythm/interval/timbre/tempo/key) — with evidence quality for each.
2. How short/looping/repeated exposure affects recognition of a **newly composed** (not previously known) hook — evidence vs. extrapolation. Be explicit that most studies use already-familiar songs.
3. What parameters can change with the *least* identity loss (e.g., key, register, tempo within a range, instrumentation, harmonization) vs. most.
4. Practical "identity checklist" the owner could apply in a paired listening comparison (e.g., tune hummability, same contour, same rhythm skeleton, same loop length) — label as [H] where not empirically established.
5. Limits: where cues interact (e.g., changing both mode and timbre and tempo at once).
