# Plan 28 — Claude starting handoff

Owner assignment: 2026-10-30. Repository: `C:/AI/Quackpot`.
Read `AGENTS.md` and `docs/development/plan-28-apartment-choices-and-diegetic-communications.md`.
This is a Claude-led experience-design investigation, not production implementation.
Sonnet or Opus is the owner's choice; retain your actual model/harness record.

## What to accomplish

Make the apartment feel like a place where the character lives and makes choices,
rather than a background behind unrelated forms. Meals, bills, work and possessions
should belong to that world. Preserve clear costs and consequences, readable actions
and a welcoming experience; don't turn ordinary decisions into a pixel hunt.

Compare TWO coherent presentation directions across breakfast, rent, paid-rent
with zero cash, unpaid rent/escalation and return from the gacha. Possibilities include
handwritten notes, a bill or envelope, a work message on the portrait phone, a meal
at a relevant surface and furniture-sale actions. These are prompts for your judgment,
not a prescribed checklist of props. Sample dialogue and actual player-facing copy
are useful. Make each direction feel like a complete interaction language.

Recommend one direction and explain the human tradeoffs: clarity versus atmosphere,
intrusion versus continuity, emotional specificity versus moralizing, discoverability
versus clutter. The physical companion stays still. It may acquire character through
framing and light, not gacha duck animations or an omniscient lecture.

## First delivery is a proposal

Read the relevant current source and accepted art/transition material. Before building
any executable comparison, send QP Orch a concise mechanism proposal with:

- Exact report-local files and the existing art APIs you would compose.
- Current action/state/log mappings, including what is absent rather than implemented.
- Two comparison directions and what owner feedback would decide between them.
- Scope for any small hypothesis experiments, and proposed browser/Node validation.
- Save/reload, focus, Settings, interruption/Uninstall and reduced-motion handling.

Text storyboards, research notes and copy drafts may be written immediately in your
owned report folder. Wait for root approval before executable prototypes or browser
use. No source integration, repricing, new story rules, asset generation or audio
adoption. After proposal approval, develop the approved comparisons and stop for owner
selection. A later packet will port selected behavior into focused production modules.

## Haiku delegation — lead decides

You are authorized to choose the number, timing and concurrency of Haiku subagents.
There is no numerical call cap. Use them as useful for source exploration, scene/copy
alternatives, relevant reference research or small report-local hypotheses. Do not
substitute a more expensive tier or assume a premium advisor allowance.

Give every task a self-contained brief, a concrete question, relevant input paths,
expected output and boundaries. Draft writers own separate subfolders such as
`reports/development/plan-28-apartment-choices-and-diegetic-communications/drafts/<task>/`.
Read-only researchers need not produce large reports. The lead alone integrates the
recommendation and canonical report. No worker edits shared production files, root
documents, packet status or another worker's drafts. Avoid recursive fan-out; workers
return useful follow-up suggestions to the lead, who decides the next delegation.

Bring your own judgment to their suggestions, check important source claims, prune
weak ideas and stop searches that are no longer helping. Record the actual delegation
and why it helped, without lengthy transcript dumps. Haiku use is a tool, not a quota.

The owner may discuss and approve additional experiments directly with you. Preserve
those authorizations in the progress record; tell orchestration if the plan needs an
amendment. Do not silently convert enthusiasm about a mockup into production authority.

## Context and constraints

The owner now permits at least roughly30minutes for ordinary engaged play and longer
saved experiences, without a selected upper ceiling. No compulsory waits, delayed
Uninstall or post-Receipt retention. Plan29 owns economy/pacing recalibration; do not
change the current $15 rent, wages, prices or health effects here.

Plan36 has independent external creative reviews underway. Those may explore broader
story/interactions and later disorientation. Your job is the coherent ordinary apartment
baseline; leave clear presentation seams for future story variation without building a
generic narrative engine or selecting the disorientation rules.

Read accepted Plan25 desk integration, Plan24 art kit and Shell A transition evidence;
Plan27 selected Layout A and the Receipt honesty rules for separation of live experience
from debrief. Use the current source map and inspect controller/engine/UI ownership.
Reports are review assets, never runtime imports. SVG-first/local-only game contracts
and no runtime network remain binding.

Preserve what actually happens: paying rent successfully with no cash left differs
from an unpaid bill. Depicted character activity differs from what the human clicked.
Receipt evidence remains **we displayed / you did / did this affect you?** An attractive
composition must not imply a payment happened before its action, repeat a reward,
hide an amount or present the zero-cash route as automatic failure.

## Checkpoints and resource discipline

Plan35 is owner-closed. It provides current captured starts for paid-zero rent,
unpaid rent and finale selection, with explicit capture-origin and current-validation
identities. Its paired rent brief can inform later bounded verification, but don't
load saves into the owner's browser or assume checkpoints prove whole-run behavior.
Read `reports/orchestration/plan-35-delivery-review.md` when relevant.

Before any Node launch, inspect existing Node/private memory and coordinate local
server/browser ownership. The owner previously experienced a roughly21GiB Node process;
cause wasn't established. Use the unchanged Plan25 bounded launcher for the packet check:

```powershell
& './reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1' `
  -Executable node.exe -ArgumentVector @('scripts/dev/plan-status.js','check','plan-28')
```

Stop if the check fails. No unguarded Node/npm, watchers, broad smoke suite, installs,
server or browser launch is authorized by this starting handoff. Root will clear exact
executable comparison commands and coordinate any shared browser turn. Text/source
research and draft hypotheses can proceed while those gates remain closed.

## Delivery and ownership

Own only `reports/development/plan-28-apartment-choices-and-diegetic-communications/`.
You are not alone in the tree: preserve foreign changes and commit explicit owned
paths, progress report last. Do not change packet/index/status, global guidance,
production files or other plan reports. No push or deployment.

Deliver the approved comparison, exact current action mapping, recommendation,
remaining owner choices, future bounded implementation ownership and progress report.
State what was inspected and what was actually rendered/tested, along with limitations
and your applicable consultation posture. Model identity and large subagent/test counts
are not evidence of a better experience. Report for review and stop; owner/root close.
