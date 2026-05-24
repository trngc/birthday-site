# Birthday Site — Specification

## What this is

A personal, interactive birthday storybook website. The user opens it on their phone, taps through 5 scenes, and experiences a self-celebration: year recap, achievements, notes to past/future self, and a final wish.

Built as a personal one-off, mobile-only, tap-to-advance.

---

## Tech

- HTML + CSS + Vanilla JS (no framework)
- GSAP 3 + ScrollTrigger (CDN)
- Google Fonts: Fraunces, Caveat, Inter
- Hosted on Vercel
- Mobile-only (375px–428px width)

---

## Global behavior

### Navigation
- **Tap-to-advance** only. No scrolling.
- Each scene has a tap zone or interactive element that progresses the experience.
- A subtle "tap to continue" hint appears 2s after entering a passive scene.

### Sound (default OFF)
- Toggle button: 🔇/🔊 at top-right corner (always visible, small).
- When ON, sounds play for:
  - Pop sound when opening box / envelope (0.3s)
  - Paper rustle when flipping book pages (0.5s)
  - Whoosh when blowing candle (0.8s)
- No background music.

### Loading
- Show a soft loading state (cream background + small "loading..." text) until critical assets load.
- Preload Scene 1 assets first; lazy-load Scenes 2–5.

### Reduced motion
- Respect `prefers-reduced-motion: reduce` → disable idle animations, keep tap-triggered transitions but shorten to 0.2s.

### Responsive
- Mobile-first. Optimize for 375px–428px width (iPhone SE → iPhone Pro Max).
- Use `vh` and `vw` for layout, `clamp()` for typography.
- Lock orientation to portrait.

---

## Scenes

### Scene 1 — Hero

**Visual:**
- Background: `bg-1-hero.png` (sky + sun + plane + cake + photo on paper plane)
- Centered text overlay:
  - **Headline** (Fraunces, large): "Today is a special day"
  - **Subtitle** (Inter, smaller, dimmed): "May 24 · A trip around the sun"
  - **Hint** (Caveat, small, bottom-center, animated): "tap anywhere to begin"

**Idle animations:**
- Subtle vertical bobbing on the hint text (0.5s amplitude, 2s loop)
- Optional: very gentle fade-in of headline (0.8s on load)

**Interaction:**
- Tap anywhere on screen → advance to Scene 2 with cross-fade transition (0.6s)

---

### Scene 2 — Year in 10 objects (Gift Box)

**Visual (default):**
- Background: `bg-2-box.png`
- Center: `box-closed.png` floating
- Caption below box: "this year, in objects ✨" (Caveat)
- Idle: box gentle wiggle (rotate -2deg → +2deg, 2s loop)

**Interaction:**
1. Tap box → triggers open animation:
   - Box rotates slightly + scales 1.1 (anticipation, 0.15s)
   - Replaces with `box-opened.png` (same position)
   - 10 icons burst out from center with stagger (0.08s delay each):
     - Each icon has predefined scatter position (define array)
     - Animation: scale from 0 → 1 with `back.out(1.7)` ease
     - Rotation: random ±15deg
   - Confetti particles (Cursor-generated SVG) burst at same time, fade out after 1.5s
2. After all icons settled (~1.5s total):
   - Each icon starts idle bobbing (y +/- 5px, randomized timing 2–3s)
   - Tiny label appears below each icon (Inter 10px):
     - matcha → "matcha"
     - doll-box → "design xp"
     - figma → "figma forever"
     - claude → "ai workflows"
     - camera → "always traveling"
     - doll-figure → "the brand"
     - notebook → "reflection"
     - croissant → "slow mornings"
     - phone → "content"
     - books → "always learning"
   - Hint "tap anywhere to continue" fades in (2s after burst)
3. Tap anywhere on screen (NOT on icons) → advance to Scene 3

**Icon scatter positions** (relative to box center, on mobile 375px width):
```
1. matcha:     (-130, -100), rotate -8deg
2. doll-box:   (110, -130), rotate 10deg
3. figma:      (-140, 30), rotate -5deg
4. claude:     (120, 20), rotate 6deg
5. camera:     (-80, -180), rotate -12deg
6. doll-figure:(70, 130), rotate 4deg
7. notebook:   (-110, 100), rotate -3deg
8. croissant:  (140, 100), rotate 8deg
9. phone:      (0, -200), rotate 0deg
10. books:     (0, 180), rotate -5deg
```

---

### Scene 3 — Year One (Book)

**Visual (default):**
- Background: `bg-3-book.png`
- Center: `book-closed.png`
- Caption: "Year One" (already on book cover) + hint below: "tap to open"
- Idle: gentle scale pulse (1 → 1.02 → 1, 2s loop)

**Interaction:**
1. Tap book → opens to page 1 (replaces `book-closed.png` with `book-opened.png`)
   - Page indicator appears below book: "1 / 4" (small, Inter 12px)
2. Each page shows:
   - **Page 1**: `page-1-portfolio.png` overlay + caption "launched my first ux portfolio"
   - **Page 2**: `page-2-devpost.png` overlay + caption "4 hackathons, 4 lessons"
   - **Page 3**: `page-3-instagram.png` overlay + caption "started sharing the work"
   - **Page 4**: `page-4-spec-ai.png` (left card) + `page-4-espresso.png` (right card) + caption "shipped specai · joined design xp"
3. Tap book → next page with page-flip animation:
   - Current page content scales down + fades out (0.2s)
   - New page content scales up + fades in (0.3s, delay 0.1s)
   - Page indicator updates: "2 / 4" → "3 / 4" → "4 / 4"
   - Optional: subtle paper rustle sound (if sound ON)
4. After page 4, tap → advance to Scene 4

**Page 4 special:**
- 2 cards stagger reveal:
  - spec.ai card: slide in from left, slight tilt -3deg
  - Espresso card: slide in from right (delay 0.2s), slight tilt +5deg

---

### Scene 4 — Letters to self

**Visual (default):**
- Background: `bg-4-letters.png`
- 3 polaroids scattered (raw photos with CSS polaroid frame):
  - Photo 1: top-left, tilt -8deg, ~140px wide
  - Photo 2: top-right, tilt +6deg, ~140px wide
  - Photo 3: bottom-left, tilt -5deg, ~140px wide
- 2 envelopes positioned:
  - Envelope 1 (`envelope-closed.png`): center-upper, tilt +3deg
  - Envelope 2 (`envelope-closed.png`): bottom-right, tilt -4deg
- Idle: subtle floating on both envelopes (gentle y-axis bob, 3s loop, offset timing)

**Interaction state tracking:**
- Track which envelopes have been opened at least once
- Track which envelope is currently open (only one at a time)

**Interaction:**
1. Tap envelope 1 (closed):
   - If envelope 2 is open → close envelope 2 first (animation 0.4s)
   - Envelope 1: swap to `envelope-opened.png` + flap animation
   - Letter card pops up above envelope:
     - Letter card style: cream background `#FFF8EB`, soft shadow, rounded corners 12px
     - Animation: scale 0 → 1, opacity 0 → 1, slight upward translate (0.5s, back.out ease)
     - Content (Caveat font, 18px, dark coral `#C8665E`, line-height 1.6):

```
Dear past me,

Thank you. For every late night you didn't give up.
For every "I don't know how" you turned into "let me try."
For showing up even when no one was watching.

You didn't waste a single day.
You were just becoming.

— love, you 🤍
```

   - Small "tap envelope to close" hint at bottom of letter
   - Mark envelope 1 as "opened at least once"

2. Tap envelope 1 (when open):
   - Letter card scales down + fades out (0.3s)
   - Envelope 1: swap back to `envelope-closed.png`

3. Tap envelope 2 (closed):
   - Same logic, but with content:

```
Dear future me,

I hope you're resting more.
I hope you said yes to the scary thing.
I hope you're still making things that feel like you.

More slow mornings. More wins that are quietly yours.
More trust in the timing.

Make a wish — and mean it. ✨

— love, you 🤍
```

   - Mark envelope 2 as "opened at least once"

4. **Auto-advance check:**
   - After both envelopes have been opened at least once (regardless of current state), wait 1.5s after most recent interaction → fade out scene → advance to Scene 5
   - Show subtle hint at bottom for 1s before auto-advance: "✨"

---

### Scene 5 — Make a wish (Cake)

**Visual (default):**
- Background: `bg-5-cake.png` (sky + confetti falling continuously, no cake)
- Center: `cake-lit.svg` inline (has `#flames` group with `#flame-left`, `#flame-center`, `#flame-right`)
- Confetti: Cursor generates SVG confetti particles falling continuously (CSS animation, infinite)
- Caption above cake: "make a wish" (Fraunces italic, gentle fade-in)
- Hint below cake: "tap the candle ✨" (Caveat, subtle bob)

**Idle animations:**
- Flames flicker continuously (transform-origin: bottom center, scale + rotation, 0.8s loop, offset timing per flame)
- Confetti particles fall (loop, randomized x positions and rotation)

**Interaction:**
1. Tap any flame or the candle area:
   - **Panic phase** (0.3s): All flames quick scale 1 → 1.3 → 1, fast yoyo
   - **Extinguish phase** (0.4s, delay 0.4s): Flames opacity → 0, scale → 0, transform-origin bottom
   - **Smoke phase** (1.5s, delay 0.7s): Cursor-generated SVG smoke wisps rise from where flames were:
     - 3 small wavy paths in `#C9BDB5` color, opacity 0.7
     - Animation: from y=0, opacity=0 → y=-100, opacity=0.6 (then fade to 0)
   - **Confetti burst** (delay 0.5s): Additional confetti particles burst from cake position (one-shot)
   - **Final message** appears (delay 1.5s):
     - Card style: cream background, rounded, soft shadow, max-width 320px
     - Content (Fraunces serif, dark coral, line-height 1.6):

```
whoosh 🕯️

You worked so hard this year.

Your wish is on its way. ✨

Happy birthday, you.
```

   - Animation: scale 0.9 → 1, opacity 0 → 1, gentle bounce (0.8s, back.out)

2. No further interaction. The site ends here.

---

## Asset list (already in /assets/)

### Backgrounds (`/assets/backgrounds/`)
- bg-1-hero.png
- bg-2-box.png
- bg-3-book.png
- bg-4-letters.png
- bg-5-cake.png

### Elements (`/assets/elements/`)
- box-closed.png
- box-opened.png
- book-closed.png
- book-opened.png
- envelope-closed.png
- envelope-opened.png
- cake-lit.svg (layered SVG with `#flames > #flame-left, #flame-center, #flame-right`)

### Icons (`/assets/icons/`)
- icon-matcha.png
- icon-doll-box.png
- icon-figma.png
- icon-claude.png
- icon-camera.png
- icon-doll-figure.png
- icon-notebook.png
- icon-croissant.png
- icon-phone.png
- icon-books.png

### Book pages (`/assets/pages/`)
- page-1-portfolio.png
- page-2-devpost.png
- page-3-instagram.png
- page-4-spec-ai.png
- page-4-espresso.png

### Photos (`/assets/photos/`)
- photo-1.png (raw photo, will get polaroid frame via CSS)
- photo-2.png
- photo-3.png

### Cursor will generate (no asset needed)
- Smoke SVG (3 wavy paths)
- Confetti particles (SVG circles, rectangles, stars)
- Sun pulse / paper plane idle animations (CSS only, no asset)

---

## Polaroid frame CSS spec

```css
.polaroid {
  background: white;
  padding: 8px 8px 24px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}
.polaroid img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
```

---

## Deploy

- Push to GitHub (private repo)
- Connect Vercel → import → deploy
- Default URL: `birthday-site-trang.vercel.app` (or custom subdomain)
- Privacy: just the link, not advertised

---

## Out of scope (don't build)

- Desktop layout
- Social share buttons
- Analytics
- User accounts
- Multi-language
- SEO meta tags (beyond basics)
- Service worker / PWA
