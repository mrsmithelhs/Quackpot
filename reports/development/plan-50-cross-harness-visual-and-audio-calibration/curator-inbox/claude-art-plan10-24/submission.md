# Submission record: claude-art-plan10-24 (Plan 50 curator inbox)

Curator: Claude (the chat that did the Plan 10 art, then Plan 23/24/26 work). Role: curator, not reviewer. Source chat transcript (read for owner words and chronology): `~/.claude/projects/C--AI-Quackpot/6ad61cdb-145b-4d6c-9aaa-86e4dc7f5df2.jsonl`. Written only under this folder; no earlier file, source asset, packet or status was modified; no other curator inbox, baseline answer or Plan 50 model output was read. No new art, no research, no reviewer launched.

## Files

| file | bytes | sha256 (first 16) |
|---|---|---|
| `baseline.md` | 31010 | `a9271e2ebb3ef883` |
| `cases.json` | 42305 | `761418f4ef00a4c8` |
| `evidence/assistant-statements-verbatim.md` | 24484 | `b0f5839ed03c8041` |
| `evidence/diff-areas-and-topdown-75902da-to-5e24816.patch` | 49570 | `16659abc716aa546` |
| `evidence/diff-desk-views-4c471ac-to-75902da.patch` | 31119 | `a1fe5c19cf8774c1` |
| `evidence/diff-lamp-pillow-mug-5e24816-to-7ad98f1.patch` | 16197 | `c5e210de4d0677c1` |
| `evidence/diff-toy-shelf-7ad98f1-to-ce23e57.patch` | 3488 | `41f565febe6ac2a9` |
| `evidence/fruit-bowl-versions.md` | 3024 | `01589ab9b44683d7` |
| `evidence/intermediate/preview.before-rooms.html` | 34300 | `f5b966724f8c376a` |
| `evidence/owner-messages-verbatim.md` | 6873 | `762c1b20bba63ae5` |
| `images/selected-contact-sheet-offline.png` | 38319 | `2fefba84d700df02` |
| `submission.md` (this file) | n/a | n/a |

Approximate total before this file: 280689 bytes (about 274 KiB). Held-back answer material: `baseline.md`, `cases.json` (and the evidence files that quote owner verdicts). Nothing here is reviewer input.

## What each file is

- `baseline.md`, `cases.json`: six compact cases (a duck-view redraw preference, b desk-view orientation, c top-down desk details with praised elements, d kitchen fruit bowl, e lamp/pillow/mug/light batch, f toy-shelf antenna) plus a closure note. Same data in both.
- `evidence/owner-messages-verbatim.md`: the owner's messages M0-M8, exact text, with transcript locators. `evidence/assistant-statements-verbatim.md`: MY statements around six of them (labelled as mine).
- `evidence/diff-*.patch`: exact `git diff` output of `preview.html` between the committed versions named in the file names. `evidence/fruit-bowl-versions.md`: exact first-attempt and later bowl markup lines from my scratch scripts. `evidence/intermediate/preview.before-rooms.html`: the one saved uncommitted intermediate snapshot (byte-identical copy; sha256 verified at copy time).
- `images/selected-contact-sheet-offline.png`: byte-identical copy of the committed offline contact sheet (git blob id verified). Not a browser screenshot.

## Provenance gaps (short version; full list in baseline.md)

- No saved screenshots of any scene the owner reviewed; I did not recreate any. The owner's 4 Tinkercad reference images (message M0) are not copied (ownership/licence not established here); they are in the transcript record at line 2.
- Cases c and d were judged by the owner against UNCOMMITTED working-tree states; only scripts and one scratch snapshot survive. Case d's bowl state is ambiguous among three versions.
- The Plan 10 handoff file was untracked when sent and first committed 20:33:18 local; the committed blob may not be what I read.
- Commit-to-message links are inferred from git time and the transcript. Commits carry the owner's configured git identity but were made by me.
- Transcript times are UTC, commit times local (UTC-4). The transcript replays the same messages later in the file (line numbers cited are first occurrences) and was still growing when I read it.
- Local scratchpad paths are shown as `<claude-session-scratchpad>/`; the owner's Windows username and temp paths were deliberately not written here.

## Commit

See the end of the hand-off message to QP Orch for the exact path and commit hash if the commit succeeded; if it was blocked, the files are left uncommitted and that is stated there.

## Hash caveat

The sha256 values above were computed on the files as I wrote them (LF line endings). This repository has line-ending conversion enabled (git warned "LF will be replaced by CRLF"), so a Windows checkout of the text files (.md, .json, .patch, .html) may have different bytes and therefore different sha256 values; verify text evidence by content or by `git hash-object` on the committed blob, not by the working-copy sha256. The PNG is binary and unaffected. Git blob ids quoted inside baseline.md and cases.json for the Plan 10 source files are repository blob ids and are unaffected.
