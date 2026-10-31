// reports/development/plan-40-work-and-evening-experience-study/experiment-tracker.mjs
// Compact usage recording and pedagogical tracking for Plan 40.
// Strictly separates actual preview observations from synthetic demonstration fixtures.
// Uses pre-choice exposure strictly (does not fold post-choice outcomes into the predictor).

export class ExperimentTracker {
  constructor() {
    // Actual sessions recorded during interactive review in this browser window (starts empty)
    this.observedPreviewSessions = [];

    // Distinct demonstration fixture data (for validating table rendering only; never combined with observations)
    this.demonstrationCohort = this.generateDemonstrationCohort();
  }

  /**
   * Records a complete session trace using PRE-CHOICE exposure only.
   * @param {Object} entry
   * @param {Array<[string, number]>} entry.preChoiceBeats Tuples: [hexId, authorRating] before reaching evening room
   * @param {string} entry.eveningChoice 'call_mom' | 'sit_duck' | 'open_gacha' | 'extra_shift'
   * @param {Array<[string, number]>} [entry.postChoiceBeats] Optional subsequent beats after choice (e.g. extra shift)
   */
  recordSession({ preChoiceBeats = [], eveningChoice, postChoiceBeats = [] }) {
    const isRestorative = eveningChoice === 'call_mom' || eveningChoice === 'sit_duck';
    const isGacha = eveningChoice === 'open_gacha';
    const isExtraShift = eveningChoice === 'extra_shift';

    // Calculate score STRICTLY from pre-choice exposure
    const sumScores = preChoiceBeats.reduce((acc, [, score]) => acc + score, 0);
    const avgPreChoiceScore = preChoiceBeats.length > 0 ? parseFloat((sumScores / preChoiceBeats.length).toFixed(2)) : 3.0;

    let scoreTier = 'neutral';
    if (avgPreChoiceScore <= 2.2) scoreTier = 'depleting';
    else if (avgPreChoiceScore >= 3.6) scoreTier = 'uplifting';

    const session = {
      id: `preview-session-${this.observedPreviewSessions.length + 1}`,
      preChoiceBeats: [...preChoiceBeats],
      avgPreChoiceScore,
      scoreTier,
      eveningChoice,
      postChoiceBeats: [...postChoiceBeats],
      isRestorative,
      isGacha,
      isExtraShift,
    };

    this.observedPreviewSessions.push(session);
    return session;
  }

  /** Compute statistical distribution across 3 author-tone tiers for a given dataset. */
  computeTierStats(dataset) {
    const buckets = {
      depleting: { label: 'Depleting Prior (Avg 1.0 – 2.2)', total: 0, restorative: 0, gacha: 0, extra: 0 },
      neutral: { label: 'Neutral/Routine Prior (Avg 2.3 – 3.5)', total: 0, restorative: 0, gacha: 0, extra: 0 },
      uplifting: { label: 'Uplifting Prior (Avg 3.6 – 5.0)', total: 0, restorative: 0, gacha: 0, extra: 0 },
    };

    for (const item of dataset) {
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

  /** Stats strictly from observed preview clicks (never mixes with demonstration fixtures). */
  getObservedStats() {
    return this.computeTierStats(this.observedPreviewSessions);
  }

  /** Stats strictly from the demonstration fixture (labeled clearly as illustrative). */
  getDemonstrationStats() {
    return this.computeTierStats(this.demonstrationCohort);
  }

  /**
   * Compact usage serialization for student run file export:
   * Minified JSON string suitable for offline saving without free-text timestamps or student IDs.
   */
  exportCompactUsage() {
    return JSON.stringify(this.observedPreviewSessions.map((r) => ({
      pre: r.preChoiceBeats,
      avg: r.avgPreChoiceScore,
      act: r.eveningChoice,
      post: r.postChoiceBeats,
    })));
  }

  /**
   * Synthetic fixture data used solely to verify the chart/table UI works.
   * Labeled strictly as demonstration fixture; not empirical evidence of player psychology.
   */
  generateDemonstrationCohort() {
    const data = [];
    // 30 Depleting pre-choice runs
    for (let i = 0; i < 30; i++) {
      const r = (i * 17 + 5) % 100;
      let choice = 'open_gacha';
      if (r < 15) choice = 'call_mom';
      else if (r < 25) choice = 'sit_duck';
      else if (r < 30) choice = 'extra_shift';
      data.push({
        preChoiceBeats: [['011', 1], ['0C1', 1]],
        avgPreChoiceScore: 1.0,
        scoreTier: 'depleting',
        eveningChoice: choice,
        postChoiceBeats: choice === 'extra_shift' ? [['F01', 1]] : [],
        isRestorative: choice === 'call_mom' || choice === 'sit_duck',
        isGacha: choice === 'open_gacha',
        isExtraShift: choice === 'extra_shift',
      });
    }

    // 30 Neutral pre-choice runs
    for (let i = 0; i < 30; i++) {
      const r = (i * 19 + 7) % 100;
      let choice = 'call_mom';
      if (r < 45) choice = 'open_gacha';
      else if (r < 80) choice = 'call_mom';
      else if (r < 90) choice = 'sit_duck';
      else choice = 'extra_shift';
      data.push({
        preChoiceBeats: [['012', 2], ['014', 4], ['0C3', 3]],
        avgPreChoiceScore: 3.0,
        scoreTier: 'neutral',
        eveningChoice: choice,
        postChoiceBeats: choice === 'extra_shift' ? [['F03', 3]] : [],
        isRestorative: choice === 'call_mom' || choice === 'sit_duck',
        isGacha: choice === 'open_gacha',
        isExtraShift: choice === 'extra_shift',
      });
    }

    // 30 Uplifting pre-choice runs
    for (let i = 0; i < 30; i++) {
      const r = (i * 23 + 11) % 100;
      let choice = 'call_mom';
      if (r < 20) choice = 'open_gacha';
      else if (r < 65) choice = 'call_mom';
      else if (r < 95) choice = 'sit_duck';
      else choice = 'extra_shift';
      data.push({
        preChoiceBeats: [['014', 4], ['015', 5], ['0C5', 5]],
        avgPreChoiceScore: 4.67,
        scoreTier: 'uplifting',
        eveningChoice: choice,
        postChoiceBeats: choice === 'extra_shift' ? [['F05', 5]] : [],
        isRestorative: choice === 'call_mom' || choice === 'sit_duck',
        isGacha: choice === 'open_gacha',
        isExtraShift: choice === 'extra_shift',
      });
    }

    return data;
  }
}
