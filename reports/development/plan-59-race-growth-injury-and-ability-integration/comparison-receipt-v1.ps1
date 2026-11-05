$receipt = 'reports/development/plan-59-race-growth-injury-and-ability-integration/comparison-receipt-v1.txt'
$status = 'reports/development/plan-59-race-growth-injury-and-ability-integration/comparison-status-v1.txt'
if ((Test-Path -LiteralPath $receipt) -or (Test-Path -LiteralPath $status)) { throw 'Refusing to overwrite attempt evidence' }
$attemptStatus = 'failed-before-launch'
try {
  $attemptStatus = 'launched'
  & ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'C:/Program Files/nodejs/node.exe' -ArgumentVector @('--test','--test-name-pattern=fixed paired|fixed half|finite healthy|wall|constraint|landing|injur|rollback|crowd|Bounce|contact|crossing|input validation|ability transition','src/core/race-kernel-v2.test.mjs') *> $receipt
  $attemptStatus = 'launcher-returned-success'
} catch {
  $attemptStatus = 'launcher-threw'
  Add-Content -LiteralPath $receipt -Value $_.ToString()
} finally {
  [IO.File]::WriteAllText((Join-Path $PWD $status), $attemptStatus)
}
Write-Output $attemptStatus
if ($attemptStatus -ne 'launcher-returned-success') { exit 1 }
