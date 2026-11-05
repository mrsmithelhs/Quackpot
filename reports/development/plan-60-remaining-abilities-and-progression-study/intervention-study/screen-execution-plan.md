# Proposed Stage 1 bounded execution — awaiting clearance

No natural-race screen has run. The predeclared protocol is `screen-protocol.md`; Stage0 and geometry results are limited evidence, not proof of event-order correctness or final balance. The owned manifest `screen-owned-pins.txt` SHA-256 is `e000356ec235c127ad117d4f44010f4a44ab1ee1405fa055323c99eb526e4d70`. It pins the screen scripts, protocol, previous source/Stage0 manifests and prior result context. `source-pins.txt` pins the 15 read-only Plan55/PRNG imports; `stage0-owned-pins.txt` pins the tested adapter/helper and fixtures. A changed hash is a stop, not permission to refresh after observations.

With root's specific continuation authorization and a named modest compute lane, inspect actual largest host processes and available memory >=8 GiB before **each** job, and confirm the owned manifest hash. Run from `C:/AI/Quackpot`, serially, using the exact command form below. The PowerShell wrapper verifies source, Stage0 and screen pins, all eight Stage0 completion receipt identities/hashes, the prior screen receipts/data hashes, current host memory floor and Plan25 bounded launcher hash. It creates fresh started/completed/failed receipts exclusively; the Node runner independently verifies the pin closure before and after every case and exclusively claims each JSONL. Per job default 90 seconds wall, 1 GiB Node heap and 2 GiB sampled owned-tree memory. No watcher, GPU, browser, installs or parallel races.

```powershell
& reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/run-screen.ps1 -StartIndex 16 -EndIndex 32 -ManifestHash e000356ec235c127ad117d4f44010f4a44ab1ee1405fa055323c99eb526e4d70
```

The pilot 0–3 and continuation 4–15 already completed under the original manifest; **do not repeat them**. The pilot's 16-case wall projection was 4.32 seconds. A PowerShell range-list parsing failure then stopped 16/32 before Node. Root is reviewing the bounded wrapper-only correction and exact prior-receipt compatibility record; the continuation command above is not authorized until that review and a fresh lane assignment. If granted, after 16/32 repeat the command form with these fixed StartIndex/EndIndex pairs, once each, in order:

```text
32/48, 48/64, 64/80, 80/96, 96/112, 112/128,
128/144, 144/160, 160/176, 176/192, 192/208, 208/224, 224/240, 240/256
```

For example, the following invocation uses `-StartIndex 32 -EndIndex 48` and the same manifest hash. A shard writes `screen-NNN-NNN.jsonl`; each row is appended immediately and a nonfinished status is recorded before an error stops that shard. Outputs are capped at 2 MiB per shard; the exclusive started/failure receipts and partial JSONL remain evidence. Never overwrite a file, rerun an unchanged failure, drop an unresolved case or replace a seed. Prior completed shard receipt/data hashes must match before the next job starts.

After all healthy indices 0–255 complete, and only with the approved lane, recheck host resources and pins and run:

```powershell
& reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/run-screen-analysis.ps1 -Phase healthy -ManifestHash e000356ec235c127ad117d4f44010f4a44ab1ee1405fa055323c99eb526e4d70
```

This separately bounded job checks all healthy receipt/data hashes, verifies complete fixed indices and writes exclusive `screen-healthy-analysis.json` plus an analysis receipt. Root must separately authorize the **optional injured-entry continuation**, even after healthy completion. If granted, run the same shard command form for `256/272, 272/288, 288/304, 304/320`, then the analysis form with `-Phase injured`. Entry-injury arithmetic and prior fixed onset checks passed, but same-race cap/slowdown, continuous interruption and actual same-interval finish/contact remain incompletely witnessed as described in `remaining-gaps.md`.

Do not treat the 320 ceiling or eight activations as a required target or a claim of statistical adequacy. Report actual sample size, exposure, paired/unmatched contact identities, uncertainty, failures and censoring, and distinguish entry injury from new injury. Stop after the authorized phase for root review; no additional seeds, tuning, visual capture, provider or production work follows automatically.
