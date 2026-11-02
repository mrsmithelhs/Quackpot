param(
  [ValidateSet('bootstrap','inference')][string]$Stage = 'bootstrap',
  [string]$Drive = 'C:'
)
$ErrorActionPreference = 'Stop'
try {
  $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
  $processes = @(Get-CimInstance Win32_Process -ErrorAction Stop)
  if ($processes.Count -lt 5) { throw 'Host process inventory is incomplete or unavailable.' }
  $driveInfo = [System.IO.DriveInfo]::new($Drive)
  $gpuText = & nvidia-smi --query-gpu=memory.total,memory.used,utilization.gpu --format=csv,noheader,nounits
  if ($LASTEXITCODE -ne 0 -or @($gpuText).Count -ne 1) { throw 'GPU query failed or is ambiguous.' }
  $parts = $gpuText -split ',' | ForEach-Object { [int]$_.Trim() }
  if ($parts.Count -ne 3) { throw 'GPU query malformed.' }
  $freeRam = [long]$os.FreePhysicalMemory * 1024
  $ramFloor = if ($Stage -eq 'bootstrap') { 8GB } else { 16GB }
  $gpuFree = $parts[0] - $parts[1]
  $result = [ordered]@{
    stage = $Stage; observedUtc = [DateTime]::UtcNow.ToString('o')
    totalRamBytes = [long]$os.TotalVisibleMemorySize * 1024
    freeRamBytes = $freeRam; requiredFreeRamBytes = $ramFloor
    freeDiskBytes = $driveInfo.AvailableFreeSpace; requiredFreeDiskBytes = 30GB
    gpuTotalMiB = $parts[0]; gpuUsedMiB = $parts[1]; gpuUtilizationPercent = $parts[2]
    gpuFreeMiB = $gpuFree; gpuFloorApplies = ($Stage -eq 'inference')
    processCount = $processes.Count
    processes = @($processes | ForEach-Object { [ordered]@{name=$_.Name; id=$_.ProcessId; parentId=$_.ParentProcessId; workingSetBytes=[long]$_.WorkingSetSize} })
    # Resource coordination and whether other jobs conflict require root judgment.
    meetsNumericFloors = ($freeRam -ge $ramFloor -and $driveInfo.AvailableFreeSpace -ge 30GB -and ($Stage -eq 'bootstrap' -or $gpuFree -ge 6656))
  }
  $result | ConvertTo-Json -Depth 5
  if (-not $result.meetsNumericFloors) { exit 1 }
} catch {
  Write-Error "Host preflight unavailable: $($_.Exception.GetType().Name)"
  exit 2
}
