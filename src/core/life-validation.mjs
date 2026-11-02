// Replay life transitions independently from their persisted snapshots.
import { GAME_CONSTANTS } from './game-engine.mjs';
import { initialLife, transitionLife } from './life-progression.mjs';
import { isKnownLifeConfig, POLICY_1_VERSION } from './life-config.mjs';
import { selectWorkStory } from './life-story-content.mjs';
import { TUTORIAL_SHIFT_VERSION, tutorialShiftBlock } from './tutorial-shift.mjs';
import { hasEnteredQuackpot } from './life-entry.mjs';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const UNSUPPORTED_REN_DEVELOPMENT_SAVE = 'Unsupported pre-delivery Ren development snapshot; preserve the original save and use a compatible development revision.';
export const UNSUPPORTED_REN_REVISION = 'Unsupported Ren social revision; preserve the original save and use a compatible revision.';
export function validateLifeHistory(entries, state) {
  const errors = [];
  // Plan 46 was developed on a shared Vite server before its first delivery.
  // Its provisional snapshots are not migrated by guessing displayed copy or
  // scene stages; keep older policy-1 histories without social activation intact.
  const activation = entries.findIndex(e => e.type === 'life_intent' && e.payload?.intent?.type === 'social46_activate');
  if (activation >= 0) {
    const snapshot = entries.slice(activation + 1).find(e => e.type === 'life_transition')?.payload?.life?.social46;
    const eventRevision = entries[activation].payload.intent.revision;
    const savedRevision = snapshot?.revision;
    // Pre-delivery social activations and snapshots both omitted the revision.
    if (snapshot && eventRevision === undefined && savedRevision === undefined && state?.life?.social46?.revision === undefined) return [UNSUPPORTED_REN_DEVELOPMENT_SAVE];
    if (eventRevision !== savedRevision || state?.life?.social46?.revision !== savedRevision) return ['Ren activation revision does not match its saved state'];
    if (eventRevision !== 1) return [UNSUPPORTED_REN_REVISION];
  }
  const start = entries.find(e => e.type === 'run_started');
  if (!start || start.payload.lifePolicyVersion !== POLICY_1_VERSION || !isKnownLifeConfig(start.payload.lifeConfig)) {
    return ['Unknown or missing life policy configuration in run_started'];
  }
  const hasTutorialMarker = Object.hasOwn(start.payload, 'tutorialShiftVersion');
  const tutorialVersion = hasTutorialMarker ? start.payload.tutorialShiftVersion : null;
  if (hasTutorialMarker && tutorialVersion !== TUTORIAL_SHIFT_VERSION) return ['Unknown tutorial shift version in run_started'];
  let life = initialLife();
  let cash = life.config.startCash;
  let health = life.config.startHealth;
  let terminal = false;
  let interruptedWork = null;
  let interruptedSession = null;
  let interruptedActivity = null;
  let interruptedSocial = null;
  let interruptedSocialPlan = null;
  const shownStories = new Set();
  let installed = false;
  let opened = false;
  let invitation = false, replied = false, acknowledged = false;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'action' && e.payload?.kind === 'fictional_install') {
      if (installed || opened || e.payload.app !== 'Quackpot' || hasEnteredQuackpot(entries.slice(0, i))) errors.push(`Invalid fictional installation at ${e.seq}`);
      installed = true;
    }
    if (e.type === 'action' && e.payload?.kind === 'quackpot_opened') {
      if (opened || e.payload.app !== 'Quackpot' || (life.day === 1 && !['evening', 'lateNight'].includes(life.phase)) || hasEnteredQuackpot(entries.slice(0, i))) errors.push(`Invalid first app entry at ${e.seq}`);
      opened = true;
    }
    if (e.type === 'offer_shown' && e.payload?.kind === 'launch_reply_invitation') {
      if (invitation || life.day !== 1 || !['morning', 'afternoon'].includes(life.phase) || e.payload.technique !== 'launch_invitation' || e.payload.launch !== 'day_1_evening') errors.push(`Invalid launch invitation at ${e.seq}`);
      invitation = true;
    }
    if (e.type === 'action' && e.payload?.kind === 'launch_reply') {
      if (!invitation || replied || e.payload.text !== 'LAUNCH') errors.push(`Invalid launch reply at ${e.seq}`);
      replied = true;
    }
    if (e.type === 'cue_shown' && e.payload?.kind === 'launch_reply_acknowledgment') {
      if (!replied || acknowledged) errors.push(`Invalid launch acknowledgment at ${e.seq}`);
      acknowledged = true;
    }
    if (terminal && e.type !== 'receipt_shown') errors.push(`Post-terminal event at ${e.seq}`);
    if ((interruptedWork || interruptedSession || interruptedActivity || interruptedSocial || interruptedSocialPlan) && !terminal && !['work_interrupted', 'session_interrupted', 'activity47_interrupted', 'social46_interrupted', 'social46_plan_interrupted', 'terminal'].includes(e.type)) errors.push(`Event between interruption and terminal at ${e.seq}`);
    if (e.type === 'social46_interrupted') {
      const scene = life.social46?.scene;
      if (interruptedSocial || scene?.stage !== 'scene' || !same(e.payload, { id: scene.id, day: life.day })) errors.push(`Invalid social interruption at ${e.seq}`);
      interruptedSocial = e.payload.id;
    }
    if (e.type === 'social46_plan_interrupted') {
      const social = life.social46, plan = social?.pending;
      if (interruptedSocialPlan || social?.scene || !plan?.committed || !same(e.payload, { id: plan.id, day: plan.day })) errors.push(`Invalid social plan interruption at ${e.seq}`);
      interruptedSocialPlan = e.payload.id;
    }
    if (e.type === 'work_interrupted') {
      if (interruptedWork || !life.work || !same(e.payload, { id: life.work.id, kind: life.work.kind, day: life.day })) errors.push(`Invalid work interruption at ${e.seq}`);
      interruptedWork = e.payload.id;
    }
    if (e.type === 'session_interrupted') {
      if (interruptedSession || !life.session || !same(e.payload, { id: life.session.id, suspended: life.session.suspended, pull: life.session.pull, race: life.session.race })) errors.push(`Invalid session interruption at ${e.seq}`);
      interruptedSession = e.payload.id;
    }
    if (e.type === 'activity47_interrupted') {
      const story = life.story47;
      if (interruptedActivity || story?.kind !== 'activity' || story.stage !== 'scene' || !same(e.payload, { id: story.id, choice: story.choice, day: life.day })) errors.push(`Invalid activity interruption at ${e.seq}`);
      interruptedActivity = e.payload.id;
    }
    if (e.type === 'story47_shown') {
      const story = life.story47;
      let beats = story?.kind === 'work' && story.stage === 'commute' ? [story.story.commute] : story?.kind === 'work' && story.stage === 'work' ? story.story.work : story?.kind === 'activity' && story.stage === 'scene' ? [story.choice] : null;
      const key = `${e.payload.id}/${e.payload.stage}`;
      if (!beats || shownStories.has(key) || !same(e.payload, { id: story.id, stage: story.stage, version: 1, beats })) errors.push(`Invalid story display at ${e.seq}`);
      shownStories.add(key);
    }
    if (e.type === 'terminal') {
      if (life.social46?.scene?.stage === 'scene' && interruptedSocial !== life.social46.scene.id) errors.push('Terminal is missing pending social interruption');
      if (!life.social46?.scene && life.social46?.pending?.committed && interruptedSocialPlan !== life.social46.pending.id) errors.push('Terminal is missing pending social plan interruption');
      if (life.story47?.kind === 'activity' && life.story47.stage === 'scene' && interruptedActivity !== life.story47.id) errors.push('Terminal is missing pending activity interruption');
      if (life.work && interruptedWork !== life.work.id) errors.push('Terminal is missing pending work interruption');
      if (life.session && interruptedSession !== life.session.id) errors.push('Terminal is missing active session interruption');
      terminal = true;
    }
    if (e.type === 'life_intent') {
      if (e.payload.intent?.type === 'sell_after_open' && !hasEnteredQuackpot(entries.slice(0, i))) errors.push(`Sale before first app entry at ${e.seq}`);
      if (['depart_work_story47', 'agree_work_story47'].includes(e.payload.intent?.type)) {
        const expected = selectWorkStory(start.payload.seed, `work-${life.nextId}`);
        if (!same(e.payload.intent.story, expected)) errors.push(`Invalid story selection at ${e.seq}`);
      }
      const story = life.story47;
      if (story && ((e.payload.intent?.type === 'work_story_step' && story.stage === 'commute') || (e.payload.intent?.type === 'complete_work' && story.stage === 'work') || (e.payload.intent?.type === 'complete_activity47' && story.stage === 'scene')) && !shownStories.has(`${story.id}/${story.stage}`)) errors.push(`Story progressed before display at ${e.seq}`);
      const tutorialBlock = tutorialShiftBlock(tutorialVersion, life, e.payload.intent);
      if (tutorialBlock) { errors.push(`Invalid tutorial transition at ${e.seq}: ${tutorialBlock}`); break; }
      const result = transitionLife(life, { cash, health }, e.payload.intent);
      if (!result.ok) { errors.push(`Invalid life intent at ${e.seq}: ${result.reason}`); break; }
      for (let j = 0; j < result.events.length; j++) {
        const actual = entries[i + 1 + j], expected = result.events[j];
        if (!actual || actual.type !== expected.type || !same(actual.payload, expected.payload)) errors.push(`Life effect mismatch after ${e.seq}`);
      }
      const end = entries[i + 1 + result.events.length];
      if (!end || end.type !== 'life_transition' || !same(end.payload, { intent: e.payload.intent, life: result.life, cash: result.cash, health: result.health })) {
        errors.push(`Life transition mismatch after ${e.seq}`); break;
      }
      if (['phone_commit', 'phone_commit_next'].includes(e.payload.intent.type)) {
        const next = entries[i + 2 + result.events.length];
        const expected = e.payload.intent.kind === 'race' ? ['action'] : ['purchase', 'draw_committed'];
        if (!next || !expected.includes(next.type) || (e.payload.intent.kind === 'race' && next.payload.kind !== 'race_choice')) {
          errors.push(`Phone commitment at ${e.seq} has no corresponding outcome commit`);
        }
        if (e.payload.intent.kind === 'pull' && next?.type === 'purchase'
          && (!['single_pull', 'ten_pull'].includes(next.payload.kind) || entries[i + 3 + result.events.length]?.type !== 'draw_committed')) {
          errors.push(`Pull commitment at ${e.seq} has no committed draw`);
        }
      }
      if (e.payload.intent.type === 'phone_commit_next') {
        const at = i + 2 + result.events.length;
        const next = entries[at];
        if (e.payload.intent.kind === 'pull') {
          const paid = next?.type === 'purchase';
          const count = paid ? (next.payload?.kind === 'single_pull' ? 1 : next.payload?.kind === 'ten_pull' ? 10 : 0) : 10;
          const cost = count === 1 ? GAME_CONSTANTS.PULL_SINGLE_COST : GAME_CONSTANTS.PULL_TEN_COST;
          if (paid && (!count || next.payload.cost !== cost || next.payload.price !== 0)) errors.push(`Invalid next-play purchase at ${e.seq}`);
          const first = at + (paid ? 1 : 0);
          const draws = entries.slice(first, first + count);
          if (draws.length !== count || draws.some((draw, index) => draw.type !== 'draw_committed' || draw.payload?.drawIndex !== index + 1 || draw.payload?.of !== count || draw.payload?.advancesPity !== paid) || entries[first + count]?.type === 'draw_committed') errors.push(`Incomplete next-play draw batch at ${e.seq}`);
        } else {
          const outcome = entries[at + 1];
          if (next?.type !== 'action' || next.payload?.kind !== 'race_choice' || !next.payload?.raceId || !['race_result', 'race_attempt_unresolved'].includes(outcome?.type) || outcome.payload?.raceId !== next.payload.raceId || outcome.payload?.duckId !== next.payload.duckId || !outcome.payload?.resolutionDigest || !state.raceResolutions?.[next.payload.raceId]) errors.push(`Missing next-play race outcome at ${e.seq}`);
        }
      }
      life = result.life; cash = result.cash; health = result.health;
      i += result.events.length + 1;
      continue;
    }
    if (e.type === 'life_transition' || e.type.startsWith('life_') || (e.type.startsWith('social46_') && !['social46_interrupted', 'social46_plan_interrupted'].includes(e.type))) errors.push(`Unpaired life event at ${e.seq}`);
    if (e.type === 'purchase' && e.payload.price) cash -= e.payload.price;
    if (e.type === 'reward' && e.payload.cash) cash += e.payload.cash;
    if (e.type === 'income' && e.payload.amount) cash += e.payload.amount;
    if (e.type === 'expense_paid' && e.payload.amount) cash -= e.payload.amount;
    if (e.type === 'escalation_result') {
      cash += e.payload.effects?.cashGained || 0;
      health -= e.payload.effects?.healthLost || 0;
    }
    cash = Math.round(cash * 100) / 100;
  }
  if ((interruptedWork || interruptedSession || interruptedActivity || interruptedSocial || interruptedSocialPlan) && !terminal) errors.push('Interruption evidence requires a terminal event');
  if (!same(life, state.life)) errors.push('Life state does not match replay');
  if (!same(life.sold, state.assetsSold)) errors.push('Sold furnishings do not match life history');
  if (cash !== state.cash || health !== state.health) errors.push('Life balances do not match replay');
  return errors;
}
