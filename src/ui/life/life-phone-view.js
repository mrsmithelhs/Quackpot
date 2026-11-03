import { mountAppDexNav } from '../app-dex-nav.mjs';

// Quackpot session menu. This is inside the phone, not an apartment clock.
export function renderLifePhoneView(container, engine, callbacks) {
  const life = engine.state.life;
  const session = life.policyVersion==='five-slot-v1' && life.schedule.active?.kind==='session'
    ? {pull:life.schedule.active.pullUsed,race:life.schedule.active.raceUsed} : life.session;
  const pending = engine.state.pendingReveals.some(draw => !draw.revealed);
  container.innerHTML = `<section class="gacha-container life-phone-hub" aria-labelledby="life-phone-title">
    <div class="gacha-banner-card"><div class="gacha-banner-header"><div class="banner-tag">Quackpot</div>
      <h2 id="life-phone-title">Pond of Destiny</h2><p class="banner-sub">Collect your flock. Take to the pond.</p>
      <p class="life-phone-allowance">This session: <strong>Pull ${session?.pull ? 'complete' : 'ready'}</strong><span aria-hidden="true"> · </span><strong>Race ${session?.race ? 'complete' : 'ready'}</strong></p>
      ${life.phase === 'lateNight' ? `<p>A pull or race in Late Night causes up to ${life.config.lateFatigueHealth} HP fatigue next morning.</p>` : life.schedule?.slot==='late-evening' ? `<p>A pull or race in Late Evening causes up to ${life.config.lateFatigueHealth} HP fatigue next morning.</p>` : ''}</div>
      <div class="life-phone-activities">
        <section class="life-phone-panel" aria-labelledby="phone-pulls-title">
          <h3 id="phone-pulls-title">Grow your flock</h3>
          <p>${pending ? 'Your ducks are waiting to be revealed.' : !engine.state.tenPullCommitted ? 'Meet your first racing team with ten free pulls.' : 'Find your next racer in the Pond of Destiny.'}</p>
          <div class="life-phone-actions">
            ${pending ? '<button class="btn btn-primary btn-lg" data-life-phone="reveal">Reveal your ducks</button>' : ''}
            ${!engine.state.tenPullCommitted ? '<button class="btn btn-gold btn-lg" data-life-phone="welcome">Claim free 10-pull</button>' : ''}
            ${engine.state.tenPullCommitted && !pending ? '<button class="btn btn-primary btn-md" data-life-phone="single">Single pull · 160 Gems</button><button class="btn btn-primary btn-md" data-life-phone="ten">10-pull · 1600 Gems</button>' : ''}
          </div>
        </section>
        ${engine.state.owned.length ? '<section class="life-phone-panel" aria-labelledby="phone-race-title"><h3 id="phone-race-title">Make a splash</h3><p>Choose a duck from your flock and head to the starting line.</p><button class="btn btn-gold btn-lg" data-life-phone="race">Pond Race</button></section>' : ''}
        <section class="life-phone-panel" aria-labelledby="phone-gems-title"><h3 id="phone-gems-title">Gem shop</h3><p>330 Gems</p><button class="btn btn-secondary btn-md" data-life-phone="bundle">Buy for $4.99</button></section>
      </div>
      <footer class="life-phone-session">
        <p>One pull action and one race per session. You can return to the apartment and pick up where you left off.</p>

      </footer></div></section>`;
  mountAppDexNav(container.querySelector('.gacha-banner-header'), callbacks.onOpenDex);
  container.querySelectorAll('[data-life-phone]').forEach(button => button.addEventListener('click', () => callbacks.action(button.dataset.lifePhone)));
  return { destroy() {} };
}
