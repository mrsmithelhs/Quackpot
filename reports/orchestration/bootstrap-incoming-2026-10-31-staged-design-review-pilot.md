# Staged design review: Quackpot pilot findings and proposed upstream evaluation

- **From:** Quackpot
- **Date:** 2026-10-31
- **Area:** agent-starting-prompts
- **Type:** improvement-to-existing
- **Status:** open

## What & why generic

Quackpot's owner approved a report-local trial of a staged design-review agent, run in Gemini Flash, to support informed choices without assigning the whole interview to an expensive orchestrator. The owner repeatedly reported that concrete situations, context and consequences made the choices easier to understand, and now considers the workflow an improvement worth proposing upstream. Compact topic-boundary checkpoints gave orchestration opportunities to identify implication and provenance gaps before decisions spread into production or canonical documents. This is one qualitative pilot, not a controlled comparison, model ranking or proof of lower total cost or fewer downstream defects.

This note requests Bootstrap evaluation, not immediate prompt replacement. The owner explicitly prefers upstream consideration over installing a Quackpot-specific default. If Bootstrap adopts/releases the improvement, Quackpot will prepare a separate capability-adoption packet later. No capability version, adopter manifest or default prompt is changed by this notification.

## Generic kernel to upstream

1. Orient to current artifacts and separate settled preferences, actual implementation, open questions and unverified implications. Propose a coherent interview stage, foundations before dependent details.
2. Before consequential choices, supply a concrete situation, purpose, viable alternatives, material downsides/dependencies and a counterexample to the recommendation. Explain uncertainty; do not make the owner vote on an investigator's unresolved source fact.
3. Keep a report-local ledger separating the owner's selection, the agent's interpretation, recommended defaults, provisional numbers, deferred items and unresolved implications. Preserve authority without treating an answer as approval of unstated consequences.
4. At natural topic/dependency boundaries, produce a compact checkpoint (the pilot used about 500 words plus source links): selections, affected systems, assumptions/counterexamples, precise review needs and work that can proceed independently. A few meaningful choices is a heuristic, not a quota.
5. Orchestration returns targeted record/clarify/check/scope dispositions. Preserve the owner's preferences; explain only new material implications and reopen only the affected fork. A checkpoint is not ritual reapproval of every answer.
6. Default interview writes to an assigned report folder; delay propagation to canonical design, packets and implementation until the appropriate disposition/authority permits it. Independent research can continue while a dependent decision waits.
7. End with a synthesis-to-ledger consistency pass. Trace each selected rule to its source, label every new default, execute representative examples on paper, and distinguish a useful design artifact from an implementation-ready lifecycle specification. This last pass is essential: small checkpoints alone did not prevent final synthesis errors.

Keep contextual explanation proportional to the decision. Do not turn every minor preference into a mandatory long form, repeated advisor call or orchestrator gate. Low-tier read-only helpers can investigate bounded facts or challenge assumptions where useful; their agreement does not establish product quality. The lead remains the sole owner-facing integrator.

## Observed benefits and cleanup still required

The pilot accumulated fourteen owner selections across three compact checkpoints and final consolidation. It surfaced a foundational capacity problem early: a routine meal should coexist with a phase's main activity rather than consume the entire phase. Checkpoint review also caught illustrative financial/scheduling values being presented too close to accepted policy and clarified which downstream consequences were still unselected. The owner specifically liked the context/consequence presentation across several turns.

Final consolidation nevertheless required a substantial correction pass. It changed an immediate deadline into a click-triggered event; hardened example health thresholds and effect choices; omitted some interruption/session cases; and titled a trace as employment termination although it contained only two missed shifts. Counts and completion/provenance claims were stale or too strong. Root preserved actual owner selections while returning the synthesis for focused correction rather than another broad interview.

The revised consolidation is now received, explicitly labels lifecycle proposals and calibration examples, and adds traces. It remains pending root review. Some proposed defaults may still conflict: for example, collapse paths advance past a deadline check, and putting the phone down versus explicitly finishing a session needs clear separation. This note does not certify those repairs complete, close Plan 37, authorize production rules, or claim the owner had full context for every eventual implication. The pilot improved the review opportunities; it did not remove the need for integration judgment.

## What would make this wrong

The approach may add more overhead than value for small reversible choices, overwhelm owners with context, or merely move cleanup from implementation to prose. Checkpoints could become rubber stamps, recommended defaults could still acquire false owner authority, or a weak interviewer could produce confident but inaccurate consequences. Evidence that owners cannot identify the tradeoffs better, or that orchestration still needs the complete transcript to understand checkpoints, would weaken the proposal. There was no measured time/token comparison, independent outcome study, cross-project trial or final implementation validation. Bootstrap's current prompt has been read; this proposal does not assume it lacks all related guidance.

## Evidence / exemplar files

In Quackpot:

- `reports/orchestration/design-review-prompt-staged-draft.md` — trial role prompt, not adopted default.
- `reports/orchestration/design-review-gemini-flash-pilot-handoff.md` — scope, report-only authority and checkpoint instructions.
- `reports/development/plan-37-action-time-and-optional-life-lanes/design-review-pilot/ledger.md` — choices and their boundaries.
- The same pilot folder's `checkpoint-01.md`, `checkpoint-02.md`, `checkpoint-03.md` and `pilot-observations.md` — checkpoint outputs and qualitative observations.
- `reports/orchestration/plan-37-pilot-checkpoint-02-review.md` and `plan-37-pilot-checkpoint-03-review.md` — targeted corrections and remaining requirements.
- `reports/orchestration/plan-37-final-spec-review-01.md` — final synthesis defects and correction clearance.
- The pilot folder's `consolidated-action-transition-specification.md` and `progress.md` — latest correction submission, pending root review; mutable/uncommitted at this note's preparation, not an accepted frozen specification.

Game-specific rules, currencies, phase names, health consequences, character decisions, numeric parameters and provider/model preferences must not be copied into Bootstrap's generic prompt.

## Suggested Bootstrap action

Triage as a proposed improvement to `agent-starting-prompts`. Compare the staged kernel with current design-review/orchestrator guidance, assess the explicit final-consistency gate and report-only propagation boundary, and consider another bounded consumer trial or a scoped prompt-revision packet. Preserve focused-review/discovery entry paths and direct owner authority. If accepted for distribution, release/version it through Bootstrap's normal process; consumers adopt through their own packets. Do not mark this note accepted merely because work is queued. Bootstrap owns disposition, publication and its Git commit; the originating agent is authorized only to create this new inbox note.
