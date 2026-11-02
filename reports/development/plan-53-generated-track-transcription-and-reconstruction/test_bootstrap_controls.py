"""Two bounded synthetic tests, only in a coordinated resource turn."""
import ctypes
from ctypes import wintypes as w
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import bootstrap_supervisor as supervisor
import bootstrap_watchdog as watchdog


class Controls(unittest.TestCase):
    def test_handle_allowlist(self):
        with tempfile.TemporaryDirectory() as folder:
            sentinel = open(Path(folder) / "sentinel", "wb")
            try:
                import msvcrt
                handle = msvcrt.get_osfhandle(sentinel.fileno())
                os.set_handle_inheritable(handle, True)
                code = ("import ctypes,pathlib,sys\n"
                        "k=ctypes.WinDLL('kernel32',use_last_error=True)\n"
                        "k.GetHandleInformation.argtypes=[ctypes.c_void_p,ctypes.POINTER(ctypes.c_ulong)]\n"
                        "f=ctypes.c_ulong()\n"
                        "try: ok=k.GetHandleInformation(int(sys.argv[1]),ctypes.byref(f))\n"
                        "except OSError as e:\n"
                        " if getattr(e,'winerror',None) != -1073741816: raise\n"
                        " ok=False\n"
                        "pathlib.Path('handle-result').write_text(str(bool(ok)))")
                result = supervisor.run([sys.executable, "-B", "-c", code, str(handle)], folder,
                                        4, 128*1024**2, 4*1024**2, 0, .1)
                log = (Path(folder) / "bootstrap-output.log").read_text(encoding="utf-8", errors="replace")
                self.assertEqual(result["root_exit_code"], 0, (result, log[:2048]))
                self.assertEqual(result["cleanup"], "root exited; job reports zero active processes")
                self.assertEqual((Path(folder)/"handle-result").read_text(), "False")
            finally:
                sentinel.close()

    def test_watchdog_terminates_owned_job(self):
        with tempfile.TemporaryDirectory() as folder:
            # Write PID and creation time for both the job root and its child.
            code = ("import ctypes,os,pathlib,subprocess,sys,time; "
                    "k=ctypes.WinDLL('kernel32',use_last_error=True); "
                    "k.GetProcessTimes.argtypes=[ctypes.c_void_p]+[ctypes.c_void_p]*4; "
                    "k.GetCurrentProcess.restype=ctypes.c_void_p; "
                    "p=subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)']); "
                    "a=[ctypes.c_ulonglong() for _ in range(4)]; b=[ctypes.c_ulonglong() for _ in range(4)]; "
                    "assert k.GetProcessTimes(k.GetCurrentProcess(),*[ctypes.byref(x) for x in a]); "
                    "assert k.GetProcessTimes(int(p._handle),*[ctypes.byref(x) for x in b]); "
                    "pathlib.Path('identities').write_text(f'{os.getpid()} {a[0].value} {p.pid} {b[0].value}'); time.sleep(30)")
            args = ["--workspace", folder, "--seconds", "9", "--memory-mib", "128", "--footprint-mib", "4", "--free-floor-mib", "0", sys.executable, "-B", "-c", code]
            result = watchdog.run(1, args)
            self.assertTrue(result["status"].startswith("watchdog timeout"), result)
            values = list(map(int, (Path(folder)/"identities").read_text().split()))
            k = ctypes.WinDLL("kernel32", use_last_error=True)
            k.OpenProcess.argtypes = [w.DWORD,w.BOOL,w.DWORD]; k.OpenProcess.restype = w.HANDLE
            k.GetProcessTimes.argtypes = [w.HANDLE]+[ctypes.c_void_p]*4
            k.WaitForSingleObject.argtypes = [w.HANDLE,w.DWORD]; k.WaitForSingleObject.restype = w.DWORD
            k.CloseHandle.argtypes = [w.HANDLE]
            for pid, created in zip(values[::2], values[1::2]):
                h = k.OpenProcess(0x00100000 | 0x1000, False, pid)
                if not h:
                    self.assertEqual(ctypes.get_last_error(), 87, "cannot inspect process")
                    continue
                try:
                    times = [ctypes.c_ulonglong() for _ in range(4)]
                    self.assertTrue(k.GetProcessTimes(h,*[ctypes.byref(t) for t in times]))
                    self.assertEqual(times[0].value, created, "PID reuse prevents proof")
                    self.assertEqual(k.WaitForSingleObject(h, 5000), 0, "owned process survived")
                finally:
                    k.CloseHandle(h)


if __name__ == "__main__":
    unittest.main()
