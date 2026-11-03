"""MIDI event normalization. Accepts a parsed mido-like object, no ML imports."""
from collections import defaultdict, deque


def normalize(midi):
    if midi.type not in (0, 1) or midi.ticks_per_beat <= 0:
        raise ValueError("only synchronous PPQN MIDI types 0/1 are supported")
    events = []
    for track_index, track in enumerate(midi.tracks):
        tick = 0
        for order, msg in enumerate(track):
            if not isinstance(msg.time, int) or msg.time < 0:
                raise ValueError("invalid delta tick")
            tick += msg.time
            events.append((tick, track_index, order, msg))
    events.sort(key=lambda value: value[:3])
    tempo = 500000; previous_tick = 0; micros = 0
    programs = [0] * 16; notes = []; open_notes = defaultdict(deque)
    timeline = [{"tick": 0, "tempo_us_per_beat": tempo, "seconds": 0.0, "origin": "default"}]
    controls = []; unsupported = []; markers = []; signatures = []; ignored = []
    for tick, track_index, order, msg in events:
        micros += (tick - previous_tick) * tempo / midi.ticks_per_beat
        previous_tick = tick; seconds = micros / 1_000_000
        kind = msg.type
        if kind == "set_tempo":
            if msg.tempo <= 0: raise ValueError("invalid tempo")
            tempo = msg.tempo
            timeline.append({"tick": tick, "tempo_us_per_beat": tempo, "seconds": seconds,
                             "track": track_index, "order": order})
        elif kind == "program_change":
            if not 0 <= msg.channel <= 15 or not 0 <= msg.program <= 127:
                raise ValueError("invalid channel or program")
            programs[msg.channel] = msg.program
            controls.append({"type": kind, "tick": tick, "track": track_index, "order": order,
                             "channel": msg.channel, "program_zero_based": msg.program})
        elif kind in ("note_on", "note_off"):
            if not 0 <= msg.channel <= 15 or not 0 <= msg.note <= 127 or not 0 <= msg.velocity <= 127:
                raise ValueError("invalid note event")
            key = (msg.channel, msg.note)
            is_start = kind == "note_on" and msg.velocity > 0
            if is_start:
                open_notes[key].append({"track": track_index, "order": order, "channel": msg.channel,
                                        "drum": msg.channel == 9, "pitch": msg.note,
                                        "program_zero_based": None if msg.channel == 9 else programs[msg.channel],
                                        "start_tick": tick, "start_seconds": seconds,
                                        "velocity": msg.velocity})
            else:
                if not open_notes[key]:
                    raise ValueError("unmatched note-off")
                note = open_notes[key].popleft()  # explicit FIFO policy for same-pitch overlaps
                note.update({"end_tick": tick, "end_seconds": seconds, "end_track": track_index,
                             "end_order": order})
                notes.append(note)
        elif kind in ("control_change", "pitchwheel", "polytouch", "aftertouch"):
            # Preserve a machine-readable warning; no claim these controls were applied.
            unsupported.append({"type": kind, "tick": tick, "track": track_index, "order": order})
        elif kind == "marker":
            markers.append({"text": msg.text, "tick": tick, "track": track_index, "order": order, "seconds": seconds})
        elif kind == "time_signature":
            signatures.append({"numerator": msg.numerator, "denominator": msg.denominator,
                               "tick": tick, "track": track_index, "order": order, "seconds": seconds})
        elif kind != "end_of_track":
            ignored.append({"type": kind, "tick": tick, "track": track_index, "order": order})
    if any(open_notes.values()):
        raise ValueError("unclosed MIDI notes")
    notes.sort(key=lambda note: (note["start_tick"], note["track"], note["order"]))
    return {"schema": 1, "ticks_per_beat": midi.ticks_per_beat, "tempo_map": timeline,
            "program_changes": controls, "notes": notes, "markers": markers, "time_signatures": signatures,
            "unsupported_controls": unsupported, "other_event_types": ignored,
            "overlap_policy": "FIFO by channel and pitch", "velocity_provenance": "MIDI value; model dynamics not recovered"}


def read_file(path):
    # Kept lazy so synthetic unit checks and source review need no package import.
    import mido
    return normalize(mido.MidiFile(path))
