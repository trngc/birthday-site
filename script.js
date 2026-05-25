/* =========================================================
   Birthday Site — Core Skeleton
   Tap-to-advance navigation + sound toggle.
   Scene content is built incrementally in later phases.
   ========================================================= */

const TOTAL_SCENES = 5;
const NAV_DEBOUNCE_MS = 300;
const SOUND_STORAGE_KEY = "birthday-sound-enabled";

const CRITICAL_ASSETS = [
  "assets/backgrounds/bg-1-hero.png",
  "assets/elements/box-closed.png",
];

const SOUND_FILES = {
  pop: "assets/sounds/pop.mp3",
  "page-flip": "assets/sounds/page-flip.mp3",
  whoosh: "assets/sounds/whoosh.mp3",
};

/* ---------- Scene Manager ---------- */
class SceneManager {
  constructor() {
    this.currentScene = 1;
    this.isTransitioning = false;
    this.lastNavAt = 0;
    this.sceneEls = new Map();

    document.querySelectorAll("[data-scene]").forEach((el) => {
      const n = parseInt(el.dataset.scene, 10);
      this.sceneEls.set(n, el);
    });
  }

  getScene(n) {
    return this.sceneEls.get(n) || null;
  }

  /**
   * Switch from the current scene to scene `n` with a cross-fade.
   * Hides the current, reveals the next, updates aria-hidden.
   */
  goToScene(n) {
    if (this.isTransitioning) return;
    if (n < 1 || n > TOTAL_SCENES) return;
    if (n === this.currentScene) return;

    const now = Date.now();
    if (now - this.lastNavAt < NAV_DEBOUNCE_MS) return;
    this.lastNavAt = now;

    const current = this.getScene(this.currentScene);
    const next = this.getScene(n);
    if (!next) return;

    this.isTransitioning = true;

    if (current) {
      current.classList.remove("is-active");
      current.setAttribute("aria-hidden", "true");
    }

    next.classList.add("is-active");
    next.setAttribute("aria-hidden", "false");

    this.currentScene = n;

    const cssDur = getComputedStyle(document.documentElement)
      .getPropertyValue("--dur-transition")
      .trim();
    const ms = cssDur.endsWith("ms")
      ? parseFloat(cssDur)
      : parseFloat(cssDur) * 1000 || 600;

    window.setTimeout(() => {
      this.isTransitioning = false;
      document.dispatchEvent(
        new CustomEvent("scene:entered", { detail: { scene: n } })
      );
    }, ms);
  }

  next() {
    this.goToScene(this.currentScene + 1);
  }
}

/* ---------- Sound Manager ---------- */
class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem(SOUND_STORAGE_KEY) === "true";
    this.button = document.querySelector("[data-sound-toggle]");
    this.iconEl = this.button?.querySelector(".sound-toggle__icon");
    this.buffers = new Map();
    this.audioCtx = null;

    this.applyUiState();
    this.button?.addEventListener("click", () => this.toggle());
    this.loadSoundFiles();
  }

  applyUiState() {
    if (this.button) {
      this.button.classList.toggle("is-on", this.enabled);
      this.button.setAttribute("aria-pressed", String(this.enabled));
    }
    if (this.iconEl) {
      this.iconEl.textContent = this.enabled ? "🔊" : "🔇";
    }
  }

  ensureContext() {
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.audioCtx = new Ctx();
    }
    return this.audioCtx;
  }

  async loadSoundFiles() {
    await Promise.all(
      Object.entries(SOUND_FILES).map(async ([name, src]) => {
        try {
          const res = await fetch(src);
          if (!res.ok) return;
          const buf = await res.arrayBuffer();
          const ctx = this.ensureContext();
          if (!ctx) return;
          const decoded = await ctx.decodeAudioData(buf);
          this.buffers.set(name, decoded);
        } catch {
          // MP3 optional — synthesized fallback used in play().
        }
      })
    );
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(SOUND_STORAGE_KEY, String(this.enabled));
    this.applyUiState();

    if (this.enabled) {
      this.ensureContext()?.resume();
      if (window.gsap && this.iconEl) {
        window.gsap.fromTo(
          this.iconEl,
          { scale: 0.85 },
          { scale: 1.08, duration: 0.25, ease: "back.out(2)" }
        );
      }
    }
  }

  playBuffer(name) {
    const ctx = this.ensureContext();
    const buffer = this.buffers.get(name);
    if (!ctx || !buffer) return false;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    return true;
  }

  playSynth(name) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (name === "pop") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.32);
      return;
    }

    if (name === "page-flip") {
      const bufferSize = ctx.sampleRate * 0.12;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 900;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      noise.start(t);
      noise.stop(t + 0.52);
      return;
    }

    if (name === "whoosh") {
      const bufferSize = ctx.sampleRate * 0.8;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 0.8);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.28, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      noise.connect(filter);
      filter.connect(gain);
      noise.start(t);
      noise.stop(t + 0.82);
    }
  }

  play(soundName) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    ctx?.resume();
    if (!this.playBuffer(soundName)) {
      this.playSynth(soundName);
    }
  }
}

/* ---------- Scene 1 — Hero ---------- */
const sceneEnteredOnce = new Set();

function enterScene1() {
  const title = document.querySelector(".scene-1 .hero-title");
  const subtitle = document.querySelector(".scene-1 .hero-subtitle");

  if (window.gsap) {
    if (title) {
      window.gsap.fromTo(
        title,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
    if (subtitle) {
      window.gsap.fromTo(
        subtitle,
        { opacity: 0 },
        { opacity: 0.7, duration: 0.8, delay: 0.2, ease: "power2.out" }
      );
    }
  } else {
    // GSAP unavailable: snap to final visual state.
    if (title) title.style.opacity = "1";
    if (subtitle) subtitle.style.opacity = "0.7";
  }
}

/* ---------- Scene 2 — Year in 10 Objects (Box) ---------- */

// Scatter positions in DOM order: matcha, doll-box, figma, claude, camera,
// doll-figure, notebook, croissant, phone, books. (See SPEC.md.)
const SCENE2_SCATTER = [
  { x: -130, y: -100, rot: -8 },
  { x: 110, y: -130, rot: 10 },
  { x: -140, y: 30, rot: -5 },
  { x: 120, y: 20, rot: 6 },
  { x: -80, y: -180, rot: -12 },
  { x: 70, y: 130, rot: 4 },
  { x: -110, y: 100, rot: -3 },
  { x: 140, y: 100, rot: 8 },
  { x: 0, y: -200, rot: 0 },
  { x: 0, y: 180, rot: -5 },
];

const SCENE2_CONFETTI_COLORS = [
  "var(--color-coral)",
  "var(--color-sun)",
  "var(--color-pink-sky)",
  "var(--color-cream)",
];

const SVG_NS = "http://www.w3.org/2000/svg";

function makeConfettiPiece(index) {
  const wrap = document.createElement("span");
  wrap.className = "confetti-piece";

  const svg = document.createElementNS(SVG_NS, "svg");
  const size = 8 + Math.floor(Math.random() * 6);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("aria-hidden", "true");

  const color = SCENE2_CONFETTI_COLORS[index % SCENE2_CONFETTI_COLORS.length];
  const shape = index % 4;

  let el;
  if (shape === 0) {
    el = document.createElementNS(SVG_NS, "circle");
    el.setAttribute("cx", "6");
    el.setAttribute("cy", "6");
    el.setAttribute("r", "4");
  } else if (shape === 1) {
    el = document.createElementNS(SVG_NS, "rect");
    el.setAttribute("x", "2");
    el.setAttribute("y", "4");
    el.setAttribute("width", "8");
    el.setAttribute("height", "4");
    el.setAttribute("rx", "1");
  } else if (shape === 2) {
    // 4-point sparkle
    el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("d", "M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z");
  } else {
    // 5-point star
    el = document.createElementNS(SVG_NS, "polygon");
    el.setAttribute(
      "points",
      "6,1 7.4,4.6 11,5 8,7.5 9,11 6,9 3,11 4,7.5 1,5 4.6,4.6"
    );
  }
  el.setAttribute("fill", color);
  svg.appendChild(el);
  wrap.appendChild(svg);
  return wrap;
}

function burstConfetti(stage, gsap) {
  const N = 12;
  const pieces = [];
  for (let i = 0; i < N; i++) {
    const piece = makeConfettiPiece(i);
    stage.appendChild(piece);
    pieces.push(piece);
  }

  // Center each piece via GSAP transform so x/y math is relative to center.
  gsap.set(pieces, { xPercent: -50, yPercent: -50 });

  pieces.forEach((p, i) => {
    const angle = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 120 + Math.random() * 90;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 30; // slight upward bias
    const rot = (Math.random() - 0.5) * 540;

    gsap.fromTo(
      p,
      { opacity: 0, x: 0, y: 0, scale: 0.4, rotation: 0 },
      {
        opacity: 0.95,
        x: tx,
        y: ty,
        scale: 1,
        rotation: rot,
        duration: 1.2,
        ease: "power2.out",
        delay: i * 0.02,
      }
    );

    gsap.to(p, {
      opacity: 0,
      duration: 0.4,
      delay: i * 0.02 + 1.1,
      onComplete: () => p.remove(),
    });
  });
}

function startIconBobs(items, gsap) {
  items.forEach((it) => {
    const dur = 2 + Math.random();
    const dy = 8 + Math.random() * 4;
    gsap.to(it, {
      y: `-=${dy}`,
      duration: dur,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: Math.random() * 0.5,
    });
  });
}

function enterScene2() {
  const sceneEl = document.querySelector(".scene-2");
  if (!sceneEl) return;

  const boxStage = sceneEl.querySelector("[data-box-stage]");
  const boxClosed = sceneEl.querySelector(".box-closed");
  const boxOpened = sceneEl.querySelector(".box-opened");
  const iconsStage = sceneEl.querySelector("[data-icons-stage]");
  const iconItems = iconsStage
    ? Array.from(iconsStage.querySelectorAll(".icon-item"))
    : [];
  const labels = iconItems.map((i) => i.querySelector(".icon-label"));
  const confettiStage = sceneEl.querySelector("[data-confetti-stage]");
  const hint = sceneEl.querySelector(".scene-hint");
  const tapZone = sceneEl.querySelector(".tap-zone");

  if (!boxStage || !iconItems.length || !tapZone) return;

  tapZone.setAttribute("data-disabled", "true");

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const gsap = window.gsap;

  // Snap-to-final fallback for reduced motion or missing GSAP.
  const snapToFinal = () => {
    iconItems.forEach((it, i) => {
      const p = SCENE2_SCATTER[i];
      it.style.transform = `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${p.rot}deg) scale(1)`;
      it.style.opacity = "1";
    });
    labels.forEach((l) => {
      if (l) l.style.opacity = "0.8";
    });
    if (boxClosed) boxClosed.style.opacity = "0";
    if (boxOpened) boxOpened.style.opacity = "1";
    boxStage.classList.add("is-opened");
    boxStage.setAttribute("aria-disabled", "true");
    if (hint) {
      hint.classList.add("is-revealed");
      hint.style.opacity = "0.6";
    }
    tapZone.setAttribute("data-disabled", "false");
  };

  if (reduced || !gsap) {
    snapToFinal();
    return;
  }

  // Prime icons + confetti pieces with GSAP-friendly transforms so x/y math
  // is relative to the scene-content center.
  gsap.set(iconItems, {
    xPercent: -50,
    yPercent: -50,
    x: 0,
    y: 0,
    scale: 0,
    opacity: 0,
    rotation: 0,
  });

  let opened = false;
  const openBox = () => {
    if (opened) return;
    opened = true;

    const sound = window.__birthday?.sound;
    sound?.play("pop");

    const tl = gsap.timeline();

    // 1. Anticipation: scale up then settle (~0.15s total).
    tl.to(boxStage, { scale: 1.1, duration: 0.075, ease: "power2.out" }).to(
      boxStage,
      { scale: 1, duration: 0.075, ease: "back.out(2)" }
    );

    // 2. Cross-fade closed → opened (same position, 0.2s).
    tl.to(boxClosed, { opacity: 0, duration: 0.2 }, ">").to(
      boxOpened,
      { opacity: 1, duration: 0.2 },
      "<"
    );

    // 3. Stop the wiggle and disable the box button.
    tl.call(() => {
      boxStage.classList.add("is-opened");
      boxStage.setAttribute("aria-disabled", "true");
    });

    // 4 + 5. Icon burst and confetti happen at the same moment.
    tl.addLabel("burst");
    tl.to(
      iconItems,
      {
        x: (i) => SCENE2_SCATTER[i].x,
        y: (i) => SCENE2_SCATTER[i].y,
        rotation: (i) => SCENE2_SCATTER[i].rot,
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.08,
      },
      "burst"
    );
    tl.call(() => burstConfetti(confettiStage, gsap), [], "burst");

    // 6. Labels fade in once the icons have mostly settled.
    tl.to(
      labels.filter(Boolean),
      {
        opacity: 0.8,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      },
      "+=0.2"
    );

    // 7. Idle bobbing per icon (independent infinite tweens).
    tl.call(() => startIconBobs(iconItems, gsap));

    // 8. Reveal "tap to continue" hint.
    if (hint) {
      tl.to(
        hint,
        {
          opacity: 0.6,
          duration: 0.6,
          ease: "power2.out",
          onStart: () => hint.classList.add("is-revealed"),
        },
        "+=0.2"
      );
    }

    // 9. Enable the full-screen tap-zone for advancing to scene 3.
    tl.call(() => tapZone.setAttribute("data-disabled", "false"));
  };

  boxStage.addEventListener("click", openBox);
}

/* ---------- Scene 3 — Year One (Book) ---------- */
const SCENE3_CAPTIONS = [
  "launched my first ux portfolio",
  "4 hackathons, 4 lessons",
  "started sharing the work",
  "shipped specai · joined design xp",
];

function enterScene3() {
  const sceneEl = document.querySelector(".scene-3");
  if (!sceneEl) return;

  const bookStage = sceneEl.querySelector("[data-book-stage]");
  const openedStage = sceneEl.querySelector("[data-book-opened-stage]");
  const pages = Array.from(sceneEl.querySelectorAll(".book-page"));
  const caption = sceneEl.querySelector("[data-book-caption]");
  const indicator = sceneEl.querySelector("[data-page-indicator]");
  const hint = sceneEl.querySelector(".scene-hint");
  const tapZone = sceneEl.querySelector(".tap-zone");
  const intro = sceneEl.querySelector(".scene-3-intro");

  if (!bookStage || !openedStage || !pages.length || !tapZone) return;

  // Page 4 cards primed off-stage so the stagger reveal lands cleanly.
  const page4 = pages[3];
  const leftCard = page4?.querySelector(".page-card--left");
  const rightCard = page4?.querySelector(".page-card--right");

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const gsap = window.gsap;

  let currentPage = 0; // 0 = closed
  let isAnimating = false;

  const getPageEl = (n) => pages[n - 1] || null;
  const setIndicator = (n) => {
    if (indicator) indicator.textContent = `${n} / 4`;
  };

  const openBook = () => {
    isAnimating = true;
    intro?.classList.add("is-hidden");
    bookStage.classList.add("is-opened");
    bookStage.setAttribute("aria-label", "Tap to flip the page");
    openedStage.classList.add("is-visible");

    const page1 = getPageEl(1);
    page1?.classList.add("is-active");

    if (caption) {
      caption.textContent = SCENE3_CAPTIONS[0];
      caption.classList.add("is-visible");
    }

    setIndicator(1);
    indicator?.classList.add("is-visible");

    if (hint) {
      if (gsap && !reduced) {
        gsap.to(hint, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            hint.style.visibility = "hidden";
          },
        });
      } else {
        hint.style.opacity = "0";
        hint.style.visibility = "hidden";
      }
    }

    currentPage = 1;
    window.__birthday?.sound?.play("page-flip");

    // Allow the cross-fade-in (0.4s) to settle before accepting taps.
    window.setTimeout(() => {
      isAnimating = false;
    }, 450);
  };

  const revealPage4Cards = (tl) => {
    if (!leftCard || !rightCard) return;
    tl.fromTo(
      leftCard,
      { x: -30, opacity: 0, rotation: -4 },
      {
        x: 0,
        opacity: 1,
        rotation: -4,
        duration: 0.4,
        ease: "back.out(1.4)",
      }
    );
    tl.fromTo(
      rightCard,
      { x: 30, opacity: 0, rotation: 5 },
      {
        x: 0,
        opacity: 1,
        rotation: 5,
        duration: 0.4,
        ease: "back.out(1.4)",
      },
      "<+0.2"
    );
  };

  const flipToPage = (targetPage) => {
    const currentEl = getPageEl(currentPage);
    const nextEl = getPageEl(targetPage);
    if (!currentEl || !nextEl) return;
    isAnimating = true;
    window.__birthday?.sound?.play("page-flip");

    if (reduced || !gsap) {
      // Snap fallback for reduced-motion / no-GSAP.
      currentEl.classList.remove("is-active");
      nextEl.classList.add("is-active");
      if (caption) caption.textContent = SCENE3_CAPTIONS[targetPage - 1];
      setIndicator(targetPage);
      if (targetPage === 4 && leftCard && rightCard) {
        leftCard.style.opacity = "1";
        rightCard.style.opacity = "1";
      }
      currentPage = targetPage;
      if (targetPage === 4) tapZone.setAttribute("data-disabled", "false");
      isAnimating = false;
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });

    // 1. Fade + scale current page out.
    tl.to(currentEl, {
      scale: 0.92,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    });

    // 2. Class swap (current → next), update indicator.
    tl.add(() => {
      currentEl.classList.remove("is-active");
      gsap.set(currentEl, { clearProps: "scale,opacity" });
      nextEl.classList.add("is-active");
      setIndicator(targetPage);
    });

    // 3. Caption fade out → text change → fade in.
    if (caption) {
      tl.to(caption, { opacity: 0, duration: 0.1 });
      tl.add(() => {
        caption.textContent = SCENE3_CAPTIONS[targetPage - 1];
      });
      tl.to(caption, { opacity: 0.95, duration: 0.2 });
    }

    // 4. Next page scale + opacity in (overlaps with caption fade-in).
    tl.fromTo(
      nextEl,
      { scale: 0.92, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.3)",
      },
      caption ? "<-0.2" : ">"
    );

    // 5. Page 4 special: stagger reveal cards.
    if (targetPage === 4) {
      revealPage4Cards(tl);
      tl.add(() => tapZone.setAttribute("data-disabled", "false"));
    }

    currentPage = targetPage;
  };

  const handleBookTap = () => {
    if (isAnimating) return;
    if (currentPage === 0) {
      openBook();
    } else if (currentPage < 4) {
      flipToPage(currentPage + 1);
    }
    // currentPage === 4: tap-zone is enabled and handles advance.
  };

  bookStage.addEventListener("click", handleBookTap);
}

/* ---------- Scene 4 — Letters to self ---------- */
function enterScene4() {
  const sceneEl = document.querySelector(".scene-4");
  if (!sceneEl) return;

  const envelopes = {
    1: sceneEl.querySelector('[data-envelope="1"]'),
    2: sceneEl.querySelector('[data-envelope="2"]'),
  };
  const letters = {
    1: sceneEl.querySelector('[data-letter="1"]'),
    2: sceneEl.querySelector('[data-letter="2"]'),
  };
  const backdrop = sceneEl.querySelector("[data-letter-backdrop]");
  const advanceHint = sceneEl.querySelector(".scene-hint--advance");

  if (!envelopes[1] || !envelopes[2] || !backdrop) return;

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const gsap = window.gsap;
  const transitionMs = reduced ? 0 : 400;

  const state = {
    open: { 1: false, 2: false },
    openedOnce: { 1: false, 2: false },
    isAnimating: false,
    autoAdvanceTimer: null,
    hasAdvanced: false,
  };

  const isOpen = (n) => state.open[n];
  const other = (n) => (n === 1 ? 2 : 1);

  const syncBackdrop = () => {
    const show = state.open[1] || state.open[2];
    backdrop.classList.toggle("is-visible", show);
    backdrop.setAttribute("aria-hidden", show ? "false" : "true");
  };

  const scheduleAutoAdvance = () => {
    if (!state.openedOnce[1] || !state.openedOnce[2] || state.hasAdvanced) return;

    window.clearTimeout(state.autoAdvanceTimer);
    state.autoAdvanceTimer = window.setTimeout(() => {
      if (state.hasAdvanced) return;
      state.hasAdvanced = true;

      if (advanceHint) {
        advanceHint.classList.add("is-visible");
        advanceHint.setAttribute("aria-hidden", "false");
        if (gsap && !reduced) {
          gsap.to(advanceHint, { opacity: 0.9, duration: 0.4, ease: "power2.out" });
        } else {
          advanceHint.style.opacity = "0.9";
        }
      }

      window.setTimeout(() => {
        window.__birthday?.scenes?.next();
      }, 1000);
    }, 1500);
  };

  const showLetter = (n) => {
    const letter = letters[n];
    const envelope = envelopes[n];
    if (!letter || !envelope) return;

    envelope.classList.add("is-open");
    envelope.setAttribute("aria-label", "Close letter");
    letter.setAttribute("aria-hidden", "false");
    syncBackdrop();
    requestAnimationFrame(() => letter.classList.add("is-visible"));
  };

  const hideLetter = (n) =>
    new Promise((resolve) => {
      const letter = letters[n];
      const envelope = envelopes[n];
      if (!letter || !envelope) {
        resolve();
        return;
      }

      letter.classList.remove("is-visible");
      syncBackdrop();

      window.setTimeout(() => {
        envelope.classList.remove("is-open");
        envelope.setAttribute(
          "aria-label",
          n === 1 ? "Open letter to past me" : "Open letter to future me"
        );
        letter.setAttribute("aria-hidden", "true");
        resolve();
      }, transitionMs);
    });

  const openEnvelope = async (n) => {
    if (isOpen(other(n))) {
      state.isAnimating = true;
      state.open[other(n)] = false;
      await hideLetter(other(n));
      state.isAnimating = false;
    }

    state.open[n] = true;
    state.openedOnce[n] = true;
    showLetter(n);
    window.__birthday?.sound?.play("pop");
    scheduleAutoAdvance();
  };

  const closeEnvelope = async (n) => {
    state.isAnimating = true;
    state.open[n] = false;
    await hideLetter(n);
    state.isAnimating = false;
    scheduleAutoAdvance();
  };

  const closeAnyOpen = async () => {
    if (state.isAnimating) return;
    if (isOpen(1)) await closeEnvelope(1);
    else if (isOpen(2)) await closeEnvelope(2);
  };

  const handleEnvelopeTap = async (n) => {
    if (state.isAnimating) return;

    if (isOpen(n)) {
      await closeEnvelope(n);
    } else {
      await openEnvelope(n);
    }
  };

  envelopes[1].addEventListener("click", () => handleEnvelopeTap(1));
  envelopes[2].addEventListener("click", () => handleEnvelopeTap(2));
  backdrop.addEventListener("click", closeAnyOpen);
}

/* ---------- Scene 5 — Make a wish (Cake) ---------- */
const SCENE5_CONFETTI_COLORS = [
  "#e89888",
  "#f0a858",
  "#f5b5ae",
  "#fbe5d0",
  "#ffffff",
];

const SCENE5_SMOKE_PATHS = [
  "M 30 0 Q 25 -25 35 -50 Q 45 -70 30 -90",
  "M 60 0 Q 55 -25 65 -50 Q 75 -75 60 -100",
  "M 90 0 Q 85 -25 95 -50 Q 105 -70 90 -90",
];

function createConfettiEl(color, shapeIndex) {
  const el = document.createElement("span");
  el.className = "confetti-particle";
  const size = 6 + Math.random() * 8;
  el.style.width = `${size}px`;
  el.style.height =
    shapeIndex === 1 ? `${size * 0.45}px` : `${size}px`;
  el.style.backgroundColor = color;
  el.style.borderRadius = shapeIndex === 0 ? "50%" : shapeIndex === 1 ? "2px" : "0";
  if (shapeIndex === 2) {
    el.style.clipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
    el.style.backgroundColor = color;
  }
  el.style.opacity = "0.7";
  return el;
}

function generateSmokeWisps(stage, gsap, reduced) {
  if (!stage || !gsap) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 120 110");
  svg.setAttribute("aria-hidden", "true");

  const paths = SCENE5_SMOKE_PATHS.map((d, i) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("stroke", "#C9BDB5");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0");
    svg.appendChild(path);
    return path;
  });

  stage.appendChild(svg);
  stage.setAttribute("aria-hidden", "false");

  if (reduced) {
    window.setTimeout(() => svg.remove(), 200);
    return;
  }

  gsap.fromTo(
    paths,
    { y: 0, opacity: 0 },
    {
      y: -160,
      opacity: 0.6,
      duration: 1.0,
      ease: "sine.out",
      stagger: 0.1,
    }
  );
  gsap.to(paths, {
    opacity: 0,
    duration: 1.0,
    delay: 1.0,
    ease: "sine.in",
    onComplete: () => svg.remove(),
  });
}

function generateBurstConfetti(stage, gsap, reduced) {
  if (!stage || reduced) return;

  const count = 22 + Math.floor(Math.random() * 4);
  const particles = [];

  for (let i = 0; i < count; i++) {
    const color =
      SCENE5_CONFETTI_COLORS[i % SCENE5_CONFETTI_COLORS.length];
    const el = createConfettiEl(color, i % 3);
    stage.appendChild(el);
    particles.push(el);

    const angle = (Math.random() * Math.PI * 2);
    const dist = 80 + Math.random() * 120;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 40;
    const rot = (Math.random() - 0.5) * 720;

    gsap.fromTo(
      el,
      {
        x: stage.offsetWidth / 2,
        y: stage.offsetHeight * 0.15,
        scale: 0.5,
        opacity: 1,
        rotation: 0,
      },
      {
        x: stage.offsetWidth / 2 + tx,
        y: stage.offsetHeight * 0.15 + ty,
        scale: 1,
        opacity: 0,
        rotation: rot,
        duration: 1.2,
        ease: "power2.out",
        delay: i * 0.02,
        onComplete: () => el.remove(),
      }
    );
  }

  stage.setAttribute("aria-hidden", "false");
}

function enterScene5() {
  const sceneEl = document.querySelector(".scene-5");
  if (!sceneEl) return;

  const caption = sceneEl.querySelector(".scene-5__caption");
  const hint = sceneEl.querySelector(".scene-5__hint");
  const cakeStage = sceneEl.querySelector("[data-cake-stage]");
  const cakeTap = sceneEl.querySelector("[data-cake-tap]");
  const ambientStage = sceneEl.querySelector("[data-ambient-confetti]");
  const smokeStage = sceneEl.querySelector("[data-smoke-stage]");
  const burstStage = sceneEl.querySelector("[data-burst-stage]");
  const finalBackdrop = sceneEl.querySelector("[data-final-backdrop]");
  const finalMessage = sceneEl.querySelector("[data-final-message]");
  const flamesGroup = sceneEl.querySelector("#flames");
  const flameEls = sceneEl.querySelectorAll(
    "#flame-left, #flame-center, #flame-right"
  );

  if (!cakeStage || !cakeTap || !ambientStage) return;

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const gsap = window.gsap;

  let isBlown = false;
  let ambientInterval = null;

  const stopAmbientConfetti = () => {
    if (ambientInterval) {
      window.clearInterval(ambientInterval);
      ambientInterval = null;
    }
  };

  const spawnAmbientParticle = () => {
    if (isBlown || !gsap) return;

    const color =
      SCENE5_CONFETTI_COLORS[
        Math.floor(Math.random() * SCENE5_CONFETTI_COLORS.length)
      ];
    const el = createConfettiEl(color, Math.floor(Math.random() * 3));
    ambientStage.appendChild(el);

    const startX = Math.random() * ambientStage.offsetWidth;
    const drift = (Math.random() - 0.5) * 80;
    const duration = 6 + Math.random() * 4;
    const rot = (Math.random() - 0.5) * 360;

    gsap.fromTo(
      el,
      { x: startX, y: -20, rotation: 0, opacity: 0.7 },
      {
        x: startX + drift,
        y: window.innerHeight + 40,
        rotation: rot,
        duration,
        ease: "none",
        onComplete: () => el.remove(),
      }
    );
  };

  const startAmbientConfetti = () => {
    if (reduced) return;
    spawnAmbientParticle();
    ambientInterval = window.setInterval(spawnAmbientParticle, 200);
  };

  const showFinalMessage = () => {
    stopAmbientConfetti();

    finalMessage?.classList.add("is-visible");
    finalMessage?.setAttribute("aria-hidden", "false");

    if (gsap && !reduced) {
      gsap.to([caption, hint], {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      if (caption) caption.style.opacity = "0";
      if (hint) hint.style.opacity = "0";
    }
  };

  const blowOutCake = () => {
    console.log("blowOutCake fired");
    if (isBlown) return;
    isBlown = true;
    cakeStage.classList.add("is-blown");
    cakeTap.setAttribute("disabled", "true");
    cakeTap.style.pointerEvents = "none";

    window.__birthday?.sound?.play("whoosh");

    if (reduced || !gsap) {
      if (flamesGroup) flamesGroup.style.opacity = "0";
      showFinalMessage();
      return;
    }

    // Stop CSS flicker animations via inline style BEFORE GSAP tweens.
    // CSS keyframe animations override GSAP inline styles for animated properties
    // (opacity in this case), so we must stop the animation first.
    Array.from(flameEls).forEach((el) => { el.style.animation = "none"; });
    gsap.killTweensOf(flameEls);

    console.log("flames opacity tween started");
    // Phase 2 — Pure opacity fade, left → center → right wave (no scale, y, or rotation)
    gsap.to(flameEls[0], { opacity: 0, duration: 0.6, ease: "power2.in" });
    gsap.to(flameEls[1], { opacity: 0, duration: 0.6, ease: "power2.in", delay: 0.15 });
    gsap.to(flameEls[2], { opacity: 0, duration: 0.6, ease: "power2.in", delay: 0.3 });

    // Phases 3-5 via gsap.delayedCall — a tween-free timeline has duration 0
    // and never advances, so its callbacks would silently never fire.
    gsap.delayedCall(0.7, () => {
      console.log("smoke generation started");
      generateSmokeWisps(smokeStage, gsap, reduced);
    });
    gsap.delayedCall(1.0, () => generateBurstConfetti(burstStage, gsap, reduced));
    gsap.delayedCall(2.0, showFinalMessage);
  };

  // Fade in caption on scene entry
  window.setTimeout(() => {
    caption?.classList.add("is-visible");
    if (gsap && caption && !reduced) {
      gsap.fromTo(
        caption,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, 500);

  startAmbientConfetti();
  cakeTap.addEventListener("click", blowOutCake);
}

function handleSceneEntered(event) {
  const n = event.detail?.scene;
  if (n === 1 && !sceneEnteredOnce.has(1)) {
    sceneEnteredOnce.add(1);
    enterScene1();
  } else if (n === 2 && !sceneEnteredOnce.has(2)) {
    sceneEnteredOnce.add(2);
    enterScene2();
  } else if (n === 3 && !sceneEnteredOnce.has(3)) {
    sceneEnteredOnce.add(3);
    enterScene3();
  } else if (n === 4 && !sceneEnteredOnce.has(4)) {
    sceneEnteredOnce.add(4);
    enterScene4();
  } else if (n === 5 && !sceneEnteredOnce.has(5)) {
    sceneEnteredOnce.add(5);
    enterScene5();
  }
}

function setupTapZones(scenes) {
  const scene1Tap = document.querySelector('.scene-1 [data-tap-advance="1"]');
  scene1Tap?.addEventListener("click", () => scenes.next());

  const scene2Tap = document.querySelector('.scene-2 [data-tap-advance="2"]');
  scene2Tap?.addEventListener("click", () => scenes.next());

  const scene3Tap = document.querySelector('.scene-3 [data-tap-advance="3"]');
  scene3Tap?.addEventListener("click", () => scenes.next());
}

/* ---------- Preloader ---------- */
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function preloadCriticalAssets() {
  await Promise.all(CRITICAL_ASSETS.map(preloadImage));
}

function hidePreloader() {
  document.body.classList.add("is-ready");
  const preloader = document.querySelector("[data-preloader]");
  preloader?.setAttribute("aria-busy", "false");
}

/* ---------- Init ---------- */
async function boot() {
  await preloadCriticalAssets();
  init();
  hidePreloader();
}

function init() {
  const scenes = new SceneManager();
  const sound = new SoundManager();

  document.addEventListener("scene:entered", handleSceneEntered);
  setupTapZones(scenes);

  // Expose for debugging during development.
  window.__birthday = { scenes, sound };

  document.dispatchEvent(
    new CustomEvent("scene:entered", { detail: { scene: scenes.currentScene } })
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => boot());
} else {
  boot();
}
