# Plan 33 progress report — recognizable music emotional transformation research

Date: 2026-10-28 (system clock).
- **Phase 1 Integrator (prior pass, `b1bd633` / `a22e750`):** Fresh Sonnet thread (`claude-sonnet-5-5`) with 6 Haiku worker tasks (`T1`–`T4`, `B1`–`B2`).
- **Phase 2 Integrator (this pass):** Fresh **Gemini 4 Argon (Medium)** thread under `reports/orchestration/plan-33-argon-integration-handoff.md`, with 4 bounded **Gemini Flash** worker tasks (`argon-f1`–`argon-f4`, max 2 concurrent, 0 nested).
- Packet status was **not** set or edited; `docs/development/plan-33-recognizable-music-emotional-transformation-research.md` remains `status: draft` for the orchestrator/owner. **Ready for orchestrator review: yes.**

---

## Overall summary (Argon Phase 2 Integration)

Integrated the committed Sonnet/Haiku synthesis (`b1bd633` / `a22e750`) with the six external deep-research reports (`deep-research/prompt-a/*`, `deep-research/prompt-b/*`), audited every decision-shaping citation against primary sources via four bounded Flash verification tasks (`argon-f1`–`argon-f4`) and direct Argon primary checks, separated Prompt A and Prompt B claim verification into `deep-research/prompt-a/verification.md` and `deep-research/prompt-b/verification.md`, and updated `recommendation.md`, `transformation-matrix.md`, `composition-brief.md`, `transition-contract.md`, `sources/index.md`, and `integration-status.md`.

### Key upgrades from Phase 1
1. **Harmony conservation upgraded from `[H]` to `[E-full]` / `[E-abs]`:** **Liu (2018, *JRME* 66:210, $N = 80$, `[E-full]`/`[E-abs]`)** and **Liu (2022, *JRME* 70:173, $N = 131$ China / $N = 61$ US, `[E-abs]`)** directly test whether adult listeners judge a familiar melody to remain the "same melody" when harmony is added, removed, or changed, and show that diatonic substitutions (`ii`, `iii`, `vi`) preserve identity significantly better than secondary/chromatic chords.
2. **Kuusi (2009) (`[E-full]`, $N = 46$, 19 familiar tunes selected, 14 analyzed) integrated in full:** Intact tune recognition was 95.9% / 93.6% / 86.5% vs. isochronous 500 ms melody-only 76.1% / 67.4% / 53.3% (removing rhythm costs **15.1 to 33.9 percentage points**), while standard chordal harmony added only **0.6 to 5.2 percentage points** over melody alone (`81.3% / 68.0% / 53.9%`).
3. **Refined lead-timbre vs. accompaniment-roughness guidance (`Dire-2A` vs. `Dire-2B`):** Cross-family instrument swaps (`piano ↔ sax` in Schellenberg & Habashi 2015, $N = 96$; `piano ↔ orchestra` in Poulin-Charronnat et al. 2004, $N = 64$) degrade recognition of newly learned melodies and can invert tension between musicians and non-musicians (Silvey 2011, $N = 40$, `[E-full]`), whereas within-family timbre shifts preserve recognition (Lim & Goh 2012, `[E-abs]`) and psychoacoustic **roughness (30–150 Hz modulation), inharmonicity, and spectral flatness** are top drivers of threat/tension (Farbood & Price 2017, $N = 24$, `[E-full]`; Pressnitzer et al. 2000, $N = 17$, `[E-full]`; Trevor et al. 2020, 2023, `[E-full]`). Recommendation splits Approach 2 into **Dire-2A (clean lead over rough accompaniment)** vs. **Dire-2B (subtle within-patch lead low-pass/detuning)** for a small owner-only paired-listening test alongside **Approach 3 (octave drop + minor inflection + pulse hesitation)**.
4. **Empirical acoustic separation of "Uneasy" vs. "Dire" (`[E-full]`):** **Trevor, Renner, & Frühholz (2023, *JASA* 153:384, $N = 99$, FEARMUS)** empirically distinguishes anxious/uneasy cues (sparse `2.176 events/s`, hollow extreme registers, darker spectrum, high loudness variability `0.561`) from terrifying/dire cues (dense `3.190 events/s`, rough 30–150 Hz modulation, higher RMS `0.194`). Drones (**Bostwick, Seror, & Neill 2018**, $N = 32$, `[E-full]`; **Friedman 2019**, `[E-abs]`) and deceptive/half cadences (**Sears et al. 2020**, $N = 40$; **Choi & Fujioka 2025**, $N = 38$; **Smit et al. 2020**, $N = 66$, `[E-full]`) now carry `[E-full]`/`[E-abs]` support for modal sadness/tension and suspended completion.
5. **Adaptive game music & gacha composer evidence (`[E-full]`, `[P]`):** Integrated **Heikkilä, Danso, & Luck (2026 *PLOS ONE*, `[E-full]`)** meta-analysis ($g = 0.34$ homogeneous effect vs. silence), **HOYO-MiX / Yu-Peng Chen & Zoe Cai (2020, `[P]`)** (*Genshin Impact* V0 bare solo-piano test and shared-melody day/dawn/dusk/night variants), **Darren Korb (2020–2026, `[P]`)** (*Hades* 8 stems, `every measure` markers, and the reactivity effectiveness bell curve), and **Masami Ueda / Keiichi Okabe (2017, `[P]`)** (*NieR: Automata* tempo/time-signature-locked S/M/L layers).
6. **External AI fabrications and inversions caught and excluded:** Caught and documented `Gemini-A`'s inversion of **Jimenez, Kuusi, & Ojala (2022)** (which tested chord memory, not melody recognition) and **Farbood (2012)** ("65% loudness failures" were stationary-pitch controls); `Gemini-B`'s fabricated physiological arousal in **Plut & Pasquier (2019)**, fabricated **salivary cortisol** in **Klimmt et al. (2019)**, fabricated `<30s / 1–2 min / >3–5 min` table in **Rogers & Weber (2019)**, and fabricated `0.5–2.0s` / `3.0–5.0s` crossfade numbers for *NieR* / *Genshin*; plus `ChatGPT-A`'s author misattribution (`Friedman` for `Bostwick, Seror, & Neill 2018`) and `Gemini-A`'s DOI typo on **Trevor et al. (2023)**.

No audio, music download, library installation, score, production edit, experiment execution, trigger schedule, source selection, packet status edit, or `git push` was performed.

---

## Files changed (all under `reports/development/plan-33-recognizable-music-emotional-transformation-research/`)

### Preserved raw external deep-research inputs (committed unchanged; exact initial SHA-256 hashes verified)
- `deep-research/prompt-a/chatgpt-research-a.md` (`33,698` bytes, `SHA-256: DE64A7A8CAAFFE2834671721BF5D3C9CFF128C9565CD207D2545DE56DF8F4D47`)
- `deep-research/prompt-a/claude-research-a.md` (`42,599` bytes, `SHA-256: D0A97BDEC2AE571BBA14B6264B8243134D9EAE9B12D5D9D2779FC75E814D9860`)
- `deep-research/prompt-a/gemini-research-a.md` (`59,497` bytes, `SHA-256: 083F5359469177799C49B2B18A481052C6B340E8B6F5EBD57884FE89A2102178`)
- `deep-research/prompt-b/chatgpt-research-b.md` (`35,259` bytes, `SHA-256: 1402532B791B2AAB370E8C8A2FD5DFCBB8C8D6A9537EC0B83DCA42AA70B090ED`)
- `deep-research/prompt-b/claude-research-b.md` (`40,175` bytes, `SHA-256: 9F4211B8667FDC3824EB412CB04A753347E5B7909A0B19011FB64C93BD7C426C`)
- `deep-research/prompt-b/gemini-research-b.md` (`110,081` bytes, `SHA-256: 01A170F16510B4F84ED7EDA48AE1C9A645354DAC6A1F62E09E13CC76F9E6B40F`)

### New verification, status, and Flash worker records
- `deep-research/prompt-a/verification.md`
- `deep-research/prompt-b/verification.md`
- `integration-status.md`
- `research/argon-f1/brief.md`, `research/argon-f1/sources.md`, `research/argon-f1/findings.md`
- `research/argon-f2/brief.md`, `research/argon-f2/sources.md`, `research/argon-f2/findings.md`
- `research/argon-f3/brief.md`, `research/argon-f3/sources.md`, `research/argon-f3/findings.md`
- `research/argon-f4/brief.md`, `research/argon-f4/sources.md`, `research/argon-f4/findings.md`

### Updated synthesis deliverables
- `recommendation.md`
- `transformation-matrix.md`
- `composition-brief.md`
- `transition-contract.md`
- `sources/index.md`
- `progress.md` (committed last)

### Preserved Phase 1 files (unchanged)
- `deep-research-prompts.md`, `search-plan.md`, `status-for-orchestration.md`, `research/common-brief.md`, `research/t1-identity/*`, `research/t2-tension/*`, `research/t3-game-practice/*`, `research/t4-browser/*`, `research/browser-pass-*`.

---

## Tasks, models and budget (exact)

### Phase 2 (Gemini Argon integration pass)

| Task | Scope | Requested Model / Role | Observed Conversation ID & Execution | Authority |
|---|---|---|---|---|
| Integrator | Plan 33 synthesis & primary verification | Gemini 4 Argon (Medium) | `d99d1d09-c81f-4803-bb6e-9e247381ac6b` | `reports/orchestration/plan-33-argon-integration-handoff.md` |
| `argon-f1` | Prompt A: Musical identity & reharmonization (`Kuusi 2009`, `Jimenez et al. 2022`, `Liu 2018/2022`, `Lim & Goh 2012`, `Silvey 2011`) | `Model: "flash"`, `TypeName: "argon-flash-researcher"` (`EnableSubagentTools: false`) | `d6e3b4a4-baeb-43bc-8402-d14c52a5ef0d` (Batch 1, concurrent with `argon-f2`) | Authorized 4 Flash tasks (max 2 concurrent) |
| `argon-f2` | Prompt A: Tension, drones, cadences & horror acoustics (`Trevor et al. 2023`, `Bostwick et al. 2018`, `Friedman 2019`, `Sears et al. 2020`, `Smit et al. 2020`, `Farbood & Price 2017`) | `Model: "flash"`, `TypeName: "argon-flash-researcher"` (`EnableSubagentTools: false`) | `73ed9aaa-0411-40d8-b3cc-f0990d88bb1b` (Batch 1, concurrent with `argon-f1`) | Authorized 4 Flash tasks (max 2 concurrent) |
| `argon-f3` | Prompt B: Adaptive game audio experiments (`Klimmt et al. 2019`, `Heikkilä et al. 2026`, `Plut & Pasquier 2019`, `Rogers & Weber 2019`, `Toprac & Abdel-Meguid 2010`) | `Model: "flash"`, `TypeName: "argon-flash-researcher"` (`EnableSubagentTools: false`) | `2a43b3eb-7b28-4414-91d2-3c8ee4adde0c` (Batch 2, concurrent with `argon-f4`) | Authorized 4 Flash tasks (max 2 concurrent) |
| `argon-f4` | Prompt B: Gacha & game composer practices (`HOYO-MiX 2020`, `Korb 2020–2026`, `Ueda/Okabe 2017`, `Peacock 2018`, `FMOD/Wwise`, `Tone.js/Howler.js`) | `Model: "flash"`, `TypeName: "argon-flash-researcher"` (`EnableSubagentTools: false`) | `c42c06f6-8d39-4886-b86a-0d0d2a7f0189` (Batch 2, concurrent with `argon-f3`) | Authorized 4 Flash tasks (max 2 concurrent) |

- **Concurrency & nesting:** Batch 1 (`argon-f1` + `argon-f2`) ran with 2 concurrent workers and completed before Batch 2 (`argon-f3` + `argon-f4`) was launched. Maximum concurrency: 2. Total Flash tasks: 4 of 4. Nested agents: 0 (`EnableSubagentTools: false`).
- **Observed model note:** Subagents were invoked via `invoke_subagent` with `Model: "flash"`; the subagent tool returns `conversationId` and transcript path rather than an internal model-version string, so `Model: "flash"` is recorded as requested/enforced by the harness tool parameter.

*(Phase 1 Sonnet/Haiku task table is preserved in git history at `a22e750` and summarized above.)*

---

## Commands run and results (Phase 2)

1. **Process inspection before Node preflight:**
   - Inspected existing `node` processes (`19` processes, `34.72 MB`–`135.93 MB` `WorkingSet64`) and verified SHA-256 hashes and byte sizes of all 6 raw deep-research files.
2. **Packet status preflight check:**
   - *Initial unguarded call (disclosed):* `node scripts/dev/plan-status.js check 33` ran in parallel with reading `reports/orchestration/plan-33-argon-integration-handoff.md` before seeing the guarded-launcher clause (`ExitCode: 0`, `RUNNABLE: plan-33 is ready to implement`).
   - *Guarded call via `bounded-node-run.ps1`:* After Windows PowerShell 5.1 failed on `.NET Framework` `ArgumentList` / `Kill(bool)`, ran under PowerShell 7:
     `pwsh -NoProfile -ExecutionPolicy Bypass -Command "& 'C:\AI\Quackpot\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1' -Executable node.exe -ArgumentVector @('scripts/dev/plan-status.js','check','plan-33')"`
     → `ExitCode: 0`, `TimedOut: false`, `MemoryExceeded: false`, `StopReason: null`, `ElapsedSeconds: 0.5398951`, `PeakSampledPrivateBytes: 3969024`, `StandardOutput: "RUNNABLE: plan-33 is ready to implement\n"`.
   - Zero further Node commands were run.
3. **Git and hash verification commands:**
   - PowerShell `Get-FileHash -Algorithm SHA256` on all 6 raw deep-research files (confirmed identical before and after all edits).
   - `git status --short` and explicit-path `git add` / `git commit` inside `reports/development/plan-33-recognizable-music-emotional-transformation-research/` only.

---

## Validation checks performed

- **Raw-file immutability:** Verified that all 6 files in `deep-research/prompt-a/` and `deep-research/prompt-b/` match their exact initial byte counts and SHA-256 hashes prior to committing.
- **Primary-source verification of external AI claims:** Cross-checked overlapping and single-provider claims across `ChatGPT-A/B`, `Claude-A/B`, and `Gemini-A/B` against open-access full texts, PubMed Central / JASA / PLOS ONE / Music Perception / JRME records, and official W3C / MDN / FMOD / Wwise / Tone.js / Howler.js documentation.
- **Foreign file isolation:** Verified via `git status --short` that untracked foreign files in `reports/development/plan-16-deterministic-review-checkpoints/` (`checkpoint-proof.mjs`, `proof-plan.md`) and all files outside `reports/development/plan-33-recognizable-music-emotional-transformation-research/` were untouched and excluded from staging.

---

## Problems encountered and resolved

1. **Initial unguarded `plan-status.js` invocation & PowerShell 5.1 vs. 7 for `bounded-node-run.ps1`:**
   - The first `node scripts/dev/plan-status.js check 33` call was issued in parallel with reading the handoff file; once the guarded-launcher requirement was read, `bounded-node-run.ps1` was invoked via `pwsh` (`PowerShell 7`) because Windows PowerShell 5.1 lacks `ProcessStartInfo.ArgumentList` and `Process.Kill(bool)`. Both calls exited cleanly (`0`) and no further Node commands were executed.
2. **External AI citation hallucinations and inversions:**
   - `Gemini-A` inverted Jimenez et al. (2022) and misstated Farbood (2012); `Gemini-B` fabricated cortisol measurements in Klimmt et al. (2019), physiological arousal in Plut & Pasquier (2019), a loop-length table in Rogers & Weber (2019), and crossfade durations in *NieR* / *Genshin*. All were caught by primary-source inspection and documented as `[Rejected]` in `deep-research/prompt-a/verification.md`, `deep-research/prompt-b/verification.md`, and `sources/index.md`.

---

## Remaining risks and follow-ups

- **Residual empirical gaps (`[H]`):** No controlled study directly tests replacing accompaniment with *dissonant/clashing* horror voicings under a newly composed, loop-repeated 4–8 bar hook over a 15–25 minute session, nor compares clean lead (`Dire-2A`) vs. subtle within-patch lead filtering/detuning (`Dire-2B`) vs. octave-dropped minor variation (`Approach 3`) side-by-side. The proposed owner-only paired-listening comparison (5 files × 19.2 s) resolves this before production integration.
- **Original-music provenance:** Remains gated by `docs/open-questions.md` and owner decision before any generated or composed audio ships in `src/`.

---

## Owner decisions needed (separated by stage)

### Stage A — Needed before Plan 32 (hook & variation sketching)
1. **Identity definition ("same tune"):** Should "the same tune" mean **melody/rhythm invariance with accompaniment transformation (Approach 2)**, or **verbatim audio until Dire, then melodic/octave/pulse variation (Approach 3)**?
2. **Approve the small owner-only paired-listening comparison?** Authorize generating 5 local 19.2-second candidate files (`Base`, `Uneasy-2`, `Dire-2A` clean lead, `Dire-2B` subtle within-patch lead filter/detune, `Dire-3` octave drop + `♭3`/`♭6` + pulse hesitation) for the owner alone to audition.
3. **Architecture & budget selection:** Confirm **Option A (3 whole-loop files: Base / Uneasy / Dire)** vs. **Option B (4–5 vertical stems)** and compressed format (**OGG Opus / Vorbis** recommended over raw WAV).
4. **Original-music provenance rule (`docs/open-questions.md`):** Confirm whether Plan 32 uses deterministic Web Audio synth parameter recipes (extending `src/audio/synth.mjs`), human-composed local stems, or another owner-approved local method.

### Stage B — Needed before runtime / story-state integration
5. **Story-state trigger mapping:** Choose how Base → Uneasy → Dire transitions are driven (explicit narrative act flags vs. monotonic debt/manipulation threshold counters vs. scene-plus-state hybrid) and whether progression is strictly one-way (`Math.max`).
6. **Transition timing & loop continuity:** Choose between **phrase-aligned bar/loop-boundary swap (`every measure` / loop wrap)** vs. **equal-power crossfade (`1.5–2.5 s`)** vs. **hybrid**, and whether the phase clock runs continuously across views or resets on scene entry.
7. **Terminal & lifecycle silence rules:** Confirm immediate hard stop (`< 50 ms`) on **Uninstall**, **silent Receipt / debrief by default**, and **immediate pause on `visibilitychange` (`document.hidden`)**.

---

## Consultation posture

**Advisor consultation not warranted — prose-only research report with no code, script or schema.** No extra consultant budget was assumed or spent.
