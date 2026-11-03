"""Testable event-preservation logic; no ML imports or execution entry point.

The actual model, event classes, export options and grid resolver are injected
only by a separately reviewed future runner. Do not pass real inputs until the
inference gate clears.
"""
import dataclasses
import json
import math
from pathlib import Path

MAX_EVENTS = 20000


def json_value(value):
    if dataclasses.is_dataclass(value):
        return {field.name: json_value(getattr(value, field.name)) for field in dataclasses.fields(value)}
    if hasattr(value, "tolist"):
        return json_value(value.tolist())
    if isinstance(value, dict):
        return {str(k): json_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_value(v) for v in value]
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float) and math.isfinite(value):
        return value
    raise ValueError("unsupported or nonfinite value")


def exclusive_json(path, payload):
    with path.open("x", encoding="utf-8", newline="\n") as output:
        json.dump(json_value(payload), output, indent=2, allow_nan=False)
        output.write("\n")


def run(model, audio, output_dir, start_type, end_type, progress_type, export_options, resolve_grid):
    directory = Path(output_dir).resolve(strict=True)
    if not directory.is_dir():
        raise ValueError("output must be an existing directory")
    outputs = [directory / name for name in ("raw-events.json", "timing.json", "tempo-aware.mid", "detected-grid.json")]
    if any(path.exists() for path in outputs):
        raise FileExistsError("refusing to overwrite pilot output")
    if export_options.quantize or export_options.fill_gaps or export_options.trim_leading_bars or export_options.bpm is not None:
        raise ValueError("pilot must retain detected timing without cleanup options")
    grid = model.detect_beat_grid_for(audio, True)
    if grid is None:
        raise ValueError("required beat grid unavailable")
    detected_grid = json_value(grid)
    exclusive_json(outputs[3], detected_grid)
    events = []; raw = []; onsets = []; opened = {}; seen = set()
    for event in model.transcribe(audio, use_sampling=False, temperature=1.0, cfg_coef=1.0,
                                  instruments=None, batch_size=1, beam_size=1,
                                  no_eos_is_ok=False, prelude_forcing=True):
        if len(events) >= MAX_EVENTS:
            raise ValueError("event ceiling exceeded")
        events.append(event)
        if isinstance(event, progress_type):
            if not (isinstance(event.completed, int) and isinstance(event.total, int) and 0 <= event.completed <= event.total and event.total > 0):
                raise ValueError("invalid progress event")
            raw.append({"type": "progress", "completed": event.completed, "total": event.total})
        elif isinstance(event, start_type):
            if event.index in seen:
                raise ValueError("duplicate note index")
            if not isinstance(event.instrument, str) or not event.instrument or not isinstance(event.pitch, int) or not 0 <= event.pitch <= 127 or not math.isfinite(event.start_time) or event.start_time < 0:
                raise ValueError("invalid note start")
            seen.add(event.index); opened[event.index] = event.start_time; onsets.append(event.start_time)
            raw.append({"type": "start", "pitch": event.pitch, "start_time": event.start_time,
                        "index": event.index, "instrument": event.instrument})
        elif isinstance(event, end_type):
            if event.start_event_index not in opened:
                raise ValueError("orphan note end")
            if not math.isfinite(event.end_time) or event.end_time < opened[event.start_event_index]:
                raise ValueError("invalid note end")
            del opened[event.start_event_index]
            raw.append({"type": "end", "end_time": event.end_time, "start_event_index": event.start_event_index})
        else:
            raise ValueError("unexpected event type")
    if opened:
        raise ValueError("unclosed notes")
    # The raw file preserves the original event ordering before the upstream
    # MIDI writer adjusts timing and repairs/trims notes. No velocity is inferred.
    exclusive_json(outputs[0], {"schema": 1, "events": raw, "velocity": "not recovered",
                               "drum_end": "upstream assigns a 0.01s minimum; not a recovered drum duration",
                               "settings": {"use_sampling": False, "temperature": 1.0, "cfg_coef": 1.0,
                                            "instruments": None, "batch_size": 1, "beam_size": 1,
                                            "no_eos_is_ok": False, "prelude_forcing": True}})
    if not onsets:
        raise ValueError("no note starts; raw events and detected grid preserved")
    adjusted = grid.with_onset_delay(onsets)
    midi = model.events_to_midi_bytes(iter(events), beat_grid=adjusted, export=export_options)
    resolved = resolve_grid(adjusted, export_options, onsets)
    timing = {"detected_grid": detected_grid, "onset_adjusted_grid": json_value(adjusted),
              "resolved_grid": json_value(resolved), "upstream_note_cleanup": "validate_notes(fix=True), trim_overlapping_notes(sort=True)",
              "bar_offset": "read muscriptor:bar_offset marker from exported MIDI; not independently reconstructed here",
              "quantized": False, "fill_gaps": False, "trim_leading_bars": False}
    exclusive_json(outputs[1], timing)
    with outputs[2].open("xb") as output:
        output.write(midi)
    return {"event_count": len(events), "note_starts": len(onsets), "files": [p.name for p in outputs]}
