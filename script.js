/* =========================================================
   Birthday Site — Core Skeleton
   Tap-to-advance navigation + sound toggle.
   Scene content is built incrementally in later phases.
   ========================================================= */

const TOTAL_SCENES = 5;

/* ---------- Scene Manager ---------- */
class SceneManager {
  constructor() {
    this.currentScene = 1;
    this.isTransitioning = false;
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
    this.enabled = false;
    this.button = document.querySelector("[data-sound-toggle]");
    this.iconEl = this.button?.querySelector(".sound-toggle__icon");
    this.sounds = new Map();

    this.button?.addEventListener("click", () => this.toggle());
  }

  toggle() {
    this.enabled = !this.enabled;

    if (this.button) {
      this.button.classList.toggle("is-on", this.enabled);
      this.button.setAttribute("aria-pressed", String(this.enabled));
    }
    if (this.iconEl) {
      this.iconEl.textContent = this.enabled ? "🔊" : "🔇";
    }
  }

  /**
   * Placeholder for future scene-specific audio.
   * Sounds are wired up in their respective scene phases.
   */
  play(soundName) {
    if (!this.enabled) return;
    // Audio playback wiring intentionally deferred to scene phases.
    void soundName;
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
// doll-figure, notebook, croissant, phone, books.
// All y values are NEGATIVE so icons burst UP from the box (which is anchored
// near the bottom of the scene).
const SCENE2_SCATTER = [
  { x: -130, y: -200, rot: -8 },
  { x: 110, y: -240, rot: 10 },
  { x: -150, y: -100, rot: -5 },
  { x: 130, y: -120, rot: 6 },
  { x: -60, y: -320, rot: -12 },
  { x: 80, y: -310, rot: 4 },
  { x: -120, y: -50, rot: -3 },
  { x: 140, y: -70, rot: 8 },
  { x: 0, y: -380, rot: 0 },
  { x: 0, y: -180, rot: -5 },
];

const SCENE2_CONFETTI_COLORS = [
  "#E89888",
  "#F0A858",
  "#C8665E",
  "#FFF8EB",
  "#FBE5D0",
];

const SVG_NS = "http://www.w3.org/2000/svg";

function makeConfettiPiece(index) {
  const wrap = document.createElement("span");
  wrap.className = "confetti-piece";

  const svg = document.createElementNS(SVG_NS, "svg");
  const size = 14 + Math.floor(Math.random() * 10);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("aria-hidden", "true");
  svg.style.filter = "drop-shadow(0 2px 3px rgba(200, 102, 94, 0.35))";
  svg.style.display = "block";

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
  const N = 18;
  const pieces = [];
  for (let i = 0; i < N; i++) {
    const piece = makeConfettiPiece(i);
    stage.appendChild(piece);
    pieces.push(piece);
  }

  // Center each piece via GSAP transform so x/y math is relative to center.
  gsap.set(pieces, { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  pieces.forEach((p, i) => {
    const angle = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 110 + Math.random() * 80;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 30; // slight upward bias
    const rot = (Math.random() - 0.5) * 540;

    gsap.fromTo(
      p,
      { opacity: 0, x: 0, y: 0, scale: 0.4, rotation: 0 },
      {
        opacity: 1,
        x: tx,
        y: ty,
        scale: 1.1,
        rotation: rot,
        duration: 1.4,
        ease: "power2.out",
        delay: i * 0.02,
      }
    );

    gsap.to(p, {
      opacity: 0,
      duration: 0.6,
      delay: i * 0.02 + 1.2,
      ease: "power1.in",
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

  // Compute the box center relative to the scene so icons + confetti can use
  // it as their (0, 0) origin. The box is anchored toward the bottom, so this
  // must be measured at runtime rather than assumed to be 50%/50%.
  const syncBoxCenter = () => {
    const sceneRect = sceneEl.getBoundingClientRect();
    const boxRect = boxStage.getBoundingClientRect();
    const cx = boxRect.left - sceneRect.left + boxRect.width / 2;
    const cy = boxRect.top - sceneRect.top + boxRect.height / 2;
    sceneEl.style.setProperty("--box-center-x", `${cx}px`);
    sceneEl.style.setProperty("--box-center-y", `${cy}px`);
  };
  syncBoxCenter();
  window.addEventListener("resize", syncBoxCenter);

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
      hint.style.opacity = "0.85";
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

    // 1. Anticipation: scale + rotate, then settle (~0.25s).
    tl.to(boxStage, {
      scale: 1.15,
      rotation: -4,
      duration: 0.12,
      ease: "power2.out",
    }).to(boxStage, {
      scale: 1.05,
      rotation: 2,
      duration: 0.13,
      ease: "power2.out",
    });

    // 2. Cross-fade closed → opened with a small settle (0.3s).
    tl.to(boxClosed, { opacity: 0, duration: 0.3, ease: "power2.out" }, ">")
      .to(boxOpened, { opacity: 1, duration: 0.3, ease: "power2.out" }, "<")
      .to(boxStage, { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2)" }, "<");

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
          opacity: 0.85,
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

function handleSceneEntered(event) {
  const n = event.detail?.scene;
  if (n === 1 && !sceneEnteredOnce.has(1)) {
    sceneEnteredOnce.add(1);
    enterScene1();
  } else if (n === 2 && !sceneEnteredOnce.has(2)) {
    sceneEnteredOnce.add(2);
    enterScene2();
  }
}

function setupTapZones(scenes) {
  const scene1Tap = document.querySelector('.scene-1 [data-tap-advance="1"]');
  scene1Tap?.addEventListener("click", () => scenes.next());

  const scene2Tap = document.querySelector('.scene-2 [data-tap-advance="2"]');
  scene2Tap?.addEventListener("click", () => scenes.next());
}

/* ---------- Init ---------- */
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
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
