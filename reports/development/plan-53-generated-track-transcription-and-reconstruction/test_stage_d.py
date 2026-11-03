"""Fake decoder and pre-ML Stage D validation tests."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import runner_wiring
import stage_d_crop
from test_crop_adapter import FakeSoundfile

class StageD(unittest.TestCase):
    def test_fixed_crop_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); (root/'pilot-inputs'/'m3-excerpt').mkdir(parents=True)
            source=root/'source.mp3'; source.write_bytes(b'fake source')
            spec={'m3-excerpt':('source.mp3',hashlib.sha256(b'fake source').hexdigest())}
            with patch.object(stage_d_crop,'SOURCE_DIR',root),patch.object(stage_d_crop,'SOURCES',spec):
                r=stage_d_crop.prepare(FakeSoundfile(),root,'m3-excerpt')
                self.assertEqual((r['source_id'],r['start_seconds'],r['end_seconds'],r['frames']),('m3-excerpt',20,45,1200000))
                self.assertEqual(source.read_bytes(),b'fake source')
                with self.assertRaises(ValueError): stage_d_crop.prepare(FakeSoundfile(),root,'m3-excerpt')

    def test_runner_rejects_wrong_manifest_before_ml(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); inputs=root/'pilot-inputs'/'m5-excerpt'; inputs.mkdir(parents=True)
            output=root/'pilot-runs'/'m5-excerpt'; output.mkdir(parents=True)
            wav=inputs/'excerpt.wav'; wav.write_bytes(b'fake wav')
            (inputs/'crop-manifest.json').write_text(json.dumps({'source_id':'m5-excerpt','source_sha256':'wrong',
                'start_seconds':20,'end_seconds':45,'output_sha256':hashlib.sha256(b'fake wav').hexdigest()}))
            with self.assertRaisesRegex(ValueError,'manifest'): runner_wiring.execute(root,wav,output,'m5-excerpt',lambda:False)

    def test_unknown_excerpt_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'unknown'): stage_d_crop.prepare(FakeSoundfile(),'.','unknown')

    def test_valid_manifest_reaches_guard_and_stops_before_ml(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); inputs=root/'pilot-inputs'/'m3-excerpt'; inputs.mkdir(parents=True)
            output=root/'pilot-runs'/'m3-excerpt'; output.mkdir(parents=True)
            wav=inputs/'excerpt.wav'; wav.write_bytes(b'fake wav')
            (inputs/'crop-manifest.json').write_text(json.dumps({'source_id':'m3-excerpt',
                'source_sha256':stage_d_crop.SOURCES['m3-excerpt'][1], 'start_seconds':20,'end_seconds':45,
                'output_sha256':hashlib.sha256(b'fake wav').hexdigest()}))
            env={'TORCH_HOME':str(root/'torch-cache'),'HF_HUB_OFFLINE':'1','HF_HUB_DISABLE_TELEMETRY':'1','DO_NOT_TRACK':'1'}
            with patch.object(runner_wiring.verify_inference_inputs,'verify'),patch.dict('os.environ',env):
                with self.assertRaisesRegex(RuntimeError,'unexpected access'): runner_wiring.execute(root,wav,output,'m3-excerpt',lambda:False)
