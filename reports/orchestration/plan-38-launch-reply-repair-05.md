# Plan 38 — launch message and reply

2026-10-31. Owner rejects immersion-breaking fictional-install/download reassurance and selects an in-world message inviting a reply of **Launch** for ten free ducks. This supersedes the installation experience in repair03; retain historical saves/log evidence unchanged. Plan38 returns to in progress for this bounded owner repair.

## Authorized experience

Use the existing phone message/held-object presentation. Suggested message: “Quackpot launches tonight! Reply LAUNCH to get 10 free ducks when the pond opens.” Action: `Reply “LAUNCH”`; alternative: `Put it down`. After replying, show the outgoing reply and an incoming acknowledgment, for example “You're on the list! Come back tonight for your free 10-pull.” Keep the reply/response in the conversation on subsequent inspection/reload. Ordinary copy refinement is implementer discretion; no more design gate needed.

Everyone still has the existing welcome ten-pull at launch, including players who never reply. Replying grants nothing immediately, spends no life slot/cash/Gems, makes no network call and does not consume/regrant the welcome entitlement. Ten ducks means ten draw results, not ten guaranteed distinct identities. Evening phone directly opens the app. Remove install/download/fictional reassurance from this student flow, including no-install button labels.

## Evidence and compatibility

Separate actual invitation display, voluntary reply action and acknowledgment display. Record acknowledgment only when presented, never merely because its action committed or on a covered rerender. Deduplicate reply and preserve receipt chronology on reload/Uninstall. Receipt may describe the launch promotion and commitment invitation, the actual reply or lack of recorded reply, and ask whether anticipation affected the player; it must not assert psychological effects or falsely claim the reply was required to earn the grant.

Do not rename old `fictional_install` records to replies or infer a historical reply from installation/opening. New runs should no longer manufacture an install action merely by opening the app. Adjust first-entry validation for old and new legitimate histories without weakening integrity/replay or resetting existing saves. Derive simple reply facts from log evidence rather than adding an independent time/quest system. A brief implementation note should explain exact event/validation compatibility; proceed within these boundaries without another proposal handoff.

## Ownership and delivery

QP Impl38 owns this repair in existing engine/entry/validation/Receipt, focused life UI/controller and tests. Root owns design/decision/packet docs. Other plans' accepted card, race, animation, apartment assets, rest, saving, Receipt facts and phone transitions must remain intact. No wholesale component replacements, report-runtime imports, dependency additions, weather/music mounting or new gig/social rules. Keep authoritative life transitions in `life-progression.mjs`, transactions/events in the engine, routing and rendering separate. New narrative variants must consume these contracts rather than create a second clock or copy economy rules into view code.

Use the established bounded runner after resource preflight. Focused tests and isolated browser evidence: reply and put-down routes both get exactly one welcome ten-pull; no premature grant/phase cost; visible reply/response survive reopen/reload; actual display evidence under Settings/retention; old install-bearing and no-install saves remain valid; genuine first open still unlocks furniture sales and same-session navigation remains fixed. Rebuild the integrated preview coherently without touching owner storage or stopping the existing root server. Source/evidence first, progress last; no additional advisor, packet status, push or deployment. Return for root technical and owner experience review.
