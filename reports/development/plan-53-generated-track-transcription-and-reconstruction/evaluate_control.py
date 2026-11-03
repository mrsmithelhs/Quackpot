"""Bounded score-to-raw-onset diagnostics; no audio, ML or network.

Matches exact pitch and drum/pitched category within an explicit tolerance.
Layer-specific counts are independent and may reuse one prediction across
layers; pooled matching uses each prediction only once.
"""
import json
from pathlib import Path

TOLERANCE = .1

def maximum_pairs(expected, predicted, tolerance=TOLERANCE):
    links={}
    def augment(i,seen):
        e=expected[i]
        candidates=sorted((abs(e['time']-p['time']),j) for j,p in enumerate(predicted)
                          if e['pitch']==p['pitch'] and e['drum']==p['drum'] and abs(e['time']-p['time'])<=tolerance)
        for _,j in candidates:
            if j in seen: continue
            seen.add(j)
            if j not in links or augment(links[j],seen): links[j]=i; return True
        return False
    for i,e in enumerate(expected): augment(i,set())
    return sorted((i,j) for j,i in links.items())

def maximum_match(expected, predicted, tolerance=TOLERANCE):
    return len(maximum_pairs(expected,predicted,tolerance))

def evaluate(score, raw):
    tempo=score['tempo']; assert tempo==100 and score['duration']==30
    expected=[]
    for e in score['lead']: expected.append({'role':'lead','pitch':e['midi'],'time':e['beat']*60/tempo,'drum':False})
    for e in score['guitar']: expected.append({'role':'guitar','pitch':e['midi'],'time':e['offset']+e['start'],'drum':False})
    for e in score['bass']: expected.append({'role':'bass','pitch':e['midi'],'time':e['startSeconds'],'drum':False})
    for e in score['drums']: expected.append({'role':'drums','pitch':e['note'],'time':e['time'],'drum':True})
    predicted=[{'pitch':e['pitch'],'time':e['start_time'],'drum':e['instrument']=='drums','instrument':e['instrument']}
               for e in raw['events'] if e['type']=='start']
    if len(expected)>500 or len(predicted)>1000: raise ValueError('event ceiling')
    roles={}
    for role in ('lead','guitar','bass','drums'):
        target=[e for e in expected if e['role']==role]
        roles[role]={'expected':len(target),'independent_matches':maximum_match(target,predicted)}
    pairs=maximum_pairs(expected,predicted); matches=len(pairs)
    used_e={i for i,_ in pairs}; used_p={j for _,j in pairs}
    deltas=sorted(predicted[j]['time']-expected[i]['time'] for i,j in pairs)
    def quantile(q): return deltas[round((len(deltas)-1)*q)] if deltas else None
    return {'tolerance_seconds':TOLERANCE,'pitch_rule':'exact MIDI pitch; drums separate',
            'alignment':'raw model time versus scheduled reference onset; no offset fitting',
            'expected_total':len(expected),'predicted_total':len(predicted),'pooled_one_to_one_matches':matches,
            'unmatched_expected':len(expected)-matches,'unmatched_predictions':len(predicted)-matches,
            'unmatched_expected_events':[e for i,e in enumerate(expected) if i not in used_e],
            'unmatched_prediction_events':[p for j,p in enumerate(predicted) if j not in used_p],
            'onset_delta_seconds':{'minimum':min(deltas) if deltas else None,'median':quantile(.5),'p90':quantile(.9),'maximum':max(deltas) if deltas else None},
            'near_tolerance_boundary_pairs':[{'expected':expected[i],'predicted':predicted[j]} for i,j in pairs if abs(predicted[j]['time']-expected[i]['time'])>=tolerance_boundary()],
            'expected_events_with_multiple_candidates':sum(sum(e['pitch']==p['pitch'] and e['drum']==p['drum'] and abs(e['time']-p['time'])<=TOLERANCE for p in predicted)>1 for e in expected),
            'predictions_with_multiple_candidates':sum(sum(e['pitch']==p['pitch'] and e['drum']==p['drum'] and abs(e['time']-p['time'])<=TOLERANCE for e in expected)>1 for p in predicted),
            'instrument_groups_for_pooled_matches':{role:{instrument:sum(expected[i]['role']==role and predicted[j]['instrument']==instrument for i,j in pairs)
                for instrument in sorted({p['instrument'] for p in predicted})} for role in ('lead','guitar','bass','drums')},
            'roles_independent_not_additive':roles,
            'predicted_instruments':{k:sum(p['instrument']==k for p in predicted) for k in sorted({p['instrument'] for p in predicted})},
            'limitations':['No waveform annotation or alignment calibration','Layer-independent matches can reuse predictions',
                           'No offsets, octave tolerance, articulation or perceptual quality scoring',
                           'Reference uses synthesized sounds; exact score scheduling is not annotated acoustic onset']}

def tolerance_boundary():
    return TOLERANCE-.005

if __name__=='__main__':
    import sys
    manifest=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    raw=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))
    print(json.dumps(evaluate(manifest['records'][0]['score'],raw),indent=2))
