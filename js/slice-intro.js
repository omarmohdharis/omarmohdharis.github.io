/* ============================================================
   SLICE INTRO ORCHESTRATOR — js/slice-intro.js
   Vinyl spin → X-slash → 4 pieces fall → reveal homepage
   Plays once per browser session (sessionStorage)
   ============================================================ */

(function () {
  'use strict';

  // Only run on the homepage
  const isHome = document.body.classList.contains('is-home');
  if (!isHome) return;

  // Skip if already seen this session
  const seenIntro = sessionStorage.getItem('seenIntro') === 'true';
  if (seenIntro) {
    // Hide the existing loader fast and bail
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
    return;
  }

  // Skip if user prefers reduced motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
    sessionStorage.setItem('seenIntro', 'true');
    return;
  }

  // -------- Build overlay markup --------
  // Inserted at the very top of <body> so it sits over everything
  const overlay = document.createElement('div');
  overlay.className = 'intro-overlay staged';
  overlay.innerHTML = `
    <div class="intro-vinyl-wrapper">
      <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer record edge -->
        <circle cx="160" cy="160" r="155" fill="#15110d" stroke="#2a1f17" stroke-width="2"/>
        <!-- Grooves: concentric circles -->
        <circle cx="160" cy="160" r="148" fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="138" fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="128" fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="118" fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="108" fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="98"  fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="88"  fill="none" stroke="#1a1410" stroke-width="0.5"/>
        <circle cx="160" cy="160" r="78"  fill="none" stroke="#1a1410" stroke-width="0.5"/>

        <!-- Subtle reflection sheen -->
        <ellipse cx="120" cy="100" rx="60" ry="20" fill="rgba(255,255,255,0.03)" transform="rotate(-30 120 100)"/>

        <!-- Center label (vermilion) -->
        <circle cx="160" cy="160" r="62" fill="#c8332b"/>
        <circle cx="160" cy="160" r="62" fill="none" stroke="#0a0808" stroke-width="1" stroke-dasharray="2 3" opacity="0.3"/>

        <!-- Label text -->
        <text x="160" y="148" text-anchor="middle"
              font-family="Georgia, serif" font-style="italic"
              font-size="14" fill="#e8dfc8" opacity="0.95">
          omar mohd haris
        </text>
        <text x="160" y="170" text-anchor="middle"
              font-family="JetBrains Mono, monospace"
              font-size="9" letter-spacing="3" fill="#e8dfc8" opacity="0.7">
          PORTFOLIO
        </text>
        <text x="160" y="186" text-anchor="middle"
              font-family="JetBrains Mono, monospace"
              font-size="7" letter-spacing="2" fill="#e8dfc8" opacity="0.5">
          MMXXVI · SIDE A
        </text>

        <!-- Spindle hole -->
        <circle cx="160" cy="160" r="4" fill="#0a0808"/>
        <circle cx="160" cy="160" r="2" fill="#000"/>
      </svg>
    </div>

    <div class="intro-caption">setting the scene</div>

    <div class="intro-slash slash-1"></div>
    <div class="intro-slash slash-2"></div>

    <div class="intro-piece piece-top"></div>
    <div class="intro-piece piece-right"></div>
    <div class="intro-piece piece-bottom"></div>
    <div class="intro-piece piece-left"></div>
  `;

  // Insert at top of body so it covers everything
  document.body.insertBefore(overlay, document.body.firstChild);

  // Hide existing loader so the slice intro is the only thing showing
  const oldLoader = document.getElementById('loader');
  if (oldLoader) oldLoader.style.display = 'none';

  // -------- Timeline --------
  // Use requestAnimationFrame to ensure overlay is painted before unstaging
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Make the overlay visible — vinyl fade-in begins
      overlay.classList.remove('staged');
    });
  });

  // 1.7s: Trigger slashes (vinyl fades, slashes flash diagonally)
  setTimeout(() => {
    overlay.classList.add('slicing');
  }, 1700);

  // 2.3s: After both slashes complete, trigger pieces falling
  // Slash 1 starts at slicing+0ms, Slash 2 at slicing+180ms,
  // each takes 320ms — second one ends at slicing+500ms (~2.2s total)
  setTimeout(() => {
    overlay.classList.add('falling');
  }, 2200);

  // 3.1s: Pieces have fallen — mark intro done
  setTimeout(() => {
    overlay.classList.add('done');
  }, 3100);

  // 3.5s: Fully remove overlay from DOM
  setTimeout(() => {
    overlay.remove();
    sessionStorage.setItem('seenIntro', 'true');
  }, 3500);
})();
