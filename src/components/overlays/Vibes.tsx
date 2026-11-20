import { CSSProperties, useEffect } from "react";
import { useExperience } from "../../context/ExperienceProvider";
import { AWAY_TITLE, BURSTS, greeting } from "../../data/vibes";

const DOODLES = ["✨", "🌿", "☕", "🎧", "🌙", "🫧"];

/** Playful layer: click bursts, drifting doodles, welcome note, tab-title mood. Pure DOM + CSS. */
const Vibes = () => {
  const { notify } = useExperience();

  // Click / tap bursts.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      if (document.documentElement.classList.contains("overlay-open")) return;
      if (document.querySelectorAll(".vibe-burst").length > 24) return;
      const set = BURSTS[document.documentElement.dataset.theme || "teal"] || BURSTS.teal;
      const n = 4;
      for (let i = 0; i < n; i++) {
        const el = document.createElement("span");
        el.className = "vibe-burst";
        el.textContent = set[Math.floor(Math.random() * set.length)];
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.9;
        const d = 36 + Math.random() * 46;
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.style.setProperty("--dx", `${Math.cos(a) * d}px`);
        el.style.setProperty("--dy", `${Math.sin(a) * d - 30}px`);
        el.style.setProperty("--rot", `${(Math.random() - 0.5) * 80}deg`);
        el.addEventListener("animationend", () => el.remove(), { once: true });
        document.body.appendChild(el);
      }
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  // Friendly hello once the intro has played.
  useEffect(() => {
    const id = window.setTimeout(() => notify(greeting()), 9000);
    return () => window.clearTimeout(id);
  }, [notify]);

  // Tab title when you wander off.
  useEffect(() => {
    const original = document.title;
    const onVis = () => {
      document.title = document.hidden ? AWAY_TITLE : original;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      document.title = original;
    };
  }, []);

  return (
    <div className="vibe-doodles" aria-hidden="true">
      {DOODLES.map((d, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties}>
          {d}
        </span>
      ))}
    </div>
  );
};

export default Vibes;
