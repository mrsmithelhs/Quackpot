param([Parameter(Mandatory=$true)][ValidateSet('healthy','injured')][string]$Phase,[Parameter(Mandatory=$true)][ValidatePattern('^[a-f0-9]{64}$')][string]$ManifestHash)
$ErrorActionPreference='Stop'
$base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/'
function Write-New([string]$path,[string]$body){$stream=[IO.File]::Open($path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::Read);try{$bytes=[Text.UTF8Encoding]::new($false).GetBytes($body);$stream.Write($bytes,0,$bytes.Length)}finally{$stream.Dispose()}}
function Check-Pins([string]$manifest){foreach($line in [IO.File]::ReadAllLines((Resolve-Path -LiteralPath $manifest))){if(!$line.Trim()){continue};$parts=$line -split '\s+',2;if($parts.Count -ne 2 -or (Get-FileHash -LiteralPath $parts[1]).Hash.ToLowerInvariant() -ne $parts[0]){throw "Pin mismatch: $line"}}}
$ranges=[System.Collections.Generic.List[object]]::new(); if($Phase -eq 'healthy'){$ranges.Add([int[]]@(0,4));$ranges.Add([int[]]@(4,16));for($i=16;$i -lt 256;$i+=16){$ranges.Add([int[]]@($i,($i+16)))}}else{for($i=256;$i -lt 320;$i+=16){$ranges.Add([int[]]@($i,($i+16)))}}
$out=$base+'screen-receipts/';$prefix=$out+'analysis-'+$Phase
Write-New ($prefix+'.started.json') (@{phase=$Phase;manifest=$ManifestHash;status='started'} | ConvertTo-Json -Compress)
$lines=[System.Collections.Generic.List[string]]::new();$failure=$null;$available=$null
try {
  $hostState=Get-CimInstance Win32_OperatingSystem;$available=[long]$hostState.FreePhysicalMemory;if($available -lt 8388608){throw 'Available physical memory below 8 GiB'}
  $owned=$base+'screen-owned-pins.txt';if((Get-FileHash -LiteralPath $owned).Hash.ToLowerInvariant() -ne $ManifestHash){throw 'Screen manifest mismatch'}
  Check-Pins $owned;Check-Pins ($base+'stage0-owned-pins.txt');Check-Pins ($base+'source-pins.txt')
  foreach($range in $ranges) {$a=$range[0];$b=$range[1];$label=('{0:D3}-{1:D3}' -f $a,$b);$receipt=$out+$label+'.complete.json';$data=$base+'screen-'+$label+'.jsonl';
    if(!(Test-Path -LiteralPath $receipt)){throw "Missing receipt: $label"};$r=Get-Content -Raw -LiteralPath $receipt | ConvertFrom-Json
    $oldHashes=@{'000-004'='e54236228c7d12628dcc64e12970e859b547099c60e0d71bb4579a528448bc20';'004-016'='2ba336155ba0abe96ad97d29ebba03c0e789ed6f08977f6e503f33b61b68ed23'}
    if($oldHashes.ContainsKey($label)) {if($r.manifest -ne '544cb34f39a4b9f35e8a2c1bd07a5c4217621378f511b036e2268013da170ac8' -or (Get-FileHash -LiteralPath $receipt).Hash.ToLowerInvariant() -ne $oldHashes[$label]){throw "Invalid fixed historical receipt: $label"}}
    elseif($r.manifest -ne $ManifestHash){throw "Prior manifest mismatch: $label"}
    if($r.start -ne $a -or $r.end -ne $b -or $r.result.ExitCode -ne 0 -or $r.result.StopReason -or $r.result.CleanupNotes -or (Get-FileHash -LiteralPath $data).Hash.ToLowerInvariant() -ne $r.dataSha256){throw "Invalid receipt: $label"}}
  $wrapper='reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1';if((Get-FileHash -LiteralPath $wrapper).Hash.ToLowerInvariant() -ne '6616bf693e48b2db3661ca6c848ce9336dc2484965cc576bb56d02bbff580a85'){throw 'Bounded launcher mismatch'}
  & $wrapper -Executable (Get-Command node.exe).Source -ArgumentVector @(($base+'screen-analyze.mjs'),$Phase) | ForEach-Object {$lines.Add([string]$_)}
  $result=($lines -join "`n") | ConvertFrom-Json;if($result.ExitCode -ne 0 -or $result.StopReason -or $result.CleanupNotes){throw 'Launcher failure or cleanup uncertainty'}
  Check-Pins $owned;Check-Pins ($base+'stage0-owned-pins.txt');Check-Pins ($base+'source-pins.txt')
  $data=$base+'screen-'+$Phase+'-analysis.json';$analysis=Get-Content -Raw -LiteralPath $data | ConvertFrom-Json
  $expected=if($Phase -eq 'healthy'){256}else{64};if($analysis.phase -ne $Phase -or $analysis.total -ne $expected){throw 'Analysis output mismatch'}
  Write-New ($prefix+'.complete.json') (@{phase=$Phase;availableKiB=$available;manifest=$ManifestHash;dataSha256=(Get-FileHash -LiteralPath $data).Hash.ToLowerInvariant();result=$result} | ConvertTo-Json -Depth 8)
} catch {$failure=$_.Exception.Message}
if($failure){Write-New ($prefix+'.failure.json') (@{phase=$Phase;availableKiB=$available;manifest=$ManifestHash;error=$failure;launcherOutput=($lines -join "`n")} | ConvertTo-Json -Depth 8);throw $failure}
