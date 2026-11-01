// reports/development/plan-40-work-and-evening-experience-study/scenes.mjs
// Renders scenes for the Plan 40 storyboard.
// Integrates accepted apartment art from src/assets/apartment/index.mjs read-only,
// and provides atmospheric visual backdrops and SVG cards for work and commute beats.

import { renderScene } from '../../../src/assets/apartment/index.mjs';
import { money, WAGE_PAYSLIP, LIKERT_COLORS, LIKERT_LABELS } from './copy.mjs';

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

/** Render an ambient visual backdrop behind work or commute notifications. */
export function getAmbientBackdropSvg(type = 'warehouse', rating = 3) {
  if (type === 'warehouse') {
    const isGloomy = rating <= 2;
    const bg = isGloomy ? '#141418' : '#1c1b18';
    const metal = isGloomy ? '#33353e' : '#4d463d';
    const accent = isGloomy ? '#596173' : '#a89476';
    return `
      <svg viewBox="0 0 960 540" class="ambient-backdrop-svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="960" height="540" fill="${bg}"/>
        <!-- Industrial warehouse ceiling trusses -->
        <g stroke="${metal}" stroke-width="2" opacity="0.35">
          <line x1="0" y1="60" x2="960" y2="60"/>
          <line x1="0" y1="120" x2="960" y2="120"/>
          <path d="M0 60 L120 120 L240 60 L360 120 L480 60 L600 120 L720 60 L840 120 L960 60" fill="none"/>
        </g>
        <!-- High window / skylight -->
        <rect x="360" y="20" width="240" height="35" rx="2" fill="${accent}" opacity="0.18"/>
        <!-- Structural columns -->
        <rect x="80" y="60" width="30" height="480" fill="${metal}" opacity="0.4"/>
        <rect x="850" y="60" width="30" height="480" fill="${metal}" opacity="0.4"/>
        <!-- Silhouetted pallet racks in distant floor -->
        <rect x="200" y="320" width="560" height="220" fill="#0d0e12" opacity="0.7"/>
        <line x1="200" y1="380" x2="760" y2="380" stroke="${metal}" stroke-width="3" opacity="0.5"/>
        <line x1="200" y1="440" x2="760" y2="440" stroke="${metal}" stroke-width="3" opacity="0.5"/>
      </svg>
    `;
  }

  if (type === 'commute_transit') {
    const isRain = rating <= 2;
    return `
      <svg viewBox="0 0 960 540" class="ambient-backdrop-svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="960" height="540" fill="${isRain ? '#12171c' : '#1e1c18'}"/>
        <!-- Transit window sill & pillar -->
        <rect x="0" y="0" width="120" height="540" fill="#1b2028"/>
        <rect x="840" y="0" width="120" height="540" fill="#1b2028"/>
        <rect x="120" y="440" width="720" height="100" fill="#222833"/>
        <!-- Window frame cutout -->
        <rect x="130" y="30" width="700" height="390" rx="6" fill="${isRain ? '#18242e' : '#2b261e'}" opacity="0.6"/>
        <!-- Rain streaks if rating <= 2 -->
        ${isRain ? `
          <g stroke="#7e9bb0" stroke-width="1.5" stroke-linecap="round" opacity="0.45">
            <line x1="200" y1="50" x2="170" y2="150"/>
            <line x1="320" y1="80" x2="290" y2="200"/>
            <line x1="480" y1="40" x2="450" y2="160"/>
            <line x1="620" y1="70" x2="590" y2="190"/>
            <line x1="750" y1="60" x2="720" y2="170"/>
          </g>
        ` : `
          <!-- Golden sunset glow through trees -->
          <circle cx="500" cy="180" r="140" fill="#f4a261" opacity="0.15"/>
          <path d="M 220 420 Q 350 280, 480 320 T 740 420 Z" fill="#383024" opacity="0.5"/>
        `}
        <!-- Handrail bar running across -->
        <line x1="120" y1="140" x2="840" y2="140" stroke="#d5b88a" stroke-width="8" opacity="0.4"/>
      </svg>
    `;
  }

  return `<div class="ambient-backdrop-svg" style="background:#151821;width:100%;height:100%;"></div>`;
}

/** Render a compact Likert badge with 3-digit hex ID. */
export function renderLikertBadge(hexId, rating) {
  const color = LIKERT_COLORS[rating] || '#a3a9be';
  const label = LIKERT_LABELS[rating] || `${rating}/5`;
  return `
    <span class="likert-badge" style="border-color:${color};color:${color};">
      <code class="hex-id">#${esc(hexId)}</code>
      <span>${esc(label)}</span>
    </span>
  `;
}

/** Evocative SVG icons for narrative cards. */
export const VIGNETTE_ICONS = {
  warehouse: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <rect x="10" y="35" width="80" height="35" rx="3" fill="#2d2a26" stroke="#d5b88a" stroke-width="2"/>
      <line x1="10" y1="52" x2="90" y2="52" stroke="#d5b88a" stroke-width="1.5" stroke-dasharray="3,3"/>
      <circle cx="22" cy="62" r="4" fill="#a48d72"/>
      <circle cx="36" cy="62" r="4" fill="#a48d72"/>
      <circle cx="50" cy="62" r="4" fill="#a48d72"/>
      <circle cx="64" cy="62" r="4" fill="#a48d72"/>
      <circle cx="78" cy="62" r="4" fill="#a48d72"/>
      <rect x="25" y="20" width="22" height="18" rx="1" fill="#7a5b3a" stroke="#d5b88a" stroke-width="1.5"/>
      <rect x="52" y="16" width="26" height="22" rx="1" fill="#8c6a46" stroke="#d5b88a" stroke-width="1.5"/>
    </svg>
  `,
  breakroom_pastry: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <rect x="18" y="30" width="26" height="34" rx="3" fill="#c47a46" stroke="#eed8b3" stroke-width="2"/>
      <path d="M 44 38 C 52 38, 52 52, 44 54" fill="none" stroke="#eed8b3" stroke-width="2.5"/>
      <ellipse cx="70" cy="62" rx="22" ry="7" fill="#443c33" stroke="#eed8b3" stroke-width="1.5"/>
      <path d="M 54 58 C 54 48, 86 48, 86 58 Z" fill="#d2964b" stroke="#eed8b3" stroke-width="2"/>
    </svg>
  `,
  bus_rain: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <rect x="15" y="16" width="70" height="48" rx="4" fill="#1b242a" stroke="#7e95a0" stroke-width="2.5"/>
      <line x1="50" y1="16" x2="50" y2="64" stroke="#7e95a0" stroke-width="2"/>
      <circle cx="28" cy="32" r="1.5" fill="#a4c2d1"/>
      <circle cx="34" cy="46" r="1.5" fill="#a4c2d1"/>
      <line x1="18" y1="24" x2="82" y2="24" stroke="#e0be6c" stroke-width="3" opacity="0.8"/>
    </svg>
  `,
  park_sun: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <circle cx="76" cy="24" r="12" fill="#ffd166" opacity="0.85"/>
      <path d="M 32 52 L 36 38 L 44 44 L 54 36 L 50 48 L 58 54 L 46 56 Z" fill="#e76f51" stroke="#f4a261" stroke-width="1.5"/>
      <line x1="18" y1="66" x2="52" y2="66" stroke="#264653" stroke-width="3"/>
    </svg>
  `,
  paycheck_seal: `
    <svg viewBox="0 0 100 80" class="vignette-icon" aria-hidden="true">
      <rect x="14" y="16" width="72" height="48" rx="2" fill="#faf6ee" stroke="#3b3226" stroke-width="2"/>
      <rect x="34" y="28" width="36" height="20" rx="2" fill="none" stroke="#2a9d8f" stroke-width="2.5" transform="rotate(-6 52 38)"/>
      <text x="52" y="42" fill="#2a9d8f" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle" transform="rotate(-6 52 38)">PAID</text>
    </svg>
  `,
};

/** Render departure dialog overlay with single progression button */
export function renderDepartureCardHtml() {
  return `
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
          <button type="button" class="btn btn-primary" id="btn-start-work-sequence">Head Out to Work</button>
        </div>
      </div>
    </div>
  `;
}

/** Render a single directional commute beat (either commute in to work, or commute home from work) */
export function renderCommuteCardHtml(beat, { phase = 'in', showAuthorBadges = false } = {}) {
  const isMorning = phase === 'in';
  const icon = beat.rating <= 2 ? VIGNETTE_ICONS.bus_rain : VIGNETTE_ICONS.park_sun;
  const stageSubtitle = isMorning
    ? 'Transit to Plant · Route 14 (Stage 1/2)'
    : 'Late Afternoon Commute Home (Stage 2/2)';
  const actionButtonId = isMorning ? 'btn-enter-work' : 'btn-arrive-home';
  const actionButtonLabel = isMorning ? 'Arrive at Shift Floor' : 'Arrive at Apartment Door';

  return `
    <div class="vignette-overlay">
      <div class="vignette-card" role="region" aria-label="${isMorning ? 'Commute In Beat' : 'Commute Home Beat'}">
        <div class="vignette-header">
          <div class="vignette-icon-wrap">${icon}</div>
          <div class="vignette-titles">
            <div style="display:flex;align-items:center;gap:8px;">
              <h3>${esc(beat.heading)}</h3>
              ${showAuthorBadges ? renderLikertBadge(beat.hexId, beat.rating) : ''}
            </div>
            <span>${esc(stageSubtitle)}</span>
          </div>
        </div>
        <div class="vignette-body">
          <p>${esc(beat.text)}</p>
          <p class="vignette-detail">${esc(beat.detail)}</p>
        </div>
        <div class="vignette-actions">
          <button type="button" class="btn btn-primary" id="${actionButtonId}">${esc(actionButtonLabel)}</button>
        </div>
      </div>
    </div>
  `;
}

/** Render combined work shift dialog showing two narrative observations on a single card */
export function renderWorkShiftCardHtml(beat1, beat2, { commuteDirection = 'in', showAuthorBadges = false } = {}) {
  const avgRating = Math.round((beat1.rating + beat2.rating) / 2);
  const icon = avgRating >= 4 ? VIGNETTE_ICONS.breakroom_pastry : VIGNETTE_ICONS.warehouse;
  const actionLabel = commuteDirection === 'in'
    ? 'Clock Out & Collect Wages'
    : 'Clock Out & Head Home';

  return `
    <div class="vignette-overlay">
      <div class="vignette-card" style="max-width:580px;" role="region" aria-label="Work Shift Summary">
        <div class="vignette-header">
          <div class="vignette-icon-wrap">${icon}</div>
          <div class="vignette-titles">
            <div style="display:flex;align-items:center;gap:8px;">
              <h3>Harbor Logistics · Afternoon Shift</h3>
              ${showAuthorBadges ? `
                <span style="display:inline-flex;gap:4px;">
                  ${renderLikertBadge(beat1.hexId, beat1.rating)}
                  ${renderLikertBadge(beat2.hexId, beat2.rating)}
                </span>
              ` : ''}
            </div>
            <span>Shift Floor · Two Observations from Today</span>
          </div>
        </div>
        <div class="vignette-body">
          <div class="work-note-item">
            <p><strong>${esc(beat1.heading)}:</strong> ${esc(beat1.text)}</p>
            <p class="vignette-detail">${esc(beat1.detail)}</p>
          </div>
          <div class="work-note-item" style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
            <p><strong>${esc(beat2.heading)}:</strong> ${esc(beat2.text)}</p>
            <p class="vignette-detail">${esc(beat2.detail)}</p>
          </div>
        </div>
        <div class="vignette-actions">
          <button type="button" class="btn btn-primary" id="btn-clock-out">${esc(actionLabel)}</button>
        </div>
      </div>
    </div>
  `;
}

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
