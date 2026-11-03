"""Synthetic-only repair checks, run in a coordinated bounded turn."""
import unittest
import test_crop_adapter
import test_inference_controls

suite = unittest.TestSuite([
    unittest.defaultTestLoader.loadTestsFromModule(test_crop_adapter),
    unittest.defaultTestLoader.loadTestsFromModule(test_inference_controls),
])
if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
