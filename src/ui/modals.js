// src/ui/modals.js
// Modal dialogs: Starter offer, Retention exit friction and corrupt-save recovery. Bills and offers live in the apartment (src/ui/life/, Plan 38).

export function renderStarterOffer(container, engine, callbacks = {}) {
  const { onBuy, onDecline } = callbacks;
  const canAfford = engine.state.cash >= 0.99;

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card modal-starter">
        <div class="modal-badge-anchor">SPECIAL NEWCOMER EXCLUSIVE • 400% VALUE!</div>
        <h2>Starter Commander Bundle</h2>
        <p class="modal-desc">
          Boost your team immediately! Get <strong>240 Gems</strong> for just <strong>$0.99</strong>!
          Normally 60 gems per $0.99 — this one-time offer anchors maximum early value.
        </p>

        <div class="shop-compare-box">
          <div class="shop-compare-title">Standard Gem Shop Bundles (for comparison):</div>
          <div class="shop-bundle-row"><span>60 Gems</span><span>$0.99 ($0.0165/gem)</span></div>
          <div class="shop-bundle-row"><span>330 Gems</span><span>$4.99 ($0.0151/gem)</span></div>
          <div class="shop-bundle-row"><span>1,090 Gems</span><span>$14.99 ($0.0137/gem)</span></div>
          <div class="shop-note">Single Pull Cost: 160 Gems (odd bundle sizes leave stranded currency).</div>
        </div>

        <div class="modal-footer-actions">
          <button id="btn-buy-starter" class="btn btn-gold btn-lg" ${!canAfford ? 'disabled' : ''}>
            ${canAfford ? '💳 Buy Starter Pack ($0.99)' : 'Insufficient Cash ($0.99 needed)'}
          </button>
          <button id="btn-decline-starter" class="btn btn-outline btn-md">
            No Thanks, Keep My Cash
          </button>
        </div>
      </div>
    </div>
  `;

  const btnBuy = container.querySelector('#btn-buy-starter');
  const btnDecline = container.querySelector('#btn-decline-starter');

  if (btnBuy && onBuy) btnBuy.addEventListener('click', onBuy);
  if (btnDecline && onDecline) btnDecline.addEventListener('click', onDecline);
}

export function renderRetentionModal(container, engine, callbacks = {}) {
  const { onStay, onLeave } = callbacks;
  const isUsed = Boolean(engine.state.retentionUsed);

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card modal-retention">
        <div class="modal-badge-retention">${isUsed ? 'UNINSTALL CONFIRMATION' : 'WAIT! DON\'T UNINSTALL!'}</div>
        <h2>${isUsed ? 'Are You Sure You Want to Leave?' : 'A Special Gift Just For You!'}</h2>
        
        ${!isUsed ? `
          <p class="modal-desc">
            Are you sure you want to leave? If you stay right now, we will immediately credit your account with:
          </p>
          <div class="retention-reward-banner">
            🎁 80 FREE GEMS! 💎
          </div>
          <p class="modal-sub">
            <em>"Play out the trap!"</em> The gacha pond misses you already.
          </p>
        ` : `
          <p class="modal-desc">
            You have already claimed the <strong>80 promotional retention gems</strong> earlier.
            No additional bonus will be granted if you remain.
          </p>
          <p class="modal-sub">
            Do you wish to stay in your current session or proceed to uninstall?
          </p>
        `}

        <div class="retention-actions">
          <button id="btn-retention-stay" class="btn btn-gold btn-lg">
            ${!isUsed ? '💎 Take 80 Gems & Stay' : 'Stay in Game (No Bonus)'}
          </button>
          <button id="btn-retention-leave" class="btn btn-outline-danger btn-md">
            Leave Anyway (Uninstall)
          </button>
        </div>
      </div>
    </div>
  `;

  const btnStay = container.querySelector('#btn-retention-stay');
  const btnLeave = container.querySelector('#btn-retention-leave');

  if (btnStay && onStay) btnStay.addEventListener('click', onStay);
  if (btnLeave && onLeave) btnLeave.addEventListener('click', onLeave);
}

export function renderCorruptSaveModal(container, errors = [], callbacks = {}) {
  const { onFresh, onKeepBackup } = callbacks;

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card modal-corrupt">
        <div class="modal-badge-danger">CORRUPT SAVE DATA DETECTED</div>
        <h2>Save File Integrity Notice</h2>
        <p class="modal-desc">
          Saved game data in browser storage is incompatible, stale, or failed semantic integrity checks.
        </p>
        <ul class="corrupt-error-list">
          ${errors.map((e) => `<li>${e}</li>`).join('')}
        </ul>
        <div class="modal-footer-actions">
          <button id="btn-corrupt-fresh" class="btn btn-primary btn-lg">
            Start Fresh Run (Clear Invalid Save)
          </button>
          <button id="btn-corrupt-backup" class="btn btn-outline btn-md">
            Keep Corrupt Save as Backup
          </button>
        </div>
      </div>
    </div>
  `;

  const btnFresh = container.querySelector('#btn-corrupt-fresh');
  const btnBackup = container.querySelector('#btn-corrupt-backup');

  if (btnFresh && onFresh) btnFresh.addEventListener('click', onFresh);
  if (btnBackup && onKeepBackup) btnBackup.addEventListener('click', onKeepBackup);
}
