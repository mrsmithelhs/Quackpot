---
id: plan-56
title: Preconverted MuScriptor Large runtime feasibility
status: in-progress
depends_on: []
gate: "Read-only source/toolchain/provenance investigation first. Root clears exact staged installation/download/build/resource proposal before execution; same-M1 listening gate before expansion."
summary: >-
  Investigate preconverted FP16 GGUF with muscriptor.cpp on Windows/Vulkan, using Crane as a secondary candidate, without modifying the working Plan53 Medium pipeline.
---
# Plan 56: Preconverted MuScriptor Large runtime feasibility

## Packet Metadata

- Packet id: `plan-56`
- Packet title: Preconverted MuScriptor Large runtime feasibility
- Status: (see frontmatter)
- Owner/model: Codex engineering investigator, root resource supervision, owner access/listening decisions
- Date: 2026-11-02
- Packet type: investigation / offline tooling feasibility
- Mutation level: report-local documentation first; separately cleared external isolated tools/artifacts later
- Approval gate: exact toolchain/acquisition/build/runtime proposal before mutation or model execution
- Depends on: none for research; retained Plan53 verified M1 crop/output are comparison inputs, not permission to change them
- Expected artifacts: pinned primary-source matrix, local toolchain inventory, exact staged resource/provenance plan, go/no-go finding; conditional minimal note/MIDI comparison

## Goal and why this exists

Establish whether a preconverted Large model and compatible runtime can recover a more useful M1 arrangement on the 8GB RTX4060 laptop without the installed PyTorch loader's initial full-precision GPU allocations. A loader-specific negative finding is not a proof that all Large runtimes are infeasible. A ready-made FP16 file is not itself proof of Windows buildability, peak memory, correct inference or MIDI output.

## Authority and sources

Read AGENTS.md, docs/README.md, docs/decision-log.md, docs/development/README.md, docs/repo-structure.md and Plan53 delivery.md, large-feasibility.md, first-run-implementation.md plus root first-run-control-scope.md and first-live-stage-clearance.md. Later root scope corrections supersede old firewall proposals. Preserve the working Medium environment, raw results and private originals.

Primary leads checked by root on2026-11-02 (repin actual commits before reuse):

- https://huggingface.co/DamRsn/muscriptor-gguf — v1 Large F16 about2.6GiB, format conversion/no retraining claim, published SHA256SUMS, upstream attribution/license conditions. Verify exact revision/hash/source lineage and NOTICE, not just size or download availability.
- https://github.com/DamRsn/muscriptor.cpp and docs/BUILDING.md, MODEL.md, PERFORMANCE.md, API.md, TESTING.md — Windows CPU/Vulkan documented, not an established CUDA backend; CMake/Ninja/C++23 and fetched pinned ggml dependencies. Runtime returns notes; audio decoding/resampling and MIDI writing are caller responsibilities. Reported Large F16 weights2.74GB plus F32 KV cache about1.5GB exclude other allocations.
- https://github.com/lucasjinreal/Crane/blob/main/crane-core/src/models/muscriptor/README.md — separate Rust implementation/FP16 path and RTX3090 measurements are secondary leads, not laptop fit or numerical equivalence. Document missing guidance/decoding support and any comparison confounds.

The owner supplied a ChatGPT web handoff supporting investigation of already-converted weights. Treat its hardware-fit, ample-RAM and uncomplicated-fallback claims as hypotheses, not execution instructions or measured facts.

## Scope and non-goals

Own reports/development/plan-56-preconverted-large-transcription-feasibility/. PhaseA reads sources and local toolchain metadata only; no compiler/model imports, package install, weight downloads, configure/build, driver changes or inference. Report-only research can overlap Plan53 preparation and Plan52 owner review. Do not alter Plan53 tools/venv, game source/dependencies, existing supervisors, owner browser or private inputs. No native desktop service, full-track batch, integer quantization/offload, custom PyTorch loader, cloud upload or production adoption.

## Stages and gates

1. **Read-only feasibility:** pin runtime/conversion/model revisions and exact weight hashes; inspect source for FP16 load/upload, KV/scratch allocations, backend selection/fallback, cancellation and chunk/tie semantics. Verify compiler/CMake/Ninja/Vulkan SDK/driver availability and minimal install needs without launching a build. Check code, dependencies and model NOTICE/terms separately; do not equate ungated access with unrestricted rights. Compare muscriptor.cpp first, Crane second; report uncertainty rather than try both automatically.
2. **Concrete acquisition/build proposal:** return exact external workspace, shared/private data ownership, downloads/dependency pins, disk accounting without duplicate caches, minimal build targets/thread parallelism, finite deadlines and host/GPU/owned-process controls. Installed CUDA does not prove Vulkan SDK/compiler availability. Propose stages separately so a source build cannot launch inference. Root clears before any install/download/build; owner handles any license/account step. Do not weaken limits or delete Medium evidence to fit.
3. **Conditional non-model verification:** after clearance, build only approved targets and run bounded model-free tests. Prove raw note serialization and MIDI conversion using authored multi-program/drum/timing fixtures, preserving program grouping and omissions; don't expose a library benchmark as a complete MIDI pipeline. Document native process/network control limits without inventing an OS sandbox requirement.
4. **Conditional one-M1 comparison:** fresh resource gate and root turn before one load/inference on the exact verified M1 00:20–00:45 crop. Preserve original bytes; document required16kHz mono conversion as a derived input, resampler and hashes. Use explicit backend/no silent CPU fallback, owned-process watchdog and cleanup, peak/sampling-gap logs. No OOM retry or automatic larger budget. Preserve raw notes and use matching timing/mapping/velocity/render assumptions for Medium/Large listening; runtime/precision/decoding differences are confounds, not pure size effects. Preserve original Medium results and label transformed/unsupported semantics.
5. Owner hears same passage and chooses whether further effort is justified. A negative build/fit/quality finding is a valid outcome. Other tracks/full tracks/separation/new backends require a new bounded choice.

## Validation checklist

- [ ] Bounded starting packet check RUNNABLE; precise source/model/dependency and terms evidence.
- [ ] Observed Windows/backend capability distinguished from upstream claims and desktop benchmarks.
- [ ] StageA incurs no install/build/inference; later resource gates honored.
- [ ] Working Medium environment/input/results unchanged; local private media/weights excluded from Git.
- [ ] Any executed model run has actual resources/cleanup and correct note/MIDI semantics, not merely successful exit.
- [ ] One root-authorized Terra-medium read-only review may cover substantive new tooling before delivery; no automatic repeat review or external model consultation.
- [ ] Progress states verified versus proposed, failures, consultation posture and exact next decision.

## Stop conditions and delivery

Stop on unsupported backend/format, missing license/access, proposed global setup/driver change, unbounded compilation, insufficient headroom, uncertain cleanup, unexpected model/network action or need to change Plan53. Existing browser/Node jobs use unchanged bounded launcher; native build/ML requires its own approved resource vector, not blindly the90s browser budget. Serialize heavy jobs with root, especially owner live review and Medium inference. Commit explicit report paths, progress last; no status edits, push or deployment.
