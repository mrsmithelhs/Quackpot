param([Parameter(Mandatory=$true)][ValidateSet('unit','contact','controlled','interruption','entry-injury','rollback','finish','parity')][string]$Case)
$ErrorActionPreference='Stop'
$base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/'
$order=@('unit','contact','controlled','interruption','entry-injury','rollback','finish','parity')
$index=[Array]::IndexOf($order,$Case)
$out=$base+'stage0-receipts/'
if (!(Test-Path -LiteralPath $out)) { New-Item -ItemType Directory -Path $out | Out-Null }
function Write-New([string]$path,[string]$body) {
  $stream=[IO.File]::Open($path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::Read)
  try { $bytes=[Text.UTF8Encoding]::new($false).GetBytes($body); $stream.Write($bytes,0,$bytes.Length) } finally { $stream.Dispose() }
}
function Check-Pins([string]$manifest) {
  foreach($line in [IO.File]::ReadAllLines((Resolve-Path -LiteralPath $manifest))) {
    if (!$line.Trim()) { continue }
    $parts=$line -split '\s+',2
    if ($parts.Count -ne 2 -or (Get-FileHash -LiteralPath $parts[1] -Algorithm SHA256).Hash.ToLowerInvariant() -ne $parts[0]) { throw "Pin mismatch: $line" }
  }
}
for($i=0;$i -lt $index;$i++) {
  $prior=$out+$order[$i]+'.complete.json'
  if (!(Test-Path -LiteralPath $prior)) { throw "Missing prior completion: $prior" }
  $priorResult=Get-Content -Raw -LiteralPath $prior | ConvertFrom-Json
  if ($priorResult.result.ExitCode -ne 0 -or $priorResult.result.StopReason -or $priorResult.result.CleanupNotes) { throw "Invalid prior completion: $prior" }
}
Write-New ($out+$Case+'.started.json') (@{case=$Case;status='started'} | ConvertTo-Json -Compress)
$lines=[System.Collections.Generic.List[string]]::new(); $failure=$null; $available=$null
try {
  $hostState=Get-CimInstance Win32_OperatingSystem
  $available=[long]$hostState.FreePhysicalMemory
  if ($available -lt 8388608) { throw 'Available physical memory below 8 GiB' }
  $owned=$base+'stage0-owned-pins.txt'
  if ((Get-FileHash -LiteralPath $owned).Hash.ToLowerInvariant() -ne '43771117c7e27c4c7c0f04020ef272321b4226c6552806ddd97dedeb14d490c4') { throw 'Owned pin manifest mismatch' }
  Check-Pins $owned; Check-Pins ($base+'source-pins.txt')
  $test=$base+'stage0-'+$Case+'.test.mjs'
  $wrapper='reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1'
  if ((Get-FileHash -LiteralPath $wrapper).Hash.ToLowerInvariant() -ne '6616bf693e48b2db3661ca6c848ce9336dc2484965cc576bb56d02bbff580a85') { throw 'Bounded launcher mismatch' }
  & $wrapper -Executable (Get-Command node.exe).Source -ArgumentVector @('--test',$test) | ForEach-Object { $lines.Add([string]$_) }
  Check-Pins $owned; Check-Pins ($base+'source-pins.txt')
  $raw=$lines -join "`n"; $result=$raw | ConvertFrom-Json
  if ($result.ExitCode -ne 0 -or $result.StopReason -or $result.CleanupNotes) { throw 'Launcher reported failure or cleanup uncertainty' }
  Write-New ($out+$Case+'.complete.json') (@{case=$Case;availableKiB=$available;result=$result} | ConvertTo-Json -Depth 8)
} catch { $failure=$_.Exception.Message }
if ($failure) {
  Write-New ($out+$Case+'.failure.json') (@{case=$Case;availableKiB=$available;error=$failure;launcherOutput=($lines -join "`n")} | ConvertTo-Json -Depth 8)
  throw $failure
}
