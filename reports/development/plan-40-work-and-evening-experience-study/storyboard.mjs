// reports/development/plan-40-work-and-evening-experience-study/storyboard.mjs
// Interactive state controller for Plan 40 Work and Evening Experience Storyboard.
// Standalone pure client ES module; zero runtime server dependency, zero saved storage mutation.

import {
  CATALOG_VERSION,
  WORK_BEATS,
  COMMUTE_BEATS,
  WAGE_PAYSLIP,
  KITCHEN_RETURN_SCENE,
  EVENING_ACTIVITIES,
  EXTRA_SHIFTS_CATALOG,
  rollDailyExtraShifts,
  money,
} from './copy.mjs';
import {
  getApartmentSceneSvg,
  getAmbientBackdropSvg,
  renderPaySlipHtml,
  renderLikertBadge,
  VIGNETTE_ICONS,
  esc,
} from './scenes.mjs';
import { ExperimentTracker } from './experiment-tracker.mjs';

export class StoryboardController {
  constructor(rootEl) {
    this.root = rootEl;
    this.tracker = new ExperimentTracker();

    // Stable daily extra shifts (1-2 options rolled for the evening)
    this.dailyExtraShifts = rollDailyExtraShifts(2, 0.42);

    // Active session state (stateless in-memory prototype)
    this.state = {
      cash: 15.00,
      health: 80,
      moment: 'departure', // departure | commute_in | work_1 | work_2 | commute_home | payslip | kitchen_dinner | evening | call_mom | sit_duck | open_gacha | extra_shifts | night_return | evening_complete
      workBeat1Index: 1, // default #012 (Rating 2)
      workBeat2Index: 9, // default #014 (Rating 4)
      commuteInIndex: 2, // default #0C3 (Rating 3)
      commuteHomeIndex: 8, // default #0C4 (Rating 4)
      preChoiceBeats: [], // array of [hexId, rating] strictly before evening choice
      displayedBeatsSet: new Set(), // tracks beats rendered on screen in current scenario to avoid duplicates
      dinnerChoice: null, // null | 'eat' | 'skip'
      eveningChoice: null, // null | 'call_mom' | 'sit_duck' | 'open_gacha' | 'extra_shift'
      scenarioCommitted: false, // true once an evening anchor is completed
      dialogueStep: 0,
      activeExtraShift: null,
      activeExtraBeat: null,
      isNarrow: false,
      isReducedMotion: false,
      showingDemonstrationData: false, // toggle between observed data and demonstration fixture
      events: [],
    };

    this.bindDom();
    this.render();
  }

  recordDisplayedBeat(beat) {
    if (!beat || !beat.hexId) return;
    if (!this.state.displayedBeatsSet.has(beat.hexId)) {
      this.state.displayedBeatsSet.add(beat.hexId);
      this.state.preChoiceBeats.push([beat.hexId, beat.rating]);
    }
  }

  bindDom() {
    this.dom = {
      viewport: this.root.querySelector('#stage-viewport'),
      sceneLayer: this.root.querySelector('#scene-layer'),
      overlayLayer: this.root.querySelector('#overlay-layer'),
      stageWrapper: this.root.querySelector('#stage-wrapper'),
      hudCash: this.root.querySelector('#hud-cash'),
      hudHp: this.root.querySelector('#hud-hp'),
      hudPhase: this.root.querySelector('#hud-phase'),

      // Reviewer controls
      selectMoment: this.root.querySelector('#reviewer-moment'),
      selectWork1: this.root.querySelector('#reviewer-work-beat1'),
      selectWork2: this.root.querySelector('#reviewer-work-beat2'),
      selectCommuteHome: this.root.querySelector('#reviewer-commute-home'),
      btnRerollShifts: this.root.querySelector('#btn-reroll-shifts'),
      btnToggleDataMode: this.root.querySelector('#btn-toggle-datamode'),
      dataModeLabel: this.root.querySelector('#data-mode-label'),
      btnNarrow: this.root.querySelector('#toggle-narrow'),
      btnMotion: this.root.querySelector('#toggle-motion'),
      btnReset: this.root.querySelector('#btn-reset-scenario'),
      tableCohortStats: this.root.querySelector('#cohort-stats-body'),
    };

    // Populate beat selects
    this.dom.selectWork1.innerHTML = WORK_BEATS.map((b, i) => `
      <option value="${i}">Beat #${b.hexId} · Rating ${b.rating}/5 (${esc(b.dimension)})</option>
    `).join('');

    this.dom.selectWork2.innerHTML = WORK_BEATS.map((b, i) => `
      <option value="${i}">Beat #${b.hexId} · Rating ${b.rating}/5 (${esc(b.dimension)})</option>
    `).join('');

    this.dom.selectCommuteHome.innerHTML = COMMUTE_BEATS.filter(b => b.phase === 'home').map((b) => {
      const globalIdx = COMMUTE_BEATS.indexOf(b);
      return `<option value="${globalIdx}">Beat #${b.hexId} · Rating ${b.rating}/5 (${esc(b.dimension)})</option>`;
    }).join('');

    this.dom.selectWork1.value = this.state.workBeat1Index;
    this.dom.selectWork2.value = this.state.workBeat2Index;
    this.dom.selectCommuteHome.value = this.state.commuteHomeIndex;

    // Reviewer event listeners
    this.dom.selectMoment.addEventListener('change', (e) => {
      this.jumpToMoment(e.target.value);
    });

    this.dom.selectWork1.addEventListener('change', (e) => {
      this.state.workBeat1Index = parseInt(e.target.value, 10);
      this.render();
    });

    this.dom.selectWork2.addEventListener('change', (e) => {
      this.state.workBeat2Index = parseInt(e.target.value, 10);
      this.render();
    });

    this.dom.selectCommuteHome.addEventListener('change', (e) => {
      this.state.commuteHomeIndex = parseInt(e.target.value, 10);
      this.render();
    });

    this.dom.btnRerollShifts.addEventListener('click', () => {
      this.dailyExtraShifts = rollDailyExtraShifts(2, Math.random());
      this.logEvent('Rerolled stable 1–2 daily extra shift options');
      if (this.state.moment === 'extra_shifts') this.render();
    });

    this.dom.btnToggleDataMode.addEventListener('click', () => {
      this.state.showingDemonstrationData = !this.state.showingDemonstrationData;
      this.renderReviewerControls();
    });

    this.dom.btnNarrow.addEventListener('click', () => {
      this.state.isNarrow = !this.state.isNarrow;
      this.dom.stageWrapper.classList.toggle('narrow-view', this.state.isNarrow);
      this.dom.btnNarrow.textContent = this.state.isNarrow ? 'View: Mobile Narrow (Active)' : 'View: Desktop 16:9';
    });

    this.dom.btnMotion.addEventListener('click', () => {
      this.state.isReducedMotion = !this.state.isReducedMotion;
      document.documentElement.classList.toggle('motion-off', this.state.isReducedMotion);
      this.dom.btnMotion.textContent = this.state.isReducedMotion ? 'Motion: Reduced (Active)' : 'Motion: Standard';
    });

    this.dom.btnReset.addEventListener('click', () => {
      this.resetScenario();
    });

    // Keyboard support: Escape returns to evening room
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (['call_mom', 'sit_duck', 'open_gacha', 'extra_shifts'].includes(this.state.moment)) {
          this.jumpToMoment('evening');
        }
      }
    });
  }

  resetScenario() {
    this.state.cash = 15.00;
    this.state.health = 80;
    this.state.moment = 'departure';
    this.state.preChoiceBeats = [];
    this.state.displayedBeatsSet = new Set();
    this.state.dinnerChoice = null;
    this.state.eveningChoice = null;
    this.state.scenarioCommitted = false;
    this.state.dialogueStep = 0;
    this.state.activeExtraShift = null;
    this.state.activeExtraBeat = null;
    this.state.events = [];
    this.dailyExtraShifts = rollDailyExtraShifts(2, 0.42);
    this.render();
  }

  jumpToMoment(moment) {
    this.state.moment = moment;
    this.state.dialogueStep = 0;
    this.render();
  }

  logEvent(msg) {
    this.state.events.unshift({ time: new Date().toLocaleTimeString(), msg });
  }

  render() {
    this.updateHud();
    this.renderReviewerControls();
    this.renderStage();
  }

  updateHud() {
    this.dom.hudCash.textContent = money(this.state.cash);
    this.dom.hudHp.textContent = `${this.state.health} HP`;

    let phaseLabel = 'Morning';
    if (this.state.moment === 'commute_in') phaseLabel = 'Commute In';
    else if (this.state.moment.startsWith('work')) phaseLabel = 'Afternoon Shift';
    else if (this.state.moment.startsWith('commute')) phaseLabel = 'Commute Home';
    else if (this.state.moment === 'payslip') phaseLabel = 'Shift Paid';
    else if (this.state.moment === 'kitchen_dinner') phaseLabel = 'Dinner / Return';
    else if (this.state.moment === 'evening' || ['call_mom', 'sit_duck', 'open_gacha'].includes(this.state.moment)) phaseLabel = 'Evening';
    else if (this.state.moment === 'evening_complete') phaseLabel = 'Evening Done';
    else if (this.state.moment === 'night_return' || this.state.activeExtraShift) phaseLabel = 'Night';

    this.dom.hudPhase.textContent = phaseLabel;
    if (this.dom.selectMoment) {
      this.dom.selectMoment.value = this.state.moment;
    }
  }

  renderReviewerControls() {
    const isDemo = this.state.showingDemonstrationData;
    const stats = isDemo ? this.tracker.getDemonstrationStats() : this.tracker.getObservedStats();
    const observedCount = this.tracker.observedPreviewSessions.length;

    this.dom.dataModeLabel.textContent = isDemo
      ? 'Mode: Demonstration Fixture (Illustrative UI test only; never combined with observations)'
      : `Mode: Observed Preview Sessions (${observedCount} recorded in this session)`;

    this.dom.btnToggleDataMode.textContent = isDemo
      ? `Switch to Observed Sessions (${observedCount})`
      : 'Switch to Demonstration Fixture';

    if (!isDemo && observedCount === 0) {
      this.dom.tableCohortStats.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:var(--text-muted);padding:14px;">
            0 observed preview runs yet. Complete a day flow to record real session choices, or switch to the demonstration fixture.
          </td>
        </tr>
      `;
      return;
    }

    this.dom.tableCohortStats.innerHTML = stats.map((row) => `
      <tr>
        <td><strong>${esc(row.label)}</strong></td>
        <td>${row.total}</td>
        <td>
          <div>${row.pctRestorative}% (${row.restorative})</div>
          <div class="bar-fill" style="width: ${row.pctRestorative}%"></div>
        </td>
        <td>
          <div>${row.pctGacha}% (${row.gacha})</div>
          <div class="bar-fill gacha-fill" style="width: ${row.pctGacha}%"></div>
        </td>
        <td>${row.pctExtra}% (${row.extra})</td>
      </tr>
    `).join('');
  }

  renderStage() {
    const m = this.state.moment;

    // 1. Departure (Morning)
    if (m === 'departure') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'kitchen', light: 'neutral', duck: false, idPrefix: 'dep' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Departure Dialog">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${VIGNETTE_ICONS.warehouse}</div>
              <div class="vignette-titles">
                <h3>Heading Out · Afternoon Shift Anchor</h3>
                <span>Harbor Court · Kitchen & Hallway</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>Your work badge and keys lie on the kitchen counter beside your travel mug.</p>
              <p class="vignette-detail">The bus leaves in ten minutes. You have an afternoon scheduled at Harbor Logistics Distribution.</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-secondary" id="btn-commute-in">Step Out & Commute In</button>
              <button type="button" class="btn btn-primary" id="btn-direct-work">Arrive at Shift Floor</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-commute-in').addEventListener('click', () => {
        this.jumpToMoment('commute_in');
      });
      this.dom.overlayLayer.querySelector('#btn-direct-work').addEventListener('click', () => {
        this.jumpToMoment('work_1');
      });
      return;
    }

    // 2. Commute In (Morning/Afternoon transition)
    if (m === 'commute_in') {
      const beat = COMMUTE_BEATS[this.state.commuteInIndex] || COMMUTE_BEATS[2];
      this.recordDisplayedBeat(beat);

      this.dom.sceneLayer.innerHTML = getAmbientBackdropSvg('commute_transit', beat.rating);
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Commute In Beat">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${beat.rating <= 2 ? VIGNETTE_ICONS.bus_rain : VIGNETTE_ICONS.park_sun}</div>
              <div class="vignette-titles">
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3>${esc(beat.heading)}</h3>
                  ${renderLikertBadge(beat.hexId, beat.rating)}
                </div>
                <span>Transit to Plant · Route 14</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-enter-work">Enter Logistics Plant</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-enter-work').addEventListener('click', () => {
        this.jumpToMoment('work_1');
      });
      return;
    }

    // 3. Work Beat 1
    if (m === 'work_1') {
      const beat = WORK_BEATS[this.state.workBeat1Index] || WORK_BEATS[0];
      this.recordDisplayedBeat(beat);

      const icon = beat.rating >= 4 ? VIGNETTE_ICONS.breakroom_pastry : VIGNETTE_ICONS.warehouse;

      this.dom.sceneLayer.innerHTML = getAmbientBackdropSvg('warehouse', beat.rating);
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Work Beat 1">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3>${esc(beat.heading)}</h3>
                  ${renderLikertBadge(beat.hexId, beat.rating)}
                </div>
                <span>Harbor Logistics · Shift Block (Beat 1/2)</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-work-next">Break → Next Shift Block</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-work-next').addEventListener('click', () => {
        this.jumpToMoment('work_2');
      });
      return;
    }

    // 4. Work Beat 2
    if (m === 'work_2') {
      const beat = WORK_BEATS[this.state.workBeat2Index] || WORK_BEATS[9];
      this.recordDisplayedBeat(beat);

      const icon = beat.rating >= 4 ? VIGNETTE_ICONS.breakroom_pastry : VIGNETTE_ICONS.warehouse;

      this.dom.sceneLayer.innerHTML = getAmbientBackdropSvg('warehouse', beat.rating);
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Work Beat 2">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3>${esc(beat.heading)}</h3>
                  ${renderLikertBadge(beat.hexId, beat.rating)}
                </div>
                <span>Harbor Logistics · Shift Block (Beat 2/2)</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-clock-out">Clock Out & Head Home</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-clock-out').addEventListener('click', () => {
        this.jumpToMoment('commute_home');
      });
      return;
    }

    // 5. Commute Home
    if (m === 'commute_home') {
      const beat = COMMUTE_BEATS[this.state.commuteHomeIndex] || COMMUTE_BEATS[8];
      this.recordDisplayedBeat(beat);

      const icon = beat.rating <= 2 ? VIGNETTE_ICONS.bus_rain : VIGNETTE_ICONS.park_sun;

      this.dom.sceneLayer.innerHTML = getAmbientBackdropSvg('commute_transit', beat.rating);
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Commute Home Beat">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3>${esc(beat.heading)}</h3>
                  ${renderLikertBadge(beat.hexId, beat.rating)}
                </div>
                <span>Late Afternoon Commute Home</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-arrive-home">Arrive at Apartment Door</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-arrive-home').addEventListener('click', () => {
        this.jumpToMoment('payslip');
      });
      return;
    }

    // 6. Wage Payslip Disbursal
    if (m === 'payslip') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'kitchen', light: 'warm', duck: false, idPrefix: 'pay' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
            ${renderPaySlipHtml()}
            <button type="button" class="btn btn-primary" id="btn-collect-pay">Collect Wages (+$60.00) & Step into Kitchen</button>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-collect-pay').addEventListener('click', () => {
        this.state.cash += 60.00;
        this.logEvent('Credited regular shift wage: +$60.00 cash');
        this.jumpToMoment('kitchen_dinner');
      });
      return;
    }

    // 7. Day 1 Kitchen / Dinner Return (Plan 38 coordination)
    // Represents dinner as an explicit choice with disclosed reviewer parameters.
    if (m === 'kitchen_dinner') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'kitchen', light: 'warm', duck: false, idPrefix: 'kit' });

      const hasChosenDinner = Boolean(this.state.dinnerChoice);
      const chosenOpt = hasChosenDinner ? KITCHEN_RETURN_SCENE.options[this.state.dinnerChoice] : null;

      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Day 1 Kitchen Dinner Return">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${VIGNETTE_ICONS.breakroom_pastry}</div>
              <div class="vignette-titles">
                <h3>${esc(KITCHEN_RETURN_SCENE.heading)}</h3>
                <span>Day 1 Return Home · Kitchen Counter</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(KITCHEN_RETURN_SCENE.text)}</p>
              <p class="vignette-detail">${esc(KITCHEN_RETURN_SCENE.detail)}</p>

              ${!hasChosenDinner ? `
                <div style="background:#13151d;padding:12px;border-radius:6px;margin:12px 0;border:1px solid rgba(255,255,255,0.08);">
                  <div style="font-weight:600;color:var(--text-light);margin-bottom:8px;">${esc(KITCHEN_RETURN_SCENE.prompt)}</div>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <button type="button" class="btn btn-primary" id="btn-eat-dinner" style="text-align:left;padding:10px 14px;">
                      <div style="font-weight:bold;">${esc(KITCHEN_RETURN_SCENE.options.eat.label)}</div>
                      <div style="font-size:0.8rem;opacity:0.85;">${esc(KITCHEN_RETURN_SCENE.options.eat.desc)}</div>
                      <div style="font-size:0.75rem;color:#8ab17d;margin-top:2px;">Disclosed: ${esc(KITCHEN_RETURN_SCENE.options.eat.disclosedParams)}</div>
                    </button>
                    <button type="button" class="btn btn-secondary" id="btn-skip-dinner" style="text-align:left;padding:10px 14px;">
                      <div style="font-weight:bold;">${esc(KITCHEN_RETURN_SCENE.options.skip.label)}</div>
                      <div style="font-size:0.8rem;opacity:0.85;">${esc(KITCHEN_RETURN_SCENE.options.skip.desc)}</div>
                      <div style="font-size:0.75rem;color:#f4a261;margin-top:2px;">Disclosed: ${esc(KITCHEN_RETURN_SCENE.options.skip.disclosedParams)}</div>
                    </button>
                  </div>
                </div>
              ` : `
                <div style="background:#13151d;padding:12px;border-radius:6px;margin:12px 0;border:1px solid rgba(255,255,255,0.08);">
                  <p style="margin:0 0 6px 0;color:var(--text-light);">${esc(chosenOpt.resultNarrative)}</p>
                  <div style="font-size:0.78rem;color:var(--text-muted);">
                    Dinner Choice: <strong>${esc(chosenOpt.label)}</strong> · ${esc(chosenOpt.disclosedParams)}
                  </div>
                </div>
              `}
            </div>
            <div class="vignette-actions">
              ${hasChosenDinner ? `
                <button type="button" class="btn btn-primary" id="btn-finish-dinner">${esc(KITCHEN_RETURN_SCENE.actionLabel)}</button>
              ` : `
                <span style="font-size:0.8rem;color:var(--text-muted);">Select a dinner option to proceed to the living room desk.</span>
              `}
            </div>
          </div>
        </div>
      `;

      if (!hasChosenDinner) {
        this.dom.overlayLayer.querySelector('#btn-eat-dinner').addEventListener('click', () => {
          this.state.dinnerChoice = 'eat';
          this.logEvent('Dinner choice: Ate prepared leftovers ($0 maintenance meal)');
          this.render();
        });
        this.dom.overlayLayer.querySelector('#btn-skip-dinner').addEventListener('click', () => {
          this.state.dinnerChoice = 'skip';
          this.logEvent('Dinner choice: Skipped dinner ($0, had cold tap water)');
          this.render();
        });
      } else {
        this.dom.overlayLayer.querySelector('#btn-finish-dinner').addEventListener('click', () => {
          this.jumpToMoment('evening');
        });
      }
      return;
    }

    // 8. Evening Apartment Stage (Desk & Anchors)
    if (m === 'evening') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'eve' });
      this.dom.overlayLayer.innerHTML = `
        <div class="evening-anchors" role="region" aria-label="Evening Choices">
          <!-- Call Mom Anchor -->
          <div class="anchor-zone" style="top: 38%; left: 32%;" tabindex="0" id="anchor-mom" role="button" aria-label="Call Mom">
            <span class="anchor-chip">📞 Call Mom</span>
            <span class="anchor-badge">+5 HP · Restorative</span>
          </div>

          <!-- Sit With Duck Anchor -->
          <div class="anchor-zone" style="top: 52%; left: 56%;" tabindex="0" id="anchor-duck" role="button" aria-label="Sit with Duck">
            <span class="anchor-chip">🦆 Sit with Duck</span>
            <span class="anchor-badge">+2 HP · Proposal</span>
          </div>

          <!-- Quackpot Phone Anchor -->
          <div class="anchor-zone" style="top: 66%; left: 74%;" tabindex="0" id="anchor-gacha" role="button" aria-label="Open Quackpot">
            <span class="anchor-chip">📱 Open Quackpot</span>
            <span class="anchor-badge">Launcher Stand-in</span>
          </div>

          <!-- Extra Shifts Anchor -->
          <div class="anchor-zone" style="top: 82%; left: 40%;" tabindex="0" id="anchor-extra" role="button" aria-label="Review Extra Shifts">
            <span class="anchor-chip">💼 Tonight's Gigs & Shifts (${this.dailyExtraShifts.length})</span>
            <span class="anchor-badge">Candidate Gigs</span>
          </div>
        </div>
      `;

      const bindAnchor = (id, target) => {
        const el = this.dom.overlayLayer.querySelector(id);
        const act = () => this.jumpToMoment(target);
        el.addEventListener('click', act);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      };

      bindAnchor('#anchor-mom', 'call_mom');
      bindAnchor('#anchor-duck', 'sit_duck');
      bindAnchor('#anchor-gacha', 'open_gacha');
      bindAnchor('#anchor-extra', 'extra_shifts');
      return;
    }

    // 9. Call Mom Flow
    if (m === 'call_mom') {
      const act = EVENING_ACTIVITIES.callMom;
      const d = act.dialogue;
      const isFinal = this.state.dialogueStep >= d.length - 1;

      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'mom' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="dialogue-card" role="dialog" aria-label="Phone Call with Mom">
            <div class="dialogue-title-bar">
              <span class="dialogue-title">Call with Mom</span>
              <span class="anchor-badge">+5 HP upon completion</span>
            </div>
            <div class="dialogue-history">
              ${d.slice(0, this.state.dialogueStep + 1).map((line) => `
                <div class="speech-bubble ${line.speaker === 'Mom' ? 'bubble-mom' : 'bubble-you'}">
                  <div class="dialogue-speaker">${esc(line.speaker)}</div>
                  <div>${esc(line.text)}</div>
                </div>
              `).join('')}
            </div>
            <div class="vignette-actions">
              ${isFinal ? `
                <button type="button" class="btn btn-primary" id="btn-finish-call">Say Goodbye & Hang Up (+5 HP)</button>
              ` : `
                <button type="button" class="btn btn-primary" id="btn-next-call">Next (${this.state.dialogueStep + 1}/${d.length})</button>
              `}
              <button type="button" class="btn btn-secondary" id="btn-cancel-call">Put Phone Down</button>
            </div>
          </div>
        </div>
      `;

      if (isFinal) {
        this.dom.overlayLayer.querySelector('#btn-finish-call').addEventListener('click', () => {
          this.state.health = Math.min(100, this.state.health + 5);
          this.logEvent('Called Mom: warm catch-up restored +5 HP');
          this.state.scenarioCommitted = true;
          this.state.eveningChoice = 'call_mom';
          this.tracker.recordSession({
            preChoiceBeats: [...this.state.preChoiceBeats],
            eveningChoice: 'call_mom',
            dinnerChoice: this.state.dinnerChoice,
          });
          this.jumpToMoment('evening_complete');
        });
      } else {
        this.dom.overlayLayer.querySelector('#btn-next-call').addEventListener('click', () => {
          this.state.dialogueStep++;
          this.render();
        });
      }

      this.dom.overlayLayer.querySelector('#btn-cancel-call').addEventListener('click', () => {
        this.jumpToMoment('evening');
      });
      return;
    }

    // 10. Sit with Duck Flow
    if (m === 'sit_duck') {
      const act = EVENING_ACTIVITIES.sitWithDuck;
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'duck' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="dialogue-card" role="dialog" aria-label="Sit with Duck">
            <div class="dialogue-title-bar">
              <span class="dialogue-title">Quiet Desk Moment</span>
              <span class="anchor-badge">+2 HP (Proposal)</span>
            </div>
            <div class="dialogue-history">
              ${act.dialogue.map((line) => `
                <div class="speech-bubble bubble-narrative">
                  <div class="dialogue-speaker">${esc(line.speaker)}</div>
                  <div>${esc(line.text)}</div>
                </div>
              `).join('')}
              <div class="vignette-detail" style="text-align:center;margin-top:8px;">${esc(act.reflection)}</div>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-finish-duck">Breathe & Complete Evening (+2 HP)</button>
              <button type="button" class="btn btn-secondary" id="btn-back-duck">Stand Up</button>
            </div>
          </div>
        </div>
      `;

      this.dom.overlayLayer.querySelector('#btn-finish-duck').addEventListener('click', () => {
        this.state.health = Math.min(100, this.state.health + 2);
        this.logEvent('Sat quietly with duck companion: restored +2 HP (working proposal)');
        this.state.scenarioCommitted = true;
        this.state.eveningChoice = 'sit_duck';
        this.tracker.recordSession({
          preChoiceBeats: [...this.state.preChoiceBeats],
          eveningChoice: 'sit_duck',
          dinnerChoice: this.state.dinnerChoice,
        });
        this.jumpToMoment('evening_complete');
      });

      this.dom.overlayLayer.querySelector('#btn-back-duck').addEventListener('click', () => {
        this.jumpToMoment('evening');
      });
      return;
    }

    // 11. Open Quackpot Flow (Stand-in Launcher Preview)
    if (m === 'open_gacha') {
      const act = EVENING_ACTIVITIES.openGacha;
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'gacha' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="dialogue-card" role="dialog" aria-label="Quackpot Gacha App Launcher Stand-in">
            <div class="dialogue-title-bar">
              <span class="dialogue-title">Quackpot Launcher Stand-in</span>
              <span class="anchor-badge">Launcher Stand-in</span>
            </div>
            <div class="dialogue-history">
              ${act.dialogue.map((line) => `
                <div class="speech-bubble bubble-mom">
                  <div class="dialogue-speaker">${esc(line.speaker)}</div>
                  <div>${esc(line.text)}</div>
                </div>
              `).join('')}
              <div class="vignette-detail" style="text-align:center;margin-top:8px;">${esc(act.reflection)}</div>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-enter-gacha">Commit Anchor: Open Launcher</button>
              <button type="button" class="btn btn-secondary" id="btn-back-gacha">Put Phone Down</button>
            </div>
          </div>
        </div>
      `;

      this.dom.overlayLayer.querySelector('#btn-enter-gacha').addEventListener('click', () => {
        this.logEvent('Committed evening anchor to opening Quackpot launcher (stand-in preview)');
        this.state.scenarioCommitted = true;
        this.state.eveningChoice = 'open_gacha';
        this.tracker.recordSession({
          preChoiceBeats: [...this.state.preChoiceBeats],
          eveningChoice: 'open_gacha',
          dinnerChoice: this.state.dinnerChoice,
        });
        this.jumpToMoment('evening_complete');
      });

      this.dom.overlayLayer.querySelector('#btn-back-gacha').addEventListener('click', () => {
        this.jumpToMoment('evening');
      });
      return;
    }

    // 12. Extra Shifts Board (1–2 daily options rolled)
    if (m === 'extra_shifts') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'living', light: 'warm', duck: true, idPrefix: 'extra' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" style="max-width:620px;" role="dialog" aria-label="Extra Shift Offers">
            <div class="vignette-header">
              <div class="vignette-titles">
                <h3>Tonight's Available Gigs & Shifts</h3>
                <span>1–2 daily options on your phone · Flat cash vs physical strain</span>
              </div>
            </div>
            <div class="extra-shifts-grid">
              ${this.dailyExtraShifts.map((shift) => `
                <div class="shift-card" tabindex="0" role="button" data-shift-id="${esc(shift.id)}" aria-label="${esc(shift.title)}">
                  <div class="shift-header">
                    <span class="shift-title">${esc(shift.title)}</span>
                    <span class="shift-pay">+${money(shift.cashGain)}</span>
                  </div>
                  <div class="shift-meta">
                    <span>${esc(shift.workplace)}</span>
                    <span>${esc(shift.hours)}</span>
                    <span class="shift-cost">−${shift.healthCost} HP (Proposal)</span>
                  </div>
                  <div class="shift-prompt">"${esc(shift.prompt)}"</div>
                </div>
              `).join('')}
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel-extra">Not Tonight (Return to Room)</button>
            </div>
          </div>
        </div>
      `;

      this.dom.overlayLayer.querySelectorAll('.shift-card').forEach((card) => {
        const choose = () => {
          const shiftId = card.getAttribute('data-shift-id');
          const shift = EXTRA_SHIFTS_CATALOG.find((s) => s.id === shiftId);
          this.state.activeExtraShift = shift;

          // Pick one alternative standalone vignette from the shift's 5 rated beats
          const beatIndex = Math.floor(Math.random() * shift.beats.length);
          this.state.activeExtraBeat = shift.beats[beatIndex];

          this.state.cash += shift.cashGain;
          this.state.health = Math.max(1, this.state.health - shift.healthCost);

          this.logEvent(`Committed to extra shift: ${shift.title} (+${money(shift.cashGain)}, −${shift.healthCost} HP)`);
          // Jump to night_return where the post-choice beat is rendered and displayed on screen!
          this.jumpToMoment('night_return');
        };
        card.addEventListener('click', choose);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
      });

      this.dom.overlayLayer.querySelector('#btn-cancel-extra').addEventListener('click', () => {
        this.jumpToMoment('evening');
      });
      return;
    }

    // 13. Night Return after Extra Shift
    if (m === 'night_return') {
      const shift = this.state.activeExtraShift;
      const beat = this.state.activeExtraBeat;

      // Record session now that the post-choice beat is actually rendered/displayed on screen
      if (!this.state.scenarioCommitted) {
        this.state.scenarioCommitted = true;
        this.state.eveningChoice = 'extra_shift';
        this.tracker.recordSession({
          preChoiceBeats: [...this.state.preChoiceBeats],
          eveningChoice: 'extra_shift',
          postChoiceBeats: beat ? [[beat.hexId, beat.rating]] : [],
          dinnerChoice: this.state.dinnerChoice,
        });
        this.renderReviewerControls();
      }

      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'night' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Late Night Return">
            <div class="vignette-header">
              <div class="vignette-titles">
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3>11:45 PM · Returning to a Dark Apartment</h3>
                  ${beat ? renderLikertBadge(beat.hexId, beat.rating) : ''}
                </div>
                <span>${esc(shift ? shift.title : 'Night Shift')} Completed</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat ? beat.text : 'Exhaustion sets into your limbs.')}</p>
              <div style="background:#13151d;padding:12px;border-radius:6px;margin-top:10px;">
                <div style="color:#52b788;font-weight:bold;">Cash on hand: ${money(this.state.cash)} (+${money(shift ? shift.cashGain : 0)} credited)</div>
                <div style="color:#f28482;font-weight:bold;">Health: ${this.state.health} HP (Fatigued · Candidate: −${shift ? shift.healthCost : 0} HP)</div>
                <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">Rent notice on fridge remains untouched. Wages were NOT auto-applied to rent.</div>
              </div>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-sleep">Turn Off Desk Lamp & Sleep</button>
              <button type="button" class="btn btn-secondary" id="btn-new-scenario-night">Start New Scenario</button>
            </div>
          </div>
        </div>
      `;

      const conclude = () => {
        this.logEvent('Turned off lights; night resolved');
        this.resetScenario();
      };
      this.dom.overlayLayer.querySelector('#btn-sleep').addEventListener('click', conclude);
      this.dom.overlayLayer.querySelector('#btn-new-scenario-night').addEventListener('click', conclude);
      return;
    }

    // 14. Evening Choice Completed (Summary)
    if (m === 'evening_complete') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'evedone' });

      let choiceTitle = 'Evening Anchor Resolved';
      let choiceSummary = 'You concluded your evening at the apartment desk.';
      if (this.state.eveningChoice === 'call_mom') {
        choiceTitle = 'Phone Call with Mom Completed';
        choiceSummary = 'Hearing Mom’s voice grounded the evening and restored +5 HP. You feel calmer and ready for sleep.';
      } else if (this.state.eveningChoice === 'sit_duck') {
        choiceTitle = 'Stillness with Duck Completed';
        choiceSummary = 'Taking a quiet breath at the desk restored +2 HP (working proposal). The apartment is quiet.';
      } else if (this.state.eveningChoice === 'open_gacha') {
        choiceTitle = 'Quackpot Launcher Stand-in Completed';
        choiceSummary = 'The evening anchor was committed to opening the Quackpot gacha app. (Stand-in launcher preview: no simulated play claimed).';
      }

      const dinnerSummary = this.state.dinnerChoice === 'eat'
        ? 'Ate prepared dinner ($0)'
        : this.state.dinnerChoice === 'skip'
          ? 'Skipped dinner (cold water only)'
          : 'Dinner unrecorded';

      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Evening Complete">
            <div class="vignette-header">
              <div class="vignette-titles">
                <h3>${esc(choiceTitle)}</h3>
                <span>Day 1 Evening · Anchor Spent</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(choiceSummary)}</p>
              <div style="background:#13151d;padding:12px;border-radius:6px;margin-top:10px;">
                <div style="color:#52b788;font-weight:bold;">Cash on hand: ${money(this.state.cash)}</div>
                <div style="color:#e9c46a;font-weight:bold;">Health: ${this.state.health} HP</div>
                <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">
                  Dinner: ${esc(dinnerSummary)} · Evening commitment completed. One session recorded in experiment tracker.
                </div>
              </div>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-conclude-night">Turn In for the Night & Sleep</button>
              <button type="button" class="btn btn-secondary" id="btn-new-scenario">Start New Scenario</button>
            </div>
          </div>
        </div>
      `;

      const finish = () => {
        this.logEvent('Concluded evening; ready for next scenario');
        this.resetScenario();
      };
      this.dom.overlayLayer.querySelector('#btn-conclude-night').addEventListener('click', finish);
      this.dom.overlayLayer.querySelector('#btn-new-scenario').addEventListener('click', finish);
      return;
    }
  }
}
