# Plan 07: minimal export and local analysis proposal

**Investigation, 2026-10-31. Not an approved schema or implementation.** The teacher wants to see completion, replay and variation in exposure; a student chooses to download and submit. The smallest useful starting point is one compact, event-derived summary per submitted Receipt, with no typed name, seed, persistent device identifier, exact timestamps, free response or raw log. The teacher associates a submission through the assignment process outside the game. Compare separately submitted runs as a student-provided set; do not claim a count of all runs or infer that files belong to the same person. This limits automatic replay detection: owner choice is needed if that tradeoff is unacceptable.

## What the references actually do

- BrowserBattlegorithms is available at `C:/AI/BrowserBattlegorithms` (the requested spelling differed). Its documented flow is in-memory events → IndexedDB → student-entered name and manual JSON download → local `admin.html` multi-file import. Its V2 file includes per-level ledger, boundary program XML, version hashes, events, snapshots and completeness flags. Its teacher view shows progress, revisits, outcomes and qualified review flags; SHA-256 is not a signature or proof of identity. See `docs/subsystems/usage-and-admin.md:34-63,157-181` in that repository and `src/admin/adminApp.js:39`. Seven-day/20-session trimming is for ephemeral history, not its durable ledger. Its richer program evidence serves different questions and has a different privacy cost.
- BooleanPractice documents a required typed name, optional class code, manual JSON download and assignment submission; a local `admin.html` reads multiple files in the browser and can download a class CSV. Its v1 includes identifiers, session/event records, per-sheet activity and integrity metadata. Its flags are review prompts, not proof; hashes can be recomputed. See `C:/AI/BooleanPractice/docs/usage-files.md:11-53,57-112,132-154`. Its documentation calls files signed in the overview, but its stated integrity limitation does not establish a signature. Neither project authorizes importing its identifiers, surveillance, retention or flags here.
- Quackpot owner triage T17 expressly authorizes the rough workflow and manual submission, not a schema (`reports/orchestration/founding-docs-review/owner-triage.md:44,110-112`). The founding design requires offline gameplay/local analysis and separates displayed evidence, actions and impact questions (`docs/founding/design.md:18-19,67,201-220,303-310`). Current `src/core/event-log.mjs` distinguishes chain validity from terminal/Receipt completeness; `src/core/receipt.mjs` projects from events, and separates committed draws from actually revealed outcomes. These are current examples, not a frozen export contract or proof of every production path.

## Candidate compact summary: teacher questions and costs

All names below are illustrative concepts, not approved keys. Evidence must come from a validated, version-appropriate Receipt projection; unavailable is unknown, never silently zero or false. All rows and aggregates are based only on files actually selected for import.

| Teacher question | Candidate datum and source | Needed? Privacy / limitation |
|---|---|---|
| Can this file be interpreted? | Format/version and game/content build, from exporter metadata | Yes; low direct identification but build can narrow cohort. Separately version schema and meaning/catalog. |
| Did this submitted run reach a Receipt? | Evidence status and terminal route from terminal + Receipt events | Yes; a completed Receipt is not proof of learning or an assignment grade. Missing/truncated evidence is unknown; immediate Uninstall is a legitimate ending. |
| Which techniques were displayed? | Closed, versioned technique IDs with recorded shown evidence, projected from cue/offer/display events | Yes for comparison; a technique missing from an incomplete or unsupported record is unknown, not unexposed. Exposure is not attention or influence. |
| What did the player do? | Only a small set of counts or choices linked to the question, derived from recorded action/outcome events | Candidate, owner must choose each; behavioral profiling rises with detail. Do not imply a displayed cue caused an action. Exact categories depend on Receipt integration. |
| Did a student replay and see variety? | Two or more separately submitted summaries, explicitly grouped by student/teacher outside the file | Supports comparison of submitted runs only; no reliable total, cross-device link, identity or replay intent. No automatic grouping by matching outcomes. |
| Did it affect them? | A question for discussion, not a recorded answer | No answer exported by default; actual reflection and free text can be sensitive. A separate voluntary classroom activity is an owner/teacher choice. |

**Name and replay options.** Duck name: omit (recommended); opt-in still risks personal information and invites accidental sharing; include by default adds no necessary teacher evidence. Student identity: omit from payload and let the assignment store identify submitter; typed name or class code duplicates personal data and creates spelling/shared-device ambiguity. A random per-run ID could help recognize repeated downloads but remains a linkable pseudonym and may be copied; opt-in is confusing. Prefer no identifier initially and flag *possible identical content* only, with an explicit teacher decision to exclude a copy. A persistent browser/install ID or replay counter links activity across runs and fails across cleared/shared storage and devices; seed is neither identity nor proof of replay, can be repeated, and may enable linkage/reconstruction. Omit all by default. If reliable run grouping becomes a real requirement, ask owner to specify consent, retention, threat model and failure cases first.

## Richer alternative and uncertainty

A second candidate adds a bounded allowlist of ordered, typed display and action records, with local sequence numbers and only fields needed for a specific teacher question. It could answer whether a particular action followed a displayed cue, or explain a summary. It increases behavioral detail and linkability; sequence is not causation, attention or intent. No raw event log, clocks, duck names, arbitrary strings, exact odds history, seed or user-entered reflection by default. Each event/field requires a documented question, source, privacy cost and approved retention before adoption. The current committed-versus-revealed distinction must survive any detail view. Do not export log hashes as authenticity evidence.

Stable concepts are manual submission, local import, explicit format/meaning version, provenance/completeness caveats, terminal/Receipt evidence, distinct displayed/action/question registers, and comparison of submitted runs. Exact event names, technique taxonomy, completeness semantics, terminal route vocabulary, numerical summaries, action-time/day/session/replay rules and mappings to current log entries remain pending Plan37 and integrated Receipt contracts. In particular elapsed time, session count and phase costs are not justified proxies for engagement. Even the examples below use invented provisional labels, not adopted vocabularies.

## Proposed handling contract

1. Student sees a plain-language preview of precisely what will be included and manually downloads; submission to an external assignment store is a separate student action. No automatic transmission. Local analyzer uses only explicitly selected files, with no network, account, external resources, telemetry, background sync or server upload. Keep analysis in memory by default; a future saved/class export needs separate approval and clear local deletion guidance. Filename must not embed a name or device ID.
2. Validate file size and nesting limits, JSON structure, recognized format/version, closed enum types/ranges, evidence status and internal consistency before use. The implementation packet must set concrete limits. Reject malformed/unsupported versions per file with a useful explanation; continue with other files. Never execute imported content or insert it as HTML. Unexpected fields are not displayed or silently interpreted; choose a documented version policy before implementation. No arbitrary strings accepted into the proposed summary except bounded known metadata.
3. Do not upgrade missing fields to zero, repair unknown versions by guessing, or mix incompatible catalog meanings. Display unknown/incomplete, version and exclusion reasons; keep incompatible cohorts separate. Aggregate denominator is eligible imported records, display exclusions and unknowns beside every count. No population or learning conclusion follows from submitted files alone.
4. An exact byte or canonical-content match can be flagged as **possible duplicate**, not automatically removed: two distinct runs can yield identical compact summaries. A repeated named run ID, if later approved, also is not proof; conflicting content for one ID requires explicit review. Preserve the original selection and allow the teacher to include/exclude records with visible counts. Never match people based on behavioral similarity.
5. Check structural consistency and supported producer/version claims. A checksum, if later chosen, can detect accidental corruption only; anyone can edit and recompute it. No local file proves identity, unmodified gameplay, student comprehension or authorship. Distinguish invalid, incomplete, unsupported and merely unverified. Avoid misconduct scoring and misleading labels such as authenticated or tampered.

## Rival hypotheses and decision test

- **H1:** Compact summaries suffice for the teacher to compare two submitted runs and discuss different displayed techniques. Falsify if the teacher cannot answer a concrete question without knowing the ordering of a display and an action, after seeing clear unknowns.
- **H2:** A bounded event-derived detail view is needed. Falsify if a teacher completes that same comparison and accurately distinguishes display, action and impact using only the summary, and extra chronology does not change the instructional discussion.
- **Discriminating task:** Give a teacher only the labelled synthetic files below, ask what each run displayed, whether a run reached a Receipt, what the player did, and whether one cue caused the action; then ask what can be concluded about replay. First show summaries, then a separately mocked ordered detail. Record the missing question, actual decision changed and additional privacy cost; never use real student records for this investigation. These hypotheses are untested proposals, not results.

## Owner decisions and implementation boundaries

1. Is assignment-store association and student/teacher grouping sufficient for replay, despite no automatic total or identity linkage? If not, what exact replay question justifies a pseudonymous identifier and how long may it persist?
2. Approve or revise the omission of duck name, student name, class, seed, exact time and reflection text; should any be opt-in, and with what explicit notice?
3. Which concrete action counts/choices are instructional enough to export? Which displayed-technique taxonomy and completeness rules should govern? Resolve after Receipt and Plan37 contracts.
4. Is summary-only sufficient initially, or is narrowly scoped chronological detail required? Should teacher-created local class CSV or persisted analyzer state ever be supported, with what retention and deletion policy?
5. Choose version migration/unknown-field policy and operational import limits in a later implementation packet. Verify locally with synthetic malformed, truncated, duplicated, incompatible and distinct-but-identical summaries; verify the actual no-network behavior and accessibility. Never treat this report as permission to implement, deploy, change packet status or select Bootstrap.

## Labelled synthetic examples

The following are invented, illustrative JSON-shaped examples, not real exports, valid schema fixtures, or claims about implemented fields. Technique identifiers and outcomes are placeholders. Neither example identifies a student. A teacher must not assume they belong to one student without outside context.

```json
{"synthetic":true,"format":"quackpot-summary-proposal","version":"illustrative-0","contentVersion":"example-A","evidence":"receipt-recorded","terminal":"left","displayedTechniques":["retention-offer"],"recordedActions":["leave-immediately"]}
```

```json
{"synthetic":true,"format":"quackpot-summary-proposal","version":"illustrative-0","contentVersion":"example-A","evidence":"receipt-recorded","terminal":"other-ending","displayedTechniques":["retention-offer","set-progress"],"recordedActions":["stayed-after-offer"]}
```

The second example records a display and an action, not whether the display caused the action. Neither file proves reflection, identity, number of previous runs, or absence of other displays unless the eventual evidence contract establishes completeness.
