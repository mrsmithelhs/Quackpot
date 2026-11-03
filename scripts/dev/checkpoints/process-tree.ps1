param([int]$RootPid, [string]$RootCreated, [string]$OwnedJson, [switch]$RootOnly)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'process-tree-graph.ps1')
$processes = @(Get-CimInstance -ClassName Win32_Process -Property ProcessId, ParentProcessId, CreationDate | ForEach-Object {
  [pscustomobject]@{ pid = [int]$_.ProcessId; ppid = [int]$_.ParentProcessId; created = ([string]$_.CreationDate.ToUniversalTime().Ticks); root = $false }
})
if ($OwnedJson) {
  $wanted = @(ConvertFrom-Json -InputObject $OwnedJson)
  $result = @(Select-RetainedIdentities -Processes $processes -Wanted $wanted)
} elseif ($RootOnly) {
  if ($RootPid -le 0) { throw 'RootPid is required.' }
  $result = @($processes | Where-Object { $_.pid -eq $RootPid } | Select-Object -First 1)
} else {
  if ($RootPid -le 0 -or -not $RootCreated) { throw 'Root PID and creation identity are required.' }
  $result = @(Select-VerifiedTree -Processes $processes -RootPid $RootPid -RootCreated $RootCreated)
}
ConvertTo-Json -InputObject @($result) -Compress -Depth 3
