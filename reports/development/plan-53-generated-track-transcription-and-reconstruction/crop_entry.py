"""Proposed local crop command; disabled pending explicit orchestration clearance."""
import argparse
import os
from pathlib import Path
import local_network_guard

ROOT_CLEARED = False  # One-time crop complete; a further run requires new clearance.
SOURCE = Path(__file__).resolve().parents[3] / 'reports/development/plan-39-melody-reference-and-web-audio-laboratory/generated-references/M1-1-Miniature-Paper-Toy-World.mp3'

def prepare(root):
    root=Path(root).resolve(strict=True)
    output=(root/'pilot-inputs').resolve(strict=True)
    if output.parent != root: raise ValueError('pilot input directory outside workspace')
    thread_vars=('OPENBLAS_NUM_THREADS','OMP_NUM_THREADS','MKL_NUM_THREADS','NUMEXPR_NUM_THREADS')
    for name in thread_vars: os.environ[name]='1'
    print('crop thread settings: ' + ', '.join(name+'='+os.environ[name] for name in thread_vars), flush=True)
    guard=local_network_guard.Guard().install()
    import soundfile
    import crop_adapter
    result=crop_adapter.prepare(soundfile,SOURCE,output)
    with soundfile.SoundFile(str(output/'m1-0020-0045.wav'), 'r') as audio:
        if (audio.samplerate,audio.channels,len(audio),audio.subtype)!=(48000,2,1200000,'PCM_16'):
            raise ValueError('written WAV format/frame validation failed')
    if crop_adapter.sha256(output/'m1-0020-0045.wav') != result['output_sha256']:
        raise ValueError('written WAV hash changed')
    guard.check()
    return result

def main():
    if not ROOT_CLEARED: raise RuntimeError('Crop entry disabled pending orchestration clearance.')
    parser=argparse.ArgumentParser(); parser.add_argument('root'); args=parser.parse_args()
    prepare(args.root)

if __name__=='__main__': main()
