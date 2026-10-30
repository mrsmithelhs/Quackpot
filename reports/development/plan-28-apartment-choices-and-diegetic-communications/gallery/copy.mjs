// Plan 28 interaction gallery: report-local copy (Haiku draft, reviewed and corrected by the lead).
// Amounts always come from the engine at the call site. Nothing here sets prices, wages, health or debt; every figure
// arrives as a parameter. money(n) is the only money formatter, except the planner note, which uses handwritten
// shorthand ("$15") on purpose.
// Institution letters never print software controls. Decide and result copy uses the game's neutral voice.

const SENDER = 'Harbor Court Property Office';

export const money = (n) => `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}`;

const shorthand = (n) => (Number.isInteger(n) ? `$${n}` : money(n));
const unitLabel = (unit) => (String(unit).startsWith('Unit') ? String(unit) : `Unit ${unit}`);
const healthChange = (before, after) =>
  `Health ${before} → ${after} (${after < before ? '−' : '+'}${Math.abs(before - after)})`;

/** Calm institutional letter. Plain paper: no buttons, no links, no threats. */
export function noticeLetter({ amount, unit }) {
  return {
    sender: SENDER,
    heading: `Rent due today · ${unitLabel(unit)}`,
    paragraphs: [
      `Rent for ${unitLabel(unit)} is due today. The amount due is ${money(amount)}.`,
      "You can pay in person at the property office, or through the office's online payment page.",
      `Once the full ${money(amount)} is received, the rent for this unit will be recorded as paid.`,
      'If you have any questions about this notice, please contact the property office. Thank you for living at Harbor Court.',
    ],
    footer: `${SENDER} · ${unitLabel(unit)}`,
  };
}

/** The property office's simple payment page on the phone. Paid from cash on hand. */
export function portalPage({ amount, cash }) {
  return {
    title: 'Pay rent',
    rows: [
      ['Amount due', money(amount)],
      ['Paying from', 'Cash on hand'],
      ['Cash on hand now', money(cash)],
    ],
    note: "Paying the full amount records this unit's rent as paid.",
  };
}

/** Casual texts asking about tonight's late shift. No guilt. Health is not quoted; its cost is on the decide panel. */
export function marisolThread({ pay }) {
  return [
    { from: 'Marisol', text: 'hey, any chance you could cover my late shift tonight?' },
    { from: 'Marisol', text: `it's a long one, sorry. it pays ${money(pay)} cash.` },
    { from: 'Marisol', text: "no worries if it doesn't work out." },
  ];
}

/** The character's own notepad page for today. First-person shorthand. Breakfast is not on the list. */
export function plannerPage({ rent, shiftPay }) {
  return {
    heading: 'today',
    items: [
      { id: 'rent', text: `pay rent — ${shorthand(rent)}` },
      { id: 'shift', text: `maybe cover marisol's shift (+${shorthand(shiftPay)})` },
    ],
  };
}

/** Decision panels: the game's own voice, second person, exact, with a way back. */
export const decide = {
  payRent({ amount, cashBefore, cashAfter }) {
    return {
      heading: `Pay rent, ${money(amount)}?`,
      lines: [
        `Harbor Court Property Office, Unit 4B. Rent due today: ${money(amount)}.`,
        `Cash on hand: ${money(cashBefore)} → ${money(cashAfter)}.`,
        'Once paid, the rent is settled for today.',
      ],
      confirm: `Pay ${money(amount)}`,
      back: 'Put it down',
    };
  },

  takeShift({ pay, health, healthAfter, cashAfter }) {
    return {
      heading: "Cover Marisol's late shift?",
      lines: [
        `Tonight, Harbor Street Diner. It's a long one. Cash: +${money(pay)}.`,
        `${healthChange(health, healthAfter)}.`,
        `Cash on hand after: ${money(cashAfter)}.`,
      ],
      confirm: `Work the shift, +${money(pay)}`,
      back: 'Not now',
    };
  },

  sellCouch({ gain, cashAfter }) {
    return {
      heading: 'Sell the couch?',
      lines: [
        `A buyer pays ${money(gain)} cash and takes the couch today.`,
        'The couch is gone for good.',
        `Cash on hand after: ${money(cashAfter)}.`,
      ],
      confirm: `Sell for ${money(gain)}`,
      back: 'Not now',
    };
  },

  getBreakfast({ amount, cashBefore, cashAfter }) {
    return {
      heading: 'Breakfast from the bakery downstairs',
      lines: [
        `Breakfast costs ${money(amount)}.`,
        `Cash on hand: ${money(cashBefore)} → ${money(cashAfter)}.`,
      ],
      confirm: `Buy breakfast for ${money(amount)}`,
      back: 'Not now',
    };
  },
};

/** Result cards shown after a commitment. */
export const results = {
  rentPaid({ amount, cashAfter, wage }) {
    const lines = [
      `${money(amount)} paid to Harbor Court Property Office for Unit 4B.`,
      `Cash on hand: ${money(cashAfter)}.`,
      `Your ${money(wage)} wage arrives this evening.`,
    ];
    if (cashAfter === 0) lines.push('Nothing else is due today.');
    return { heading: 'Rent paid in full', lines };
  },

  shiftTaken({ pay, healthAfter, cashAfter }) {
    return {
      heading: 'Thanks for covering tonight.',
      lines: [
        `+${money(pay)} cash from Harbor Street Diner for tonight's late shift.`,
        `Health: ${healthAfter}.`,
        `Cash on hand: ${money(cashAfter)}.`,
      ],
    };
  },

  couchSold({ gain, cashAfter }) {
    return {
      heading: 'The couch is sold',
      lines: [
        `+${money(gain)} cash.`,
        `Cash on hand: ${money(cashAfter)}.`,
      ],
    };
  },

  breakfastBought({ amount, cashAfter }) {
    return {
      heading: 'Breakfast bought',
      lines: [
        `${money(amount)} paid at the bakery downstairs.`,
        `Cash on hand: ${money(cashAfter)}.`,
      ],
    };
  },
};

/** Accessible names for world objects. */
export const worldLabels = {
  rentNotice: 'Rent notice on the fridge',
  envelope: 'Envelope on the desk',
  phone: 'Phone: new message',
  notepad: 'Your notepad',
  couch: 'The couch',
  plate: 'Empty plate',
};

/** Short marker chips shown beside important objects (3 words or fewer). */
export const chips = {
  rentNotice: 'Rent notice',
  envelope: 'Mail',
  phone: 'New message',
  notepad: "Today's list",
  couch: 'Couch',
  plate: 'Breakfast',
};
