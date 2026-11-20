import { useEffect } from "react";
import { useExperience } from "../../context/ExperienceProvider";
import { useSecrets } from "../../hooks/useSecrets";
import { profile } from "../../data/profile";

const IDLE_MS = 45_000;

/** Invisible component: wires up every hidden trigger that is not a visible button. */
const Secrets = () => {
  const xp = useExperience();

  useSecrets({
    disco: () => xp.setDisco(!xp.disco),
    party: () => xp.setDisco(!xp.disco),
    hello: () => xp.notify("👋 Hey! Thanks for stopping by. Press Ctrl+K to explore."),
    yug: () => xp.notify("That's me! Try typing 'disco'…"),
    coffee: () => {
      xp.unlock("coffee");
      xp.notify("☕ Brewing… (this site runs on cold brew)");
    },
    theme: () => xp.cycleTheme(),
  });

  // Logo: 7 quick clicks.
  useEffect(() => {
    let clicks = 0;
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".navbar-title")) return;
      clicks += 1;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (clicks = 0), 900);
      if (clicks >= 7) {
        clicks = 0;
        e.preventDefault();
        xp.unlock("logo");
        xp.confetti();
        xp.notify("👆 Okay okay, you found it.");
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle: 45 s of nothing.
  useEffect(() => {
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.visibilityState !== "visible") return;
        xp.unlock("idle");
        xp.notify("🧘 Still there? Take your time. I'll be here.");
      }, IDLE_MS);
    };
    const events = ["pointermove", "keydown", "scroll", "pointerdown"] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, reset));
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DevTools greeting + a tiny console API.
  useEffect(() => {
    const api = {
      hire: () => {
        xp.unlock("hire");
        xp.confetti();
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Let's talk")}`;
        return "Opening your mail client…";
      },
      terminal: () => (xp.open("terminal"), "Terminal opened."),
      theme: (name?: string) => xp.setTheme(name),
      disco: () => (xp.setDisco(true), "🪩"),
      badges: () => xp.badges,
      help: () => "yug.hire() · yug.terminal() · yug.theme('amber') · yug.disco() · yug.badges()",
    };
    (window as unknown as { yug: typeof api }).yug = api;
    xp.unlock("console");
    console.log(
      "%cYug Jain%c — you opened DevTools. Respect.\nTry %cyug.help()",
      "font:700 18px system-ui;color:#5eead4",
      "font:14px system-ui",
      "font:700 14px ui-monospace,monospace;color:#fbbf24"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Secrets;
