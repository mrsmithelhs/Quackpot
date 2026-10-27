// src/core/game-engine.mjs
// Core Game Engine and State Machine for Quackpot Plan 03 Mechanism Slice.
// Fully implements the ratified Revision 3 contract and Repair 01 specifications:
// - Persisted learner progression state (step, activeModal, interruptedContext, completedRaces, raceResults)
// - Guarded one-time mutations (promotional pull, races, starter pack, companion setup)
// - Solvent zero-cash options (continue, extra shift, sell couch) separate from unpaid bill escalations
// - Frozen terminal state: no retention modal or gameplay mutations after terminal route / Receipt presentation
// - Truthful repeated retention modal messaging
// - Strict Receipt presentation logging boundary

import { createRng, restoreRng } from './prng.mjs';
import { EventLog, verifyCompleteness } from './event-log.mjs';
import { projectReceipt } from './receipt.mjs';

export const BANNER_1_ROSTER = [
  { id: 'duck-0', name: 'Puddle Quacker', tier: 'common', speed: 10.0 },
  { id: 'duck-1', name: 'Rubber Mallard', tier: 'common', speed: 10.0 },
  { id: 'duck-2', name: 'Pond Rocket', tier: 'rare', speed: 14.0 },
  { id: 'duck-3', name: 'Bath Cadet', tier: 'common', speed: 10.0 },
  { id: 'duck-4', name: 'Turbo Drake', tier: 'rare', speed: 14.0 },
  { id: 'duck-5', name: 'Biblically Accurate Duck', tier: 'legendary', speed: 20.0 },
];

export const DUCK_COSMETICS = Object.freeze({
  'duck-0': Object.freeze({ palette: 'classic-yellow', hat: 'none', accessory: 'none' }),
  'duck-1': Object.freeze({ palette: 'mallard-green', hat: 'none', accessory: 'none' }),
  'duck-2': Object.freeze({ palette: 'bubblegum-pink', hat: 'sailor-cap', accessory: 'none' }),
  'duck-3': Object.freeze({ palette: 'classic-yellow', hat: 'sailor-cap', accessory: 'none' }),
  'duck-4': Object.freeze({ palette: 'mallard-green', hat: 'tiny-top-hat', accessory: 'bow-tie' }),
  'duck-5': Object.freeze({ palette: 'bubblegum-pink', hat: 'tiny-top-hat', accessory: 'monocle' }),
});

export const GAME_CONSTANTS = {
  START_CASH: 15.00,
  START_HEALTH: 100,
  WAGE_DAILY: 10.00,
  FOOD_DAILY: 5.00,
  RENT_DAY2: 15.00,
  STARTER_PRICE: 0.99,
  STARTER_GEMS: 240,
  RETENTION_GEMS: 80,
  PULL_SINGLE_COST: 160,
  PULL_TEN_COST: 1600,
  DOWN_PER_DUPLICATE: { common: 1, rare: 5, legendary: 20 },
  DOWN_GEM_VALUE: 0.02,
  TUTORIAL_FIELD_SPEED: 8.0,
  FINALE_FIELD_SPEED: 11.2,
};

/** Pre-draw odds calculation matching linear pity model */
export function calculatePreDrawOdds(pityCount, softPityStart = 35, hardPity = 50) {
  const n = pityCount + 1;
  const baseLegendary = 0.02;
  let pL = baseLegendary;

  if (n >= hardPity) {
    pL = 1.0;
  } else if (n >= softPityStart) {
    const span = hardPity - softPityStart + 1; // 16
    const progress = (n - softPityStart + 1) / span;
    pL = baseLegendary + (1 - baseLegendary) * progress;
  }

  const rest = 1 - pL;
  const rareShare = 0.18 / (0.18 + 0.80);
  return {
    common: rest * (1 - rareShare),
    rare: rest * rareShare,
    legendary: pL,
  };
}

export class GameEngine {
  constructor(seed = String(Date.now())) {
    this.seed = String(seed);
    this.log = new EventLog();

    this.rng = createRng(this.seed);
    this.rngDraw = this.rng.fork('draw');
    this.rngRace = this.rng.fork('race');
    this.rngEvent = this.rng.fork('event');

    this.autosaveEnabled = true;

    this.state = {
      day: 1,
      clock: { day: 1, label: 'day 1 morning' },
      phase: 'setup', // 'setup' | 'playing' | 'escalation' | 'terminal' | 'receipt_presented'
      step: 'desk',   // Exact persisted progression step
      activeModal: null, // null | 'starter' | 'zerocash' | 'escalation' | 'retention'
      interruptedContext: null, // { step, activeModal } saved during retention interruption
      cash: GAME_CONSTANTS.START_CASH,
      gems: 0,
      health: GAME_CONSTANTS.START_HEALTH,
      debt: 0,
      down: 0,
      pityCount: 0,
      physicalCompanion: { name: 'Professor Quacks', style: 'classic-yellow', pawned: false },
      owned: [], // array of duck id strings
      seenDexEntries: [], // array of duck id strings whose Dex acquisition was presented or skipped
      pendingReveals: [], // queue of committed unrevealed draws
      lastRacedId: null,
      tenPullCommitted: false,
      completedRaces: [], // array of completed race numbers: [1, 2]
      raceResults: {},    // raceNumber -> outcome object
      lastRaceResult: null,
      billsSettled: [],   // array of settled bill IDs: ['d1_food', 'd2_rent', ...]
      assetsSold: [],     // array of sold asset strings: ['couch', 'tv']
      starterOffered: false,
      starterBought: false,
      retentionOffered: false,
      retentionUsed: false,
      terminalRoute: null,
      activeBill: null,   // pending unpaid bill during escalation
      escalationStepIndex: 0,
    };
  }

  isTerminal() {
    return this.state.phase === 'terminal' || this.state.phase === 'receipt_presented';
  }

  /** Starts the game run, logs run_started, and transitions to companion setup */
  start() {
    if (this.isTerminal()) throw new Error('Cannot start run: game is in terminal phase');
    if (this.log.entries.some((e) => e.type === 'run_started')) return;
    this.log.append('run_started', { seed: this.seed }, this.state.clock);
    this.state.step = 'desk';
  }

  /** Styles and names the physical companion */
  setupCompanion(name = 'Professor Quacks', style = 'classic-yellow') {
    if (this.isTerminal()) throw new Error('Cannot setup companion: game is in terminal phase');
    this.state.physicalCompanion = { name, style, pawned: false };
    this.log.append('companion_styled', { name, style }, this.state.clock);
    this.state.phase = 'playing';
    this.state.step = 'd1_morning_gacha';
  }

  /**
   * Commits the promotional free 10-pull.
   * Guarded against repeated execution.
   */
  commitPromotionalTenPull() {
    if (this.isTerminal()) throw new Error('Cannot pull: game is in terminal phase');
    if (this.state.tenPullCommitted) {
      return this.state.pendingReveals;
    }

    const draws = [];
    const bannerPool = BANNER_1_ROSTER;
    const ownedSet = new Set(this.state.owned);

    for (let i = 0; i < 10; i++) {
      const odds = calculatePreDrawOdds(this.state.pityCount);
      const r = this.rngDraw.next();
      let rarity = 'common';
      if (r < odds.legendary) {
        rarity = 'legendary';
      } else if (r < odds.legendary + odds.rare) {
        rarity = 'rare';
      }

      const matchingDucks = bannerPool.filter((d) => d.tier === rarity);
      const chosenDuck = matchingDucks[this.rngDraw.int(matchingDucks.length)];

      const isDuplicate = ownedSet.has(chosenDuck.id);
      let downGained = 0;
      if (!isDuplicate) {
        ownedSet.add(chosenDuck.id);
        this.state.owned.push(chosenDuck.id);
      } else {
        downGained = GAME_CONSTANTS.DOWN_PER_DUPLICATE[rarity];
        this.state.down += downGained;
      }

      const drawPayload = {
        drawIndex: i + 1,
        of: 10,
        pityBefore: this.state.pityCount,
        drawNumberInWindow: this.state.pityCount + 1,
        odds,
        rarity,
        identity: chosenDuck.id,
        duplicate: isDuplicate,
        downGained,
        advancesPity: false,
      };

      const entry = this.log.append('draw_committed', drawPayload, this.state.clock);
      draws.push({
        ...drawPayload,
        commitSeq: entry.seq,
        revealed: false,
      });
    }

    this.state.pendingReveals = draws;
    this.state.tenPullCommitted = true;
    return draws;
  }

  /**
   * Reveals a committed draw card at a specific index.
   * Appends reveal_shown to the event log.
   */
  revealDrawAtIndex(idx) {
    if (this.isTerminal()) throw new Error('Cannot reveal draw: game is in terminal phase');
    if (idx < 0 || idx >= this.state.pendingReveals.length) return null;

    const draw = this.state.pendingReveals[idx];
    if (draw.revealed) return draw; // Idempotent if already revealed

    draw.revealed = true;
    this.log.append('reveal_shown', {
      commitSeq: draw.commitSeq,
      rarity: draw.rarity,
      identity: draw.identity,
      duplicate: draw.duplicate,
      downGained: draw.downGained,
    }, this.state.clock);

    return draw;
  }

  /** Reveals the next unrevealed card in sequence */
  revealNextDraw() {
    const unrevealedIndex = this.state.pendingReveals.findIndex((d) => !d.revealed);
    if (unrevealedIndex === -1) return null;
    return this.revealDrawAtIndex(unrevealedIndex);
  }

  /** Reveal all remaining unrevealed draws in sequence */
  revealAllPending() {
    const revealed = [];
    for (let i = 0; i < this.state.pendingReveals.length; i++) {
      if (!this.state.pendingReveals[i].revealed) {
        revealed.push(this.revealDrawAtIndex(i));
      }
    }
    return revealed;
  }

  /** Returns the first actually revealed duplicate and its help-log state. */
  getDuplicateConversionHelpState() {
    const entries = this.log.entries;
    const commits = new Map(entries.filter((entry) => entry.type === 'draw_committed').map((entry) => [entry.seq, entry]));
    const firstReveal = entries.find((entry) => {
      if (entry.type !== 'reveal_shown' || entry.payload?.duplicate !== true) return false;
      const commit = commits.get(entry.payload.commitSeq);
      return !!commit && commit.seq < entry.seq && commit.payload.duplicate === true
        && commit.payload.identity === entry.payload.identity
        && commit.payload.rarity === entry.payload.rarity
        && commit.payload.downGained === entry.payload.downGained;
    });
    if (!firstReveal) return null;
    const cue = entries.find((entry) => entry.type === 'cue_shown'
      && entry.payload?.cueId === 'duplicate_conversion_help'
      && entry.payload?.sourceRevealSeq === firstReveal.seq
      && entry.payload?.identity === firstReveal.payload.identity
      && entry.payload?.rarity === firstReveal.payload.rarity
      && entry.payload?.downGained === firstReveal.payload.downGained);
    const dismissed = !!cue && entries.some((entry) => entry.type === 'action'
      && entry.payload?.kind === 'duplicate_help_dismissed'
      && entry.seq > cue.seq
      && entry.payload?.sourceCueSeq === cue.seq);
    return { reveal: firstReveal, cue: cue ?? null, dismissed };
  }

  /** Records help only for the first duplicate that was actually revealed. */
  showDuplicateConversionHelp(sourceRevealSeq) {
    if (this.isTerminal()) return null;
    const existing = this.getDuplicateConversionHelpState();
    if (!existing || existing.reveal.seq !== sourceRevealSeq || existing.cue || existing.dismissed) return null;
    const reveal = existing.reveal;
    const expectedDown = GAME_CONSTANTS.DOWN_PER_DUPLICATE[reveal.payload.rarity];
    if (expectedDown === undefined || reveal.payload.downGained !== expectedDown) return null;
    return this.log.append('cue_shown', {
      cueId: 'duplicate_conversion_help',
      sourceRevealSeq: reveal.seq,
      identity: reveal.payload.identity,
      rarity: reveal.payload.rarity,
      downGained: reveal.payload.downGained,
      conversionRates: { ...GAME_CONSTANTS.DOWN_PER_DUPLICATE },
      copy: `Duplicate ducks are automatically returned and converted to Down. This ${reveal.payload.rarity} duplicate awarded ${reveal.payload.downGained} Down. Common duplicates award 1, Rare 5, and Legendary 20.`,
    }, this.state.clock);
  }

  /** Records an explicit dismissal for the one displayed duplicate-help cue. */
  dismissDuplicateConversionHelp(sourceCueSeq) {
    if (this.isTerminal()) return null;
    const state = this.getDuplicateConversionHelpState();
    if (!state?.cue || state.cue.seq !== sourceCueSeq || state.dismissed) return null;
    return this.log.append('action', {
      kind: 'duplicate_help_dismissed',
      sourceCueSeq: state.cue.seq,
    }, this.state.clock);
  }

  /** Returns pure collection and set progress state for the Duck-Dex shelf */
  getDexCollectionState() {
    const ownedSet = new Set(this.state.owned || []);
    const seenSet = new Set(this.state.seenDexEntries || []);

    // Secrecy protection: Any duck newly acquired in the current pending batch that has NOT been revealed yet
    // must remain completely concealed on the Duck-Dex shelf as an unowned silhouette.
    const unrevealedNewIdentities = new Set(
      (this.state.pendingReveals || [])
        .filter((d) => !d.revealed && !d.duplicate)
        .map((d) => d.identity)
    );

    const roster = BANNER_1_ROSTER.map((duck) => {
      const isDiscovered = ownedSet.has(duck.id) && !unrevealedNewIdentities.has(duck.id);
      return {
        ...duck,
        cosmetics: DUCK_COSMETICS[duck.id] || { palette: 'classic-yellow', hat: 'none', accessory: 'none' },
        owned: isDiscovered,
        authoritativeOwned: ownedSet.has(duck.id),
        seen: seenSet.has(duck.id),
      };
    });

    const totalDucks = BANNER_1_ROSTER.length;
    const discoveredCount = roster.filter((d) => d.owned).length;
    const isComplete = discoveredCount >= totalDucks;
    const sets = [
      {
        id: 'pond_of_destiny',
        name: 'Pond of Destiny',
        banner: 1,
        owned: discoveredCount,
        total: totalDucks,
        complete: isComplete,
        effectText: 'None active (standard banner set)',
      },
    ];
    return {
      roster,
      totalDucks,
      ownedCount: discoveredCount,
      authoritativeOwnedCount: this.state.owned.length,
      isComplete,
      sets,
    };
  }

  /**
   * Records a voluntary Duck-Dex inspection action.
   * Emits a completion_pressure cue if any sets remain incomplete.
   */
  recordDexViewed(source = 'hud') {
    if (this.isTerminal()) return null;
    const action = this.log.append('action', {
      kind: 'duck_dex_viewed',
      source,
    }, this.state.clock);

    let cue = null;
    const state = this.getDexCollectionState();
    if (!state.isComplete) {
      cue = this.log.append('cue_shown', {
        cueId: 'completion_pressure',
        technique: 'completion_pressure',
        setProgress: state.sets.map((s) => ({ set: s.name, owned: s.owned, total: s.total })),
        incompleteSets: state.sets.filter((s) => !s.complete).length,
      }, this.state.clock);
    }
    return { action, cue };
  }

  /** Marks a newly acquired duck identity as seen in the Duck-Dex */
  markDexEntrySeen(duckId) {
    if (!Array.isArray(this.state.seenDexEntries)) {
      this.state.seenDexEntries = [];
    }
    if (!this.state.seenDexEntries.includes(duckId)) {
      this.state.seenDexEntries.push(duckId);
    }
  }

  /** Records a real presentation cue for a newly acquired duck entry */
  recordAcquisitionCue(duckId, { focusMs = 2000, transitionMs = 2500, isStatic = false } = {}) {
    if (this.isTerminal()) return null;
    this.markDexEntrySeen(duckId);
    const duck = BANNER_1_ROSTER.find((d) => d.id === duckId);
    return this.log.append('cue_shown', {
      cueId: isStatic ? 'duck_dex_acquisition_static' : 'duck_dex_acquisition',
      identity: duckId,
      rarity: duck?.tier || 'common',
      focusMs: isStatic ? 0 : focusMs,
      transitionMs: isStatic ? 0 : transitionMs,
    }, this.state.clock);
  }

  /** Records an explicit player skip of the acquisition presentation sequence */
  skipAcquisitionPresentation(remainingCount = 0) {
    if (this.isTerminal()) return null;
    return this.log.append('action', {
      kind: 'acquisition_presentation_skipped',
      remainingCount,
    }, this.state.clock);
  }

  /**
   * Executes a pond race.
   * raceNumber: 1 (Tutorial) or 2 (Finale).
   * duckId: owned duck ID entered by player.
   * stance: 'safe' | 'sprint'.
   * Guarded: already-completed races return cached result without duplicating events or payouts.
   */
  runRace(raceNumber, duckId, stance = 'safe') {
    if (this.isTerminal()) throw new Error('Cannot race: game is in terminal phase');
    
    // Idempotent guard: if race already ran, return cached result
    if (this.state.completedRaces.includes(raceNumber) && this.state.raceResults[raceNumber]) {
      return this.state.raceResults[raceNumber];
    }

    const isTutorial = (raceNumber === 1);
    const baseFieldSpeed = isTutorial ? GAME_CONSTANTS.TUTORIAL_FIELD_SPEED : GAME_CONSTANTS.FINALE_FIELD_SPEED;

    const duckDef = BANNER_1_ROSTER.find((d) => d.id === duckId) ?? BANNER_1_ROSTER[0];
    const S = duckDef.speed;

    // Emit pre-race choice options and action
    this.log.append('race_choice_offered', {
      options: {
        safe: { label: 'Safe Pace (±5% variance, reliable finish)', targetSpeed: S, noise: 0.05 },
        sprint: { label: 'Sprint Push (+10% peak boost, ±20% variance)', targetSpeed: S * 1.10, noise: 0.20 },
      },
      duckId,
      fieldBaseSpeed: baseFieldSpeed,
    }, this.state.clock);

    this.log.append('action', { kind: 'race_choice', stance, duckId }, this.state.clock);

    // Player performance calculation
    const uPlayer = this.rngRace.next();
    const noiseSpan = stance === 'safe' ? 0.05 : 0.20;
    const targetSpeed = stance === 'safe' ? S : S * 1.10;
    const playerPerf = targetSpeed * (1 + (2 * uPlayer - 1) * noiseSpan);

    // 5 independent opponents
    const opponents = [];
    for (let i = 1; i <= 5; i++) {
      const uOpp = this.rngRace.next();
      const oppPerf = baseFieldSpeed * (1 + (2 * uOpp - 1) * 0.05);
      opponents.push({
        lane: i === 1 ? 1 : i + 1,
        perf: oppPerf,
        isRival: i === 1 && !isTutorial,
      });
    }

    const playerEntry = { lane: 2, perf: playerPerf, isPlayer: true };
    const allEntrants = [playerEntry, ...opponents];

    // Sort descending by performance. Deterministic ties: player wins over AI, lower lane wins over higher lane.
    allEntrants.sort((a, b) => {
      const diff = b.perf - a.perf;
      if (Math.abs(diff) > 1e-6) return diff;
      if (a.isPlayer) return -1;
      if (b.isPlayer) return 1;
      return a.lane - b.lane;
    });

    const place = allEntrants.findIndex((e) => e.isPlayer) + 1;
    const rivalEntrant = allEntrants.find((e) => e.isRival);
    const rivalPlace = rivalEntrant ? allEntrants.indexOf(rivalEntrant) + 1 : null;

    let payoutGems = 0;
    if (place === 1) payoutGems = 50;
    else if (place === 2) payoutGems = 20;
    else if (place === 3) payoutGems = 10;

    this.state.gems += payoutGems;
    this.state.lastRacedId = duckId;

    this.log.append('race_result', {
      raceNumber,
      duckId,
      stance,
      place,
      payoutGems,
      gemsAfter: this.state.gems,
      rivalPlace,
      playerPerf: Math.round(playerPerf * 100) / 100,
    }, this.state.clock);

    if (payoutGems > 0) {
      this.log.append('reward', { kind: 'race_gems', gems: payoutGems, gemsAfter: this.state.gems }, this.state.clock);
    }

    const outcome = { place, payoutGems, rivalPlace, playerPerf };
    this.state.completedRaces.push(raceNumber);
    this.state.raceResults[raceNumber] = outcome;
    this.state.lastRaceResult = outcome;
    this.state.step = isTutorial ? 'd1_midday_race_result' : 'd3_midday_race_result';

    return outcome;
  }

  /** Displays the $0.99 Starter Pack offer */
  displayStarterOffer() {
    if (this.isTerminal()) throw new Error('Cannot display starter offer: game is in terminal phase');
    this.state.starterOffered = true;
    this.state.step = 'd1_afternoon_starter';
    this.state.activeModal = 'starter';
    this.log.append('offer_shown', {
      technique: 'anchoring',
      gems: GAME_CONSTANTS.STARTER_GEMS,
      price: GAME_CONSTANTS.STARTER_PRICE,
      anchorLabel: '400% value',
    }, this.state.clock);
  }

  /** Buys the Starter Pack for $0.99 */
  buyStarterPack() {
    if (this.isTerminal()) throw new Error('Cannot buy starter pack: game is in terminal phase');
    if (this.state.starterBought) return false;
    if (this.state.cash < GAME_CONSTANTS.STARTER_PRICE) return false;

    this.state.cash = Math.round((this.state.cash - GAME_CONSTANTS.STARTER_PRICE) * 100) / 100;
    this.state.gems += GAME_CONSTANTS.STARTER_GEMS;
    this.state.starterBought = true;
    this.state.activeModal = null;

    this.log.append('purchase', {
      kind: 'starter',
      price: GAME_CONSTANTS.STARTER_PRICE,
      bundleGems: GAME_CONSTANTS.STARTER_GEMS,
      gemsAfter: this.state.gems,
    }, this.state.clock);

    return true;
  }

  /** Declines the Starter Pack */
  declineStarterPack() {
    if (this.isTerminal()) throw new Error('Cannot decline starter pack: game is in terminal phase');
    this.state.activeModal = null;
    this.log.append('action', { kind: 'starter_declined' }, this.state.clock);
  }

  /** Displays the Gem Bundle Shop (exercises currency_obfuscation on Receipt) */
  displayGemShop() {
    if (this.isTerminal()) return;
    this.log.append('cue_shown', {
      technique: 'currency_obfuscation',
      bundles: [
        { gems: 60, price: 0.99 },
        { gems: 330, price: 4.99 },
        { gems: 1090, price: 14.99 },
      ],
      pullCost: GAME_CONSTANTS.PULL_SINGLE_COST,
    }, this.state.clock);
  }

  /** Credits daily wage at end of day */
  creditWage() {
    if (this.isTerminal()) throw new Error('Cannot credit wage: game is in terminal phase');
    this.state.cash += GAME_CONSTANTS.WAGE_DAILY;
    this.state.cash = Math.round(this.state.cash * 100) / 100;
    this.log.append('income', { kind: 'wage', amount: GAME_CONSTANTS.WAGE_DAILY }, this.state.clock);
  }

  getBillId(kind) {
    return `d${this.state.day}_${kind}`;
  }

  /**
   * Attempts to pay an expense bill (food or rent).
   * Guarded against repeated execution: each day/kind bill occurrence is once-only (Repair 02, P1).
   * Updates state.step and state.activeModal atomically with the mutation.
   * Returns:
   * - { paid: true }: paid in cash immediately (or already settled)
   * - { paid: false, needsEscalation: true }: cash insufficient, active bill pending escalation
   */
  billExpense(kind, amount) {
    if (this.isTerminal()) throw new Error('Cannot bill expense: game is in terminal phase');
    if (!this.state.billsSettled) this.state.billsSettled = [];

    const billId = this.getBillId(kind);

    // 1. Idempotency guard: if this exact bill was already settled, return success without duplicating
    if (this.state.billsSettled.includes(billId)) {
      return { paid: true, needsEscalation: false, alreadySettled: true };
    }

    // 2. If this exact bill is already pending in activeBill, return needsEscalation without re-logging
    if (this.state.activeBill && this.state.activeBill.billId === billId) {
      return { paid: false, needsEscalation: true, alreadyPending: true };
    }

    this.log.append('expense_due', { kind, amount, cashBefore: this.state.cash, billId }, this.state.clock);

    if (this.state.cash >= amount) {
      this.state.cash = Math.round((this.state.cash - amount) * 100) / 100;
      this.state.billsSettled.push(billId);
      this.log.append('expense_paid', { kind, amount, cashAfter: this.state.cash, billId }, this.state.clock);

      // Check for zero-cash solvency tension if cash hits exactly $0
      if (this.state.cash === 0) {
        this.state.activeModal = 'zerocash';
        this.state.step = (kind === 'rent') ? 'd2_afternoon_zerocash' : this.state.step;
        this.log.append('escalation_offered', {
          step: 'zero_cash_check',
          billKind: kind,
          cashBefore: 0,
          healthBefore: this.state.health,
          billId,
        }, this.state.clock);
        return { paid: true, needsEscalation: false, zeroCash: true };
      }

      if (kind === 'rent') {
        this.state.step = 'd2_afternoon_rent_resolved';
        this.state.activeModal = null;
      }

      return { paid: true, needsEscalation: false };
    }

    // Cash insufficient: active escalation
    this.state.activeBill = { kind, amount, billId };
    this.state.phase = 'escalation';
    this.state.escalationStepIndex = 1;
    this.state.activeModal = 'escalation';
    this.state.step = (kind === 'rent') ? 'd2_afternoon_escalation' : this.state.step;
    return { paid: false, needsEscalation: true };
  }

  /**
   * Solvent zero-cash recovery options (Repair 01, P1).
   * Handles choices made at $0.00 cash after bills are paid in full.
   * Neither invents an unpaid bill nor sets running_on_empty.
   */
  chooseZeroCashOption(choice) {
    if (this.isTerminal()) throw new Error('Cannot choose zero-cash option: game is in terminal phase');
    if (choice === 'sell_couch' && this.state.assetsSold.includes('couch')) {
      throw new Error('Couch already sold');
    }
    if (this.state.cash !== 0) throw new Error(`Zero-cash option selected when cash is $${this.state.cash}`);

    if (choice === 'continue') {
      this.state.activeModal = null;
      this.state.step = 'd2_afternoon_rent_resolved';
      this.log.append('action', { kind: 'continue_to_wage' }, this.state.clock);
      return { resolved: true, choice: 'continue', cash: this.state.cash, health: this.state.health };
    }

    if (choice === 'extra_shift') {
      if (this.state.health <= 20) throw new Error('Health too low for extra shift');
      this.state.cash += 10.00;
      this.state.health -= 15;
      this.state.activeModal = null;
      this.state.step = 'd2_afternoon_rent_resolved';

      this.log.append('action', { kind: 'zero_cash_extra_shift' }, this.state.clock);
      this.log.append('escalation_result', {
        step: 'extra_shift',
        effects: { cashGained: 10, healthLost: 15 },
        cashAfter: this.state.cash,
        healthAfter: this.state.health,
      }, this.state.clock);

      return { resolved: true, choice: 'extra_shift', cash: this.state.cash, health: this.state.health };
    }

    if (choice === 'sell_couch') {
      if (this.state.assetsSold.includes('couch')) throw new Error('Couch already sold');
      this.state.assetsSold.push('couch');
      this.state.cash += 10.00;
      this.state.activeModal = null;
      this.state.step = 'd2_afternoon_rent_resolved';

      this.log.append('action', { kind: 'zero_cash_sell_couch' }, this.state.clock);
      this.log.append('escalation_result', {
        step: 'sell_couch',
        effects: { cashGained: 10 },
        cashAfter: this.state.cash,
        healthAfter: this.state.health,
      }, this.state.clock);

      return { resolved: true, choice: 'sell_couch', cash: this.state.cash, health: this.state.health };
    }

    throw new Error(`Unknown zero-cash choice: "${choice}"`);
  }

  /** Backward-compatible alias for continue to wage */
  continueToWage() {
    return this.chooseZeroCashOption('continue');
  }

  /** Returns the current eligible escalation step for an unpaid bill */
  getCurrentEscalationStep() {
    if (!this.state.activeBill) return null;
    const kind = this.state.activeBill.kind;

    // Steps: 1: skip_lunch (food only), 2: extra_shift, 3: sell_couch, 4: sell_tv, 5: credit_card
    const idx = this.state.escalationStepIndex;
    if (idx === 1) {
      if (kind === 'food' && this.state.health > 20) return 'skip_lunch';
      this.state.escalationStepIndex = 2;
    }
    if (this.state.escalationStepIndex === 2) {
      if (this.state.health > 20) return 'extra_shift';
      this.state.escalationStepIndex = 3;
    }
    if (this.state.escalationStepIndex === 3) {
      if (!this.state.assetsSold.includes('couch')) return 'sell_couch';
      this.state.escalationStepIndex = 4;
    }
    if (this.state.escalationStepIndex === 4) {
      if (!this.state.assetsSold.includes('tv')) return 'sell_tv';
      this.state.escalationStepIndex = 5;
    }
    if (this.state.escalationStepIndex === 5) {
      if (this.state.debt < 50.00) return 'credit_card';
    }
    return null;
  }

  /** Accepts the current escalation step for an unpaid bill */
  acceptEscalation() {
    if (this.isTerminal()) throw new Error('Cannot accept escalation: game is in terminal phase');
    const step = this.getCurrentEscalationStep();
    if (!step) return this.exhaustEscalation();

    this.log.append('action', { kind: 'escalation_accepted', step }, this.state.clock);

    const bill = this.state.activeBill;
    const eff = {};

    if (step === 'skip_lunch') {
      this.state.health -= 15;
      eff.healthLost = 15;
      eff.billWaived = bill.amount;
      this.log.append('escalation_result', {
        step,
        effects: eff,
        cashAfter: this.state.cash,
        healthAfter: this.state.health,
      }, this.state.clock);

      this.log.append('expense_paid', { kind: bill.kind, amount: 0, cashAfter: this.state.cash }, this.state.clock);
      this.state.activeBill = null;
      this.state.activeModal = null;
      this.state.phase = 'playing';
      return { resolved: true, route: null };
    }

    if (step === 'extra_shift') {
      this.state.cash += 10.00;
      this.state.health -= 15;
      eff.cashGained = 10.00;
      eff.healthLost = 15;
    } else if (step === 'sell_couch') {
      this.state.assetsSold.push('couch');
      this.state.cash += 10.00;
      eff.cashGained = 10.00;
    } else if (step === 'sell_tv') {
      this.state.assetsSold.push('tv');
      this.state.cash += 15.00;
      eff.cashGained = 15.00;
    } else if (step === 'credit_card') {
      this.state.cash += 15.00;
      this.state.debt += 15.00;
      eff.cashGained = 15.00;
      eff.debtAfter = this.state.debt;
    }

    this.state.cash = Math.round(this.state.cash * 100) / 100;

    this.log.append('escalation_result', {
      step,
      effects: eff,
      cashAfter: this.state.cash,
      healthAfter: this.state.health,
    }, this.state.clock);

    // If cash is now sufficient to pay the bill
    if (this.state.cash >= bill.amount) {
      this.state.cash = Math.round((this.state.cash - bill.amount) * 100) / 100;
      if (!this.state.billsSettled) this.state.billsSettled = [];
      if (bill.billId && !this.state.billsSettled.includes(bill.billId)) {
        this.state.billsSettled.push(bill.billId);
      }
      this.log.append('expense_paid', { kind: bill.kind, amount: bill.amount, cashAfter: this.state.cash, billId: bill.billId }, this.state.clock);
      this.state.activeBill = null;
      this.state.activeModal = null;
      this.state.phase = 'playing';
      this.state.step = 'd2_afternoon_rent_resolved';
      return { resolved: true, route: null };
    }

    // Still insufficient, advance to next step
    this.state.escalationStepIndex++;
    return { resolved: false, route: null };
  }

  /** Declines current escalation step and advances to the next */
  declineEscalation() {
    if (this.isTerminal()) throw new Error('Cannot decline escalation: game is in terminal phase');
    const step = this.getCurrentEscalationStep();
    this.log.append('action', { kind: 'escalation_declined', step }, this.state.clock);

    this.state.escalationStepIndex++;
    if (!this.getCurrentEscalationStep()) {
      return this.exhaustEscalation();
    }
    return { resolved: false, route: null };
  }

  /** Escalation exhausted or defaulted on unpaid bill */
  exhaustEscalation() {
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'running_on_empty';
    this.state.step = 'receipt';
    this.state.activeModal = null;
    this.log.append('terminal', { route: 'running_on_empty' }, this.state.clock);
    return { resolved: false, route: 'running_on_empty' };
  }

  /**
   * Opens retention modal on clicking persistent Uninstall button.
   * Frozen terminal guard: impossible to call once terminal/Receipt presented.
   */
  clickUninstall() {
    if (this.isTerminal()) {
      throw new Error('Cannot uninstall after run is terminal or Receipt presented');
    }
    this.state.interruptedContext = {
      step: this.state.step,
      activeModal: this.state.activeModal,
    };
    this.state.activeModal = 'retention';
    this.state.retentionOffered = true;

    this.log.append('action', { kind: 'uninstall_chosen' }, this.state.clock);
    this.log.append('retention_modal_shown', {
      technique: 'exit_friction',
      gemsOffered: this.state.retentionUsed ? 0 : GAME_CONSTANTS.RETENTION_GEMS,
      stayLabel: 'play out the trap',
    }, this.state.clock);
  }

  /** Chooses 'Leave Anyway' from the retention modal */
  leaveUninstall() {
    if (this.isTerminal()) throw new Error('Cannot leave uninstall: game is already in terminal phase');
    this.log.append('action', { kind: 'leave_immediately' }, this.state.clock);
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'uninstall';
    this.state.step = 'receipt';
    this.state.activeModal = null;
    this.log.append('terminal', { route: 'uninstall' }, this.state.clock);
    return 'uninstall';
  }

  /**
   * Chooses 'Play Out The Trap' from retention modal.
   * Truthful repeat retention: only awards 80 gems once; restores previous context cleanly.
   */
  stayUninstall() {
    if (this.isTerminal()) throw new Error('Cannot stay: game is in terminal phase');
    if (!this.state.retentionUsed) {
      this.state.gems += GAME_CONSTANTS.RETENTION_GEMS;
      this.state.retentionUsed = true;
      this.log.append('action', { kind: 'play_out_the_trap' }, this.state.clock);
      this.log.append('reward', {
        kind: 'retention_gems',
        gems: GAME_CONSTANTS.RETENTION_GEMS,
        gemsAfter: this.state.gems,
      }, this.state.clock);
    } else {
      this.log.append('action', { kind: 'stay_without_reward' }, this.state.clock);
    }

    // Restore interrupted step and modal
    if (this.state.interruptedContext) {
      this.state.step = this.state.interruptedContext.step || this.state.step;
      this.state.activeModal = this.state.interruptedContext.activeModal || null;
      this.state.interruptedContext = null;
    } else {
      this.state.activeModal = null;
    }
  }

  /** Completes run normally at end of Day 3 */
  finishRunComplete() {
    if (this.isTerminal()) return this.state.terminalRoute;
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'run_complete';
    this.state.step = 'receipt';
    this.state.activeModal = null;
    this.log.append('terminal', { route: 'run_complete' }, this.state.clock);
    return 'run_complete';
  }

  /**
   * Appends receipt_shown strictly upon actual visual presentation in the DOM.
   * Completes the terminal / receipt_shown tail pair required by verifyCompleteness().
   * Idempotent on reload: does not append duplicate events if already presented.
   */
  recordReceiptPresented() {
    if (!this.isTerminal()) {
      throw new Error(`Cannot record Receipt presentation in phase "${this.state.phase}" (must be terminal)`);
    }

    if (this.state.phase === 'terminal') {
      this.log.append('receipt_shown', { route: this.state.terminalRoute }, this.state.clock);
      this.state.phase = 'receipt_presented';
      this.state.step = 'receipt';
    }

    return projectReceipt(this.log.entries);
  }

  /** Backward-compatible alias */
  presentReceipt() {
    return this.recordReceiptPresented();
  }

  /** Advances clock day */
  advanceDay(dayNumber, label) {
    if (this.isTerminal()) throw new Error('Cannot advance day: game is in terminal phase');
    this.state.day = dayNumber;
    this.state.clock = { day: dayNumber, label: label ?? `day ${dayNumber} morning` };
  }

  /** Serializes complete game snapshot into storage envelope */
  toEnvelope() {
    return {
      schemaVersion: 1,
      savedAt: Date.now(),
      autosaveEnabled: this.autosaveEnabled,
      state: structuredClone(this.state),
      prngStreams: {
        root: this.rng.serialize(),
        draw: this.rngDraw.serialize(),
        race: this.rngRace.serialize(),
        event: this.rngEvent.serialize(),
      },
      eventLog: this.log.entries,
    };
  }

  /** Hydrates engine state from a validated storage envelope */
  static fromEnvelope(envelope) {
    const rootStreamObj = JSON.parse(envelope.prngStreams.root);
    const engine = new GameEngine(rootStreamObj.key);
    engine.autosaveEnabled = envelope.autosaveEnabled ?? true;
    engine.state = structuredClone(envelope.state);

    engine.rng = restoreRng(envelope.prngStreams.root);
    engine.rngDraw = restoreRng(envelope.prngStreams.draw);
    engine.rngRace = restoreRng(envelope.prngStreams.race);
    engine.rngEvent = restoreRng(envelope.prngStreams.event);

    engine.log = EventLog.hydrate(envelope.eventLog);

    // Reconstruct / validate authoritative progression from event log (Repair 02, P1)
    if (!engine.state.completedRaces) engine.state.completedRaces = [];
    if (!engine.state.raceResults) engine.state.raceResults = {};
    if (!engine.state.billsSettled) engine.state.billsSettled = [];
    if (!Array.isArray(engine.state.seenDexEntries)) {
      engine.state.seenDexEntries = [...(engine.state.owned || [])];
    }

    for (const e of engine.log.entries) {
      if (e.type === 'race_result') {
        const rNum = e.payload.raceNumber;
        if (!engine.state.completedRaces.includes(rNum)) {
          engine.state.completedRaces.push(rNum);
        }
        if (!engine.state.raceResults[rNum]) {
          engine.state.raceResults[rNum] = {
            place: e.payload.place,
            payoutGems: e.payload.payoutGems,
            rivalPlace: e.payload.rivalPlace,
            playerPerf: e.payload.playerPerf,
          };
        }
      }
      if (e.type === 'expense_paid' && e.payload?.billId) {
        if (!engine.state.billsSettled.includes(e.payload.billId)) {
          engine.state.billsSettled.push(e.payload.billId);
        }
      }
    }

    // Step coherence against completed races
    if (engine.state.completedRaces.includes(1) && (engine.state.step === 'desk' || engine.state.step === 'd1_morning_gacha' || engine.state.step === 'd1_midday_race')) {
      engine.state.step = 'd1_midday_race_result';
    }
    if (engine.state.completedRaces.includes(2) && engine.state.step === 'd3_midday_race') {
      engine.state.step = 'd3_midday_race_result';
    }

    // Terminal phase coherence
    if (engine.log.entries.some((e) => e.type === 'terminal')) {
      const isPresented = engine.log.entries.some((e) => e.type === 'receipt_shown');
      engine.state.phase = isPresented ? 'receipt_presented' : 'terminal';
      engine.state.step = 'receipt';
      engine.state.activeModal = null;
    }

    return engine;
  }
}
