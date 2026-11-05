param([Parameter(Mandatory=$true)][int]$StartIndex,[Parameter(Mandatory=$true)][int]$EndIndex,[Parameter(Mandatory=$true)][ValidatePattern('^[a-f0-9]{64}$')][string]$ManifestHash)
$ErrorActionPreference='Stop'
$base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/'
$ranges=[System.Collections.Generic.List[object]]::new(); $ranges.Add([int[]]@(0,4)); $ranges.Add([int[]]@(4,16)); for($i=16;$i -lt 320;$i+=16){$ranges.Add([int[]]@($i,($i+16)))}
$selected=-1; for($i=0;$i -lt $ranges.Count;$i++){if($ranges[$i][0] -eq $StartIndex -and $ranges[$i][1] -eq $EndIndex){$selected=$i;break}}
if($selected -lt 0){throw 'Unapproved case range'}
$out=$base+'screen-receipts/'; if(!(Test-Path -LiteralPath $out)){New-Item -ItemType Directory -Path $out | Out-Null}
function Write-New([string]$path,[string]$body) { $stream=[IO.File]::Open($path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::Read);try{$bytes=[Text.UTF8Encoding]::new($false).GetBytes($body);$stream.Write($bytes,0,$bytes.Length)}finally{$stream.Dispose()} }
function Check-Pins([string]$manifest){foreach($line in [IO.File]::ReadAllLines((Resolve-Path -LiteralPath $manifest))){if(!$line.Trim()){continue};$parts=$line -split '\s+',2;if($parts.Count -ne 2 -or (Get-FileHash -LiteralPath $parts[1]).Hash.ToLowerInvariant() -ne $parts[0]){throw "Pin mismatch: $line"}}}
$stage0Hashes=@{unit='55d8539a752889a56580476be6bdf4f5043e506902506cdeb17c7840ca54aabb';contact='0133b6fb5928a830c566b56f4b46f50639f909dec8b6933b939a87d882cc8e20';controlled='7f98fb104b2b1c041a6089c987d01ffedf241d51784f7f122b418f8054295a98';interruption='9a24a9dbca0d6159d439066fb491897efd60765f15fe3376b31971a36d36e812';'entry-injury'='39962f1da5efe3197f20b664e5ff7cfab38debbdbf49a9be55f4e5cd1f7a72d3';rollback='04594c4e335d6a801c65ef57f5d3ae94e83a88d919989b01cc3eef6b230bea2c';finish='7ce50606cc9113f9ab82253c839bc61e211dd178454dfe374e40574ed2ce7ac0';parity='964d4b0f7ae1860495f1cba851272118fe0bf96a8f2b5ee686aa025ce63a01b2'}
foreach($case in @('unit','contact','controlled','interruption','entry-injury','rollback','finish','parity')) {
  $prior=$base+'stage0-receipts/'+$case+'.complete.json'; if(!(Test-Path -LiteralPath $prior)){throw "Missing Stage0 receipt: $case"}
  if((Get-FileHash -LiteralPath $prior).Hash.ToLowerInvariant() -ne $stage0Hashes[$case]){throw "Stage0 receipt hash mismatch: $case"}
  $r=Get-Content -Raw -LiteralPath $prior | ConvertFrom-Json; if($r.case -ne $case -or $r.result.ExitCode -ne 0 -or $r.result.StopReason -or $r.result.CleanupNotes){throw "Invalid Stage0 receipt: $case"}
}
for($i=0;$i -lt $selected;$i++) {
  $a=$ranges[$i][0];$b=$ranges[$i][1];$label=('{0:D3}-{1:D3}' -f $a,$b);$prior=$out+$label+'.complete.json';$data=$base+'screen-'+$label+'.jsonl';
  if(!(Test-Path -LiteralPath $prior)){throw "Missing prior screen receipt: $label"};$r=Get-Content -Raw -LiteralPath $prior | ConvertFrom-Json
  $oldHashes=@{'000-004'='e54236228c7d12628dcc64e12970e859b547099c60e0d71bb4579a528448bc20';'004-016'='2ba336155ba0abe96ad97d29ebba03c0e789ed6f08977f6e503f33b61b68ed23'}
  if($oldHashes.ContainsKey($label)) { if($r.manifest -ne '544cb34f39a4b9f35e8a2c1bd07a5c4217621378f511b036e2268013da170ac8' -or (Get-FileHash -LiteralPath $prior).Hash.ToLowerInvariant() -ne $oldHashes[$label]){throw "Invalid fixed historical receipt: $label"} }
  elseif($r.manifest -ne $ManifestHash){throw "Prior manifest mismatch: $label"}
  if($r.start -ne $a -or $r.end -ne $b -or $r.result.ExitCode -ne 0 -or $r.result.StopReason -or $r.result.CleanupNotes -or (Get-FileHash -LiteralPath $data).Hash.ToLowerInvariant() -ne $r.dataSha256){throw "Invalid prior screen receipt: $label"}
}
$label=('{0:D3}-{1:D3}' -f $StartIndex,$EndIndex)
Write-New ($out+$label+'.started.json') (@{start=$StartIndex;end=$EndIndex;manifest=$ManifestHash;status='started'} | ConvertTo-Json -Compress)
$lines=[System.Collections.Generic.List[string]]::new();$failure=$null;$available=$null
try {
  $hostState=Get-CimInstance Win32_OperatingSystem;$available=[long]$hostState.FreePhysicalMemory;if($available -lt 8388608){throw 'Available physical memory below 8 GiB'}
  $owned=$base+'screen-owned-pins.txt';if((Get-FileHash -LiteralPath $owned).Hash.ToLowerInvariant() -ne $ManifestHash){throw 'Screen manifest mismatch'}
  Check-Pins $owned;Check-Pins ($base+'stage0-owned-pins.txt');Check-Pins ($base+'source-pins.txt')
  $wrapper='reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1'
  if((Get-FileHash -LiteralPath $wrapper).Hash.ToLowerInvariant() -ne '6616bf693e48b2db3661ca6c848ce9336dc2484965cc576bb56d02bbff580a85'){throw 'Bounded launcher mismatch'}
  & $wrapper -Executable (Get-Command node.exe).Source -ArgumentVector @(($base+'screen-runner.mjs'),"$StartIndex","$EndIndex",$ManifestHash) | ForEach-Object {$lines.Add([string]$_)}
  $result=($lines -join "`n") | ConvertFrom-Json;if($result.ExitCode -ne 0 -or $result.StopReason -or $result.CleanupNotes){throw 'Launcher failure or cleanup uncertainty'}
  Check-Pins $owned;Check-Pins ($base+'stage0-owned-pins.txt');Check-Pins ($base+'source-pins.txt')
  $data=$base+'screen-'+$label+'.jsonl';$dataLines=Get-Content -LiteralPath $data
  $first=$dataLines[0] | ConvertFrom-Json;$last=$dataLines[-1] | ConvertFrom-Json
  if($first.type -ne 'start' -or $first.start -ne $StartIndex -or $first.end -ne $EndIndex -or $last.type -ne 'complete' -or $last.count -ne ($EndIndex-$StartIndex)){throw 'Incomplete case data'}
  Write-New ($out+$label+'.complete.json') (@{start=$StartIndex;end=$EndIndex;availableKiB=$available;manifest=$ManifestHash;dataSha256=(Get-FileHash -LiteralPath $data).Hash.ToLowerInvariant();result=$result} | ConvertTo-Json -Depth 8)
} catch {$failure=$_.Exception.Message}
if($failure){Write-New ($out+$label+'.failure.json') (@{start=$StartIndex;end=$EndIndex;availableKiB=$available;manifest=$ManifestHash;error=$failure;launcherOutput=($lines -join "`n")} | ConvertTo-Json -Depth 8);throw $failure}
