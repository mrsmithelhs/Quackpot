param(
  [switch]$LibraryOnly,
  [switch]$ExecuteReviewedTrial,
  [string]$Workspace
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-ProbeFields($Probe, [string]$Mode) {
  if ($null -eq $Probe) { throw 'Probe result missing.' }
  $fields=@('direct_connected','dns_resolved','local_read_ok')
  if ($Mode -eq 'blocked') { $fields += 'child_started' }
  foreach ($field in $fields) {
    $property=$Probe.PSObject.Properties[$field]
    if ($null -eq $property -or $property.Value -isnot [bool]) { throw "Probe field missing or not boolean: $field" }
  }
}

function Invoke-OwnedBoundaryTrial {
  param($Ops, [string[]]$Names, [string[]]$Programs)
  $created = [System.Collections.Generic.List[string]]::new()
  $uncertain = [System.Collections.Generic.List[string]]::new()
  $errors = [System.Collections.Generic.List[string]]::new()
  $result = [ordered]@{ outcome='failed'; created=@(); baseline=$null; blocked=$null; cleanup='unverified'; errors=@() }
  try {
    if ($Names.Count -ne 2 -or $Programs.Count -ne 2 -or $Names[0] -eq $Names[1] -or $Programs[0] -eq $Programs[1]) { throw 'Expected two unique rules and programs.' }
    foreach ($name in $Names) { if (& $Ops.Exists $name) { throw 'Rule-name collision; no mutation performed.' } }
    $result.baseline = & $Ops.Probe 'baseline'
    Assert-ProbeFields $result.baseline 'baseline'
    if (-not $result.baseline.direct_connected -or -not $result.baseline.dns_resolved -or -not $result.baseline.local_read_ok) { throw 'Unblocked baseline failed; blocked test cannot be interpreted.' }
    for ($i=0; $i -lt 2; $i++) {
      try { & $Ops.Create $Names[$i] $Programs[$i] } catch {
        # A failing create can be ambiguous: never delete a rule we cannot
        # prove this invocation created; preserve its exact name for review.
        try { if (& $Ops.Exists $Names[$i]) { $uncertain.Add($Names[$i]) } } catch { $uncertain.Add($Names[$i]) }
        throw
      }
      $created.Add($Names[$i])
      $result.created = @($created)
      if (-not (& $Ops.Verify $Names[$i] $Programs[$i])) { throw 'Created rule did not match reviewed scope.' }
    }
    $result.blocked = & $Ops.Probe 'blocked'
    Assert-ProbeFields $result.blocked 'blocked'
    if ($result.blocked.direct_connected -or $result.blocked.dns_resolved -or $result.blocked.child_started -or -not $result.blocked.local_read_ok) {
      throw 'Blocked probe did not demonstrate the requested boundary.'
    }
    $result.outcome = 'probe-passed; not proof of all OS/DNS/child behavior'
  } catch {
    $errors.Add($_.Exception.GetType().Name + ': ' + $_.Exception.Message)
  } finally {
    foreach ($name in $created) {
      try { & $Ops.Remove $name } catch { $errors.Add('Removal failed: ' + $name) }
    }
    $remaining = @()
    foreach ($name in $created) {
      try { if (& $Ops.Exists $name) { $remaining += $name } } catch { $remaining += $name }
    }
    $remaining += @($uncertain)
    $result.cleanup = if ($remaining.Count -eq 0) { 'created rules absent' } else { 'UNVERIFIED: ' + ($remaining -join ', ') }
    $result.errors = @($errors)
  }
  return [pscustomobject]$result
}

if ($LibraryOnly) { return }
if (-not $ExecuteReviewedTrial -or -not $Workspace) { throw 'Explicitly reviewed trial and workspace are required.' }
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Administrator privileges are required.' }
$root=(Resolve-Path -LiteralPath $Workspace -ErrorAction Stop).Path
$venv=Join-Path $root 'venv\Scripts\python.exe'; $base=Join-Path $root 'python-3.12.13\python\python.exe'
$expected=@('0A864203AEE170314ECE97BEAAD6E50E226E76F0A3D73380A93EC472ED74F040','88B9E780CFCDC38597C7F53E20F7165262BEFA28D9A5E9470360D349E172ECF37')
$programs=@($venv,$base)
for ($i=0;$i -lt 2;$i++) { if ((Get-FileHash -LiteralPath $programs[$i] -Algorithm SHA256).Hash -ne $expected[$i]) { throw 'Interpreter identity changed.' } }
$nonce=[Guid]::NewGuid().ToString('N'); $names=@("Quackpot53-$nonce-venv","Quackpot53-$nonce-base")
$trialRoot=Join-Path $root "boundary-trial-$nonce"; New-Item -ItemType Directory -Path $trialRoot -ErrorAction Stop | Out-Null
$intent=Join-Path $trialRoot 'boundary-intent.json'
$intentStream=[IO.File]::Open($intent,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
try {
  $intentWriter=[IO.StreamWriter]::new($intentStream,[Text.UTF8Encoding]::new($false))
  try { $intentWriter.Write((@{plannedNames=$names;programs=$programs;state='planned; inspect ownership before manual cleanup'} | ConvertTo-Json)) } finally { $intentWriter.Dispose() }
} finally { $intentStream.Dispose() }
$here=$PSScriptRoot; $hostPython=(Get-Command python.exe -ErrorAction Stop).Source
$ops = @{
  Exists = { param($name)
    try { $null=Get-NetFirewallRule -Name $name -ErrorAction Stop; return $true }
    catch { if ($_.CategoryInfo.Category -eq [Management.Automation.ErrorCategory]::ObjectNotFound) { return $false }; throw }
  }
  Create = { param($name,$program) New-NetFirewallRule -Name $name -DisplayName $name -Direction Outbound -Action Block -Program $program -Profile Any -Protocol Any -RemoteAddress Any -ErrorAction Stop | Out-Null }
  Verify = { param($name,$program)
    $rule=Get-NetFirewallRule -Name $name -ErrorAction Stop; $application=$rule | Get-NetFirewallApplicationFilter -ErrorAction Stop
    $port=$rule | Get-NetFirewallPortFilter -ErrorAction Stop; $address=$rule | Get-NetFirewallAddressFilter -ErrorAction Stop
    return ([string]$rule.Direction -eq 'Outbound' -and [string]$rule.Action -eq 'Block' -and [string]$rule.Enabled -eq 'True' -and [string]$rule.Profile -eq 'Any' -and $application.Program -ieq $program -and [string]$port.Protocol -eq 'Any' -and [string]$address.RemoteAddress -eq 'Any')
  }
  Remove = { param($name) Remove-NetFirewallRule -Name $name -ErrorAction Stop }
  Probe = { param($mode)
    $work=Join-Path $trialRoot $mode; New-Item -ItemType Directory -Path $work -ErrorAction Stop | Out-Null
    $start=[Diagnostics.ProcessStartInfo]::new(); $start.FileName=$hostPython; $start.UseShellExecute=$false; $start.CreateNoWindow=$true
    $start.RedirectStandardOutput=$true; $start.RedirectStandardError=$true
    @('-B',(Join-Path $here 'bootstrap_supervisor.py'),'--workspace',$work,'--seconds','8','--memory-mib','128','--footprint-mib','16','--free-floor-mib','0','--max-active','2',$venv,'-B',(Join-Path $here 'boundary_probe.py'),$mode) | ForEach-Object { [void]$start.ArgumentList.Add($_) }
    $process=[Diagnostics.Process]::new(); $process.StartInfo=$start
    if (-not $process.Start()) { throw 'Probe supervisor did not start.' }
    try {
      $stdout=$process.StandardOutput.ReadToEndAsync(); $stderr=$process.StandardError.ReadToEndAsync()
      if (-not $process.WaitForExit(10000)) { $process.Kill($true); [void]$process.WaitForExit(5000); throw 'Owned probe timed out.' }
      $text=$stdout.GetAwaiter().GetResult(); $err=$stderr.GetAwaiter().GetResult()
      if ($text.Length -gt 65536 -or $err.Length -gt 65536 -or $process.ExitCode -ne 0) { throw 'Probe supervisor failed.' }
      $supervision=$text | ConvertFrom-Json
      if ($supervision.cleanup -ne 'root exited; job reports zero active processes') { throw 'Probe owned-job cleanup unverified.' }
      return (Get-Content -LiteralPath (Join-Path $work 'bootstrap-output.log') -Raw | ConvertFrom-Json)
    } finally { $process.Dispose() }
  }
}
$receipt=Join-Path $trialRoot 'boundary-receipt.json'
try {
  $result=Invoke-OwnedBoundaryTrial $ops $names $programs
  $json=$result | ConvertTo-Json -Depth 6
  $stream=[IO.File]::Open($receipt,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
  try { $writer=[IO.StreamWriter]::new($stream,[Text.UTF8Encoding]::new($false)); try { $writer.Write($json) } finally { $writer.Dispose() } } finally { $stream.Dispose() }
  if ($result.outcome -notlike 'probe-passed*' -or $result.cleanup -ne 'created rules absent') { exit 1 }
  Write-Output 'Trial probe passed; created rules removed. Comprehensive OS isolation remains unproven.'
} catch {
  Write-Error ('Trial failed or receipt unavailable: ' + $_.Exception.GetType().Name)
  exit 1
}
