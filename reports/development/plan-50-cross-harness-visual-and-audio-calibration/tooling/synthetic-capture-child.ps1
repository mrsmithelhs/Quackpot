param([string]$Mode)
if ($Mode -eq 'within') {
  [Console]::Out.Write('{"payload":"' + ('a' * 70000) + '","tail":"OUT-END"}')
  [Console]::Error.Write(('b' * 70000) + 'ERR-END')
  exit 0
}
if ($Mode -eq 'overflow') {
  [Console]::Out.Write(('c' * 2100000) + 'OVER-END')
  [Console]::Error.Write('OTHER-END')
  exit 0
}
if ($Mode -eq 'exit7') {
  [Console]::Out.Write('nonzero-output')
  [Console]::Error.Write('nonzero-error')
  exit 7
}
exit 9
