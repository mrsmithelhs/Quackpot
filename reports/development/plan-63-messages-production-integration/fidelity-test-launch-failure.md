# Plan 63 focused test launch — monitor failure

2026-11-05. QP Orch cleared Lane B for fresh normal-host preflight and serial direct Node tests/build under the committed Plan25 launcher, with instruction to stop on a launcher fault. Preflight reported 11,758,724 KiB free physical memory and inspected Node, Chrome and Python process sizes. The following normal-host command was the first job:

```powershell
& .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--test','src/core/messages-policy.test.mjs','src/core/messages-projection.test.mjs','src/ui/messages-view.test.mjs')
```

The launcher returned `ExitCode: -1`, elapsed 0.0438067 seconds, sampled peak 0, no stdout/stderr, `FailurePhase: monitor`, `FailureOperation: capture-verified-descendant`, `FailureType: InvalidOperationException`, `NativeErrorCode: null`, `OutputDrainComplete: true`, `RootExited: true`, `UnobservedDescendantsPossible: true`, `CleanupResidualObserved: false`, `CleanupInspectionFailed: false`, `CleanupIdentityUnverified: false`, `VerifiedDescendantsCaptured: 0`, `CleanupDescendantsExited: 0`. No test results were produced. The PowerShell wrapper then threw for exit -1. No successful test, clean process-tree or build claim is made. The lane was stopped and QP Orch notified; no retry, alternate launcher, browser, or owner-preview modification.
