import { useEffect } from "react";

/**
 * Elements with `data-magnetic` lean toward the cursor when it comes close.
 * Uses the `translate` property so it never fights an element's own `transform`.
 */
export function useMagnetic() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const active = new Set<HTMLElement>();

    const update = () => {
      raf = 0;
      const els = document.querySelectorAll<HTMLElement>("[data-magnetic]");
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const reach = Math.max(r.width, r.height) * 0.9 + 24;
        if (Math.hypot(dx, dy) < reach) {
          el.style.translate = `${dx * 0.22}px ${dy * 0.3}px`;
          el.style.transition = "translate 0.15s ease-out";
          active.add(el);
        } else if (active.has(el)) {
          el.style.translate = "";
          el.style.transition = "translate 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
          active.delete(el);
        }
      });
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      active.forEach((el) => (el.style.translate = ""));
    };
  }, []);
}
