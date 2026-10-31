import importlib.util
import mimetypes
import os
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('preview_server', Path(__file__).with_name('preview_server.py'))
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)


class PreviewPaths(unittest.TestCase):
    def test_prefix_containment_and_queries(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.assertEqual(preview.resolve_request('/Quackpot/assets/app.js?v=1', root), root / 'assets' / 'app.js')
            self.assertEqual(preview.resolve_request('/Quackpot/', root), root)
            for request in ['/other/file', '/Quackpot/%2e%2e/secret', '/Quackpot/a%5cb', '/Quackpot/C:secret', '/Quackpot/%00']:
                self.assertIsNone(preview.resolve_request(request, root), request)

    def test_javascript_mime(self):
        self.assertEqual(mimetypes.guess_type('module.mjs')[0], 'text/javascript')
        self.assertEqual(mimetypes.guess_type('module.js')[0], 'text/javascript')

    def test_symlink_outside_is_rejected_when_supported(self):
        with tempfile.TemporaryDirectory() as base:
            root = Path(base) / 'dist'
            outside = Path(base) / 'outside'
            root.mkdir()
            outside.mkdir()
            try:
                os.symlink(outside, root / 'link', target_is_directory=True)
            except OSError as error:
                self.skipTest(f'creating a symlink is not available: {error}')
            self.assertIsNone(preview.resolve_request('/Quackpot/link/secret', root))


if __name__ == '__main__':
    unittest.main()
