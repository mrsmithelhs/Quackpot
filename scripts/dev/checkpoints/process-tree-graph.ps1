function Select-VerifiedTree {
  param([object[]]$Processes, [int]$RootPid, [string]$RootCreated)
  $root = @($Processes | Where-Object { $_.pid -eq $RootPid -and $_.created -eq $RootCreated })
  if ($root.Count -ne 1) { return @() }
  $known = @{}; $known[$RootPid] = $root[0]
  $result = [System.Collections.Generic.List[object]]::new()
  $result.Add([pscustomobject]@{pid=$root[0].pid;ppid=$root[0].ppid;created=$root[0].created;root=$true})
  do {
    $changed = $false
    foreach ($item in $Processes) {
      if ($known.ContainsKey([int]$item.pid) -or -not $known.ContainsKey([int]$item.ppid)) { continue }
      $parent = $known[[int]$item.ppid]
      # Equal creation ticks are ambiguous; the caller must fail closed.
      if ([long]$item.created -eq [long]$parent.created) { throw 'Ambiguous equal-time process edge.' }
      if ([long]$item.created -lt [long]$parent.created) { continue }
      $known[[int]$item.pid] = $item
      $result.Add([pscustomobject]@{pid=$item.pid;ppid=$item.ppid;created=$item.created;root=$false})
      $changed = $true
    }
  } while ($changed)
  return @($result)
}

function Select-RetainedIdentities {
  param([object[]]$Processes, [object[]]$Wanted)
  return @($Processes | Where-Object { $current = $_; @($Wanted | Where-Object { $_.pid -eq $current.pid -and $_.created -eq $current.created }).Count -gt 0 })
}
