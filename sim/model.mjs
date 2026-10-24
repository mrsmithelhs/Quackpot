// Headless Quackpot economy model for Plan 01.
// Every value in DEFAULT_PARAMS is either a founding-design starting value (listed in
// DESIGN_KEYS) or an explicitly labeled ASSUMPTION. Nothing here is an accepted tuning.
// No UI, no per-duck balancing: ducks are tier-level stat classes plus a release banner.

import { createRng } from './prng.mjs';
import { EventLog } from './event-log.mjs';

/** Keys whose default comes from design.md "Starting values for simulation". */
export const DESIGN_KEYS = new Set([
  'pullSingle', 'pullTen', 'rarity', 'softPityStart', 'hardPity', 'bannerDays', 'powerCreep', 'bundleGems',
  'retentionGems',
]);

export const DEFAULT_PARAMS = {
  // ---- design starting values --------------------------------------------------
  pullSingle: 160,
  pullTen: 1600,
  rarity: { common: 0.8, rare: 0.18, legendary: 0.02 },
  softPityStart: 35, // soft pity begins at this draw number within a pity window
  hardPity: 50, // legendary guaranteed at this draw number
  bannerDays: 3,
  powerCreep: 1.15, // each new banner's ducks are about 15% faster
  bundleGems: [60, 330, 1090, 2240, 3880, 8080],
  retentionGems: 80,

  // ---- ASSUMPTIONS (not in the design table) -------------------------------------
  // pity
  softRamp: 'linear', // legendary odds rise linearly from base at softPityStart to 1 at hardPity
  openingAdvancesPity: false, // does the free opening ten-pull count toward pity? (open question)
  pityCarry: 'carry', // 'carry' | 'reset' pity counter on banner change (T7 open)
  pityCounterVisible: true, // pity-counter cue displayed on pull screen
  featuredRate: 0.5, // chance a legendary is the banner's featured legendary
  commitMode: 'sequential', // 'sequential' | 'batch': how a ten-pull commits draws relative to reveals
  // economy
  startCash: 200,
  startGems: 0,
  wagePerDay: 45,
  foodPerDay: 12,
  rentPerWeek: 140,
  bundlePrices: [0.99, 4.99, 14.99, 24.99, 49.99, 99.99], // fictional cash per bundle (assumed 1 cash = $1)
  bundlePriceScale: 1, // sweepable multiplier on bundle and starter prices (cash-to-dollar exchange assumption)
  starter: { gems: 240, price: 0.99, anchorLabel: '400% value' },
  racesPerDay: 2,
  payoutByPlace: [30, 18, 10, 5, 2, 0],
  payoutScale: 1,
  longshotMultiplier: 1.5,
  fatiguePenalty: 0.1, // a duck that raced the previous race runs this much slower
  raceNoise: 0.15,
  fieldBaseSpeed: 14,
  fieldSpread: 0.3,
  fieldScalesWithCreep: true,
  fieldSize: 5,
  tierSpeed: { common: 10, rare: 14, legendary: 20 },
  ownDuckSpeed: 8,
  setBonus: 0.05, // speed bonus when a banner's whole set is owned (bounded)
  // roster
  rosterSize: 24,
  rosterPattern: ['common', 'common', 'rare', 'common', 'rare', 'legendary'],
  rosterPerBanner: 6,
  downPerDuplicate: { common: 1, rare: 5, legendary: 20 },
  downValueGems: 0.02, // best-case gem-equivalent of one Down in the (near-useless) shop
  // life metagame
  maxDays: 15,
  healthStart: 100,
  healthRecoveryPerDay: 5,
  skipLunchHealth: 15,
  extraShiftCash: 80,
  extraShiftHealth: 15,
  couchCash: 80,
  tvCash: 120,
  creditLimit: 600,
  creditDrawStep: 200,
  creditWeeklyRate: 0.05,
  pawnDayFraction: 0.8,
  pawnOffer: 150,
  // event deck
  curveballs: true,
  eventWeights: { car_repair: 1, tax_refund: 1, overtime_offer: 1, glitch_duck: 0.15 },
};

export const TIERS = ['common', 'rare', 'legendary'];

export function buildRoster(p) {
  const roster = [];
  for (let i = 0; i < p.rosterSize; i++) {
    const tier = p.rosterPattern[i % p.rosterPattern.length];
    const banner = Math.floor(i / p.rosterPerBanner);
    roster.push({ id: `duck-${i}`, tier, banner, speed: p.tierSpeed[tier] * p.powerCreep ** banner });
  }
  return roster;
}

/** Actual pre-draw odds. pityCount = draws already made in this pity window (this draw is #pityCount+1). */
export function preDrawOdds(p, pityCount) {
  const base = p.rarity.legendary;
  const n = pityCount + 1;
  let pL = base;
  if (n >= p.hardPity) pL = 1;
  else if (n >= p.softPityStart) pL = base + (1 - base) * ((n - p.softPityStart + 1) / (p.hardPity - p.softPityStart + 1));
  const rest = 1 - pL;
  const rareShare = p.rarity.rare / (p.rarity.rare + p.rarity.common);
  return { common: rest * (1 - rareShare), rare: rest * rareShare, legendary: pL };
}

const round4 = (x) => Math.round(x * 1e4) / 1e4;

/** Event deck. Each entry has trigger, eligibility, oneTime flag, bounded effect, and optional technique cue. */
export const EVENT_DECK = [
  {
    id: 'car_repair', trigger: 'weekly', kind: 'curveball', oneTime: false, bounds: { cash: [-90, -40] },
    eligible: (r) => (r.cash >= 60 ? [true, ''] : [false, 'cash below minimum bill']),
    apply: (r, rng) => ({ cash: rng.range(-90, -40) }),
  },
  {
    id: 'tax_refund', trigger: 'weekly', kind: 'curveball', oneTime: true, bounds: { cash: [30, 90] },
    eligible: (r) => (r.usedEvents.has('tax_refund') ? [false, 'one-time event already used'] : [true, '']),
    apply: (r, rng) => ({ cash: rng.range(30, 90) }),
  },
  {
    id: 'overtime_offer', trigger: 'weekly', kind: 'curveball', oneTime: false, bounds: { cash: [20, 60], health: [-10, -10] },
    eligible: (r) => (r.health >= 50 ? [true, ''] : [false, 'health below 50']),
    apply: (r, rng) => ({ cash: rng.range(20, 60), health: -10 }),
  },
  {
    id: 'glitch_duck', trigger: 'weekly', kind: 'secret', oneTime: true, bounds: {},
    eligible: (r) => (r.usedEvents.has('glitch_duck') ? [false, 'one-time event already used'] : [true, '']),
    apply: (r) => ({ secretDuck: true }),
  },
  {
    id: 'rival_whale', trigger: 'race_day', kind: 'rival', oneTime: false, bounds: {}, technique: 'social_comparison',
    eligible: (r) => (r.banner >= 1 ? [true, ''] : [false, 'no newer banner duck yet']),
    apply: () => ({ rivalInLane1: true }),
  },
];

export class Run {
  constructor(params = {}, seed = 1) {
    this.p = { ...structuredClone(DEFAULT_PARAMS), ...structuredClone(params) }; // deep copies: runs never share or mutate defaults
    this.seed = String(seed);
    const root = createRng(this.seed);
    this.root = root;
    this.rngDraw = root.fork('draw');
    this.rngEvent = root.fork('event');
    this.rngRace = root.fork('race');
    this.rngStrategy = root.fork('strategy'); // player-policy randomness, kept off the game streams
    this.log = new EventLog();
    this.roster = buildRoster(this.p);
    this.owned = new Map();
    this.day = 1;
    this.banner = 0;
    this.gems = this.p.startGems;
    this.cash = this.p.startCash;
    this.debt = 0;
    this.health = this.p.healthStart;
    this.down = 0;
    this.pity = 0; // draws since last legendary (pity window progress)
    this.terminal = null;
    this.usedEvents = new Set();
    this.soldCouch = false;
    this.soldTv = false;
    this.starterShown = false;
    this.starterUsed = false;
    this.retentionSeen = false;
    this.pawnDone = false;
    this.ownDuckSold = false;
    this.secretDuck = false;
    this.lastRacedId = null;
    this.rivalToday = false;
    this.shopShownDay = 0;
    this.stats = {
      freeDraws: 0, paidDraws: 0, legendaries: 0, legendariesOutsidePity: 0, firstLegendaryDraw: null, enteredSoft: false, reachedHardDraw: false,
      windows: { beforeSoft: 0, inSoft: 0, atHard: 0 }, duplicates: 0, gemsFromRaces: 0, gemsFromBundles: 0,
      gemsFromRetention: 0, gemsSpentOnPulls: 0, cashSpentOnBundles: 0, races: 0, placeCounts: [0, 0, 0, 0, 0, 0],
      escalation: 0, minCash: this.cash, eventsFired: 0, eventFallbacks: 0, downSpent: 0,
    };
  }

  // ---- log helpers -----------------------------------------------------------------
  clock() {
    const left = this.p.bannerDays - ((this.day - 1) % this.p.bannerDays);
    return { day: this.day, label: `Day ${this.day}, banner ${this.banner + 1} ends in ${left} game-day${left === 1 ? '' : 's'}` };
  }

  emit(type, payload) {
    return this.log.append(type, payload, this.clock());
  }

  // ---- roster ----------------------------------------------------------------------
  pool() {
    return this.roster.filter((d) => d.banner <= this.banner);
  }

  setProgress() {
    const sets = [];
    const banners = new Set(this.roster.map((d) => d.banner));
    for (const b of banners) {
      const members = this.roster.filter((d) => d.banner === b);
      sets.push({ banner: b, owned: members.filter((d) => this.owned.has(d.id)).length, total: members.length });
    }
    return sets;
  }

  collectionComplete() {
    return this.roster.length > 0 && this.roster.every((d) => this.owned.has(d.id));
  }

  setMultiplier() {
    let m = 1;
    for (const s of this.setProgress()) if (s.owned === s.total && s.total > 0) m += this.p.setBonus;
    return m;
  }

  // ---- lifecycle -------------------------------------------------------------------
  /** Begin a run: banner cues, opening free ten-pull, starter offer. opts.openingExit forwards to the pull. */
  start(opts = {}) {
    this.emit('run_started', { seed: this.seed });
    this.bannerStart();
    const res = this.pull(10, { free: true, exit: opts.openingExit });
    if (res.interrupted) return;
    this.starterShown = true;
    this.emit('offer_shown', { kind: 'starter', gems: this.p.starter.gems, price: this.starterPrice(), anchorLabel: this.p.starter.anchorLabel, technique: 'anchoring' });
    if (this.collectionComplete()) this.finish('completed_collection');
  }

  bannerStart() {
    const newIds = this.roster.filter((d) => d.banner === this.banner).map((d) => d.id);
    if (this.banner > 0 && this.p.pityCarry === 'reset') {
      this.emit('pity_reset', { before: this.pity });
      this.pity = 0;
    }
    this.emit('banner_started', { banner: this.banner, newIdentities: newIds, lengthDays: this.p.bannerDays });
    this.emit('cue_shown', { technique: 'fear_of_missing_out', banner: this.banner, label: `Banner ends in ${this.p.bannerDays} game-days` });
    if (this.banner > 0 && newIds.length > 0) {
      this.emit('cue_shown', { technique: 'power_creep', banner: this.banner, label: 'New ducks this banner', newIdentities: newIds });
    }
  }

  finish(route) {
    if (this.terminal) return;
    this.emit('terminal', { route });
    this.emit('receipt_shown', { route });
    this.terminal = route;
  }

  // ---- pulls -----------------------------------------------------------------------
  /**
   * Pull `count` (1 or 10). Ten-pulls are `count` ordered draws; each draw has its own pre-draw pity state.
   * opts.exit = { draw: i (1-based), boundary: 'before_commit' | 'after_commit_before_reveal' | 'after_reveal' }
   * stops the sequence there. MODEL ASSUMPTION (pending the playable slice): a draw is "committed" when its result
   * is written to the log and state; it is "revealed" only when a reveal_shown entry is written. In 'sequential'
   * commitMode each draw is committed immediately before its own reveal; in 'batch' all draws are committed first.
   */
  pull(count, opts = {}) {
    if (this.terminal) return { ok: false, interrupted: false };
    const free = !!opts.free;
    const cost = free ? 0 : count === 10 ? this.p.pullTen : this.p.pullSingle * count;
    if (!free && this.gems < cost) return { ok: false, interrupted: false };
    const incompleteSets = this.setProgress().filter((s) => s.owned < s.total).length;
    if (!free) {
      if (this.p.pityCounterVisible) {
        this.emit('cue_shown', { technique: 'sunk_cost_pity', counter: this.pity, hardPity: this.p.hardPity, softPityStart: this.p.softPityStart });
      }
      this.emit('cue_shown', { technique: 'completion_pressure', setProgress: this.setProgress(), incompleteSets });
    }
    this.gems -= cost;
    this.stats.gemsSpentOnPulls += cost;
    this.emit('purchase', { kind: free ? 'free_ten_pull' : count === 10 ? 'ten_pull' : 'single_pull', cost, gemsAfter: this.gems, banner: this.banner, incompleteSets });

    const exit = opts.exit;
    const stop = (draw, boundary) => exit && exit.draw === draw && exit.boundary === boundary;
    const batch = this.p.commitMode === 'batch';
    const drawsDone = [];
    if (batch) {
      // In batch mode every draw is committed together, so 'before_commit' means before the whole batch (exit.draw is not used).
      if (exit && exit.boundary === 'before_commit') return { ok: true, interrupted: true };
      for (let i = 1; i <= count; i++) drawsDone.push(this.commitDraw(i, count, free));
      for (let i = 1; i <= count; i++) {
        if (stop(i, 'after_commit_before_reveal')) return { ok: true, interrupted: true };
        this.reveal(drawsDone[i - 1]);
        if (stop(i, 'after_reveal')) return { ok: true, interrupted: true };
      }
    } else {
      for (let i = 1; i <= count; i++) {
        if (stop(i, 'before_commit')) return { ok: true, interrupted: true };
        const d = this.commitDraw(i, count, free);
        if (stop(i, 'after_commit_before_reveal')) return { ok: true, interrupted: true };
        this.reveal(d);
        if (stop(i, 'after_reveal')) return { ok: true, interrupted: true };
      }
    }
    return { ok: true, interrupted: false };
  }

  commitDraw(index, of, free) {
    const advances = !free || this.p.openingAdvancesPity;
    const pityBefore = advances ? this.pity : 0;
    const odds = preDrawOdds(this.p, pityBefore);
    const u = this.rngDraw.next();
    let rarity = u < odds.legendary ? 'legendary' : u < odds.legendary + odds.rare ? 'rare' : 'common';
    const pool = this.pool();
    let tier = rarity;
    while (tier !== 'common' && !pool.some((d) => d.tier === tier)) tier = TIERS[TIERS.indexOf(tier) - 1];
    const tierPool = pool.filter((d) => d.tier === tier);
    let duck;
    let offBanner = false;
    if (tier === 'legendary') {
      const featured = tierPool[tierPool.length - 1];
      if (tierPool.length === 1 || this.rngDraw.next() < this.p.featuredRate) duck = featured;
      else {
        duck = this.rngDraw.pick(tierPool.slice(0, -1));
        offBanner = true;
      }
    } else duck = this.rngDraw.pick(tierPool);
    const duplicate = this.owned.has(duck.id);
    const downGained = duplicate ? this.p.downPerDuplicate[duck.tier] : 0;
    this.owned.set(duck.id, (this.owned.get(duck.id) ?? 0) + 1);
    if (duplicate) {
      this.down += downGained;
      this.stats.duplicates++;
    }
    // pity bookkeeping
    const windowDraw = pityBefore + 1;
    let pityAfter = this.pity;
    if (advances) {
      if (windowDraw >= this.p.softPityStart && windowDraw < this.p.hardPity) this.stats.enteredSoft = true; // raised but not yet certain
      if (windowDraw >= this.p.hardPity) this.stats.reachedHardDraw = true;
      if (rarity === 'legendary') {
        if (windowDraw < this.p.softPityStart) this.stats.windows.beforeSoft++;
        else if (windowDraw < this.p.hardPity) this.stats.windows.inSoft++;
        else this.stats.windows.atHard++;
        pityAfter = 0;
      } else pityAfter = this.pity + 1;
      this.pity = pityAfter;
    } else if (rarity === 'legendary') this.stats.legendariesOutsidePity++; // free opening draw that does not touch pity
    if (free) this.stats.freeDraws++;
    else this.stats.paidDraws++;
    if (rarity === 'legendary') {
      this.stats.legendaries++;
      if (this.stats.firstLegendaryDraw === null) this.stats.firstLegendaryDraw = this.stats.freeDraws + this.stats.paidDraws;
    }
    const entry = this.emit('draw_committed', {
      drawIndex: index, of, free, advancesPity: advances, pityBefore, drawNumberInWindow: windowDraw,
      odds: { common: round4(odds.common), rare: round4(odds.rare), legendary: round4(odds.legendary) },
      rarity, identity: duck.id, duplicate, downGained, offBanner, pityAfter,
    });
    return { index, of, rarity, identity: duck.id, duplicate, downGained, pityAfter, seq: entry.seq };
  }

  reveal(d) {
    this.emit('reveal_shown', {
      drawIndex: d.index, of: d.of, commitSeq: d.seq, rarity: d.rarity, identity: d.identity, duplicate: d.duplicate,
      downGained: d.downGained, pityCounterShown: this.p.pityCounterVisible ? d.pityAfter : null,
    });
  }

  // ---- shop ------------------------------------------------------------------------
  openShop() {
    if (this.shopShownDay === this.day) return;
    this.shopShownDay = this.day;
    this.emit('offer_shown', {
      kind: 'bundle_shop', technique: 'currency_obfuscation', pullCost: this.p.pullSingle,
      bundles: this.p.bundleGems.map((g, i) => ({ gems: g, price: this.bundlePrice(i) })),
    });
  }

  bundlePrice(index) {
    return Math.round(this.p.bundlePrices[index] * this.p.bundlePriceScale * 100) / 100;
  }

  starterPrice() {
    return Math.round(this.p.starter.price * this.p.bundlePriceScale * 100) / 100;
  }

  buyBundle(index) {
    const price = this.bundlePrice(index);
    if (this.terminal || this.cash < price) return false;
    this.cash = Math.round((this.cash - price) * 100) / 100;
    this.gems += this.p.bundleGems[index];
    this.stats.gemsFromBundles += this.p.bundleGems[index];
    this.stats.cashSpentOnBundles += price;
    this.stats.minCash = Math.min(this.stats.minCash, this.cash);
    this.emit('purchase', { kind: 'bundle', bundleGems: this.p.bundleGems[index], price, banner: this.banner, gemsAfter: this.gems, cashAfter: this.cash });
    return true;
  }

  buyStarter() {
    const s = this.p.starter;
    const price = this.starterPrice();
    if (this.terminal || !this.starterShown || this.starterUsed || this.cash < price) return false;
    this.starterUsed = true;
    this.cash = Math.round((this.cash - price) * 100) / 100;
    this.gems += s.gems;
    this.stats.gemsFromBundles += s.gems;
    this.stats.cashSpentOnBundles += price;
    this.emit('purchase', { kind: 'starter', bundleGems: s.gems, price, banner: this.banner, gemsAfter: this.gems, cashAfter: this.cash });
    return true;
  }

  spendDown(amount) {
    const a = Math.min(amount, this.down);
    if (a <= 0) return;
    this.down -= a;
    this.stats.downSpent += a;
    this.emit('action', { kind: 'down_spent', amount: a, gemEquivalent: a * this.p.downValueGems });
  }

  // ---- exit ------------------------------------------------------------------------
  /** Uninstall control. action 'leave' ends the run; 'stay' accepts the retention offer ("play out the trap"). */
  uninstall(action = 'leave') {
    if (this.terminal) return;
    this.emit('action', { kind: 'uninstall_chosen' });
    this.emit('retention_modal_shown', { technique: 'exit_friction', gemsOffered: this.p.retentionGems, stayLabel: 'play out the trap' });
    this.retentionSeen = true;
    if (action === 'leave') {
      this.emit('action', { kind: 'leave_immediately' });
      this.finish('uninstall');
    } else {
      this.emit('action', { kind: 'play_out_the_trap' });
      this.gems += this.p.retentionGems;
      this.stats.gemsFromRetention += this.p.retentionGems;
      this.emit('reward', { kind: 'retention_gems', gems: this.p.retentionGems, gemsAfter: this.gems });
    }
  }

  // ---- life metagame ---------------------------------------------------------------
  payBill(kind, amount) {
    if (amount <= 0 || this.terminal) return !this.terminal;
    this.emit('expense_due', { kind, amount, cashBefore: this.cash });
    let due = amount;
    while (this.cash < due) {
      const step = this.nextEscalation(kind);
      if (!step) {
        this.finish('running_on_empty');
        return false;
      }
      this.emit('escalation_offered', { step, billKind: kind, cashBefore: this.cash, healthBefore: this.health });
      this.emit('action', { kind: 'escalation_accepted', step });
      this.stats.escalation++;
      const eff = {};
      if (step === 'skip_lunch') {
        this.health -= this.p.skipLunchHealth;
        due = 0;
        eff.health = -this.p.skipLunchHealth;
        eff.billWaived = amount;
      } else if (step === 'extra_shift') {
        this.cash += this.p.extraShiftCash;
        this.health -= this.p.extraShiftHealth;
        eff.cash = this.p.extraShiftCash;
        eff.health = -this.p.extraShiftHealth;
      } else if (step === 'sell_couch') {
        this.soldCouch = true;
        this.cash += this.p.couchCash;
        eff.cash = this.p.couchCash;
      } else if (step === 'sell_tv') {
        this.soldTv = true;
        this.cash += this.p.tvCash;
        eff.cash = this.p.tvCash;
      } else if (step === 'credit_card') {
        const draw = Math.min(this.p.creditLimit - this.debt, this.p.creditDrawStep);
        this.debt += draw;
        this.cash += draw;
        eff.cash = draw;
        eff.debtAfter = this.debt;
      }
      this.emit('escalation_result', { step, effects: eff, cashAfter: this.cash, healthAfter: this.health });
      if (this.health <= 0) {
        this.finish('running_on_empty');
        return false;
      }
    }
    this.cash -= due;
    this.stats.minCash = Math.min(this.stats.minCash, this.cash);
    this.emit('expense_paid', { kind, amount: due, cashAfter: this.cash });
    return true;
  }

  nextEscalation(kind) {
    if (kind === 'food' && this.health > 20) return 'skip_lunch';
    if (this.health > 20) return 'extra_shift';
    if (!this.soldCouch) return 'sell_couch';
    if (!this.soldTv) return 'sell_tv';
    if (this.debt < this.p.creditLimit) return 'credit_card';
    return null;
  }

  // ---- event deck ------------------------------------------------------------------
  runDeck(trigger) {
    const cands = EVENT_DECK.filter((e) => e.trigger === trigger && (e.kind !== 'curveball' || this.p.curveballs));
    if (cands.length === 0) return null;
    const rows = cands.map((e) => {
      if ((this.p.eventWeights[e.id] ?? 1) <= 0) return { id: e.id, eligible: false, reason: 'event weight is zero' };
      const [ok, reason] = e.eligible(this);
      return { id: e.id, eligible: ok, reason };
    });
    this.emit('event_eligibility', { trigger, candidates: rows });
    const elig = cands.filter((e, i) => rows[i].eligible);
    if (elig.length === 0) {
      this.stats.eventFallbacks++;
      this.emit('event_result', { id: 'quiet_day', fallback: true, category: 'neutral delight', effects: {} });
      return null;
    }
    const w = elig.map((e) => this.p.eventWeights[e.id] ?? 1);
    const ev = elig[this.rngEvent.weighted(w)];
    if (ev.technique) {
      this.emit('cue_shown', { technique: ev.technique, eventId: ev.id, banner: this.banner, rivalDuck: this.rivalDuck()?.id ?? null });
    }
    const raw = ev.apply(this, this.rngEvent);
    const eff = {};
    for (const [k, v] of Object.entries(raw)) {
      const b = ev.bounds[k];
      eff[k] = b ? Math.max(b[0], Math.min(b[1], v)) : v;
    }
    if (eff.cash) this.cash += eff.cash;
    if (eff.health) this.health += eff.health;
    if (eff.secretDuck) this.secretDuck = true;
    if (eff.rivalInLane1) this.rivalToday = true;
    if (ev.oneTime) this.usedEvents.add(ev.id);
    this.stats.eventsFired++;
    this.stats.minCash = Math.min(this.stats.minCash, this.cash);
    this.emit('event_result', { id: ev.id, fallback: false, category: ev.technique ?? (ev.kind === 'secret' ? 'neutral delight' : 'uncategorized'), effects: eff });
    return ev.id;
  }

  rivalDuck() {
    const leg = this.pool().filter((d) => d.tier === 'legendary');
    return leg.length ? leg[leg.length - 1] : null;
  }

  // ---- races -----------------------------------------------------------------------
  raceDucks() {
    const list = [];
    if (!this.ownDuckSold) list.push({ id: 'own-duck', speed: this.p.ownDuckSpeed });
    if (this.secretDuck) list.push({ id: 'glitch-duck', speed: this.p.tierSpeed.common });
    for (const d of this.roster) if (this.owned.has(d.id)) list.push({ id: d.id, speed: d.speed });
    const m = this.setMultiplier();
    return list.map((d) => ({ ...d, eff: d.speed * m * (d.id === this.lastRacedId ? 1 - this.p.fatiguePenalty : 1) }));
  }

  raceOptions() {
    const ducks = this.raceDucks().sort((a, b) => b.eff - a.eff);
    const best = ducks[0];
    const rested = ducks.find((d) => d.id !== this.lastRacedId) ?? best;
    const longshot = ducks[Math.floor(ducks.length / 2)] ?? best;
    return { best: { duck: best, mult: 1 }, rested: { duck: rested, mult: 1 }, longshot: { duck: longshot, mult: this.p.longshotMultiplier } };
  }

  race(choice) {
    if (this.terminal) return;
    const opts = this.raceOptions();
    this.emit('race_choice_offered', { options: Object.fromEntries(Object.entries(opts).map(([k, o]) => [k, { duckId: o.duck.id, payoutMultiplier: o.mult }])) });
    this.emit('action', { kind: 'race_choice', choice });
    const o = opts[choice] ?? opts.best;
    const noise = (s) => s * (1 + (this.rngRace.next() * 2 - 1) * this.p.raceNoise);
    const fieldMid = this.p.fieldBaseSpeed * (this.p.fieldScalesWithCreep ? this.p.powerCreep ** this.banner : 1);
    const field = [];
    for (let i = 0; i < this.p.fieldSize; i++) {
      field.push({ id: `opp-${i}`, perf: noise(fieldMid * (1 + (this.rngRace.next() * 2 - 1) * this.p.fieldSpread)) });
    }
    let rivalDuck = null;
    if (this.rivalToday && field.length) {
      rivalDuck = this.rivalDuck();
      field[0] = { id: 'rival-whale', perf: noise(rivalDuck.speed) };
    }
    const mine = { id: o.duck.id, perf: noise(o.duck.eff), mine: true };
    const ranked = [...field, mine].sort((a, b) => b.perf - a.perf);
    const place = ranked.indexOf(mine) + 1;
    const rivalPlace = rivalDuck ? ranked.findIndex((r) => r.id === 'rival-whale') + 1 : null;
    const payout = Math.round((this.p.payoutByPlace[place - 1] ?? 0) * this.p.payoutScale * o.mult);
    this.gems += payout;
    this.stats.gemsFromRaces += payout;
    this.stats.races++;
    this.stats.placeCounts[place - 1]++;
    this.lastRacedId = o.duck.id;
    this.emit('race_result', { choice, duckId: o.duck.id, speedUsed: round4(o.duck.eff), place, fieldSize: ranked.length, payoutGems: payout, gemsAfter: this.gems, rivalPlace, rivalDuckId: rivalDuck?.id ?? null });
  }

  // ---- day loop --------------------------------------------------------------------
  /** Play one in-game day using a strategy. Terminal checks happen after each phase. */
  playDay(strategy) {
    if (this.terminal) return;
    const d = this.day;
    if (d > 1 && (d - 1) % this.p.bannerDays === 0) {
      this.banner = (d - 1) / this.p.bannerDays;
      this.bannerStart();
    }
    this.cash += this.p.wagePerDay;
    this.emit('wage', { amount: this.p.wagePerDay, cashAfter: this.cash });
    this.health = Math.min(this.p.healthStart, this.health + this.p.healthRecoveryPerDay);
    if (d % 7 === 0) this.runDeck('weekly');
    this.rivalToday = false;
    this.runDeck('race_day');
    if (!this.pawnDone && d >= Math.max(2, Math.floor(this.p.maxDays * this.p.pawnDayFraction))) {
      this.pawnDone = true;
      this.emit('offer_shown', { kind: 'pawn', technique: 'pressure_on_possession', amountCash: this.p.pawnOffer, item: 'own duck' });
      const choice = strategy.pawn ? strategy.pawn(this) : 'decline';
      this.emit('action', { kind: choice === 'accept' ? 'pawn_accepted' : 'pawn_declined' });
      if (choice === 'accept') {
        this.ownDuckSold = true;
        this.cash += this.p.pawnOffer;
        this.emit('reward', { kind: 'pawn_cash', cash: this.p.pawnOffer, cashAfter: this.cash });
      }
    }
    if (this.gems < this.p.pullSingle) this.openShop();
    strategy.act(this);
    if (this.terminal) return;
    if (this.collectionComplete()) return this.finish('completed_collection');
    for (let i = 0; i < this.p.racesPerDay; i++) this.race(strategy.raceChoice(this, i));
    if (!this.payBill('food', this.p.foodPerDay)) return;
    if (d % 7 === 0) {
      if (!this.payBill('rent', this.p.rentPerWeek)) return;
      if (this.debt > 0) {
        const interest = Math.ceil(this.debt * this.p.creditWeeklyRate);
        this.debt += interest;
        this.emit('interest_charged', { amount: interest, debtAfter: this.debt });
      }
    }
    if (d >= this.p.maxDays) return this.finish('run_complete');
    this.day++;
  }

  summary() {
    const s = this.stats;
    const ownedDistinct = this.roster.filter((d) => this.owned.has(d.id)).length;
    return {
      route: this.terminal, day: this.day, ownedDistinct, rosterSize: this.roster.length, gems: this.gems, cash: this.cash,
      debt: this.debt, health: this.health, down: this.down, logLength: this.log.length, fingerprint: this.log.head, ...s,
    };
  }
}

/** Run a full strategy-driven run to its terminal route (or maxDays). */
export function simulate(params, seed, strategy) {
  const run = new Run(params, seed);
  run.start();
  let guard = 0;
  while (!run.terminal && guard++ < 10000) run.playDay(strategy);
  return run;
}
