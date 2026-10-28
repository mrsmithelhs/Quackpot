// src/core/receipt.mjs
// Receipt projection: a pure function of the append-only event record.
// It never reads run state. Each finding has three registers (O1 honesty rule):
//   displayed - only content recorded as shown (cue_shown / offer_shown / retention_modal_shown / reveal_shown)
//   did       - recorded actions and results, including results committed but never shown
//   question  - a fixed discussion question; never an asserted answer
// Every line carries `seq`, the log entry it comes from (null only for "none recorded" statements).

import { verifyChain, verifyCompleteness } from './event-log.mjs';
import { formatRaceRating } from './race-rest.mjs';

const money = (x) => `$${Number(x).toFixed(2)}`;

export const TECHNIQUES = [
  ['currency_obfuscation', 'Currency obfuscation', 'Did the gem prices and leftover balances affect your purchases?'],
  ['fear_of_missing_out', 'Fear of missing out', 'Did the banner timing message affect your decisions?'],
  ['sunk_cost_pity', 'Sunk cost via pity', 'Did the pity counter affect how many pulls you made?'],
  ['power_creep', 'Power creep', 'Did newer ducks change how you used your older ducks?'],
  ['anchoring', 'Anchoring', 'Did the comparison value on the starter offer affect your judgment of later offers?'],
  ['exit_friction', 'Exit friction', 'Did the retention offer affect your decision to leave or stay?'],
  ['completion_pressure', 'Completion pressure', 'Did the set progress display affect your pulls?'],
  ['social_comparison', 'Social comparison', 'Did the rival duck affect what you did next?'],
  ['secondary_currency', 'Secondary-currency obfuscation', 'Did Down affect how you valued duplicate ducks?'],
  ['pressure_on_possession', 'Pressure on an owned possession', 'Did the pawn offer affect how you valued your own duck?'],
];

function line(text, seq) {
  return { text, seq };
}

export function projectReceipt(entries) {
  const chainValid = verifyChain(entries);
  const isComplete = verifyCompleteness(entries);
  const ofType = (t) => entries.filter((e) => e.type === t);
  const shown = (technique) =>
    entries.filter(
      (e) => ['cue_shown', 'offer_shown', 'retention_modal_shown'].includes(e.type) && e.payload.technique === technique,
    );
  const purchases = ofType('purchase');
  const races = ofType('race_result');
  const drawsCommitted = ofType('draw_committed');
  const reveals = new Map(ofType('reveal_shown').map((e) => [e.payload.commitSeq, e]));

  // Pull ledger: committed outcome versus actually-displayed outcome, per ordered draw.
  const purchaseBefore = (seq) => [...purchases].reverse().find((p) => p.seq < seq && /pull/.test(p.payload.kind));
  const pullLedger = drawsCommitted.map((c) => {
    const r = reveals.get(c.seq);
    const buy = purchaseBefore(c.seq);
    return {
      drawIndex: c.payload.drawIndex,
      of: c.payload.of,
      purchaseKind: buy?.payload.kind ?? null,
      pityBefore: c.payload.pityBefore,
      drawNumberInWindow: c.payload.drawNumberInWindow,
      preDrawOdds: c.payload.odds,
      committed: { rarity: c.payload.rarity, identity: c.payload.identity, duplicate: c.payload.duplicate, downGained: c.payload.downGained },
      committedSeq: c.seq,
      revealed: !!r,
      revealSeq: r?.seq ?? null,
      displayed: r ? { rarity: r.payload.rarity, identity: r.payload.identity, duplicate: r.payload.duplicate, downGained: r.payload.downGained } : null,
    };
  });

  const findings = [];
  for (const [id, label, question] of TECHNIQUES) {
    const cues = shown(id);
    const revealedDup = id === 'secondary_currency' ? ofType('reveal_shown').filter((e) => e.payload.duplicate) : [];
    if (cues.length === 0 && revealedDup.length === 0) continue; // a technique is named only if its cue fired
    const displayed = [];
    const did = [];
    const first = cues[0];
    const afterFirst = (e) => !first || e.seq > first.seq;

    if (id === 'currency_obfuscation') {
      for (const c of cues) {
        const b = c.payload.bundles.map((x) => `${x.gems} gems for ${money(x.price)}`).join('; ');
        displayed.push(line(`Bundle shop shown (${c.clock.label}): ${b}; one pull costs ${c.payload.pullCost} gems.`, c.seq));
      }
      const bundles = purchases.filter((p) => p.payload.kind === 'bundle');
      for (const p of bundles) did.push(line(`Bought ${p.payload.bundleGems} gems for ${money(p.payload.price)} (${p.clock.label}); gems after: ${p.payload.gemsAfter}.`, p.seq));
      if (!bundles.length) did.push(line('No bundle purchase recorded.', null));
      const pulls = purchases.filter((p) => /pull/.test(p.payload.kind) && p.payload.cost > 0);
      if (pulls.length) did.push(line(`${pulls.length} paid pull purchase(s) recorded, ${pulls.reduce((s, p) => s + p.payload.cost, 0)} gems spent in total.`, pulls[0].seq));
    } else if (id === 'fear_of_missing_out') {
      for (const c of cues) {
        displayed.push(line(`Message shown (${c.clock.label}): "${c.payload.label}" for banner ${c.payload.banner + 1}.`, c.seq));
        const bought = purchases.filter((p) => ['bundle', 'starter'].includes(p.payload.kind) && p.payload.banner === c.payload.banner);
        if (bought.length) for (const p of bought) did.push(line(`Purchase recorded during banner ${c.payload.banner + 1}: ${p.payload.bundleGems} gems for ${money(p.payload.price)}.`, p.seq));
        else did.push(line(`No gem purchase recorded during banner ${c.payload.banner + 1}.`, null));
      }
    } else if (id === 'sunk_cost_pity') {
      displayed.push(line(`Pity counter shown ${cues.length} time(s); first at ${cues[0].payload.counter} of ${cues[0].payload.hardPity}, last at ${cues[cues.length - 1].payload.counter} of ${cues[cues.length - 1].payload.hardPity}.`, cues[0].seq));
      const after = drawsCommitted.filter(afterFirst);
      if (after.length) {
        const ls = after.map((d) => d.payload.odds.legendary);
        const minOdds = Math.min(...ls);
        const maxOdds = Math.max(...ls);
        const soft = after.filter((d) => d.payload.advancesPity && d.payload.drawNumberInWindow >= cues[0].payload.softPityStart && d.payload.drawNumberInWindow < cues[0].payload.hardPity).length;
        const hard = after.filter((d) => d.payload.advancesPity && d.payload.drawNumberInWindow >= cues[0].payload.hardPity).length;
        did.push(line(`${after.length} draw(s) committed after the first display; actual pre-draw legendary odds ranged from ${minOdds} to ${maxOdds}; ${soft} draw(s) had raised soft-pity odds; ${hard} draw(s) reached the hard guarantee.`, after[0].seq));
      } else did.push(line('No draw recorded after the counter was shown.', null));
    } else if (id === 'power_creep') {
      for (const c of cues) displayed.push(line(`Banner ${c.payload.banner + 1} showed new ducks: ${c.payload.newIdentities.join(', ')}.`, c.seq));
      const rs = races.filter(afterFirst);
      if (rs.length) {
        const pl = rs.map((r) => r.payload.place);
        did.push(line(`${rs.length} race(s) recorded after the first new-duck display; placements: ${pl.join(', ')}.`, rs[0].seq));
      } else did.push(line('No race recorded after the display.', null));
    } else if (id === 'anchoring') {
      for (const c of cues) displayed.push(line(`Starter offer shown: ${c.payload.gems} gems for ${money(c.payload.price)}, labelled "${c.payload.anchorLabel}".`, c.seq));
      const s = purchases.find((p) => p.payload.kind === 'starter');
      did.push(s ? line(`Starter offer bought (${s.clock.label}).`, s.seq) : line('Starter offer purchase not recorded.', null));
    } else if (id === 'exit_friction') {
      for (const c of cues) displayed.push(line(`Retention offer shown: ${c.payload.gemsOffered} gems or "${c.payload.stayLabel}".`, c.seq));
      for (const a of ofType('action').filter((e) => ['leave_immediately', 'play_out_the_trap', 'stay_without_reward'].includes(e.payload.kind))) {
        if (a.payload.kind === 'leave_immediately') {
          did.push(line('Chose to leave immediately.', a.seq));
        } else if (a.payload.kind === 'play_out_the_trap') {
          did.push(line('Chose to stay and play out the trap.', a.seq));
        } else if (a.payload.kind === 'stay_without_reward') {
          did.push(line('Chose to stay (retention reward already used).', a.seq));
        }
      }
      const t = ofType('terminal')[0];
      if (t) did.push(line(`Run then ended with route: ${t.payload.route}.`, t.seq));
      else did.push(line('Run continued after the offer.', null));
    } else if (id === 'completion_pressure') {
      const last = cues[cues.length - 1];
      displayed.push(line(`Set progress shown ${cues.length} time(s); most recent (${last.clock.label}): ${last.payload.setProgress.map((s) => `${s.owned}/${s.total}`).join(' ')}.`, last.seq));
      const inc = purchases.filter((p) => /pull/.test(p.payload.kind) && p.payload.cost > 0 && p.payload.incompleteSets > 0);
      did.push(inc.length ? line(`${inc.length} pull purchase(s) made while at least one set was incomplete.`, inc[0].seq) : line('No pull purchase recorded while a set was incomplete.', null));
    } else if (id === 'social_comparison') {
      for (const c of cues) displayed.push(line(`Rival in lane 1 shown (${c.clock.label}) with ${c.payload.rivalDuck}.`, c.seq));
      const rr = races.filter((r) => r.payload.rivalPlace);
      for (const r of rr.slice(0, 5)) did.push(line(`Race (${r.clock.label}): rival placed ${r.payload.rivalPlace}, you placed ${r.payload.place}.`, r.seq));
      if (rr.length > 5) did.push(line(`${rr.length - 5} further race(s) with the rival recorded.`, rr[5].seq));
      const buys = purchases.filter((p) => ['bundle', 'starter'].includes(p.payload.kind) && cues.some((c) => c.clock.day === p.clock.day && p.seq > c.seq));
      did.push(buys.length ? line(`${buys.length} gem purchase(s) recorded later on a day the rival was shown.`, buys[0].seq) : line('No gem purchase recorded later on a day the rival was shown.', null));
    } else if (id === 'secondary_currency') {
      const total = revealedDup.reduce((s, e) => s + e.payload.downGained, 0);
      displayed.push(line(`${revealedDup.length} reveal(s) showed a duplicate converted to Down, ${total} Down in total.`, (revealedDup[0] ?? cues[0]).seq));
      const spent = ofType('action').filter((e) => ['down_spent', 'race_trial_purchased'].includes(e.payload.kind));
      if (spent.length) for (const a of spent) did.push(line(a.payload.kind === 'race_trial_purchased'
        ? `Spent ${a.payload.costDown} Down for the one-race speed trial.`
        : `Spent ${a.payload.amount} Down (worth about ${a.payload.gemEquivalent} gems).`, a.seq));
      else did.push(line('No Down spending recorded.', null));
    } else if (id === 'pressure_on_possession') {
      for (const c of cues) displayed.push(line(`Pawn offer shown (${c.clock.label}): ${c.payload.amountCash} cash for ${c.payload.item}.`, c.seq));
      const acts = ofType('action').filter((e) => ['pawn_accepted', 'pawn_declined'].includes(e.payload.kind));
      for (const a of acts) did.push(line(a.payload.kind === 'pawn_accepted' ? 'Accepted the pawn offer.' : 'Declined the pawn offer.', a.seq));
      const after = purchases.filter((p) => ['bundle', 'starter'].includes(p.payload.kind) && p.seq > cues[0].seq);
      if (acts.some((a) => a.payload.kind === 'pawn_accepted')) {
        did.push(after.length ? line(`${after.length} gem purchase(s) recorded after the offer.`, after[0].seq) : line('No gem purchase recorded after the offer.', null));
      }
    }
    findings.push({ technique: id, label, displayed, did, question: { text: question, answer: null } });
  }

  const terminal = ofType('terminal')[0];
  const receiptShown = ofType('receipt_shown')[0];

  // Event-derived accounting / terminal outcome section
  const expenseDues = ofType('expense_due');
  const expensePaids = ofType('expense_paid');
  const escalationResults = ofType('escalation_result');
  const interestEntries = ofType('interest_charged');

  const expenses = [];
  let unpaidExpense = null;
  for (let i = 0; i < expenseDues.length; i++) {
    const due = expenseDues[i];
    const nextDueSeq = expenseDues[i + 1]?.seq ?? Infinity;
    const paid = expensePaids.find((p) => p.seq > due.seq && p.seq < nextDueSeq && p.payload.kind === due.payload.kind);
    // Find all escalations for this expense window
    const relevantEscalations = escalationResults.filter((e) => e.seq > due.seq && e.seq < (paid?.seq ?? nextDueSeq));
    const waivedAmount = relevantEscalations.reduce((sum, e) => sum + (e.payload.effects?.billWaived ?? 0), 0);
    const paidAmount = paid ? paid.payload.amount : 0;
    const dueAmount = due.payload.amount;

    let status = 'unpaid';
    if (paid) {
      if (paidAmount === 0 && waivedAmount >= dueAmount) {
        status = 'waived';
      } else if (waivedAmount > 0 && paidAmount > 0) {
        status = 'partially_waived';
      } else {
        status = 'paid';
      }
    }

    const item = {
      seq: due.seq,
      kind: due.payload.kind,
      amount: dueAmount,
      dueAmount,
      paidAmount,
      waivedAmount,
      status,
      cashBefore: due.payload.cashBefore,
      paid: (status === 'paid' || status === 'partially_waived') && paidAmount > 0,
      paidSeq: paid?.seq ?? null,
      clock: due.clock,
    };
    expenses.push(item);
    if (status === 'unpaid') {
      unpaidExpense = item;
    }
  }

  const escalations = escalationResults.map((e) => ({
    seq: e.seq,
    step: e.payload.step,
    effects: e.payload.effects,
    cashAfter: e.payload.cashAfter,
    healthAfter: e.payload.healthAfter,
    clock: e.clock,
  }));

  const totalInterest = interestEntries.reduce((s, e) => s + e.payload.amount, 0);
  const interestCharges = interestEntries.map((e) => ({
    seq: e.seq,
    amount: e.payload.amount,
    debtAfter: e.payload.debtAfter,
    clock: e.clock,
  }));

  // Find latest recorded debt from all debt-changing events in the entire log
  const debtEvents = entries.filter((e) => (
    e.type === 'interest_charged' ||
    (e.type === 'escalation_result' && e.payload?.step === 'credit_card' && e.payload?.effects?.debtAfter !== undefined)
  ));
  const latestDebtEvent = debtEvents.length ? debtEvents[debtEvents.length - 1] : null;
  const finalDebt = latestDebtEvent
    ? (latestDebtEvent.type === 'interest_charged' ? latestDebtEvent.payload.debtAfter : latestDebtEvent.payload.effects.debtAfter)
    : 0;

  const accountingLines = [];
  const paidCashBills = expenses.filter((e) => e.status === 'paid' || e.status === 'partially_waived');
  const waivedBills = expenses.filter((e) => e.status === 'waived' || e.status === 'partially_waived');
  const totalCashPaid = paidCashBills.reduce((s, e) => s + e.paidAmount, 0);
  const totalWaived = waivedBills.reduce((s, e) => s + e.waivedAmount, 0);

  if (paidCashBills.length) {
    accountingLines.push(line(`${paidCashBills.length} recorded expense bill(s) paid in cash (${money(totalCashPaid)} total).`, paidCashBills[paidCashBills.length - 1].paidSeq));
  }
  if (waivedBills.length) {
    accountingLines.push(line(`${waivedBills.length} food expense(s) waived via skipped lunch (${money(totalWaived)} total).`, waivedBills[0].seq));
  }
  if (unpaidExpense) {
    accountingLines.push(line(`Unpaid expense recorded (${unpaidExpense.clock.label}): ${money(unpaidExpense.dueAmount)} for ${unpaidExpense.kind} was due with ${money(unpaidExpense.cashBefore)} cash on hand.`, unpaidExpense.seq));
  }
  if (escalations.length) {
    const steps = escalations.map((e) => e.step).join(', ');
    accountingLines.push(line(`${escalations.length} emergency escalation step(s) recorded: ${steps}.`, escalations[0].seq));
  }
  if (interestCharges.length) {
    accountingLines.push(line(`Total interest charged: ${money(totalInterest)} across ${interestCharges.length} billing cycle(s); final debt recorded was ${money(finalDebt)}.`, interestCharges[0].seq));
  } else if (finalDebt > 0 && latestDebtEvent) {
    accountingLines.push(line(`Final debt recorded was ${money(finalDebt)} (credit drawn at ${latestDebtEvent.clock.label}).`, latestDebtEvent.seq));
  }
  if (terminal?.payload.route === 'running_on_empty') {
    accountingLines.push(line(`Terminal route was running_on_empty following ${unpaidExpense ? `unpaid ${unpaidExpense.kind} bill` : 'exhausted resources'}.`, terminal.seq));
  }

  // Purely event-derived financial, health, and inventory balances (P2 repair)
  const initialCash = 15.00;
  const wagesSum = ofType('income').filter((e) => e.payload.kind === 'wage').reduce((s, e) => s + e.payload.amount, 0);
  const escalationCashSum = escalationResults.reduce((s, e) => s + (e.payload.effects?.cashGained ?? 0), 0);
  const expensesPaidSum = expensePaids.reduce((s, e) => s + e.payload.amount, 0);
  const purchasesPaidSum = purchases.reduce((s, e) => s + e.payload.price, 0);
  const derivedFinalCash = Math.max(0, Math.round((initialCash + wagesSum + escalationCashSum - expensesPaidSum - purchasesPaidSum) * 100) / 100);

  const healthLostSum = escalationResults.reduce((s, e) => s + (e.payload.effects?.healthLost ?? 0), 0);
  const derivedFinalHealth = Math.max(0, 100 - healthLostSum);

  const uniqueOwnedDucks = new Set(drawsCommitted.filter((d) => !d.payload.duplicate).map((d) => d.payload.identity));
  const derivedOwnedDucksCount = uniqueOwnedDucks.size;

  const totalDownGained = drawsCommitted.filter((d) => d.payload.duplicate).reduce((s, d) => s + (d.payload.downGained ?? 0), 0);
  const totalDownSpent = ofType('action').reduce((sum, e) => sum
    + (e.payload.kind === 'down_spent' ? (e.payload.amount ?? 0) : 0)
    + (e.payload.kind === 'race_trial_purchased' ? (e.payload.costDown ?? 0) : 0), 0);
  const derivedDownBalance = Math.max(0, totalDownGained - totalDownSpent);

  const raceDisplayed = [];
  const raceDid = [];
  for (const event of ofType('race_rest_policy_activated')) {
    raceDid.push(line(event.payload.historyLimited
      ? 'Race rest tracking began after an older completed race without a recorded duck identity; earlier racer identity is unknown.'
      : 'Race rest rules became active; previously recorded duck identities remain part of the race history.', event.seq));
  }
  for (const event of ofType('race_choice_offered')) {
    const payload = event.payload ?? {};
    if (!Array.isArray(payload.candidates) || !payload.trialState) {
      const options = payload.options && typeof payload.options === 'object'
        ? Object.keys(payload.options).filter((key) => ['safe', 'sprint'].includes(key))
        : [];
      const optionLabels = options.map((key) => key === 'safe' ? 'Safe pace' : 'Sprint');
      const optionText = optionLabels.length ? ` Recorded pace options: ${optionLabels.join(' and ')}.` : '';
      raceDisplayed.push(line(`Race ${payload.raceNumber} choice offered; older record has no candidate details.${optionText}`, event.seq));
      continue;
    }
    const candidates = payload.candidates.map((candidate) => `${candidate.duckId}: race rating ${formatRaceRating(candidate.effectiveWithTrialInput ?? candidate.effectiveBaseInput)}${candidate.restFactor < 1 ? ` (${Math.round((1 - candidate.restFactor) * 100)}% rest penalty)` : (candidate.historyLimited ? ' (rest history limited by an older unknown identity)' : ' (rested)')}`).join('; ');
    const trial = payload.trialState.available
      ? ` Purchased trial ${payload.trialState.selected ? 'selected' : 'available'} (+5%).`
      : '';
    const foregrounded = payload.foregroundedDuckId ? ` ${payload.foregroundedDuckId} was foregrounded by race rating.` : '';
    const paceOptions = Object.values(payload.options ?? {}).map((option) => option?.label).filter((label) => typeof label === 'string');
    const paceText = paceOptions.length ? ` Pace options: ${paceOptions.join(' and ')}.` : '';
    raceDisplayed.push(line(`Race ${payload.raceNumber} choices shown in race-rating order: ${candidates}.${foregrounded}${paceText}${trial}`, event.seq));
  }
  for (const event of ofType('race_trial_offer_shown')) {
    raceDisplayed.push(line(event.payload.alreadyPurchased
      ? 'An available one-race speed trial could be selected for this race.'
      : `Race trial offer shown: ${event.payload.costDown} Down for +5% base speed on one race.`, event.seq));
  }
  for (const event of ofType('race_cue_displayed')) {
    raceDisplayed.push(line(event.payload.text || `Race cue shown: ${event.payload.cueId}.`, event.seq));
  }
  for (const event of ofType('action')) {
    if (event.payload.kind === 'race_choice') {
      const rest = event.payload.restEvidence;
      const restText = rest ? ` Rest factor ${rest.restFactor} applied to speed rating ${formatRaceRating(rest.authoredRating)} (race rating ${formatRaceRating(rest.effectiveBaseInput)}).` : '';
      raceDid.push(line(`Entered ${event.payload.duckId} with the ${event.payload.stance} stance.${restText}`, event.seq));
    }
    if (event.payload.kind === 'race_trial_purchased') raceDid.push(line(`Bought the one-race speed trial for ${event.payload.costDown} Down.`, event.seq));
    if (event.payload.kind === 'race_trial_consumed') raceDid.push(line('The available speed trial was used on this finished race.', event.seq));
  }
  for (const event of ofType('race_playback_action')) {
    raceDid.push(line(`Race playback action recorded: ${event.payload.action}.`, event.seq));
  }
  for (const event of races) {
    const order = (event.payload.finishOrder ?? []).map((item) => `${item.place}: ${item.id}`).join(', ');
    raceDid.push(line(`Race ${event.payload.raceNumber} finished; recorded crossing order ${order || 'unavailable'}. You placed ${event.payload.place} and earned ${event.payload.payoutGems} Gems.`, event.seq));
  }
  for (const event of ofType('race_attempt_unresolved')) {
    const trialFact = event.payload.trialAvailable ? ' A purchased trial stayed available.' : ' No trial was committed.';
    const restFact = event.payload.restEvidence ? ` Attempted with rest factor ${event.payload.restEvidence.restFactor.toFixed(2)}; unresolved attempts do not advance rest.` : '';
    raceDid.push(line(`Race ${event.payload.raceNumber} remained unresolved; no finish place or Gems were recorded.${trialFact}${restFact}`, event.seq));
  }

  return {
    chainValid,
    isComplete,
    terminalRoute: terminal?.payload.route ?? null,
    receiptShown: !!receiptShown,
    findings,
    pullLedger,
    raceEvidence: {
      displayed: raceDisplayed,
      did: raceDid,
      question: { text: 'Did the race presentation or its outcome affect what you did next?', answer: null },
    },
    accounting: {
      expenses,
      unpaidExpense,
      escalations,
      totalInterest,
      interestCharges,
      finalDebt,
      lines: accountingLines,
    },
    summary: {
      finalCash: derivedFinalCash,
      finalHealth: derivedFinalHealth,
      finalDebt,
      ownedDucksCount: derivedOwnedDucksCount,
      totalDown: derivedDownBalance,
    },
  };
}

/** Every human-readable string in a projection (for wording checks). */
export function receiptText(r) {
  const out = [];
  for (const f of r.findings) {
    out.push(f.label, f.question.text);
    for (const l of f.displayed) out.push(l.text);
    for (const l of f.did) out.push(l.text);
  }
  if (r.accounting?.lines) {
    for (const l of r.accounting.lines) out.push(l.text);
  }
  return out;
}
