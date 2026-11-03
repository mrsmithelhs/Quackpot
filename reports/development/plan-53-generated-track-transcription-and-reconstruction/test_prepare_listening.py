import unittest
from prepare_listening import raw_notes

class RawListening(unittest.TestCase):
    def test_paired_notes_and_zero_duration_disposition(self):
        result=raw_notes({'events':[{'type':'start','index':1,'pitch':60,'start_time':.1,'instrument':'acoustic_guitar'},
                                  {'type':'end','start_event_index':1,'end_time':.4},
                                  {'type':'start','index':2,'pitch':62,'start_time':1.,'instrument':'acoustic_guitar'},
                                  {'type':'end','start_event_index':2,'end_time':1.}]})
        self.assertEqual(len(result['notes']),1)
        self.assertEqual(result['notes'][0]['velocity'],85)
        self.assertEqual(result['omitted'][0]['index'],2)

    def test_unpaired_or_unsupported_fails(self):
        with self.assertRaises(ValueError): raw_notes({'events':[{'type':'start','index':1,'pitch':60,'start_time':.1,'instrument':'acoustic_guitar'}]})
        with self.assertRaises(ValueError): raw_notes({'events':[{'type':'start','index':1,'pitch':60,'start_time':.1,'instrument':'flute'},{'type':'end','start_event_index':1,'end_time':.2}]})
