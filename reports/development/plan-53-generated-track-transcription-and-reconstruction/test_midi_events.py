"""Authored MIDI-like fixtures; no ML, audio, or network."""
from types import SimpleNamespace as M
import unittest
import midi_events


def event(kind, delta, **values): return M(type=kind, time=delta, **values)


class MidiFixtures(unittest.TestCase):
    def test_tempo_program_drums_and_same_pitch_overlap(self):
        midi=M(type=1,ticks_per_beat=480,tracks=[
            [event("set_tempo",0,tempo=500000),event("time_signature",0,numerator=4,denominator=4),
             event("marker",0,text="muscriptor:bar_offset=0.25"),event("set_tempo",480,tempo=1000000)],
            [event("program_change",0,channel=0,program=12),
             event("note_on",0,channel=0,note=60,velocity=80),
             event("note_on",240,channel=0,note=60,velocity=70),
             event("note_on",0,channel=9,note=36,velocity=90),
             event("note_off",240,channel=0,note=60,velocity=0),
             event("note_off",0,channel=9,note=36,velocity=0),
             event("note_on",240,channel=0,note=60,velocity=0),
             event("control_change",0,channel=0,control=64,value=127)]])
        result=midi_events.normalize(midi); notes=result["notes"]
        self.assertEqual(len(notes),3)
        self.assertEqual([(x["start_seconds"],x["end_seconds"]) for x in notes],[(0,.5),(.25,1.0),(.25,.5)])
        self.assertEqual([x["program_zero_based"] for x in notes],[12,12,None])
        self.assertTrue(notes[2]["drum"])
        self.assertEqual(result["tempo_map"][-1]["tempo_us_per_beat"],1000000)
        self.assertEqual(result["markers"][0]["text"],"muscriptor:bar_offset=0.25")
        self.assertEqual(result["time_signatures"][0]["numerator"],4)
        self.assertEqual(result["unsupported_controls"][0]["type"],"control_change")

    def test_unmatched_and_unclosed_notes_fail(self):
        with self.assertRaisesRegex(ValueError,"unmatched"):
            midi_events.normalize(M(type=0,ticks_per_beat=480,tracks=[[event("note_off",0,channel=0,note=60,velocity=0)]]))
        with self.assertRaisesRegex(ValueError,"unclosed"):
            midi_events.normalize(M(type=0,ticks_per_beat=480,tracks=[[event("note_on",0,channel=0,note=60,velocity=1)]]))


if __name__ == "__main__": unittest.main()
