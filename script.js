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

function handleSceneEntered(event) {
  const n = event.detail?.scene;
  if (n === 1 && !sceneEnteredOnce.has(1)) {
    sceneEnteredOnce.add(1);
    enterScene1();
  }
}

function setupTapZones(scenes) {
  const scene1Tap = document.querySelector('.scene-1 [data-tap-advance="1"]');
  scene1Tap?.addEventListener("click", () => scenes.next());
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
