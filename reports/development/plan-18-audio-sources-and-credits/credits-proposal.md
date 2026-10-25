# Proposed In-Game Credits and Attribution Specification (Repair 01)

**Packet:** Plan 18 — Local audio sources and credits investigation  
**Date:** 2026-10-25  
**Scope:** `reports/development/plan-18-audio-sources-and-credits/`  
**Status:** Proposal for owner selection before production integration.

---

## 1. Principles and Hard Constraints

1. **Strict Fictional / Factual Separation (Hard Constraint #6):**
   - Gameplay dialog, notifications, store pitches, and streamer cameos must remain **100% fictional** (satirical entities like *Quackpot Inc.*, *PondPass VIP*, *DuckCoin Unlimited*).
   - Real-world creator identities (e.g., Kevin MacLeod, Kenney Vleugels, omfgdude, qubodup, CourseVGD) belong **strictly in the factual Credits interface**, never embedded inside fictional lore or spoken by fictional NPCs.
2. **Zero Runtime External Requests (Hard Constraint #2):**
   - The Credits screen renders purely through local HTML, CSS, and SVG.
   - Zero external font CDNs (e.g., Google Fonts), external CSS libraries, or third-party badge embeds.
   - When served locally via static web server, local assets are retrieved from the same origin; no third-party hosts or telemetry endpoints are contacted.
   - Attribution links (to `incompetech.com`, `kenney.nl`, `creativecommons.org`) are presented as readable plain text and standard anchor tags with `rel="noopener noreferrer"`. No prefetching (`rel="prefetch"`) or automatic pingbacks are allowed.
3. **Accessibility and Decoupled Preferences:**
   - **Mute Audio and Reduced Motion are strictly decoupled:** enabling reduced motion does *not* automatically mute audio, and muting audio does *not* alter motion preferences. They are separate independent toggles in Settings.
   - Keyboard operability: Reachable via standard keyboard navigation (`Tab`, `Enter`, `Space`) from both Opening Screen and Settings.
   - Native modal behavior: Built on `<dialog>` with focus containment, keyboard `Escape` dismissal, and verified focus return to whichever button opened the modal.
   - Any visual tier names or particles in examples are illustrative candidate proposals, not adopted game rules or assets.

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
   - Position: Under the "About & Ethics" section in the metagame Settings panel (alongside independent reduced motion and audio volume toggles):
     ```html
     <div class="settings-group">
       <h3 class="settings-group-title">Attribution & Open Source</h3>
       <button type="button" class="btn-secondary" id="btn-settings-credits" aria-haspopup="dialog">
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
  Licensed under Creative Commons: By Attribution 3.0 Unported (CC BY 3.0)  
  https://creativecommons.org/licenses/by/3.0/  
  *Role: Fictional Mobile App & Gacha Pull Theater Theme (Candidate)*

- **"Chill lofi inspired [loop edit]"**  
  Original composition by omfgdude; loop edit by qubodup (OpenGameArt.org)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: Metagame Apartment & Companion Reflection Loop (Candidate)*

### Sound Effects
- **UI Audio Pack (Click 1)**  
  Created by Kenney (www.kenney.nl)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: Primary Action Button Feedback (Candidate)*

- **Casino Audio Pack (Card Slide 1)**  
  Created by Kenney (www.kenney.nl)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: Card Flip & Duplicate Down Feather Conversion (Candidate)*

- **Music Jingles (Steel Jingle 00)**  
  Created by Kenney (www.kenney.nl)  
  Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal  
  https://creativecommons.org/publicdomain/zero/1.0/  
  *Role: High-Rarity Pull Reveal Chime (Candidate)*

### Procedural Sound Synthesis
- **Duck Vocal Quacks (Candidates A, B, and C)**  
  Procedurally synthesized via Web Audio API text-stored parameters  
  Authored directly within the Quackpot project (Plan 04 SVG rig & sound engine)  
  Zero third-party audio dependencies. Retained reference options.

## Open Source Software & Technology
- Built with standard static HTML5, CSS3, and modern ECMAScript.
- Packaged locally with Vite for production build optimization.
- Hosted publicly as a static educational resource on GitHub Pages with zero runtime telemetry.
```

---

## 4. Production-Ready HTML Component Specification

```html
<!-- Native Credits Dialog Component -->
<dialog id="credits-dialog" class="credits-dialog" aria-labelledby="credits-title" aria-modal="true">
  <div class="credits-container">
    <header class="credits-header">
      <h2 id="credits-title" class="credits-heading">Quackpot Credits & Attribution</h2>
      <button type="button" class="btn-close-dialog" id="btn-close-credits-x" aria-label="Close credits dialog">&times;</button>
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
            <span class="credit-license">Licensed under Creative Commons Attribution 3.0 Unported (CC BY 3.0)</span><br>
            <span class="credit-url">https://creativecommons.org/licenses/by/3.0/</span>
          </li>
          <li class="credits-item">
            <span class="credit-work">"Chill lofi inspired [loop edit]"</span> — 
            <span class="credit-author">omfgdude</span>, arr. <span class="credit-author">qubodup</span> (<span class="credit-source">OpenGameArt.org</span>)<br>
            <span class="credit-license">Dedicated to the Public Domain under Creative Commons CC0 1.0 Universal</span><br>
            <span class="credit-url">https://creativecommons.org/publicdomain/zero/1.0/</span>
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
            <span class="credit-work">Music Jingles (Steel Jingle 00)</span> — 
            <span class="credit-author">Kenney</span> (<span class="credit-source">www.kenney.nl</span>) — 
            <span class="credit-license">CC0 1.0 Universal</span>
          </li>
          <li class="credits-item">
            <span class="credit-work">Synthesized Duck Quack FX</span> — 
            <span class="credit-author">Quackpot Core Audio Engine</span> (Procedural Web Audio API)
          </li>
        </ul>
      </section>
    </div>

    <footer class="credits-footer">
      <button type="button" class="btn btn-secondary" id="btn-close-credits-btn">Close</button>
    </footer>
  </div>
</dialog>
```

---

## 5. Verification Checklist for Production Integration

- [x] All credited works match exact licensed filenames and verified grants.
- [x] Factual names (Kevin MacLeod, Kenney, etc.) are quarantined inside the Credits view and never leak into gameplay text.
- [x] Markup uses standard native `<dialog>` element with keyboard `Escape` dismissal and verified focus return to opener.
- [x] Reduced motion and audio mute are demonstrated as independent settings controls.
- [x] No third-party network requests or telemetry endpoints.
- [x] Fully operable preview is demonstrated in `reports/development/plan-18-audio-sources-and-credits/audition.html`.
