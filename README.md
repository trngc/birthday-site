# 🎂 Birthday Site

A personal interactive birthday storybook — built as a tap-to-advance mobile experience for self-celebration.

## Stack
- Vanilla HTML/CSS/JS
- GSAP for animations
- Mobile-only (375px–428px)

## Local dev

```bash
# Start a local server (any of these work)
python3 -m http.server 8000
# or
npx serve

# Open http://localhost:8000 in browser
# Use Chrome DevTools → toggle device toolbar → iPhone view
```

## Project structure

```
birthday-site/
├── index.html
├── styles.css
├── script.js
├── .cursorrules
├── SPEC.md           ← full specification, read this first
├── PROMPTS.md        ← build prompts (7 phases)
├── README.md
└── assets/
    ├── backgrounds/  (5 PNG)
    ├── elements/     (6 PNG + 1 SVG)
    ├── icons/        (10 PNG)
    ├── pages/        (5 PNG)
    └── photos/       (3 PNG)
```

## Scene flow

1. **Hero** — "Today is a special day" → tap anywhere
2. **Box** — Tap box → 10 icons burst → "this year, in objects"
3. **Book** — Tap book → 4 pages of achievements
4. **Letters** — 2 envelopes with notes to past/future self
5. **Cake** — Tap candle → blow out → final wish

## Deploy

```bash
git init
git add .
git commit -m "🎂 initial build"
git remote add origin <your-repo-url>
git push -u origin main

# Then connect to Vercel via vercel.com or:
vercel
```

## Credits

Built with ❤️ by Trang Cao
