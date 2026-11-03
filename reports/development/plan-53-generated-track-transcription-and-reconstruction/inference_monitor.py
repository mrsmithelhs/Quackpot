"""Bounded inference resource-policy logic; no model or firewall access.

No executable entry point. The future launcher must provide an owned-process
wait/terminate pair and a separately verified OS isolation boundary.
"""
import ctypes
from ctypes import wintypes
from pathlib import Path
import shutil
import subprocess
import time

GIB = 1024 ** 3


class MEMORYSTATUSEX(ctypes.Structure):
    _fields_ = [("dwLength",wintypes.DWORD),("dwMemoryLoad",wintypes.DWORD),
                ("ullTotalPhys",ctypes.c_ulonglong),("ullAvailPhys",ctypes.c_ulonglong),
                ("ullTotalPageFile",ctypes.c_ulonglong),("ullAvailPageFile",ctypes.c_ulonglong),
                ("ullTotalVirtual",ctypes.c_ulonglong),("ullAvailVirtual",ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual",ctypes.c_ulonglong)]


def physical_available():
    k=ctypes.WinDLL("kernel32",use_last_error=True)
    function=k.GlobalMemoryStatusEx
    function.argtypes=[ctypes.POINTER(MEMORYSTATUSEX)]; function.restype=wintypes.BOOL
    value=MEMORYSTATUSEX(); value.dwLength=ctypes.sizeof(value)
    if not function(ctypes.byref(value)): raise OSError(ctypes.get_last_error(),"GlobalMemoryStatusEx")
    return value.ullAvailPhys


def sample_live(workspace, tree_bytes, nvidia_smi):
    """Future Windows sampler; do not call before an approved resource turn."""
    executable=Path(nvidia_smi)
    if not executable.is_absolute() or not executable.is_file(): raise ValueError("nvidia-smi path unavailable")
    result=subprocess.run([str(executable),"--query-gpu=memory.total,memory.used","--format=csv,noheader,nounits"],
                          capture_output=True,text=True,timeout=3,check=True,creationflags=0x08000000)
    lines=result.stdout.strip().splitlines()
    if len(lines)!=1: raise ValueError("ambiguous GPU inventory")
    parts=[int(part.strip()) for part in lines[0].split(",")]
    if len(parts)!=2: raise ValueError("invalid GPU sample")
    return {"host_free_bytes":physical_available(),"disk_free_bytes":shutil.disk_usage(workspace).free,
            "workspace_bytes":tree_bytes(workspace),"gpu_total_mib":parts[0],"gpu_used_mib":parts[1]}


def valid_sample(value):
    keys=("host_free_bytes","disk_free_bytes","workspace_bytes","gpu_total_mib","gpu_used_mib")
    if not isinstance(value,dict) or any(type(value.get(key)) is not int or value[key]<0 for key in keys):
        raise ValueError("incomplete resource sample")
    if value["gpu_used_mib"]>value["gpu_total_mib"]: raise ValueError("invalid GPU sample")
    return value


def preflight(sample):
    value=valid_sample(sample)
    if value["host_free_bytes"]<16*GIB: raise ValueError("available host RAM below 16 GiB")
    if value["disk_free_bytes"]<30*GIB: raise ValueError("free disk below 30 GiB")
    if value["workspace_bytes"]>20*GIB: raise ValueError("workspace above 20 GiB")
    if value["gpu_total_mib"]-value["gpu_used_mib"]<6656: raise ValueError("free GPU memory below 6.5 GiB")
    if value["gpu_used_mib"]>=7168: raise ValueError("device GPU usage at or above 7 GiB")
    return value


def supervise(sample, launch, wait_owned, terminate_owned, now=time.monotonic):
    """Preflight then sample a single owned job; returns no cleanup claim.

    `wait_owned(1)` returns True after the job root exits. Caller must verify
    zero active owned processes separately. External watchdog and Windows job
    impose the hard wall and job-commit limits; polling is not a hard GPU cap.
    """
    start=now(); last=start; max_gap=0; peak_gpu=0; peak_workspace=0; min_host=None; count=0; launched=False
    try:
        initial=preflight(sample()); peak_gpu=initial["gpu_used_mib"]; peak_workspace=initial["workspace_bytes"]; min_host=initial["host_free_bytes"]
        sampled_at=now(); max_gap=max(max_gap,sampled_at-start); last=sampled_at
        # The launcher may create a child before raising. Require the cleanup
        # callback even on launch exceptions; it must tolerate no child.
        launched=True; launch()
        while True:
            finished=wait_owned(1)
            value=valid_sample(sample()); count+=1
            # Measure completed-sample intervals, including nvidia-smi and
            # filesystem scan latency. Sampling itself can exceed one second.
            current=now(); max_gap=max(max_gap,current-last); last=current
            peak_gpu=max(peak_gpu,value["gpu_used_mib"]); peak_workspace=max(peak_workspace,value["workspace_bytes"])
            min_host=min(min_host,value["host_free_bytes"])
            if value["gpu_used_mib"]>=7168: raise ValueError("sampled GPU usage reached 7 GiB")
            if value["host_free_bytes"]<4*GIB: raise ValueError("sampled available host RAM below 4 GiB emergency floor")
            if value["disk_free_bytes"]<30*GIB: raise ValueError("sampled free disk below floor")
            if value["workspace_bytes"]>20*GIB: raise ValueError("sampled workspace exceeded cap")
            if current-start>=900: raise TimeoutError("sampled 15-minute deadline")
            if finished:
                return {"status":"root exited", "samples":count,"max_gap_seconds":max_gap,
                        "sampled_peak_gpu_mib":peak_gpu,"sampled_peak_workspace_bytes":peak_workspace,"minimum_host_free_bytes":min_host,
                        "cleanup":"caller must independently verify owned job cleanup"}
    except BaseException as exc:
        cleanup="not launched"
        if launched:
            try:
                terminate_owned(); cleanup="termination requested; caller must verify cleanup"
            except Exception:
                cleanup="termination failed; cleanup unverified"
        if not isinstance(exc, Exception):
            if hasattr(exc, "add_note"):
                exc.add_note("Owned cleanup: " + cleanup)
            raise
        return {"status":"stopped", "reason":type(exc).__name__+": "+str(exc),"samples":count,
                "max_gap_seconds":max_gap,"sampled_peak_gpu_mib":peak_gpu,
                "sampled_peak_workspace_bytes":peak_workspace,"minimum_host_free_bytes":min_host,"cleanup":cleanup}
