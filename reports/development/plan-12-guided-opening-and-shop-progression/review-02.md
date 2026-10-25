# Plan 12 Repair 01 review — correct the remaining sample witnesses

**Date:** 2026-10-24. **Reviewed:** `8bfd976`, report `0642bd3`. **Disposition:** return to `ready` for narrow Repair 02. The five-beat direction and staged teaching proposal remain useful; do not restart the investigation.

## Resolved

The repair adopts the accepted trial's nominal starting values, removes the invented hard-constraint citation/subtitle and bonus/timer, labels Stage 2 shop ideas as unadopted, uses 80/18/2, respects Plan 06's gate, labels Case B as a future expanded-catalog hypothetical and labels the wireframe/Receipt as mockups. Prior claims of verified PRNG/telemetry/assistive-technology behavior are retracted. These are substantial improvements.

## Remaining material corrections

1. **Cash chronology still contradicts the trial.** `proposal.md:53,198,205,275,285`, `wireframes.html:1007,1177,1561–1569` and progress report show buying on Day 1 dropping cash directly from 15 to 14.01, then treat that as the Day 2 rent squeeze. In the approved trial, Day 1 food is paid before the race/starter, so cash is **10 before buying and 9.01 afterward**. Day 1 wage raises it to 19.01, Day 2 food lowers it to **14.01 before rent**. A brief later projection is fine; it must not be mislabeled as immediate post-purchase cash. If omitting bill interactions in the presentation mock, still show or annotate the actual timeline and matching balances. Starter-pack-alone pull math (240 → one 160 pull +80) must be distinguished from total post-race balance (50+240=290 → one pull +130).
2. **The mock cases do not depict their own claims.** `wireframes.html:1491–1500` uses only four repeated names. Case B merely disables duplicate flags, so its “ten unique” sample still contains repeats marked NEW. Case A has **six duplicate badges**, but its HUD assigns only **one Down**, while the sample Receipt/proposal describes **four duplicates/four Down**. Root independently evaluated the actual card array: A = 10 cards, four unique names, six duplicate flags; B = 10 cards, four unique names, zero duplicate flags. Use separate explicit fixtures and derive counts/Receipt text from the selected fixture. This does not require real PRNG or live event-log implementation.
3. **Preserve the chosen anchor wording.** The revised sample replaces the owner-selected **400% value** anchor with plain “Starter Pack,” even while asking whether comparison value affected the learner. Canonical Tuning and O11 retain that label. Restore the fictional promotional anchor; a neutral explanation may clarify that it is a publisher claim, but do not silently remove the technique the teaching example is meant to expose.

## Review provenance and limits

A requested cold read-only `gpt-6-luna` high review found the cash and fixture inconsistencies; root checked them against the actual sample array, purchase handler and approved timeline. Root additionally checked the missing owner-selected anchor. Repo tests pass 129, but do not verify this static teaching fixture. No new learner-comprehension or rendered-accessibility claim is made.

Use `repair-02.md`; correct the sample witnesses and return for owner selection. Keep all previously corrected labels and gates. No full economy sweep, production UI work or broader proposal rewrite is requested.
