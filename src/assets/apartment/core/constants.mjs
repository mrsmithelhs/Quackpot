// Extracted verbatim from reports/development/plan-10-metagame-duck-cinematography/preview.html (blob f304ff9f, constants) by Plan 24.
// Pure static SVG-string builders: no DOM, no state, no side effects.
// Camera, scale and framing constants shared by every scene. Single source of truth; do not duplicate.
export const SCENE_BOX = { w: 960, h: 540 };   // room/desk scene viewBox (wide framing)
export const DUCK_FRAME = { w: 360, h: 270, contentBottom: 250 };   // every duck view is drawn in this frame
export const PX_MM = 2.2;
export const PHONE_MM = { w: 72, h: 136 };                    // 9:17 outer box (.desk-phone, src/ui/desk-phone.css)
export const DUCK_SCALE = 0.62;                               // duck view units -> scene units (~64 mm tall duck)
export const DUCK_CX = { front: 180, side: 176, rear: 180 };  // horizontal centre of each view's content
export const F = 950, CX = 480, DUCK_UNITS_PER_MM = 3.34;   // duck views: ~214 units for a ~64 mm duck
