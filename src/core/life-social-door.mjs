// Revision 2: a durable, time-free first meeting at the apartment door.
// IDs and copy are deliberately finite so Receipt projection can validate displayed facts.
export const REN_INTRO_LINES = Object.freeze({
  hello: 'oh. hi. i’m ren, down the hall. we keep passing each other, figured i’d say hi before it got weird.',
  greeting: 'you too. i make and fix things. mostly i just wanted to say hello.',
  reason: 'mostly saying hello. i make and fix things, and figured it’d be nice to know someone nearby.',
  making: 'depends what catches my attention. i like figuring out how things fit together.',
  glad: 'me too. hallway introductions are surprisingly difficult to schedule.',
  number: 'here, write down my number. it’s good to know someone in the building. no pressure to use it.',
  thanks: 'sure. see you around.',
  noted: 'sounds good. see you around.',
  later: 'no problem. another time.',
});
export const REN_INTRO_CHOICES = Object.freeze({
  hello: [['meet', 'Nice to meet you', 'greeting'], ['why', 'What brings you by?', 'reason'], ['later', 'Not a great time', 'later']],
  greeting: [['making', 'What do you like making?', 'making'], ['glad', 'Glad you stopped by', 'glad']],
  reason: [['making', 'What do you like making?', 'making'], ['glad', 'Glad you stopped by', 'glad']],
  making: [['continue', 'Continue', 'number']], glad: [['continue', 'Continue', 'number']],
  number: [['thanks', 'Thanks, Ren', 'thanks'], ['noted', 'I’ll keep that in mind', 'noted']],
  thanks: [['finish', 'See you around', 'finish']], noted: [['finish', 'See you around', 'finish']],
  later: [['close', 'Close the door', 'pause']],
});
const fail = reason => ({ ok: false, reason });
export function transitionDoorIntro(life, intent, record) {
  const s = life.social46, intro = s?.intro;
  if (!s || s.revision !== 2 || !intro) return null;
  const blocked = Boolean(life.recovery || life.work || life.story47 || life.session || life.rent.status === 'due' || (life.rent.status === 'overdue' && !life.rentSurfaced));
  switch (intent.type) {
    case 'social46_knock_shown':
      if (blocked || s.introShown || intro.open || intro.node || intro.ignoredDay === life.day || intro.knockDay === life.day) return fail('ren_knock_unavailable');
      intro.knockDay = life.day;
      record('social46_display', { kind: 'knock', id: 'intro', day: life.day }); return {ok:true};
    case 'social46_knock_ignore':
      if (blocked || s.introShown || intro.knockDay !== life.day || intro.node || intro.ignoredDay === life.day) return fail('ren_knock_unavailable');
      intro.ignoredDay = life.day; record('social46_action', {kind:'knock_ignore',id:'intro',day:life.day}); return {ok:true};
    case 'social46_door_open':
      if (blocked || s.introShown || intro.open || (!intro.node && (intro.knockDay !== life.day || intro.ignoredDay === life.day))) return fail('ren_door_unavailable');
      intro.open = true; if (!intro.node) intro.node = 'hello';
      record('social46_action', {kind:'door_open',id:'intro',day:life.day}); return {ok:true};
    case 'social46_intro_line_shown':
      if (blocked || s.introShown || !intro.open || !REN_INTRO_LINES[intro.node] || intro.shown.includes(intro.node)) return fail('ren_line_unavailable');
      intro.shown.push(intro.node); if (intro.node === 'number') intro.numberShared = true;
      record('social46_display', {kind:'intro_line',id:'intro',node:intro.node,text:REN_INTRO_LINES[intro.node]}); return {ok:true};
    case 'social46_intro_choose': {
      if (blocked || s.introShown || !intro.open || !intro.shown.includes(intro.node)) return fail('ren_reply_unavailable');
      const choice = REN_INTRO_CHOICES[intro.node]?.find(item => item[0] === intent.choice);
      if (!choice) return fail('ren_reply_invalid');
      record('social46_action', {kind:'intro_reply',id:'intro',node:intro.node,choice:choice[0]});
      if (choice[2] === 'finish') { if (!intro.numberShared) return fail('ren_number_not_shared'); s.introShown = true; intro.open = false; }
      else if (choice[2] === 'pause') { intro.open = false; intro.node = 'hello'; }
      else intro.node = choice[2];
      return {ok:true};
    }
    case 'social46_intro_close':
      if (!intro.open || s.introShown) return fail('ren_intro_not_open');
      intro.open = false; record('social46_action', {kind:'intro_close',id:'intro'}); return {ok:true};
    default: return null;
  }
}
