# Plan 20 stable layout and duplicate-help repair review

Date: 2026-10-26. Verdict: technically accepted for owner rendered acceptance, not closed.

Root inspected the working source before commit and final scoped commit `72fa977`, report `f3aac38`, and reproduced `npm test`:140/140 passed. Prior eight focused motion tests remain separate evidence from the repository suite. The repair widens the gacha cap, uses zero-minimum grid tracks and bounded artwork, and preserves keyed reveal/animation updates. Narrow event-only engine methods validate the first actual duplicate reveal, reject premature/spoofed/terminal acknowledgments and derive idempotent shown/dismiss state from the append-only log. No currency, RNG or schema rule changed.

The callout is measured with its text before positioning; viewport/source/exit collision checks defer it when placement is unsafe. A source-card flip-end/cancel listener retries deferred visibility, with listener/rAF cleanup at view destruction. Display acknowledgment occurs after a visible card and safe placement, autosave follows the actual cue/action append, and terminal guards preserve Receipt completeness. The triangle follows the originating card, background opacity preserves opaque text, focus/hover and44pxclose target are provided.

Implementer rendered evidence measures identical0/1/10-reveal desktop cards (~157.28×209.71px),834.4pxgrid within900pxcontainer, and390pxCSS narrow two-column layout without overflow. It reports first duplicate after flip-end without reload, no early help, safe source/Uninstall placement, and Escape/button dismissal persisted after reload. These are implementer observations, not a duplicate root browser pass. Real touchscreen, long-name sample and actual system reduced-motion=true remain unobserved. Temporary test preview ports were cleaned; shared5181server unchanged.

The extra Sol-low repair reviewer was unauthorized. The report explicitly records that budget deviation and accepted findings; it is not credited as permitted main review. Root requested no further reviewer and performed this acceptance directly. Technical correctness of the resulting fixes does not retroactively authorize that consultation.

Owner should inspect stable grid, first-duplicate explanation/tail and prior reveal desynchronization. No visual catalog/race/Dex/rest expansion, packet completion, push or deployment follows. Plan23 production edits remain gated on Plan20 acceptance/source handoff; browser slot free.
