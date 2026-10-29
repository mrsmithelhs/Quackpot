# Task T3 — Primary composer/developer accounts of adaptive game music

Read `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/common-brief.md` first; its limits and output format bind this task.

**Write only:** `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/t3-game-practice/sources.md` and `.../findings.md`.

## Question

How have game composers and developers built music that **keeps a recognizable theme while changing character with game state** (e.g., calm → tense → desperate)? Extract **transferable design patterns** — related variants of one theme, vertical layers/stems, horizontal re-sequencing, transition rules, leitmotif transformation, silence — and separate the **composer's stated intent** [P] from **measured audience response** [E].

## Constraints specific to this task

- **Do not reproduce or imitate copyrighted melodies.** Name games/tracks as examples of *techniques* only; never describe a melody note-by-note.
- Prefer primary accounts: the composer/developer speaking (GDC/AES/conference talks with transcripts or slides, official dev blogs/postmortems, first-person interviews, official middleware documentation of design patterns). If you can only reach a secondary summary of a talk, label it clearly as secondary.
- Do not listen to or download any music.
- Gacha-specific or mobile-game examples are welcome but not required.

## Look for (leads only — verify by opening each; ignore any you cannot find)

- Peer-reviewed empirical work on adaptive/interactive game music and measured effects on experience/affect (e.g., Plut & Pasquier 2020 "Music matters"; Klimmt et al. 2019 on soundtrack effects) — these are the only [E] sources to expect; read carefully for scope and limits.
- Accounts of theme-and-variation or "same melody, different arrangement" across game states: e.g., NieR: Automata (Keiichi Okabe interviews on vocal/instrumental/“ruined” versions), Undertale (Toby Fox leitmotif reuse), Celeste, Hades (Darren Korb), Journey (Austin Wintory), Dead Space/horror scoring (Jason Graves), Halo (Marty O'Donnell), Silent Hill (Akira Yamaoka), BioShock Infinite arrangement of a period song, Super Mario Bros. tempo-up "hurry" cue, Red Dead Redemption 2 dynamic score, DOOM (2016) adaptive structure.
- Adaptive-music design vocabulary and patterns: horizontal re-sequencing vs. vertical layering (Winifred Phillips; Michael Sweet; Karen Collins "Game Sound"), middleware documentation (FMOD, Wwise) for transition rules and stems — use only for *design patterns*, since T4 covers web-platform constraints.
- Accounts that discuss pitfalls: repetition/fatigue, loop length, transitions being noticed, "music that only reacts to state, not to the player", mix headroom, player volume controls.

## `findings.md` extra requirements

1. List **design patterns** (name, how it keeps identity, how it changes mood, risks), each with source numbers and an explicit [P]/[E] tag.
2. A short **"what is actually measured vs. what is only claimed"** section.
3. Notes on **repetition/fatigue** and **transition noticeability** from practice.
4. Patterns that are **cheap enough for a small static browser game** (few stems/variants) vs. patterns needing a full middleware stack.
5. Any account relevant to music reflecting **character/story state** (diegetic or narrative-state-driven variants) rather than moment-to-moment player skill.
