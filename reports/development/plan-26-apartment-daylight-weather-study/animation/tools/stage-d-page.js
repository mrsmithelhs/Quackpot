// Plan 26 Stage D review tool (NOT runtime): in-page probes injected by stage-d-cdp.mjs into animation/gallery.html. Defines window.__sd.
// Real-time only: nothing here seeks or holds an animation. Frame intervals are requestAnimationFrame cadence, which is NOT compositor or GPU cost.
(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const q = (sorted, p) => (sorted.length ? +sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))].toFixed(2) : null);
  const summarize = frames => { const s = [...frames].sort((a, b) => a - b); return { frames: frames.length, medianMs: q(s, .5), p95Ms: q(s, .95), maxMs: s.length ? +s.at(-1).toFixed(2) : null, over25ms: frames.filter(f => f > 25).length, over50ms: frames.filter(f => f > 50).length }; };
  const states = () => Object.fromEntries([...window.__p26m.scenes.values()].map(i => { const s = i.ctl.state(); return [i.id, `${s.phase}:${s.blockers.join('+') || '-'}:anims${s.animations}:pending${s.visibilityPending ? 1 : 0}`]; }));

  window.__sd = {
    states,
    env() { return { vp: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, ua: navigator.userAgent, cores: navigator.hardwareConcurrency, vis: document.visibilityState, focus: document.hasFocus(), look: window.__p26m.state.look, reducedMedia: matchMedia('(prefers-reduced-motion: reduce)').matches }; },

    /** Build the scene(s) for a cell, wait until every observer has reported (no pending visibility), then run or hold the motion. */
    async setup({ show, selected, stage = 'wide', framing = 'wide', still = false }) {
      const m = window.__p26m;
      await m.set('show', show); await m.set('selected', selected); await m.set('stage', stage); await m.set('framing', framing);
      window.scrollTo(0, 0); document.querySelector('.stage').scrollIntoView({ block: 'start' });
      const t0 = performance.now();
      while (performance.now() - t0 < 8000 && [...m.scenes.values()].some(i => i.ctl.state().visibilityPending)) await sleep(100);
      for (const i of m.scenes.values()) { if (still) i.ctl.stop(); else i.ctl.start(); }
      await sleep(400);
      return { waitedMs: Math.round(performance.now() - t0), states: states() };
    },

    /** A fixed window: rAF intervals, long tasks, heap, and how far the document timeline and a running animation advanced against wall-clock time. */
    async measure(ms) {
      const frames = [], longTasks = []; let po = null;
      try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) longTasks.push(Math.round(e.duration)); }); po.observe({ entryTypes: ['longtask'] }); } catch { po = null; }
      const heap0 = performance.memory ? performance.memory.usedJSHeapSize : null, tl0 = document.timeline.currentTime, w0 = performance.now();
      const anim = (document.getAnimations().find(a => a.playState === 'running') || null), at0 = anim ? anim.currentTime : null;
      let last = null;
      await new Promise(res => { const step = ts => { if (last !== null) frames.push(ts - last); last = ts; if (ts - w0 < ms) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); setTimeout(res, ms + 2500); });
      if (po) po.disconnect();
      const wall = performance.now() - w0, tl = document.timeline.currentTime - tl0, running = document.getAnimations().filter(a => a.playState === 'running').length;
      return {
        windowMs: Math.round(wall), ...summarize(frames), framesPerSecond: +(frames.length / (wall / 1000)).toFixed(1),
        longTasksSupported: !!po, longTasks: longTasks.length, longTaskMsTotal: longTasks.reduce((a, b) => a + b, 0),
        timelineAdvancedMs: Math.round(tl), timelineVsWall: +(tl / wall).toFixed(3), runningAnimationsAtEnd: running, runningAnimationMovedMs: anim && at0 !== null ? Math.round(((anim.currentTime - at0) + 1e6) % 1e6) : null,
        heapMB: heap0 === null ? null : { start: +(heap0 / 1e6).toFixed(1), end: +(performance.memory.usedJSHeapSize / 1e6).toFixed(1) },
        states: states(), vis: document.visibilityState, focus: document.hasFocus()
      };
    },

    /**
     * ONE real-time host-triggered pulse on `id`, observed through natural completion. A rAF sampler reads the overlays' computed opacity every frame from
     * 400 ms before the request until 500 ms after the ticket settles. Then ONE refused request (cooldown) to show no second flash. No retry, no repeat.
     */
    async pulse(id, totalMs = 3000) {
      const m = window.__p26m, ctl = m.scenes.get(id).ctl, root = m.scenes.get(id).root, series = []; let stop = false, reqAt = null;
      const base = performance.now();
      const loop = ts => {
        const t = ts - base, tg = ctl.flashTargets();
        series.push({ t: +t.toFixed(2), op: tg.map(el => +(+getComputedStyle(el).opacity).toFixed(4)), nodes: root.querySelectorAll('[data-p26-flash]').length, flashActive: ctl.state().flashActive });
        if (!stop) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      await sleep(400);
      const stateBefore = ctl.state(); reqAt = performance.now();
      const ticket = ctl.requestFlash({ requester: 'stage-d-real-time' });
      const acceptedAt = performance.now() - base, out = { status: ticket.status, reason: ticket.reason || null };
      if (ticket.status === 'accepted') {
        const outcome = await Promise.race([ticket.done, sleep(4000).then(() => 'no outcome within 4000 ms')]);
        out.outcome = outcome; out.settledAfterRequestMs = +(performance.now() - reqAt).toFixed(1);
      }
      await sleep(500);
      const again = ctl.requestFlash({ requester: 'stage-d-after-finish' });
      out.requestRightAfterSettle = again.status === 'accepted' ? 'ACCEPTED (unexpected second pulse)' : `${again.reason} (retry in ${Math.ceil(again.retryAfterMs || 0)} ms)`;
      const waitMore = Math.max(0, totalMs - (performance.now() - base)); if (waitMore > 0) await sleep(waitMore);
      stop = true; await sleep(50);
      const rel = series.map(s => ({ ...s, t: +(s.t - (reqAt - base)).toFixed(2) }));            // time relative to the request
      const after = rel.filter(s => s.t >= 0), max = (k) => after.reduce((b, s) => (s.op[k] !== undefined && s.op[k] > b.v ? { v: s.op[k], t: s.t } : b), { v: 0, t: null });
      const firstVisible = after.find(s => s.op.some(o => o > 0.01)), peak = after.reduce((b, s) => (Math.max(0, ...s.op) > b.v ? { v: Math.max(0, ...s.op), t: s.t } : b), { v: 0, t: null });
      const afterPeak = after.filter(s => s.t >= (peak.t ?? 0)), sceneZero = afterPeak.find(s => (s.op[0] ?? 0) <= 0.001), windowZero = afterPeak.find(s => (s.op[1] ?? 0) <= 0.001), nodesGone = after.find(s => s.nodes === 0 && s.t > 0);
      const during = after.filter(s => s.t <= (out.settledAfterRequestMs || 0)), iv = during.slice(1).map((s, i) => s.t - during[i].t);
      const stale = rel.filter(s => s.t > (out.settledAfterRequestMs || 0) + 50 && (s.nodes > 0 || s.flashActive));
      return {
        ...out, acceptedAtMsOfWindow: +acceptedAt.toFixed(1), stateBeforeRequest: `${stateBefore.phase}:${stateBefore.blockers.join('+') || '-'}`,
        timing: {
          firstVisibleAfterRequestMs: firstVisible ? firstVisible.t : null, peakOpacity: peak.v, peakAtMs: peak.t, sceneFlashZeroAtMs: sceneZero ? sceneZero.t : null, windowZeroAtMs: windowZero ? windowZero.t : null,
          windowTailAfterSceneZeroMs: sceneZero && windowZero ? +(windowZero.t - sceneZero.t).toFixed(1) : null, overlayNodesGoneAtMs: nodesGone ? nodesGone.t : null
        },
        framesFromRequestToSettle: during.length, frameIntervalsDuringPulse: summarize(iv),
        staleOverlayFramesAfterSettle: stale.length, overlayNodesAtEnd: root.querySelectorAll('[data-p26-flash]').length, flashActiveAtEnd: ctl.state().flashActive,
        arbiter: m.arbiter.snapshot(), series: rel
      };
    },

    /** Request one flash and report only the refusal reason (never starts a pulse when a blocker applies). Reports an unexpected acceptance loudly. */
    probeRefusal(id) { const t = window.__p26m.scenes.get(id).ctl.requestFlash({ requester: 'stage-d-refusal-probe' }); return t.status === 'accepted' ? 'ACCEPTED (unexpected)' : t.reason; }
  };
})();
