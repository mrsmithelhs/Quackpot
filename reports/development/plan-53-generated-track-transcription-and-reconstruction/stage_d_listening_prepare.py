"""Prepare ignored Stage D comparisons from retained raw model events; no ML."""
import json
import math
from pathlib import Path
import shutil
import stage_d_crop

# Closest-label GM approximations of observed model groups, not source-stem proof.
PROGRAMS={'acoustic_piano':0,'clean_electric_guitar':27,'distorted_electric_guitar':30,'electric_bass':33,'drums':None}

def notes_from_raw(raw):
    opened={}; notes=[]; omitted=[]
    for e in raw['events']:
        if e['type']=='start':
            if e['index'] in opened: raise ValueError('duplicate start')
            opened[e['index']]=e
        elif e['type']=='end':
            start=opened.pop(e['start_event_index']); begin=start['start_time']; end=e['end_time']; group=start['instrument']; pitch=start['pitch']
            if (group not in PROGRAMS or type(pitch) is not int or not 0<=pitch<=127 or not isinstance(begin,(int,float))
                or not isinstance(end,(int,float)) or not math.isfinite(begin) or not math.isfinite(end) or not 0<=begin<=end<=26): raise ValueError('unsupported event')
            if group=='drums' and not 35<=pitch<=81: raise ValueError('unsupported drum pitch')
            if begin==end: omitted.append({'index':start['index'],'reason':'zero duration; no audible duration inferred'})
            else: notes.append({'index':start['index'],'part':group,'pitch':pitch,'start':begin,'end':end,'velocity':85})
    if opened or not notes or len(notes)>2000: raise ValueError('unclosed, empty or excessive events')
    recent={}
    for n in sorted(notes,key=lambda n:n['start']):
        key=(n['part'],n['pitch'])
        if n['part']!='drums' and recent.get(key,0)>n['start']: raise ValueError('same-pitch overlaps require an explicit policy')
        recent[key]=n['end']
    groups=sorted({n['part'] for n in notes})
    if len(groups)>15: raise ValueError('too many parts')
    return {'schema':1,'notes':notes,'omitted':omitted,'programs':{g:PROGRAMS[g] for g in groups},
            'velocity':'Assigned 85/127; dynamics not recovered.',
            'alignment':'Raw model seconds relative to the 00:20 source crop; derived MIDI is separate.'}

def prepare(root_arg, out_arg, kind):
    if kind not in stage_d_crop.SOURCES: raise ValueError('unknown track')
    root=Path(root_arg).resolve(strict=True);out=Path(out_arg).resolve(strict=True)
    if any(out.iterdir()): raise FileExistsError('output must be empty')
    source=root/'pilot-inputs'/kind; crop=source/'excerpt.wav'; manifest=json.loads((source/'crop-manifest.json').read_text(encoding='utf-8'))
    if manifest.get('source_id')!=kind or manifest.get('source_sha256')!=stage_d_crop.SOURCES[kind][1] or (manifest.get('start_seconds'),manifest.get('end_seconds'))!=(20,45): raise ValueError('source manifest mismatch')
    if stage_d_crop.sha256(crop)!=manifest.get('output_sha256'): raise ValueError('crop hash mismatch')
    pilot=root/'pilot-runs'/kind; raw=pilot/'raw-events.json'; result=notes_from_raw(json.loads(raw.read_text(encoding='utf-8')))
    with (out/'events.json').open('x',encoding='utf-8') as f: json.dump(result,f,indent=2)
    for source,name in ((crop,'original.wav'),(pilot/'tempo-aware.mid','derived-midi.mid'),(raw,'raw-events.json'),(pilot/'timing.json','timing.json')):
        with source.open('rb') as src,(out/name).open('xb') as dst: shutil.copyfileobj(src,dst,1024*1024)
    if stage_d_crop.sha256(out/'original.wav')!=manifest['output_sha256']: raise ValueError('copied crop hash mismatch')
    return {'playable_notes':len(result['notes']),'omitted':result['omitted'],'programs':result['programs']}
