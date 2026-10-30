param([int]$RootPid, [string]$OwnedJson)
$ErrorActionPreference = 'Stop'
$processes = @(Get-CimInstance -ClassName Win32_Process -Property ProcessId, ParentProcessId, CreationDate | ForEach-Object {
  [pscustomobject]@{ pid = [int]$_.ProcessId; ppid = [int]$_.ParentProcessId; created = ([string]$_.CreationDate); root = $false }
})
if ($OwnedJson) {
  $wanted = @(ConvertFrom-Json -InputObject $OwnedJson)
  $result = @($processes | Where-Object {
    $current = $_
    @($wanted | Where-Object { $_.pid -eq $current.pid -and $_.created -eq $current.created }).Count -gt 0
  })
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
ConvertTo-Json -InputObject @($result) -Compress -Depth 3
