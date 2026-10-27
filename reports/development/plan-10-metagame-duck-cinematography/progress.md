# Plan 10 progress — physical duck cinematography

Date: 2026-10-27

## Owner visual feedback repair (2026-10-27)

QP Orch recorded the owner's feedback and authorized a bounded report-only repair in this folder. The four supplied Tinkercad captures were inspected as proportion/orientation references only; D2 remains the material and physical-object reference. The proposal now records the repair landmarks, furniture painter order, tabletop staging, and warm-lamp comparison before the updated SVG/HTML work.

The rear three-quarter view now turns the head and body together, narrows the body depth, puts the nape toward camera, separates near/far wing scale and overlap, and leaves only a small eye/beak at the far edge. The high view foreshortens the head/body and shows paired wings with the face compressed toward the near edge. The low view raises the head above a distinct shaded underside plane. These are authored 2D projections for owner comparison; same-object coherence remains an owner judgment.

The fixed apartment remains one room. Sofa and table legs are painted behind/below their solid surfaces. The close composition is a desk/table crop with the static duck beside a supported portrait phone with a blank screen, plus generic pen, papers, keys, and lip balm. Other apartment areas remain future proposals. The warm desk-lamp control now lights the source visibly and creates a focused amber pool with falloff and lower-left contact shadows; neutral leaves the lamp off for a same-composition comparison. The duck stays inanimate and unchanged across views.

## Updated rendered evidence and limits

- The refreshed five-view contact sheet was inspected at **1280 × 720 CSS pixels**. The rear body now reads more compact than the profile and separates the near and far wings; high and low views have visibly different foreshortening/underside treatment. The apartment wide render shows the table/sofa legs below their surfaces.
- The desk close-up was rendered in neutral and warm-lamp conditions at the same front view. The phone remains upright and supported, the screen is blank, the listed everyday props are visible, the duck rests at the tabletop edge, and the warm condition illuminates the duck and desk while leaving the outer room subdued.
- At **390 × 844 CSS pixels**, the view/composition/light controls stack without horizontal overflow in the observed viewport. Wide-shot caption placement no longer covers the duck. The desk close crop enlarges the duck while retaining the phone and props. Browser zoom levels 100%, 200%, and 400% remain unverified; viewport overrides were used only for responsive-size observations.
- The final rear-body and low-underside refinements were inspected on the refreshed contact sheet, but their close-crop renders were not rechecked after those last edits. QP Orch directed no further browser turn for this repair, so close-detail behavior for those exact final shapes remains unverified.

The earlier one-time advisor consultation and requested/observed model discrepancy remain as recorded below; no repair reviewer was added, per the orchestration repair direction. No production, canonical, packet-status, or non-owned files were changed by this work. The working tree contains concurrent `src/ui` edits from other work; they are preserved and excluded from this delivery.

## Overall summary

The packet check passed and the owner/orchestrator approved the bounded D2/2D proposal before preview authoring. This delivery contains a local report preview with five static SVG views, three apartment framings, neutral/window/dark lighting controls, view and composition IDs, and a copyable owner-note field. After root's comparison with D2, the drawings were refined to show a distinct round head/neck overlap, rounded body, raised tail, molded lobed wing, dimensional upper/lower bill, angle-specific occlusion, and a restrained lower-body shadow. The physical duck remains static and rubber-like; no E2 paper anatomy, production code, new story mechanic, 3D pipeline, remote asset, or dependency was added.

The model sheet is an authored approximation of the selected D2 reference, not accepted production art. Same-object coherence and emotional interpretation remain for owner review. QP Orch source-checked the final clipping helper and verified it in a fresh render. The investigation artifact is ready for owner visual review; it is not production art and packet closure remains separate.

## Files changed and artifacts

- `reports/development/plan-10-metagame-duck-cinematography/proposal.md` — approved model-sheet, five-view, staging, lighting, and zoom-check proposal.
- `reports/development/plan-10-metagame-duck-cinematography/preview.html` — isolated interactive local preview with five SVG views (P10-V01–V05), three static compositions (P10-C01–C03), three room-light controls, placeholder conversation copy, and copyable review notes.
- `reports/development/plan-10-metagame-duck-cinematography/duck-views.js` — five static SVG source views, kept separate from the storyboard controls for focused review.
- `reports/development/plan-10-metagame-duck-cinematography/progress.md` — this handoff report.

## Commands and checks

- `node scripts/dev/plan-status.js check 10` — **RUNNABLE**.
- `Invoke-WebRequest http://127.0.0.1:5181/Quackpot/reports/development/plan-10-metagame-duck-cinematography/preview.html` — **HTTP 200**.
- `node --check .../duck-views.js` and `new Function(...)` against the inline module body — valid after the revised view module was added.
- Python `xml.etree.ElementTree` parsed all five revised static SVG views — all well formed. The source views have no IDs, so there are no duplicate SVG IDs to resolve.
- Browser inspection used isolated in-app tabs at **1280 × 720 CSS pixels**, **devicePixelRatio 1.25**, and **visualViewport.scale 1**. The rendered apartment stage measured **1120 × 540 CSS pixels**. The contact sheet rendered all five updated views; selected rendered combinations included front/wide/neutral, side/medium/window, high/close/neutral, and low/close/dark. Copyable notes updated to the selected `P10-V05 / P10-C03` state.
- An initial render looked like the duck floated above the tabletop because the SVG viewBox was vertically centered. SVG content was bottom-aligned and each of the three composition offsets was tuned. Reloaded front/wide and side/medium views visibly rest on the tabletop.
- The first D2 correction removed the bean-like body, added a rounded head/neck overlap, tail, lobed wing and upper/lower bill, and strengthened the high-angle foreshortening after it still read too front-facing at contact-sheet size. A black-looking belly stripe seen in an intermediate low/dark render came from a too-high shadow boundary; the five views now use a lower, unoutlined, lighter shadow region. A fresh `?rev=2` low/close/dark render showed no separate outlined belly panel.
- Root's subsequent source review found that the lower shadow still crossed the outer contour. The preview now clips each shadow to that view's body path and repaints the body outline above the shadow. The clip ID is generated separately for every SVG instance; in the final low/close/dark render, six SVG IDs (five contact-sheet images plus the live stage image) were present and all six were unique. The shadow had a clip reference, and the rendered outer stroke remained continuous with no side wedges.
- Actual browser zoom was **not verified**. In the first tab, `Control+0`, `Control+plus`, and `Control+equal` caused no measurable change in DPR, `innerWidth`, or `visualViewport.scale`. No CSS scaling or viewport override was counted as browser zoom. Therefore 100%, 200%, and 400% browser-zoom checks remain outstanding.
- All isolated browser tabs were closed and their slots released. No owner tabs or saves were used. The revised tabs' console showed no errors or warnings.

## Advisor consultation

One read-only consultation was attempted after the main preview and initial rendered inspection. **Requested:** `gpt-6-sol`, explicit low effort. **Observed:** the reviewer self-reported “GPT-6.1 Sol.” The requested and reported model labels do not match; this discrepancy is recorded rather than treated as a verified exact-model match. The tool surface does not establish structural read-only enforcement, so the posture was **instruction-read-only with post-hoc verification**. A subsequent working-tree status showed only the Plan 10 folder as untracked and no reviewer-authored files or other mutations. No second reviewer was launched.

### Findings and dispositions

1. **Close framing may obscure the subject — rejected after root's rendered check.** The single allowed reviewer raised a source-based concern about the 110% frame height. QP Orch's later rendered check found that the close view keeps the duck's head visible; the revised high/close and low/close shots also showed the head within the stage in the inspected screenshots. The close framing remains intentionally tight.
2. **Dark treatment may reduce detail legibility — rejected as a demonstrated defect after root's rendered check.** The reviewer inferred a possible risk from the overlay, but QP Orch's neutral/dark close observations found readable outlines. No measured contrast or emotional-effect claim is made.
3. **Container accessible name may not be exposed — no code change; AT behavior remains unverified.** The inserted SVG has `role="img"` and a view-specific accessible label, while the adjacent `aria-live` status announces the selected view, composition, and lighting. No assistive-technology test was performed.

The reviewer also found no obvious control-state bug, no remote assets or network behavior in the supplied artifact, and a consistent shared yellow/orange/brown molded-toy treatment across the five templates. Root's render review then identified the D2 mismatches and later shadow-contour leak that prompted the bounded art revisions. The final clip repair source and rendering were sent to QP Orch for its independent source check. These are source/review observations, not owner approval of the illustrations.

## Problems encountered and resolution

- The initial projections did not match D2 closely enough: the head/body merged, tail and molded wing landmarks were weak, the bill lacked a lower plane, and the belly shadow looked like a separate strip. The views were redrawn with those landmarks and differentiated angle occlusion; the high-angle view was flattened after a contact-sheet inspection.
- An intermediate low/dark render showed a black-looking abdominal stripe. The cause was a shadow form whose boundary sat too high in the body; all five shadow shapes were lowered, lightened, and left without strokes, then low/close/dark was re-rendered.
- The initial SVG frame alignment left visible whitespace beneath the duck, making it appear to float. The SVGs now use bottom alignment and each composition has a separately tuned bottom offset. Wide and medium renders were rechecked against the tabletop.
- The shadow fill initially interrupted and extended outside the body outline. Unique per-SVG-instance clipping plus a final outline pass resolved the visible leak in the low/close/dark render; the same helper applies across all five templates and the contact-sheet/live instances.
- QP Orch independently source-checked the helper and fresh-rendered the low/close/dark view. It confirmed the continuous contour, absence of golden wedges, and six unique IDs for six SVG instances.
- The in-app browser did not expose a demonstrable actual-zoom control. This was reported as unverified rather than approximated with CSS transforms, viewport changes, or an alternate uncoordinated browser.

## Remaining risks and follow-ups

- Owner visual review remains the next gate. The D2 set is still an authored approximation, and actual browser zoom remains unverified.
- Actual 100%, 200%, and 400% browser zoom remains unverified; stroke and close-detail quality at those browser zoom levels is unknown.
- The authored five projections have not been approved as a coherent same-object model sheet; owner interpretation remains necessary, especially for high/low-angle projection and rear-view geometry.
- Assistive-technology behavior was not tested. Root's visual check found outlines readable in neutral/dark close views; this is a visual observation, not a contrast ratio.
- The preview is report-only and does not establish production integration, learner readiness, or emotional impact.

## Consultation declaration and review readiness

Advisor consultation ran once with the requested/observed model discrepancy recorded above. Review posture: instruction-read-only with post-hoc verification. No repeat consultation is planned under the one-reviewer budget.

**Ready for owner visual review: yes, as an investigation artifact.** QP Orch independently source-checked and rendered the final repair. This is not accepted production art or packet closure. Actual 100%, 200%, and 400% browser zoom remains unverified. Packet status was not changed.

## Sonnet whole-object view redraw delivery (2026-10-27)

Followed `reports/orchestration/plan-10-sonnet-view-handoff.md` with the owner's four Tinkercad captures as proportion/orientation witnesses. Diagnosis, landmark model, camera table (front 35°/+12°, side 90°/+5°, rear 148°/+16°, high 35°/+52°, low 35°/−16°), occlusion rules, per-view selection and remaining failures are in `sonnet-view-repair.md`; the geometry approach is appended to `proposal.md`.

- **Changed:** `duck-views.js` (all five views redrawn; same keys/interface), `preview.html` (per-instance id uniquifier replaces the old body-path regex; compact candidate-comparison section), `proposal.md`. **Added:** `sonnet-view-repair.md`, `haiku-experiments/` (spec, guides, ten Haiku experiments, `references.md`), `sonnet-candidates/` (five projection-baked drafts and offline contact sheets).
- **Method:** a throwaway projection script (session scratchpad, not shipped) produced consistent silhouettes and tracing guides; ten Haiku subagents (improve-a-copy and from-scratch per view) and one Haiku web researcher were run at the owner's request this session. The selected drawing per view is recorded in `sonnet-view-repair.md`.
- **Verified:** `node --check duck-views.js`; all five views (after id uniquification) and all candidate SVGs parse as XML; `git diff --check` clean on owned files; offline Pillow raster of the five selected views and of the candidate grid.
- **Browser (owner-granted slot, isolated tab, 1200×800):** contact sheet, candidate grid, medium stage (rear), desk close-up under warm lamp (low, rear) and neutral (high); enlarged crops of rear/high/low by CSS scaling in an overlay (not browser zoom). **Not verified:** actual browser zoom 100/200/400% (Ctrl+= had no effect on DPR/viewport scale), front/side close crops, window light. Viewport reset, subagent file tabs closed.
- **Still failing or weak:** high angle reads closer to a plump high three-quarter than a true look-down; low reads partly as a bowl with a plate base and a stacked-pill bill; head reads as a ball on the body in side/rear. Final acceptance is the owner's.
- Plan23's `src/` edits were left untouched. Packet status unchanged. Nothing pushed.
