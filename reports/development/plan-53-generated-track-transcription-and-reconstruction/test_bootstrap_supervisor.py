"""Harmless tests only during an orchestrator-cleared resource turn."""
import sys
import tempfile
import unittest
from unittest.mock import patch

import bootstrap_supervisor as s


class BootstrapTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)

    def run_probe(self, code, seconds=4):
        return s.run([sys.executable, "-B", "-c", code], self.temp.name, seconds,
                     128 * 1024**2, 4 * 1024**2, 0, .1)

    def test_normal(self):
        r = self.run_probe("pass")
        self.assertEqual((r["reason"], r["root_exit_code"]), ("root exited", 0))
        self.assertEqual(r["cleanup"], "root exited; job reports zero active processes")

    def test_timeout_with_owned_child(self):
        code = "import subprocess,sys,time; subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)']); time.sleep(30)"
        r = self.run_probe(code, seconds=1)
        self.assertEqual(r["reason"], "wall timeout")
        self.assertEqual(r["cleanup"], "root exited; job reports zero active processes")

    def test_monitor_exception_cleans_job(self):
        real = s.tree_bytes; calls = 0
        def fail_after_launch(root, counters=None):
            nonlocal calls
            calls += 1
            if calls > 1:
                raise OSError("synthetic monitor failure")
            return real(root, counters)
        with patch.object(s, "tree_bytes", side_effect=fail_after_launch):
            r = self.run_probe("import time;time.sleep(30)")
        self.assertEqual(r["reason"], "monitor or launch failure")
        self.assertEqual(r["cleanup"], "root exited; job reports zero active processes")


if __name__ == "__main__":
    unittest.main()
