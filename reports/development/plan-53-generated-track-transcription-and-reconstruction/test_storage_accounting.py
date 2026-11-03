"""Focused synthetic accounting checks; run in a coordinated resource turn."""
from pathlib import Path
import tempfile
import stat
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

import bootstrap_supervisor as supervisor


class StorageAccounting(unittest.TestCase):
    def test_vanished_descendant_and_real_failures(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            vanished = MagicMock()
            vanished.stat.side_effect = FileNotFoundError("synthetic vanished entry")
            scan = MagicMock(); scan.__enter__.return_value = iter([vanished])
            counters = {}
            with patch.object(supervisor.os, "scandir", return_value=scan):
                self.assertEqual(supervisor.tree_bytes(root, counters), 0)
            self.assertEqual(counters["vanished_descendants"], 1)
            denied = MagicMock(); denied.stat.side_effect = PermissionError("synthetic denied entry")
            scan = MagicMock(); scan.__enter__.return_value = iter([denied])
            with patch.object(supervisor.os, "scandir", return_value=scan):
                with self.assertRaises(PermissionError):
                    supervisor.tree_bytes(root)
            with self.assertRaises(FileNotFoundError):
                supervisor.tree_bytes(root / "missing-root")

            # The real failure: a directory was stat'ed, queued, then removed
            # before scandir. An existing file must still contribute its bytes.
            gone_dir = MagicMock(); gone_dir.path = str(root / "gone")
            gone_dir.stat.return_value = SimpleNamespace(st_file_attributes=0, st_mode=stat.S_IFDIR, st_size=0)
            kept_file = MagicMock(); kept_file.path = str(root / "kept")
            kept_file.stat.return_value = SimpleNamespace(st_file_attributes=0, st_mode=stat.S_IFREG, st_size=173)
            first = MagicMock(); first.__enter__.return_value = iter([gone_dir, kept_file])
            counters = {}
            with patch.object(supervisor.os, "scandir", side_effect=[first, FileNotFoundError("queued directory vanished")]):
                self.assertEqual(supervisor.tree_bytes(root, counters), 173)
            self.assertEqual(counters["vanished_descendants"], 1)

            original = supervisor.os.stat(root, follow_symlinks=False)
            changed = SimpleNamespace(st_dev=original.st_dev, st_ino=original.st_ino + 1,
                                      st_file_attributes=0, st_mode=stat.S_IFDIR)
            empty = MagicMock(); empty.__enter__.return_value = iter([])
            with patch.object(supervisor.os, "stat", side_effect=[original, changed]), \
                 patch.object(supervisor.os, "scandir", return_value=empty):
                with self.assertRaisesRegex(ValueError, "root changed"):
                    supervisor.tree_bytes(root)
            reparse = SimpleNamespace(st_dev=original.st_dev, st_ino=original.st_ino,
                                      st_file_attributes=0x400, st_mode=stat.S_IFDIR)
            with patch.object(supervisor.os, "stat", return_value=reparse):
                with self.assertRaisesRegex(ValueError, "root is not"):
                    supervisor.tree_bytes(root)


if __name__ == "__main__":
    unittest.main()
