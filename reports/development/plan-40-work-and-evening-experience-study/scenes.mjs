// reports/development/plan-40-work-and-evening-experience-study/scenes.mjs
// Renders scenes for the Plan 40 storyboard.
// Integrates accepted apartment art from src/assets/apartment/index.mjs read-only,
// and provides evocative atmospheric SVG cards for work and commute vignettes.

import { renderScene } from '../../../src/assets/apartment/index.mjs';
import { money, WAGE_PAYSLIP } from './copy.mjs';

/** Safe HTML string escaping. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[c]);

/** Render an apartment room scene using the accepted art kit. */
export function getApartmentSceneSvg({ area = 'living', light = 'neutral', duck = true, idPrefix = 'p40' }) {
  try {
    const result = renderScene({
      area,
      light,
      duck,
      idPrefix,
      framing: 'wide',
      overlay: 'svg',
    });
    return result.svg;
  } catch (err) {
    console.error('Apartment scene render error:', err);
    return `<div class="scene-fallback">[Apartment scene: ${esc(area)} · ${esc(light)}]</div>`;
  }
}

/** Evocative SVG icons for work & commute beats (Treatment 3). */
export const VIGNETTE_ICONS = {
  warehouse: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <rect x="10" y="35" width="80" height="35" rx="3" fill="#2d2a26" stroke="#d5b88a" stroke-width="2"/>
      <line x1="10" y1="52" x2="90" y2="52" stroke="#d5b88a" stroke-width="1.5" stroke-dasharray="3,3"/>
      <!-- Conveyor Rollers -->
      <circle cx="22" cy="62" r="4" fill="#a48d72"/>
      <circle cx="36" cy="62" r="4" fill="#a48d72"/>
      <circle cx="50" cy="62" r="4" fill="#a48d72"/>
      <circle cx="64" cy="62" r="4" fill="#a48d72"/>
      <circle cx="78" cy="62" r="4" fill="#a48d72"/>
      <!-- Cargo Boxes -->
      <rect x="25" y="20" width="22" height="18" rx="1" fill="#7a5b3a" stroke="#d5b88a" stroke-width="1.5"/>
      <rect x="52" y="16" width="26" height="22" rx="1" fill="#8c6a46" stroke="#d5b88a" stroke-width="1.5"/>
      <!-- Tape lines -->
      <line x1="36" y1="20" x2="36" y2="38" stroke="#d5b88a" stroke-width="1"/>
      <line x1="65" y1="16" x2="65" y2="38" stroke="#d5b88a" stroke-width="1"/>
    </svg>
  `,
  breakroom_pastry: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <!-- Coffee Mug -->
      <rect x="18" y="30" width="26" height="34" rx="3" fill="#c47a46" stroke="#eed8b3" stroke-width="2"/>
      <path d="M 44 38 C 52 38, 52 52, 44 54" fill="none" stroke="#eed8b3" stroke-width="2.5"/>
      <path d="M 24 24 Q 28 18, 25 12" fill="none" stroke="#eed8b3" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M 32 26 Q 36 20, 33 14" fill="none" stroke="#eed8b3" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <!-- Pastry on Plate -->
      <ellipse cx="70" cy="62" rx="22" ry="7" fill="#443c33" stroke="#eed8b3" stroke-width="1.5"/>
      <path d="M 54 58 C 54 48, 86 48, 86 58 Z" fill="#d2964b" stroke="#eed8b3" stroke-width="2"/>
      <line x1="64" y1="52" x2="76" y2="52" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    </svg>
  `,
  bus_rain: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <!-- Rain streaks -->
      <line x1="20" y1="8" x2="14" y2="28" stroke="#7e95a0" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <line x1="50" y1="5" x2="44" y2="30" stroke="#7e95a0" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <line x1="82" y1="10" x2="76" y2="32" stroke="#7e95a0" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <!-- Bus Window Frame -->
      <rect x="15" y="16" width="70" height="48" rx="4" fill="#1b242a" stroke="#7e95a0" stroke-width="2.5"/>
      <line x1="50" y1="16" x2="50" y2="64" stroke="#7e95a0" stroke-width="2"/>
      <!-- Droplets on glass -->
      <circle cx="28" cy="32" r="1.5" fill="#a4c2d1"/>
      <circle cx="34" cy="46" r="1.5" fill="#a4c2d1"/>
      <circle cx="68" cy="28" r="1.5" fill="#a4c2d1"/>
      <circle cx="74" cy="50" r="1.5" fill="#a4c2d1"/>
      <!-- Handrail silhouette -->
      <line x1="18" y1="24" x2="82" y2="24" stroke="#e0be6c" stroke-width="3" opacity="0.8"/>
      <line x1="40" y1="24" x2="40" y2="64" stroke="#e0be6c" stroke-width="2" opacity="0.8"/>
    </svg>
  `,
  park_sun: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <!-- Golden Sun Rays -->
      <circle cx="76" cy="24" r="12" fill="#ffd166" opacity="0.85"/>
      <line x1="76" y1="6" x2="76" y2="2" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/>
      <line x1="90" y1="14" x2="94" y2="10" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/>
      <line x1="60" y1="16" x2="56" y2="12" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/>
      <!-- Maple Leaf & Branch -->
      <path d="M 15 65 Q 35 50, 55 48" fill="none" stroke="#684e32" stroke-width="3" stroke-linecap="round"/>
      <path d="M 32 52 L 36 38 L 44 44 L 54 36 L 50 48 L 58 54 L 46 56 Z" fill="#e76f51" stroke="#f4a261" stroke-width="1.5"/>
      <path d="M 48 46 L 56 32 L 64 36 L 70 28 L 68 40 L 76 44 L 62 48 Z" fill="#f4a261" stroke="#e76f51" stroke-width="1.5"/>
      <!-- Park Bench silhouette -->
      <line x1="18" y1="66" x2="52" y2="66" stroke="#264653" stroke-width="3"/>
      <line x1="22" y1="66" x2="22" y2="76" stroke="#264653" stroke-width="2"/>
      <line x1="48" y1="66" x2="48" y2="76" stroke="#264653" stroke-width="2"/>
    </svg>
  `,
  paycheck_seal: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <!-- Pay envelope / voucher -->
      <rect x="14" y="16" width="72" height="48" rx="2" fill="#faf6ee" stroke="#3b3226" stroke-width="2"/>
      <line x1="14" y1="16" x2="50" y2="42" stroke="#8c785b" stroke-width="1.5"/>
      <line x1="86" y1="16" x2="50" y2="42" stroke="#8c785b" stroke-width="1.5"/>
      <!-- Paid Stamp -->
      <rect x="34" y="28" width="36" height="20" rx="2" fill="none" stroke="#2a9d8f" stroke-width="2.5" transform="rotate(-6 52 38)"/>
      <text x="52" y="42" fill="#2a9d8f" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle" transform="rotate(-6 52 38)">PAID</text>
    </svg>
  `,
};

/** Render the Payslip / Wage Card overlay */
export function renderPaySlipHtml(payslip = WAGE_PAYSLIP) {
  return `
    <div class="payslip-card" role="region" aria-label="Shift Pay Receipt">
      <div class="payslip-header">
        <div class="payslip-seal">${VIGNETTE_ICONS.paycheck_seal}</div>
        <div class="payslip-title-block">
          <div class="payslip-inst">${esc(payslip.employer)}</div>
          <div class="payslip-type">${esc(payslip.shiftDate)} · ${esc(payslip.hours)}</div>
        </div>
      </div>
      <div class="payslip-ledger">
        <div class="ledger-row">
          <span>Gross Earnings (8.0 hrs)</span>
          <span>${esc(payslip.gross)}</span>
        </div>
        <div class="ledger-row deduction">
          <span>Payroll Deductions & Ins.</span>
          <span>${esc(payslip.deductions)}</span>
        </div>
        <div class="ledger-divider"></div>
        <div class="ledger-row total">
          <span>Net Take-Home Cash</span>
          <span class="pay-amount">${esc(payslip.takeHome)}</span>
        </div>
      </div>
      <div class="payslip-footer">
        <div class="payslip-status-tag">Status: SETTLED & CREDITED TO CASH</div>
        <p class="payslip-note">${esc(payslip.summaryNote)}</p>
      </div>
    </div>
  `;
}
