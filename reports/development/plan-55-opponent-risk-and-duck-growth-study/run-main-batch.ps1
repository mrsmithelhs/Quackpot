$ErrorActionPreference='Stop'
$dir='reports/development/plan-55-opponent-risk-and-duck-growth-study'
$ledger="$dir/main-results/launcher-ledger.jsonl"
if(Test-Path $ledger){throw 'Ledger exists'}
$elapsed=11.6979546
@{shard=0;exit=0;seconds=$elapsed;peak=195305472;cleanup='';recovered='host command exec-4d069ddf-7bd7-4f5b-8a80-fa97c5830482'} | ConvertTo-Json -Compress | Add-Content -Encoding utf8 $ledger
for($i=1;$i -lt 18;$i++) {
 if((480-$elapsed) -lt 90){throw 'Aggregate wall reservation exhausted'}
 $nodes=@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Select-Object ProcessId,ParentProcessId,Name)
 $bad=@(Get-Content "$dir/core-source-pins.txt","$dir/main-code-pins.txt" | ForEach-Object {$parts=$_ -split '  ',2; if((Get-FileHash -Algorithm SHA256 -LiteralPath $parts[1]).Hash.ToLower() -ne $parts[0]){$parts[1]}})
 if($bad.Count){throw "Pin drift: $($bad -join ', ')"}
 $file="$dir/main-results/shard-$('{0:d2}' -f $i).json"
 if(Test-Path $file){throw "Output exists: $file"}
 $cmd="& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'C:/Program Files/nodejs/node.exe' -ArgumentVector @('reports/development/plan-55-opponent-risk-and-duck-growth-study/main-runner.mjs','$i')"
 $raw=& pwsh -NoProfile -Command $cmd
 if($LASTEXITCODE -ne 0){throw "Launcher failed for shard $i`: $raw"}
 $result=($raw | Out-String | ConvertFrom-Json)
 $summary=$result.StandardOutput | ConvertFrom-Json
 $elapsed += $result.ElapsedSeconds
 $bytes=(Get-ChildItem "$dir/main-results" -File | Measure-Object Length -Sum).Sum
 $entry=@{shard=$i;exit=$result.ExitCode;seconds=$result.ElapsedSeconds;peak=$result.PeakSampledPrivateBytes;cleanup=$result.CleanupNotes;stop=$result.StopReason;summary=$summary;bytes=$bytes;sha256=(Get-FileHash $file -Algorithm SHA256).Hash.ToLower();nodeProcesses=$nodes.Count}
 $entry | ConvertTo-Json -Compress -Depth 6 | Add-Content -Encoding utf8 $ledger
 Write-Output ($entry | ConvertTo-Json -Compress -Depth 6)
 if($result.ExitCode -ne 0 -or $result.StopReason -or $summary.failure -or $summary.calls -ne 96 -or $summary.completedRuns -ne 16 -or $bytes -gt 2097152){throw "Shard $i failed guard"}
}
