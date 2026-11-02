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


def active(job):
    value = ACCOUNTING()
    j.check(query(job, 1, c.byref(value), c.sizeof(value), None), "QueryInformationJobObject")
    return value.ActiveProcesses


def tree_bytes(root):
    total = 0; count = 0; pending = [root]
    while pending:
        current = pending.pop()
        with os.scandir(current) as entries:
            for entry in entries:
                count += 1
                if count > 1_000_000:
                    raise ValueError("storage enumeration ceiling exceeded")
                info = entry.stat(follow_symlinks=False)
                if info.st_file_attributes & 0x400:  # reparse points can escape accounting
                    raise ValueError("reparse point in monitored workspace")
                if entry.is_dir(follow_symlinks=False):
                    pending.append(entry.path)
                elif entry.is_file(follow_symlinks=False):
                    total += info.st_size
                else:
                    raise ValueError("unsupported filesystem entry")
    return total


def run(command, root, seconds, memory, footprint, free_floor, sample_seconds=1):
    root = Path(root).resolve(strict=True)
    if not root.is_dir() or not command or not os.path.isabs(command[0]):
        raise ValueError("existing workspace and absolute executable required")
    job = j.create_job(None, None); j.check(job, "CreateJobObject")
    proc = j.PROCESS(); started = assigned = False; output = input_stream = None
    reason = "exception"; peak_disk = 0; gaps = []; samples = 0
    start = last = time.monotonic(); error = None; cleanup = "not verified"
    try:
        limits = j.EXTENDED(); limits.BasicLimitInformation.LimitFlags = 0x2000 | 0x200
        limits.JobMemoryLimit = memory
        j.check(j.set_job(job, 9, c.byref(limits), c.sizeof(limits)), "SetInformationJobObject")
        if tree_bytes(root) > footprint or shutil.disk_usage(root).free < free_floor:
            raise ValueError("disk preflight failed")
        startup = j.STARTUP(); startup.cb = c.sizeof(startup)
        # A dedicated new log avoids mixing runs. It may contain dependency
        # diagnostics, so stays local and is reviewed/redacted before sharing.
        output = open(root / "bootstrap-output.log", "xb", buffering=0)
        input_stream = open(os.devnull, "rb")
        output_handle = msvcrt.get_osfhandle(output.fileno())
        input_handle = msvcrt.get_osfhandle(input_stream.fileno())
        os.set_handle_inheritable(output_handle, True); os.set_handle_inheritable(input_handle, True)
        startup.dwFlags = 0x100
        startup.hStdInput = input_handle; startup.hStdOutput = output_handle; startup.hStdError = output_handle
        cmdline = c.create_unicode_buffer(subprocess.list2cmdline(command))
        # Explicit child environment keeps caches/temp inside the measured tree
        # and excludes inherited credentials and unreviewed UV settings.
        env = {k: os.environ[k] for k in ("SystemRoot", "WINDIR", "ComSpec", "PATH", "PATHEXT") if k in os.environ}
        env.update({"TEMP": str(root), "TMP": str(root), "UV_CACHE_DIR": str(root / "uv-cache"),
                    "UV_PYTHON_INSTALL_DIR": str(root / "python"), "UV_NO_CONFIG": "1",
                    "HF_HOME": str(root / "hf-cache"), "TORCH_HOME": str(root / "torch-cache")})
        environment = c.create_unicode_buffer("\0".join(f"{key}={value}" for key, value in sorted(env.items(), key=lambda p: p[0].upper())) + "\0\0")
        # Only explicitly prepared handles should be inheritable in this
        # single-threaded process; never pass credentials as arguments.
        j.check(j.create(command[0], cmdline, None, None, True, 0x4 | 0x400 | 0x08000000,
                         c.cast(environment, c.c_void_p), str(root), c.byref(startup), c.byref(proc)), "CreateProcess suspended")
        started = True
        os.set_handle_inheritable(output_handle, False); os.set_handle_inheritable(input_handle, False)
        j.check(j.assign(job, proc.hProcess), "AssignProcessToJobObject"); assigned = True
        if j.resume(proc.hThread) == 0xFFFFFFFF:
            raise OSError(c.get_last_error(), "ResumeThread")
        reason = "root exited"
        while True:
            result = j.wait(proc.hProcess, int(sample_seconds * 1000))
            if result not in (0, 258):
                raise OSError(c.get_last_error(), "WaitForSingleObject")
            now = time.monotonic(); gaps.append(round(now - last, 3)); last = now
            size = tree_bytes(root); peak_disk = max(peak_disk, size); samples += 1
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
            j.close(job)
            if started:
                j.close(proc.hThread); j.close(proc.hProcess)
            if output is not None: output.close()
            if input_stream is not None: input_stream.close()
    return {"reason": reason, "error": error, "root_exit_code": code.value if started and 'code' in locals() else None,
            "elapsed_seconds": round(time.monotonic()-start, 3), "sample_count": samples,
            "max_sample_gap_seconds": max(gaps, default=None), "sampled_peak_workspace_bytes": peak_disk,
            "host_memory_limit_bytes": memory, "cleanup": cleanup}


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--workspace", required=True)
    p.add_argument("--seconds", type=int, required=True)
    p.add_argument("--memory-mib", type=int, required=True)
    p.add_argument("--footprint-mib", type=int, required=True)
    p.add_argument("--free-floor-mib", type=int, required=True)
    p.add_argument("command", nargs=argparse.REMAINDER)
    a = p.parse_args()
    if not 0 < a.seconds <= 1800 or not 64 <= a.memory_mib <= 4096 or not 1 <= a.footprint_mib <= 20480 or a.free_floor_mib < 0:
        p.error("outside bootstrap limits")
    result = run(a.command, a.workspace, a.seconds, a.memory_mib*1024**2, a.footprint_mib*1024**2, a.free_floor_mib*1024**2)
    print(json.dumps(result))
    sys.exit(0 if result['error'] is None and result['root_exit_code'] == 0 and not result['cleanup'].startswith('UNVERIFIED') else 1)
