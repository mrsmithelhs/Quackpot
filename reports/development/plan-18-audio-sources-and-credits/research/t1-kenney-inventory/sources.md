# T1 Kenney inventory: sources visited

Access date: 2026-10-28. No audio downloaded. Text listings and pages only.

## Primary kenney.nl pages (all failed with connection reset, read ECONNRESET)

| URL | Result |
|---|---|
| https://kenney.nl/support | Failed (3 attempts). License/attribution wording NOT verified from primary source. |
| https://kenney.nl/assets?q=audio | Failed. |
| https://kenney.nl/assets/ui-audio | Failed. |
| https://kenney.nl/assets/interface-sounds | Failed. |
| https://kenney.nl/assets/casino-audio | Failed (2 attempts). |
| https://kenney.nl/assets/rpg-audio | Failed. |

Kenney pack pages were seen only as URLs in search results: ui-audio, interface-sounds, impact-sounds, casino-audio, digital-audio, rpg-audio, ui-pack, category:Audio. The music-jingles slug was not seen; https://kenney.nl/assets/music-jingles is inferred and unverified.

## Search results (WebSearch)

| Query | What it told us |
|---|---|
| kenney.nl UI Audio pack CC0 license | Listed kenney.nl/assets/ui-audio and the Calinou Godot port. Search summary says CC0 (secondary). Godot Asset Library entry shows AGPLv3 for the port packaging. |
| Kenney Impact Sounds Casino Audio RPG Audio Digital Audio pack file list github | No GitHub file lists for these packs. Lists kenney.nl/assets/category:Audio, impact-sounds, rpg-audio, casino-audio. Third-party counts disagree (not used). |

## GitHub mirror (retrieval lineage only, not primary license evidence)

| URL | What it told us |
|---|---|
| https://github.com/Calinou/kenney-ui-audio | README: "Licensed under CC0 1.0 Universal"; 50 sound effects stated. Repo root has addons/kenney_ui_audio, LICENSE.txt, CHANGELOG. |
| https://github.com/Calinou/kenney-ui-audio/tree/master/addons/kenney_ui_audio | 52 files: LICENSE.txt plus 51 .wav (click1-5, mouseclick1, mouserelease1, rollover1-6, switch1-38). |
| https://github.com/Calinou/kenney-ui-audio/blob/master/addons/kenney_ui_audio/LICENSE.txt | First line "License (Creative Commons Zero, CC0)"; copyright "by Kenney Vleugels (Kenney.nl)". Links to creativecommons.org/publicdomain/zero/1.0/. |

## gamesounds.xyz directory mirror (retrieval lineage only; file lists and readme text)

| URL | Pack file count (excl. readme) | Readme in dir | Notes |
|---|---|---|---|
| https://gamesounds.xyz/?dir=Kenney%27s+Sound+Pack | 16 subfolders | readme.txt (547 B) | Root README.md section: "This content is free to use in personal, educational and commercial projects." Does NOT state CC0 by name. |
| .../Kenney%27s+Sound+Pack%2FImpact+Sounds | 130 .ogg | readme.txt (608 B) | Readme content shown: "Impact Sounds (1.0)", licensed under "Creative Commons Zero, CC0". |
| .../Kenney%27s+Sound+Pack%2FUI+Audio | 51 .ogg | readme.txt (566 B) | Readme content shown: CC0 (public domain). Same file names as GitHub mirror (ogg here, wav in port). |
| .../Kenney%27s+Sound+Pack%2FCasino+Audio | 54 .ogg | none | Card, chip, dice sets. |
| .../Kenney%27s+Sound+Pack%2FDigital+Audio | 62 .ogg | readme.txt (571 B) | Readme not read in full. |
| .../Kenney%27s+Sound+Pack%2FInterface+Sounds | 100 .ogg | readme.txt (574 B) | Readme not read in full. Contains back/click/select/confirmation/close/tick/pluck. |
| .../Kenney%27s+Sound+Pack%2FRPG+Audio | 51 .ogg | readme.txt (568 B) | Readme not read in full. Contains book, cloth, door, coins, footsteps, metal. |
| .../Kenney%27s+Sound+Pack%2FMusic+Jingles | n/a (subfolders only) | none listed | Subfolders: Audio (Hit), Audio (Pizzicato), Audio (Retro), Audio (Saxophone), Audio (Steeldrum). Only Hit and Steeldrum read. |
| .../Kenney%27s+Sound+Pack%2FMusic+Jingles%2FAudio+%28Hit%29 | 17 .ogg | none | jingles-hit_00 to _16. |
| .../Kenney%27s+Sound+Pack%2FMusic+Jingles%2FAudio+%28Steeldrum%29 | 17 .ogg | none | jingles-steel_00 to _16. |

Other directories on the root listing (Foley Sounds, Music Loops, Retro Sounds 1/2, Sci-Fi Sounds, Synth Voice 1/2, Voiceover Pack, Voiceover Pack Fighter) were not opened. Sci-Fi Sounds was judged a poor fit for a non-sci-fi game.

Sizes shown in these listings are display sizes in KB (rounded). They are not bytes, so size_bytes is null. No durations or sample rates were shown.

## Unsuitable or restricted sources

- Godot Asset Library entry for the Calinou port (godotassetlibrary.com/asset/EPMyVg/kenney-ui-audio): shows AGPLv3. Treated as port packaging, not the sounds' license. Do not reuse the port's code or packaging.
- gtstu.com "Kenney CC0 Audio License Explained": third-party blog, secondary only; not used as license evidence.
- tmhsdigital.github.io and other aggregator counts: disagree with listings; not used.
- kenney.nl/assets/ui-pack: appeared in search; a graphics pack, not audio; not inventoried.
- No login, paywall, or CAPTCHA was encountered. The restriction is connection resets on kenney.nl.
