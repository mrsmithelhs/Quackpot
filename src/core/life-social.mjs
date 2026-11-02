// Plan 46 social policy. This module does not own a clock, balances, storage, or DOM.
// It is activated explicitly; existing life histories retain their original shape.
import { transitionDoorIntro } from './life-social-door.mjs';
import { renGraphNode, REN_RESPONSE_LINES } from './life-social-dialogue.mjs';
export const SOCIAL_46_VERSION = 1;

export function social46SceneSetting(scene) {
  if (scene.dialogueVersion === 1) return renGraphNode(scene.activity, scene.node, scene.seating, scene.hasUncommunicatedBreak)?.setting ?? scene.seating;
  return scene.activity === 'game' && scene.stage === 'scene' && scene.beat === 0 ? 'door' : scene.seating;
}

export function social46When(day, atDay) {
  if (!Number.isSafeInteger(day) || !Number.isSafeInteger(atDay)) return 'the planned evening';
  const delta = day - atDay;
  if (delta === 0) return 'this evening';
  if (delta === 1) return 'tomorrow evening';
  if (delta > 1) return `in ${delta} evenings`;
  return 'the planned evening';
}

export function social46DisplayText(kind, activity, day, beat = 0, atDay = day, seating = null) {
  if (kind === 'introduction') return 'Ren: oh. hi. i’m ren, down the hall. we keep passing each other, figured i’d say hi before it got weird.';
  if (kind === 'invitation' && Number.isSafeInteger(day) && day >= 1 && ['door', 'game', 'repair'].includes(activity))
    return `Ren: i could come by ${social46When(day, atDay)} for ${activity === 'game' ? 'a game' : activity === 'repair' ? 'a little fix-it time' : 'a chat'}. no pressure.`;
  if (kind === 'suggestion_response' && Number.isSafeInteger(day) && day >= 1 && ['door', 'game'].includes(activity))
    return `Ren: ${activity === 'game' ? 'a game' : 'a chat'} could work ${social46When(day, atDay)}. want to make that the plan?`;
  if (kind === 'scene' && ['door', 'game', 'repair'].includes(activity) && Number.isInteger(beat) && beat >= 0 && beat < 3) {
    if (activity === 'game' && seating === 'couch' && beat === 1) return 'Ren: i dressed for a pajama game night. comfort is a competitive advantage.';
    const lines = {
      door: ['Ren: hey. good to see you. how’s the duck doing?', 'Ren: still supervising the whole apartment? tough job for a duck.', 'Ren: i should get going. glad we had a minute.'],
      game: ['Ren: glad we could do this. i brought the game.', 'Ren: i remember the rules being simpler than this. possibly because i was winning.', 'Ren: good game. we should do that again sometime.'],
      repair: ['Ren: hey. thanks for asking me over.', 'Ren: we can take a little time and figure it out together.', 'Ren: there. not a miracle, but a start.'],
    };
    return lines[activity][beat];
  }
  if (kind === 'sale_disclosure' && Number.isSafeInteger(day) && day >= 1) return `Game night with Ren ${social46When(day, atDay)} was planned for the couch. Selling it changes the seating.`;
  if (kind === 'accepted' && Number.isSafeInteger(day) && day >= 1) return `Ren: cool. ${social46When(day, atDay)}. i’ll knock.`;
  if (kind === 'floor_reconfirmation' && Number.isSafeInteger(day) && day >= 1) return `The couch is gone. Game night with Ren ${social46When(day, atDay)} can use floor seating instead.`;
  if (kind === 'conflict_notice' && Number.isSafeInteger(day) && day >= 1) return `You have a plan with Ren ${social46When(day, atDay)}. Tell Ren you can’t make it? Choose Cancel for more choices.`;
  if (kind === 'conflict_continue') return 'Continue anyway? Your plan with Ren will not be kept, and Ren will not be told. Choose Cancel to go back.';
  if (kind === 'response_declined') return 'Ren: all good. another time.';
  if (kind === 'response_notice') return 'Ren: okay. thanks for telling me. another time.';
  if (kind === 'response_broken') return 'Ren: didn’t see you. let me know if another time works.';
  return null;
}

const fail = reason => ({ ok: false, reason });
const active = life => life.social46;
const slotEligible = (life, day) => Number.isInteger(day) && day >= life.day
  && (life.social46.lastVisitDay === null || day >= life.social46.lastVisitDay + 2);
const blocked = life => life.rent.status === 'due' || (life.rent.status === 'overdue' && !life.rentSurfaced)
  || Boolean(life.recovery || life.work || life.story47);
const event = (record, type, payload) => record(type, payload);

// Close only a shown/replied/committed opportunity. An unseen candidate is discarded
// without aging history or resetting the consecutive shown-unanswered streak.
function closeOpportunity(life, outcome, record) {
  const s = active(life), offer = s.pending;
  if (!offer) return;
  if (!offer.shown && !offer.replied && !offer.committed) { s.pending = null; return; }
  s.history.push({ id: offer.id, outcome });
  if (s.history.length > 6) s.history.shift();
  s.unanswered = outcome === 'unanswered' ? s.unanswered + 1 : 0;
  const before = s.relationship;
  if (outcome === 'broken' && (before === 'drifting' || before === 'reconnecting')) {
    s.relationship = 'strained';
  } else if (before === 'connected' && (s.history.filter(item => item.outcome === 'broken').length >= 2 || s.unanswered >= 3)) {
    s.relationship = 'drifting';
  }
  if (s.relationship !== before) s.initiativeEpoch = life.day + 1;
  if (['declined', 'notice', 'broken'].includes(outcome)) s.response = { id: offer.id, kind: `response_${outcome}`, shown: false };
  if (outcome === 'broken') event(record, 'social46_outcome', { id: offer.id, outcome: 'plan_not_kept', day: life.day });
  else if (outcome === 'unanswered') event(record, 'social46_outcome', { id: offer.id, outcome: 'invitation_expired', day: life.day });
  s.pending = null;
}

export function social46Conflict(life, intent) {
  const s = active(life), p = s?.pending;
  if (!p?.committed || life.day !== p.day) return false;
  // The next-play transaction can arrive in the target Evening and consume its
  // anchor immediately; merely advancing into that Evening does not.
  if (life.phase === 'afternoon' && intent?.type === 'phone_commit_next') return true;
  if (life.phase !== 'evening') return false;
  return ['advance', 'late_night', 'extend_session', 'phone_commit', 'phone_commit_next',
    'agree_work', 'agree_work_story47', 'begin_activity47', 'leisure'].includes(intent?.type);
}

// Called inside the life resolver before committing a conflicting intent. The caller
// must stage any additional draw/race outcome with this transition as one transaction.
export function prepareSocial46(life, intent, record) {
  const s = active(life);
  if (!s) return null;
  if (s.scene && !['social46_scene_shown', 'social46_scene_next', 'social46_complete', 'social46_dismiss'].includes(intent.type)) {
    return fail('social_scene_pending');
  }
  if (social46Conflict(life, intent)) {
    if (!s.pending.seatingConfirmed) return fail('social_reconfirmation_required');
    if (intent.socialConflict !== 'continue') return fail('social_conflict');
    event(record, 'social46_action', { kind: 'continue_anyway', id: s.pending.id });
    closeOpportunity(life, 'broken', record);
  }
  return null;
}

export function social46PhaseExit(life, record) {
  const p = active(life)?.pending;
  if (!p || p.day !== life.day || life.phase !== 'evening') return;
  if (p.committed) closeOpportunity(life, 'broken', record);
  else closeOpportunity(life, p.shown && !p.replied ? 'unanswered' : 'neutral', record);
}

export function social46ForcedRecovery(life, record) {
  const p = active(life)?.pending;
  if (p?.committed && p.day === life.day && life.phase === 'evening') closeOpportunity(life, 'recovery_exempt', record);
}

// Returns null for non-social intents, otherwise a result for the owning resolver.
export function transitionSocial46(life, intent, record, hp) {
  if (!intent.type.startsWith('social46_')) return null;
  if (intent.type === 'social46_activate') {
    if (active(life) || intent.version !== SOCIAL_46_VERSION || ![1, 2].includes(intent.revision) || life.day < 2 || blocked(life) || life.session) return fail('social_activation_unavailable');
    life.social46 = { version: SOCIAL_46_VERSION, revision: intent.revision, relationship: 'connected', initiativeEpoch: life.day,
      nextId: 1, history: [], unanswered: 0, lastVisitDay: null, lastOfferedDay: null, pending: null, scene: null, response: null,
      introShown: false, couchContext: false };
    if (intent.revision === 2) life.social46.intro = { knockDay: null, ignoredDay: null, node: null, open: false, shown: [], numberShared: false };
    return { ok: true };
  }
  const s = active(life);
  if (!s || s.version !== SOCIAL_46_VERSION || ![1, 2].includes(s.revision)) return fail('social_not_active');
  if (s.revision === 2) {
    const result = transitionDoorIntro(life, intent, record);
    if (result) return result;
    if (intent.type === 'social46_intro_shown') return fail('social_intro_unavailable');
  }
  switch (intent.type) {
    case 'social46_intro_shown':
      if (s.introShown || blocked(life) || s.scene) return fail('social_intro_unavailable');
      s.introShown = true;
      event(record, 'social46_display', { kind: 'introduction', id: 'intro', text: social46DisplayText('introduction') });
      return { ok: true };
    case 'social46_offer': {
      if (!s.introShown || s.pending || s.scene || s.lastOfferedDay === life.day || blocked(life) || life.phase !== 'evening'
        || !slotEligible(life, intent.day) || (intent.day === life.day && life.anchor) || !['ren', 'player'].includes(intent.initiator)
        || !['door', 'game', 'repair'].includes(intent.activity)) return fail('social_offer_unavailable');
      if (intent.initiator === 'ren' && (s.relationship === 'strained'
        || (['drifting', 'reconnecting'].includes(s.relationship) && (intent.day - s.initiativeEpoch) % 2 !== 0))) return fail('social_initiative_unavailable');
      if (intent.activity === 'repair' && !['drifting', 'strained'].includes(s.relationship)) return fail('social_repair_unavailable');
      s.pending = { id: `ren-${s.nextId++}`, day: intent.day, initiator: intent.initiator,
        activity: intent.activity, shown: false, replied: false, committed: false, rescheduled: false, seatingConfirmed: true };
      s.lastOfferedDay = life.day;
      return { ok: true };
    }
    case 'social46_offer_shown': {
      const p = s.pending;
      if (!p || p.lastShownDay === life.day || p.id !== intent.id || blocked(life) || s.scene) return fail('social_offer_not_pending');
      p.shown = true; p.lastShownDay = life.day;
      const kind = p.suggested ? 'suggestion_response' : 'invitation';
      event(record, 'social46_display', { kind, id: p.id, day: p.day, atDay: life.day, activity: p.activity, text: social46DisplayText(kind, p.activity, p.day, 0, life.day) });
      return { ok: true };
    }
    case 'social46_suggest_activity': {
      const p = s.pending;
      if (s.revision !== 2 || blocked(life) || s.scene || !p || p.id !== intent.id || !p.shown || p.replied || p.committed || p.suggested || p.initiator !== 'ren' || !['door', 'game'].includes(p.activity) || !['door', 'game'].includes(intent.activity) || p.activity === intent.activity || !slotEligible(life, p.day) || (p.day === life.day && life.anchor)) return fail('social_suggestion_unavailable');
      const previousActivity = p.activity;
      event(record, 'social46_action', { kind: 'suggest_activity', id: p.id, previousActivity, activity: intent.activity, day: p.day });
      p.activity = intent.activity; p.initiator = 'player'; p.suggested = true; p.replied = true;
      p.shown = false; p.lastShownDay = null; s.unanswered = 0;
      return { ok: true };
    }
    case 'social46_reply': {
      const p = s.pending;
      if (!p || !p.shown || p.id !== intent.id || p.committed || !['accept', 'decline', 'reschedule'].includes(intent.choice)) return fail('social_reply_unavailable');
      if (intent.choice === 'reschedule' && !p.rescheduled && (!slotEligible(life, intent.day) || intent.day <= p.day)) return fail('invalid_reschedule');
      p.replied = true; s.unanswered = 0;
      event(record, 'social46_action', { kind: 'reply', id: p.id, choice: intent.choice, day: p.day,
        ...(intent.choice === 'reschedule' && !p.rescheduled ? { newDay: intent.day } : {}) });
      if (intent.choice === 'decline' || (intent.choice === 'reschedule' && p.rescheduled)) closeOpportunity(life, 'declined', record);
      else if (intent.choice === 'reschedule') {
        p.day = intent.day; p.rescheduled = true; p.shown = false; p.lastShownDay = null;
      } else p.committed = true;
      return { ok: true };
    }
    case 'social46_cancel':
      if (!s.pending?.committed || s.pending.id !== intent.id) return fail('social_plan_not_pending');
      event(record, 'social46_action', { kind: 'notice', id: s.pending.id });
      closeOpportunity(life, 'notice', record); return { ok: true };
    case 'social46_reschedule_plan': {
      const p = s.pending;
      if (!p?.committed || p.id !== intent.id || p.rescheduled || !p.seatingConfirmed || !slotEligible(life, intent.day) || intent.day <= p.day) return fail('social_reschedule_unavailable');
      event(record, 'social46_action', { kind: 'reply', id: p.id, choice: 'reschedule', day: p.day, newDay: intent.day });
      p.day = intent.day; p.rescheduled = true; p.replied = true; p.committed = false; p.shown = false; p.lastShownDay = null; p.ackShownDay = null;
      s.unanswered = 0;
      return { ok: true };
    }
    case 'social46_confirm_floor':
      if (!s.pending?.committed || s.pending.id !== intent.id || s.pending.seatingConfirmed || !s.pending.floorPromptShown) return fail('social_floor_not_pending');
      s.pending.seatingConfirmed = true;
      event(record, 'social46_action', { kind: 'confirm_floor', id: s.pending.id }); return { ok: true };
    case 'social46_ack_shown':
      if (!s.pending?.committed || s.pending.id !== intent.id || s.pending.ackShownDay === life.day) return fail('social_ack_unavailable');
      s.pending.ackShownDay = life.day;
      event(record, 'social46_display', { kind: 'accepted', id: s.pending.id, day: s.pending.day, atDay: life.day, text: social46DisplayText('accepted', null, s.pending.day, 0, life.day) });
      return { ok: true };
    case 'social46_floor_shown':
      if (!s.pending?.committed || s.pending.id !== intent.id || s.pending.seatingConfirmed || s.pending.floorPromptDay === life.day) return fail('social_floor_unavailable');
      s.pending.floorPromptShown = true; s.pending.floorPromptDay = life.day;
      event(record, 'social46_display', { kind: 'floor_reconfirmation', id: s.pending.id, day: s.pending.day, atDay: life.day, text: social46DisplayText('floor_reconfirmation', null, s.pending.day, 0, life.day) });
      return { ok: true };
    case 'social46_sale_shown':
      if (!s.couchContext || !s.pending?.committed || s.pending.activity !== 'game' || s.pending.id !== intent.id || s.pending.saleDisclosureDay === life.day || life.sold.includes('couch')) return fail('social_sale_disclosure_unavailable');
      s.pending.saleDisclosureDay = life.day;
      event(record, 'social46_display', { kind: 'sale_disclosure', id: s.pending.id, day: s.pending.day, atDay: life.day, text: social46DisplayText('sale_disclosure', null, s.pending.day, 0, life.day) });
      return { ok: true };
    case 'social46_conflict_shown': {
      const p = s.pending;
      if (!p?.committed || p.id !== intent.id || !p.seatingConfirmed || !['conflict_notice', 'conflict_continue'].includes(intent.kind)) return fail('social_conflict_display_unavailable');
      event(record, 'social46_display', { kind: intent.kind, id: p.id, day: p.day, atDay: life.day, text: social46DisplayText(intent.kind, null, p.day, 0, life.day) });
      return { ok: true };
    }
    case 'social46_response_shown':
      if (!s.response || s.response.id !== intent.id || s.response.shown) return fail('social_response_unavailable');
      s.response.shown = true;
      event(record, 'social46_display', { kind: s.response.kind, id: s.response.id, text: social46DisplayText(s.response.kind) });
      return { ok: true };
    case 'social46_response_dismiss':
      if (!s.response || s.response.id !== intent.id || !s.response.shown || (s.response.reply && !s.response.reply.shown)) return fail('social_response_not_shown');
      s.response = null; return { ok: true };
    case 'social46_response_reply': {
      const r = s.response;
      if (s.revision !== 2 || !r || r.id !== intent.id || !r.shown || r.reply || !Object.hasOwn(REN_RESPONSE_LINES[r.kind] ?? {}, intent.choice)) return fail('social_response_reply_unavailable');
      r.reply = { choice: intent.choice, shown: false };
      event(record, 'social46_action', { kind: 'response_reply', id: r.id, response: r.kind, choice: intent.choice }); return { ok: true };
    }
    case 'social46_response_reply_shown': {
      const r = s.response;
      if (s.revision !== 2 || !r || r.id !== intent.id || !r.reply || r.reply.shown) return fail('social_response_reply_unavailable');
      r.reply.shown = true;
      event(record, 'social46_display', { kind: 'response_reply', id: r.id, response: r.kind, choice: r.reply.choice, text: REN_RESPONSE_LINES[r.kind][r.reply.choice] }); return { ok: true };
    }
    case 'social46_begin': {
      const p = s.pending;
      if (intent.dialogueVersion !== undefined && (s.revision !== 2 || intent.dialogueVersion !== 1)) return fail('social_dialogue_version');
      if (!p?.committed || p.id !== intent.id || p.day !== life.day || life.phase !== 'evening' || life.anchor
        || life.work || life.story47 || blocked(life) || !life.meals[`d${life.day}-dinner`] || !p.seatingConfirmed) return fail('social_visit_unavailable');
      life.anchor = p.id;
      s.scene = { id: p.id, activity: p.activity, stage: 'scene', beat: 0, shown: false,
        seating: p.activity === 'game' ? (life.sold.includes('couch') ? 'floor' : 'couch') : 'door' };
      if (intent.dialogueVersion === 1) Object.assign(s.scene, { dialogueVersion: 1, node: 's0', hasUncommunicatedBreak: s.history.some(item => item.outcome === 'broken') });
      return { ok: true };
    }
    case 'social46_scene_shown':
      if (!s.scene || s.scene.id !== intent.id || s.scene.stage !== 'scene' || s.scene.shown) return fail('social_scene_unavailable');
      s.scene.shown = true;
      {
        const seating = social46SceneSetting(s.scene);
        const graph = s.scene.dialogueVersion === 1 && renGraphNode(s.scene.activity, s.scene.node, s.scene.seating, s.scene.hasUncommunicatedBreak);
        if (s.scene.dialogueVersion === 1 && !graph) return fail('social_dialogue_node');
        event(record, 'social46_display', graph ? { kind: 'graph_line', id: s.scene.id, activity: s.scene.activity, seating, node: s.scene.node, text: graph.text } : { kind: 'scene', id: s.scene.id, activity: s.scene.activity, seating, beat: s.scene.beat, text: social46DisplayText('scene', s.scene.activity, null, s.scene.beat, null, seating) });
      }
      return { ok: true };
    case 'social46_scene_next':
      if (s.scene?.dialogueVersion === 1) {
        const scene = s.scene, graph = renGraphNode(scene.activity, scene.node, scene.seating, scene.hasUncommunicatedBreak);
        const selected = graph?.choices.find(item => item.id === intent.choice && item.next);
        if (scene.id !== intent.id || scene.stage !== 'scene' || !scene.shown || !selected) return fail('social_scene_not_ready');
        event(record, 'social46_action', { kind: 'graph_choice', id: scene.id, activity: scene.activity, node: scene.node, choice: selected.id });
        scene.node = selected.next; scene.shown = false; return { ok: true };
      }
      if (!s.scene || s.scene.id !== intent.id || s.scene.stage !== 'scene' || !s.scene.shown || s.scene.beat >= 2) return fail('social_scene_not_ready');
      event(record, 'social46_action', { kind: 'scene_next', id: s.scene.id, beat: s.scene.beat });
      s.scene.beat++; s.scene.shown = false; return { ok: true };
    case 'social46_complete': {
      const scene = s.scene;
      const graph = scene?.dialogueVersion === 1 && renGraphNode(scene.activity, scene.node, scene.seating, scene.hasUncommunicatedBreak);
      if (!scene || scene.id !== intent.id || scene.stage !== 'scene' || !scene.shown || (scene.dialogueVersion === 1 ? !graph?.choices.some(item => item.id === intent.choice && item.next === null) : scene.beat !== 2)) return fail('social_scene_not_shown');
      if (scene.dialogueVersion === 1) event(record, 'social46_action', { kind: 'graph_choice', id: scene.id, activity: scene.activity, node: scene.node, choice: intent.choice });
      hp(5, scene.activity === 'repair' ? 'ren_repair' : 'ren_visit');
      s.lastVisitDay = life.day;
      if (scene.activity === 'game' && scene.seating === 'couch') s.couchContext = true;
      const before = s.relationship;
      if (scene.activity === 'repair' && before === 'strained') s.relationship = 'reconnecting';
      else if ((scene.activity === 'repair' && before === 'drifting') || (scene.activity !== 'repair' && ['drifting', 'reconnecting'].includes(before))) s.relationship = 'connected';
      if (s.relationship !== before && ['connected', 'reconnecting'].includes(s.relationship)) {
        s.history = []; s.unanswered = 0; s.initiativeEpoch = life.day + 1;
      }
      event(record, 'social46_outcome', { kind: 'completed', id: scene.id, activity: scene.activity, seating: scene.seating, day: life.day });
      closeOpportunity(life, 'honored', record);
      scene.stage = 'ack'; return { ok: true };
    }
    case 'social46_dismiss':
      if (!s.scene || s.scene.id !== intent.id || s.scene.stage !== 'ack') return fail('social_ack_not_pending');
      s.scene = null; return { ok: true };
    default: return fail('unknown_social_intent');
  }
}

export function social46CouchSold(life) {
  const s = active(life);
  if (s?.couchContext && s.pending?.committed && s.pending.activity === 'game') s.pending.seatingConfirmed = false;
}

export function social46NeedsSaleDisclosure(life) {
  const s = active(life), p = s?.pending;
  return Boolean(s?.couchContext && p?.committed && p.activity === 'game' && p.saleDisclosureDay !== life.day);
}
