# Proposed Gemini audio control: M1 event coverage and pair discrimination

**Status: four authorized control sessions completed.** The owner listened to the clips and supplied the perceptual key; orchestration reviewed and cleared the fixed batch. The owner was notified before provider calls. Results and limits appear below. This is a small diagnostic for the previously used Antigravity CLI file-read route, not completion of the pending M1/M3/M5 music consultations.

## Question and limits

Can a fresh Flash session identify independently verified audible events through the end of a short natural music excerpt, and distinguish an identical pair from a deliberately changed pair? File-read success does not establish native audio delivery or comprehension. Even successful controls establish only performance on these stimuli, prompts and route; failures do not prove the model cannot hear any audio. Genre and subjective arrangement advice are not scored. Exact timing is scored separately from event presence/order. The three pair calls are a small descriptive check, not a statistical estimate.

## Proposed source and preparation

Use the previously prepared, owner-rights-confirmed M1 original only: `local/flash-consult-m1-repeat/chunk-work/original.wav`, the 48 kHz stereo PCM excerpt decoded from source-relative 00:20–00:50. The source remains untouched. If the owner cannot identify and verify at least three distinguishable early, middle and late events in this excerpt, select another existing rights-confirmed 20–30-second M1 passage and document its source-relative times before any call; do not infer an answer key from waveform inspection or from Flash. Owner verification, including confirmation that the final event is clearly audible, is required before dispatch.

Under a separately cleared preparation lane, encode a reference A from that PCM once to 192 kbps 48 kHz stereo MP3 with the already-installed FFmpeg. Create B from the same PCM by applying a 100 ms fade to silence at 27 seconds, then silence for the final three seconds; encode once with identical settings. This is one controlled late-content removal, not a claimed isolated percussion stem. Preserve length and earlier content; do not normalize, retime, add sound, or overwrite sources. Owner audition both files to confirm the change is obvious and that the chosen late event is present in A and absent in B; if it is not, stop and redesign the change before model calls. A/A must use two byte-identical copies of the same encoded A; A/B and B/A use the same pinned A and B bytes. Verify duration, frame/codec metadata and hashes, disclose encoder delay and no claim of sample-perfect alignment. Use fresh ignored staging directories with neutral `first.mp3`/`second.mp3` names and no answer keys in any model-visible working directory.

## Staged call design: maximum four fresh sessions

Before calls, write a private fixed key from owner audition: three specific distinguishable events and their relative order and approximate occurrence windows; an independently verified late event; what was removed in B; the order of each pair. Prepare balanced event-choice options including plausible distractors. Do not disclose the key, file identity, the edit, prior reviews, expected genre, or whether a pair is identical. Do not provide expected duration. All prompts ask for uncertain/unknown when appropriate. Pin all prompts and files before dispatch.

1. **Single-file coverage:** one fresh session receives A as `first.mp3`. Ask for the presence and sequence of the predeclared audible event choices, including the late event, without revealing which options are correct; separately ask for approximate elapsed time or a statement of uncertainty. Score event presence/order and late-event coverage against the owner key independently of timing. Ambiguous events are unscored, not counted correct.
2. **Identical-pair negative control:** a fresh session receives A/A as `first.mp3` and `second.mp3`, asked whether they differ audibly, what differs, and where, or whether uncertain. Claimed differences are false positives subject to owner verification.
3. **Changed pair:** a fresh session receives A/B under the same neutral pair prompt. Score whether a difference is detected and its general location/nature, without requiring precise timestamps.
4. **Reversed changed pair:** a fresh session receives B/A using exactly the same pair prompt. Score detection and correct direction separately; contrast with A/B and A/A. Do not adapt the prompt or call order to the responses.

Calls are sequential, one at a time, with no prior answers in later sessions. Ask for observed content, not provenance inferred from filenames. A single trial in each condition cannot prove stable ability; preserve all responses and refusals, including wrong confident answers. If a pair is perceived identical by the owner or the key is ambiguous, stop before dispatch.

## Proposed route, safeguards and gates

Proposed requested route: the previously used fresh Antigravity CLI Flash session, same requested model and medium effort, with only the designated audio file(s) in each isolated working directory. Permit repeat reads of those exact files, record read counts and requested versus observed model identity; no commands, web, MCP, writes, transcript or outside-stage reads. These are cooperative restrictions, not a proven operating-system allowlist. Stop all later calls on an unauthorized tool attempt or outside-stage read, authentication failure, wrong observed model, missing required audio read, empty/timeout response or truncated capture; preserve receipts, no automatic retry or fallback. A musical disagreement alone is scored, not a transport stop.

Proposed bounds per provider call: fresh available RAM at least 8 GiB and free disk at least 30 GiB; 240-second outer wall cap, 210-second inner print timeout, sampled 2 GiB process-tree private memory cap, 1 GiB Node heap and 2 Mi characters per stream; serialize resource use and preserve sampled-process cleanup uncertainty. Preparation/validation would use existing bounded 90-second/2 GiB launcher per invocation, no installation, downloads, credential changes or new model inference. Record time, memory, read traces, reported usage and private receipt hashes without exposing session identifiers. The owner and orchestration receive notice and review the final fixed inputs/key/protocol before execution.

A documented explicit native-audio attachment route is a **separate possible comparison**, requiring separate owner approval of route, account, access, cost and resource plan. The API's documented mono downmix does not establish this CLI route's behavior; do not score stereo panning without route-specific proof. No M3/M5 freeform advice calls, production integration or music changes follow automatically.


## Prepared clips and remaining gates

Using the existing FFmpeg 9.0.1 installation and the preserved source PCM, A and B were encoded at 192 kbps, 48 kHz stereo. FFprobe reports both as 30.000 seconds with start time 0.023021; independent decode yields 1,440,000 frames each. At seconds 28–29 decoded A has RMS 5424.63 PCM16 units and decoded B has RMS zero, confirming the encoded tail difference but not an owner-verified musical event. A SHA-256 is `5964ea9ac9e1627d39b7cc65109baa97bc0a90915143e211a252c8a1678ecff2` and B is `787fa8005da4f857e88231994c208499b46d11b5cf1d6761996b2ec0349a5d04`. Four ignored neutral stages contain one A, A/A byte-identical, A/B, and B/A respectively. Codec delay and lossy encoding prevent a sample-perfect alignment claim.

The earlier owner selection established that M1 00:20–00:45 was representative, not the specific early/middle/late event identities or audibility of the final altered three seconds. Those events, distractors and the effect of B require the owner's listening before the final answer key and prompts can be pinned. No Flash session has run for this control.


## Completed control results

The owner reported that B had no audio in the last three seconds and described A as opening with a violin-like melody with slides and variation, followed around 18 seconds by a mallet-like response with softer drums, then stronger drums and violin-like tones alongside the mallet-like melody in the final three seconds. These are owner listening impressions, not independently verified instrument stems. The previously chosen representative 00:20–00:45 passage alone had not established these events. The final pre-call private key/rubric SHA-256 was `bac087e01c0f3a7df997afd9304deeac0f8bda9a892e57617cdf5dee0f646c80`; prompts and audio stages were pinned before calls. Instrument synonyms and ambiguous observations were treated cautiously; distractor absence was unscored because the owner did not explicitly verify it.

| Condition | Result against fixed key | Timing separately |
| --- | --- | --- |
| Single A | Described an early lead, mallet-like response and later layering, but placed the response and return earlier than the owner described; violin slides were uncertain. Its claimed final cadence/stinger was not established by the key. Partial and ambiguous structural agreement, not verified end coverage. | Claimed 29–30 s, within the predeclared ±2 s duration tolerance. Event times diverged from the owner's approximate observations. |
| A/A | Reported same, correctly; no false-positive difference. | Claimed ~24 s for each 30 s file, outside tolerance. |
| A/B | Reported same; missed the owner's plainly audible silence in the second file. | Claimed 30–31 s for each, within tolerance. |
| B/A | Reported same; missed silence in the first file. | Claimed 30–32 s for each, within tolerance at the stated boundary. |

Both changed-pair trials therefore failed to detect the deliberately obvious late omission in either order, while the identical-pair negative control passed. Four one-shot cases cannot establish a statistical rate or general model hearing capability. Correct duration or file reads alone do not prove native audio delivery, comprehension, or full coverage; the observed result limits confidence specifically in this CLI workflow for this comparison. No new model calls or native-audio API route followed.

All four fresh sessions reported initialization as `gemini-3.8-flash-medium`; effective effort was not independently exposed. Each completed exactly the intended file reads, no other tool call or explicit checkpoint event was observed, exit code was zero and neither stream was reported truncated. These traces do not expose the audio payload. Token counts below are CLI-reported, with thinking included in output; sampled private memory is not a hard process-tree proof.

| Condition | Wall s | Sampled peak bytes | Input / output (thinking) tokens | Private raw receipt SHA-256 |
| --- | ---: | ---: | --- | --- |
| Single | 31.134 | 373850112 | 26719 / 2826 (2122) | 5ab6fc019cc5f641420dd625bf0331f170f5f0e0d846d9e52fa96c6aa3cde139 |
| A/A | 18.651 | 399126528 | 27249 / 1278 (1007) | 12fc3ce0145d99635ef60d440cd5e284cd8b39a2025ab5a0b861a3ea4412a16b |
| A/B | 19.000 | 410828800 | 27377 / 1626 (1200) | 36fe8c7aaa4c285f13ce66a77312520844581fc2407c3d462c38d2a8dfd67919 |
| B/A | 22.516 | 430333952 | 41116 / 1639 (1297) | 5f2173fd14411c87557f8ca6698e9cb4518853a9ab3ab6d3e907d5cb91416868 |

Individual sanitized responses are `flash-control-single-response.md`, `flash-control-same-response.md`, `flash-control-forward-response.md` and `flash-control-reverse-response.md`. Raw receipts and audio remain ignored. The broader M1/M3/M5 consultation request is pending a separately chosen reliable method.

The identical-pair pass is compatible with always answering “same”; the two changed-pair misses are therefore the decisive observations in this small test. The single-file choices supplied timbral and structural hints, so echoed terms are not independent listening proof. Do not use further freeform comparisons from this CLI route to make music decisions on this evidence. A documented native-audio route is a separate proposal and owner gate, not automatic setup or evidence that the current route delivered no audio.
