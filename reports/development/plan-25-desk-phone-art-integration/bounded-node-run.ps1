param(
  [Parameter(Mandatory = $true)][string]$Executable,
  [Parameter(Mandatory = $true)][string[]]$ArgumentVector
)

# External, bounded launcher for one Plan 25 validation process tree. Do not run while the resource hold is active.
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public sealed class BoundedRunResult {
  public int ExitCode { get; set; }
  public double ElapsedSeconds { get; set; }
  public long PeakSampledPrivateBytes { get; set; }
  public string StopReason { get; set; }
  public string CleanupNotes { get; set; }
  public string StandardOutput { get; set; }
  public string StandardError { get; set; }
}

public static class Plan25ProcessTree {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  private struct ProcessEntry {
    public uint Size, Usage, ProcessId;
    public IntPtr DefaultHeap;
    public uint ModuleId, Threads, ParentProcessId;
    public int BasePriority;
    public uint Flags;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)] public string ExeFile;
  }
  [DllImport("kernel32.dll", SetLastError = true)] private static extern IntPtr CreateToolhelp32Snapshot(uint flags, uint processId);
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, ExactSpelling = true, SetLastError = true)] private static extern bool Process32FirstW(IntPtr snapshot, ref ProcessEntry entry);
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, ExactSpelling = true, SetLastError = true)] private static extern bool Process32NextW(IntPtr snapshot, ref ProcessEntry entry);
  [DllImport("kernel32.dll")] private static extern bool CloseHandle(IntPtr handle);
  private const int ERROR_NO_MORE_FILES = 18;

  private sealed class CapturedProcess {
    public Process Handle;
    public long StartTicks;
  }

  private sealed class BoundedCapture {
    private readonly object gate = new object();
    private readonly StringBuilder text = new StringBuilder();
    private readonly int limit;
    public BoundedCapture(int maximumCharacters) { limit = maximumCharacters; }
    public async Task Drain(System.IO.StreamReader reader) {
      var chunk = new char[4096];
      int count;
      while ((count = await reader.ReadAsync(chunk, 0, chunk.Length).ConfigureAwait(false)) != 0) {
        lock (gate) {
          int remaining = limit - text.Length;
          if (remaining > 0) text.Append(chunk, 0, Math.Min(remaining, count));
        }
      }
    }
    public string Value { get { lock (gate) return text.ToString(); } }
  }

  private static Dictionary<int, int> SnapshotParents() {
    IntPtr snapshot = CreateToolhelp32Snapshot(2, 0);
    if (snapshot == new IntPtr(-1)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
    try {
      var parents = new Dictionary<int, int>();
      var entry = new ProcessEntry(); entry.Size = (uint)Marshal.SizeOf(typeof(ProcessEntry));
      if (!Process32FirstW(snapshot, ref entry)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
      do {
        parents[(int)entry.ProcessId] = (int)entry.ParentProcessId;
        entry.Size = (uint)Marshal.SizeOf(typeof(ProcessEntry));
      } while (Process32NextW(snapshot, ref entry));
      int error = Marshal.GetLastWin32Error();
      if (error != ERROR_NO_MORE_FILES) throw new System.ComponentModel.Win32Exception(error);
      return parents;
    } finally { CloseHandle(snapshot); }
  }

  private static HashSet<int> Descendants(int rootId, Dictionary<int, int> parents) {
    var ids = new HashSet<int> { rootId };
    bool changed;
    do {
      changed = false;
      foreach (var item in parents) if (ids.Contains(item.Value) && ids.Add(item.Key)) changed = true;
    } while (changed);
    return ids;
  }

  private static List<string> CleanupCaptured(Dictionary<int, CapturedProcess> captured) {
    var notes = new List<string>();
    foreach (var item in captured.Values) {
      try {
        if (!item.Handle.HasExited && item.Handle.StartTime.ToUniversalTime().Ticks == item.StartTicks) item.Handle.Kill();
      } catch (Exception error) { notes.Add("survivor termination: " + error.Message); }
      try { item.Handle.Dispose(); } catch (Exception error) { notes.Add("process handle cleanup: " + error.Message); }
    }
    captured.Clear();
    return notes;
  }

  public static BoundedRunResult Run(string workingDirectory, string executable, string[] argumentVector) {
    var start = new ProcessStartInfo();
    start.FileName = executable; start.WorkingDirectory = workingDirectory;
    start.UseShellExecute = false; start.CreateNoWindow = true;
    start.RedirectStandardOutput = true; start.RedirectStandardError = true;
    start.Environment["NODE_OPTIONS"] = "--max-old-space-size=1024";
    foreach (string argument in argumentVector) start.ArgumentList.Add(argument);
    var process = new Process(); process.StartInfo = start;
    var stdout = new BoundedCapture(65536); var stderr = new BoundedCapture(65536);
    var clock = Stopwatch.StartNew(); var captured = new Dictionary<int, CapturedProcess>();
    long peak = 0; string stopReason = null; bool started = false;
    var cleanupNotes = new List<string>();
    try {
      if (!process.Start()) throw new InvalidOperationException("The owned validation process did not start.");
      started = true;
      Task outTask = stdout.Drain(process.StandardOutput); Task errTask = stderr.Drain(process.StandardError);
      while (!process.HasExited) {
        var parents = SnapshotParents();
        var current = Descendants(process.Id, parents);
        long totalPrivate = 0;
        foreach (int id in current) {
          CapturedProcess item;
          if (!captured.TryGetValue(id, out item)) {
            try {
              var child = Process.GetProcessById(id);
              item = new CapturedProcess { Handle = child, StartTicks = child.StartTime.ToUniversalTime().Ticks };
              captured[id] = item;
            } catch (ArgumentException) { continue; }
          }
          try {
            item.Handle.Refresh();
            if (!item.Handle.HasExited && item.Handle.StartTime.ToUniversalTime().Ticks == item.StartTicks)
              totalPrivate += item.Handle.PrivateMemorySize64;
          } catch (InvalidOperationException) { }
        }
        if (totalPrivate > peak) peak = totalPrivate;
        if (totalPrivate > 2L * 1024 * 1024 * 1024) { stopReason = "sampled owned-tree private bytes exceeded 2 GiB"; break; }
        if (clock.Elapsed.TotalSeconds >= 90) { stopReason = "90-second wall limit exceeded"; break; }
        Thread.Sleep(500);
        process.Refresh();
      }
      if (stopReason != null && !process.HasExited) process.Kill(true);
      if (!process.WaitForExit(5000) && !process.HasExited) throw new TimeoutException("Owned root process did not exit within 5 seconds after termination.");
      cleanupNotes.AddRange(CleanupCaptured(captured));
      Task.WaitAll(new[] { outTask, errTask }, 5000);
      if (!outTask.IsCompleted || !errTask.IsCompleted) throw new TimeoutException("Output drain did not finish within 5 seconds.");
      return new BoundedRunResult { ExitCode = process.ExitCode, ElapsedSeconds = clock.Elapsed.TotalSeconds,
        PeakSampledPrivateBytes = peak, StopReason = stopReason, CleanupNotes = String.Join("; ", cleanupNotes),
        StandardOutput = stdout.Value, StandardError = stderr.Value };
    } finally {
      if (started && !process.HasExited) {
        try { process.Kill(true); process.WaitForExit(5000); } catch (InvalidOperationException) { }
      }
      cleanupNotes.AddRange(CleanupCaptured(captured));
      process.Dispose();
    }
  }
}
'@

$resolvedExecutable = (Get-Command -Name $Executable -ErrorAction Stop).Source
$result = [Plan25ProcessTree]::Run((Get-Location).Path, $resolvedExecutable, $ArgumentVector)
$result | ConvertTo-Json -Depth 3
if ($result.StopReason) { throw $result.StopReason }
if ($result.ExitCode -ne 0) { throw "Validation process exited with code $($result.ExitCode)." }

# Example invocations (run separately, only after explicit root clearance):
# .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe --test src/ui/apartment-view.test.mjs
# .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 cmd.exe /d /s /c '"npm run build"'
# .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe reports/development/plan-25-desk-phone-art-integration/browser-lifecycle.mjs
