// reports/development/plan-40-work-and-evening-experience-study/copy.mjs
// Pacing, narrative beats, and author-assigned tone data for Plan 40.
// Architecture designed to scale to 100+ work beats, 100+ commute beats, and 30+ extra shifts.
// Compact 3-digit hex IDs and 1-5 integer author ratings for efficient usage export.

export const CATALOG_VERSION = '1.0.0';

export const money = (n) => `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}`;

/**
 * 5-Point Author-Assigned Experiential Tone Coding (Designer Classification):
 * 1 = Very Depleting / Negative (heavy strain, hostility, severe delay/weather)
 * 2 = Mildly Depleting / Dull (monotony, fatigue, gray drizzle, boredom)
 * 3 = Neutral / Routine (steady routine, neutral weather, clock moves)
 * 4 = Pleasant / Uplifting (good music, friendly exchange, pleasant weather)
 * 5 = Very Uplifting / Energizing (autonomy, mastery, praise, helping someone)
 *
 * NOTE: These are author-coded category ratings assigned to the written vignettes,
 * NOT measured player mood or student survey responses.
 */
export const AUTHOR_TONE_LABELS = {
  1: 'Very Depleting (1/5)',
  2: 'Mildly Depleting (2/5)',
  3: 'Neutral / Routine (3/5)',
  4: 'Pleasant / Uplifting (4/5)',
  5: 'Very Energizing (5/5)',
};

export const AUTHOR_TONE_COLORS = {
  1: '#e76f51', // rose / alert
  2: '#f4a261', // orange / dull
  3: '#a3a9be', // muted gray / neutral
  4: '#8ab17d', // soft green / pleasant
  5: '#2a9d8f', // vibrant teal / energizing
};

// Aliases for compatibility
export const LIKERT_LABELS = AUTHOR_TONE_LABELS;
export const LIKERT_COLORS = AUTHOR_TONE_COLORS;

// ==========================================
// 1. ORDINARY WORK BEATS (Sample of 5 out of 100+ target)
// Covers dimensions: autonomy, mastery, praise, social connection, repetition, strain.
// ==========================================
export const WORK_BEATS = [
  {
    hexId: '011',
    rating: 1,
    dimension: 'strain / micromanagement',
    heading: 'Conveyor Jam & Clipboard Watch',
    text: 'A misrouted pallet of ceramic mugs jams the transfer arm. The line supervisor hovers over your shoulder, checking his stopwatch without uttering a word. Your lumbar spine throbs.',
    detail: 'Fluorescent tubes flicker violently. Time seems frozen in place.',
  },
  {
    hexId: '012',
    rating: 2,
    dimension: 'monotony / repetition',
    heading: 'Packing Tape & Sore Heels',
    text: 'Slice tape, fold flaps, slap shipping label, slide tote. You repeat the exact sequence 180 times in two hours. Your heels burn against the sealed concrete.',
    detail: 'In your pocket, your phone buzzes twice. You wonder if your gacha duck finished its afternoon race.',
  },
  {
    hexId: '013',
    rating: 3,
    dimension: 'steady routine',
    heading: 'Steady Midday Flow',
    text: 'Standard cardboard cartons slide down the rollers at a predictable cadence. No backlogs, no equipment alarms. You find an even, automatic rhythm.',
    detail: 'The break clock ticks down steadily. You finish the third pallet exactly on schedule.',
  },
  {
    hexId: '014',
    rating: 4,
    dimension: 'social connection / music',
    heading: 'Radio Pop & Shared Pastry',
    text: 'Station 94.7 plays classic pop over the warehouse PA. Dan from station three shares half a warm lemon pastry and cracks a dry joke about the company safety mascot.',
    detail: 'The crew hums along with the chorus. The afternoon flies by noticeably faster.',
  },
  {
    hexId: '015',
    rating: 5,
    dimension: 'mastery / autonomy / praise',
    heading: 'Sharp Catch & Supervisor Praise',
    text: 'You catch a barcode mismatch before a high-value freight skid is loaded onto the outbound truck. The plant manager personally walks over, thanks you, and gives a genuine fist bump.',
    detail: 'You solved the issue entirely on your own. You feel competent, sharp, and respected.',
  },
];

// ==========================================
// 2. COMMUTE BEATS (Sample of 5 out of 100+ target)
// Covers dimensions: weather, socializing, helping someone, observation, sensory clearing.
// Includes both "Commute In" and "Commute Home".
// ==========================================
export const COMMUTE_BEATS = [
  {
    hexId: '0C1',
    rating: 1,
    phase: 'in', // Commute In
    dimension: 'harsh weather / transit delay',
    heading: 'Commute In · Slush & Sleet at the Stop',
    text: 'Freezing sleet cuts into your face while waiting twenty minutes for the delayed Route 14 bus. A passing delivery van splashes dirty curb water across your ankles.',
    detail: 'Your damp socks stay cold all morning. Your teeth chatter as you board.',
  },
  {
    hexId: '0C2',
    rating: 2,
    phase: 'home', // Commute Home
    dimension: 'digital isolation / cramped transit',
    heading: 'Commute Home · Packed Standing Room',
    text: 'Crammed against the greasy center pole on the bus. Every passenger around you has their neck craned downward, silently tapping neon puzzle games or buying loot boxes.',
    detail: 'The diesel air is stifling. You feel drained of emotional bandwidth.',
  },
  {
    hexId: '0C3',
    rating: 3,
    phase: 'in', // Commute In
    dimension: 'neutral routine / quiet sidewalk',
    heading: 'Commute In · Morning Sidewalk Routine',
    text: 'Walking past the gray brick apartment blocks under an overcast sky. Neutral morning traffic hums by. Pigeons peck at breadcrumbs on the phone booth roof.',
    detail: 'Neither rushed nor delayed. An uneventful walk to the turnstile.',
  },
  {
    hexId: '0C4',
    rating: 4,
    phase: 'home', // Commute Home
    dimension: 'pleasant weather / mellow music',
    heading: 'Commute Home · Golden Sunlight Through Trees',
    text: 'Slanted autumn sunlight cuts through the maple trees in the park. You put your headphones on and play a mellow acoustic playlist that unclenches your jaw.',
    detail: 'A dog trots past carrying an enormous stick, making three commuters smile.',
  },
  {
    hexId: '0C5',
    rating: 5,
    phase: 'home', // Commute Home
    dimension: 'helping someone / human connection',
    heading: 'Commute Home · Helping on the Station Stairs',
    text: 'At the subway exit, you help an elderly neighbor carry a heavy grocery cart up the flight of stairs. She smiles warmly, thanks you warmly, and hands you an apple.',
    detail: 'That brief moment of human decency makes the entire day feel lighter.',
  },
];

// ==========================================
// 3. WAGE PAYSLIP (Plan 29 Baseline: $60 Take-Home)
// ==========================================
export const WAGE_PAYSLIP = {
  employer: 'Harbor Logistics Distribution Inc.',
  shiftDate: 'Day 1 · Regular Shift',
  hours: 'Afternoon Shift Anchor',
  gross: '$88.00 (Fictional gross stub)',
  deductions: '−$28.00 (Fictional deductions)',
  takeHome: '$60.00',
  disbursement: 'Direct cash take-home disbursed.',
  summaryNote: 'Take-home wages credited: +$60.00 cash.',
};

// ==========================================
// 4. EVENING LIFE ACTIVITIES
// Factual, neutral framing without moralizing or prescribing student motives.
// ==========================================
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
    badge: 'Quiet Moment · +2 HP',
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
    badge: 'Gacha App · Quackpot',
    description: 'Unlock your phone and open the Quackpot gacha game app.',
    dialogue: [
      { speaker: 'Phone App', text: 'QUACKPOT! · "Special Evening Banner Active! Limited-edition Mallard Commander banner now live!"' },
      { speaker: 'Wallet Note', text: 'You have fresh cash in your pocket ($60.00 from your shift). The game shop displays single-pull and multi-pull options.' },
    ],
    reflection: 'The game launcher opens to the banner screen.',
    healthEffect: 0,
  },
};

// ==========================================
// 5. EXTRA SHIFT CATALOG (Sample of 5 out of 30+ target)
// Weighted toward gig work (food/grocery delivery).
// Each shift has 5 alternative standalone narrative beats (rated 1-5).
// The payout is strictly flat and matches the quoted cash reward.
// ==========================================
export const EXTRA_SHIFTS_CATALOG = [
  {
    id: 'gig_food',
    title: 'QuickDrop Food Delivery',
    workplace: 'City Center Courier Gig',
    category: 'gig', // frequent gig work
    weight: 40,
    hours: '3.0 hrs · Evening Courier',
    cashGain: 35.00,
    healthCost: 8,
    prompt: 'App notification: "Surge dinner orders in Harbor Core: 6 hot meals ready for pickup. Flat payout: $35.00 cash."',
    beats: [
      { hexId: 'F01', rating: 1, text: 'A soup container leaks inside your thermal bag. The customer yells on the porch and slams the door.' },
      { hexId: 'F02', rating: 2, text: 'Waiting twenty minutes at a noisy burger takeout counter while delivery drivers crowd the doorway.' },
      { hexId: 'F03', rating: 3, text: 'Straightforward drop-off at an apartment lobby package table. Buzz in, snap confirmation photo, buzz out.' },
      { hexId: 'F04', rating: 4, text: 'The aroma of fresh garlic pizza fills your ride through cool evening streets with green traffic lights.' },
      { hexId: 'F05', rating: 5, text: 'An exhausted nurse on night shift receives hot noodles with profound relief: "You have no idea how much this helps tonight, thank you."' },
    ],
  },
  {
    id: 'gig_grocery',
    title: 'Harbor Fresh Grocery Dispatch',
    workplace: 'Express Supermarket Dispatch',
    category: 'gig', // frequent gig work
    weight: 35,
    hours: '3.5 hrs · Evening Dispatch',
    cashGain: 42.00,
    healthCost: 10,
    prompt: 'Dispatch text: "Express batches available: pick and deliver two grocery crates in Waterfront district. Flat payout: $42.00."',
    beats: [
      { hexId: 'E01', rating: 1, text: 'Hauling three heavy cases of mineral water up four flights of crumbling walk-up stairs with dead hallway lights.' },
      { hexId: 'E02', rating: 2, text: 'Wandering crowded supermarket aisles trying to find a discontinued brand of organic gluten-free oats.' },
      { hexId: 'E03', rating: 3, text: 'Scanning standard produce, bagging canned beans and bread neatly, and scanning the receipt QR code.' },
      { hexId: 'E04', rating: 4, text: 'The grocery store is nearly empty and serene. You find every single item on the shelf in record time.' },
      { hexId: 'E05', rating: 5, text: 'A busy young father greets you at the door with immense relief: "You literally saved our family dinner tonight, thank you!"' },
    ],
  },
  {
    id: 'diner_cover',
    title: "Cover Marisol's Late Diner Shift",
    workplace: 'Harbor Street Diner',
    category: 'service', // occasional
    weight: 15,
    hours: '5.0 hrs · Kitchen Closing',
    cashGain: 45.00,
    healthCost: 15,
    prompt: 'Marisol texts: "Hey, any chance you could cover my closing shift tonight? Dishwasher walked out. Flat $45 cash on the spot."',
    beats: [
      { hexId: 'D01', rating: 1, text: 'Steamy dish pit overflowing with burnt cheese skillets, clattering pots, and greasy dishwater splashing your chest.' },
      { hexId: 'D02', rating: 2, text: 'Mopping sticky floor tile under flickering neon tube behind the counter at 11:15 PM.' },
      { hexId: 'D03', rating: 3, text: 'Wiping down laminated breakfast menus and filling salt shakers in relative quiet.' },
      { hexId: 'D04', rating: 4, text: 'The short-order cook slides a fresh toasted sourdough grilled cheese onto your tray during break.' },
      { hexId: 'D05', rating: 5, text: 'A kind elderly patron leaves a note thanking the night crew for keeping the lights on in the neighborhood.' },
    ],
  },
  {
    id: 'warehouse_night',
    title: 'Night Logistics Freight Unload',
    workplace: 'Harbor Logistics Bay 3',
    category: 'industrial', // occasional
    weight: 10,
    hours: '5.0 hrs · Loading Dock',
    cashGain: 55.00,
    healthCost: 15,
    prompt: 'Logistics automated blast: "URGENT OVERTIME: Heavy freight container unload. Flat $55 cash disbursement upon completion."',
    beats: [
      { hexId: 'A01', rating: 1, text: 'A pallet of steel hardware tilts and spills. Freezing harbor drafts rush through the open bay door.' },
      { hexId: 'A02', rating: 2, text: 'Repetitive barcode scanning of 140 identical cartons under blinding industrial halide lamps.' },
      { hexId: 'A03', rating: 3, text: 'Steady forklift rumble, routine pallet stacking on shelf tier two. Predictable labor.' },
      { hexId: 'A04', rating: 4, text: 'Coordinated teamwork with the pallet jack operator; the team clears the container 30 minutes ahead of schedule.' },
      { hexId: 'A05', rating: 5, text: 'The warehouse lead hands out hot thermoses of black coffee and praises the crew for extraordinary speed.' },
    ],
  },
  {
    id: 'bike_courier',
    title: 'Express Document Bike Courier',
    workplace: 'QuickDrop Bike Express',
    category: 'courier', // occasional
    weight: 10,
    hours: '3.5 hrs · Rush Courier',
    cashGain: 40.00,
    healthCost: 10,
    prompt: 'Dispatch alert: "Rush envelope dispatch: Legal documents across town. Flat $40 net guaranteed."',
    beats: [
      { hexId: 'B01', rating: 1, text: 'A parked delivery van door swings open, forcing you into a deep puddle. Road grit coats your pants.' },
      { hexId: 'B02', rating: 2, text: 'Long, grinding uphill climb against harbor headwinds. Your chain slips once on the grade.' },
      { hexId: 'B03', rating: 3, text: 'Waiting at a red traffic light, checking the delivery address on your handlebar phone mount.' },
      { hexId: 'B04', rating: 4, text: 'Cruising down Harbor Boulevard with a tailwind and sunset glow washing over the skyline.' },
      { hexId: 'B05', rating: 5, text: 'Delivering the envelope three minutes before the deadline; the relieved attorney thanks you profusely.' },
    ],
  },
];

/**
 * Draws 1–2 extra shift options for the evening, weighted by category.
 * Deterministic with seed or pseudo-random for interactive preview.
 */
export function rollDailyExtraShifts(count = 2, seed = 0.5) {
  const pool = [...EXTRA_SHIFTS_CATALOG];
  const totalWeight = pool.reduce((acc, s) => acc + s.weight, 0);

  const drawOne = (sVal, excludeId = null) => {
    const candidates = excludeId ? pool.filter(s => s.id !== excludeId) : pool;
    const subTotal = candidates.reduce((acc, s) => acc + s.weight, 0);
    let target = (sVal % 1) * subTotal;
    for (const item of candidates) {
      if (target < item.weight) return item;
      target -= item.weight;
    }
    return candidates[candidates.length - 1];
  };

  const selected = [];
  const first = drawOne(seed);
  selected.push(first);

  if (count > 1) {
    const second = drawOne(seed * 3.1415 + 0.2718, first.id);
    selected.push(second);
  }

  return selected;
}
