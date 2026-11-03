"""Proposed bounded Windows bootstrap supervisor. NOT CLEARED FOR BOOTSTRAP.

This implementation still needs coordinated synthetic tests and root review.
It does not enforce inference network isolation and must not run inference.
"""
import argparse
import ctypes as c
from ctypes import wintypes as w
import json
import msvcrt
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import time

import job_probe as j

GiB = 1024 ** 3


class ACCOUNTING(c.Structure):
    _fields_ = [("TotalUserTime", c.c_int64), ("TotalKernelTime", c.c_int64),
                ("ThisPeriodTotalUserTime", c.c_int64), ("ThisPeriodTotalKernelTime", c.c_int64),
                ("TotalPageFaultCount", w.DWORD), ("TotalProcesses", w.DWORD),
                ("ActiveProcesses", w.DWORD), ("TotalTerminatedProcesses", w.DWORD)]


query = j.api("QueryInformationJobObject", w.BOOL, [w.HANDLE, c.c_int, c.c_void_p, w.DWORD, c.c_void_p])
init_attributes = j.api("InitializeProcThreadAttributeList", w.BOOL, [c.c_void_p, w.DWORD, w.DWORD, c.POINTER(c.c_size_t)])
update_attribute = j.api("UpdateProcThreadAttribute", w.BOOL, [c.c_void_p, w.DWORD, c.c_size_t, c.c_void_p, c.c_size_t, c.c_void_p, c.c_void_p])
delete_attributes = j.api("DeleteProcThreadAttributeList", None, [c.c_void_p])


class STARTUPEX(c.Structure):
    _fields_ = [("StartupInfo", j.STARTUP), ("lpAttributeList", c.c_void_p)]


def active(job):
    value = ACCOUNTING()
    j.check(query(job, 1, c.byref(value), c.sizeof(value), None), "QueryInformationJobObject")
    return value.ActiveProcesses


def tree_bytes(root, counters=None):
    # Root disappearance/replacement is a failure; a descendant disappearing
    # during an active uv cache update is expected and contributes no bytes to
    # this sample. This remains sampled, not an atomic filesystem snapshot.
    root_info = os.stat(root, follow_symlinks=False)
    if root_info.st_file_attributes & 0x400 or not stat.S_ISDIR(root_info.st_mode):
        raise ValueError("workspace root is not a normal directory")
    identity = (root_info.st_dev, root_info.st_ino)
    total = 0; count = 0; pending = [(root, True)]
    vanished = 0
    while pending:
        current, is_root = pending.pop()
        try:
            with os.scandir(current) as entries:
                for entry in entries:
                    count += 1
                    if count > 1_000_000:
                        raise ValueError("storage enumeration ceiling exceeded")
                    try:
                        info = entry.stat(follow_symlinks=False)
                    except FileNotFoundError:
                        vanished += 1
                        continue
                    if info.st_file_attributes & 0x400:
                        raise ValueError("reparse point in monitored workspace")
                    if stat.S_ISDIR(info.st_mode):
                        pending.append((entry.path, False))
                    elif stat.S_ISREG(info.st_mode):
                        total += info.st_size
                    else:
                        raise ValueError("unsupported filesystem entry")
        except FileNotFoundError:
            if is_root:
                raise
            vanished += 1
    final = os.stat(root, follow_symlinks=False)
    if (final.st_dev, final.st_ino) != identity or final.st_file_attributes & 0x400:
        raise ValueError("workspace root changed during accounting")
    if counters is not None:
        counters["vanished_descendants"] = counters.get("vanished_descendants", 0) + vanished
    return total


def run(command, root, seconds, memory, footprint, free_floor, sample_seconds=1, max_active=0, resource_guard=None, log_dir=None):
    root = Path(root).resolve(strict=True)
    if not root.is_dir() or not command or not os.path.isabs(command[0]):
        raise ValueError("existing workspace and absolute executable required")
    job = j.create_job(None, None); j.check(job, "CreateJobObject")
    proc = j.PROCESS(); started = assigned = False; output = input_stream = None; attributes = None; attributes_ready = False
    reason = "exception"; peak_disk = 0; gaps = []; samples = 0; scan_counters = {}
    start = last = time.monotonic(); error = None; cleanup = "not verified"
    try:
        limits = j.EXTENDED(); limits.BasicLimitInformation.LimitFlags = 0x2000 | 0x200
        if max_active:
            if not 1 <= max_active <= 2: raise ValueError("active-process limit outside reviewed range")
            limits.BasicLimitInformation.LimitFlags |= 0x8
            limits.BasicLimitInformation.ActiveProcessLimit = max_active
        limits.JobMemoryLimit = memory
        j.check(j.set_job(job, 9, c.byref(limits), c.sizeof(limits)), "SetInformationJobObject")
        if tree_bytes(root) > footprint or shutil.disk_usage(root).free < free_floor:
            raise ValueError("disk preflight failed")
        if resource_guard is not None:
            resource_guard.before_launch()
        startup = STARTUPEX(); startup.StartupInfo.cb = c.sizeof(startup)
        # A dedicated new log avoids mixing runs. It may contain dependency
        # diagnostics, so stays local and is reviewed/redacted before sharing.
        log_parent = root if log_dir is None else Path(log_dir).resolve(strict=True)
        if log_parent != root and root not in log_parent.parents: raise ValueError('log directory outside workspace')
        output = open(log_parent / "bootstrap-output.log", "xb", buffering=0)
        input_stream = open(os.devnull, "rb")
        output_handle = msvcrt.get_osfhandle(output.fileno())
        input_handle = msvcrt.get_osfhandle(input_stream.fileno())
        os.set_handle_inheritable(output_handle, True); os.set_handle_inheritable(input_handle, True)
        startup.StartupInfo.dwFlags = 0x100
        startup.StartupInfo.hStdInput = input_handle; startup.StartupInfo.hStdOutput = output_handle; startup.StartupInfo.hStdError = output_handle
        size = c.c_size_t()
        init_attributes(None, 2, 0, c.byref(size))
        if not size.value:
            raise OSError(c.get_last_error(), "attribute list size")
        buffer = c.create_string_buffer(size.value); attributes = c.cast(buffer, c.c_void_p)
        j.check(init_attributes(attributes, 2, 0, c.byref(size)), "InitializeProcThreadAttributeList")
        attributes_ready = True
        handles = (w.HANDLE * 2)(input_handle, output_handle)
        jobs = (w.HANDLE * 1)(job)
        j.check(update_attribute(attributes, 0, 0x20002, c.cast(handles, c.c_void_p), c.sizeof(handles), None, None), "handle allowlist")
        # Atomic job assignment avoids a suspended unowned child if the outer
        # watchdog kills this supervisor between creation and assignment.
        j.check(update_attribute(attributes, 0, 0x2000D, c.cast(jobs, c.c_void_p), c.sizeof(jobs), None, None), "job list")
        startup.lpAttributeList = attributes
        cmdline = c.create_unicode_buffer(subprocess.list2cmdline(command))
        # Explicit child environment keeps caches/temp inside the measured tree
        # and excludes inherited credentials and unreviewed UV settings.
        env = {k: os.environ[k] for k in ("SystemRoot", "WINDIR", "ComSpec", "PATH", "PATHEXT") if k in os.environ}
        env.update({"TEMP": str(root), "TMP": str(root), "UV_CACHE_DIR": str(root / "uv-cache"),
                    "UV_PYTHON_INSTALL_DIR": str(root / "python"), "UV_NO_CONFIG": "1",
                    "HF_HOME": str(root / "hf-cache"), "TORCH_HOME": str(root / "torch-cache"),
                    "HF_HUB_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1", "DO_NOT_TRACK": "1"})
        environment = c.create_unicode_buffer("\0".join(f"{key}={value}" for key, value in sorted(env.items(), key=lambda p: p[0].upper())) + "\0\0")
        # Explicit allowlist, and atomic job assignment at process creation.
        j.check(j.create(command[0], cmdline, None, None, True, 0x4 | 0x400 | 0x08000000 | 0x80000,
                         c.cast(environment, c.c_void_p), str(root), c.cast(c.byref(startup), c.POINTER(j.STARTUP)), c.byref(proc)), "CreateProcess suspended")
        started = assigned = True
        os.set_handle_inheritable(output_handle, False); os.set_handle_inheritable(input_handle, False)
        if j.resume(proc.hThread) == 0xFFFFFFFF:
            raise OSError(c.get_last_error(), "ResumeThread")
        reason = "root exited"
        while True:
            result = j.wait(proc.hProcess, int(sample_seconds * 1000))
            if result not in (0, 258):
                raise OSError(c.get_last_error(), "WaitForSingleObject")
            now = time.monotonic(); gaps.append(round(now - last, 3)); last = now
            size = tree_bytes(root, scan_counters); peak_disk = max(peak_disk, size); samples += 1
            if resource_guard is not None:
                resource_guard.on_sample()
            if os.fstat(output.fileno()).st_size > 1024**2:
                reason = "sampled diagnostic log exceeded 1 MiB"; break
            if size > footprint:
                reason = "sampled footprint exceeded"; break
            if shutil.disk_usage(root).free < free_floor:
                reason = "sampled free disk below floor"; break
            if now - start >= seconds:
                reason = "wall timeout"; break
            if result == 0:
                break
        code = w.DWORD(); j.check(j.exit_code(proc.hProcess, c.byref(code)), "GetExitCodeProcess")
        error = None if reason == "root exited" else reason
    except Exception as exc:
        error = type(exc).__name__ + ": " + str(exc)
        reason = "monitor or launch failure"
    finally:
        try:
            if started and not assigned:
                j.check(j.terminate_process(proc.hProcess, 137), "terminate unassigned suspended root")
                j.check(j.wait(proc.hProcess, 5000) == 0, "unassigned root termination wait")
                cleanup = "unassigned root exited"
            elif assigned:
                j.check(j.terminate_job(job, 137), "TerminateJobObject")
                j.check(j.wait(proc.hProcess, 5000) == 0, "root termination wait")
                deadline = time.monotonic() + 5
                while active(job) and time.monotonic() < deadline:
                    time.sleep(.1)
                if active(job):
                    raise RuntimeError("owned job still has active processes")
                cleanup = "root exited; job reports zero active processes"
            else:
                cleanup = "no process launched"
        except Exception as exc:
            cleanup = "UNVERIFIED: " + type(exc).__name__
            error = error or "cleanup failed"
        finally:
            if attributes_ready: delete_attributes(attributes)
            j.close(job)
            if started:
                j.close(proc.hThread); j.close(proc.hProcess)
            if output is not None: output.close()
            if input_stream is not None: input_stream.close()
    return {"reason": reason, "error": error, "root_exit_code": code.value if started and 'code' in locals() else None,
            "elapsed_seconds": round(time.monotonic()-start, 3), "sample_count": samples,
            "max_sample_gap_seconds": max(gaps, default=None), "sampled_peak_workspace_bytes": peak_disk,
            "vanished_descendants": scan_counters.get("vanished_descendants", 0),
            "host_memory_limit_bytes": memory, "cleanup": cleanup,
            "resource_guard": resource_guard.report() if resource_guard is not None else None}


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--workspace", required=True)
    p.add_argument("--seconds", type=int, required=True)
    p.add_argument("--memory-mib", type=int, required=True)
    p.add_argument("--footprint-mib", type=int, required=True)
    p.add_argument("--free-floor-mib", type=int, required=True)
    p.add_argument("--max-active", type=int, default=0)
    p.add_argument("--log-dir")
    p.add_argument("command", nargs=argparse.REMAINDER)
    a = p.parse_args()
    if not 0 < a.seconds <= 1800 or not 64 <= a.memory_mib <= 4096 or not 1 <= a.footprint_mib <= 20480 or a.free_floor_mib < 0 or not 0 <= a.max_active <= 2:
        p.error("outside bootstrap limits")
    result = run(a.command, a.workspace, a.seconds, a.memory_mib*1024**2, a.footprint_mib*1024**2, a.free_floor_mib*1024**2, max_active=a.max_active, log_dir=a.log_dir)
    print(json.dumps(result))
    sys.exit(0 if result['error'] is None and result['root_exit_code'] == 0 and not result['cleanup'].startswith('UNVERIFIED') else 1)
