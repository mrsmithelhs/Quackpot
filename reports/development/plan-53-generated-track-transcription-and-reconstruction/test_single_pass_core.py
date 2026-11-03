"""Synthetic one-pass/event preservation checks; no ML or network."""
from dataclasses import dataclass
import json
from pathlib import Path
import tempfile
import unittest

import single_pass_core as core


@dataclass
class Start:
    pitch: int; start_time: float; index: int; instrument: str


@dataclass
class End:
    end_time: float; start_event_index: int


@dataclass
class Progress:
    completed: int; total: int


@dataclass
class Grid:
    bpm: float; onset_delay: float = 0
    def with_onset_delay(self, onsets):
        return Grid(self.bpm, onsets[0] / 10)


@dataclass
class Options:
    quantize: bool = False; fill_gaps: float = 0; trim_leading_bars: bool = False; bpm: object = None


class Model:
    def __init__(self, events): self.events = events; self.calls = 0; self.exported = None
    def detect_beat_grid_for(self, audio, mode):
        assert mode is True
        return Grid(120)
    def transcribe(self, audio, **settings):
        self.calls += 1
        assert settings == {"use_sampling":False,"temperature":1.0,"cfg_coef":1.0,"instruments":None,
                            "batch_size":1,"beam_size":1,"no_eos_is_ok":False,"prelude_forcing":True}
        yield from self.events
    def events_to_midi_bytes(self, events, beat_grid, export):
        self.exported = list(events)
        return b"synthetic midi"


class SinglePass(unittest.TestCase):
    def test_raw_order_one_pass_and_timing(self):
        items=[Progress(0,1),Start(60,.25,7,"piano"),Start(36,.3,8,"drums"),End(.31,8),End(.9,7),Progress(1,1)]
        model=Model(items)
        with tempfile.TemporaryDirectory() as folder:
            result=core.run(model,"synthetic",folder,Start,End,Progress,Options(),lambda grid,options,onsets: grid)
            raw=json.loads((Path(folder)/"raw-events.json").read_text())
            timing=json.loads((Path(folder)/"timing.json").read_text())
            self.assertEqual(model.calls,1); self.assertEqual(model.exported,items)
            self.assertEqual([e["type"] for e in raw["events"]],["progress","start","start","end","end","progress"])
            self.assertEqual(raw["events"][3]["start_event_index"],8)
            self.assertEqual(raw["velocity"],"not recovered")
            self.assertIn("not a recovered drum duration",raw["drum_end"])
            self.assertEqual(json.loads((Path(folder)/"detected-grid.json").read_text())["bpm"],120)
            self.assertEqual(timing["detected_grid"]["onset_delay"],0)
            self.assertEqual(timing["onset_adjusted_grid"]["onset_delay"],.025)
            self.assertIn("trim_overlapping_notes",timing["upstream_note_cleanup"])
            self.assertEqual((Path(folder)/"tempo-aware.mid").read_bytes(),b"synthetic midi")
            self.assertEqual(result["note_starts"],2)
            with self.assertRaises(FileExistsError): core.run(model,"synthetic",folder,Start,End,Progress,Options(),lambda *x:None)
            self.assertEqual(model.calls,1)

    def test_unmatched_notes_and_forced_quantization_stop(self):
        with tempfile.TemporaryDirectory() as folder:
            model=Model([End(.5,42)])
            with self.assertRaisesRegex(ValueError,"orphan"): core.run(model,"synthetic",folder,Start,End,Progress,Options(),lambda *x:None)
            self.assertFalse((Path(folder)/"raw-events.json").exists())
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(ValueError,"timing"): core.run(model,"synthetic",folder,Start,End,Progress,Options(quantize=True),lambda *x:None)
            self.assertEqual(model.calls,1)

    def test_export_failure_preserves_single_pass_raw(self):
        class Broken(Model):
            def events_to_midi_bytes(self, events, beat_grid, export):
                raise RuntimeError("synthetic export failure")
        with tempfile.TemporaryDirectory() as folder:
            model=Broken([Start(64,.5,1,"piano"),End(1,1)])
            with self.assertRaisesRegex(RuntimeError,"export failure"):
                core.run(model,"synthetic",folder,Start,End,Progress,Options(),lambda *x:None)
            self.assertEqual(model.calls,1)
            self.assertTrue((Path(folder)/"raw-events.json").is_file())
            self.assertTrue((Path(folder)/"detected-grid.json").is_file())
            self.assertFalse((Path(folder)/"tempo-aware.mid").exists())

    def test_empty_notes_preserve_raw_and_stop(self):
        with tempfile.TemporaryDirectory() as folder:
            model=Model([Progress(0,1),Progress(1,1)])
            with self.assertRaisesRegex(ValueError,"no note starts"):
                core.run(model,"synthetic",folder,Start,End,Progress,Options(),lambda *x:None)
            self.assertEqual(model.calls,1)
            self.assertTrue((Path(folder)/"raw-events.json").is_file())
            self.assertFalse((Path(folder)/"tempo-aware.mid").exists())


if __name__ == "__main__": unittest.main()
