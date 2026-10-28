import {
  windowMm, art, tvUnit, sofa, plant, floorLamp, coffeeTable, mug, magazines, fridge, cabinetRun, stove, pot, hood,
  upperCabs, kettle, toaster, jars, bar, stool, fruit, bed, bedside, bedLamp, clockSmall, toyShelf, teddy, block,
  robot, truck, rings, ball, bunny, sc_
} from '../props/index.mjs';

// --- scene specs: items are far-to-near sorted by z automatically ---
export const ROOM_SPECS = {
  living: {
    label: 'Living room', hy: 250, camH: 638, zw: 4000, wall: '#d5d0c6', floor: '#a59582',
    anchor: { X: -150, z: 900, Y: 430 }, lampAt: { X: 480, z: 3500, Y: 1380, r: 520 }, poolRx: '34%', poolRy: '88%', poolDy: 14,
    cones: [{ X: 480, z: 3500, Y: 1200, dir: 'down', w0: 245, w1: 1000, len: 1200 }, { X: 480, z: 3500, Y: 1540, dir: 'up', w0: 170, w1: 460, len: 560, op: .6 }],
    items: ({ couch, tv }) => [
      { X: -150, z: 4000, Y: 750, mm: windowMm(900, 800) },
      { X: 1350, z: 4000, Y: 850, mm: art('land') },
      { X: -1500, z: 3950, Y: 0, mm: tvUnit(tv === 'removed'), shadow: 1300 },
      ...(couch === 'removed' ? [{ X: 1350, z: 4000, Y: 0, mm: `<rect x="-760" y="-880" width="1520" height="830" fill="#c9c3b8" stroke="none" opacity=".55"/>`, ghost: true }] : [{ X: 1350, z: 3900, Y: 0, mm: sofa(1500), shadow: 1600 }]), ...(tv === 'removed' ? [{ X: -1500, z: 3999, Y: 560, mm: `<rect x="-590" y="-720" width="1180" height="710" fill="#c9c3b8" stroke="none" opacity=".55"/>`, ghost: true }] : []),
      { X: -700, z: 3700, Y: 0, mm: plant(800), shadow: 380 },
      { X: 480, z: 3500, Y: 0, mm: floorLamp(), shadow: 420 },
      { X: -150, z: 700, Y: 0, mm: coffeeTable(1100), shadow: 1200 }
    ],
    onTable: [{ X: -470, z: 900, Y: 430, mm: mug('#b86b4b') }, { X: 260, z: 900, Y: 430, mm: magazines() }],
    surfaces: [{ X: -150, w: 1100, zf: 700, zb: 1100, Y: 430, fill: '#86664d' }],
    rug: [[-1300, 650], [1300, 650], [1700, 2900], [-1700, 2900]], rugFill: '#b8836a', rugTrim: '#9a6a52'
  },
  kitchen: {
    label: 'Kitchen', hy: 250, camH: 1132, zw: 3700, wall: '#d7dccf', floor: '#b8a58c', tiles: true,
    anchor: { X: -100, z: 1000, Y: 900 }, lampAt: { X: -100, z: 1700, Y: 1100, r: 500 }, poolRx: '44%', poolRy: '82%', poolDy: 8,
    cones: [{ X: -100, z: 1700, Y: 1250, dir: 'down', w0: 190, w1: 1250, len: 1250 }],
    items: () => [
      { X: 1700, z: 3700, Y: 1000, mm: windowMm(600, 800, '#8fb0a0') },
      { X: -1500, z: 3500, Y: 0, mm: fridge(), shadow: 760 },
      { X: -700, z: 3500, Y: 1350, mm: upperCabs(800) },
      { X: 800, z: 3500, Y: 1350, mm: upperCabs(1000) },
      { X: -150, z: 3500, Y: 0, mm: hood(), hoodOnly: true },
      { X: 100, z: 3350, Y: 0, mm: cabinetRun(2100), shadow: 2100 },
      { X: -150, z: 3340, Y: 0, mm: stove() },
      { X: -150, z: 3340, Y: 935, mm: pot() },
      { X: 560, z: 3340, Y: 910, mm: kettle() }, { X: 960, z: 3340, Y: 910, mm: toaster() }, { X: 1380, z: 3340, Y: 910, mm: jars() },
      { X: -100, z: 800, Y: 0, mm: bar(1500), shadow: 1600 },
      { X: -1200, z: 1250, Y: 0, mm: stool(), shadow: 420 }, { X: 1000, z: 1250, Y: 0, mm: stool(), shadow: 420 }
    ],
    onTable: [{ X: -440, z: 1000, Y: 900, mm: mug('#4f8fc0') }, { X: 470, z: 1050, Y: 900, mm: fruit() }],
    pendant: { X: -100, z: 1700, Y: 1250 },
    surfaces: [{ X: -100, w: 1560, zf: 800, zb: 1200, Y: 900, fill: '#d6b684' }],
    rug: null
  },
  bedroom: {
    label: 'Bedroom and toy shelf', hy: 250, camH: 933, zw: 3700, wall: '#cfc8d0', floor: '#a8927c',
    anchor: { X: -250, z: 1700, Y: 540 }, lampAt: { X: 1650, z: 3400, Y: 880, r: 480 }, poolRx: '42%', poolRy: '82%', poolDy: 8,
    cones: [{ X: 1650, z: 3400, Y: 815, dir: 'down', w0: 190, w1: 800, len: 815 }, { X: 1650, z: 3400, Y: 955, dir: 'up', w0: 140, w1: 460, len: 520, op: .6 }],
    items: () => [
      { X: 500, z: 3700, Y: 1000, mm: windowMm(800, 800, '#9b8fb0') },
      { X: -600, z: 3700, Y: 1180, mm: art('night', 900, 560) },
      { X: 500, z: 3450, Y: 0, mm: sc_(bed(), .9), shadow: 1950 },
      { X: 1650, z: 3400, Y: 0, mm: bedside(), shadow: 560 },
      { X: 1650, z: 3400, Y: 625, mm: bedLamp() }, { X: 1480, z: 3400, Y: 625, mm: clockSmall() },
      { X: -250, z: 1500, Y: 0, mm: toyShelf(), shadow: 760 }
    ],
    onTable: [
      { X: -440, z: 1700, Y: 780, mm: sc_(teddy(), .72) }, { X: -180, z: 1700, Y: 780, mm: block('#d96c5a', 'A') }, { X: -90, z: 1700, Y: 780, mm: block('#4f8fc0', 'B') }, { X: -135, z: 1700, Y: 870, mm: block('#e9a43d', 'C') },
      { X: -480, z: 1700, Y: 540, mm: sc_(robot(), .72) }, { X: -50, z: 1700, Y: 540, mm: truck() },
      { X: -480, z: 1700, Y: 300, mm: sc_(rings(), .7) }, { X: -270, z: 1700, Y: 300, mm: ball() }, { X: -60, z: 1700, Y: 300, mm: sc_(bunny(), .55) }
    ],
    surfaces: [780, 540, 300].map(Y => ({ X: -250, w: 628, zf: 1500, zb: 1900, Y, fill: '#d7bd90' })),
    rug: [[-1400, 700], [900, 700], [1300, 3000], [-1800, 3000]], rugFill: '#8a9ab0', rugTrim: '#6e7e96'
  }
};
