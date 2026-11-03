"""Absolute-script entry for the two synthetic fixture modules."""
import unittest
import test_crop_adapter
import test_midi_events

suite = unittest.TestSuite([
    unittest.defaultTestLoader.loadTestsFromModule(test_crop_adapter),
    unittest.defaultTestLoader.loadTestsFromModule(test_midi_events),
])
if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
