/** Scroll to a section, going through GSAP ScrollSmoother on desktop when it is running. */
export async function scrollToSection(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (window.innerWidth > 1024) {
    try {
      const { smoother } = await import("../components/Navbar");
      if (smoother) {
        smoother.paused(false);
        smoother.scrollTo(selector, true, "top top");
        return;
      }
    } catch {
      /* fall through to native scrolling */
    }
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
