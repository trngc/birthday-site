# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Vanilla HTML/CSS/JS birthday storybook — no build tools, no package manager, no dependencies to install. All external libraries (GSAP, Google Fonts) are loaded via CDN at runtime.

### Running the dev server

```bash
python3 -m http.server 8000
# Then open http://localhost:8000 in Chrome with DevTools mobile emulation (375x812)
```

No `npm install`, no build step. The project is directly browser-runnable from a static file server.

### Linting / validation

There is no configured linter. Use `node -c script.js` for basic JS syntax checking.

### Testing

No automated test framework. Manual browser testing is required:
- Open in Chrome with mobile device emulation (iPhone X / 375x812)
- Tap through scenes 1–5 to verify navigation and animations
- Scene 1 is fully built; scenes 2–5 are placeholder sections awaiting implementation

### Key caveats

- **Mobile-only**: The site has no desktop layout. Always test in a mobile viewport.
- **CDN dependencies**: GSAP and Google Fonts require internet access. Without connectivity, animations and custom fonts will not load.
- **Tap-to-advance, not scroll**: Navigation is entirely tap-based. Do not add scroll behaviors.
- **Incremental build**: Only Scene 1 (hero) is fully implemented. Scenes 2–5 have empty HTML sections.
