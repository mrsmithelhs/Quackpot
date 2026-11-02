// src/core/receipt.mjs
// Receipt projection: a pure function of the append-only event record.
// It never reads run state. Each finding has three registers (O1 honesty rule):
//   displayed - only content recorded as shown (cue_shown / offer_shown / retention_modal_shown / reveal_shown)
//   did       - recorded actions and results, including results committed but never shown
//   question  - a fixed discussion question; never an asserted answer
// Every line carries `seq`, the log entry it comes from (null only for "none recorded" statements).

import { verifyChain, verifyCompleteness } from './event-log.mjs';
import { formatRaceRating } from './race-rest.mjs';
import { social46DisplayText } from './life-social.mjs';
import { REN_INTRO_LINES } from './life-social-door.mjs';
import { renGraphNode, REN_RESPONSE_LINES } from './life-social-dialogue.mjs';

const money = (x) => `$${Number(x).toFixed(2)}`;

// Never copy arbitrary social payload fields into the expandable/printable Receipt.
function publicSocial(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};
  const result = {};
  const allowed = {
    kind: ['introduction', 'knock', 'intro_line', 'knock_ignore', 'door_open', 'intro_reply', 'intro_close', 'visit_knock', 'visit_open', 'visit_ignore', 'visit_arrival', 'graph_line', 'graph_choice', 'response_reply', 'invitation', 'suggestion_response', 'suggest_activity', 'scene', 'sale_disclosure', 'accepted', 'floor_reconfirmation', 'conflict_notice', 'conflict_continue', 'response_declined', 'response_notice', 'response_broken', 'reply', 'notice', 'continue_anyway', 'scene_next', 'confirm_floor', 'completed'],
    activity: ['door', 'game', 'repair'], seating: ['door', 'couch', 'floor'],
    previousActivity: ['door', 'game'],
    look: ['cardigan', 'pajamas'],
    choice: ['accept', 'decline', 'reschedule'], outcome: ['plan_not_kept', 'invitation_expired'],
  };
  for (const [key, values] of Object.entries(allowed)) if (values.includes(payload[key])) result[key] = payload[key];
  if (typeof payload.id === 'string' && /^(?:intro|ren-[1-9]\d*)$/.test(payload.id)) result.id = payload.id;
  if (Number.isSafeInteger(payload.day) && payload.day >= 1) result.day = payload.day;
  if (Number.isSafeInteger(payload.atDay) && payload.atDay >= 1) result.atDay = payload.atDay;
  if (Number.isSafeInteger(payload.newDay) && payload.newDay >= 1) result.newDay = payload.newDay;
  if (payload.lookVersion === 1 && result.look) result.lookVersion = 1;
  if (Number.isInteger(payload.beat) && payload.beat >= 0 && payload.beat < 3) result.beat = payload.beat;
  if (Object.hasOwn(REN_INTRO_LINES, payload.node)) result.node = payload.node;
  if (['meet','why','later','making','glad','continue','thanks','noted','finish','close','a','b','busy','me-too','break','fun','tease','together','convenient','memory','learn','basics','reconnect','apology','tell','better','steps','honest','good','appreciate','sorry','talk'].includes(payload.choice)) result.choice = payload.choice;
  if (payload.kind === 'intro_line' && result.node && payload.text === REN_INTRO_LINES[result.node]) result.text = payload.text;
  if (payload.kind === 'graph_line') {
    const graph = renGraphNode(payload.activity, payload.node, payload.seating, true);
    if (graph && payload.text === graph.text) { result.node = payload.node; result.text = graph.text; }
  }
  if (payload.kind === 'graph_choice' && renGraphNode(payload.activity, payload.node, 'couch', true)) result.node = payload.node;
  if (Object.hasOwn(REN_RESPONSE_LINES, payload.response)) {
    result.response = payload.response;
    if (payload.kind === 'response_reply' && payload.text === REN_RESPONSE_LINES[payload.response][payload.choice]) result.text = payload.text;
  }
  const shownText = social46DisplayText(payload.kind, payload.activity, payload.day, payload.beat, payload.atDay, payload.seating);
  if (shownText && payload.text === shownText) result.text = shownText;
  return result;
}

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
      // Compatibility only: this is a nearest-prior heuristic, not an association.
      purchaseKind: buy?.payload.kind ?? null,
      purchaseAssociation: 'unknown',
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
        const b = Array.isArray(c.payload.bundles) ? c.payload.bundles.map((x) => `${x.gems ?? 'unknown'} gems for ${Number.isFinite(x.price) ? money(x.price) : 'an unavailable price'}`).join('; ') : 'bundle details unavailable';
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
        const ls = after.map((d) => d.payload.odds?.legendary).filter(Number.isFinite);
        const minOdds = Math.min(...ls);
        const maxOdds = Math.max(...ls);
        const soft = after.filter((d) => d.payload.advancesPity && d.payload.drawNumberInWindow >= cues[0].payload.softPityStart && d.payload.drawNumberInWindow < cues[0].payload.hardPity).length;
        const hard = after.filter((d) => d.payload.advancesPity && d.payload.drawNumberInWindow >= cues[0].payload.hardPity).length;
        const oddsText = ls.length === after.length ? `actual pre-draw legendary odds ranged from ${minOdds} to ${maxOdds}` : 'some recorded pre-draw odds are unavailable';
        did.push(line(`${after.length} draw(s) committed after the first display; ${oddsText}; ${soft} draw(s) had raised soft-pity odds; ${hard} draw(s) reached the hard guarantee.`, after[0].seq));
      } else did.push(line('No draw recorded after the counter was shown.', null));
    } else if (id === 'power_creep') {
      for (const c of cues) displayed.push(line(`Banner ${Number.isFinite(c.payload.banner) ? c.payload.banner + 1 : 'unknown'} showed new ducks: ${Array.isArray(c.payload.newIdentities) ? c.payload.newIdentities.join(', ') : 'details unavailable'}.`, c.seq));
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
      displayed.push(line(`Set progress shown ${cues.length} time(s); most recent (${last.clock.label}): ${Array.isArray(last.payload.setProgress) ? last.payload.setProgress.map((s) => `${s.owned ?? '?'}/${s.total ?? '?'}`).join(' ') : 'details unavailable'}.`, last.seq));
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
      for (const cue of cues) displayed.push(line('A Down-related cue was recorded as shown.', cue.seq));
      if (revealedDup.length) displayed.push(line(`${revealedDup.length} reveal(s) showed a duplicate converted to Down, ${total} Down in total.`, revealedDup[0].seq));
      displayed.sort((a, b) => a.seq - b.seq);
      const spent = ofType('action').filter((e) => ['down_spent', 'race_trial_purchased'].includes(e.payload.kind));
      if (spent.length) for (const a of spent) did.push(line(a.payload.kind === 'race_trial_purchased'
        ? `Spent ${a.payload.costDown} Down for the one-race speed upgrade.`
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
    findings.push({ technique: id, label, displayed, did, question: { text: question, answer: null },
      displayEvidence: [...cues, ...revealedDup].map(({ seq, type, payload }) => ({ seq, type, payload })).sort((a, b) => a.seq - b.seq) });
  }

  const terminal = ofType('terminal')[0];
  const receiptShown = ofType('receipt_shown')[0];

  // Event-derived accounting / terminal outcome section
  const expenseDues = ofType('expense_due');
  const lifeStart = ofType('run_started')[0]?.payload?.lifePolicyVersion === 1 ? ofType('run_started')[0] : null;
  const expensePaids = ofType('expense_paid');
  const escalationResults = ofType('escalation_result');
  const interestEntries = ofType('interest_charged');

  const expenses = [];
  let unpaidExpense = null;
  for (let i = 0; i < expenseDues.length; i++) {
    const due = expenseDues[i];
    const nextDueSeq = expenseDues[i + 1]?.seq ?? Infinity;
    const paid = expensePaids.find((p) => p.seq > due.seq && (lifeStart
      ? p.payload.billId === due.payload.billId
      : p.seq < nextDueSeq && p.payload.kind === due.payload.kind));
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
  for (const event of ofType('offer_shown').filter((e) => e.payload?.kind === 'fictional_launch_invitation')) accountingLines.push(line('A fictional invitation to the evening launch was shown.', event.seq));
  for (const event of entries.filter((e) => (e.type === 'offer_shown' && e.payload?.kind === 'launch_reply_invitation') || (e.type === 'action' && e.payload?.kind === 'launch_reply') || (e.type === 'cue_shown' && e.payload?.kind === 'launch_reply_acknowledgment'))) {
    accountingLines.push(line(event.payload.kind === 'launch_reply_invitation' ? 'A launch message invited a LAUNCH reply for ten free draws.' : event.payload.kind === 'launch_reply' ? 'Replied LAUNCH.' : 'A launch reply acknowledgment was shown.', event.seq));
  }
  for (const event of ofType('action').filter((e) => ['fictional_install', 'quackpot_opened'].includes(e.payload?.kind))) accountingLines.push(line(event.payload.kind === 'fictional_install' ? 'Chose to install the fictional app.' : 'Opened Quackpot.', event.seq));
  for (const event of ofType('offer_shown').filter((e) => e.payload?.kind === 'free_ten_pull')) {
    accountingLines.push(line('A free 10-pull welcome offer was shown.', event.seq));
  }
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
  const skippedBreakfasts = ofType('action').filter((e) => e.payload?.kind === 'breakfast_skipped');
  for (const event of skippedBreakfasts) {
    accountingLines.push(line(`Breakfast skipped on day ${event.payload.day}: $0 spent; health decreased by ${event.payload.healthLost} to ${event.payload.healthAfter}.`, event.seq));
  }
  for (const event of ofType('life_health')) {
    accountingLines.push(line(`${event.payload.reason}: health changed by ${event.payload.delta} to ${event.payload.after}.`, event.seq));
  }
  for (const event of ofType('life_rent_held')) accountingLines.push(line(`Chose to hold cash; rent remained unpaid with ${money(event.payload.cash)} on hand.`, event.seq));
  for (const event of ofType('life_rent_shortfall')) accountingLines.push(line(`Rent became due with a ${money(event.payload.shortfall)} shortfall.`, event.seq));
  for (const event of ofType('life_work_agreed')) accountingLines.push(line(`Agreed to ${event.payload.kind === 'overtime' ? 'an overtime shift' : 'a scheduled shift'} on day ${event.payload.day}.`, event.seq));
  for (const event of ofType('life_shift_missed')) accountingLines.push(line(`Game recorded a missed shift on day ${event.payload.day}; ${event.payload.count} missed shift(s) recorded.`, event.seq));
  for (const event of ofType('life_employment_ended')) accountingLines.push(line(`Game recorded that scheduled employment ended on day ${event.payload.day}.`, event.seq));
  for (const event of ofType('work_interrupted')) accountingLines.push(line(`The agreed ${event.payload.kind === 'overtime' ? 'overtime' : 'scheduled'} shift was unfinished when the run ended; no completion was recorded.`, event.seq));
  for (const event of ofType('activity47_interrupted')) accountingLines.push(line('An evening activity was unfinished when the run ended; no recovery was recorded for it.', event.seq));
  for (const event of ofType('social46_interrupted')) accountingLines.push(line('An evening with Ren was unfinished when the run ended; no completion was recorded.', event.seq));
  for (const event of ofType('social46_plan_interrupted')) accountingLines.push(line('An accepted plan with Ren was still pending when the run ended.', event.seq));
  for (const event of ofType('story47_shown')) accountingLines.push(line(`Displayed ${event.payload.stage === 'commute' ? 'a commute scene' : event.payload.stage === 'work' ? 'two work observations' : 'an evening activity scene'}.`, event.seq));
  for (const event of ofType('social46_display')) {
    const label = { introduction: 'Ren’s introduction', knock: 'a knock at the door', visit_knock: 'a knock for a planned visit', visit_arrival: 'Ren’s arrival at the door', intro_line: 'a line from Ren at the door', graph_line: 'a line from Ren during a visit', response_reply: 'a reply from Ren', invitation: 'an invitation from Ren', suggestion_response: 'Ren’s response to a suggested activity', scene: 'a scene with Ren', sale_disclosure: 'a seating-change disclosure', accepted: 'Ren’s acknowledgment', floor_reconfirmation: 'a floor-seating reconfirmation', conflict_notice: 'a plan-conflict choice', conflict_continue: 'a plan-conflict warning', response_declined: 'a message from Ren', response_notice: 'a message from Ren', response_broken: 'a message from Ren' }[event.payload?.kind];
    const shownText = publicSocial(event.payload).text;
    if (label) accountingLines.push(line(shownText ? `Displayed ${label}: ${shownText}` : `Displayed ${label}.`, event.seq));
  }
  for (const event of ofType('social46_action')) {
    const label = { accept: 'Accepted an invitation from Ren.', decline: 'Declined an invitation from Ren.', reschedule: 'Asked to reschedule an invitation from Ren.' }[event.payload?.choice]
      ?? { knock_ignore: 'Ignored the knock at the door.', door_open: 'Opened the door to Ren.', visit_open: 'Opened the door for a planned visit.', visit_ignore: 'Ignored the planned-visit knock for now.', intro_reply: 'Chose a reply in the introduction.', intro_close: 'Paused the introduction.', graph_choice: 'Chose a reply during a visit with Ren.', response_reply: 'Replied to a message from Ren.', suggest_activity: 'Suggested a different activity to Ren.', notice: 'Told Ren the plan could not happen.', continue_anyway: 'Chose another activity without telling Ren.', confirm_floor: 'Confirmed floor seating for the plan.' }[event.payload?.kind];
    if (label) accountingLines.push(line(label, event.seq));
  }
  for (const event of ofType('social46_outcome')) {
    const label = event.payload?.kind === 'completed' ? 'Completed an evening with Ren.'
      : { plan_not_kept: 'An accepted plan with Ren was not kept.', invitation_expired: 'A displayed invitation expired without a reply.' }[event.payload?.outcome];
    if (label) accountingLines.push(line(label, event.seq));
  }
  for (const event of ofType('session_interrupted')) accountingLines.push(line(`An ${event.payload.suspended ? 'on-hold' : 'active'} phone session remained when the run ended.`, event.seq));
  if (lifeStart) for (const event of ofType('income')) {
    if (event.payload.kind === 'asset_sale') accountingLines.push(line(`Sold ${event.payload.asset} for ${money(event.payload.amount)}.`, event.seq));
    if (['wage', 'overtime'].includes(event.payload.kind)) accountingLines.push(line(`Completed ${event.payload.kind === 'wage' ? 'a scheduled shift' : 'overtime'} and received ${money(event.payload.amount)}.`, event.seq));
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
  const initialCash = lifeStart ? lifeStart.payload.lifeConfig?.startCash : 15.00;
  const wagesSum = ofType('income').filter((e) => e.payload.kind === 'wage' || (lifeStart && ['overtime', 'asset_sale'].includes(e.payload.kind))).reduce((s, e) => s + e.payload.amount, 0);
  const escalationCashSum = escalationResults.reduce((s, e) => s + (e.payload.effects?.cashGained ?? 0), 0);
  const expensesPaidSum = expensePaids.reduce((s, e) => s + e.payload.amount, 0);
  const purchasesPaidSum = purchases.reduce((s, e) => s + e.payload.price, 0);
  const derivedFinalCash = Math.max(0, Math.round((initialCash + wagesSum + escalationCashSum - expensesPaidSum - purchasesPaidSum) * 100) / 100);

  const healthLostSum = escalationResults.reduce((s, e) => s + (e.payload.effects?.healthLost ?? 0), 0)
    + skippedBreakfasts.reduce((s, e) => s + (e.payload.healthLost ?? 0), 0);
  const derivedFinalHealth = Math.max(0, (lifeStart ? lifeStart.payload.lifeConfig?.startHealth : 100) - healthLostSum + ofType('life_health').reduce((sum, e) => sum + e.payload.delta, 0));

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
    const upgrade = payload.trialState.available
      ? ` Purchased one-race speed upgrade ${payload.trialState.selected ? 'selected' : 'available'} (+5% base speed this race).`
      : '';
    const foregrounded = payload.foregroundedDuckId ? ` ${payload.foregroundedDuckId} was foregrounded by race rating.` : '';
    const paceOptions = Object.values(payload.options ?? {}).map((option) => option?.label).filter((label) => typeof label === 'string');
    const paceText = paceOptions.length ? ` Pace options: ${paceOptions.join(' and ')}.` : '';
    raceDisplayed.push(line(`Race ${payload.raceNumber} choices shown in race-rating order: ${candidates}.${foregrounded}${paceText}${upgrade}`, event.seq));
  }
  for (const event of ofType('race_trial_offer_shown')) {
    raceDisplayed.push(line(event.payload.alreadyPurchased
      ? 'An available one-race speed upgrade could be selected for this race.'
      : `One-race speed upgrade offer shown: ${event.payload.costDown} Down for +5% base speed on one race.`, event.seq));
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
    if (event.payload.kind === 'race_trial_purchased') raceDid.push(line(`Bought the one-race speed upgrade for ${event.payload.costDown} Down.`, event.seq));
    if (event.payload.kind === 'race_trial_consumed') raceDid.push(line('The available one-race speed upgrade was used on this finished race.', event.seq));
  }
  for (const event of ofType('race_playback_action')) {
    raceDid.push(line(`Race playback action recorded: ${event.payload.action}.`, event.seq));
  }
  for (const event of races) {
    const order = (event.payload.finishOrder ?? []).map((item) => `${item.place}: ${item.id}`).join(', ');
    raceDid.push(line(`Race ${event.payload.raceNumber} finished; recorded crossing order ${order || 'unavailable'}. You placed ${event.payload.place} and earned ${event.payload.payoutGems} Gems.`, event.seq));
  }
  for (const event of ofType('race_attempt_unresolved')) {
    const upgradeFact = event.payload.trialAvailable ? ' A purchased one-race speed upgrade stayed available.' : ' No speed upgrade was committed.';
    const restFact = event.payload.restEvidence ? ` Attempted with rest factor ${event.payload.restEvidence.restFactor.toFixed(2)}; unresolved attempts do not advance rest.` : '';
    raceDid.push(line(`Race ${event.payload.raceNumber} remained unresolved; no finish place or Gems were recorded.${upgradeFact}${restFact}`, event.seq));
  }

  return {
    chainValid,
    isComplete,
    terminalRoute: terminal?.payload.route ?? null,
    receiptShown: !!receiptShown,
    // Additive, sequence-linked facts; consumers must not treat temporal proximity as a link.
    evidence: entries.filter((e) => ['purchase', 'draw_committed', 'reveal_shown', 'expense_due', 'expense_paid', 'escalation_result', 'interest_charged', 'run_started', 'income', 'life_health', 'life_rent_held', 'life_rent_shortfall', 'life_work_agreed', 'life_shift_missed', 'life_employment_ended', 'work_interrupted', 'session_interrupted', 'activity47_interrupted', 'story47_shown', 'social46_display', 'social46_action', 'social46_outcome', 'social46_interrupted', 'social46_plan_interrupted', 'terminal', 'race_choice_offered', 'race_trial_offer_shown', 'race_cue_displayed', 'race_playback_action', 'race_result', 'race_attempt_unresolved', 'race_rest_policy_activated'].includes(e.type) || (e.type === 'action' && ['race_choice', 'race_trial_purchased', 'race_trial_consumed', 'uninstall_chosen', 'leave_immediately', 'launch_reply', 'fictional_install', 'quackpot_opened'].includes(e.payload?.kind)) || (['offer_shown', 'cue_shown'].includes(e.type) && ['fictional_launch_invitation', 'launch_reply_invitation', 'launch_reply_acknowledgment', 'free_ten_pull'].includes(e.payload?.kind))).map(({ seq, type, payload, clock }) => ({ seq, type, payload: type.startsWith('social46_') ? publicSocial(payload) : payload, clock })),
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
