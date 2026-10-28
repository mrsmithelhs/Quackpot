# Plan 18 — root checkpoint disposition, 2026-10-28

Proceed with the bounded catalog/audition rebuild after packet preflight. This disposition answers expanded-checkpoint.md; existing production/audio-selection gates stay intact.

1. **Kenney primary verification:** root directly retrieved official UI Audio, Impact Sounds, Casino Audio, Interface Sounds and Music Jingles asset pages on 2026-10-28; each explicitly marks Creative Commons CC0. Official support says credit is optional, use “Kenney” if crediting, and do not use its logo. Record pack-level PRIMARY verification, not individual-file-page verification. Retain archive license/notice and exact member-to-pack mapping; other packs still need their own evidence. Official references:
   - https://kenney.nl/assets/ui-audio
   - https://kenney.nl/assets/impact-sounds
   - https://kenney.nl/assets/casino-audio
   - https://kenney.nl/assets/interface-sounds
   - https://kenney.nl/assets/music-jingles
   - https://kenney.nl/support
   Mirror retrieval is acceptable only when exact pack/version/license/member provenance can be established; otherwise leave pending.
2. **Playback:** approve native HTMLAudioElement with local relative files, attenuation-only audition gain and master volume multiplied/clamped into [0,1]. No Web Audio/server requirement for the first deliverable. Do not claim identical loudness from peak/RMS alone, and label unusually quiet candidates. Verify file:// manually if supported; localhost browser evidence alone does not prove file://. Keep generated catalog data usable without runtime fetch/module restrictions on file://; embed data or ordinary local scripts. Do not make one-time loudness analysis depend on starting a server when offline file tools suffice.
3. **SoundBible:** quarantine ambiguous Attribution 3.0 candidates; do not silently promote to verified CC BY. General site wording does not settle exact-file terms. Use already verified alternatives now, retain leads for later exact-license confirmation. No need to block the catalog on this.
4. **Downloads:** approve individual files and small packs around 15 MiB or less, within original 100 MiB total expansion ceiling. Count originals, derivatives and duplicate copies; inventory existing owner-assisted Freesound intake first. Large archives remain out; use an independently available verified individual member rather than downloading the large pack. Download batches by useful coverage, not a quota of 60–80 files.
5. **Gaps:** report honestly; prioritize audition of the 14 owner-provided files before another broad search. Sonnet may inspect existing leads inline, but no extra Haiku search budget or mandatory gap-filling is granted. Do not pad pools with poor/unverified substitutes.
6. **Ambience:** rain/domestic in a separate optional section. Thunder can remain a clearly marked future-weather lead, outside current playable audition/rebuild scope; later thunder audition/integration can be separately approved. No weather or production integration.
7. **Budget:** record the seventh Haiku screenshot-intake task as an owner-authorized exception, not an unused task or automatic future budget. Correct the checkpoint's now-stale “6 of 6/no downloads” summaries to distinguish search from owner-assisted intake.

Approve role taxonomy and multi-select pool design with these corrections: distinguish selected/shortlisted/rejected; export stable file IDs plus role assignments/revision; never reset owner choices silently across revisions; display sources/license/change notices for ALL bundled or auditionable recordings, not just selections. Only production Credits may later narrow to shipped assets. Preserve v1 history and keep synthesized quacks out of main audition/context mocks. CC BY derivatives need original/remix chain and change notices; owner download/login is not license proof by itself.

Stop/load/decode errors must reset actual playing state; bound simultaneous voices and clean up on navigation/stop. No autoplay; keyboard-operable selection, volume and stop; local storage/export failure feedback. Source is report-only and production RNG is unchanged. No new provider accounts or messages.

Resource discipline: owner reported a Node process reaching ~21GB; cause unknown. Do not launch Node watchers, repeated full suites or parallel Node jobs. Any Node/browser tooling needs an exact proposed command and bounded time/memory/output plan, isolated provider browser/storage, and root coordination. Ordinary library research/downloads remain within the approved scope. No extra consultant budget. Return catalog/page for technical review and owner sound selection; no packet completion, push or production adoption.
