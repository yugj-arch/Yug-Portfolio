/** Scroll to a section, going through GSAP ScrollSmoother on desktop when it is running. */
export async function scrollToSection(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  {
    try {
      const { smoother } = await import("../components/Navbar");
      if (smoother) {
        smoother.paused(false);
        smoother.scrollTo(selector, !reducedMotion, "top top");
        return;
      }
    } catch {
      /* fall through to native scrolling */
    }
  }
  el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}
