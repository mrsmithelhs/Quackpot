"""Prepare ignored local listening data from the one completed M1 run.

The zero-duration model event is reported rather than silently lengthened.
No model, audio decoder or network access is used.
"""
import hashlib
import json
import math
from pathlib import Path
import shutil

CROP_HASH='63f39148c3763e72aaf19cebcbe1036dce939b61617ef74913ffafd50fc874da'

def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()

def raw_notes(raw):
    opened={}; notes=[]; omitted=[]
    for e in raw['events']:
        if e['type']=='start':
            if e['index'] in opened: raise ValueError('duplicate start')
            opened[e['index']]=e
        elif e['type']=='end':
            start=opened.pop(e['start_event_index'])
            end=e['end_time']; begin=start['start_time']
            if (not isinstance(begin,(int,float)) or not isinstance(end,(int,float)) or not math.isfinite(begin) or not math.isfinite(end)
                or not 0<=begin<=end<=26 or start['instrument'] not in ('acoustic_guitar','drums')
                or type(start['pitch']) is not int or not 0<=start['pitch']<=127): raise ValueError('unsupported event')
            if end==begin:
                omitted.append({'index':start['index'],'reason':'zero duration; no audible duration inferred'})
            else:
                notes.append({'index':start['index'],'part':start['instrument'],'pitch':start['pitch'],'start':begin,'end':end,'velocity':85})
    if opened or len(notes)+len(omitted)>2000: raise ValueError('unclosed or excessive notes')
    return {'schema':1,'notes':notes,'omitted':omitted,'velocity':'Assigned constant 85/127; dynamics not recovered.',
            'alignment':'Raw event seconds relative to the 00:20 source crop, before MIDI bar-offset transformation.'}

def prepare(root, out):
    root=Path(root).resolve(strict=True); out=Path(out).resolve(strict=True)
    if any(out.iterdir()): raise FileExistsError('listening output must be empty')
    crop=root/'pilot-inputs'/'m1-0020-0045.wav'
    if digest(crop)!=CROP_HASH: raise ValueError('crop hash mismatch')
    pilot=root/'pilot-runs'/'m1-excerpt'
    result=raw_notes(json.loads((pilot/'raw-events.json').read_text(encoding='utf-8')))
    with (out/'events.json').open('x',encoding='utf-8') as f: json.dump(result,f,indent=2)
    for source,name in ((crop,'original.wav'),(pilot/'tempo-aware.mid','derived-midi.mid'),(pilot/'raw-events.json','raw-events.json'),(pilot/'timing.json','timing.json')):
        with source.open('rb') as src,(out/name).open('xb') as dst: shutil.copyfileobj(src,dst,1024*1024)
    if digest(out/'original.wav')!=CROP_HASH: raise ValueError('copied crop hash mismatch')
    return {'notes':len(result['notes']),'omitted':result['omitted']}
