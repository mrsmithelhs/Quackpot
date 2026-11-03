"""Report-local future runner wiring; no executable entry point.

Actual use is prohibited until root reviews the bounded launcher, resource
controls and final input. This is not a network sandbox.
"""
import hashlib
import json
import os
from pathlib import Path

import single_pass_core
import verify_inference_inputs

CONTROL_SHA256 = "7035dc984a07e2ad704833bff28a2402d80fc3ec13bc07a911b2225d0505b723"


def file_hash(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1024*1024), b""): digest.update(block)
    return digest.hexdigest()


def execute(root_arg, input_path, output_dir, kind, access_check):
    """Wire one preverified input to one model pass after external controls.

    The audit guard records Python-visible attempts; it cannot observe all
    native or OS activity and is not a containment boundary.
    """
    root = Path(root_arg).resolve(strict=True)
    input_file = Path(input_path).resolve(strict=True)
    output = Path(output_dir).resolve(strict=True)
    expected_output_parent = (root / "pilot-runs").resolve(strict=True)
    if output.parent != expected_output_parent or kind not in ("m1-excerpt", "known-score") or output.name != kind:
        raise ValueError("output must be the designated pilot directory")
    if any(output.iterdir()): raise ValueError("pilot output must be empty")
    if kind == "m1-excerpt":
        expected = root / "pilot-inputs" / "m1-0020-0045.wav"
        manifest = json.loads((expected.parent / "crop-manifest.json").read_text(encoding="utf-8"))
        if manifest.get("source_sha256") != "55c4735cc709157ef6114520ef1653227517cbb9bb13e9837709079eb1d1d538" or (manifest.get("start_seconds"),manifest.get("end_seconds")) != (20,45):
            raise ValueError("unexpected crop manifest")
        if input_file != expected.resolve(strict=True) or file_hash(input_file) != manifest.get("output_sha256"):
            raise ValueError("crop path or hash mismatch")
    else:
        if file_hash(input_file) != CONTROL_SHA256: raise ValueError("known-score WAV hash mismatch")
    verify_inference_inputs.verify(root)
    torch_home = os.environ.get("TORCH_HOME")
    if not torch_home or Path(torch_home).resolve() != root / "torch-cache":
        raise ValueError("unexpected Torch cache")
    if any(os.environ.get(k) != '1' for k in ('HF_HUB_OFFLINE','HF_HUB_DISABLE_TELEMETRY','DO_NOT_TRACK')): raise ValueError('offline/telemetry environment missing')
    if not callable(access_check) or access_check() is not True: raise RuntimeError('unexpected access detected')
    # These imports and all GPU/model operations are deliberately unreachable
    # from a module import or synthetic test; real invocation remains gated.
    import torch
    from muscriptor import TranscriptionModel
    from muscriptor.events import NoteStartEvent, NoteEndEvent, ProgressEvent
    from muscriptor.utils.midi import ExportOptions, resolve_grid
    if not torch.cuda.is_available(): raise RuntimeError("CUDA unavailable; no CPU fallback")
    model = TranscriptionModel.load_model(root / "owner-medium" / "model.safetensors", device="cuda:0", dtype="float32")
    options = ExportOptions(bpm=None, beats_per_bar=None, first_downbeat=None, tempo_map=None,
                            beat_scale=1.0, quantize=False, subdivision=None, strength=1.0,
                            fill_gaps=0.0, trim_leading_bars=False)
    access_check()
    result = single_pass_core.run(model, input_file, output, NoteStartEvent, NoteEndEvent, ProgressEvent, options, resolve_grid)
    access_check()
    return result
