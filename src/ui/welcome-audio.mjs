// One gesture-activated owner for the welcome's injected, locally bundled audio.
// No asset is selected here. The caller owns route and utility-overlay policy.
export function createWelcomeAudio({ source, onState = () => {}, audioContext = () => new AudioContext(), createMedia = () => document.createElement('audio') }) {
  let context, media, envelopeGain, sceneGain, node, timer, fadeTimer, enabled = false, disposed = false, generation = 0;
  let playQueue = Promise.resolve();
  let place = 'opening';
  const pauses = new Set();
  const envelope = time => time < 3 ? Math.max(0, time / 3) : time < 27 ? 1 : Math.max(0, (30 - time) / 3);
  function stopTimer() { if (timer !== undefined) clearInterval(timer); timer = undefined; }
  function hold(param) {
    const now = context.currentTime;
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else { param.cancelScheduledValues(now); param.setValueAtTime(param.value, now); }
  }
  function init() {
    if (context) return;
    if (!source) throw new Error('No welcome audio source is available');
    context = audioContext(); media = createMedia(); media.preload = 'none'; media.src = source;
    envelopeGain = context.createGain(); sceneGain = context.createGain();
    envelopeGain.gain.value = 0; sceneGain.gain.value = place === 'naming' ? .25 : place === 'opening' ? 1 : 0;
    node = context.createMediaElementSource(media); node.connect(envelopeGain); envelopeGain.connect(sceneGain); sceneGain.connect(context.destination);
  }
  function tick() {
    if (!media || media.paused || !enabled || pauses.size || disposed) return;
    if (media.currentTime >= 30) media.currentTime = 0;
    hold(envelopeGain.gain); envelopeGain.gain.setValueAtTime(.55 * envelope(media.currentTime), context.currentTime);
  }
  function cancelFade() { if (fadeTimer !== undefined) clearTimeout(fadeTimer); fadeTimer = undefined; }
  function play() {
    const token = ++generation;
    cancelFade();
    const run = async () => { try {
      init(); await context.resume();
      if (token !== generation || !enabled || pauses.size || disposed) return;
      await media.play();
      if (token !== generation || !enabled || pauses.size || disposed) { media.pause(); return; }
      stopTimer(); tick(); timer = setInterval(tick, 100); onState('playing');
    } catch (error) { if (token === generation && !disposed) { enabled = false; onState('unavailable', error); } } };
    playQueue = playQueue.catch(() => {}).then(run); return playQueue;
  }
  function stop(fade = false) {
    const token = ++generation; cancelFade(); stopTimer();
    if (fade && context && media && !media.paused && context.state === 'running') {
      hold(envelopeGain.gain); envelopeGain.gain.linearRampToValueAtTime(0, context.currentTime + 1);
      fadeTimer = setTimeout(() => { fadeTimer = undefined; if (token === generation) { media.pause(); void context.suspend(); } }, 1000);
    } else { media?.pause(); if (context) void context.suspend(); }
  }
  return {
    async setEnabled(value) { if (disposed) return; enabled = Boolean(value); if (enabled && !pauses.size) await play(); else if (!enabled) { stop(true); onState('off'); } },
    transition(next) { place = next; if (!context || disposed) return; hold(sceneGain.gain); sceneGain.gain.linearRampToValueAtTime(next === 'opening' ? 1 : next === 'naming' ? .25 : 0, context.currentTime + 1); },
    pause(reason) { if (disposed) return; pauses.add(reason); stop(reason === 'modal'); },
    resume(reason) { pauses.delete(reason); if (!disposed && enabled && !pauses.size) void play(); },
    dispose() { if (disposed) return; disposed = true; enabled = false; stop(); if (media) { media.removeAttribute('src'); media.load(); } node?.disconnect(); envelopeGain?.disconnect(); sceneGain?.disconnect(); if (context) void context.close(); },
  };
}
