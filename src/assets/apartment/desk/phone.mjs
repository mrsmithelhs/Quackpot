// Desk phone face (Plan 24 extraction). Pure SVG-string builder: no DOM, no state.
import { escapeXml } from '../core/svg.mjs';

export const DEFAULT_PHONE_TEXT = { status: '9:41', brand: 'QUACKPOT', heading: ['Welcome', 'Festival'], body: ['10 FREE pulls', 'waiting!'], note: 'Limited-time invitation' };

  // The game's desk phone drawn face-on at (0,0), width w, height h (9:17), same regions as desk-phone.css.
  export function phoneFace(w, h, text = DEFAULT_PHONE_TEXT) {
    const pad = w * .055, r = w * .13, f = w / 158;
    const sx = pad + 9 * f, line = (y, size, weight, fill, text, extra = '') => text ? `<text x="${sx}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${escapeXml(text)}</text>` : '';
    return `<rect width="${w}" height="${h}" rx="${r}" fill="url(#g-bezel)" stroke="#707784" stroke-width="2"/>
      <rect x="${pad}" y="${pad}" width="${w - 2 * pad}" height="${h - 2 * pad}" rx="${r * .73}" fill="url(#g-screen)"/>
      ${line(pad + 18 * f, 8 * f, 700, '#dbe5f0', text.status)}
      <g fill="#dbe5f0"><circle cx="${w - pad - 38 * f}" cy="${pad + 14.5 * f}" r="2.4"/><circle cx="${w - pad - 28 * f}" cy="${pad + 14.5 * f}" r="2.4"/><circle cx="${w - pad - 18 * f}" cy="${pad + 14.5 * f}" r="2.4"/></g>
      ${line(h * .43, 8.4 * f, 900, '#fbbf24', text.brand, `letter-spacing="${1.3 * f}"`)}
      ${line(h * .43 + 21 * f, 17 * f, 800, '#f8fafc', text.heading[0])}
      ${line(h * .43 + 40 * f, 17 * f, 800, '#f8fafc', text.heading[1])}
      ${line(h * .43 + 62 * f, 11.2 * f, 700, '#f8fafc', text.body[0])}
      ${line(h * .43 + 77 * f, 11.2 * f, 700, '#f8fafc', text.body[1])}
      ${line(h * .43 + 94 * f, 7.6 * f, 400, '#cbd5e1', text.note)}
      <rect x="${(w - 35 * f) / 2}" y="${h - pad - 11 * f}" width="${35 * f}" height="${3.2 * f}" rx="2" fill="#fff" fill-opacity=".8"/>`;
  }
