// Quackpot session menu. This is inside the phone, not an apartment clock.
export function renderLifePhoneView(container, engine, callbacks) {
  const life = engine.state.life;
  const session = life.session;
  const pending = engine.state.pendingReveals.some(draw => !draw.revealed);
  container.innerHTML = `<section class="gacha-container" aria-labelledby="life-phone-title">
    <div class="gacha-banner-card"><div class="gacha-banner-header"><div class="banner-tag">Quackpot</div>
      <h2 id="life-phone-title">Pond of Destiny</h2><p>Your visit includes one pull and one race. You can put your phone down and return.</p>
      <p>Pull: ${session?.pull ? 'used' : 'available'} · Race: ${session?.race ? 'used' : 'available'}</p>
      ${life.phase === 'lateNight' ? `<p>A pull or race in Late Night causes up to ${life.config.lateFatigueHealth} HP fatigue next morning.</p>` : ''}</div>
      <div class="gacha-claim-section">
        ${pending ? '<button class="btn btn-primary" data-life-phone="reveal">Return to committed cards</button>' : ''}
        ${!engine.state.tenPullCommitted ? '<button class="btn btn-gold" data-life-phone="welcome">Claim free 10-pull</button>' : ''}
        ${engine.state.tenPullCommitted && !pending ? '<button class="btn btn-primary" data-life-phone="single">Single pull · 160 Gems</button><button class="btn btn-primary" data-life-phone="ten">10-pull · 1600 Gems</button>' : ''}
        <button class="btn btn-secondary" data-life-phone="bundle">Buy 330 Gems · $4.99</button>
        ${engine.state.owned.length ? '<button class="btn btn-secondary" data-life-phone="race">Pond Race</button>' : ''}
        ${session ? '<button class="btn btn-secondary" data-life-phone="extend">Extend session into another phase</button>' : ''}
        <button class="btn btn-secondary" data-life-phone="finish">Finish Session and advance</button>
      </div></div></section>`;
  container.querySelectorAll('[data-life-phone]').forEach(button => button.addEventListener('click', () => callbacks.action(button.dataset.lifePhone)));
  return { destroy() {} };
}
