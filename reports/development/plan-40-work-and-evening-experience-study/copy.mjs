// reports/development/plan-40-work-and-evening-experience-study/copy.mjs
// Text vignettes and dialogue for Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette).
// Formatted with neutral, literary clarity; no forced software buttons or reflex minigames.

export const money = (n) => `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}`;

export const WORK_VIGNETTES = {
  grind: {
    label: 'Mundane / Grinding Workday',
    title: 'Harbor Logistics · Shift Floor',
    beats: [
      {
        heading: '10:15 AM · The Line Moves',
        text: 'Fluorescent tubes hum overhead. You stand at packing station four, slicing tape and checking manifests as gray plastic totes slide past on the rollers.',
        detail: 'Sore heels against the concrete. The clock above the safety board seems stuck.',
      },
      {
        heading: '2:40 PM · Pallet Wrap & Repetition',
        text: 'A misrouted shipment of ceramic cookware holds up the conveyor. The supervisor taps his clipboard without looking up. Your lower back is stiff.',
        detail: 'In your pocket, your phone vibrates twice. For a second, you wonder if your starter duck in Quackpot finished its race.',
      },
    ],
  },
  engaging: {
    label: 'Engaging / Pleasant Workday',
    title: 'Harbor Logistics · Station Team',
    beats: [
      {
        heading: '10:30 AM · Shared Rhythm',
        text: 'Radio station 94.7 plays classic pop over the warehouse speakers. Dan from station three shares half a lemon pastry and tells a funny story about his stubborn terrier.',
        detail: 'The packing orders flow smoothly. The team beats the morning quota by twenty minutes.',
      },
      {
        heading: '2:15 PM · A Competent Afternoon',
        text: 'You catch a barcode mismatch before a pallet gets loaded on the interstate truck. The lead supervisor thanks you with a genuine nod.',
        detail: 'Your hands are busy and time moves quickly. You feel pleasantly capable and part of a crew.',
      },
    ],
  },
};

export const COMMUTE_VIGNETTES = {
  exhausting: {
    label: 'Dull / Exhausting Commute',
    title: 'The Route 14 Bus',
    beats: [
      {
        heading: '5:15 PM · Standing Room Only',
        text: 'A cold autumn drizzle coats the bus windows in gray streaks. You grip a greasy overhead handrail, wedged between wet umbrellas and silent passengers.',
        detail: 'Everyone around you is staring down at glowing screens—scrolling short-form video feeds, playing neon puzzle games, or buying digital coins.',
      },
      {
        heading: '5:45 PM · Walking the Last Blocks',
        text: 'Puddles splash against your worn sneakers. The wind off the harbor cuts through your jacket collar as diesel exhaust lingers in the alleyway.',
        detail: 'Your shoulders are tight with exhaustion. All you want is a distraction.',
      },
    ],
  },
  pleasant: {
    label: 'Pleasant / Uplifting Commute',
    title: 'Walking Home Through Harbor Park',
    beats: [
      {
        heading: '5:10 PM · Late Sunlight',
        text: 'The afternoon clouds break, letting slanted golden sunlight wash over the brick rowhouses. You decide to take the scenic path through the neighborhood park.',
        detail: 'A cool breeze rustles the orange maple leaves. Sparrows bicker cheerfully around a stone fountain.',
      },
      {
        heading: '5:35 PM · Music & Fresh Air',
        text: 'You slip on your headphones, listening to a favorite mellow acoustic track. A dog walker smiles as a golden retriever trots past with a stick.',
        detail: 'Your head clears. The physical fatigue feels honest and earned, rather than oppressive.',
      },
    ],
  },
};

export const WAGE_PAYSLIP = {
  employer: 'Harbor Logistics Distribution Inc.',
  shiftDate: 'Day 1 · Regular Shift',
  hours: '8.0 hrs · General Fulfillment',
  gross: '$88.00',
  deductions: '−$28.00 (Taxes & Social Ins.)',
  takeHome: '$60.00',
  disbursement: 'Direct Deposit / Daily Cash Advance available.',
  summaryNote: 'Take-home wages credited: +$60.00 cash.',
};

export const EVENING_ACTIVITIES = {
  callMom: {
    id: 'call_mom',
    title: 'Call Mom',
    actionLabel: 'Call Mom (Phone)',
    badge: 'Restorative · +5 HP',
    description: 'A quiet, unhurried catch-up about dinner, family news, and how you are holding up.',
    dialogue: [
      { speaker: 'Mom', text: 'Hello, sweetheart! Oh, I’m so glad you called. Are you home safe from work?' },
      { speaker: 'You', text: 'Yeah, just walked through the door. Feet are a little tired, but I’m okay.' },
      { speaker: 'Mom', text: 'Did you make yourself some proper dinner, or are you living on takeout again? Promise me you’ll drink a glass of water and get to bed at a decent hour.' },
      { speaker: 'You', text: 'I promise. How are things back home?' },
      { speaker: 'Mom', text: 'Quiet. Mrs. Gable’s cat got up on the roof again, but the fire crew sorted it out. Nothing you need to worry about. Take care of yourself, okay? I love you.' },
      { speaker: 'You', text: 'Love you too, Mom. Talk soon.' },
    ],
    reflection: 'Hearing her calm, ordinary voice brings the room into focus. The rush of the day settles into steady ground.',
    healthEffect: 5,
  },
  sitWithDuck: {
    id: 'sit_duck',
    title: 'Sit with Duck',
    actionLabel: 'Sit quietly with Duck (Desk)',
    badge: 'Companion · +2 HP',
    description: 'Take a quiet breath at the desk and sit with your physical rubber duck companion.',
    dialogue: [
      { speaker: 'Desk', text: 'You pull up your desk chair and look at the little yellow duck under the warm lamp pool.' },
      { speaker: 'Reflection', text: 'It has no microtransactions, no battery, and no countdown timers. It just sits there, patiently watching over your pens and loose papers.' },
      { speaker: 'Quiet Breath', text: 'You tap its smooth vinyl head. The apartment is peaceful.' },
    ],
    reflection: 'A few minutes of genuine stillness. The silence in the apartment is comforting.',
    healthEffect: 2,
  },
  openGacha: {
    id: 'open_gacha',
    title: 'Open Quackpot',
    actionLabel: 'Open Quackpot (Phone App)',
    badge: 'Temptation · Spend Cash',
    description: 'Unlock your phone. The colorful Quackpot icon pulses with an active notification badge.',
    dialogue: [
      { speaker: 'Phone Notification', text: 'QUACKPOT! · "Special Evening Rush! First 10-Pull 30% off! Limited-edition Mallard Commander banner active!"' },
      { speaker: 'Wallet Reminder', text: 'You have fresh cash in your pocket ($60.00 from your shift). The shiny gacha ducks look so lively compared to this empty room.' },
    ],
    reflection: 'Your thumb hovers over the button. The dopamine pull is immediate and magnetic.',
    healthEffect: 0,
  },
};

export const EXTRA_SHIFTS = [
  {
    id: 'diner_marisol',
    title: "Cover Marisol's Late Shift",
    workplace: 'Harbor Street Diner',
    hours: '6:30 PM – 11:30 PM (5.0 hrs)',
    cashGain: 45.00,
    healthCost: 15,
    prompt: 'Marisol texts: "Hey, any chance you could cover my closing shift tonight? Dishwasher walked out and we are slammed. Pays $45 cash on the spot."',
    vignette: 'Five hours in a steamy, greasy dish pit. Washing heavy cast-iron skillets and busing spilled milkshakes. Your wrists throb as you sweep the tile at midnight.',
    payNote: '+$45.00 cash handed to you in an envelope by the diner manager. −15 HP fatigue.',
  },
  {
    id: 'warehouse_night',
    title: 'Night Warehouse Restock',
    workplace: 'Harbor Logistics Bay 3',
    hours: '8:00 PM – 1:00 AM (5.0 hrs)',
    cashGain: 55.00,
    healthCost: 15,
    prompt: 'Logistics automated blast: "URGENT OVERTIME: Heavy inbound container unload. Cash-equivalent disbursement $55 upon shift completion."',
    vignette: 'Heavy cartons of winter coats and power tools. Cold wind blows into the open loading dock. Your lower back is on fire by 1:00 AM.',
    payNote: '+$55.00 direct disbursement credited. −15 HP heavy physical strain.',
  },
  {
    id: 'courier_rush',
    title: 'Evening Courier Run',
    workplace: 'QuickDrop Bike Express',
    hours: '6:00 PM – 9:30 PM (3.5 hrs)',
    cashGain: 40.00,
    healthCost: 10,
    prompt: 'App notification: "Surge demand in Harbor Core: 8 hot dinner orders waiting for bike pickup. Guaranteed $40 net earnings."',
    vignette: 'Pedaling hard through rainy evening traffic. Dodging open car doors and splashing through deep gutters. Your jeans are soaked, but you finish the route.',
    payNote: '+$40.00 app payout deposited. −10 HP cold & physical exertion.',
  },
];
