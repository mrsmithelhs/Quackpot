// reports/development/plan-40-work-and-evening-experience-study/experiment-tracker.mjs
// Compact usage recording and behavioral analysis for Plan 40.
// Records 3-digit hex beat IDs and 1-5 Likert ratings to save space in run-usage export files.

export class ExperimentTracker {
  constructor() {
    this.sessionRuns = [];
    this.syntheticCohorts = this.generateSyntheticCohortData();
  }

  /**
   * Records a complete workday and evening trace in compact usage format.
   * @param {Object} entry
   * @param {Array<[string, number]>} entry.beats Compact tuples: [hexId, likertRating]
   * @param {string} entry.eveningChoice 'call_mom' | 'sit_duck' | 'open_gacha' | 'extra_shift'
   */
  recordSession({ beats = [], eveningChoice, timestamp = Date.now() }) {
    const isRestorative = eveningChoice === 'call_mom' || eveningChoice === 'sit_duck';
    const isGacha = eveningChoice === 'open_gacha';
    const isExtraShift = eveningChoice === 'extra_shift';

    const sumScores = beats.reduce((acc, [, score]) => acc + score, 0);
    const avgScore = beats.length > 0 ? parseFloat((sumScores / beats.length).toFixed(2)) : 3.0;

    let scoreTier = 'neutral';
    if (avgScore <= 2.2) scoreTier = 'depleting';
    else if (avgScore >= 3.6) scoreTier = 'uplifting';

    const run = {
      id: `run-${this.sessionRuns.length + 1}`,
      beats, // Compact: e.g. [["012", 2], ["014", 4], ["0C4", 4]]
      avgScore,
      scoreTier, // 'depleting' (1.0-2.2) | 'neutral' (2.3-3.5) | 'uplifting' (3.6-5.0)
      eveningChoice,
      isRestorative,
      isGacha,
      isExtraShift,
      timestamp,
    };

    this.sessionRuns.push(run);
    return run;
  }

  getCombinedData() {
    return [...this.syntheticCohorts, ...this.sessionRuns];
  }

  /**
   * Statistical aggregation by 3 Likert Tiers:
   * Depleting (avg 1.0 - 2.2)
   * Mixed / Neutral (avg 2.3 - 3.5)
   * Uplifting (avg 3.6 - 5.0)
   */
  getTierStats() {
    const all = this.getCombinedData();
    const buckets = {
      depleting: { label: 'Depleting Day (Avg 1.0 – 2.2)', total: 0, restorative: 0, gacha: 0, extra: 0 },
      neutral: { label: 'Mixed / Routine Day (Avg 2.3 – 3.5)', total: 0, restorative: 0, gacha: 0, extra: 0 },
      uplifting: { label: 'Uplifting Day (Avg 3.6 – 5.0)', total: 0, restorative: 0, gacha: 0, extra: 0 },
    };

    for (const item of all) {
      const b = buckets[item.scoreTier];
      if (!b) continue;
      b.total++;
      if (item.isRestorative) b.restorative++;
      if (item.isGacha) b.gacha++;
      if (item.isExtraShift) b.extra++;
    }

    return Object.entries(buckets).map(([key, data]) => {
      const pctRestorative = data.total > 0 ? Math.round((data.restorative / data.total) * 100) : 0;
      const pctGacha = data.total > 0 ? Math.round((data.gacha / data.total) * 100) : 0;
      const pctExtra = data.total > 0 ? Math.round((data.extra / data.total) * 100) : 0;
      return {
        key,
        label: data.label,
        total: data.total,
        restorative: data.restorative,
        gacha: data.gacha,
        extra: data.extra,
        pctRestorative,
        pctGacha,
        pctExtra,
      };
    });
  }

  /**
   * Compact usage serialization for student run file export:
   * Minified JSON string suitable for offline saving without Bloat.
   */
  exportCompactUsage() {
    return JSON.stringify(this.sessionRuns.map((r) => ({
      b: r.beats, // [["011", 1], ["0C2", 2]]
      s: r.avgScore, // 1.5
      c: r.eveningChoice, // 'open_gacha'
    })));
  }

  generateSyntheticCohortData() {
    const data = [];
    // 40 Depleting runs (Avg 1.0 - 2.2): High compensatory gacha (70%)
    for (let i = 0; i < 40; i++) {
      const r = (i * 17 + 5) % 100;
      let choice = 'open_gacha';
      if (r < 15) choice = 'call_mom';
      else if (r < 25) choice = 'sit_duck';
      else if (r < 30) choice = 'extra_shift';
      data.push({
        beats: [['011', 1], ['0C1', 1]],
        avgScore: 1.0,
        scoreTier: 'depleting',
        eveningChoice: choice,
        isRestorative: choice === 'call_mom' || choice === 'sit_duck',
        isGacha: choice === 'open_gacha',
        isExtraShift: choice === 'extra_shift',
      });
    }

    // 40 Neutral runs (Avg 2.3 - 3.5): Balanced (45% gacha, 45% restorative, 10% extra)
    for (let i = 0; i < 40; i++) {
      const r = (i * 19 + 7) % 100;
      let choice = 'call_mom';
      if (r < 45) choice = 'open_gacha';
      else if (r < 80) choice = 'call_mom';
      else if (r < 90) choice = 'sit_duck';
      else choice = 'extra_shift';
      data.push({
        beats: [['012', 2], ['014', 4], ['0C3', 3]],
        avgScore: 3.0,
        scoreTier: 'neutral',
        eveningChoice: choice,
        isRestorative: choice === 'call_mom' || choice === 'sit_duck',
        isGacha: choice === 'open_gacha',
        isExtraShift: choice === 'extra_shift',
      });
    }

    // 40 Uplifting runs (Avg 3.6 - 5.0): Low gacha (20%), High restorative (75%)
    for (let i = 0; i < 40; i++) {
      const r = (i * 23 + 11) % 100;
      let choice = 'call_mom';
      if (r < 20) choice = 'open_gacha';
      else if (r < 65) choice = 'call_mom';
      else if (r < 95) choice = 'sit_duck';
      else choice = 'extra_shift';
      data.push({
        beats: [['014', 4], ['015', 5], ['0C5', 5]],
        avgScore: 4.67,
        scoreTier: 'uplifting',
        eveningChoice: choice,
        isRestorative: choice === 'call_mom' || choice === 'sit_duck',
        isGacha: choice === 'open_gacha',
        isExtraShift: choice === 'extra_shift',
      });
    }

    return data;
  }
}
