// Player strategies for the headless model. Strategies are policies, not recommendations:
// they exist to bracket behavior (never spends cash, tops up when short, chases pity, etc.).

const SPEC = {
  frugal_single: { pull: 'single', bundles: 'none', race: 'best' },
  saver_ten: { pull: 'ten', bundles: 'none', race: 'best' },
  topup_single: { pull: 'single', bundles: 'topup', race: 'best', cashBuffer: 150 },
  pity_chaser: { pull: 'single', bundles: 'chase', race: 'best', cashBuffer: 0 },
  whale_ten: { pull: 'ten', bundles: 'whale', race: 'best', cashBuffer: 100 },
  unbuffered_spender: { pull: 'ten', bundles: 'whale', race: 'best', cashBuffer: 0 },
  early_uninstaller: { pull: 'single', bundles: 'none', race: 'best', uninstallDay: 2, uninstallAction: 'leave' },
};

export const RACE_POLICIES = ['best', 'rested', 'longshot', 'random', 'alternate'];

export function makeStrategy(nameOrCfg, overrides = {}) {
  const base = typeof nameOrCfg === 'string' ? { name: nameOrCfg, ...SPEC[nameOrCfg] } : { ...nameOrCfg };
  const cfg = { cashBuffer: 0, pawn: 'decline', ...base, ...overrides };
  if (overrides.race) cfg.name = `${base.name ?? 'custom'}+${overrides.race}`;

  function chooseBundle(run) {
    const p = run.p;
    const need = cfg.pull === 'ten' ? p.pullTen : p.pullSingle;
    const budget = run.cash - cfg.cashBuffer;
    if (cfg.bundles === 'none') return null;
    if (cfg.bundles === 'chase' && run.pity + 1 < p.softPityStart) return null;
    const starter = !run.starterUsed && run.starterShown && run.starterPrice() <= budget ? 'starter' : null;
    if (starter && run.gems + p.starter.gems >= need) return 'starter';
    const options = p.bundleGems.map((g, i) => ({ i, g, price: run.bundlePrice(i) })).filter((b) => b.price <= budget);
    if (cfg.bundles === 'whale') {
      if (run.gems >= need) return null;
      return options.length ? options[options.length - 1].i : null;
    }
    const enough = options.filter((b) => run.gems + b.g >= need);
    if (enough.length) return enough[0].i;
    return starter ?? null;
  }

  return {
    name: cfg.name,
    cfg,
    act(run) {
      if (cfg.uninstallDay && run.day >= cfg.uninstallDay) {
        run.uninstall(cfg.uninstallAction ?? 'leave');
        if (run.terminal) return;
      }
      for (let guard = 0; guard < 25 && !run.terminal; guard++) {
        const p = run.p;
        if (cfg.pull === 'ten' && run.gems >= p.pullTen) { run.pull(10); continue; }
        if (cfg.pull === 'single' && run.gems >= p.pullSingle) { run.pull(1); continue; }
        const b = chooseBundle(run);
        if (b === null) break;
        if (!(b === 'starter' ? run.buyStarter() : run.buyBundle(b))) break;
      }
    },
    raceChoice(run, i) {
      switch (cfg.race ?? 'best') {
        case 'random': return ['best', 'rested', 'longshot'][run.rngStrategy.int(3)];
        case 'alternate': return i % 2 === 0 ? 'best' : 'rested';
        default: return cfg.race ?? 'best';
      }
    },
    pawn(run) {
      if (cfg.pawn === 'accept_if_short') return run.cash < 100 ? 'accept' : 'decline';
      return cfg.pawn;
    },
  };
}
