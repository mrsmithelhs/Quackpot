// src/ui/modals.js
// Modal dialogs: Starter offer, Retention exit friction, Zero-cash solvency prompt, and Escalation ladder.

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

export function renderZeroCashPrompt(container, engine, callbacks = {}) {
  const { onContinue, onExtraShift, onSellCouch } = callbacks;
  const couchSold = engine.state.assetsSold?.includes('couch');

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card modal-zerocash">
        <div class="modal-badge-warning">WALLET NOTICE • $0.00 CASH</div>
        <h2>Rent Paid, But Wallet is Empty!</h2>
        <p class="modal-desc">
          You successfully paid your $15.00 rent bill in full! However, you now have exactly
          <strong>$0.00 cash on hand</strong> until your scheduled evening wage arrives (+$10.00).
        </p>
        <p class="modal-desc-sub">
          The game suggests emergency cash options, but taking no extra action leaves your bills paid
          and your run completely safe.
        </p>

        <div class="zerocash-options">
          <button id="btn-zero-continue" class="btn btn-primary btn-lg">
            ✅ Continue to Evening Wage (Take No Action)
          </button>
          <button id="btn-zero-shift" class="btn btn-secondary btn-md">
            🌙 Work Extra Night Shift (+$10.00 Cash, -15 HP)
          </button>
          <button id="btn-zero-couch" class="btn btn-secondary btn-md" ${couchSold ? 'disabled' : ''}>
            🛋️ ${couchSold ? 'Couch Already Sold' : 'Sell Apartment Couch (+$10.00 Cash)'}
          </button>
        </div>
      </div>
    </div>
  `;

  const btnContinue = container.querySelector('#btn-zero-continue');
  const btnShift = container.querySelector('#btn-zero-shift');
  const btnCouch = container.querySelector('#btn-zero-couch');

  if (btnContinue && onContinue) btnContinue.addEventListener('click', onContinue);
  if (btnShift && onExtraShift) btnShift.addEventListener('click', onExtraShift);
  if (btnCouch && onSellCouch && !couchSold) btnCouch.addEventListener('click', onSellCouch);
}

export function renderEscalationModal(container, engine, callbacks = {}) {
  const { onAccept, onDecline } = callbacks;
  const bill = engine.state.activeBill || { kind: 'rent', amount: 15.00 };
  const currentStep = engine.getCurrentEscalationStep();
  const deficit = (bill.amount - engine.state.cash).toFixed(2);

  let stepTitle = 'Emergency Cash Escalation';
  let stepDesc = '';
  let btnAcceptLabel = 'Accept Option';

  if (currentStep === 'skip_lunch') {
    stepTitle = 'Step 1: Skip Today\'s Food Bill';
    stepDesc = `Waive your $${bill.amount.toFixed(2)} meal expense entirely. Saves cash, but costs 15 HP from hunger.`;
    btnAcceptLabel = 'Skip Food Bill (-15 HP)';
  } else if (currentStep === 'extra_shift') {
    stepTitle = 'Step 2: Work Emergency Extra Shift';
    stepDesc = `Work an exhausting night shift to earn immediate cash. Grants +$10.00 cash, but costs 15 HP in sleep loss.`;
    btnAcceptLabel = 'Work Extra Shift (+$10 Cash, -15 HP)';
  } else if (currentStep === 'sell_couch') {
    stepTitle = 'Step 3A: Sell Apartment Couch';
    stepDesc = `Pawn your living room couch to a neighborhood buyer. Grants +$10.00 cash. Your apartment is visibly emptier.`;
    btnAcceptLabel = 'Sell Couch (+$10 Cash)';
  } else if (currentStep === 'sell_tv') {
    stepTitle = 'Step 3B: Sell Television';
    stepDesc = `Sell your only television. Grants +$15.00 cash.`;
    btnAcceptLabel = 'Sell TV (+$15 Cash)';
  } else if (currentStep === 'credit_card') {
    stepTitle = 'Step 4: High-Interest Credit Card Advance';
    stepDesc = `Draw a cash advance from a high-interest credit card. Grants +$15.00 cash, adds +$15.00 debt.`;
    btnAcceptLabel = 'Draw Credit (+$15 Cash, +$15 Debt)';
  } else {
    stepTitle = 'Escalation Exhausted';
    stepDesc = 'You have no further eligible emergency financial steps.';
    btnAcceptLabel = 'Default';
  }

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card modal-escalation">
        <div class="modal-badge-danger">CRITICAL EXPENSE OVERDUE</div>
        <h2>${stepTitle}</h2>
        <div class="escalation-balance-alert">
          <span>${bill.kind.toUpperCase()} Bill: <strong>$${bill.amount.toFixed(2)}</strong></span>
          <span>Cash on hand: <strong>$${engine.state.cash.toFixed(2)}</strong></span>
          <span class="deficit-tag">Short by: <strong>$${deficit}</strong></span>
        </div>
        <p class="modal-desc">${stepDesc}</p>

        <div class="modal-footer-actions">
          <button id="btn-accept-escalation" class="btn btn-danger btn-lg">
            ${btnAcceptLabel}
          </button>
          <button id="btn-decline-escalation" class="btn btn-outline btn-md">
            Decline / Consider Next Option
          </button>
        </div>
      </div>
    </div>
  `;

  const btnAccept = container.querySelector('#btn-accept-escalation');
  const btnDecline = container.querySelector('#btn-decline-escalation');

  if (btnAccept && onAccept) btnAccept.addEventListener('click', onAccept);
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
