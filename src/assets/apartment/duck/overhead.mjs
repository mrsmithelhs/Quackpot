// Extracted verbatim from reports/development/plan-10-metagame-duck-cinematography/preview.html (blob f304ff9f, topDuckInner, lines 253-267) by Plan 24.
// Pure static SVG-string builders: no DOM, no state, no side effects.
// Sixth duck representation: the overhead drawing used by the top-down desk (360x270 frame, head circle,
// bill ahead, body oval, wing lobes, tail bump; light from the upper left).
export function topDuckInner() {
    const form = (id, shape, lit, dark, shift, hl, sw) => `<clipPath id="${id}">${shape('')}</clipPath><g>${shape(`fill="${lit}"`)}<g clip-path="url(#${id})">${shape(`fill="${dark}"`)}${shape(`fill="${lit}" transform="translate(${shift[0]} ${shift[1]})"`)}${hl ? shape(`fill="none" stroke="#ffe27c" stroke-width="${hl}" stroke-opacity=".8" transform="translate(6 7)"`) : ''}</g>${shape(`fill="none" stroke="#4b241b" stroke-width="${sw}" stroke-linejoin="round"`)}</g>`;
    const ell = (cx, cy, rx, ry) => a => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
    const groove = y => `<path d="M${y < 135 ? '214 72Q232 74 246 80' : '214 198Q232 196 246 190'}" fill="none" stroke="#9c681e" stroke-width="2.6" stroke-linecap="round"/>`;
    const bill = a => `<path d="M121 112Q98 105 80 111Q69 135 80 159Q98 165 121 158Z" ${a}/>`;
    return `${form('td-body', ell(180, 135, 102, 71), '#f4bc32', '#dfa52f', [-9, -11], 3.5, 5)}
      ${form('td-tail', ell(258, 135, 26, 17), '#eeb52c', '#d29a26', [-4, -5], 0, 4.5)}
      ${form('td-wing-a', ell(197, 77, 52, 15), '#ebb02a', '#cf9421', [-5, -6], 0, 4.5)}${groove(77)}
      ${form('td-wing-b', ell(197, 193, 52, 15), '#dba02a', '#c08720', [-4, -5], 0, 4.5)}${groove(193)}
      ${form('td-bill', bill, '#f36e2c', '#d9541f', [-3, -4], 0, 4.5)}
      <path d="M84 135Q100 137 121 135" fill="none" stroke="#9b401f" stroke-width="3" stroke-linecap="round"/><circle cx="105" cy="123" r="2.3" fill="#9b401f"/><circle cx="105" cy="147" r="2.3" fill="#9b401f"/>
      ${form('td-head', a => `<circle cx="163" cy="135" r="68" ${a}/>`, '#f6c238', '#e2a82f', [-8, -9], 5, 5)}
      <g><ellipse cx="124" cy="102" rx="8" ry="10" fill="#45251f" stroke="#2c1510" stroke-width="2"/><circle cx="121" cy="98" r="2.4" fill="#fff4d8"/>
      <ellipse cx="124" cy="168" rx="8" ry="10" fill="#45251f" stroke="#2c1510" stroke-width="2"/><circle cx="121" cy="164" r="2.4" fill="#fff4d8"/></g>`;
  }
