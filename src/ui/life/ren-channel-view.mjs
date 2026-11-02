import { renderRen, renderRenScene } from '../../assets/ren/index.mjs';
import { social46DisplayText, social46When } from '../../core/life-social.mjs';
import { REN_RESPONSE_CHOICES, REN_RESPONSE_LINES } from '../../core/life-social-dialogue.mjs';

// This view is deliberately stateless: the caller supplies committed engine state.
// All mutations and display evidence pass through callbacks.
export function renderRenChannel46(root, life, callbacks, active) {
  const s = life.social46;
  const frame = document.createElement('div'); frame.className = 'life-story47-stage';
  const card = document.createElement('section'); card.className = 'life-story47 ren46-channel';
  const heading = document.createElement('h2'); heading.textContent = 'Ren'; card.append(heading);
  const portrait = document.createElement('div'); portrait.className = s.introShown ? 'ren46-avatar' : 'ren46-art';
  portrait.innerHTML = s.introShown
    ? renderRen({ idPrefix: 'ren46channel', framing: 'avatar', decorative: true }).svg
    : renderRenScene({ idPrefix: 'ren46channel', scene: 'door', decorative: true }).svg;
  card.append(portrait);
  const say = text => { const p = document.createElement('p'); p.textContent = text; card.append(p); };
  const button = (label, fn, disabled = false) => {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'life-btn'; el.textContent = label;
    el.disabled = !active || disabled; el.addEventListener('click', () => { el.disabled = true; fn(); }); card.append(el);
  };
  const send = intent => callbacks.action(intent);
  if (!s.introShown) {
    say(social46DisplayText('introduction'));
    say('Reading and replying are free and do not use an Evening.');
    button('Nice to meet you', callbacks.close);
  } else if (s.response) {
    const response = s.response;
    say(social46DisplayText(response.kind));
    if (response.reply) say(`Ren: ${REN_RESPONSE_LINES[response.kind][response.reply.choice]}`);
    else if (s.revision === 2) for (const [choice, label] of REN_RESPONSE_CHOICES[response.kind] ?? []) button(label, () => send({ type: 'social46_response_reply', id: response.id, choice }));
    button('Close message', () => send({ type: 'social46_response_dismiss', id: response.id }));
  } else if (s.pending) {
    const p = s.pending;
    if (!p.committed) {
      say(social46DisplayText(p.suggested ? 'suggestion_response' : 'invitation', p.activity, p.day, 0, life.day));
      say(`A visit uses ${social46When(p.day, life.day)}; dinner is separate.`);
      button(`Accept ${social46When(p.day, life.day)}`, () => send({ type: 'social46_reply', id: p.id, choice: 'accept' }));
      button('Not this time', () => send({ type: 'social46_reply', id: p.id, choice: 'decline' }));
      if (!p.rescheduled) button('Another evening', () => send({ type: 'social46_reply', id: p.id, choice: 'reschedule', day: p.day + 1 }));
      if (s.revision === 2 && p.initiator === 'ren' && !p.replied && !p.suggested && ['door', 'game'].includes(p.activity)) {
        const activity = p.activity === 'door' ? 'game' : 'door';
        button(activity === 'game' ? 'Suggest game night instead' : 'Suggest a chat instead', () => send({ type: 'social46_suggest_activity', id: p.id, activity }));
      }
    } else {
      say(social46DisplayText('accepted', null, p.day, 0, life.day));
      say(`Ren is coming by ${social46When(p.day, life.day)}.`);
      if (!p.seatingConfirmed) {
        say(social46DisplayText('floor_reconfirmation', null, p.day, 0, life.day));
        button('Confirm floor seating', () => send({ type: 'social46_confirm_floor', id: p.id }));
      }
      button('Tell Ren I can’t make it', () => send({ type: 'social46_cancel', id: p.id }));
      if (!p.rescheduled && p.seatingConfirmed) button('Suggest another evening', () => send({ type: 'social46_reschedule_plan', id: p.id, day: p.day + 1 }));
      const canBegin = life.day === p.day && life.phase === 'evening' && !life.anchor
        && !!life.meals[`d${life.day}-dinner`] && p.seatingConfirmed;
      button('Welcome Ren in · uses this Evening', () => send({ type: 'social46_begin', id: p.id, ...(s.revision === 2 ? { dialogueVersion: 1 } : {}) }), !canBegin);
    }
    button('Close', callbacks.close);
  } else {
    say('Ren: leave a note anytime. no rush either way.');
    if (life.phase === 'evening' && s.lastOfferedDay !== life.day) {
      const day = Math.max(life.day + (life.anchor ? 1 : 0), (s.lastVisitDay ?? -1) + 2);
      if (['strained', 'drifting'].includes(s.relationship)) button('Ask Ren to come by', () => send({ type: 'social46_offer', day, initiator: 'player', activity: 'repair' }));
      else {
        button('Ask Ren to come by', () => send({ type: 'social46_offer', day, initiator: 'player', activity: 'door' }));
        button('Suggest game night', () => send({ type: 'social46_offer', day, initiator: 'player', activity: 'game' }));
      }
    } else if (life.phase === 'evening') say('There are no more plans to arrange this evening.');
    button('Close', callbacks.close);
  }
  frame.append(card); root.replaceChildren(frame);
  if (active && !s.introShown) callbacks.shown({ type: 'social46_intro_shown' });
  else if (active && !s.response && s.pending && !s.pending.committed && s.pending.lastShownDay !== life.day) callbacks.shown({ type: 'social46_offer_shown', id: s.pending.id });
  if (active && s.response && !s.response.shown) callbacks.shown({ type: 'social46_response_shown', id: s.response.id });
  if (active && s.response?.reply && !s.response.reply.shown) callbacks.shown({ type: 'social46_response_reply_shown', id: s.response.id });
  if (active && s.pending?.committed && s.pending.ackShownDay !== life.day) callbacks.shown({ type: 'social46_ack_shown', id: s.pending.id });
  if (active && s.pending?.committed && !s.pending.seatingConfirmed && s.pending.floorPromptDay !== life.day) callbacks.shown({ type: 'social46_floor_shown', id: s.pending.id });
}
