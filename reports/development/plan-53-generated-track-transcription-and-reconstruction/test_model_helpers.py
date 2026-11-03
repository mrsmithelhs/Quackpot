"""Small synthetic checks; no real model files or network. Coordinate before run."""
import hashlib
import io
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import acquire_beat_checkpoint as beat
import verify_owner_medium as medium
import verify_inference_inputs as preflight


def blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


class ModelHelpers(unittest.TestCase):
    def test_medium_config_and_weight_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); weights = b"synthetic weights"
            info = {"revision": medium.REVISION, "size_bytes": len(weights), "sha256_from_hub": hashlib.sha256(weights).hexdigest()}
            with self.assertRaises(FileNotFoundError):
                medium.verify(root, info)
            fields = {"dim":1024,"num_heads":16,"num_layers":24,"card":1395}
            raw = json.dumps(fields).encode().ljust(126,b" ")
            (root/"config.json").write_bytes(raw); (root/"model.safetensors").write_bytes(weights)
            with patch.object(medium, "CONFIG_BLOB", blob(raw)):
                result = medium.verify(root, info)
                self.assertEqual(result["model_sha256"], info["sha256_from_hub"])
                self.assertFalse(result["config_sha256_independently_published"])
                with self.assertRaisesRegex(ValueError,"revision"): medium.verify(root, dict(info, revision="wrong"))
                (root/"config.json").write_bytes(raw[:-1])
                with self.assertRaisesRegex(ValueError,"config"): medium.verify(root, info)
                (root/"config.json").write_bytes(raw)
                (root/"model.safetensors").write_bytes(b"altered")
                with self.assertRaises(ValueError): medium.verify(root, info)
            bad = json.dumps(dict(fields,dim=1536)).encode().ljust(126,b" ")
            (root/"config.json").write_bytes(bad)
            with patch.object(medium, "CONFIG_BLOB", blob(bad)):
                with self.assertRaisesRegex(ValueError,"architecture"): medium.verify(root, info)

    def test_beat_integrity_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            payload = b"synthetic checkpoint"; h1=hashlib.sha1(payload).hexdigest()
            metadata = {"beat_checkpoint":{"url":"https://cloud.cp.jku.at/test", "server_headers":{"Content-Length":str(len(payload)),"oc-checksum":"SHA1:"+h1}}}
            class Opener:
                def open(self, request, timeout): return io.BytesIO(payload)
            with patch.object(beat.Path, "read_text", return_value=json.dumps(metadata)), patch.object(beat.urllib.request, "build_opener", return_value=Opener()):
                beat.main(directory)
                target=Path(directory)/"torch-cache"/"hub"/"checkpoints"/"beat_this-final0.ckpt"
                self.assertEqual(target.read_bytes(),payload)
                with self.assertRaisesRegex(ValueError,"exists"): beat.main(directory)

    def test_beat_mismatch_and_partial_receipt_protection(self):
        payload = b"synthetic checkpoint"
        class Opener:
            def open(self, request, timeout): return io.BytesIO(payload)
        for kind in ("length", "hash", "partial", "receipt"):
            with self.subTest(kind=kind), tempfile.TemporaryDirectory() as directory:
                root=Path(directory); expected=len(payload) if kind != "length" else len(payload)+1
                digest=hashlib.sha1(payload).hexdigest() if kind != "hash" else "0"*40
                metadata={"beat_checkpoint":{"url":"https://cloud.cp.jku.at/test","server_headers":{"Content-Length":str(expected),"oc-checksum":"SHA1:"+digest}}}
                target=root/"torch-cache"/"hub"/"checkpoints"/"beat_this-final0.ckpt"
                if kind == "partial":
                    target.parent.mkdir(parents=True); target.with_name(target.name+".partial").write_bytes(b"preserve")
                if kind == "receipt": (root/"beat-integrity.json").write_text("preserve")
                with patch.object(beat.Path, "read_text", return_value=json.dumps(metadata)), patch.object(beat.urllib.request, "build_opener", return_value=Opener()):
                    with self.assertRaises(ValueError): beat.main(directory)
                self.assertFalse(target.exists())
                if kind in ("length","hash"):
                    self.assertEqual(target.with_name(target.name+".partial").read_bytes(),payload)
                if kind == "partial": self.assertEqual(target.with_name(target.name+".partial").read_bytes(),b"preserve")
                if kind == "receipt": self.assertEqual((root/"beat-integrity.json").read_text(),"preserve")

    def test_preflight_fails_on_missing_and_changed_beat(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); (root/"owner-medium").mkdir()
            payload=b"synthetic beat"; h1=hashlib.sha1(payload).hexdigest(); h256=hashlib.sha256(payload).hexdigest()
            metadata={"medium_model":{}, "beat_checkpoint":{"server_headers":{"Content-Length":str(len(payload)),"oc-checksum":"SHA1:"+h1}}}
            original_read_text = Path.read_text
            def fake_read(path, *args, **kwargs):
                if path.name == "candidate-metadata.json": return json.dumps(metadata)
                return original_read_text(path,*args,**kwargs)
            with patch.object(Path, "read_text", autospec=True, side_effect=fake_read), patch.object(preflight.verify_owner_medium, "verify", return_value={"synthetic":True}):
                with self.assertRaises(FileNotFoundError): preflight.verify(root)
                target=root/"torch-cache"/"hub"/"checkpoints"/"beat_this-final0.ckpt"
                target.parent.mkdir(parents=True); target.write_bytes(payload)
                with self.assertRaises(FileNotFoundError): preflight.verify(root)
                (root/"beat-integrity.json").write_text(json.dumps({"received_sha256":"0"*64,"sha256_independently_published":False}))
                with self.assertRaises(ValueError): preflight.verify(root)
                (root/"beat-integrity.json").write_text(json.dumps({"received_sha256":h256,"sha256_independently_published":False}))
                self.assertEqual(preflight.verify(root)["beat_received_sha256"],h256)
                target.write_bytes(b"changed")
                with self.assertRaises(ValueError): preflight.verify(root)

    def test_beat_reparse_parent_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); (root/"torch-cache").mkdir()
            metadata={"beat_checkpoint":{"url":"https://cloud.cp.jku.at/test","server_headers":{"Content-Length":"1","oc-checksum":"SHA1:"+"0"*40}}}
            original_stat=Path.stat
            def fake_stat(path,*args,**kwargs):
                if path.name == "torch-cache" and kwargs.get("follow_symlinks") is False:
                    return SimpleNamespace(st_file_attributes=0x400,st_mode=0)
                return original_stat(path,*args,**kwargs)
            with patch.object(Path,"read_text",return_value=json.dumps(metadata)), patch.object(Path,"stat",autospec=True,side_effect=fake_stat):
                with self.assertRaisesRegex(ValueError,"parent"): beat.main(directory)

    def test_beat_finalization_failure_preserves_partial(self):
        with tempfile.TemporaryDirectory() as directory:
            payload=b"synthetic checkpoint"; h1=hashlib.sha1(payload).hexdigest()
            metadata={"beat_checkpoint":{"url":"https://cloud.cp.jku.at/test","server_headers":{"Content-Length":str(len(payload)),"oc-checksum":"SHA1:"+h1}}}
            class Opener:
                def open(self, request, timeout): return io.BytesIO(payload)
            with patch.object(beat.Path,"read_text",return_value=json.dumps(metadata)), \
                 patch.object(beat.urllib.request,"build_opener",return_value=Opener()), \
                 patch.object(beat.os,"rename",side_effect=FileExistsError("synthetic race")):
                with self.assertRaises(FileExistsError): beat.main(directory)
            target=Path(directory)/"torch-cache"/"hub"/"checkpoints"/"beat_this-final0.ckpt"
            self.assertFalse(target.exists())
            self.assertEqual(target.with_name(target.name+".partial").read_bytes(),payload)

    def test_windows_rename_existing_file_preserves_both(self):
        with tempfile.TemporaryDirectory() as directory:
            source=Path(directory)/"partial"; target=Path(directory)/"target"
            source.write_bytes(b"partial data"); target.write_bytes(b"existing data")
            with self.assertRaises(FileExistsError): beat.os.rename(source,target)
            self.assertEqual(source.read_bytes(),b"partial data")
            self.assertEqual(target.read_bytes(),b"existing data")


if __name__ == "__main__":
    unittest.main()
