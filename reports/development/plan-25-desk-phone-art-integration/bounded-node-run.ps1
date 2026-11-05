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
  public string FailurePhase { get; set; }
  public string FailureOperation { get; set; }
  public string FailureType { get; set; }
  public int? NativeErrorCode { get; set; }
  public bool OutputDrainComplete { get; set; }
  public bool RootExited { get; set; }
  public bool UnobservedDescendantsPossible { get; set; }
  public bool CleanupResidualObserved { get; set; }
  public bool CleanupInspectionFailed { get; set; }
  public bool CleanupIdentityUnverified { get; set; }
  public int VerifiedDescendantsCaptured { get; set; }
  public int CleanupDescendantsExited { get; set; }
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

  private static List<string> CleanupCaptured(Dictionary<int, CapturedProcess> captured, Stopwatch deadline,
      out bool residual, out bool inspectionFailed, out bool identityUnverified, out int exited) {
    var notes = new List<string>();
    residual = false; inspectionFailed = false; identityUnverified = false; exited = 0;
    foreach (var item in captured.Values) {
      try {
        if (!item.Handle.HasExited) {
          if (item.Handle.StartTime.ToUniversalTime().Ticks != item.StartTicks) {
            identityUnverified = true; notes.Add("captured descendant identity changed; not terminated");
          } else {
            item.Handle.Kill();
            int remaining = Math.Max(0, 5000 - (int)deadline.ElapsedMilliseconds);
            if (!item.Handle.WaitForExit(remaining) && !item.Handle.HasExited) { residual = true; notes.Add("captured descendant did not exit within cleanup deadline"); }
          }
        }
        if (item.Handle.HasExited) exited++;
      } catch (Exception error) { inspectionFailed = true; notes.Add("descendant cleanup: " + error.GetType().Name); }
      try { item.Handle.Dispose(); } catch (Exception error) { notes.Add("process handle cleanup: " + error.Message); }
    }
    captured.Clear();
    return notes;
  }

  public static BoundedRunResult Run(string workingDirectory, string executable, string[] argumentVector, string diagnosticFault) {
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
    string phase = "start", operation = "process-start"; Exception primaryError = null;
    Task outTask = null, errTask = null; bool rootExited = false, drained = false;
    int exitCode = -1, verifiedCount = 0, exitedCount = 0; long rootStartTicks = 0; bool cleanupResidual = false, cleanupInspection = false, cleanupIdentity = false, diagnosticNodeChild = false;
    try {
      if (!process.Start()) throw new InvalidOperationException("The owned validation process did not start.");
      started = true;
      operation = "capture-root-identity"; rootStartTicks = process.StartTime.ToUniversalTime().Ticks;
      operation = "begin-output-drain";
      outTask = stdout.Drain(process.StandardOutput); errTask = stderr.Drain(process.StandardError);
      phase = "monitor";
      while (true) {
        operation = "check-owned-root"; if (process.HasExited) break;
        operation = "snapshot-process-tree";
        if (diagnosticFault == "inspection") throw new System.ComponentModel.Win32Exception(5, "Controlled inspection failure");
        if (diagnosticFault == "timeout") { stopReason = "controlled timeout-path diagnostic"; break; }
        long snapshotStarted = DateTime.UtcNow.Ticks;
        var parents = SnapshotParents();
        var verified = new Dictionary<int,long> { [process.Id] = rootStartTicks };
        bool changed;
        long totalPrivate = 0;
        operation = "sample-owned-root"; process.Refresh();
        if (!process.HasExited && process.StartTime.ToUniversalTime().Ticks == rootStartTicks) totalPrivate += process.PrivateMemorySize64;
        do {
          changed = false;
          foreach (var edge in parents) {
            int id = edge.Key, parentId = edge.Value;
            if (verified.ContainsKey(id) || !verified.ContainsKey(parentId)) continue;
            operation = "capture-verified-descendant"; Process child = null;
            try {
              child = Process.GetProcessById(id); long created = child.StartTime.ToUniversalTime().Ticks;
              if (created <= verified[parentId] || created > snapshotStarted) throw new InvalidOperationException("Ambiguous descendant creation order");
              var confirmation = SnapshotParents();
              if (!confirmation.TryGetValue(id, out int confirmedParent) || confirmedParent != parentId) throw new InvalidOperationException("Descendant ancestry changed during inspection");
              if (parentId == process.Id) { if (process.HasExited || process.StartTime.ToUniversalTime().Ticks != rootStartTicks) throw new InvalidOperationException("Root identity changed during inspection"); }
              else { var parent = captured[parentId]; if (parent.Handle.HasExited || parent.Handle.StartTime.ToUniversalTime().Ticks != verified[parentId]) throw new InvalidOperationException("Parent identity changed during inspection"); }
              if (child.HasExited || child.StartTime.ToUniversalTime().Ticks != created) throw new InvalidOperationException("Descendant identity changed during inspection");
              if (captured.TryGetValue(id,out CapturedProcess prior)) {
                if (prior.StartTicks != created) throw new InvalidOperationException("Descendant PID was reused");
                child.Dispose(); child = null;
              } else { captured[id] = new CapturedProcess { Handle = child, StartTicks = created }; child = null; verifiedCount++; }
              verified[id] = created; changed = true;
              operation = "sample-process-memory"; var item=captured[id]; item.Handle.Refresh();
              if (!item.Handle.HasExited && item.Handle.StartTime.ToUniversalTime().Ticks == created) {
                totalPrivate += item.Handle.PrivateMemorySize64;
                if (diagnosticFault == "timeout-after-sample" && item.Handle.ProcessName.Equals("node",StringComparison.OrdinalIgnoreCase)) diagnosticNodeChild = true;
              }
            } catch (ArgumentException) { /* Process vanished before its identity could be opened. */ }
            finally { if (child != null) { try { child.Dispose(); } catch (Exception error) { cleanupInspection=true; cleanupNotes.Add("unregistered handle disposal: " + error.GetType().Name); } } }
          }
        } while (changed);
        if (diagnosticFault == "timeout-after-sample" && diagnosticNodeChild) { stopReason = "controlled sampled-child timeout diagnostic"; break; }
        if (totalPrivate > peak) peak = totalPrivate;
        if (totalPrivate > 2L * 1024 * 1024 * 1024) { stopReason = "sampled owned-tree private bytes exceeded 2 GiB"; break; }
        if (clock.Elapsed.TotalSeconds >= 90) { stopReason = "90-second wall limit exceeded"; break; }
        Thread.Sleep(500);
        operation = "refresh-owned-root"; process.Refresh();
      }
      phase = "wait"; operation = "wait-for-owned-root";
      if (stopReason == null && !process.WaitForExit(5000) && !process.HasExited) throw new TimeoutException("Owned root did not exit within 5 seconds.");
      if (stopReason == null) { rootExited = process.HasExited; if (rootExited) exitCode = process.ExitCode; }
    } catch (Exception error) {
      primaryError = error;
    } finally {
      // Kill only verified captured identities and the root Process handle we
      // started. Do not recursively terminate unidentified descendants.
      var cleanupDeadline = Stopwatch.StartNew();
      if (started) {
        try {
          if (!process.HasExited) { process.Kill(); process.WaitForExit(Math.Max(0,5000-(int)cleanupDeadline.ElapsedMilliseconds)); }
          rootExited = process.HasExited;
          if (!rootExited) { cleanupResidual = true; cleanupNotes.Add("owned root did not exit"); }
          if (rootExited && exitCode == -1) exitCode = process.ExitCode;
        } catch (Exception error) { cleanupInspection = true; cleanupNotes.Add("owned root cleanup: " + error.GetType().Name); }
      }
      cleanupNotes.AddRange(CleanupCaptured(captured,cleanupDeadline,out bool childResidual,out bool childInspection,out bool childIdentity,out exitedCount));
      cleanupResidual |= childResidual; cleanupInspection |= childInspection; cleanupIdentity |= childIdentity;
      if (outTask != null && errTask != null) {
        try { Task.WaitAll(new[] { outTask, errTask }, 5000); drained = outTask.IsCompletedSuccessfully && errTask.IsCompletedSuccessfully; }
        catch (Exception error) { cleanupNotes.Add("output drain: " + error.GetType().Name + ": " + error.Message); }
        if (!drained) cleanupNotes.Add("output drain incomplete");
      }
      try { process.Dispose(); } catch (Exception error) { cleanupNotes.Add("root handle cleanup: " + error.GetType().Name + ": " + error.Message); }
    }
    if (primaryError != null || stopReason != null || cleanupNotes.Count != 0 || (started && !rootExited)) exitCode = -1;
    var native = primaryError as System.ComponentModel.Win32Exception;
    return new BoundedRunResult { ExitCode=exitCode, ElapsedSeconds=clock.Elapsed.TotalSeconds,
      PeakSampledPrivateBytes=peak, StopReason=stopReason, CleanupNotes=String.Join("; ",cleanupNotes),
      StandardOutput=stdout.Value, StandardError=stderr.Value,
      FailurePhase=primaryError == null ? null : phase, FailureOperation=primaryError == null ? null : operation,
      FailureType=primaryError?.GetType().Name, NativeErrorCode=native?.NativeErrorCode,
      OutputDrainComplete=drained, RootExited=rootExited, UnobservedDescendantsPossible=started,
      CleanupResidualObserved=cleanupResidual, CleanupInspectionFailed=cleanupInspection, CleanupIdentityUnverified=cleanupIdentity,
      VerifiedDescendantsCaptured=verifiedCount, CleanupDescendantsExited=exitedCount };
  }
}
'@

$resolvedExecutable = try { (Get-Command -Name $Executable -ErrorAction Stop).Source } catch { $Executable }
$diagnosticFault = [Environment]::GetEnvironmentVariable('QP_BOUNDED_TEST_FAULT')
if ($diagnosticFault -and $diagnosticFault -notin @('inspection','timeout','timeout-after-sample')) { throw 'Unsupported bounded launcher diagnostic fault.' }
$result = [Plan25ProcessTree]::Run((Get-Location).Path, $resolvedExecutable, $ArgumentVector, $diagnosticFault)
$result | ConvertTo-Json -Depth 3
if ($result.StopReason) { throw $result.StopReason }
if ($result.ExitCode -ne 0) { throw "Validation process exited with code $($result.ExitCode)." }

# Example invocations (run separately, only after explicit root clearance):
# .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe --test src/ui/apartment-view.test.mjs
# .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 cmd.exe /d /s /c '"npm run build"'
# .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe reports/development/plan-25-desk-phone-art-integration/browser-lifecycle.mjs
