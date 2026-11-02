# Plan 53 setup, input and resource proposal

2026-11-02 — **proposed; not cleared or executed**. Root review is required before package installation, model downloads, model imports or inference. This is a bounded pilot, not production soundtrack adoption.

## Inputs and selection

The read-only Plan39 intake contains three MP3s. SHA-256, computed over original bytes (logical ID / bytes / hash):

| ID and owner-confirmed pairing | Bytes | SHA-256 |
|---|---:|---|
| M1 / prompt 1 | 2,990,110 | 55c4735cc709157ef6114520ef1653227517cbb9bb13e9837709079eb1d1d538 |
| M3 / prompt 3 | 3,219,443 | 52331f4b539ce31d6c3141d89e8618852f3ad87b004d88ee0fdbd7faa5b3eb9b |
| M5 / variation of prompt 4, ragtime | 2,091,335 | 439d250854162b437ca4981e67c1dda3d02832fbbbb45c2e84ced4b502c5aea0 |

Keep filenames and originals unchanged; rehash before and after. Before inference, audition and freeze one 20–30 second passage with lead, harmony, bass and percussion, document exact original timecodes and decoded format in ignored local manifest, and select a short project-authored mixed score as control. Neither selection nor musical suitability has yet been established. Control score goes only to evaluation. The owner-confirmed pairings do not prove that Suno retained each reference melody. Optional Suno-native MIDI is owner-supplied only; no account access or credit expenditure is requested.

## Candidate setup and pins

- Propose isolated uv-managed CPython 3.12, exact patch and distribution hash to be recorded before acquisition; no global Python change. Observed uv 0.11.29 and host Python 3.14.7. Installed `uvx --help` supports `--torch-backend=cu128`; upstream recommends that backend on Windows. Driver 621.01 reports CUDA UMD 13.5; this is compatibility indication, not an executed CUDA test.
- PyPI MuScriptor **0.4.0** wheel `muscriptor-0.4.0-py3-none-any.whl`, 1,850,618 bytes, SHA-256 `a7e941b6e1d85a25f9fc4e00c2a46b43d4d516de0e751d54b42fda438ac2abb9`. Upstream main observed at `8a1ef88672cc23c26619adaff37ec48d82c0b906`; a PyPI wheel is not asserted identical to that source commit. [Package metadata](https://pypi.org/pypi/muscriptor/json), [upstream](https://github.com/muscriptor/muscriptor).
- Medium `MuScriptor/muscriptor-medium` revision `f32236969308476e01fd3aae67357de5feb05a2d`, gated; `model.safetensors` 1,228,144,472 bytes, SHA-256 `ac80adbdf85d87231735fd948af7013441c0afced316c4e9067fd5d8a7fb97ec`. [Model card and terms](https://huggingface.co/MuScriptor/muscriptor-medium). Verify that the chosen CLI actually honors the revision or explicitly stage and verify the pinned snapshot before any inference; fail closed if it cannot.
- Direct requirements include Torch >=2.3, beat-this >=1.1, numpy, mido, soundfile, safetensors and huggingface-hub. Exact transitive versions, wheel hashes, managed-Python patch, beat-tracking auxiliary weights and full transfer sizes are **not yet resolved**. Resolve and record a reproducible manifest and total size before installation; any unexpected downloads or unsupported binaries stop for revised clearance. Inspect installed CLI help after authorized installation, before using it. No frontend or MuseScore is needed for MIDI.
- All isolated environment, Python, uv/Hugging Face caches, temporary files, local manifests and media under the ignored `reports/development/plan-53-generated-track-transcription-and-reconstruction/local/`, outside source/build and ordinary Git. Set cache and temp paths only for owned processes; do not modify global settings. Confirm ignore coverage before writing.
- Code is MIT; weights have CC BY-NC 4.0 and additional input conditions. Owner must independently inspect and accept the exact Medium model terms and configure credentials locally if needed; no tokens in chat, scripts, logs or repository. Source generation/download rights and output publication rights remain unresolved. No account action is implied.

## Proposed separate supervisors and limits

These are ceilings for review, not evidence of feasibility. Bootstrap and inference are sequential, each in a new Windows Job Object with kill-on-close, owned child tracking and bounded output; prove timeout and cleanup with a harmless synthetic process before real work. If containment, accounting or cleanup cannot be established, stop. Never kill unrelated processes or restart the existing server.

| Stage | Wall ceiling | Owned-process host private memory | GPU | Disk |
|---|---:|---:|---:|---:|
| Bootstrap, including resolution/download | 30 min | 4 GiB | no model load | 20 GiB total local footprint; stop below 30 GiB free |
| One Medium excerpt or control | 15 min each, sequential | 12 GiB | stop at 7 GiB device-wide used; require at least 6.5 GiB free before launch | same 20 GiB footprint and 30 GiB free floor |

Package downloads are provisionally budgeted up to 8 GiB and model/auxiliary downloads up to 4 GiB, within the footprint cap; actual dependency sizes and auxiliary models remain unverified and must fit before acquisition. Medium weights alone are about 1.14 GiB; peak VRAM, RAM and duration are unknown. Large is not authorized and needs a separate size and feasibility proposal. These ceilings are not the existing Node/browser 2 GiB/90 s budget.

Sample owned-tree private bytes, device-wide VRAM, free disk and elapsed time at least every second; sampling can miss transient spikes, WDDM GPU accounting may be incomplete, and device-wide VRAM cannot attribute competing usage. A Windows job memory limit supplies an additional hard host guard; polling thresholds are not hard VRAM/disk enforcement. Abort on failed monitoring, competing heavy activity, thresholds, unexpected network, timeout, OOM or an uncontained child. Terminate only the owned job, wait for exit and verify cleanup; preserve partial diagnostics and do not retry on CPU or automatically increase limits. Inference runs with preverified local weights and network disabled; unexpected access is a stop. Separate per-run logs record sampled peaks, gaps, elapsed time, exit and cleanup, without secrets or personal paths.

Preflight again immediately before execution: full host process inventory, available physical RAM, free disk, GPU utilization/free VRAM and coordination with concurrent work. Stop if the full host inventory is unavailable, available RAM is below 16 GiB, free disk below 30 GiB, GPU free below 6.5 GiB, or heavy jobs conflict. Current sandbox exposed only its own limited process view and denied CIM; 33,615,630,336 bytes is .NET's reported total available memory limit, **not free RAM**. C: reported 310,339,899,392 bytes free. `nvidia-smi` reported 314/8188 MiB used, 18% utilization at one instant; WDDM did not identify GPU processes. These snapshots do not establish an idle host or reserve resources.

## Subsequent gates

After root clears a concrete completed setup manifest and supervisor, perform only the bounded Medium excerpt and known-score control, preserving raw MIDI and tempo maps. Compare identical recovered events using genuine pinned upstream TinySynth and curated patches; Plan43 handoff identifies revision `3d75aee4b3f43cbd932265e7d60201fd5b770397` and source hash `dd2b1d95d64499dfc3c292858e8c2d6525dc0bcdc345a900b7db207dffaae38c`. Preserve its license and label the separately authored Plan39 engine accurately. Test tempo, drums, programs, overlaps and note-offs before comparison. Label assigned dynamics and missing articulations.

Deliver one aligned original/raw/corrected comparison with solo/mute, mapping and exports for owner listening. Stop for that review before other tracks, Large, full tracks or separation/Basic Pitch. Installation, inference, symbolic utility, musical acceptance and production rights are distinct findings.
