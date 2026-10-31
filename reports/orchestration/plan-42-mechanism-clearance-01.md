# Plan 42 mechanism clearance

Date: 2026-10-31. Reviewed input: reports/development/plan-42-usage-package-contract-and-zip-spike/checkpoint-contract-mechanism.md.

**Decision: clear controlled acquisition and the bounded report-local spike, subject to the source-feasibility stop below.** This is not acceptance of a production contract, a security certification or authority to change shared code.

## Exact acquisition

Root queried https://registry.npmjs.org/@zip.js%2fzip.js/2.8.23. It reports name @zip.js/zip.js, version 2.8.23, license BSD-3-Clause, unpackedSize 4420051 and this exact tarball:

https://registry.npmjs.org/@zip.js/zip.js/-/zip.js-2.8.23.tgz

Registry integrity:

`sha512-RB+RLnxPJFPrGvQ9rgO+4JOcsob6lD32OcF0QE0yg24oeW9q8KnTTNlugcDaIveEcCbclobJcZP+fLQ++sH0bw==`

Acquire only that tarball into the Plan 42 report folder, with an 8 MiB download ceiling and finite request timeout. Verify integrity before unpacking; inspect member paths before extracting, reject traversal/links and keep unpacked content under 16 MiB. Use a standard trusted archive utility, not a new archive parser. Inspect only: no package lifecycle scripts, npm install, imported code execution or game package changes during acquisition. Retain exact package metadata, license, notices, hashes and selected local distribution. Root verified registry metadata, not the contents of the tarball. A mismatch is a stop, not permission to substitute a different version.

## Approved mechanism and caps

The experimental contract, worker isolation, output-counting sink and all starting caps in the checkpoint are approved: one archive/worker at a time; 20 selected files; 8 MiB/file and 32 MiB selected compressed total; 2 MiB actual expanded/file and 16 MiB expanded/batch; 2,000 events; depth 12; strings 512 UTF-16 units; 10-second file deadline; 16 MiB retained serialized projections; 32 MiB retained fixtures/evidence. These are limits on named operations, not a hard cap on whole-browser memory.

Apply these clarifications in the source-feasibility note and implementation:

- Bound enumeration itself. Stop when a second entry is encountered rather than first collecting an arbitrary directory. Inspect whether the pinned implementation materializes directory data before yielding and quantify the input-bounded overhead. Reject unsupported encryption, compression/features, path-like names, extra entries and ambiguous structures. Use a narrow supported ZIP subset; do not add ZIP64, split archives or self-extracting support for this spike.
- Check strict header/name/CRC/overlap/ambiguity behavior against the pinned source. Current upstream documentation is not proof these options exist in 2.8.23. Missing indispensable checks or inability to bound internal decompression work/queued output is a feasibility stop. Record actual API names and tested negative controls, not assumed configuration flags.
- Enforce counting before retaining/copying output, investigate maximum output chunk and upstream buffering, and terminate the dedicated worker when it fails or times out. Do not enable uncontrolled nested library workers. A sink rejection or AbortSignal alone is not proof decompression stopped. Keep batch bookkeeping on the host responsive.
- Treat JSON as untrusted even after ZIP checks: fatal UTF-8 decoding, bounded lexical scan, duplicate-key rejection and exact field allowlist. A bounded JSON token scanner is allowed; a hand-written ZIP parser is not. Reject reserved/prototype-sensitive keys and validate into plain records without merging imported objects into configuration or prototypes. Count and release invalid work as part of batch limits.
- CRC and hashes detect corruption/content differences, not authorship. A zero count needs evidence; unknown and omitted remain distinguishable. Do not let the synthetic marker make real exports appear supported.

After pinned-source inspection demonstrates feasibility, proceed through scoped source, tests, ordinary repairs and diagnostic-page work to delivery. No extra approval per command is needed. If the candidate cannot meet these bounds, stop with the exact gap and a bounded alternative proposal; do not silently weaken the limits or acquire a replacement dependency.

## Validation scheduling and delivery

All Node through the unchanged Plan 25 bounded launcher, serial jobs, process preflight, 1 GiB heap/2 GiB sampled owned-tree memory/90 seconds. No new Node or browser run is scheduled by this review. Source acquisition/inspection and writing may proceed independently of Plan 29. For executable validation, first establish the shared turn with the owner or through explicitly owner-authorized chat coordination; a process snapshot alone cannot prevent another chat launching a job. Do not stop unknown processes or existing owner servers. Once a validation turn is allocated, ordinary bounded tests/rechecks can proceed within it.

One read-only Terra-medium pre-delivery review remains authorized. Deliver acquisition/source-feasibility evidence, exact limits, positive/negative controls, no-network browser witness and reusable boundaries. Production exporter, analyzer and game event projection adoption remain separate.

## Communication limitation

The Plan 42 chat requested clearance. Root attempted a coordination message to Plan 29, but automatic approval review rejected it because explicit owner authorization to message that chat was absent. No message was delivered and root did not bypass the rejection. This file is the review decision for owner relay. Direct supervision messages for Plans 29/42 need explicit owner authorization.
