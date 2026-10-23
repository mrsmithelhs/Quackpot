# Test Coverage Scan Prompt

Audit test coverage in the project's shared/pure-logic layer (e.g. `src/shared/`, if the project has one) against independently authored behavioral specs, and report gaps and suspect tests. Read `AGENTS.md` for project guardrails and stop rules. Prefer `docs/decision-log.md` when the project uses one; otherwise use packet goals, workflow docs, schema docs, or other durable specifications for the area under scan. You are producing a **triage report for the orchestrator**, returned as thread output; you write no file, do not write, edit, or fix any test or implementation file yourself, and do not set packet status.

## Work blind first, then diff

Do not read the existing test files before doing the following:

1. Read independently authored behavioral specs for the area under scan: `docs/decision-log.md` if present, plus any packet goals, schema docs, or workflow docs that describe expected behavior.
2. Read the actual source files under scan — signatures, exported functions, the data shapes they operate on — but not their test files.
3. From steps 1–2 alone, write down the behavioral test cases you would expect to exist: one row per decision-derived behavior, in your own words, before looking at what's actually tested.

Only after that list exists, open the real test files and diff your independent list against what's actually asserted. This ordering is the point: a reviewer who reads the existing tests first tends to anchor on them and rubber-stamp whatever's already there, even when it's shallow.

## What counts as a gap

- A named decision/behavior with no corresponding test at all.
- A test whose *name* references the right behavior but whose *assertions* don't actually exercise it.
- An edge case a decision explicitly calls out (a boundary, a tie-break rule, an exclusion) that the tests never exercise, even if the general-case behavior is tested.

## What counts as a suspect (tautological/trivial) test

Flag these even when they technically pass and even when no gap exists elsewhere:

- The assertion can never fail given how the test is constructed (e.g. asserting a mock returns exactly what it was just configured to return, or asserting a value the function trivially always produces regardless of input).
- The test asserts an internal implementation detail (call count, private shape) rather than an externally observable input/output pair.
- The test's only real check is "it didn't throw," where the decision it's supposedly covering describes a specific expected output, not just success/failure.
- Heavy mocking that mocks past the actual boundary being tested, so the real logic under test never runs.

## Output format

A single markdown report with:

1. **Coverage table** — one row per spec-derived behavior in the scanned area: `source | expected behavior (your own words, written before you looked) | tested? (yes/partial/no) | note`.
2. **Suspect-test list** — `file:line | why suspect | what it should assert instead`.
3. **Summary** — counts only (gaps, suspects, clean), not a restatement of every row.

Do not edit any test file, implementation file, decision log, packet, or spec document. Do not fix anything yourself — report it, and let the orchestrator decide whether a finding becomes a packet.

## When to run this

Best run periodically against the shared/pure-logic layer — after a batch of implementer packets land there, or before a milestone — rather than on every single packet. It's an independent second look, not a per-packet gate.
