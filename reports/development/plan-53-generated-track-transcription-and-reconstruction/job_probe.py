"""Experimental Windows Job Object containment probe; not an ML supervisor.

Launch a harmless explicitly supplied command suspended, attach it to a new
kill-on-close job with a job commit limit, then resume. This prototype does not
monitor GPU, disk or network and must not be used for bootstrap or inference.
"""
import argparse
import ctypes as c
from ctypes import wintypes as w
import json
import subprocess
import sys
import time

if sys.platform != "win32":
    raise SystemExit("Windows only")
k = c.WinDLL("kernel32", use_last_error=True)


class BASIC(c.Structure):
    _fields_ = [("PerProcessUserTimeLimit", c.c_int64), ("PerJobUserTimeLimit", c.c_int64),
                ("LimitFlags", w.DWORD), ("MinimumWorkingSetSize", c.c_size_t),
                ("MaximumWorkingSetSize", c.c_size_t), ("ActiveProcessLimit", w.DWORD),
                ("Affinity", c.c_size_t), ("PriorityClass", w.DWORD), ("SchedulingClass", w.DWORD)]


class IO(c.Structure):
    _fields_ = [(x, c.c_uint64) for x in ("ReadOperationCount", "WriteOperationCount", "OtherOperationCount", "ReadTransferCount", "WriteTransferCount", "OtherTransferCount")]


class EXTENDED(c.Structure):
    _fields_ = [("BasicLimitInformation", BASIC), ("IoInfo", IO), ("ProcessMemoryLimit", c.c_size_t),
                ("JobMemoryLimit", c.c_size_t), ("PeakProcessMemoryUsed", c.c_size_t), ("PeakJobMemoryUsed", c.c_size_t)]


class STARTUP(c.Structure):
    _fields_ = [("cb", w.DWORD), ("lpReserved", w.LPWSTR), ("lpDesktop", w.LPWSTR), ("lpTitle", w.LPWSTR),
                ("dwX", w.DWORD), ("dwY", w.DWORD), ("dwXSize", w.DWORD), ("dwYSize", w.DWORD),
                ("dwXCountChars", w.DWORD), ("dwYCountChars", w.DWORD), ("dwFillAttribute", w.DWORD),
                ("dwFlags", w.DWORD), ("wShowWindow", w.WORD), ("cbReserved2", w.WORD),
                ("lpReserved2", c.c_void_p), ("hStdInput", w.HANDLE), ("hStdOutput", w.HANDLE), ("hStdError", w.HANDLE)]


class PROCESS(c.Structure):
    _fields_ = [("hProcess", w.HANDLE), ("hThread", w.HANDLE), ("dwProcessId", w.DWORD), ("dwThreadId", w.DWORD)]


def api(name, restype, argtypes):
    fn = getattr(k, name); fn.restype = restype; fn.argtypes = argtypes
    return fn


create_job = api("CreateJobObjectW", w.HANDLE, [c.c_void_p, w.LPCWSTR])
set_job = api("SetInformationJobObject", w.BOOL, [w.HANDLE, c.c_int, c.c_void_p, w.DWORD])
assign = api("AssignProcessToJobObject", w.BOOL, [w.HANDLE, w.HANDLE])
create = api("CreateProcessW", w.BOOL, [w.LPCWSTR, w.LPWSTR, c.c_void_p, c.c_void_p, w.BOOL, w.DWORD, c.c_void_p, w.LPCWSTR, c.POINTER(STARTUP), c.POINTER(PROCESS)])
resume = api("ResumeThread", w.DWORD, [w.HANDLE])
wait = api("WaitForSingleObject", w.DWORD, [w.HANDLE, w.DWORD])
terminate_job = api("TerminateJobObject", w.BOOL, [w.HANDLE, w.UINT])
terminate_process = api("TerminateProcess", w.BOOL, [w.HANDLE, w.UINT])
close = api("CloseHandle", w.BOOL, [w.HANDLE])
exit_code = api("GetExitCodeProcess", w.BOOL, [w.HANDLE, c.POINTER(w.DWORD)])


def check(ok, what):
    if not ok:
        raise OSError(c.get_last_error(), what)


def run(command, seconds, memory_bytes):
    job = create_job(None, None); check(job, "CreateJobObject")
    proc = PROCESS(); assigned = False; started = False
    try:
        limits = EXTENDED()
        limits.BasicLimitInformation.LimitFlags = 0x2000 | 0x200  # kill on close, job commit limit
        limits.JobMemoryLimit = memory_bytes
        check(set_job(job, 9, c.byref(limits), c.sizeof(limits)), "SetInformationJobObject")
        startup = STARTUP(); startup.cb = c.sizeof(startup)
        commandline = c.create_unicode_buffer(subprocess.list2cmdline(command))
        start = time.monotonic()
        check(create(None, commandline, None, None, False, 0x4 | 0x08000000, None, None, c.byref(startup), c.byref(proc)), "CreateProcess suspended")
        started = True
        check(assign(job, proc.hProcess), "AssignProcessToJobObject")
        assigned = True
        if resume(proc.hThread) == 0xFFFFFFFF:
            raise OSError(c.get_last_error(), "ResumeThread")
        result = wait(proc.hProcess, int(seconds * 1000))
        if result not in (0, 258):
            raise OSError(c.get_last_error(), "WaitForSingleObject")
        timed_out = result == 258
        # Terminate the entire job even after root exit: descendants may remain.
        check(terminate_job(job, 137), "TerminateJobObject")
        check(wait(proc.hProcess, 5000) == 0, "root termination wait")
        code = w.DWORD(); check(exit_code(proc.hProcess, c.byref(code)), "GetExitCodeProcess")
        return {"timed_out": timed_out, "root_exit_code": code.value, "elapsed_seconds": round(time.monotonic()-start, 3), "job_termination_requested": True}
    finally:
        if started and not assigned:
            terminate_process(proc.hProcess, 137)
            wait(proc.hProcess, 5000)
        close(job)
        if started:
            close(proc.hThread); close(proc.hProcess)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--seconds", type=float, required=True)
    p.add_argument("--memory-mib", type=int, required=True)
    p.add_argument("command", nargs=argparse.REMAINDER)
    args = p.parse_args()
    if not 0 < args.seconds <= 10 or not 64 <= args.memory_mib <= 512 or not args.command:
        p.error("probe limited to 10 seconds and 64–512 MiB; command required")
    print(json.dumps(run(args.command, args.seconds, args.memory_mib * 1024 * 1024)))
