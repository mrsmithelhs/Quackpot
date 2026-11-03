import { createDigitalDuckSvg } from '../../../../src/ui/duck-rig-view.mjs';
import { createRaceMotionController } from '../../../../src/ui/race-motion-controller.mjs';
import { fixtures, stateAt } from './fixtures.mjs';

// This is a presentation stand-in, not a production race or an injury contract.
const racers = [
  ['A', 'classic-yellow', 34, 35], ['B', 'mallard-green', 48, 39],
  ['C', 'bubblegum-pink', 67, 29], ['D', 'classic-yellow', 26, 69],
  ['E', 'mallard-green', 54, 68], ['F', 'bubblegum-pink', 75, 65],
];
const options = Object.entries(fixtures).map(([id, fixture]) => `<option value="${id}">${fixture.label}</option>`).join('');
let nextInstance = 0;

export function mount(host, closeup = false) {
  const instance = ++nextInstance;
  host.className = 'study';
  host.innerHTML = `<h2>${closeup ? 'Close-up' : 'Six ducks at race scale'}</h2>
    <div class="controls"><label>Authored scenario<select data-fixture>${options}</select></label>
    <label>Collision cue<select data-cue><option value="burst">Angular burst</option><option value="splash">Paper splash</option><option value="none">No shape</option></select></label>
    <label>White return<select data-duration><option value="0">Off</option><option value="0.5">0.5 seconds</option><option value="1">1 second</option></select></label>
    <label>Injury marker<select data-marker><option value="bandage">Attached bandage</option><option value="tab">Status tab</option><option value="none">Text only</option></select></label>
    <label><input type="checkbox" data-static> Static / reduced motion</label><label><input type="checkbox" data-drama> Drama dimming</label>
    <button data-play type="button">Play</button><button data-reset type="button">Replay</button>
    <label>Time <input data-time type="range" min="0" max="4" step="0.01" value="0"></label></div>
    <div class="stage ${closeup ? 'closeup' : ''}" aria-label="Synthetic race scene"><div class="wall-standin" hidden>Wall</div><div class="collision-layer" aria-hidden="true"></div>${racers.slice(0, closeup ? 2 : 6).map(([id,palette,x,y]) => `<div class="runner" data-id="${id}" style="left:${closeup ? (id === 'A' ? 33 : 70) : x}%;top:${closeup ? 55 : y}%"><div class="orientation"><div class="scope" data-race-runner-scope><div class="contact" data-race-contact-layer><div class="shell" data-duck-motion="paddle" data-duck-prefix="study-${instance}-${id}" data-race-id="${id}">${createDigitalDuckSvg({ prefix: `study-${instance}-${id}`, label: `Duck ${id}`, palette, hat: id === 'C' ? 'sailor-cap' : 'none' })}<img class="bandage" src="../art/adhesive-bandage.svg" alt="" hidden></div></div></div></div><span class="name">Duck ${id} <span data-contact-text aria-hidden="true"></span><span data-status></span></span></div>`).join('')}</div><p class="narrative" aria-live="polite"></p><p>Course and positions are simplified stand-ins. Collision and injury scenarios are separately authored.</p>`;
  const get = name => host.querySelector(`[data-${name}]`);
  const stage = host.querySelector('.stage');
  const runners = [...host.querySelectorAll('.runner')];
  const colors = new WeakMap();
  for (const runner of runners) {
    const root = runner.querySelector('.shell svg > g[id$="-root"]');
    if (root) colors.set(root, Object.fromEntries(['--duck-body-fill','--duck-wing-fill','--duck-wing-mid','--duck-bill-fill'].map(name => [name, root.style.getPropertyValue(name)])));
  }
  const motion = createRaceMotionController(stage, { active: false });
  let motionKey = '';
  let playing = false, raf = 0, last = null;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  function render() {
    const t = Number(get('time').value), fixture = fixtures[get('fixture').value];
    const duration = Number(get('duration').value);
    const still = get('static').checked || media.matches;
    const { injured, contacts } = stateAt(fixture.events, t, duration);
    const nextKey = still ? '' : contacts.map(event => `${event.at}:${event.ids.join(',')}`).join('|');
    if (nextKey !== motionKey) {
      motion.resetContactMotions();
      for (const event of still ? [] : contacts) motion.playContact({ type: event.wall ? 'wall-impact' : 'duck-contact', participants: event.ids });
      motionKey = nextKey;
    }
    stage.classList.toggle('drama', get('drama').checked);
    stage.querySelector('.wall-standin').hidden = fixture !== fixtures.wall;
    const firstCollision = fixture.events.find(event => event.type === 'collision');
    const approach = !still && firstCollision && !firstCollision.wall ? Math.max(0, 1 - Math.abs(t - firstCollision.at) / .8) : 0;
    for (const [index, runner] of runners.entries()) {
      const id = runner.dataset.id, contact = contacts.filter(event => event.ids.includes(id)).at(-1), involved = Boolean(contact);
      // Authored motion is a display stand-in, never a simulated trajectory.
      const drift = still ? 0 : Math.sin(t * 1.5 + index) * 7;
      runner.style.transform = `translate(calc(-50% + ${drift}px), -50%)`;
      const baseX = closeup ? (id === 'A' ? 33 : 70) : racers[index][2];
      const convergence = id === 'A' ? (closeup ? 10 : 3.5) : id === 'B' ? (closeup ? -10 : -3.5) : 0;
      runner.style.left = `${fixture === fixtures.wall && id === 'A' ? 8 : baseX + convergence * approach}%`;
      runner.style.top = `${fixture === fixtures.wall && id === 'A' ? 50 : closeup ? 55 : racers[index][3]}%`;
      for (const animation of runner.getAnimations({ subtree: true })) { animation.pause(); if (contact && !still) animation.currentTime = contact.age * 1000; }
      const shell = runner.querySelector('.shell');
      const white = !still && involved && duration > 0 ? Math.max(0, 1 - contact.age / duration) : 0;
      const root = shell.querySelector('svg > g[id$="-root"]');
      if (root) for (const [name, base] of Object.entries(colors.get(root) ?? {})) root.style.setProperty(name, white ? `color-mix(in srgb, ${base} ${(1 - white) * 100}%, white)` : base);
      shell.querySelector('svg').style.filter = white ? 'drop-shadow(1px 0 #334155) drop-shadow(-1px 0 #334155) drop-shadow(0 1px #334155)' : '';
      const turn = id === 'B' ? 145 : (!still && id === 'C' ? Math.sin(t) * 55 : 0);
      runner.querySelector('.orientation').style.transform = `perspective(180px) rotateY(${turn}deg)`;
      const marker = get('marker').value;
      runner.querySelector('[data-status]').innerHTML = injured.has(id) ? `<span class="status">${marker === 'tab' ? '<img class="tab-icon" src="../art/status-tab-icon.svg" alt=""> ' : ''}Injured</span>` : '';
      runner.querySelector('.bandage').hidden = !injured.has(id) || marker !== 'bandage';
      runner.querySelector('[data-contact-text]').textContent = still && involved ? '✦' : '';
    }
    // Place upright labels inside the stage, choosing the nearest unoccupied slot.
    const bounds = stage.getBoundingClientRect(), occupied = [];
    const labelOrder = [...runners].sort((a, b) => {
      const priority = runner => (injured.has(runner.dataset.id) ? 2 : 0) + (contacts.some(event => event.ids.includes(runner.dataset.id)) ? 1 : 0);
      return priority(b) - priority(a);
    });
    for (const runner of labelOrder) {
      const label = runner.querySelector('.name'), duck = runner.getBoundingClientRect();
      const w = label.offsetWidth, h = label.offsetHeight, desiredX = duck.left + duck.width / 2 - w / 2;
      const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
      const candidates = [];
      for (const y of [duck.top - h, duck.bottom, duck.top - 2 * h, duck.bottom + h]) {
        for (const dx of [0, -w * .7, w * .7, -w * 1.4, w * 1.4]) {
          const left = clamp(desiredX + dx, bounds.left + 2, bounds.right - w - 2);
          const top = clamp(y, bounds.top + 2, bounds.bottom - h - 2);
          const rect = { left, top, right: left + w, bottom: top + h };
          const collision = occupied.some(other => rect.left < other.right + 3 && rect.right + 3 > other.left && rect.top < other.bottom + 3 && rect.bottom + 3 > other.top);
          candidates.push({ ...rect, collision });
        }
      }
      const chosen = candidates.find(item => !item.collision) ?? candidates[0];
      label.style.left = `${chosen.left - duck.left}px`; label.style.top = `${chosen.top - duck.top}px`;
      label.style.bottom = 'auto'; label.style.transform = 'none';
      label.classList.toggle('offset', Math.abs(chosen.left - desiredX) > 10);
      occupied.push(chosen);
    }
    const layer = stage.querySelector('.collision-layer');
    layer.replaceChildren();
    for (const event of get('cue').value === 'none' ? [] : contacts) {
      const participants = runners.filter(runner => event.ids.includes(runner.dataset.id));
      // A cropped view cannot truthfully locate a multi-duck contact with a missing participant.
      if (participants.length !== event.ids.length) continue;
      const stageRect = stage.getBoundingClientRect();
      const centers = participants.map(runner => { const r = runner.getBoundingClientRect(); return { x: r.left + r.width / 2 - stageRect.left, y: r.top + r.height / 2 - stageRect.top, width: r.width }; });
      const art = document.createElement('img'); art.className = 'collision-art'; art.alt = '';
      art.src = `../art/${get('cue').value === 'burst' ? 'impact-burst' : 'paper-splash'}.svg`;
      art.style.left = `${centers.reduce((sum, item) => sum + item.x, 0) / centers.length}px`;
      art.style.top = `${centers.reduce((sum, item) => sum + item.y, 0) / centers.length}px`;
      art.style.width = `${centers[0].width * .8}px`;
      art.style.transform = `translate(-50%, -50%) scale(${still ? 1 : Math.min(1, .55 + event.age * 2)})`;
      layer.append(art);
    }
    const narrative = `${fixture.label}. ${contacts.length ? contacts.map(event => `Contact: ${event.ids.join(' and ')}${event.wall ? ' and wall' : ''}.`).join(' ') : 'No current contact cue.'} Injured: ${[...injured].join(', ') || 'none'}.`;
    const narrativeNode = host.querySelector('.narrative');
    if (narrativeNode.textContent !== narrative) narrativeNode.textContent = narrative;
  }
  function tick(now) {
    if (!playing) return;
    if (last !== null) get('time').value = Math.min(4, Number(get('time').value) + (now - last) / 1000);
    last = now; render();
    if (Number(get('time').value) >= 4) { playing = false; get('play').textContent = 'Play'; return; }
    raf = requestAnimationFrame(tick);
  }
  const onInput = event => {
    if (event.target.matches('[data-time]')) last = null;
    if (event.target.matches('[data-play]')) { playing = !playing; get('play').textContent = playing ? 'Pause' : 'Play'; last = null; if (playing) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); }
    if (event.target.matches('[data-reset]')) { playing = false; cancelAnimationFrame(raf); last = null; get('time').value = 0; get('play').textContent = 'Play'; }
    if (event.target.matches('[data-fixture]')) { playing = false; cancelAnimationFrame(raf); get('time').value = 0; get('play').textContent = 'Play'; }
    render();
  };
  host.addEventListener('input', onInput); host.addEventListener('click', onInput); media.addEventListener('change', render);
  const resizeObserver = new ResizeObserver(() => render());
  resizeObserver.observe(stage);
  render();
  return () => { playing = false; cancelAnimationFrame(raf); resizeObserver.disconnect(); motion.destroy(); host.removeEventListener('input', onInput); host.removeEventListener('click', onInput); media.removeEventListener('change', render); host.replaceChildren(); };
}

const gallery = document.querySelector('#gallery');
for (const closeup of [false, true]) { const section = document.createElement('section'); gallery.append(section); mount(section, closeup); }
