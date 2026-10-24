// src/ui/race-view.js
// Pond race view featuring opponent scouting, two-stance tactical choice, and lane animation.

import { BANNER_1_ROSTER, GAME_CONSTANTS } from '../core/game-engine.mjs';

export function renderRaceView(container, engine, raceNumber, callbacks = {}) {
  const { onStartRace, onProceed } = callbacks;
  const isTutorial = (raceNumber === 1);
  const baseOppSpeed = isTutorial ? GAME_CONSTANTS.TUTORIAL_FIELD_SPEED : GAME_CONSTANTS.FINALE_FIELD_SPEED;
  const oppMin = (baseOppSpeed * 0.95).toFixed(2);
  const oppMax = (baseOppSpeed * 1.05).toFixed(2);

  // Owned ducks available for entry
  const ownedDucks = engine.state.owned
    .map((id) => BANNER_1_ROSTER.find((d) => d.id === id))
    .filter(Boolean);

  // Default to highest speed duck or first duck
  const defaultDuck = ownedDucks.slice().sort((a, b) => b.speed - a.speed)[0] || BANNER_1_ROSTER[0];

  container.innerHTML = `
    <div class="race-container">
      <div class="race-card">
        <div class="race-header">
          <div class="race-tag">${isTutorial ? 'Tutorial Event' : 'Grand Championship'}</div>
          <h2>${isTutorial ? 'Race 1: Opening Pond Trial' : 'Race 2: Championship Finale'}</h2>
          <p class="race-sub">
            ${isTutorial 
              ? 'Prove your racing chops in the beginner lane. Top prize: 50 💎!' 
              : 'Face the reigning Rival Whale in Lane 1! Top prize: 50 💎, 2nd: 20 💎, 3rd: 10 💎'}
          </p>
        </div>

        <div id="race-setup-panel" class="race-setup-panel">
          <div class="scouting-section">
            <h3>🔭 Opponent Field Scouting</h3>
            <div class="scouting-table-wrapper">
              <table class="scouting-table">
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>Competitor</th>
                    <th>Base Speed</th>
                    <th>Variance Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="${!isTutorial ? 'row-rival' : ''}">
                    <td>Lane 1</td>
                    <td>${isTutorial ? 'AI Novice #1' : '👑 Rival Whale (Golden Mallard)'}</td>
                    <td>${baseOppSpeed.toFixed(1)}</td>
                    <td>${oppMin} – ${oppMax}</td>
                  </tr>
                  <tr class="row-player">
                    <td>Lane 2</td>
                    <td><strong>YOU (Your Selected Duck)</strong></td>
                    <td id="scout-player-speed">${defaultDuck.speed.toFixed(1)}</td>
                    <td id="scout-player-range">Calculating...</td>
                  </tr>
                  <tr>
                    <td>Lanes 3–6</td>
                    <td>AI Field Competitors (4 ducks)</td>
                    <td>${baseOppSpeed.toFixed(1)}</td>
                    <td>${oppMin} – ${oppMax}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <form id="race-entry-form" class="race-entry-form">
            <div class="form-group">
              <label for="race-duck-select">Choose your digital racer:</label>
              <select id="race-duck-select" class="form-select">
                ${ownedDucks.map((d) => `
                  <option value="${d.id}" ${d.id === defaultDuck.id ? 'selected' : ''}>
                    ${d.name} (${d.tier.toUpperCase()}, Speed: ${d.speed.toFixed(1)})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="stance-group">
              <label class="stance-label-header">Select Tactical Stance:</label>
              <div class="stance-options">
                <label class="stance-card stance-safe selected" id="label-stance-safe">
                  <input type="radio" name="race-stance" value="safe" checked />
                  <div class="stance-content">
                    <div class="stance-title">🛡️ Safe Pace</div>
                    <div class="stance-desc">Base speed, strict ±5% noise. Dependable and consistent.</div>
                    <div class="stance-stat" id="stat-safe">Target: 10.0 (Range: 9.50 – 10.50)</div>
                  </div>
                </label>

                <label class="stance-card stance-sprint" id="label-stance-sprint">
                  <input type="radio" name="race-stance" value="sprint" />
                  <div class="stance-content">
                    <div class="stance-title">⚡ Sprint Push</div>
                    <div class="stance-desc">+10% peak boost, wide ±20% noise. Aggressive with higher variance.</div>
                    <div class="stance-stat" id="stat-sprint">Target: 11.0 (Range: 8.80 – 13.20)</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="race-actions">
              <button type="submit" id="btn-start-race" class="btn btn-gold btn-lg">
                🏁 Start Race!
              </button>
            </div>
          </form>
        </div>

        <div id="race-animation-panel" class="race-animation-panel" style="display: none;">
          <div class="track-header">
            <h3>Pond Racing Track</h3>
            <div class="track-indicator">RACE IN PROGRESS...</div>
          </div>
          <div class="race-lanes">
            ${[1, 2, 3, 4, 5, 6].map((lane) => `
              <div class="race-lane" id="lane-${lane}">
                <div class="lane-num">Lane ${lane} ${lane === 2 ? '(YOU)' : (lane === 1 && !isTutorial ? '(Rival)' : '')}</div>
                <div class="lane-track">
                  <div class="lane-runner" id="runner-${lane}">🦆</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="race-results-panel" class="race-results-panel" style="display: none;">
          <div class="result-banner">
            <h3 id="result-headline">Race Concluded!</h3>
            <div id="result-place-badge" class="result-place-badge">1st Place</div>
            <p id="result-desc" class="result-desc"></p>
            <div id="result-prize-pill" class="result-prize-pill">+50 Gems 💎</div>
          </div>
          <button id="btn-race-continue" class="btn btn-primary btn-lg">
            Proceed ➔
          </button>
        </div>
      </div>
    </div>
  `;

  const duckSelect = container.querySelector('#race-duck-select');
  const safeRadio = container.querySelector('input[value="safe"]');
  const sprintRadio = container.querySelector('input[value="sprint"]');
  const labelSafe = container.querySelector('#label-stance-safe');
  const labelSprint = container.querySelector('#label-stance-sprint');
  const scoutPlayerSpeed = container.querySelector('#scout-player-speed');
  const scoutPlayerRange = container.querySelector('#scout-player-range');
  const statSafe = container.querySelector('#stat-safe');
  const statSprint = container.querySelector('#stat-sprint');

  function updateScoutAndStanceStats() {
    const duckId = duckSelect?.value || defaultDuck.id;
    const duckDef = BANNER_1_ROSTER.find((d) => d.id === duckId) || defaultDuck;
    const S = duckDef.speed;

    if (scoutPlayerSpeed) scoutPlayerSpeed.textContent = S.toFixed(1);

    const safeMin = (S * 0.95).toFixed(2);
    const safeMax = (S * 1.05).toFixed(2);
    const sprintMin = (S * 1.10 * 0.80).toFixed(2);
    const sprintMax = (S * 1.10 * 1.20).toFixed(2);

    if (statSafe) statSafe.textContent = `Target: ${S.toFixed(1)} (Range: ${safeMin} – ${safeMax})`;
    if (statSprint) statSprint.textContent = `Target: ${(S * 1.10).toFixed(1)} (Range: ${sprintMin} – ${sprintMax})`;

    const isSafe = safeRadio?.checked;
    if (scoutPlayerRange) {
      scoutPlayerRange.textContent = isSafe ? `${safeMin} – ${safeMax} (Safe)` : `${sprintMin} – ${sprintMax} (Sprint)`;
    }
  }

  if (duckSelect) {
    duckSelect.addEventListener('change', updateScoutAndStanceStats);
  }

  const stanceInputs = container.querySelectorAll('input[name="race-stance"]');
  stanceInputs.forEach((input) => {
    input.addEventListener('change', () => {
      labelSafe?.classList.toggle('selected', safeRadio.checked);
      labelSprint?.classList.toggle('selected', sprintRadio.checked);
      updateScoutAndStanceStats();
    });
  });

  updateScoutAndStanceStats();

  const entryForm = container.querySelector('#race-entry-form');
  const setupPanel = container.querySelector('#race-setup-panel');
  const animPanel = container.querySelector('#race-animation-panel');
  const resultsPanel = container.querySelector('#race-results-panel');
  const btnContinue = container.querySelector('#btn-race-continue');

  if (entryForm) {
    entryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const duckId = duckSelect?.value || defaultDuck.id;
      const stance = safeRadio?.checked ? 'safe' : 'sprint';

      if (setupPanel) setupPanel.style.display = 'none';
      if (animPanel) animPanel.style.display = 'block';

      // Execute race logic in engine
      const raceOutcome = onStartRace({ duckId, stance, raceNumber });

      const isInstant = Boolean(globalThis.__E2E_INSTANT_RACE__);
      const animDuration = isInstant ? 50 : 1200;

      // Animate lane runners
      const runners = container.querySelectorAll('.lane-runner');
      runners.forEach((r, idx) => {
        const laneNum = idx + 1;
        // Visual progress based roughly on lane result
        const targetPercent = laneNum === 2 
          ? (raceOutcome.place === 1 ? 95 : (raceOutcome.place === 2 ? 88 : 80))
          : Math.min(93, 75 + ((laneNum * 37) % 18));
        
        r.style.transition = `left ${animDuration}ms cubic-bezier(0.2, 0.8, 0.4, 1)`;
        setTimeout(() => {
          r.style.left = `${targetPercent}%`;
        }, 50);
      });

      setTimeout(() => {
        if (animPanel) animPanel.style.display = 'none';
        if (resultsPanel) resultsPanel.style.display = 'block';

        const placeBadge = container.querySelector('#result-place-badge');
        const desc = container.querySelector('#result-desc');
        const prize = container.querySelector('#result-prize-pill');

        if (placeBadge) {
          const suffix = ['th', 'st', 'nd', 'rd'][raceOutcome.place] || 'th';
          placeBadge.textContent = `${raceOutcome.place}${suffix} Place`;
          placeBadge.className = `result-place-badge place-${raceOutcome.place}`;
        }

        if (desc) {
          if (raceOutcome.place === 1) {
            desc.textContent = isTutorial
              ? 'Tremendous start! Your duck dominated the pond with a decisive victory!'
              : 'CHAMPION OF THE POND! You defeated the Rival Whale in a stunning upset!';
          } else if (raceOutcome.place === 2) {
            desc.textContent = 'A close second place! A valiant effort against tough competition.';
          } else {
            desc.textContent = `Finished ${raceOutcome.place}th. The competition on the pond was stiff today.`;
          }
        }

        if (prize) {
          prize.textContent = raceOutcome.payoutGems > 0 
            ? `+${raceOutcome.payoutGems} Gems 💎` 
            : '0 Gems (Top 3 only)';
        }
      }, animDuration + 300);
    });
  }

  if (btnContinue && onProceed) {
    btnContinue.addEventListener('click', onProceed);
  }
}
