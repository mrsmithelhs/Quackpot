param(
  [Parameter(Mandatory = $true)] $Receipt
)

# Response-level gate only. Callers must separately verify the model, image
# path/tool trace, process/resource status, and capture completeness.
$events = @($Receipt.StandardOutput -split "`n" | Where-Object { $_ } | ForEach-Object { $_ | ConvertFrom-Json })
$results = @($events | Where-Object { $_.event -eq 'result' })
if ($results.Count -ne 1) { throw 'Invalid receipt: expected one result event.' }
$result = $results[0].result
if ($result.status -ne 'SUCCESS') { throw 'Invalid receipt: result status was not SUCCESS.' }
if ([string]$result.finished_reason -match '(?i)timeout|timed_out') { throw 'Invalid receipt: result finished with timeout.' }
if ([string]::IsNullOrWhiteSpace([string]$result.response)) { throw 'Invalid receipt: no final response.' }
