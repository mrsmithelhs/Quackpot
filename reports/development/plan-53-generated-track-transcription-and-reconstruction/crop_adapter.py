"""Proposed bounded audio crop adapter. No decoder imported at module load.

Only a future coordinated caller may provide an approved soundfile adapter and
run it; this module has no executable entry point.
"""
import hashlib
import json
from pathlib import Path

M1_SHA256 = "55c4735cc709157ef6114520ef1653227517cbb9bb13e9837709079eb1d1d538"


def sha256(path):
    result=hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1024*1024),b""): result.update(block)
    return result.hexdigest()


def prepare(soundfile, source, output_dir, expected_hash=M1_SHA256):
    source = Path(source).resolve(strict=True); out = Path(output_dir).resolve(strict=True)
    if not out.is_dir(): raise ValueError("output directory unavailable")
    wav = out / "m1-0020-0045.wav"; manifest = out / "crop-manifest.json"
    if wav.exists() or manifest.exists(): raise FileExistsError("crop outputs already exist")
    before = sha256(source)
    if before != expected_hash: raise ValueError("original M1 hash mismatch")
    with soundfile.SoundFile(str(source), "r") as reader:
        rate, channels = reader.samplerate, reader.channels
        if rate != 48000 or channels != 2: raise ValueError("unexpected source format")
        start, frames = 20 * rate, 25 * rate
        if reader.seek(start) != start: raise ValueError("decoder seek did not match requested start")
        data = reader.read(frames, dtype="int16", always_2d=True)
        if len(data) != frames: raise ValueError("short decoded crop")
        source_format, source_subtype = reader.format, reader.subtype
    if sha256(source) != before: raise ValueError("original changed during decoding")
    # Exclusive file creation prevents silent replacement; failures may leave
    # a partial WAV which must be preserved and reviewed, not auto-retried.
    with wav.open("xb") as stream:
        soundfile.write(stream, data, rate, format="WAV", subtype="PCM_16")
    record = {"schema":1,"source_id":"M1","source_sha256":before,"start_seconds":20,
              "end_seconds":45,"decoded_sample_rate":rate,"channels":channels,"frames":frames,
              "source_format":source_format,"source_subtype":source_subtype,"output_format":"WAV PCM_16",
              "output_sha256":sha256(wav),"note":"Decoded from compressed source; no upsampling or recovered detail."}
    with manifest.open("x",encoding="utf-8",newline="\n") as stream:
        json.dump(record,stream,indent=2); stream.write("\n")
    return record
