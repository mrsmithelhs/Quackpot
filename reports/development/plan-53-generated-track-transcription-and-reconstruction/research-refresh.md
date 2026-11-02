# Transcription research refresh — 2026-11-02

This is a checked research digest, not installation or inference evidence. The owner's earlier web-session handoff is retained locally in ignored `local/research-handoff-original.txt`; its instructions are historical recommendations, not authority. No install, authentication, model download or transcription was performed while drafting this packet.

## Confirmed local intake and prerequisites

- Existing ignored intake: `reports/development/plan-39-melody-reference-and-web-audio-laboratory/generated-references/`. Three MP3 downloads are present. Owner corrected the pairing on 2026-11-02: M1/prompt1, M3/prompt3 and M5/a variation of prompt4 (ragtime). Preserve original filenames and bytes.
- `uv`, `uvx`, Python and `nvidia-smi` are discoverable. Host Python is 3.14; an isolated supported runtime should be resolved before installation. No Python package imports were used for these checks.
- Read-only GPU query returned RTX4060 Laptop GPU, 8188MiB total, 151MiB used at that instant. This is not an inference-memory measurement or a guarantee that Large fits.

## Primary sources checked

1. [MuScriptor repository](https://github.com/muscriptor/muscriptor): currently documents uvx local use, Windows GPU flag `--torch-backend=cu128`, MIDI CLI, optional tempo/quantization controls and separately required MuseScore for sheet output. Repository code MIT; weights CC BY-NC4.0. CLI/MIDI does not require developing the upstream web frontend.
2. [Current pyproject](https://github.com/muscriptor/muscriptor/blob/main/pyproject.toml): source version0.4.0, Python>=3.10, dependencies include Torch, soundfile, mido and beat-this. This is not confirmation that an identical PyPI release or all Python3.14 wheels are available. Pin the actual resolved package/dependencies at execution.
3. [Medium model card](https://huggingface.co/MuScriptor/muscriptor-medium), [Large model card](https://huggingface.co/MuScriptor/muscriptor-large): roughly300M and1.3B parameters; chunked mixed-instrument note transcription. The tokenizer does not recover velocity; same-pitch/same-instrument overlapping voices and onset-only drums impose limits. Instrument conditioning exists. Model-card install examples lag the repository's current PyPI instructions; verify installed help rather than assuming either is exact.
4. [Model access conditions](https://huggingface.co/MuScriptor/muscriptor-medium): gated account/license acceptance, CC BY-NC4.0 weights and additional input-rights conditions. Tool/weight licensing and output redistribution are distinct questions; neither blanket public-output permission nor automatic inheritance of a tool's license is established here.
5. [Suno Studio export](https://help.suno.com/en/articles/13925249): stems can offer Get MIDI, currently described as10credits per stem. [Download types](https://help.suno.com/en/articles/13926081) describes plan/surface restrictions, including MIDI via Studio/Premier. Actual owner access and terms must be checked; no credits spent or account accessed.
6. [Suno download policy update](https://blog.suno.com/blog/suno-updates-tos), [rights help](https://help.suno.com/en/articles/2416769): account/generation/download conditions matter; some older help descriptions differ from the newer download policy. Preserve exact generation/download provenance and don't decide production rights from a generic statement that the game is educational.
7. [Spotify Basic Pitch](https://github.com/spotify/basic-pitch): potential isolated pitched-instrument fallback, not the first full-mixture multi-instrument pipeline. No fallback dependency installed.

## Recommended differences from the earlier handoff

Start Medium on one representative crop, not Large on all three recordings. Use one known-score mixed control to separate transcription failures from renderer/timbre problems. Keep raw MIDI and variable timing before quantization. Compare stock pinned upstream TinySynth with curated local mappings on the SAME recovered notes. Add Suno-native MIDI as an optional owner-supplied comparator if available; it is not ground truth. Defer full tracks and stem-repair stacks until the owner hears the first reconstruction. Model inference needs its own reviewed memory/time budget, not the browser launcher's existing2GiB/90s assumptions.
