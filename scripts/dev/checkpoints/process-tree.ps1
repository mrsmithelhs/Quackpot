param([int]$RootPid, [string]$OwnedJson, [switch]$DiagnosticOwned)
$ErrorActionPreference = 'Stop'
function Get-TypeName($Value) {
  if ($null -eq $Value) { return 'null' }
  return $Value.GetType().FullName
}
$processes = @(Get-CimInstance -ClassName Win32_Process -Property ProcessId, ParentProcessId, CreationDate | ForEach-Object {
  [pscustomobject]@{ pid = [int]$_.ProcessId; ppid = [int]$_.ParentProcessId; created = ([string]$_.CreationDate); root = $false }
})
if ($DiagnosticOwned -and -not $OwnedJson) { throw 'DiagnosticOwned requires OwnedJson.' }
if ($OwnedJson) {
  $wanted = @(ConvertFrom-Json -InputObject $OwnedJson)
  if ($DiagnosticOwned) {
    $received = @($wanted | ForEach-Object {
      [pscustomobject]@{ pid = $_.pid; created = $_.created; pidType = (Get-TypeName $_.pid); createdType = (Get-TypeName $_.created) }
    })
    $currentRows = @($processes | Where-Object { $candidate = $_; @($wanted | Where-Object { $_.pid -eq $candidate.pid }).Count -gt 0 } | ForEach-Object {
      [pscustomobject]@{ pid = $_.pid; ppid = $_.ppid; created = $_.created; pidType = $_.pid.GetType().FullName; createdType = $_.created.GetType().FullName }
    })
    $comparisons = @($wanted | ForEach-Object {
      $requested = $_
      $matches = @($processes | Where-Object { $_.pid -eq $requested.pid })
      if ($matches.Count -eq 0) {
        [pscustomobject]@{ requestedPid = $requested.pid; requestedCreated = $requested.created; requestedPidType = (Get-TypeName $requested.pid); requestedCreatedType = (Get-TypeName $requested.created); currentPid = $null; currentCreated = $null; currentPidType = 'null'; currentCreatedType = 'null'; pidEqual = $false; creationEqual = $null }
      } else {
        foreach ($current in $matches) {
          [pscustomobject]@{ requestedPid = $requested.pid; requestedCreated = $requested.created; requestedPidType = (Get-TypeName $requested.pid); requestedCreatedType = (Get-TypeName $requested.created); currentPid = $current.pid; currentCreated = $current.created; currentPidType = (Get-TypeName $current.pid); currentCreatedType = (Get-TypeName $current.created); pidEqual = [bool]($requested.pid -eq $current.pid); creationEqual = [bool]($requested.created -eq $current.created) }
        }
      }
    })
    $result = [pscustomobject]@{ kind = 'owned-identity-diagnostic/1'; receivedOwnedJson = $received; currentRowsForSuppliedPids = $currentRows; comparisons = $comparisons }
  } else {
    $result = @($processes | Where-Object {
      $current = $_
      @($wanted | Where-Object { $_.pid -eq $current.pid -and $_.created -eq $current.created }).Count -gt 0
    })
  }
} else {
  if ($RootPid -le 0) { throw 'RootPid is required for a process-tree snapshot.' }
  $known = [System.Collections.Generic.HashSet[int]]::new()
  [void]$known.Add($RootPid)
  $result = [System.Collections.Generic.List[object]]::new()
  $root = $processes | Where-Object { $_.pid -eq $RootPid } | Select-Object -First 1
  if ($root) { $root.root = $true; $result.Add($root) }
  do {
    $changed = $false
    foreach ($item in $processes) {
      if ($known.Contains($item.ppid) -and -not $known.Contains($item.pid)) {
        [void]$known.Add($item.pid)
        $result.Add($item)
        $changed = $true
      }
    }
  } while ($changed)
}
if ($DiagnosticOwned) { ConvertTo-Json -InputObject $result -Compress -Depth 4 }
else { ConvertTo-Json -InputObject @($result) -Compress -Depth 3 }
