"""Pinned M3/M5 excerpt adapter. Importing this module decodes nothing."""
import hashlib
import json
from pathlib import Path

SOURCES = {
    'm3-excerpt': ('M3-3-Polished-Groove.mp3','52331f4b539ce31d6c3141d89e8618852f3ad87b004d88ee0fdbd7faa5b3eb9b'),
    'm5-excerpt': ('M5-4-Ragtime-Question.mp3','439d250854162b437ca4981e67c1dda3d02832fbbbb45c2e84ced4b502c5aea0'),
}
SOURCE_DIR = Path(__file__).resolve().parents[3] / 'reports/development/plan-39-melody-reference-and-web-audio-laboratory/generated-references'
ENABLED_KIND = None  # Both one-time crops complete; further decoding requires clearance.

def sha256(path):
    digest=hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''): digest.update(block)
    return digest.hexdigest()

def prepare(soundfile, root_arg, kind):
    if kind not in SOURCES: raise ValueError('unknown excerpt')
    root=Path(root_arg).resolve(strict=True)
    parent=(root/'pilot-inputs').resolve(strict=True); out=(parent/kind).resolve(strict=True)
    if parent.parent!=root or out.parent!=parent or out.name!=kind or any(out.iterdir()): raise ValueError('unexpected or nonempty output')
    name, expected=SOURCES[kind]; source=(SOURCE_DIR/name).resolve(strict=True)
    before=sha256(source)
    if before != expected: raise ValueError('original source hash mismatch')
    with soundfile.SoundFile(str(source),'r') as reader:
        if (reader.samplerate,reader.channels)!=(48000,2): raise ValueError('unexpected source format')
        if reader.seek(960000)!=960000: raise ValueError('unexpected seek')
        data=reader.read(1200000,dtype='int16',always_2d=True)
        if len(data)!=1200000: raise ValueError('short crop')
        source_format,subtype=reader.format,reader.subtype
    if sha256(source)!=before: raise ValueError('source changed during decode')
    wav=out/'excerpt.wav'
    with wav.open('xb') as stream: soundfile.write(stream,data,48000,format='WAV',subtype='PCM_16')
    # Actual entry point independently reopens and verifies the written WAV.
    record={'schema':1,'source_id':kind,'source_sha256':before,'start_seconds':20,'end_seconds':45,
            'decoded_sample_rate':48000,'channels':2,'frames':1200000,'source_format':source_format,
            'source_subtype':subtype,'output_format':'WAV PCM_16','output_sha256':sha256(wav),
            'note':'Decoded from compressed source; no recovered detail.'}
    with (out/'crop-manifest.json').open('x',encoding='utf-8',newline='\n') as stream: json.dump(record,stream,indent=2); stream.write('\n')
    return record

def main():
    import argparse
    parser=argparse.ArgumentParser(); parser.add_argument('root'); parser.add_argument('kind',choices=tuple(SOURCES)); args=parser.parse_args()
    if args.kind!=ENABLED_KIND: raise RuntimeError('Crop disabled pending coordinated clearance')
    import os
    for key in ('OPENBLAS_NUM_THREADS','OMP_NUM_THREADS','MKL_NUM_THREADS','NUMEXPR_NUM_THREADS'): os.environ[key]='1'
    import local_network_guard
    guard=local_network_guard.Guard().install()
    import soundfile
    result=prepare(soundfile,args.root,args.kind)
    wav=Path(args.root)/'pilot-inputs'/args.kind/'excerpt.wav'
    with soundfile.SoundFile(str(wav),'r') as f:
        if (f.samplerate,f.channels,len(f),f.subtype)!=(48000,2,1200000,'PCM_16'): raise ValueError('written WAV validation failed')
    if sha256(wav)!=result['output_sha256']: raise ValueError('output hash changed')
    guard.check(); print(json.dumps(result))

if __name__=='__main__': main()
