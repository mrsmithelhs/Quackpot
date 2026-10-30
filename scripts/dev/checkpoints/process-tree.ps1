param([Parameter(Mandatory = $true)][int]$RootPid)
$ErrorActionPreference = 'Stop'
$processes = @(Get-CimInstance -ClassName Win32_Process -Property ProcessId, ParentProcessId, CreationDate | ForEach-Object {
  [pscustomobject]@{ pid = [int]$_.ProcessId; ppid = [int]$_.ParentProcessId; created = ([string]$_.CreationDate) }
})
$known = [System.Collections.Generic.HashSet[int]]::new()
[void]$known.Add($RootPid)
$result = [System.Collections.Generic.List[object]]::new()
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
ConvertTo-Json -InputObject @($result) -Compress -Depth 3
