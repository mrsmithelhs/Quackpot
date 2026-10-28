#!/usr/bin/env python3
"""Offline audio probe for the Plan 18 audition catalog (standard library only, no decoding of lossy audio).

    python tools/audio_probe.py <file-or-dir> [...]

Reports container, sample rate, channels, bit depth/bitrate and duration. Peak/RMS levels are measured
ONLY for uncompressed PCM/float WAV; Ogg Vorbis/Opus and MP3 durations come from container metadata and
their levels are reported as unmeasured (we do not claim loudness we did not measure).
Single process, reads one file at a time, prints compact lines.
"""
import array, math, os, struct, sys

MP3_BR_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
MP3_BR_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
MP3_SR = {3: [44100, 48000, 32000, 0], 2: [22050, 24000, 16000, 0], 0: [11025, 12000, 8000, 0]}


def _db(x):
    return round(20 * math.log10(x), 2) if x > 0 else None


def wav_info(path):
    b = open(path, "rb").read()
    if b[:4] != b"RIFF" or b[8:12] != b"WAVE":
        raise ValueError("not RIFF/WAVE")
    p, fmt, data, chunks = 12, None, None, []
    while p + 8 <= len(b):
        cid, sz = b[p:p + 4].decode("ascii", "replace"), struct.unpack_from("<I", b, p + 4)[0]
        if cid == "fmt ":
            tag, ch, sr, _, _, bits = struct.unpack_from("<HHIIHH", b, p + 8)
            if tag == 0xFFFE and sz >= 26:
                tag = struct.unpack_from("<H", b, p + 8 + 24)[0]
            fmt = (tag, ch, sr, bits)
        elif cid == "data":
            data = b[p + 8:p + 8 + min(sz, len(b) - p - 8)]
        else:
            chunks.append(cid)
        p += 8 + sz + (sz & 1)
    tag, ch, sr, bits = fmt
    n = len(data) // (ch * bits // 8)
    info = {"container": "WAV", "formatTag": tag, "channels": ch, "sampleRate": sr, "bitDepth": bits,
            "durationS": round(n / sr, 3), "otherChunks": chunks}
    if tag == 1 and bits in (8, 16, 24, 32):
        if bits == 16:
            s = array.array("h"); s.frombytes(data[:len(data) // 2 * 2]); full = 32768.0
        elif bits == 32:
            s = array.array("i"); s.frombytes(data[:len(data) // 4 * 4]); full = 2147483648.0
        elif bits == 8:
            s = [x - 128 for x in data]; full = 128.0
        else:
            s = [int.from_bytes(data[i:i + 3], "little", signed=True) for i in range(0, len(data) // 3 * 3, 3)]; full = 8388608.0
    elif tag == 3 and bits == 32:
        s = array.array("f"); s.frombytes(data[:len(data) // 4 * 4]); full = 1.0
    else:
        info["levels"] = "unmeasured (format not handled)"
        return info
    peak = max((abs(x) for x in s), default=0) / full
    rms = math.sqrt(sum(float(x) * x for x in s) / max(len(s), 1)) / full
    info["peakDbfs"], info["rmsDbfs"] = _db(peak), _db(rms)
    info["levels"] = "measured from PCM samples (peak/RMS, whole file)"
    return info


def ogg_info(path):
    b = open(path, "rb").read()
    info = {"container": "Ogg", "levels": "unmeasured (lossy; not decoded)"}
    i = b.find(b"\x01vorbis")
    if i >= 0:
        info.update(codec="Vorbis", channels=b[i + 11], sampleRate=struct.unpack_from("<I", b, i + 12)[0])
        pre = 0
    else:
        i = b.find(b"OpusHead")
        if i < 0:
            raise ValueError("unknown Ogg codec")
        info.update(codec="Opus", channels=b[i + 9], sampleRate=48000)
        pre = struct.unpack_from("<H", b, i + 10)[0]
    j = b.rfind(b"OggS")
    gran = struct.unpack_from("<q", b, j + 6)[0]
    info["durationS"] = round(max(gran - pre, 0) / info["sampleRate"], 3)
    return info


def mp3_info(path):
    b = open(path, "rb").read()
    p = 0
    if b[:3] == b"ID3":
        p = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9])
    frames, dur, first = 0, 0.0, None
    while p + 4 < len(b):
        if b[p] == 0xFF and (b[p + 1] & 0xE0) == 0xE0:
            ver, layer = (b[p + 1] >> 3) & 3, (b[p + 1] >> 1) & 3
            if ver != 1 and layer == 1:
                bri, sri, pad = b[p + 2] >> 4, (b[p + 2] >> 2) & 3, (b[p + 2] >> 1) & 1
                br = (MP3_BR_V1L3 if ver == 3 else MP3_BR_V2L3)[bri]
                sr = MP3_SR[ver][sri]
                if br and sr:
                    spf = 1152 if ver == 3 else 576
                    ln = int((144000 if ver == 3 else 72000) * br / sr) + pad
                    if first is None:
                        first = {"kbps": br, "sampleRate": sr, "channels": 1 if (b[p + 3] >> 6) == 3 else 2}
                    frames += 1; dur += spf / sr; p += ln
                    continue
        p += 1
    info = {"container": "MP3", "frames": frames, "durationS": round(dur, 3),
            "durationBasis": "summed MPEG frame durations; includes encoder delay/padding, not decoder-verified",
            "levels": "unmeasured (lossy; not decoded)"}
    info.update(first or {})
    return info


def probe(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".wav":
        return wav_info(path)
    if ext in (".ogg", ".oga"):
        return ogg_info(path)
    if ext == ".mp3":
        return mp3_info(path)
    raise ValueError("unsupported extension " + ext)


if __name__ == "__main__":
    targets = []
    for a in sys.argv[1:]:
        if os.path.isdir(a):
            for r, _, fs in os.walk(a):
                targets += [os.path.join(r, f) for f in sorted(fs)]
        else:
            targets.append(a)
    for t in targets:
        try:
            i = probe(t)
            lv = f"peak {i['peakDbfs']} rms {i['rmsDbfs']}" if "peakDbfs" in i else "levels unmeasured"
            print(f"{os.path.relpath(t)[-60:]:60} {i['container']:4} {i.get('sampleRate')}Hz {i.get('channels')}ch "
                  f"{i.get('bitDepth') or str(i.get('kbps', '')) + 'k' if i.get('kbps') else i.get('bitDepth', '')} {i['durationS']}s  {lv}")
        except Exception as e:
            print(t, "ERROR", e)
