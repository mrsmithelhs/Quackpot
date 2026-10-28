// Extracted verbatim from reports/development/plan-10-metagame-duck-cinematography/preview.html (blob f304ff9f, sceneDefs, lines 160-177) by Plan 24.
// Pure static SVG-string builders: no DOM, no state, no side effects.
// Shared gradients and blur filters used by every desk and room scene (ids are scoped later by core/ids.mjs).
export const sceneDefs = `<defs>
    <linearGradient id="g-bezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#343944"/><stop offset=".54" stop-color="#11151d"/><stop offset="1" stop-color="#292d36"/></linearGradient>
    <radialGradient id="g-screen" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#263b53"/><stop offset=".62" stop-color="#111b2c"/><stop offset="1" stop-color="#0b101a"/></radialGradient>
    <radialGradient id="g-soft"><stop offset="0" stop-color="#1a0f0a" stop-opacity=".55"/><stop offset="1" stop-color="#1a0f0a" stop-opacity="0"/></radialGradient>
    <linearGradient id="g-wood-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e6748"/><stop offset="1" stop-color="#6e4b35"/></linearGradient>
    <linearGradient id="g-wood-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a7352"/><stop offset="1" stop-color="#6a4833"/></linearGradient>
    <linearGradient id="g-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd89a" stop-opacity=".78"/><stop offset=".55" stop-color="#ffc680" stop-opacity=".3"/><stop offset="1" stop-color="#ffb35a" stop-opacity=".06"/></linearGradient>
    <linearGradient id="g-cone-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd89a" stop-opacity=".66"/><stop offset=".5" stop-color="#ffc680" stop-opacity=".28"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></linearGradient>
    <linearGradient id="g-cone-u" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd89a" stop-opacity=".5"/><stop offset=".5" stop-color="#ffc680" stop-opacity=".2"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></linearGradient>
    <filter id="f-blur-mm" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="f-blur-l" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <radialGradient id="g-pool"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".62"/><stop offset=".25" stop-color="#ffc77a" stop-opacity=".38"/><stop offset=".6" stop-color="#ffb35a" stop-opacity=".14"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-glow"><stop offset="0" stop-color="#ffcf80" stop-opacity=".9"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>
    <filter id="f-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="f-blur-s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <radialGradient id="g-coin-gold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f3d985"/><stop offset="1" stop-color="#cfa23e"/></radialGradient>
    <radialGradient id="g-coin-silver" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#eef0f2"/><stop offset="1" stop-color="#b3b8be"/></radialGradient>
  </defs>`;
