"""Synthetic, no-download stage-order/deadline/fail-fast test."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import install_stage


class StageTest(unittest.TestCase):
    def test_order_deadline_and_failure(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "resolved-requirements.txt").write_bytes(b"synthetic")
            executable = root / "python-3.12.13" / "python" / "python.exe"
            executable.parent.mkdir(parents=True); executable.touch()
            calls = []
            def invoke(remaining, args):
                calls.append((remaining, args))
                return {"status": "supervisor exited", "exit_code": 0}
            class Digest:
                def hexdigest(self):
                    import json
                    p = Path(install_stage.__file__).with_name("wheel-mapping.json")
                    return json.loads(p.read_text(encoding="utf-8-sig"))["requirements_sha256"]
            with patch.object(install_stage.hashlib, "sha256", return_value=Digest()), \
                 patch.object(install_stage.shutil, "which", return_value="C:\\synthetic\\uv.exe"), \
                 patch.object(install_stage.bootstrap_watchdog, "run", side_effect=invoke), \
                 patch.object(install_stage.time, "monotonic", side_effect=[100, 101, 102, 103, 104, 105]):
                self.assertEqual(install_stage.main(folder), 0)
            self.assertEqual([x[0] for x in calls], [1799, 1798, 1797, 1796, 1795])
            vectors = [" ".join(x[1]) for x in calls]
            for text, expected in zip(vectors, ("fetch_python.py", "verify_python.py", "venv", "pip sync", "verify_environment.py")):
                self.assertIn(expected, text)
            calls.clear()
            def fail_second(remaining, args):
                calls.append((remaining, args))
                return {"status": "supervisor exited", "exit_code": 1 if len(calls) == 2 else 0}
            with patch.object(install_stage.hashlib, "sha256", return_value=Digest()), \
                 patch.object(install_stage.shutil, "which", return_value="C:\\synthetic\\uv.exe"), \
                 patch.object(install_stage.bootstrap_watchdog, "run", side_effect=fail_second), \
                 patch.object(install_stage.time, "monotonic", side_effect=[100, 101, 102]):
                self.assertEqual(install_stage.main(folder), 1)
            self.assertEqual(len(calls), 2)


if __name__ == "__main__":
    unittest.main()
