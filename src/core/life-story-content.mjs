// Adapted from Plan 40 copy.mjs catalog 1.1.0; author tone is not player evidence.
import { createRng } from './prng.mjs';
export const STORY_VERSION = 1;
export const STORY_CATALOG_VERSION = '1.1.0';
export const WORK_STORIES = Object.freeze({
  "011": {
    "heading": "Conveyor Jam & Clipboard Watch",
    "text": "A misrouted pallet of ceramic mugs jams the transfer arm. The line supervisor hovers over your shoulder, checking his stopwatch without uttering a word. Your lumbar spine throbs.",
    "detail": "Fluorescent tubes flicker violently. Time seems frozen in place."
  },
  "016": {
    "heading": "Defective Packing Lot & Paper Cuts",
    "text": "A shipment of flimsy, undersized cardboard cartons tears along every seam. You struggle to tape reinforced corners as heavy tape dispenser teeth nick your knuckles.",
    "detail": "Cardboard dust coats your mouth and throat. The bin backlog creeps upward."
  },
  "017": {
    "heading": "Bay Shouting & Heavy Air",
    "text": "Diesel exhaust wafts into Bay 2 as an idling flatbed rumbles outside. A senior dispatcher curses over the PA system about missed delivery windows.",
    "detail": "A persistent headache pounds behind your temples."
  },
  "012": {
    "heading": "Packing Tape & Sore Heels",
    "text": "Slice tape, fold flaps, slap shipping label, slide tote. You repeat the exact sequence 180 times in two hours. Your heels burn against the sealed concrete.",
    "detail": "In your pocket, your phone buzzes twice."
  },
  "018": {
    "heading": "Dusty Inventory Recount",
    "text": "You climb a steel rolling ladder with a clipboard, verifying barcode serial numbers on top-shelf storage bins under dim yellow halide fixtures.",
    "detail": "The numbers blur together. Two identical part numbers differ by a single trailing letter."
  },
  "019": {
    "heading": "Breakroom Hum & Jammed Vending",
    "text": "The breakroom microwave hums with the scent of reheated soup. The vending machine swallows a crumpled dollar bill without dispensing pretzels.",
    "detail": "You sit on a hard plastic chair, massaging your cramped calves until the buzzer rings."
  },
  "013": {
    "heading": "Steady Midday Cadence",
    "text": "Standard cardboard cartons slide down the rollers at a predictable cadence. No backlogs, no equipment alarms. You find an even, automatic rhythm.",
    "detail": "The break clock ticks down steadily. You finish the third pallet exactly on schedule."
  },
  "01A": {
    "heading": "Forklift Rumble & Radio Static",
    "text": "A forklift beeps in reverse across the main crossway. You verify shipping stickers against manifest sheets without hurry or pressure.",
    "detail": "Just standard warehouse work. The afternoon hours advance predictably."
  },
  "01B": {
    "heading": "Bubble Wrap & Tape Rolls",
    "text": "You retrieve a fresh pallet of packing supplies from the central cage and restock four neighboring stations with brown tape and packing slips.",
    "detail": "A routine maintenance task that passes thirty minutes comfortably."
  },
  "014": {
    "heading": "Radio Pop & Shared Pastry",
    "text": "Station 94.7 plays classic pop over the warehouse PA. Dan from station three shares half a warm lemon pastry and cracks a dry joke about the company safety mascot.",
    "detail": "The crew hums along with the chorus. The afternoon flies by noticeably faster."
  },
  "01C": {
    "heading": "Recovered Shipping Invoice",
    "text": "You help Priya from receiving track down a misfiled customs slip behind the printer tray, saving her an hour of tedious phone calls.",
    "detail": "She grins and thanks you warmly, sliding over a cold bottle of ginger ale."
  },
  "01D": {
    "heading": "Smooth Outbound Clear",
    "text": "Everything clicks: tape dispensers glide without tangling, labels stick cleanly, and your station finishes the freight run fifteen minutes before the final truck departure.",
    "detail": "You take a leisurely stretch and lean against the clean workbench."
  },
  "015": {
    "heading": "Sharp Catch & Supervisor Praise",
    "text": "You catch a barcode mismatch before a high-value freight skid is loaded onto the outbound truck. The plant manager personally walks over, thanks you, and gives a genuine fist bump.",
    "detail": "You solved the issue entirely on your own. You feel competent, sharp, and respected."
  },
  "01E": {
    "heading": "Clever Fix on Sorter Jam",
    "text": "When the primary sorting belt halts on a caught buckle, you spot the jammed pivot pin and free it with two quick taps of a spanner before maintenance even arrives.",
    "detail": "The line roars back to life, and the neighboring crew gives you a round of applause."
  },
  "01F": {
    "heading": "Record Volume & Early Wrap",
    "text": "The warehouse team smashes the quarterly dispatch record by 4:30 PM. The shift lead calls an early pack-up with full shift wages guaranteed.",
    "detail": "A palpable buzz of accomplishment fills the locker room as everyone packs their bags."
  }
});
export const COMMUTE_STORIES = Object.freeze({
  "0C1": {
    "heading": "Commute In · Slush & Sleet at the Stop",
    "text": "Freezing sleet cuts into your face while waiting twenty minutes for the delayed Route 14 bus. A passing delivery van splashes dirty curb water across your ankles.",
    "detail": "Your damp socks stay cold all morning. Your teeth chatter as you board."
  },
  "0C6": {
    "heading": "Commute In · Wet Coats & Sticky Floors",
    "text": "The morning tram is jammed shoulder-to-shoulder with wet umbrellas and damp winter coats. The air is steamy with breath and damp wool.",
    "detail": "You balance on one foot as the tram squeals around harbor rail curves."
  },
  "0C3": {
    "heading": "Commute In · Morning Sidewalk Routine",
    "text": "Walking past the gray brick apartment blocks under an overcast sky. Neutral morning traffic hums by. Pigeons peck at breadcrumbs on the phone booth roof.",
    "detail": "Neither rushed nor delayed. An uneventful walk to the turnstile."
  },
  "0C7": {
    "heading": "Commute In · Crisp Air & Good Podcast",
    "text": "A clean, invigorating autumn breeze sweeps off the bay. You listen to an engaging science podcast that makes the twenty-minute walk feel effortless.",
    "detail": "You arrive at the warehouse gate feeling awake and mentally clear."
  },
  "0C8": {
    "heading": "Commute In · Coffee Cart Kindness",
    "text": "The street corner coffee cart vendor remembers your face: \"Hey neighbor, fresh cinnamon twist just came out of the box, take one on the house today!\"",
    "detail": "The warm pastry and genuine smile set an upbeat, grounded tone for the morning."
  }
});
export function selectWorkStory(seed, id) {
  const rng = createRng(`${seed}/plan47-work-v1/${id}`);
  const commute = rng.pick(Object.keys(COMMUTE_STORIES));
  const choices = Object.keys(WORK_STORIES);
  const first = choices.splice(rng.int(choices.length), 1)[0];
  return { version: STORY_VERSION, catalog: STORY_CATALOG_VERSION, commute, work: [first, rng.pick(choices)] };
}
export function validWorkStory(value) {
  return value?.version === STORY_VERSION && value.catalog === STORY_CATALOG_VERSION && Object.keys(value).length === 4 && Object.hasOwn(COMMUTE_STORIES, value.commute) && Array.isArray(value.work) && value.work.length === 2 && value.work[0] !== value.work[1] && value.work.every(id => Object.hasOwn(WORK_STORIES, id));
}
