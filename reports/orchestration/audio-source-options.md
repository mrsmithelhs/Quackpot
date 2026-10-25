# Audio sources and proposed policy expansion

**Date:** 2026-10-25. Owner asks about free sound libraries and Creative Commons music, with Credits from the opening screen. Research/proposal only; no media downloaded or production assets selected.

## Current policy and recommendation

Canonical Assets and agent contracts require synthesized text-parameter effects; owner triage T10/T12 leaves music open to JavaScript or model-generated local files. That explains Plan 04's limited synthesis experiment; recorded library effects/music have not yet been selected as an allowed production path. Recommend adding them as an option rather than abandoning synthesis. Real creator names/source titles belong in factual credits, outside the fictional publishers/products/streamers in gameplay.

**Proposed amendment for owner approval:** “Sound effects may be synthesized from text parameters or supplied as selected, locally bundled licensed audio files. Music may be JavaScript-generated, model-generated local audio, or selected locally bundled licensed recordings. Each external asset retains its source, author, exact license/version, required notices and modification record. A local Credits page is linked from the opening screen/settings. Creator attribution is permitted in Credits and license notices; all fictional game entities remain fictional. No automatic third-party network requests, remote audio/CDN loading or telemetry are permitted.”

On approval, update design.md, AGENTS.md and the orchestrator prompt together before importing assets. Do not interpret this report as that amendment already being adopted. Start with CC0/CC BY candidates; avoid adding NC/ND/SA combinations without an explicit compatibility review. “Free” alone is not an asset license.

## Primary-source options checked

- **Kenney:** [UI Audio](https://kenney.nl/assets/ui-audio) lists 50 files under CC0. [Official support](https://kenney.nl/support) says asset-page packs are CC0, attribution optional (mention Kenney; do not use its logo). Good first source to audition interface clicks and small feedback sounds; no particular file auditioned or selected here.
- **Freesound:** [Official FAQ](https://freesound.org/help/faq/#licenses) describes per-file CC0, CC BY and CC BY-NC plus older Sampling+ material. Inspect each file, author and license, not merely the site. It also describes attribution including links to a fuller credits page. Candidate source for duck/foley textures after policy approval; no recording has been auditioned or provenance-verified here.
- **Incompetech:** [Official music licensing](https://incompetech.com/music/royalty-free/licenses/) offers a free Creative Commons path requiring generated credits. A possible music source for a later bounded mood/loop comparison; verify the selected track's specific terms before use. No track selected.
- **CC BY 4.0:** [Official deed](https://creativecommons.org/licenses/by/4.0/) permits sharing/adaptation, with appropriate credit, license link and change indication. Retain exact per-asset terms and attribution. Credits design must carry the needed information, not only a generic “thanks to” list.

## Bounded next work

Draft Plan 18 requests approval of the source-policy amendment before downloads, followed by a small source/license/creative-fit audition for owner selection before integration. Keep the current three synthesized quacks as retained options. Audition at documented settings and distinguish loudness from timbre. Consider interface feedback, duck vocal character, rarity fanfare and apartment/gacha music separately so sourcing supports those contexts. Avoid a large sound-library migration.

Credits should be ordinary local HTML with title, creator, source URL, license/version/link, changes and local asset mapping; retain license texts and a reproducible provenance manifest in source. Attribution does not require automatic external requests: no embeds, remote fonts or prefetching. Credit links may be offered as explicit navigation, with the information itself readable locally. Assess file size, decoding, user-gesture startup, mute/volume, loop seams and browser support in the later sample proof. This is implementation planning, not legal clearance of any unexamined file.
