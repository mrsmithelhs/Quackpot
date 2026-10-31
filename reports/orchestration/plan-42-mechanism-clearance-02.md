# Plan 42 replacement acquisition clearance

2026-10-31. Reviewed replacement-candidate.md and source-feasibility.md in the Plan 42 report folder. This supersedes clearance 01's dependency version only; all ownership, finite caps, feasibility stops and production gates remain.

**Clear exact @zip.js/zip.js 2.18.0 acquisition and pinned-source inspection.** Root independently queried registry metadata and inspected upstream tagged reader source/release notes. Unlike 2.8.23, the tagged source includes strict local/central filename/flags/method comparisons. This warrants investigation, not a claim that every safety requirement is met.

- Tarball: https://registry.npmjs.org/@zip.js/zip.js/-/zip.js-2.18.0.tgz
- Integrity: `sha512-xv0lRTXFZQkDu88HkxXY4FfHEVfhA+KzxOARye0kDBZvylP1tJ15v99qiTq1Mm30WxakxKIySk9uVVrwSXkdZA==`
- Registry license: BSD-3-Clause; unpackedSize: 8,479,408 bytes. Verify actual package/license and source correspondence before execution.
- Source: https://raw.githubusercontent.com/gildas-lormeau/zip.js/v2.18.0/lib/core/zip-reader.js
- Release: https://github.com/gildas-lormeau/zip.js/releases/tag/v2.18.0

Retain the 8 MiB finite download, 20-second request timeout, 16 MiB unpacked limit, integrity verification before extraction, standard trusted tar utility with path/link/special-file screening, no package scripts/install and report-local ownership. Retain 2.8.23's failed feasibility evidence; do not accidentally import it. Account for both packages within the existing 32 MiB retained artifact/evidence limit; retaining only required distribution/license/source evidence is acceptable when fully mapped and hashed.

Proceed to pinned-source feasibility inspection. Inspect bounded reader requests and central-directory allocation before enumeration, codec output chunks/backpressure/queued buffers, abort/worker termination, local-only dependency/worker/WASM behavior and exact strict/CRC/overlap APIs. Restrict supported archives to the narrow subset in the prior decision; metadata rejection alone is not a decompression bound. No hand-written ZIP parser or relaxed requirements to accommodate the candidate.

If source inspection supports the bounded mechanism, the existing authority covers implementation, focused positive/negative controls and serial validation to delivery without another acquisition gate or per-command approvals. State the actual observed limits and residual browser-memory uncertainty; do not require or claim a mathematical whole-browser heap guarantee. An unresolved indispensable limit remains a stop with exact evidence and a proposed remedy, not repeated speculative execution.

Plan 29 explicitly released its finished validation batch. Plan 42 has the serial executable-validation turn after preflight and feasibility inspection, using the unchanged bounded launcher. Coordinate any new competing work with root. One pre-delivery Terra-medium review remains authorized; ordinary repairs do not gain additional reviewer calls. Final owner/root acceptance and production integration remain separate.
