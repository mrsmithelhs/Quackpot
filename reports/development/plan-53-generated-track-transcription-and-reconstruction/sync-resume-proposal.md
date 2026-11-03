# Plan 53 package-sync resume proposal

2026-11-02 — root conditionally cleared one preserved-state resume after the focused test. The first approved setup stopped during `uv pip sync` after 248.179 seconds when storage enumeration encountered a transient uv temporary directory that had vanished. The owned root exited and its job reported zero active processes. Sampled workspace peak was 7,641,314,490 bytes; largest sample gap 1.332 seconds. `uv` reported downloading Torch and preparing 58 packages, but that first sync did not exit successfully. Files and diagnostics were preserved; Python acquisition and extraction were not repeated.

## Targeted accounting repair

`bootstrap_supervisor.py` now skips `FileNotFoundError` only when an enumerated descendant entry or an already-queued descendant directory vanishes. It counts these occurrences in the per-run result. It still fails on a missing or replaced root, root reparse point, permission failures, unsupported entries, descendant reparse points, quota breaches and other errors. An entry's already-returned stat determines file/dir type, avoiding a second existence race. Root identity is checked before and after each traversal. Skipping vanished files can omit bytes in a moving, non-atomic sample; the size cap and free-disk floor remain sampled and may overshoot. No error is converted into a blanket zero total.

`test_storage_accounting.py` passed one coordinated synthetic test covering vanished entry and queued directory, retained-file bytes, a permission failure, missing/changed root and reparse root. Under a 128 MiB job and ten-second outer guard, root exit was 0 and the job reported zero active processes. This bounded test does not prove all filesystem races.

## Proposed one-time resume

`resume_sync.py` was reviewed and run once after a fresh host preflight and coordinated resource turn. From the preserved effective workspace it verified the uv executable SHA-256 and raw lock hash, confirmed existing isolated Python and venv paths, then executed these three operations sequentially under the existing owned-job supervisor and one 30-minute shared deadline:

1. Run the existing `verify_python.py` using the already-extracted interpreter; require CPython 3.12.13, Windows, 64-bit.
2. Run exactly `uv pip sync RESOLVED --python ROOT\venv\Scripts\python.exe --require-hashes --torch-backend cu128 --no-build --no-config --no-python-downloads` under the 4 GiB job commit / 20 GiB sampled whole-workspace / 30 GiB free-disk limits. Existing verified cache may be reused; missing package bytes may still be fetched. This is not authorization for model downloads or a backend switch.
3. Run `verify_environment.py` using the venv interpreter. It checks installed distribution names/versions using metadata only and does not import Torch, MuScriptor or model code.

Before each operation the previous `bootstrap-output.log` is renamed to a distinct unused name inside the same workspace; it is never deleted or overwritten. Existing failed-sync logs and partial files remain. Any changed pin/hash, missing preserved file, failed monitor, unavailable root, unexpected resource usage, nonzero exit or cleanup uncertainty stops the stage without another automatic retry. As before, the controller's between-command filesystem stall is not independently timed, and cache footprint is not a measure of network bytes. Model access and inference remain separate gates; the owner-listening stop remains in place.

All three resumed operations exited successfully; uv reported 58 resolved and installed the two remaining packages, and metadata verification matched 58 installed distributions. Peak sampled workspace was 15,186,540,435 bytes; largest gap 1.321 seconds, with zero active owned processes at each cleanup. Full details and limits are in `installation-review.md`.
