# Proposed bounded capture variant: review before validation

Base: unchanged Plan25 `bounded-node-run.ps1`, SHA-256 `6616bf693e48b2db3661ca6c848ce9336dc2484965cc576bb56d02bbff580a85`. Exact diff: `git diff --no-index -- reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 reports/development/plan-50-cross-harness-visual-and-audio-calibration/tooling/bounded-media-review-run.ps1`.

Only capture changes: per stream 2,097,152 UTF-16 `char` units retained; continue draining with a 4096-char buffer; record long total drained, retained count and a truncation boolean per stream. After emitting the result JSON, wrapper throws on either truncation, independently of child exit; the JSON still contains child exit code so nonzero remains identifiable. Existing heap, process-tree sampling, timeouts, argument passing and cleanup are unchanged. Truncation and child nonzero can coexist: both fields must be read, not infer child status from wrapper exit. The output file itself may grow beyond the stream cap due to JSON escaping and two streams; it is finite, not a byte cap. Do not put provider logs or image data in Git.

After root reviews this draft and authorizes validation, run three finite synthetic child checks with preflight and uniquely owned output files, no model: (1) >65,536 and <2,097,152 characters on each stream, JSON-parse child stdout and verify tail on both streams and exact counters; (2) >2,097,152 on one stream, verify exact retained ceiling, greater drained count, truncation flag and nonzero wrapper outcome, while confirming other stream drained; (3) child exit 7 with small outputs: no truncation, child exit 7 and wrapper failure. Use a simple finite PowerShell child (no Node) and capture full wrapper JSON locally; inspect parsed results rather than sending long payload to tool output. No execution or validation yet.

## Synthetic validation, 2026-11-01

Preflight before each finite invocation found no Node or Claude process. Each child ran through the variant, with stdout and stderr captured to owned local files outside Git. Hashes identify complete local launcher JSON; values are UTF-16 char counts, not bytes.

| Check | Child exit | Stdout drained / retained / truncated | Stderr drained / retained / truncated | Result | Local receipt SHA-256 |
|---|---:|---|---|---|---|
| within cap | 0 | 70031 / 70031 / false | 70007 / 70007 / false | child stdout parsed as JSON and had `OUT-END`; stderr had `ERR-END`; wrapper success | b7601876a83d630c426758834e77eb61f9f4e86c83c4aac95a52b5e440a78084 |
| overflow | 0 | 2100008 / 2097152 / true | 9 / 9 / false | wrapper failed with explicit truncation; other stream drained | 9f366e0d71e8a03a2406b517ca374a1bffe21e08b3ccc18b5c583b5b452c2c1d |
| nonzero | 7 | 14 / 14 / false | 13 / 13 / false | wrapper reported child exit 7 separately | 0f11cfee2f4b9b216a273b481453025a17eaea3d06d5a7b23eab09ae08465210 |

Child source: `synthetic-capture-child.ps1`; results do not prove every process lifecycle or Unicode scenario. Root reviewed diff before validation and must accept actual results before historical use. No model was called in these checks. Shared launcher remained unchanged.
