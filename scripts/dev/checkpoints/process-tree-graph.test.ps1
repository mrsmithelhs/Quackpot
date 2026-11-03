$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'process-tree-graph.ps1')
function Row([int]$id,[int]$parent,[string]$ticks) { [pscustomobject]@{pid=$id;ppid=$parent;created=$ticks} }
function Check([bool]$ok,[string]$name) { if (-not $ok) { throw "FAIL $name" }; Write-Output "PASS $name" }
$root=Row 10 1 '100'; $child=Row 11 10 '110'; $grand=Row 12 11 '120'; $older=Row 13 11 '90'; $equal=Row 14 10 '100'
$normal=@(Select-VerifiedTree -Processes @($root,$child,$grand,$older) -RootPid 10 -RootCreated '100')
Check (($normal.pid -join ',') -eq '10,11,12') 'normal chain excludes older child'
try { Select-VerifiedTree -Processes @($root,$equal) -RootPid 10 -RootCreated '100' | Out-Null; throw 'Expected equal-time ambiguity' } catch { Check ($_.Exception.Message -like '*Ambiguous equal-time*') 'equal-time edge fails closed' }
$missing=@(Select-VerifiedTree -Processes @($child,$grand) -RootPid 10 -RootCreated '100')
Check ($missing.Count -eq 0) 'missing root and stale parent PID'
$reused=@(Select-VerifiedTree -Processes @((Row 10 1 '200'),(Row 20 10 '210')) -RootPid 10 -RootCreated '100')
Check ($reused.Count -eq 0) 'root PID reuse'
$orphan=@(Select-RetainedIdentities -Processes @($child,(Row 12 1 '999')) -Wanted @($child,$grand))
Check ($orphan.Count -eq 1 -and $orphan[0].pid -eq 11) 'retained orphan and reused child PID'
Write-Output 'All deterministic identity cases passed.'
