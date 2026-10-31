// reports/development/plan-40-work-and-evening-experience-study/storyboard.mjs
// Interactive state controller for Plan 40 Work and Evening Experience Storyboard.
// Standalone pure client ES module; zero runtime server dependency, zero saved storage mutation.

import {
  WORK_VIGNETTES,
  COMMUTE_VIGNETTES,
  WAGE_PAYSLIP,
  EVENING_ACTIVITIES,
  EXTRA_SHIFTS,
  money,
} from './copy.mjs';
import {
  getApartmentSceneSvg,
  renderPaySlipHtml,
  VIGNETTE_ICONS,
  esc,
} from './scenes.mjs';
import { ExperimentTracker } from './experiment-tracker.mjs';

export class StoryboardController {
  constructor(rootEl) {
    this.root = rootEl;
    this.tracker = new ExperimentTracker();

    // Synthetic session state (never touches localStorage)
    this.state = {
      cash: 15.00,
      health: 80,
      moment: 'departure', // departure | work_1 | work_2 | commute_1 | commute_2 | payslip | evening | call_mom | sit_duck | open_gacha | extra_shifts | night_return
      workCondition: 'grind', // grind | engaging
      commuteCondition: 'exhausting', // exhausting | pleasant
      dialogueStep: 0,
      activeExtraShift: null,
      isNarrow: false,
      isReducedMotion: false,
      events: [],
    };

    this.bindDom();
    this.render();
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
      selectWork: this.root.querySelector('#reviewer-work-cond'),
      selectCommute: this.root.querySelector('#reviewer-commute-cond'),
      btnNarrow: this.root.querySelector('#toggle-narrow'),
      btnMotion: this.root.querySelector('#toggle-motion'),
      btnReset: this.root.querySelector('#btn-reset-scenario'),
      tableCohortStats: this.root.querySelector('#cohort-stats-body'),
    };

    // Reviewer events
    this.dom.selectMoment.addEventListener('change', (e) => {
      this.jumpToMoment(e.target.value);
    });

    this.dom.selectWork.addEventListener('change', (e) => {
      this.state.workCondition = e.target.value;
      this.render();
    });

    this.dom.selectCommute.addEventListener('change', (e) => {
      this.state.commuteCondition = e.target.value;
      this.render();
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

    // Keyboard support: Space/Enter on focused buttons, Escape closes dialogs
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
    this.state.dialogueStep = 0;
    this.state.activeExtraShift = null;
    this.state.events = [];
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
    if (this.state.moment.startsWith('work')) phaseLabel = 'Day Shift';
    else if (this.state.moment.startsWith('commute')) phaseLabel = 'Late Afternoon';
    else if (this.state.moment === 'payslip') phaseLabel = 'Shift Paid';
    else if (this.state.moment === 'evening' || ['call_mom', 'sit_duck', 'open_gacha'].includes(this.state.moment)) phaseLabel = 'Evening';
    else if (this.state.moment === 'night_return' || this.state.activeExtraShift) phaseLabel = 'Night';

    this.dom.hudPhase.textContent = phaseLabel;
    this.dom.selectMoment.value = this.state.moment;
    this.dom.selectWork.value = this.state.workCondition;
    this.dom.selectCommute.value = this.state.commuteCondition;
  }

  renderReviewerControls() {
    // Render live experiment cohorts table
    const stats = this.tracker.getConditionStats();
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
        <td>${row.pctExtra}% (${row.extraShift})</td>
      </tr>
    `).join('');
  }

  renderStage() {
    const m = this.state.moment;

    // 1. Departure
    if (m === 'departure') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'kitchen', light: 'neutral', duck: false, idPrefix: 'dep' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Departure Dialog">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${VIGNETTE_ICONS.warehouse}</div>
              <div class="vignette-titles">
                <h3>8:00 AM · Morning Departure</h3>
                <span>Harbor Court · Kitchen & Hallway</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>Your work badge and keys lie on the kitchen counter beside your travel mug.</p>
              <p class="vignette-detail">The morning bus leaves in ten minutes. You have eight hours scheduled at the harbor distribution center.</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-start-work">Grab Keys & Leave for Shift</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-start-work').addEventListener('click', () => {
        this.logEvent('Left apartment for day shift');
        this.jumpToMoment('work_1');
      });
      return;
    }

    // 2. Work Beat 1
    if (m === 'work_1') {
      const v = WORK_VIGNETTES[this.state.workCondition];
      const beat = v.beats[0];
      const icon = this.state.workCondition === 'grind' ? VIGNETTE_ICONS.warehouse : VIGNETTE_ICONS.breakroom_pastry;

      this.dom.sceneLayer.innerHTML = `<div class="work-backdrop" style="background:#1b1916;width:100%;height:100%;"></div>`;
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Work Beat 1">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <h3>${esc(beat.heading)}</h3>
                <span>${esc(v.title)} (${esc(v.label)})</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-work-next">Continue Shift</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-work-next').addEventListener('click', () => {
        this.jumpToMoment('work_2');
      });
      return;
    }

    // 3. Work Beat 2
    if (m === 'work_2') {
      const v = WORK_VIGNETTES[this.state.workCondition];
      const beat = v.beats[1];
      const icon = this.state.workCondition === 'grind' ? VIGNETTE_ICONS.warehouse : VIGNETTE_ICONS.breakroom_pastry;

      this.dom.sceneLayer.innerHTML = `<div class="work-backdrop" style="background:#1b1916;width:100%;height:100%;"></div>`;
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Work Beat 2">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <h3>${esc(beat.heading)}</h3>
                <span>${esc(v.title)}</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-clock-out">Clock Out & Head to Bus</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-clock-out').addEventListener('click', () => {
        this.logEvent('Completed 8.0 hr shift at Harbor Logistics');
        this.jumpToMoment('commute_1');
      });
      return;
    }

    // 4. Commute Beat 1
    if (m === 'commute_1') {
      const c = COMMUTE_VIGNETTES[this.state.commuteCondition];
      const beat = c.beats[0];
      const icon = this.state.commuteCondition === 'exhausting' ? VIGNETTE_ICONS.bus_rain : VIGNETTE_ICONS.park_sun;

      this.dom.sceneLayer.innerHTML = `<div class="commute-backdrop" style="background:#151c22;width:100%;height:100%;"></div>`;
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Commute Beat 1">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <h3>${esc(beat.heading)}</h3>
                <span>${esc(c.title)} (${esc(c.label)})</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-commute-next">Walk the Last Stretch</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-commute-next').addEventListener('click', () => {
        this.jumpToMoment('commute_2');
      });
      return;
    }

    // 5. Commute Beat 2
    if (m === 'commute_2') {
      const c = COMMUTE_VIGNETTES[this.state.commuteCondition];
      const beat = c.beats[1];
      const icon = this.state.commuteCondition === 'exhausting' ? VIGNETTE_ICONS.bus_rain : VIGNETTE_ICONS.park_sun;

      this.dom.sceneLayer.innerHTML = `<div class="commute-backdrop" style="background:#151c22;width:100%;height:100%;"></div>`;
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Commute Beat 2">
            <div class="vignette-header">
              <div class="vignette-icon-wrap">${icon}</div>
              <div class="vignette-titles">
                <h3>${esc(beat.heading)}</h3>
                <span>${esc(c.title)}</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(beat.text)}</p>
              <p class="vignette-detail">${esc(beat.detail)}</p>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-arrive-home">Reach Apartment Door</button>
            </div>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-arrive-home').addEventListener('click', () => {
        this.logEvent('Arrived at apartment door');
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
            <button type="button" class="btn btn-primary" id="btn-collect-pay">Collect Wages (+$60.00) & Walk In</button>
          </div>
        </div>
      `;
      this.dom.overlayLayer.querySelector('#btn-collect-pay').addEventListener('click', () => {
        this.state.cash += 60.00;
        this.logEvent('Credited regular shift wage: +$60.00 cash');
        this.jumpToMoment('evening');
      });
      return;
    }

    // 7. Evening Apartment Stage
    if (m === 'evening') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'eve' });
      this.dom.overlayLayer.innerHTML = `
        <div class="evening-anchors" role="region" aria-label="Evening Choices">
          <!-- Call Mom Anchor -->
          <div class="anchor-zone" style="top: 38%; left: 32%;" tabindex="0" id="anchor-mom" role="button" aria-label="Call Mom">
            <span class="anchor-chip">📞 Call Mom</span>
            <span class="anchor-badge">+5 HP · Grounding</span>
          </div>

          <!-- Sit With Duck Anchor -->
          <div class="anchor-zone" style="top: 52%; left: 56%;" tabindex="0" id="anchor-duck" role="button" aria-label="Sit with Duck">
            <span class="anchor-chip">🦆 Sit with Duck</span>
            <span class="anchor-badge">+2 HP · Reflection</span>
          </div>

          <!-- Quackpot Phone Anchor -->
          <div class="anchor-zone" style="top: 66%; left: 74%;" tabindex="0" id="anchor-gacha" role="button" aria-label="Open Quackpot">
            <span class="anchor-chip">📱 Open Quackpot</span>
            <span class="anchor-badge badge-tempt">Daily Reset · Spend Cash</span>
          </div>

          <!-- Extra Shifts Anchor -->
          <div class="anchor-zone" style="top: 82%; left: 40%;" tabindex="0" id="anchor-extra" role="button" aria-label="Review Extra Shifts">
            <span class="anchor-chip">💼 Extra Shift Board</span>
            <span class="anchor-badge">Cover Marisol / Warehouse</span>
          </div>
        </div>
      `;

      // Attach handlers to anchors
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

    // 8. Call Mom Flow
    if (m === 'call_mom') {
      const act = EVENING_ACTIVITIES.callMom;
      const d = act.dialogue;
      const current = d[this.state.dialogueStep];
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
          this.tracker.recordChoice({
            workCondition: this.state.workCondition,
            commuteCondition: this.state.commuteCondition,
            eveningChoice: 'call_mom',
          });
          this.jumpToMoment('evening');
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

    // 9. Sit with Duck Flow
    if (m === 'sit_duck') {
      const act = EVENING_ACTIVITIES.sitWithDuck;
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'duck' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="dialogue-card" role="dialog" aria-label="Sit with Duck">
            <div class="dialogue-title-bar">
              <span class="dialogue-title">Quiet Desk Companionship</span>
              <span class="anchor-badge">+2 HP</span>
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
              <button type="button" class="btn btn-primary" id="btn-finish-duck">Breathe & Return (+2 HP)</button>
              <button type="button" class="btn btn-secondary" id="btn-back-duck">Stand Up</button>
            </div>
          </div>
        </div>
      `;

      this.dom.overlayLayer.querySelector('#btn-finish-duck').addEventListener('click', () => {
        this.state.health = Math.min(100, this.state.health + 2);
        this.logEvent('Sat quietly with duck companion: restored +2 HP');
        this.tracker.recordChoice({
          workCondition: this.state.workCondition,
          commuteCondition: this.state.commuteCondition,
          eveningChoice: 'sit_duck',
        });
        this.jumpToMoment('evening');
      });

      this.dom.overlayLayer.querySelector('#btn-back-duck').addEventListener('click', () => {
        this.jumpToMoment('evening');
      });
      return;
    }

    // 10. Open Quackpot Flow
    if (m === 'open_gacha') {
      const act = EVENING_ACTIVITIES.openGacha;
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'gacha' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="dialogue-card" role="dialog" aria-label="Quackpot Gacha Temptation">
            <div class="dialogue-title-bar">
              <span class="dialogue-title">Quackpot App Launch</span>
              <span class="anchor-badge badge-tempt">Compensatory Indulgence</span>
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
              <button type="button" class="btn btn-primary" id="btn-enter-gacha">Launch Quackpot (Simulated)</button>
              <button type="button" class="btn btn-secondary" id="btn-back-gacha">Put Phone Down</button>
            </div>
          </div>
        </div>
      `;

      this.dom.overlayLayer.querySelector('#btn-enter-gacha').addEventListener('click', () => {
        this.logEvent('Opened Quackpot app (simulated gacha session)');
        this.tracker.recordChoice({
          workCondition: this.state.workCondition,
          commuteCondition: this.state.commuteCondition,
          eveningChoice: 'open_gacha',
        });
        alert('Gacha app launch simulated: in production, this mounts gacha-view with current wallet ($' + this.state.cash.toFixed(2) + ').');
        this.jumpToMoment('evening');
      });

      this.dom.overlayLayer.querySelector('#btn-back-gacha').addEventListener('click', () => {
        this.jumpToMoment('evening');
      });
      return;
    }

    // 11. Extra Shifts Board
    if (m === 'extra_shifts') {
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'living', light: 'warm', duck: true, idPrefix: 'extra' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" style="max-width:620px;" role="dialog" aria-label="Extra Shift Offers">
            <div class="vignette-header">
              <div class="vignette-titles">
                <h3>Evening Extra Shifts Available</h3>
                <span>Earn immediate cash at the cost of evening rest & health</span>
              </div>
            </div>
            <div class="extra-shifts-grid">
              ${EXTRA_SHIFTS.map((shift) => `
                <div class="shift-card" tabindex="0" role="button" data-shift-id="${esc(shift.id)}" aria-label="${esc(shift.title)}">
                  <div class="shift-header">
                    <span class="shift-title">${esc(shift.title)}</span>
                    <span class="shift-pay">+${money(shift.cashGain)}</span>
                  </div>
                  <div class="shift-meta">
                    <span>${esc(shift.workplace)}</span>
                    <span>${esc(shift.hours)}</span>
                    <span class="shift-cost">−${shift.healthCost} HP</span>
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
          const shift = EXTRA_SHIFTS.find((s) => s.id === shiftId);
          this.state.activeExtraShift = shift;
          this.state.cash += shift.cashGain;
          this.state.health = Math.max(1, this.state.health - shift.healthCost);
          this.logEvent(`Worked extra shift: ${shift.title} (+${money(shift.cashGain)}, −${shift.healthCost} HP)`);
          this.tracker.recordChoice({
            workCondition: this.state.workCondition,
            commuteCondition: this.state.commuteCondition,
            eveningChoice: 'extra_shift',
          });
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

    // 12. Night Return after Extra Shift
    if (m === 'night_return') {
      const shift = this.state.activeExtraShift;
      this.dom.sceneLayer.innerHTML = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'night' });
      this.dom.overlayLayer.innerHTML = `
        <div class="vignette-overlay">
          <div class="vignette-card" role="region" aria-label="Late Night Return">
            <div class="vignette-header">
              <div class="vignette-titles">
                <h3>11:45 PM · Returning to a Dark Apartment</h3>
                <span>${esc(shift ? shift.title : 'Night Shift')} Completed</span>
              </div>
            </div>
            <div class="vignette-body">
              <p>${esc(shift ? shift.vignette : 'Exhaustion sets into your limbs.')}</p>
              <p class="vignette-detail">${esc(shift ? shift.payNote : '')}</p>
              <div style="background:#13151d;padding:12px;border-radius:6px;margin-top:10px;">
                <div style="color:#52b788;font-weight:bold;">Cash on hand: ${money(this.state.cash)}</div>
                <div style="color:#f28482;font-weight:bold;">Health: ${this.state.health} HP (Fatigued)</div>
                <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">Rent notice on fridge remains untouched. Wages were NOT auto-applied to rent.</div>
              </div>
            </div>
            <div class="vignette-actions">
              <button type="button" class="btn btn-primary" id="btn-sleep">Turn Off Desk Lamp & Sleep</button>
            </div>
          </div>
        </div>
      `;

      this.dom.overlayLayer.querySelector('#btn-sleep').addEventListener('click', () => {
        this.logEvent('Turned off lights; resolved night to morning');
        alert('Night resolved to Day 2 Morning. In production, this completes the action phase and advances the day progression model.');
        this.resetScenario();
      });
      return;
    }
  }
}
