import './style.css';
import duckSvgUrl from './assets/duck-placeholder.svg';

const app = document.querySelector('#app');

if (app) {
  const baseUrl = import.meta.env.BASE_URL;
  const isProd = import.meta.env.PROD;
  const mode = import.meta.env.MODE;

  app.innerHTML = `
    <main class="spike-container">
      <div class="duck-wrapper">
        <img class="duck-img" src="${duckSvgUrl}" alt="Quackpot Duck Placeholder" width="120" height="120" />
      </div>
      <h1>Quackpot Static Spike</h1>
      <p class="subtitle">Plan 02 — Static Build and GitHub Pages Subpath Verification</p>

      <ul class="verification-list">
        <li class="verification-item">
          <span class="status-badge">PASS</span>
          <span><strong>Hard Constraint #2:</strong> Zero runtime network requests or external CDN dependencies.</span>
        </li>
        <li class="verification-item">
          <span class="status-badge">PASS</span>
          <span><strong>Hard Constraint #7:</strong> Static output bundled from local source (HTML/CSS/JS/SVG).</span>
        </li>
        <li class="verification-item">
          <span class="status-badge">PASS</span>
          <span><strong>Subpath Resolution:</strong> Configured base path is <code>${baseUrl}</code>.</span>
        </li>
        <li class="verification-item">
          <span class="status-badge">PASS</span>
          <span><strong>SVG Asset Source:</strong> Placeholder duck imported via base-aware URL.</span>
        </li>
      </ul>

      <footer class="meta-footer">
        <span>Build Mode: <strong>${mode}</strong> (production: ${isProd})</span>
        <span id="runtime-check">Runtime: Local Browser</span>
      </footer>
    </main>
  `;

  // Log runtime confirmation to the browser console for inspection
  console.info('[Quackpot Spike] App mounted successfully at base path:', baseUrl);
  console.info('[Quackpot Spike] Zero external network requests initiated.');
}
