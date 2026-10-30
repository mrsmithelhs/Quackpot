# Plan 28 — Mechanism and experience proposal (for root review)

Status: **proposal only.** No executable prototype, browser or server use has happened. Waiting for root clearance
before building the comparison described in §6. Date 2026-10-30. Lead: Claude Opus 5.5 (Claude Code desktop).

Companion files: [current-mapping.md](current-mapping.md) (what exists, with line references) ·
[storyboards.md](storyboards.md) (moment-by-moment copy for both directions) · `drafts/` (Haiku copy drafts, superseded
by storyboards where they differ).

## 1. The problem in one paragraph

Today every ordinary life decision is drawn inside the landscape Quackpot phone: the rent card is a phone-stage card
("Your landlord arrives…"), paid-zero and unpaid rent are alarm-styled modals over the gacha frame, breakfast is a
gacha button label that is never shown, wages and Days 2–3 food are silent, and selling the couch never changes the
apartment even though the art kit can draw it gone. The apartment the player names their duck in disappears as soon
as the phone turns. Goal: life happens in the apartment, the gacha happens on the phone, and moving between them is
legible, honest about money, and never a pixel hunt.

## 2. Shared baseline (both directions)

These rules hold in A and B, so the comparison isolates presentation language, not honesty or mechanics.

1. **Two places, one rule.** Life moments (morning ledger, rent, zero-cash, ladder, sale consequence) render in the
   apartment; gacha/race/Dex render on the landscape phone. Entering a life moment from the phone plays the existing
   `stageTransition.run('return')`; leaving to the next gacha step plays `run('enter')`. Transitions start only after
   the state for the next moment is persisted, and never mutate state (already true, `stage-transition.js:3`).
2. **Location is derived.** A pure `lifeLocation({step, activeModal, activeBill, phase})` decides apartment vs phone, so
   reload lands where the player was (fixes the `phoneOpen = step !== 'desk'` mismatch for life steps without new
   persisted UI state). No new step ids.
3. **Mutations stay where they are.** Only the existing clicks mutate: Pay rent, zero-cash choice, ladder Accept/Decline.
   Food and wage remain automatic engine calls at today's points; they are *shown after the fact* in a past-tense
   morning ledger ("Breakfast — $5.00 paid. Cash $10.00."). There is no "Eat breakfast" button pretending to be a choice.
4. **Amounts are never atmospheric.** Every money button states cash and health effects; cash on hand is visible on
   every life surface. Paid-zero is neutral ("Rent paid in full. Cash $0.00. Wage +$10.00 tonight."), never alarm red.
5. **Endings are disclosed at the click.** The last eligible ladder step's decline says the rent stays unpaid and the
   run ends (fixes current-mapping §4.1). No new "go back to the offers" step — both Haiku drafts proposed one; it is a
   new rule and is rejected here.
6. **Sales change the room.** After `sell_couch`/`sell_tv`, the living room renders with `furnishings: {couch|tv:
   'removed'}` derived from `state.assetsSold` (design.md:158 "The apartment empties as items are sold").
7. **The duck stays still.** Only `duckView`, `framing` and `light` vary. It never speaks, reacts or comments.
8. **Exit is never inside the fiction.** HUD Save / Settings / Uninstall stay exactly as now in every apartment surface.

**Day routing under both directions** (same engine calls and order as today; only where they are shown changes):

```
D1  desk ──enter──▶ phone: opening pulls ──return──▶ apartment: morning ledger (food $5 already charged)
    ──enter──▶ phone: race 1 → starter offer ──return──▶ apartment: D2 ledger (wage, food) → rent bill
    rent: Pay ─┬─ cash ≥ 15, > 0 after ─────────────▶ evening
               ├─ cash = 0 after ─▶ paid-zero choices ─▶ evening
               └─ cash < 15 ──────▶ ladder (one offer at a time) ─┬─ paid ─▶ evening
                                                                  └─ last decline ─▶ Receipt
    evening (wage, D3 food, both automatic) ─▶ apartment: D3 ledger ──enter──▶ phone: race 2 ─▶ Receipt
Any phone step: HUD Return ─▶ desk-side day note (no mutation) ─▶ Open Quackpot ─▶ same step
Any step: HUD Uninstall ─▶ retention ─▶ Stay (restore step/modal) | Leave (Receipt)
```

## 3. Direction A — "Things in their places"

Each kind of communication lives where it would in a real home. Camera *cuts* (no free navigation, no hotspots to find):

| Moment | Scene (`renderScene`) | Communication | Real HTML controls |
|---|---|---|---|
| Morning ledger (D1 after gacha, D2, D3) | `kitchen`, `medium`, `light:'window'`, `duckView:'side'` — duck on the bar beside the mug and fruit | Paper meal note card over the bar: what was eaten, $5.00 paid, overnight wage line on D2/D3 | "Continue" |
| Rent due | `desk-top` (notepad, sticky note, coins), `window` | Landlord's paper bill on the notepad, typed amount and cash on hand | "Pay rent ($15.00)" |
| Paid-zero | `desk-top`, `warm` (evening approaching) | Same bill, now stamped PAID; three choices listed under it | Continue / Extra night shift / Sell couch |
| Extra shift offer | `desk-side`, `warm` — the portrait phone lights with a text from the shift lead | Work message on the portrait phone (work is the one thing that arrives from outside) | Accept / Decline |
| Couch / TV offer | `living`, `wide`, `neutral` — couch or TV in frame | Paper "for sale" listing card beside the item | Accept / Decline |
| Card advance offer | `desk-top`, `warm` | Card-statement slip | Accept / Decline (discloses ending if last) |
| Sale consequence | `living`, `wide`, `furnishings` removed | One line: "The couch is gone. +$10.00." | Continue |
| Return from gacha | `desk-side`, light by time of day | Sticky-note day summary beside the phone ("Rent $15.00 due this afternoon") | "Open Quackpot" (existing) |

Character: the apartment feels inhabited and the losses are visible. Risk: four camera locations in one afternoon can
read as hopping around; paper is CSS/HTML styling, not drawn art (kit has no envelope/bill/plate props — see §7 Q2).

## 4. Direction B — "One desk, one phone"

Everything happens at the accepted Plan 25 desk composition. The portrait phone is the character's ordinary life;
turning it landscape is Quackpot. Portrait apps are HTML in the existing `.apartment-phone-content` region.

| Moment | Scene | Communication | Controls |
|---|---|---|---|
| Morning ledger | `desk-side`, `window` | "Today" notes app: breakfast $5.00 paid, wage line | "Continue" |
| Rent due | `desk-side`, `window` | Messages thread from the building owner | "Pay $15.00 rent" |
| Paid-zero | `desk-side`, `warm` | Owner's "all set" reply + bank balance line $0.00, wage tonight | Continue / Extra shift / Sell couch as quick replies |
| Ladder offers | `desk-side`, `warm` | One sender per offer: diner shift lead, neighbour buying the couch, neighbour buying the TV, bank card advance | Accept / Decline |
| Sale consequence | the only cut: `living`, `wide`, `furnishings` removed | "Tomás picked up the couch. +$10.00." | Continue |
| Return from gacha | `desk-side` | Portrait home screen with day / cash / health line; no badges | "Open Quackpot" (existing) |

Character: one stable place, people with small personalities, very low navigation cost, continuity with art the owner
has already accepted. Risk: life still reads as screen UI, and the same device that hosts the gacha now delivers life —
notifications can start to feel like the gacha's pressure techniques (no badges, counters or sounds allowed).

## 5. What owner feedback should decide

Show both directions on the same three scenarios (paid-zero, unpaid ladder, D2 return) and ask:

1. **Place or people?** Does the character's life feel more present through rooms and objects (A) or through people
   writing to them (B)?
2. **Hopping vs sameness.** Do A's cuts feel like moving through a day, or like being dragged around? Does B's single
   desk feel calm, or like "still just a phone"?
3. **Phone meaning.** Is it valuable that the gacha and life share one device (B's quiet point), or should life be
   physically separate from the phone (A)?
4. **Paper without drawn paper.** Is a CSS paper card acceptable, or does A need new SVG props (separate proposal)?
5. **Voices.** Landlord tone: formal management vs friendly building owner (both drafted in storyboards).

**Provisional lead lean: A**, because it is the only direction that uses the existing kitchen/living art and makes the
consequences of selling visible in the place itself, which is what design.md:158 asks for; B's people-voices are adopted
for A's work message. This lean is to be confirmed or overturned by the rendered comparison, not by this text.

## 6. Proposed executable comparison (needs root clearance)

Owned files, all under `reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/`:

| File | Role |
|---|---|
| `index.html`, `comparison.css` | Page shell; direction toggle A/B, scenario picker, viewport-independent layout; inline event panel |
| `comparison.js` | Mounts one scenario × direction; real HTML controls; disables controls on first activation |
| `presentation.mjs` | Pure: `lifeLocation(state)`, `sceneFor(direction, moment, state)` → `renderScene` options, `furnishingsFrom(assetsSold)` |
| `copy.mjs` | Lead-owned strings for A and B (from storyboards.md) |
| `scenarios.mjs` | Scenario setup: Plan 35 fixtures (`rent-paid-zero`, `rent-unpaid-escalation`) restored **in memory** via `GameEngine.fromEnvelope`; synthetic, labelled display-only states for mornings and return |
| `presentation.test.mjs` | Node `--test`: H1–H3 below |

Imports (read-only): `../../../../src/assets/apartment/index.mjs` (`renderScene`, `FRAMINGS`, `LIGHT_MODES`,
`FURNISHING_STATES`) and `../../../../src/core/game-engine.mjs` (`GameEngine`). Nothing in `src/` imports the report
(Plan 24 pattern). Fixture JSON is read by `fetch` from the same local dev origin; no `localStorage` reads/writes.
Each Pay/Accept/Decline calls the real engine, and the side panel lists the appended event types and cash/health/debt,
so reviewers can see the presentation changes nothing mechanical.

Small hypotheses (Node, bounded launcher, one process each):

- **H1 location is total and reload-stable:** `lifeLocation` returns exactly one place for every reachable
  `{step, activeModal}` combination (enumerated from main.js), and life steps never map to the phone.
- **H2 sales show in the room:** `furnishingsFrom` matches `assetsSold` for {}, couch, tv, both; renderScene meta echoes it.
- **H3 copy honesty lint:** every mutating control's label in `copy.mjs` contains its cash and health/debt effect;
  no label says "Paid" before payment; forbidden-word list (broke, empty!, hurry, limited, last chance, trap, free).

Browser (one root-coordinated shared turn, existing dev server only, one isolated tab, closed after):
1280×720 and 390×844; keyboard-only walk of paid-zero and full unpaid ladder in both directions; reduced-motion
emulation; screenshots saved report-local; `localStorage` key list compared before/after (must be unchanged).

Proposed Haiku follow-ups after clearance (disjoint `drafts/<task>/`): one "first-time student read" pass per direction
on the rendered copy (reads `copy.mjs`, writes notes only). No Haiku browser use.

## 7. Lifecycle handling (both directions)

| Concern | Handling proposed for the comparison and later integration |
|---|---|
| Save / reload | Location from `lifeLocation(state)`; morning ledger is display-only, so re-showing it after reload repeats no mutation; Pay/choices persist exactly as now |
| Duplicate / stale clicks | First activation disables every control in the surface until re-render; engine idempotency guards unchanged |
| Focus | On arrival, focus the surface heading (`tabindex=-1`), then Tab reaches the primary control; after a choice, focus the next surface's heading; after Return, existing `#btn-start-app` focus |
| Settings | Opens above the life surface as now; closing restores focus to the opener (existing `settingsTriggerId`) |
| Interruption / Uninstall | HUD Uninstall unchanged; `interruptedContext` restores step and modal; life surface re-renders from state |
| Reduced motion | Scene cuts are instant; transitions use the existing static path; no paper slide, stamp or phone-buzz animation is required for meaning |
| Accessible text | All communication is real HTML text; scenes stay `decorative: true`; each surface has a one-line summary heading |

## 8. Owner / root questions

- Q1 Direction (A or B) and landlord voice.
- Q2 Is CSS-styled paper acceptable, or should A's paper become a separate SVG-prop proposal?
- Q3 Morning ledger as display-only (proposed) vs making breakfast a click that triggers the charge (moves a mutation).
- Q4 Should life displays ever be recorded as `cue_shown`? Out of scope here (schema change); noted for Plan 27/29.
- Q5 Late companion pawn (design.md:135) is unimplemented; A/B leave a seam (desk-side empty-desk framing) but do not design it.

## 9. Boundaries kept

No source, packet, index, status, root-doc or other-plan edits. No economy, story or log changes. No new art or audio.
No Node beyond the bounded packet check. Plan 36 late-game distortion is not selected; both directions keep copy in
`copy.mjs` and scene choice in `sceneFor`, which is the seam future story variation would use.
