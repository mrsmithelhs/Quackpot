# Plan 18 expanded audition — technical review / repair 01
Date:2026-10-28. Root + one requested gpt-6.1-terra/medium read-only child reviewed actual audition code. Child cannot independently observe runtime model/effort. No Node/browser launched for review. Root ran standard-library Python verify_catalog.py once:63effects/3ambience/2music, hashes/durations/catalog-data identity pass;35.7MiB local audio. This is integrity, not listening/playback proof. Owner explicitly skipped file:// testing; preserve that accepted limitation, don't reopen it as a mandatory gate.

## Disposition
Catalog breadth/provenance tiers and report-only scope are suitable for owner audition after the selection-preservation repairs below. Existing browser report is self-reported coverage; no new root execution of page. Spot checks of primary OGA JRPG UI/applause/endgame confirm recorded creator/license. Kenney member provenance remains pending; those candidates may be auditioned with warning, not production-cleared. No blanket license or auditory-quality approval.

## Repair before owner relies on saved selections
1. audition.html128–138/405–413: fully validate supported schemaVersion and entire incoming export structure BEFORE replacing state or writing storage. Validate plain containers, arrays of string IDs, bounded names/notes, finite attenuation values/ranges, valid active-pool references and duplicate/conflicting pool records. Reject or safely represent reserved keys (__proto__/constructor/prototype); null-prototype maps or equivalent safe key handling. Preserve unknown stable IDs/catalog revision deliberately; do not silently drop data. Use detached candidate state, then explicit replacement confirmation if current choices exist, with export/backup opportunity. A rejected/cancelled/invalid import leaves current UI and saved raw bytes unchanged. Never show Import failed after persisting broken candidate.
2. exportObject392 currently omits empty pools. Round-trip ALL pool names, empty sets and active selection. Rejecting/removing last sound must not erase the user's organizational work on export/import.
3. load128–134: unknown/malformed stored schema must not silently become blank then get overwritten on next edit. Preserve raw data for manual recovery/download; inhibit destructive writes until explicit user recovery/reset/replacement. Storage-denied flow remains usable in memory with clear export guidance. Mark reviewed401 must not claim saved success if save fails.
4. renderCredits429–440 promises effects AND music but iterates effects only. Add both music records with exact creator/source/license/version/link and modification notices, consistent with catalog/ATTRIBUTIONS.md. Keep ALL bundled auditionable files represented, regardless of pool selection.
5. previewPool223–228 says Played before asynchronous playback succeeds. Show Starting/requested until actual playing state; on failure preserve error and never claim audible listening. Keep selectedonly random/no immediate repeat and cancellation/Stopall behavior.

## Validation and authority
Own report-folder audition code, focused report-local checks and progress only. No new searches/downloads/production/audio-adoption/status or reviewer budget. Don't rewrite accepted files/IDs/licenses to dodge repair. Commit explicit paths, progress last; no push.

Add meaningful regression cases: malformed fileIds string; unsupported version; reserved-key pool; invalid trim; cancelled valid replacement; import storage error; exact empty active pool round-trip; corrupted/foreign saved state preserved; mark-reviewed write failure; both music credit records; failed random playback never labelled Played. Test before/after state AND raw storage, not error text alone.

A bounded independent Claude browser turn is permitted on existing localhost server/profile for these report-only repairs, with no owner-storage/tab use or server restart. Verify valid existing export still imports. Coordinate source/HMR with Plan25; independent control/storage may coexist. No Node launches authorized by this repair. Existing lightweight Python validator may run serially; any other process tooling requires exact bounded command. Use your provider tools for browser-state assertions; preserve explicit file:// skip and no-listening limits. Return repaired delivery for root review then owner sampling; not packet completion.

Primary spot-check references:
- https://opengameart.org/content/jrpg-style-ui-sounds
- https://opengameart.org/content/applause
- https://opengameart.org/content/endgame
