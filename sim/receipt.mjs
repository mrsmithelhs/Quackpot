// Receipt projection: a pure function of the append-only event record.
// It never reads run state. Each finding has three registers (O1 honesty rule):
//   displayed - only content recorded as shown (cue_shown / offer_shown / retention_modal_shown / reveal_shown)
//   did       - recorded actions and results, including results committed but never shown
//   question  - a fixed discussion question; never an asserted answer
// Every line carries `seq`, the log entry it comes from (null only for "none recorded" statements).

import { verifyChain } from './event-log.mjs';

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
        const soft = after.filter((d) => d.payload.advancesPity && d.payload.drawNumberInWindow >= cues[0].payload.softPityStart).length;
        did.push(line(`${after.length} draw(s) committed after the first display; actual pre-draw legendary odds ranged from ${Math.min(...ls)} to ${Math.max(...ls)}; ${soft} draw(s) had raised odds.`, after[0].seq));
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
      for (const a of ofType('action').filter((e) => ['leave_immediately', 'play_out_the_trap'].includes(e.payload.kind))) {
        did.push(line(a.payload.kind === 'leave_immediately' ? 'Chose to leave immediately.' : 'Chose to stay and play out the trap.', a.seq));
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
      const spent = ofType('action').filter((e) => e.payload.kind === 'down_spent');
      if (spent.length) for (const a of spent) did.push(line(`Spent ${a.payload.amount} Down (worth about ${a.payload.gemEquivalent} gems).`, a.seq));
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
  return {
    chainValid,
    terminalRoute: terminal?.payload.route ?? null,
    receiptShown: !!receiptShown,
    findings,
    pullLedger,
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
  return out;
}
