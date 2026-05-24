# Cursor Build Prompts

Paste these into Cursor Composer (Cmd+I) **one phase at a time**. Wait for each phase to complete, test the result, then move to the next phase. Do NOT skip phases or paste them all at once.

After pasting each prompt, hit "Accept All" if Cursor's output looks reasonable, then open `index.html` in a browser (with a local server) to test.

---

## Phase 1: Project Skeleton

```
Read SPEC.md and .cursorrules carefully. Then build the foundational skeleton:

1. Create `index.html` with:
   - Mobile viewport meta tag
   - Title: "Happy Birthday ✨"
   - Link to Google Fonts: Fraunces, Caveat, Inter
   - Link to GSAP CDN (3.x) and ScrollTrigger
   - Link to styles.css
   - Body containing 5 scene containers (.scene-1 through .scene-5)
   - Each scene is initially hidden except .scene-1
   - A sound toggle button at top-right (🔇/🔊)
   - Script tag for script.js

2. Create `styles.css` with:
   - CSS variables for the design palette (see SPEC.md)
   - CSS reset (margin, padding, box-sizing)
   - Body: locked to viewport, no scroll, font-family Inter
   - .scene class: position absolute, full viewport, hidden by default
   - .scene.is-active: visible with fade-in
   - Sound toggle button styling (small, top-right, semi-transparent)
   - Reduced motion fallback at the bottom

3. Create `script.js` with:
   - SceneManager class:
     - currentScene (starts at 1)
     - goToScene(n) method: hides current, shows next, with fade transition
   - SoundManager class:
     - enabled (starts false)
     - toggle() method
     - play(soundName) method (placeholder for now)
   - Initialize on DOMContentLoaded

Test: Loading the page should show scene 1 container (empty for now) and a sound toggle in the top-right corner.

Do NOT build any scene content yet. Just the skeleton.
```

---

## Phase 2: Scene 1 — Hero

```
Build Scene 1 (Hero) per SPEC.md section "Scene 1 — Hero".

In index.html:
- Inside .scene-1, add:
  - Background image (bg-1-hero.png) as a full-bleed img
  - Centered text content:
    - h1: "Today is a special day" (Fraunces, large)
    - p.subtitle: "May 24 · A trip around the sun"
    - p.hint: "tap anywhere to begin"
  - Tap zone (full screen, transparent)

In styles.css:
- Style the hero text (centered, with appropriate spacing)
- Background image: object-fit cover, full viewport
- Hint text: small, Caveat font, bottom-center area
- Add a subtle bobbing animation to .hint (translateY 0 → -4px → 0, 2s ease-in-out infinite)

In script.js:
- Add click listener to .scene-1 tap zone → calls SceneManager.goToScene(2)
- On scene-1 entry, fade in headline (opacity 0 → 1, 0.8s)

Test: Should show hero scene with text overlaid on background. Tap anywhere → cross-fades to empty scene 2.
```

---

## Phase 3: Scene 2 — Box Explosion

```
Build Scene 2 (Year in 10 Objects) per SPEC.md section "Scene 2".

In index.html:
- Inside .scene-2, add:
  - Background image (bg-2-box.png)
  - .box-container with box-closed.png (will swap to opened)
  - .icons-container with 10 .icon elements (use img tags, all 10 icons from /assets/icons/)
     - Each icon has a data-label attribute (e.g., "matcha", "figma forever")
  - .caption: "this year, in objects ✨"
  - Tap zone for advancing (overlay, but BEHIND icons so icons get the tap first)

In styles.css:
- Box: centered, ~200px wide
- Icons: position absolute, initially scale 0 + opacity 0, centered behind box
- Icon labels: small text below each icon, Inter 10px, initially opacity 0
- Confetti container: behind icons

In script.js:
- Use GSAP for the open animation:
  - Use the icon scatter positions from SPEC.md (10 positions defined)
  - Create timeline that:
    1. Anticipation: box rotate + scale 1.1 (0.15s)
    2. Swap box-closed.png → box-opened.png
    3. Icons burst: stagger 0.08s, scale 0→1, position to scattered coords, back.out(1.7) ease
    4. Generate confetti SVG particles dynamically (10-15 particles), burst with stagger
    5. Idle bobbing on icons (after settled): subtle y±5px, randomized timing
    6. Fade in icon labels (after burst, 0.5s delay)
    7. After 2.5s, show "tap to continue" hint
- After box is opened, tap anywhere (not on icons) → goToScene(3)
- If sound enabled, play "pop" sound on box tap (placeholder, can be empty for now)

Generate SVG confetti particles as JS function (4 shapes: small circles, small rectangles, stars, sparkles in pastel colors).

Test: Tap box → 10 icons burst out with labels → tap anywhere → goes to scene 3.
```

---

## Phase 4: Scene 3 — Book Pages

```
Build Scene 3 (Book Pages) per SPEC.md section "Scene 3".

In index.html:
- Inside .scene-3, add:
  - Background image (bg-3-book.png)
  - .book-container with book-closed.png
  - .book-pages-container (hidden initially), containing:
    - book-opened.png as the book "base"
    - 4 .book-page divs, each with the corresponding page image (page-1, 2, 3, 4)
    - For page-4, contain two images: page-4-spec-ai.png (left, tilt -3deg) and page-4-espresso.png (right, tilt +5deg)
    - Each page also has a .page-caption below the book with the caption text
  - .page-indicator: "1 / 4" (updates dynamically)
  - .hint: "tap to open" (visible when book closed)

In styles.css:
- Book closed: centered, ~280px wide
- Book opened: replace book-closed with book-opened, then page content overlay on the open spread
- Page images: position over the open book pages area
- Page indicator: small text below book, fade between states
- Idle: gentle scale pulse on book-closed (1 → 1.02 → 1, 2s loop)

In script.js:
- State: currentPage (0-4, 0 = closed)
- Tap on book (closed) → open animation, set currentPage = 1
  - Swap book-closed → book-opened (cross-fade 0.3s)
  - Show page 1 with fade in
  - Update indicator
- Tap on book (opened, page 1-3) → page flip:
  - Current page content scale + fade out (0.2s)
  - Next page content scale + fade in (0.3s, delay 0.1s)
  - Update indicator
  - For page 4: stagger reveal of 2 cards (spec.ai from left, Espresso from right with 0.2s delay)
- Tap on book (opened, page 4) → goToScene(4)
- If sound enabled, play "page-flip" sound on each flip

Test: Tap book → opens to page 1 → tap → page 2 → ... → page 4 (2 cards reveal) → tap → goes to scene 4.
```

---

## Phase 5: Scene 4 — Letters Toggle

```
Build Scene 4 (Letters) per SPEC.md section "Scene 4".

In index.html:
- Inside .scene-4, add:
  - Background image (bg-4-letters.png)
  - 3 .polaroid divs, each containing photo-1, 2, 3 from /assets/photos/
    - Polaroid frame applied via CSS (white border, shadow)
    - Tilts: -8deg, +6deg, -5deg
    - Positions: top-left, top-right, bottom-left
  - 2 .envelope divs:
    - Envelope 1: center-upper, tilt +3deg, contains envelope-closed.png
    - Envelope 2: bottom-right, tilt -4deg, contains envelope-closed.png
    - Each has a hidden .letter-card child with the letter content (Caveat font)
  - Letter 1 content (per SPEC.md):
    "Dear past me, Thank you. For every late night you didn't give up..."
  - Letter 2 content (per SPEC.md):
    "Dear future me, I hope you're resting more..."

In styles.css:
- Polaroid: white bg, padding 8px 8px 24px 8px, shadow, slight rotation
- Polaroid img: 100% width, aspect-ratio 1/1, object-fit cover
- Envelope: ~140px wide, transformable
- Letter card: cream bg (#FFF8EB), padding 24px, rounded 12px, shadow, max-width 280px
- Letter text: Caveat 18px, dark coral (#C8665E), line-height 1.6
- Idle: gentle floating on envelopes (y +/-3px, 3s loop, offset 0.5s between them)

In script.js:
- State: { env1Open: false, env2Open: false, env1OpenedOnce: false, env2OpenedOnce: false }
- Tap envelope 1:
  - If env2Open: close env2 first (0.4s animation)
  - If env1 closed: open it
    - Swap envelope-closed.png → envelope-opened.png
    - Show letter card with animation (scale 0→1, opacity 0→1, slight up translate, 0.5s back.out)
    - Set env1Open = true, env1OpenedOnce = true
  - Else: close it (reverse animation)
- Tap envelope 2: same logic, mirror
- After any close/open action, check: if env1OpenedOnce && env2OpenedOnce && !env1Open && !env2Open:
  - Wait 1.5s
  - Show "✨" hint for 1s
  - Auto-advance to scene 5
- If sound enabled, play "pop" sound on envelope open

Test: Tap envelope 1 → letter pops up → tap again → closes. Tap envelope 2 → letter 2 pops up. After both opened at least once + both closed → auto-advance.
```

---

## Phase 6: Scene 5 — Cake Blow

```
Build Scene 5 (Make a Wish) per SPEC.md section "Scene 5".

In index.html:
- Inside .scene-5, add:
  - Background image (bg-5-cake.png) — note this has confetti baked in
  - Cake SVG: inline cake-lit.svg content (read the SVG file, inline it directly in HTML so we can manipulate #flame-left, #flame-center, #flame-right by ID)
  - .smoke-container (hidden initially): will hold dynamically-generated smoke SVG
  - .caption: "make a wish" (Fraunces italic, above cake, fades in on scene load)
  - .hint: "tap the candle ✨" (Caveat, below cake)
  - .final-message (hidden initially):
    "whoosh 🕯️ / You worked so hard this year. / Your wish is on its way. ✨ / Happy birthday, you."

In styles.css:
- Cake SVG: centered, ~280px wide
- Flames idle flicker: transform-origin bottom center, scale + rotation, 0.8s loop, offset per flame (use animation-delay)
- Smoke wisps: gray (#C9BDB5), opacity 0.7
- Final message card: cream bg, rounded, soft shadow, padding 32px, max-width 320px
- Final message text: Fraunces serif, dark coral, line-height 1.6, sentence centered

In script.js:
- On scene load: fade in "make a wish" caption (1s delay, 0.6s fade)
- Generate additional SVG confetti particles falling (CSS animation, infinite loop)
- Tap cake or flame area triggers blow-out timeline:
  1. Panic phase (0.3s): all flames scale 1.3 yoyo 3x fast
  2. Extinguish (0.4s, delay 0.4s): flames opacity → 0, scale → 0 (origin bottom)
  3. Generate 3 smoke wisp SVG paths dynamically (wavy curves), animate from y=0 to y=-100, opacity 0 → 0.6 → 0 (1.5s, delay 0.7s)
  4. Burst additional confetti from cake position (delay 0.5s, one-shot)
  5. Final message scale 0.9 → 1, opacity 0 → 1 (0.8s, back.out, delay 1.5s)
  6. After 3s, fade out caption and hint
- If sound enabled, play "whoosh" sound on tap

Function to generate smoke SVG:
- 3 paths with d="M ... Q ..." for wavy curves
- stroke="#C9BDB5", stroke-width 4-6, fill none, round caps
- Position at top of cake center

Test: Tap candle → flames flicker fast, fade out, smoke rises, confetti bursts, final message appears.
```

---

## Phase 7: Polish & Deploy

```
Final polish and deployment prep:

1. SOUND IMPLEMENTATION:
   - Add 3 audio files to /assets/sounds/ (pop.mp3, page-flip.mp3, whoosh.mp3)
   - Update SoundManager to actually load and play these
   - Sound toggle button: animate icon swap between 🔇 and 🔊
   - Persist sound preference in localStorage

2. PERFORMANCE:
   - Add `loading="lazy"` to images in scenes 2-5
   - Preload only scene 1 + scene 2 critical assets
   - Add a preloader: cream background with small "..." while scene 1 assets load

3. ACCESSIBILITY:
   - Verify all tap targets are at least 48x48px
   - Add aria-labels to all interactive elements
   - Test with prefers-reduced-motion (idle animations should disable)
   - Add alt text to all images

4. RESPONSIVE TESTING:
   - Test on iPhone SE (375px), iPhone 14 (390px), iPhone Pro Max (428px)
   - Verify scene transitions on all sizes
   - Verify icon scatter positions don't overflow on smaller screens (consider clamp() or media queries)

5. EDGE CASES:
   - What if user double-taps quickly? → debounce taps (300ms)
   - What if user taps multiple icons in scene 2? → ignore (icons are passive after burst)
   - What if user re-enters scene? → state should reset (or persist? decide)

6. POLISH:
   - Add smooth cross-fade between all scenes (0.6s)
   - Verify all font loading (FOUT prevention with font-display: swap)
   - Add favicon
   - Add meta tags: viewport, theme-color (#F5B5AE), apple-touch-icon

7. DEPLOY:
   - Add .gitignore (.DS_Store, node_modules, .env)
   - Initialize git, commit, push to GitHub
   - Run `vercel` from project root or connect via vercel.com
   - Test live URL on phone

Output a checklist of any remaining TODOs or known issues.
```

---

## Tips while building

- After each phase, test in Chrome DevTools mobile view (iPhone X 375x812)
- If Cursor's output has bugs, paste the error + the relevant code section back into chat with: "Fix this: [error]"
- Use Cmd+K on specific lines for surgical edits
- Reference files with `@filename` in chat for context
- If a phase's prompt seems too big, break it into smaller "build just X" requests

## When you're stuck

- Use Cursor's chat (Cmd+L) to ask questions about your own code
- Paste console errors directly into chat
- Drag screenshots into chat for visual debugging
- Use git to revert if a phase breaks things badly: `git checkout .`
