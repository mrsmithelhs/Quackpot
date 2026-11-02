"""Synthetic, short process tests; run only in a root-cleared resource turn."""
import ctypes
from ctypes import wintypes
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest

PROBE = Path(__file__).with_name("job_probe.py")


def invoke(seconds, memory, code, *args):
    result = subprocess.run([sys.executable, "-B", str(PROBE), "--seconds", str(seconds),
                             "--memory-mib", str(memory), sys.executable, "-B", "-c", code, *args],
                            capture_output=True, text=True, timeout=10, check=True)
    return json.loads(result.stdout)


class JobProbeTests(unittest.TestCase):
    def test_normal_exit(self):
        result = invoke(3, 128, "pass")
        self.assertFalse(result["timed_out"])
        self.assertEqual(result["root_exit_code"], 0)

    def test_timeout_kills_child(self):
        with tempfile.TemporaryDirectory() as folder:
            pid_file = Path(folder) / "pid"
            code = ("import subprocess,sys,time,pathlib,ctypes; "
                    "p=subprocess.Popen([sys.executable,'-c','import time; time.sleep(30)']); "
                    "v=[ctypes.c_ulonglong() for _ in range(4)]; "
                    "k=ctypes.WinDLL('kernel32',use_last_error=True); "
                    "k.GetProcessTimes.argtypes=[ctypes.c_void_p]+[ctypes.c_void_p]*4; "
                    "assert k.GetProcessTimes(int(p._handle),*[ctypes.byref(x) for x in v]); "
                    "pathlib.Path(sys.argv[1]).write_text(str(p.pid)+' '+str(v[0].value)); time.sleep(30)")
            result = invoke(1, 128, code, str(pid_file))
            self.assertTrue(result["timed_out"])
            pid, created = map(int, pid_file.read_text().split())
            kernel = ctypes.WinDLL("kernel32", use_last_error=True)
            kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
            kernel.OpenProcess.restype = wintypes.HANDLE
            kernel.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
            kernel.WaitForSingleObject.restype = wintypes.DWORD
            kernel.CloseHandle.argtypes = [wintypes.HANDLE]
            kernel.GetProcessTimes.argtypes = [wintypes.HANDLE] + [ctypes.c_void_p] * 4
            handle = kernel.OpenProcess(0x00100000 | 0x1000, False, pid)
            if handle:
                try:
                    values = [ctypes.c_ulonglong() for _ in range(4)]
                    self.assertTrue(kernel.GetProcessTimes(handle, *[ctypes.byref(x) for x in values]))
                    self.assertEqual(values[0].value, created, "PID was reused; child cleanup cannot be established")
                    self.assertEqual(kernel.WaitForSingleObject(handle, 5000), 0, "child survived")
                finally:
                    kernel.CloseHandle(handle)
            else:
                self.assertEqual(ctypes.get_last_error(), 87, "could not verify child exit")

    def test_job_commit_limit(self):
        code = "import sys\ntry: x=bytearray(512*1024*1024)\nexcept MemoryError: sys.exit(42)\nsys.exit(0)"
        result = invoke(4, 128, code)
        self.assertFalse(result["timed_out"])
        self.assertEqual(result["root_exit_code"], 42, "allocation unexpectedly succeeded or process failed differently")


if __name__ == "__main__":
    unittest.main()
