import unittest
import hashlib
import json
import tempfile
from pathlib import Path
from unittest.mock import patch
import stage_d_crop
from stage_d_listening_prepare import notes_from_raw, prepare

def start(i,part,pitch,time): return {'type':'start','index':i,'instrument':part,'pitch':pitch,'start_time':time}
def end(i,time): return {'type':'end','start_event_index':i,'end_time':time}

class StageDListening(unittest.TestCase):
    def test_groups_are_preserved_with_explicit_programs_and_omissions(self):
        raw={'events':[start(1,'electric_bass',33,.2),end(1,.4),start(2,'drums',42,.3),end(2,.31),
                       start(3,'acoustic_piano',70,.5),end(3,.5)]}
        result=notes_from_raw(raw)
        self.assertEqual(result['programs'],{'drums':None,'electric_bass':33})
        self.assertEqual([n['part'] for n in result['notes']],['electric_bass','drums'])
        self.assertEqual(result['omitted'][0]['index'],3)
        self.assertTrue(all(n['velocity']==85 for n in result['notes']))

    def test_guitar_groups_use_explicit_closest_label_gm_programs(self):
        raw={'events':[start(1,'clean_electric_guitar',60,0),end(1,.1),start(2,'distorted_electric_guitar',62,.1),end(2,.2)]}
        self.assertEqual(notes_from_raw(raw)['programs'],{'clean_electric_guitar':27,'distorted_electric_guitar':30})

    def test_unknown_group_and_same_pitch_overlap_stop(self):
        with self.assertRaisesRegex(ValueError,'unsupported'): notes_from_raw({'events':[start(1,'unknown',60,0),end(1,.1)]})
        with self.assertRaisesRegex(ValueError,'overlaps'): notes_from_raw({'events':[start(1,'acoustic_piano',60,0),start(2,'acoustic_piano',60,.1),end(1,.2),end(2,.3)]})

    def test_unmatched_notes_stop(self):
        with self.assertRaisesRegex(ValueError,'unclosed'): notes_from_raw({'events':[start(1,'acoustic_piano',60,0)]})

    def test_prepare_requires_source_and_crop_hash_and_never_overwrites(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); inp=root/'pilot-inputs'/'m5-excerpt'; inp.mkdir(parents=True); pilot=root/'pilot-runs'/'m5-excerpt'; pilot.mkdir(parents=True); out=root/'out';out.mkdir()
            (inp/'excerpt.wav').write_bytes(b'fake audio')
            manifest={'source_id':'m5-excerpt','source_sha256':'sourcehash','start_seconds':20,'end_seconds':45,'output_sha256':hashlib.sha256(b'fake audio').hexdigest()}
            (inp/'crop-manifest.json').write_text(json.dumps(manifest)); (pilot/'raw-events.json').write_text(json.dumps({'events':[start(1,'acoustic_piano',60,0),end(1,.1)]}))
            (pilot/'tempo-aware.mid').write_bytes(b'fake midi'); (pilot/'timing.json').write_text('{}')
            with patch.object(stage_d_crop,'SOURCES',{'m5-excerpt':('fake.mp3','sourcehash')}):
                manifest['output_sha256']='wrong';(inp/'crop-manifest.json').write_text(json.dumps(manifest))
                with self.assertRaisesRegex(ValueError,'crop hash'): prepare(root,out,'m5-excerpt')
                manifest['output_sha256']=hashlib.sha256(b'fake audio').hexdigest();(inp/'crop-manifest.json').write_text(json.dumps(manifest))
                self.assertEqual(prepare(root,out,'m5-excerpt')['playable_notes'],1)
                with self.assertRaises(FileExistsError): prepare(root,out,'m5-excerpt')
