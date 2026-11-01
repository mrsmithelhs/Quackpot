# Prior Claude chat prompts for historical calibration baselines

Paste the matching prompt below into an EXISTING art chat with the relevant history. These are curator tasks, not reviews or new drawings. Summaries are answer-bearing and remain out of reviewer inputs. No new model calls or helpers are needed for recalling this chat; if history is unavailable, record that rather than inventing it. Existing screenshots/version evidence are preferable to recreated pictures. The owner will relay completion to QP Orch/Plan50.

## Prompt A — apartment/duck art (Plan10/24)

Please prepare a historical evidence package for Quackpot Plan50 using this chat's duck-view and apartment art iterations. Write ONLY under C:/AI/Quackpot/reports/development/plan-50-cross-harness-visual-and-audio-calibration/curator-inbox/claude-art-plan10-24/. Do not modify any earlier file, source asset, packet or status. Your role is curator, not reviewer. Use the shared instructions below; focus on 2–3 particularly informative examples where my feedback concerned viewpoint/proportion, framing, shelf/prop placement or object consistency, and include a satisfactory or preference-only example. Don't generate new art or conduct new paidresearch.

## Prompt B — Ren art (Plan41/45)

Please prepare a historical evidence package for Quackpot Plan50 from this chat's Ren art iterations. Write ONLY under C:/AI/Quackpot/reports/development/plan-50-cross-harness-visual-and-audio-calibration/curator-inbox/claude-ren-plan41-45/. Do not modify earlierreports, art/source, packets or status. Your role is curator, not reviewer. Use the shared instructions below; choose 2–3 examples involving hand/box contact or anatomy, couch/body/framing, and a useful accepted/preference-only control. Include what the image actually showed BEFORE my feedback and which changes were subsequently requested; do not backdate later design choices.

## Prompt C — keys (Plan47 Sonnet drawing)

Please prepare a historical evidence package for Quackpot Plan50 from this chat's keys work. Write ONLY under C:/AI/Quackpot/reports/development/plan-50-cross-harness-visual-and-audio-calibration/curator-inbox/claude-keys-plan47/. Do not modify productionkeys or earlier studyfiles, source, packets or status. Your role is curator, not reviewer. Use the shared instructions below; record major intermediate versions and my actual feedback about ring size/attachment, keyshape/perspective, scale and accepted final version. Separate closeupquality from actualnarrow/desktopreadability and preserve what wasn'tverified. Don't redraw or improve anything now.

## Shared instructions — append these to whichever prompt you use

Create baseline.md plus cases.json and an images/ subfolder if exactexistingimages can be copied legitimately. Do not copy commercial referencephotos or personaldata into this publicrepo. Use existing originalart/artifactimages and their exactpaths/revisions. If copying originalauthoredimages would create large duplication, listpaths and hashes rather than duplicate; don't use browser to recreate missing history without furtherownerapproval.

For each case provide:
- Neutral case ID and a short task/context available BEFORE my feedback; distinguish missingcontext.
- Chronology of exact artifactversions, absolute sourcepaths, commit/blobhash or filehash when available. Say whether it's an originalcapturedimage, SVGsource, or laterreconstruction. Preserve originals; don't silently annotate/resize them.
- My actual feedback verbatim where available, with message/date locator; otherwise label paraphrase and confidence. Do not invent quotations or turn your own recommendation into my decision.
- What changed afterward, and whether I explicitly accepted/rejected it or merely moved on. Unknown is a valid result.
- Classify feedback: visibledefect, experience/consistencyissue requiringbriefcontext, aestheticpreference, or newrequirementintroducedlater. Explain what a reviewer could/couldn't reasonably know beforehand.
- Knownlimitations: mismatchedversion, unseenbehavior, ownerreferenceimagesmissing, otherpeople'sedits, etc.

This is not an argument that the owner was right or that a model should agree. Include ambiguous cases and your own failedattempts candidly. No extra critique, newdesigns or cleaned-upfictional history. Keep eachcase compact; retain exactsupportingtext separately if needed. A model might identify a differentvalidproblem; do not reduce the baseline to accept/rejectlabels.

Treat baseline.md and cases.json as HELD-BACK answer material. Never write reviewerprompts containing ownerverdicts into reviewer-inputs/. Do not launch Haiku/otherreviewers of these cases from this samecontext; the calibration lead will run coldreviewers separately.

Record a short submission.md listing files, provenancegaps and approximatebytes; no student/privateaccountdata. Commit ONLY your assignedsubfolder by explicitpath if normalharnessgitpermissionsallow, serializing with otheragents; no gitadd-A/push. If blocked, leavefiles and report, never forcepermissions. End by giving QP Orch exactpaths and commithash if committed. Do not read othercuratorinboxes, baselineanswers or Plan50rawmodeloutputs.
