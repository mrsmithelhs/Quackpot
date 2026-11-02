import { social46DisplayText, social46When } from '../../core/life-social.mjs';
import { REN_RESPONSE_CHOICES, REN_RESPONSE_LINES } from '../../core/life-social-dialogue.mjs';

// Ren's channel uses the existing held-phone visual language. The engine owns all changes and evidence.
export function renderRenChannel46(root, life, callbacks, active) {
  const s = life.social46;
  const frame = document.createElement('div'); frame.className = 'life-story47-stage ren46-phone-stage';
  const layout = document.createElement('section'); layout.className = 'ren46-channel-layout'; layout.setAttribute('role', 'dialog'); layout.setAttribute('aria-label', 'Messages from Ren');
  const phone = document.createElement('div'); phone.className = 'life-phone-held ren46-channel-phone';
  const screen = document.createElement('div'); screen.className = 'life-phone-screen';
  const status = document.createElement('div'); status.className = 'life-phone-status'; status.setAttribute('aria-hidden','true'); status.textContent = `${life.phase === 'lateNight' ? 'Late' : life.phase}  ● ● ●`;
  const title = document.createElement('h2'); title.className = 'life-phone-app-bar'; title.textContent = 'Ren';
  const body = document.createElement('div'); body.className = 'life-phone-body';
  screen.append(status,title,body); phone.append(screen);
  const panel = document.createElement('section'); panel.className = 'life-decide ren46-channel-decide'; panel.setAttribute('aria-label', 'Decide');
  const panelBody = document.createElement('div'); panelBody.className = 'life-decide-body';
  const heading = document.createElement('h3'); heading.textContent = 'Decide'; panelBody.append(heading);
  const actions = document.createElement('div'); actions.className = 'life-decide-actions'; panelBody.append(actions); panel.append(panelBody);
  const say = text => { const p = document.createElement('p'); p.className = 'life-bubble'; p.textContent = text.replace(/^Ren:\s*/, ''); body.append(p); };
  const info = text => { const p = document.createElement('p'); p.textContent = text; panelBody.insertBefore(p, actions); };
  const button = (label, fn, disabled = false) => {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'life-btn'; el.textContent = label;
    el.disabled = !active || disabled; el.addEventListener('click', () => { el.disabled = true; fn(); }); actions.append(el);
  };
  const send = intent => callbacks.action(intent);
  if (!s.introShown) {
    say(social46DisplayText('introduction')); button('Nice to meet you', callbacks.close);
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
      button(`Accept ${social46When(p.day, life.day)}`, () => send({ type: 'social46_reply', id: p.id, choice: 'accept' }));
      button('Not this time', () => send({ type: 'social46_reply', id: p.id, choice: 'decline' }));
      if (!p.rescheduled) button('Another evening', () => send({ type: 'social46_reply', id: p.id, choice: 'reschedule', day: p.day + 1 }));
      if (s.revision === 2 && p.initiator === 'ren' && !p.replied && !p.suggested && ['door', 'game'].includes(p.activity)) {
        const activity = p.activity === 'door' ? 'game' : 'door';
        button(activity === 'game' ? 'Suggest game night instead' : 'Suggest a chat instead', () => send({ type: 'social46_suggest_activity', id: p.id, activity }));
      }
    } else {
      say(social46DisplayText('accepted', null, p.day, 0, life.day));
      if (!p.seatingConfirmed) { info(social46DisplayText('floor_reconfirmation', null, p.day, 0, life.day)); button('Confirm floor seating', () => send({ type: 'social46_confirm_floor', id: p.id })); }
      button('Tell Ren I can’t make it', () => send({ type: 'social46_cancel', id: p.id }));
      if (!p.rescheduled && p.seatingConfirmed) button('Suggest another evening', () => send({ type: 'social46_reschedule_plan', id: p.id, day: p.day + 1 }));
      if (s.revision === 2) {
        if (life.day === p.day && life.phase === 'evening' && !life.anchor && !life.recovery) button('Go to the door', callbacks.goDoor);
      } else {
        const canBegin = life.day === p.day && life.phase === 'evening' && !life.anchor && !!life.meals[`d${life.day}-dinner`] && p.seatingConfirmed;
        button('Welcome Ren in · uses this Evening', () => send({ type: 'social46_begin', id: p.id }), !canBegin);
      }
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
    } else if (life.phase === 'evening') info('There are no more plans to arrange this evening.');
    button('Close', callbacks.close);
  }
  layout.append(phone,panel); frame.append(layout); root.replaceChildren(frame);
  if (active && !s.introShown) callbacks.shown({ type: 'social46_intro_shown' });
  else if (active && !s.response && s.pending && !s.pending.committed && s.pending.lastShownDay !== life.day) callbacks.shown({ type: 'social46_offer_shown', id: s.pending.id });
  if (active && s.response && !s.response.shown) callbacks.shown({ type: 'social46_response_shown', id: s.response.id });
  if (active && s.response?.reply && !s.response.reply.shown) callbacks.shown({ type: 'social46_response_reply_shown', id: s.response.id });
  if (active && s.pending?.committed && s.pending.ackShownDay !== life.day) callbacks.shown({ type: 'social46_ack_shown', id: s.pending.id });
  if (active && s.pending?.committed && !s.pending.seatingConfirmed && s.pending.floorPromptDay !== life.day) callbacks.shown({ type: 'social46_floor_shown', id: s.pending.id });
  if (active) actions.querySelector('button')?.focus({ preventScroll: true });
}
