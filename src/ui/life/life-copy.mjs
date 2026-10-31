// src/ui/life/life-copy.mjs
// Apartment copy. Amounts always arrive as parameters from the engine or a preview; nothing here sets prices.
// Institution letters and the card app never print software controls. Decision and result copy uses the game's
// neutral voice.

const SENDER = 'Harbor Court Property Office';

export const money = (n) => `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}`;

const unitLabel = (unit) => (String(unit).startsWith('Unit') ? String(unit) : `Unit ${unit}`);
const healthChange = (before, after) =>
  `Health ${before} → ${after} (${after < before ? '−' : '+'}${Math.abs(before - after)})`;

/** Calm institutional letter. Plain paper: no buttons, no links, no threats. */
export function noticeLetter({ amount, unit, dueDay = null }) {
  return {
    sender: SENDER,
    heading: `Remaining rent balance · ${unitLabel(unit)}`,
    paragraphs: [
      `Most of the rent for ${unitLabel(unit)} has already been paid. The remaining balance ${dueDay ? `due on Day ${dueDay}` : 'due today'} is ${money(amount)}.`,
      "You can pay in person at the property office, or through the office's online payment page.",
      `Once the full ${money(amount)} is received, the rent for this unit will be recorded as paid.`,
      'If you have any questions about this notice, please contact the property office. Thank you for living at Harbor Court.',
    ],
    footer: `${SENDER} · ${unitLabel(unit)}`,
  };
}

/** Harbor Card app on the phone: the advance on offer and what is already owed. Institution text, no controls. */
export function cardApp({ available, owedNow }) {
  return {
    app: 'Harbor Card · Cash advance',
    rows: [
      ['Cash advance available', money(available)],
      ['Owed on the card now', money(owedNow)],
    ],
    note: 'An advance adds to what you owe on the card.',
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

/** Decision panels: the game's own voice, second person, exact, with a way back. */
export const decide = {
  payRent({ amount, cashBefore, cashAfter }) {
    return {
      heading: `Pay the remaining rent balance, ${money(amount)}?`,
      lines: [
        `Harbor Court Property Office, Unit 4B. Remaining rent balance: ${money(amount)}.`,
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
