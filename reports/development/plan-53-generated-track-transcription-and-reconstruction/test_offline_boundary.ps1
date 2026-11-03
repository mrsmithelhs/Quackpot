param()
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'offline_boundary_trial.ps1') -LibraryOnly

function Assert-That($Condition,[string]$Message) { if (-not $Condition) { throw $Message } }

function Test-FakeTrial([string]$Case) {
  $state=@{ rules=@{}; removed=[System.Collections.Generic.List[string]]::new(); creates=0; probes=0 }
  if ($Case -eq 'collision') { $state.rules['owned-a']='preexisting' }
  $ops=@{
    Exists={ param($name) return $state.rules.ContainsKey($name) }.GetNewClosure()
    Create={ param($name,$path) $state.creates++; if ($Case -eq 'create-fails' -and $state.creates -eq 2) { throw 'synthetic create failure' }; $state.rules[$name]=$path; if ($Case -eq 'create-uncertain') { throw 'synthetic ambiguous creation' } }.GetNewClosure()
    Verify={ param($name,$path) return $state.rules[$name] -eq $path }.GetNewClosure()
    Remove={ param($name) if ($Case -eq 'remove-fails') { throw 'synthetic removal failure' }; $state.removed.Add($name); [void]$state.rules.Remove($name) }.GetNewClosure()
    Probe={ param($mode)
      $state.probes++
      if ($mode -eq 'baseline') { return [pscustomobject]@{direct_connected=($Case -ne 'baseline-fails');dns_resolved=$true;child_started=$null;local_read_ok=$true} }
      if ($Case -eq 'probe-timeout') { throw [TimeoutException]::new('synthetic timeout') }
      if ($Case -eq 'probe-null') { return $null }
      if ($Case -eq 'probe-missing') { return [pscustomobject]@{direct_connected=$false;dns_resolved=$false;local_read_ok=$true} }
      if ($Case -eq 'probe-wrong-type') { return [pscustomobject]@{direct_connected=$false;dns_resolved=$false;child_started='false';local_read_ok=$true} }
      return [pscustomobject]@{direct_connected=$false;dns_resolved=($Case -eq 'dns-escape');child_started=$false;local_read_ok=$true}
    }.GetNewClosure()
  }
  $result=Invoke-OwnedBoundaryTrial $ops @('owned-a','owned-b') @('C:\trial\venv.exe','C:\trial\base.exe')
  switch ($Case) {
    'success' { Assert-That ($result.outcome -like 'probe-passed*' -and $result.cleanup -eq 'created rules absent' -and $state.rules.Count -eq 0 -and $state.removed.Count -eq 2) 'success/cleanup failed' }
    'baseline-fails' { Assert-That ($result.outcome -eq 'failed' -and $state.creates -eq 0 -and $result.cleanup -eq 'created rules absent') 'baseline failure mutated rules' }
    'create-fails' { Assert-That ($result.outcome -eq 'failed' -and $state.removed.Count -eq 1 -and $state.rules.Count -eq 0) 'partial creation cleanup failed' }
    'dns-escape' { Assert-That ($result.outcome -eq 'failed' -and $state.rules.Count -eq 0) 'DNS escape did not stop/clean up' }
    'remove-fails' { Assert-That ($result.outcome -like 'probe-passed*' -and $result.cleanup -like 'UNVERIFIED*' -and $state.rules.Count -eq 2) 'cleanup failure not retained' }
    'probe-timeout' { Assert-That ($result.outcome -eq 'failed' -and $state.rules.Count -eq 0 -and $state.removed.Count -eq 2) 'timeout cleanup failed' }
    'collision' { Assert-That ($result.outcome -eq 'failed' -and $state.creates -eq 0 -and $state.rules['owned-a'] -eq 'preexisting' -and $state.removed.Count -eq 0) 'collision altered preexisting rule' }
    'create-uncertain' { Assert-That ($result.outcome -eq 'failed' -and $result.cleanup -like 'UNVERIFIED*' -and $state.rules.Count -eq 1 -and $state.removed.Count -eq 0) 'ambiguous rule ownership lost' }
    { $_ -in @('probe-null','probe-missing','probe-wrong-type') } { Assert-That ($result.outcome -eq 'failed' -and $state.rules.Count -eq 0 -and $state.removed.Count -eq 2) 'invalid probe result accepted or cleanup failed' }
  }
}

foreach ($case in @('success','baseline-fails','create-fails','dns-escape','remove-fails','probe-timeout','collision','create-uncertain','probe-null','probe-missing','probe-wrong-type')) { Test-FakeTrial $case; Write-Output "$case passed" }
