"""Synthetic crop scheduling with a fake decoder; no audio or network."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import crop_adapter


class Reader:
    samplerate=48000; channels=2; format="MP3"; subtype="MPEG_LAYER_III"
    def __init__(self, short=False): self.short=short; self.seeked=None
    def __enter__(self): return self
    def __exit__(self,*args): return False
    def seek(self, frame): self.seeked=frame; return frame
    def read(self, frames, dtype, always_2d):
        assert self.seeked == 960000 and frames == 1200000 and dtype == "int16" and always_2d
        return range(frames-1 if self.short else frames)


class FakeSoundfile:
    def __init__(self,short=False): self.short=short
    def SoundFile(self,path,mode): return Reader(self.short)
    def write(self,stream,data,rate,format,subtype):
        assert len(data)==1200000 and rate==48000 and format=="WAV" and subtype=="PCM_16"
        stream.write(b"synthetic wav")


class CropFixtures(unittest.TestCase):
    def test_crop_bounds_hash_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder); source=root/"source.mp3"; source.write_bytes(b"synthetic original")
            out=root/"out"; out.mkdir(); expected=hashlib.sha256(source.read_bytes()).hexdigest()
            with patch.object(crop_adapter,"M1_SHA256",expected):
                result=crop_adapter.prepare(FakeSoundfile(),source,out)
            self.assertEqual((result["start_seconds"],result["end_seconds"],result["frames"]),(20,45,1200000))
            self.assertEqual(source.read_bytes(),b"synthetic original")
            self.assertEqual(json.loads((out/"crop-manifest.json").read_text())["output_sha256"],hashlib.sha256(b"synthetic wav").hexdigest())
            with patch.object(crop_adapter,"M1_SHA256",expected):
                with self.assertRaises(FileExistsError): crop_adapter.prepare(FakeSoundfile(),source,out)

    def test_mismatch_and_short_crop_stop(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder); source=root/"source.mp3"; source.write_bytes(b"synthetic")
            out=root/"out"; out.mkdir()
            with self.assertRaisesRegex(ValueError,"hash"): crop_adapter.prepare(FakeSoundfile(),source,out)
            with patch.object(crop_adapter,"M1_SHA256",hashlib.sha256(b"synthetic").hexdigest()):
                with self.assertRaisesRegex(ValueError,"short"): crop_adapter.prepare(FakeSoundfile(True),source,out)
            self.assertFalse((out/"m1-0020-0045.wav").exists())


if __name__ == "__main__": unittest.main()
