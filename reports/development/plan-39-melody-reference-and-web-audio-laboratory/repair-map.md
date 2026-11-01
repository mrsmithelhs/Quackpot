# Plan 39 technical repair map

2026-10-31. Baseline: existing in-place lab, with owner-selected M1–M6 and C0 and historical exports preserved. Packet check through the unchanged Plan 25 bounded launcher returned RUNNABLE. Initial tree included unrelated Plan 40 edits and untracked Plan 32 previews and Plan 38 cache; leave them untouched.

Repair order: inspect score/voice scheduling and browser lifecycle; reconcile gain and loop duration/tails; validate complete versioned manifests; establish source provenance; exercise a small bounded browser matrix and report actual evidence. Preserve existing timeout lock and URL eviction. No production, dependency, score, historical export or packet-status writes.

Resource baseline: Node process inventory returned no visible Node processes. OS-wide memory query was unavailable due to CIM access restrictions; this is not evidence of free memory. Every Node invocation must use the unchanged bounded launcher, serially, with its 1 GiB heap, sampled 2 GiB tree and 90 s limits. Browser audio needs independent bounds and one render at a time. Browser/server coordination remains necessary before using a shared surface.
