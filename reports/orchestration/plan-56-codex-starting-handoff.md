# Codex starting handoff — Plan 56

Work in `C:/AI/Quackpot` as the Plan56 Codex engineering investigator. Read `AGENTS.md`, `docs/agent-starting-prompts/implementer-prompt.md` and:

`docs/development/plan-56-preconverted-large-transcription-feasibility.md`

The owner has started this packet in parallel with Plan55. After real process preflight, run the starting check through the unchanged bounded launcher:

```powershell
& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'C:/Program Files/nodejs/node.exe' -ArgumentVector @('scripts/dev/plan-status.js','check','56')
```

Stop on nonzero. Do not import Torch, initialize a GPU model or invoke a native build to discover whether it works.

## Objective and first return

Investigate the already-converted Large FP16 GGUF with `DamRsn/muscriptor.cpp` first and Crane as a secondary candidate. The installed Plan53 PyTorch loader has a real initial full-precision allocation obstacle; it does not establish that all Large runtimes are infeasible. Conversely, a smaller weight file is not proof of laptop peak memory or musical usefulness.

Read the primary sources listed in the packet and repin repository/model/dependency revisions, exact weight hash and conversion lineage. Verify model NOTICE/additional terms rather than assuming an accessible mirror removes upstream conditions. Root's current reading found Windows GPU support documented as Vulkan, not CUDA, and note events rather than a complete caller-independent MIDI pipeline. Confirm actual source/build behavior. Do not pass GGUF to the PyTorch CLI, ordinary llama.cpp or an unsupported loader.

First return one compact source/toolchain/resource proposal: observed local compiler/CMake/Ninja/Vulkan requirements; minimal external installation/build layout; exact downloads/checksums and total disk/caches; build targets/parallelism/deadlines; host/GPU/job/watchdog controls; explicit backend/no CPU fallback; raw-note/MIDI conversion and comparison plan. Separate upstream claims, source-derived estimates and actual local observations. Report a negative feasibility finding honestly. No requirement to try both implementations or construct a custom loader if the first path fails.

**PhaseA is read-only source and local metadata inspection.** No dependency/weight downloads, configure-time fetching, compiler installs, builds, GPU enumeration that initializes a model, model execution, driver changes or global machine configuration before root clears the exact next stage. Small primary-source documents may be fetched for research; do not disguise package or model intake as document research. Owner handles gated access/terms locally; never collect cookies/tokens or log secrets.

## Conditional work after gate

After root approval, execute the named acquisition/build stages serially with bounded process trees and cleanup. Prove a minimal model-free note→MIDI path using authored program/drum/timing examples. Runtime-provided note cleanup, tie/chunk boundaries, precision, dynamics and tempo differences must be explicit. A successful benchmark exit is not a valid MIDI export or a musically useful result.

One same-M1 load/inference is a later separately coordinated gate, on the verified Plan53 00:20–00:45 crop. Any required16kHz mono conversion is a hashed derived input, never a replacement original. Preserve raw events and compare under matching note/render/mapping/assigned-velocity treatment. Medium PyTorch versus Large GGUF changes runtime and precision as well as size: do not attribute all differences to model size. No automatic OOM retry, extra precision/quantization backend, new track, full-track run or memory-limit increase. Return for owner listening after the bounded comparison.

## Scope, resources and concurrency

You are not alone in the repository. Own only:

`reports/development/plan-56-preconverted-large-transcription-feasibility/`

Later external artifact paths require the exact root-cleared proposal. Keep private inputs, crops, models and large binaries out of Git. Plan53's interpreter, venv, Medium weights, raw outputs, scripts and supervisor are read-only; no shared cache/env mutation or deletion to make room. Do not modify game source, dependencies/lockfiles, packet/status/canonical docs or existing launchers. No network service/cloud audio upload, runtime dependency or production adoption.

Plan52 has the owner's live isolated review browser and production repair scope; Plan53 has a working Medium pipeline and pending M3/M5 runs; Plan55 is report-local mechanics work. Reading/writing disjoint reports can overlap. Native builds, inference, audio rendering, browser tests and heavy validation serialize through QP Orch. Do not start a new server or terminate the existing localhost5173 server, owner browser or unrelated processes. Coordinate the full Git stage-to-commit turn, not just the commit instant.

All Node commands use the unchanged bounded launcher (serial, preflight, 1GiB heap/2GiB sampled tree/90s). Native compilation/model workloads need a separately reviewed resource vector; these are not Node jobs and must not inherit an unexamined90s limit. Preserve explicit stop/cleanup and sampling limitations. Offline flags/audit guards do not prove OS/native-code isolation; do not invent a firewall project or modify the machine to prove a claim the experiment does not need.

Read-only local research helpers may follow AGENTS discipline with bounded cold-start briefs, no competing writers. No external consultant calls are authorized by this handoff. Root reserves **one read-only Terra-medium pre-delivery reviewer** (`gpt-6.1-terra`, explicit `medium`) if substantive executable tooling is built. Use a compatible default-role child if needed; record requested/observed settings, read-only limits and independent finding dispositions. No automatic pre-proposal or repeated repair review; a docs-only feasibility finding does not require a gratuitous code review.

## Communication and delivery

Once the owner connects your chat to QP Orch with bidirectional authorization, introduce yourself and send the staged proposal, meaningful milestones and blockers directly. Before that, prepare the proposal here/report-local and ask the owner to connect you; do not infer messaging permission from another agent alone. Within a concretely cleared stage, handle ordinary fixes autonomously rather than requesting one approval per command. Stop for changed resource/model/backend/toolchain scope or load-bearing owner choices.

Commit explicit owned report paths, inspect cached list, progress last; no status edits, push or deployment. Deliver exact primary-source pins, verified local requirements, work actually executed, resources/cleanup, note/MIDI correctness, musical comparison limits and go/no-go recommendation. Keep technical feasibility, owner listening acceptance and soundtrack integration distinct.
