// Core Game Engine and State Machine for Quackpot Plan 03 Mechanism Slice.
// Fully implements the ratified Revision 3 contract:
// - 3-day bounded demonstration
// - Non-dominated Two-Stance tactical racing
// - Truthful commit-before-reveal gacha draws
// - Canonical escalation ladder (Steps 1-4) with zero-cash wage continuation
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

/** Pre-draw odds calculation matching sim/model.mjs linear pity model */
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
      cash: GAME_CONSTANTS.START_CASH,
      gems: 0,
      health: GAME_CONSTANTS.START_HEALTH,
      debt: 0,
      down: 0,
      pityCount: 0,
      physicalCompanion: { name: 'Professor Quacks', style: 'classic-yellow', pawned: false },
      owned: [], // array of duck id strings
      pendingReveals: [], // queue of committed unrevealed draws
      lastRacedId: null,
      starterOffered: false,
      starterBought: false,
      retentionOffered: false,
      retentionUsed: false,
      terminalRoute: null,
      activeBill: null, // pending unpaid bill during escalation
      escalationStepIndex: 0,
    };
  }

  /** Starts the game run, logs run_started, and transitions to companion setup */
  start() {
    this.log.append('run_started', { seed: this.seed }, this.state.clock);
  }

  /** Styles and names the physical companion */
  setupCompanion(name = 'Professor Quacks', style = 'classic-yellow') {
    this.state.physicalCompanion = { name, style, pawned: false };
    this.log.append('companion_styled', { name, style }, this.state.clock);
    this.state.phase = 'playing';
  }

  /**
   * Commits the promotional free 10-pull.
   * Uses genuine PRNG rolls with openingAdvancesPity: false.
   * Commits ownership and Down immediately to state, queues draws in pendingReveals.
   */
  commitPromotionalTenPull() {
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
        advancesPity: false, // Promotional free pull does not advance paid pity
      };

      const entry = this.log.append('draw_committed', drawPayload, this.state.clock);
      draws.push({
        ...drawPayload,
        commitSeq: entry.seq,
        revealed: false,
      });
    }

    this.state.pendingReveals = draws;
    return draws;
  }

  /**
   * Reveals a committed draw card.
   * Appends reveal_shown to the event log.
   */
  revealNextDraw() {
    const unrevealedIndex = this.state.pendingReveals.findIndex((d) => !d.revealed);
    if (unrevealedIndex === -1) return null;

    const draw = this.state.pendingReveals[unrevealedIndex];
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

  /** Reveal all remaining unrevealed draws in sequence */
  revealAllPending() {
    const revealed = [];
    while (this.state.pendingReveals.some((d) => !d.revealed)) {
      revealed.push(this.revealNextDraw());
    }
    return revealed;
  }

  /**
   * Executes a pond race.
   * raceNumber: 1 (Tutorial) or 2 (Finale).
   * duckId: owned duck ID entered by player.
   * stance: 'safe' | 'sprint'.
   */
  runRace(raceNumber, duckId, stance = 'safe') {
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
        lane: i === 1 ? 1 : i + 1, // Lane 1 is rival; player in Lane 2; 3,4,5,6 are others
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

    return { place, payoutGems, rivalPlace, playerPerf };
  }

  /** Displays the $0.99 Starter Pack offer */
  displayStarterOffer() {
    this.state.starterOffered = true;
    this.log.append('offer_shown', {
      technique: 'anchoring',
      gems: GAME_CONSTANTS.STARTER_GEMS,
      price: GAME_CONSTANTS.STARTER_PRICE,
      anchorLabel: '400% value',
    }, this.state.clock);
  }

  /** Buys the Starter Pack for $0.99 */
  buyStarterPack() {
    if (this.state.cash < GAME_CONSTANTS.STARTER_PRICE) return false;
    this.state.cash = Math.round((this.state.cash - GAME_CONSTANTS.STARTER_PRICE) * 100) / 100;
    this.state.gems += GAME_CONSTANTS.STARTER_GEMS;
    this.state.starterBought = true;

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
    this.log.append('action', { kind: 'starter_declined' }, this.state.clock);
  }

  /** Displays the Gem Bundle Shop (exercises currency_obfuscation on Receipt) */
  displayGemShop() {
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
    this.state.cash += GAME_CONSTANTS.WAGE_DAILY;
    this.state.cash = Math.round(this.state.cash * 100) / 100;
    this.log.append('income', { kind: 'wage', amount: GAME_CONSTANTS.WAGE_DAILY }, this.state.clock);
  }

  /**
   * Attempts to pay an expense bill (food or rent).
   * Returns:
   * - { paid: true }: paid in cash immediately
   * - { paid: false, needsEscalation: true }: cash insufficient, active bill pending escalation
   */
  billExpense(kind, amount) {
    this.log.append('expense_due', { kind, amount, cashBefore: this.state.cash }, this.state.clock);

    if (this.state.cash >= amount) {
      this.state.cash = Math.round((this.state.cash - amount) * 100) / 100;
      this.log.append('expense_paid', { kind, amount, cashAfter: this.state.cash }, this.state.clock);

      // Check for zero-cash solvency tension if cash hits exactly $0
      if (this.state.cash === 0) {
        this.log.append('escalation_offered', {
          step: 'zero_cash_check',
          billKind: kind,
          cashBefore: 0,
          healthBefore: this.state.health,
        }, this.state.clock);
      }

      return { paid: true, needsEscalation: false };
    }

    // Cash insufficient
    this.state.activeBill = { kind, amount };
    this.state.phase = 'escalation';
    this.state.escalationStepIndex = 1; // Start at step 1/2
    return { paid: false, needsEscalation: true };
  }

  /** Continues to evening wage when cash hits $0 without forced sacrifice */
  continueToWage() {
    this.log.append('action', { kind: 'continue_to_wage' }, this.state.clock);
  }

  /** Returns the current eligible escalation step */
  getCurrentEscalationStep() {
    if (!this.state.activeBill) return null;
    const kind = this.state.activeBill.kind;

    // Steps: 1: skip_lunch (food only), 2: extra_shift, 3: sell_couch, 4: sell_tv, 5: credit_card
    const idx = this.state.escalationStepIndex;
    if (idx === 1) {
      if (kind === 'food' && this.state.health > 20) return 'skip_lunch';
      this.state.escalationStepIndex = 2; // Advance to extra_shift if not food
    }
    if (this.state.escalationStepIndex === 2) {
      if (this.state.health > 20) return 'extra_shift';
      this.state.escalationStepIndex = 3;
    }
    if (this.state.escalationStepIndex === 3) return 'sell_couch';
    if (this.state.escalationStepIndex === 4) return 'sell_tv';
    if (this.state.escalationStepIndex === 5) {
      if (this.state.debt < 50.00) return 'credit_card';
    }
    return null; // Exhausted
  }

  /**
   * Accepts the current escalation step.
   */
  acceptEscalation() {
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
      this.state.phase = 'playing';
      return { resolved: true, route: null };
    }

    if (step === 'extra_shift') {
      this.state.cash += 10.00;
      this.state.health -= 15;
      eff.cashGained = 10.00;
      eff.healthLost = 15;
    } else if (step === 'sell_couch') {
      this.state.cash += 10.00;
      eff.cashGained = 10.00;
    } else if (step === 'sell_tv') {
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
      this.log.append('expense_paid', { kind: bill.kind, amount: bill.amount, cashAfter: this.state.cash }, this.state.clock);
      this.state.activeBill = null;
      this.state.phase = 'playing';
      return { resolved: true, route: null };
    }

    // Still insufficient, advance to next step
    this.state.escalationStepIndex++;
    return { resolved: false, route: null };
  }

  /** Declines current escalation step and advances to the next */
  declineEscalation() {
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
    this.log.append('terminal', { route: 'running_on_empty' }, this.state.clock);
    return { resolved: false, route: 'running_on_empty' };
  }

  /** Opens retention modal on clicking persistent Uninstall button */
  clickUninstall() {
    this.log.append('action', { kind: 'uninstall_chosen' }, this.state.clock);
    this.log.append('retention_modal_shown', {
      technique: 'exit_friction',
      gemsOffered: GAME_CONSTANTS.RETENTION_GEMS,
      stayLabel: 'play out the trap',
    }, this.state.clock);
    this.state.retentionOffered = true;
  }

  /** Chooses 'Leave Anyway' from the retention modal */
  leaveUninstall() {
    this.log.append('action', { kind: 'leave_immediately' }, this.state.clock);
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'uninstall';
    this.log.append('terminal', { route: 'uninstall' }, this.state.clock);
    return 'uninstall';
  }

  /** Chooses 'Play Out The Trap' from retention modal */
  stayUninstall() {
    this.log.append('action', { kind: 'play_out_the_trap' }, this.state.clock);
    if (!this.state.retentionUsed) {
      this.state.gems += GAME_CONSTANTS.RETENTION_GEMS;
      this.state.retentionUsed = true;
      this.log.append('reward', {
        kind: 'retention_gems',
        gems: GAME_CONSTANTS.RETENTION_GEMS,
        gemsAfter: this.state.gems,
      }, this.state.clock);
    }
  }

  /** Completes run normally at end of Day 3 */
  finishRunComplete() {
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'run_complete';
    this.log.append('terminal', { route: 'run_complete' }, this.state.clock);
    return 'run_complete';
  }

  /**
   * Appends receipt_shown strictly upon actual UI presentation in the DOM.
   * Completes the terminal / receipt_shown tail pair required by verifyCompleteness().
   */
  presentReceipt() {
    if (this.state.phase !== 'terminal' && this.state.phase !== 'receipt_presented') {
      throw new Error(`Cannot present Receipt in phase ${this.state.phase}`);
    }

    if (this.state.phase === 'terminal') {
      this.log.append('receipt_shown', { route: this.state.terminalRoute }, this.state.clock);
      this.state.phase = 'receipt_presented';
    }

    return projectReceipt(this.log.entries);
  }

  /** Advances clock day */
  advanceDay(dayNumber, label) {
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
    const engine = new GameEngine(JSON.parse(envelope.prngStreams.root).key);
    engine.autosaveEnabled = envelope.autosaveEnabled ?? true;
    engine.state = structuredClone(envelope.state);

    engine.rng = restoreRng(envelope.prngStreams.root);
    engine.rngDraw = restoreRng(envelope.prngStreams.draw);
    engine.rngRace = restoreRng(envelope.prngStreams.race);
    engine.rngEvent = restoreRng(envelope.prngStreams.event);

    engine.log = EventLog.hydrate(envelope.eventLog);

    return engine;
  }
}
