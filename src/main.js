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
      <h1 id="spike-title">Quackpot Static Spike</h1>
      <p class="subtitle">Plan 02 — Static Build and GitHub Pages Subpath Scaffold</p>

      <ul class="spec-list">
        <li class="spec-item">
          <span class="spec-label">Constraint #2</span>
          <span>No app-authored runtime network calls, telemetry, or external CDN dependencies. Ordinary document, script, style, and image delivery uses browser requests.</span>
        </li>
        <li class="spec-item">
          <span class="spec-label">Constraint #7</span>
          <span>Static site output bundled from local source (HTML/CSS/JS/SVG) for GitHub Pages.</span>
        </li>
        <li class="spec-item">
          <span class="spec-label">Subpath</span>
          <span>Configured base path is <code id="base-path-display">${baseUrl}</code>.</span>
        </li>
        <li class="spec-item">
          <span class="spec-label">Assets</span>
          <span>Placeholder duck SVG imported through Vite asset pipeline.</span>
        </li>
      </ul>

      <footer class="meta-footer">
        <span>Build Mode: <strong id="build-mode-display">${mode}</strong> (production: ${isProd})</span>
        <span id="runtime-check">Runtime: Local Browser</span>
      </footer>
    </main>
  `;

  console.info('[Quackpot Spike] App mounted successfully at base path:', baseUrl);
}
