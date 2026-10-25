# Proposed In-Game Credits and Attribution Specification

**Packet:** Plan 18 — Local audio sources and credits investigation  
**Date:** 2026-10-25  
**Scope:** `reports/development/plan-18-audio-sources-and-credits/`  
**Status:** Proposal for owner selection before production integration.

---

## 1. Principles and Hard Constraints

1. **Strict Fictional / Factual Separation (Hard Constraint #6):**
   - Gameplay dialog, notifications, store pitches, and streamer cameos must remain **100% fictional** (satirical entities like *Quackpot Inc.*, *PondPass VIP*, *DuckCoin Unlimited*).
   - Real-world creator identities (e.g., Kevin MacLeod, Kenney Vleugels, omfgdude, qubodup, CourseVGD) belong **strictly in the factual Credits interface**, never embedded inside fictional lore or spoken by fictional NPCs.
2. **Zero Runtime Network Requests (Hard Constraint #2):**
   - The Credits screen must render purely through local HTML, CSS, and SVG.
   - No external font CDNs (e.g., Google Fonts), external CSS libraries, or third-party badge embeds.
   - Attribution links (to `incompetech.com`, `kenney.nl`, `creativecommons.org`) must be presented as readable plain text and standard anchor tags with `rel="noopener noreferrer"`. No prefetching (`rel="prefetch"`) or automatic pingbacks are allowed.
3. **Accessibility and Keyboard Operability:**
   - The Credits screen must be reachable by keyboard navigation (`Tab`, `Enter`, `Space`) from both entry points.
   - Must support `Escape` to close modal views and return focus cleanly to the activating button.
   - Text must satisfy high-contrast readability (minimum 4.5:1 contrast ratio against the background).
   - Screen-reader headings (`<h1>`, `<h2>`, `<h3>`) must outline the structure logically.

---

## 2. In-Game Placement and Access Points

The Credits interface is designed with **two distinct access points**:

1. **Title / Opening Screen:**
   - Position: Secondary text link in the lower corner of the opening view:
     ```html
     <button type="button" class="btn-text-link" id="btn-open-credits" aria-haspopup="dialog">
       Credits & Legal
     </button>
     ```
   - Purpose: Lets students, instructors, or evaluators inspect attribution, licenses, and course context before starting a run.

2. **In-Game Settings Drawer / Menu:**
   - Position: Under the "About & Ethics" section in the metagame Settings panel (alongside reduced motion and audio volume toggles):
     ```html
     <div class="settings-group">
       <h3 class="settings-group-title">Attribution & Open Source</h3>
       <button type="button" class="btn-secondary" id="btn-settings-credits">
         View Game & Audio Credits
       </button>
     </div>
     ```
   - Purpose: Ensures credits remain accessible at any point during gameplay without requiring a page reload or run restart.

---

## 3. Complete Proposed Credits Copy Text

The proposed copy is divided into three clear sections: **Course & Project Overview**, **Audio & Music Attribution**, and **Software & Open Source Licenses**.

```markdown
# Quackpot — Credits & Attribution

## Course & Project Context
Quackpot is an educational browser game created for **CourseVGD** to help students
critically examine microtransaction systems, gacha mechanics, and monetization design.
All gameplay entities, currency offers, and publishers in this simulation are satirical
and entirely fictional.

## Audio & Music Attribution

### Music
- **"Fluffing a Duck"**  
  Composed and produced by Kevin MacLeod (incompetech.com)  
  Licensed under Creative Commons: By Attribution 3.0 / 4.0 International License  
  http://creativecommons.org/licenses/by/4.0/  
  *Role: Fictional Mobile App & Gacha Pull Theater Theme*

- **"Chill lofi inspired [loop edit]"**  
  Original composition by omfgdude; loop edit by qubodup (OpenGameArt.org)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: Metagame Apartment & Companion Reflection Loop*

### Sound Effects
- **UI Audio Pack (Click 1)**  
  Created by Kenney (www.kenney.nl)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: Primary Action Button Feedback*

- **Casino Audio Pack (Card Slide 1)**  
  Created by Kenney (www.kenney.nl)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: Card Flip & Duplicate Down Feather Conversion*

- **Jingle Audio Pack (Steel Jingle 00)**  
  Created by Kenney (www.kenney.nl)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: High-Rarity (4★ / 5★) Pull Reveal Chime*

### Procedural Sound Synthesis
- **Duck Vocal Quacks (Candidates A, B, and C)**  
  Procedurally synthesized via Web Audio API text-stored parameters  
  Authored directly within the Quackpot project (Plan 04 SVG rig & sound engine)  
  Zero third-party audio dependencies.

## Open Source Software & Fonts
- Built with standard static HTML5, CSS3, and modern ECMAScript.
- Packaged locally with Vite for production build optimization.
- Hosted publicly as a static educational resource on GitHub Pages.
```

---

## 4. Production-Ready HTML & CSS Component

Below is the standalone component markup and scoped styling proposed for production integration:

```html
<!-- Credits Dialog Component -->
<dialog id="credits-dialog" class="credits-dialog" aria-labelledby="credits-title">
  <div class="credits-container">
    <header class="credits-header">
      <h2 id="credits-title" class="credits-heading">Quackpot Credits & Attribution</h2>
      <button type="button" class="btn-close-dialog" aria-label="Close credits dialog">&times;</button>
    </header>
    
    <div class="credits-body" tabindex="0">
      <section class="credits-section">
        <h3 class="credits-subheading">Course Context</h3>
        <p class="credits-text">
          Quackpot is an educational browser game created for <strong>CourseVGD</strong>
          to explore gacha game economics and critical game design. All in-game offers,
          sponsors, and VIP tiers are satirical fictions.
        </p>
      </section>

      <section class="credits-section">
        <h3 class="credits-subheading">Music</h3>
        <ul class="credits-list">
          <li class="credits-item">
            <span class="credit-work">"Fluffing a Duck"</span> — 
            <span class="credit-author">Kevin MacLeod</span> (<span class="credit-source">incompetech.com</span>)<br>
            <span class="credit-license">Licensed under Creative Commons: By Attribution 4.0</span><br>
            <span class="credit-url">https://creativecommons.org/licenses/by/4.0/</span>
          </li>
          <li class="credits-item">
            <span class="credit-work">"Chill lofi inspired [loop edit]"</span> — 
            <span class="credit-author">omfgdude</span>, arr. <span class="credit-author">qubodup</span> (<span class="credit-source">OpenGameArt.org</span>)<br>
            <span class="credit-license">Dedicated to the Public Domain under Creative Commons CC0 1.0</span>
          </li>
        </ul>
      </section>

      <section class="credits-section">
        <h3 class="credits-subheading">Sound Effects</h3>
        <ul class="credits-list">
          <li class="credits-item">
            <span class="credit-work">UI Audio (Click 1)</span> — 
            <span class="credit-author">Kenney</span> (<span class="credit-source">www.kenney.nl</span>) — 
            <span class="credit-license">CC0 1.0 Universal</span>
          </li>
          <li class="credits-item">
            <span class="credit-work">Casino Audio (Card Slide 1)</span> — 
            <span class="credit-author">Kenney</span> (<span class="credit-source">www.kenney.nl</span>) — 
            <span class="credit-license">CC0 1.0 Universal</span>
          </li>
          <li class="credits-item">
            <span class="credit-work">Jingle Audio (Steel Jingle 00)</span> — 
            <span class="credit-author">Kenney</span> (<span class="credit-source">www.kenney.nl</span>) — 
            <span class="credit-license">CC0 1.0 Universal</span>
          </li>
          <li class="credits-item">
            <span class="credit-work">Synthesized Quack FX</span> — 
            <span class="credit-author">Quackpot Core Audio Engine</span> (Procedural Web Audio API)
          </li>
        </ul>
      </section>
    </div>

    <footer class="credits-footer">
      <button type="button" class="btn-primary" id="btn-credits-done">Close</button>
    </footer>
  </div>
</dialog>
```

```css
/* Scoped Credits Styling (Uses Paper Duck Subdued Palette) */
.credits-dialog {
  border: 1px solid #d4c5b9;
  border-radius: 8px;
  background-color: #faf7f2;
  color: #2b2623;
  max-width: 620px;
  width: 90vw;
  max-height: 85vh;
  padding: 0;
  box-shadow: 0 12px 32px rgba(43, 38, 35, 0.2);
}

.credits-dialog::backdrop {
  background-color: rgba(43, 38, 35, 0.55);
  backdrop-filter: blur(2px);
}

.credits-container {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.credits-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e6ded6;
  background-color: #f2ece4;
}

.credits-heading {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1614;
}

.btn-close-dialog {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #736961;
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.btn-close-dialog:hover,
.btn-close-dialog:focus {
  color: #1a1614;
}

.credits-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.5;
}

.credits-section {
  margin-bottom: 1.5rem;
}

.credits-subheading {
  font-size: 1.05rem;
  font-weight: 600;
  color: #5c4e43;
  margin: 0 0 0.5rem 0;
  border-bottom: 1px solid #ece4dc;
  padding-bottom: 0.25rem;
}

.credits-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.credits-item {
  margin-bottom: 0.85rem;
  padding-left: 0.5rem;
  border-left: 2px solid #d4c5b9;
}

.credit-work {
  font-weight: 600;
  color: #1a1614;
}

.credit-author {
  font-weight: 500;
}

.credit-source {
  color: #736961;
}

.credit-license {
  font-size: 0.85rem;
  color: #5c4e43;
}

.credit-url {
  font-size: 0.8rem;
  color: #8c7d70;
  word-break: break-all;
}

.credits-footer {
  padding: 0.85rem 1.5rem;
  border-top: 1px solid #e6ded6;
  background-color: #f2ece4;
  display: flex;
  justify-content: flex-end;
}
```

---

## 5. Verification Checklist for Production Integration

- [x] All credited works match exact licensed filenames.
- [x] Factual names (Kevin MacLeod, Kenney, etc.) are quarantined inside the Credits view and never leak into gameplay text.
- [x] Markup uses standard native `<dialog>` element with keyboard `Escape` dismissal and native focus management.
- [x] No third-party network requests or telemetry endpoints.
- [x] In-situ interactive preview is provided in `reports/development/plan-18-audio-sources-and-credits/audition.html`.
