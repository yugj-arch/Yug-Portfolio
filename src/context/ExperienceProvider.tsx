import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { playTone } from "../utils/sound";
import { fireConfetti } from "../utils/confetti";
import { BADGES, BadgeId } from "../data/badges";
import { applyTheme, THEMES, THEME_KEY, ThemeName } from "../data/themes";

type Tone = Parameters<typeof playTone>[0];

export type Overlay = "terminal" | "palette" | "game" | "recruiter" | "badges" | "perf" | null;

interface ExperienceType {
  overlay: Overlay;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  projectSlug: string | null;
  openProject: (slug: string) => void;
  closeProject: () => void;
  muted: boolean;
  toggleMuted: () => void;
  godMode: boolean;
  setGodMode: (on: boolean) => void;
  matrix: boolean;
  runMatrix: () => void;
  sfx: (tone: Tone) => void;
  confetti: () => void;
  toast: string | null;
  notify: (message: string) => void;
  online: boolean;
  badges: BadgeId[];
  unlock: (id: BadgeId) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  noteProjectViewed: (slug: string) => void;
  disco: boolean;
  setDisco: (on: boolean) => void;
  setTheme: (name?: string) => string;
  cycleTheme: () => void;
}

const ExperienceContext = createContext<ExperienceType | null>(null);

const STORAGE = {
  muted: "yj:muted",
  recruiter: "yj:recruiter",
  god: "yj:god",
  badges: "yj:badges",
  viewed: "yj:viewed",
};

function readList<T extends string>(key: string): T[] {
  try {
    const v = JSON.parse(read(key) || "[]");
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

function initialOverlay(): Overlay {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "recruiter" || window.location.hash === "#recruiter") return "recruiter";
  if (mode === "immersive") return null;
  return read(STORAGE.recruiter) === "1" ? "recruiter" : null;
}

/** Pause GSAP ScrollSmoother while an overlay is up so the page behind stays put. */
function setPagePaused(paused: boolean) {
  document.documentElement.classList.toggle("overlay-open", paused);
  import("../components/Navbar")
    .then((m) => {
      if (!m.smoother) return;
      // The loader keeps the smoother paused until the intro finishes; never unpause early.
      if (!paused && document.querySelector(".loading-screen")) return;
      m.smoother.paused(paused);
    })
    .catch(() => undefined);
}

export const ExperienceProvider = ({ children }: PropsWithChildren) => {
  const [overlay, setOverlay] = useState<Overlay>(initialOverlay);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => read(STORAGE.muted) !== "0");
  const [godMode, setGodModeState] = useState(() => read(STORAGE.god) === "1");
  const [matrix, setMatrix] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [chatOpen, setChatOpenState] = useState(false);
  const toastTimer = useRef<number>();
  const [disco, setDiscoState] = useState(false);
  const [badges, setBadges] = useState<BadgeId[]>(() =>
    readList<BadgeId>(STORAGE.badges).filter((id) => BADGES.some((b) => b.id === id))
  );
  const badgesRef = useRef(badges);
  badgesRef.current = badges;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const sfx = useCallback((tone: Tone) => {
    if (!mutedRef.current) playTone(tone);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const unlock = useCallback(
    (id: BadgeId) => {
      if (badgesRef.current.includes(id)) return;
      const next = [...badgesRef.current, id];
      badgesRef.current = next;
      setBadges(next);
      write(STORAGE.badges, JSON.stringify(next));
      const badge = BADGES.find((b) => b.id === id)!;
      window.setTimeout(() => {
        notify(`${badge.emoji} Badge unlocked: ${badge.name} (${next.length}/${BADGES.length})`);
        sfx("success");
        if (next.length === BADGES.length) {
          fireConfetti();
          window.setTimeout(() => notify("🏆 All badges unlocked. You found everything. Now hire Yug!"), 3400);
        }
      }, 350);
    },
    [notify, sfx]
  );

  const setChatOpen = useCallback(
    (next: boolean) => {
      setChatOpenState(next);
      sfx(next ? "open" : "close");
    },
    [sfx]
  );

  const noteProjectViewed = useCallback(
    (slug: string) => {
      const viewed = Array.from(new Set([...readList<string>(STORAGE.viewed), slug]));
      write(STORAGE.viewed, JSON.stringify(viewed));
      if (viewed.length >= 3) unlock("deep-diver");
    },
    [unlock]
  );

  const open = useCallback(
    (next: Exclude<Overlay, null>) => {
      setProjectSlug(null);
      setOverlay(next);
      if (next === "recruiter") {
        write(STORAGE.recruiter, "1");
        unlock("recruiter");
      }
      if (next === "terminal") unlock("shell");
      if (next === "palette") unlock("palette");
      if (next === "game") unlock("gamer");
      sfx("open");
    },
    [sfx, unlock]
  );

  const close = useCallback(() => {
    setOverlay((prev) => {
      if (prev === "recruiter") write(STORAGE.recruiter, null);
      return null;
    });
    sfx("close");
  }, [sfx]);

  const openProject = useCallback(
    (slug: string) => {
      setOverlay((prev) => (prev === "recruiter" ? prev : null));
      setProjectSlug(slug);
      noteProjectViewed(slug);
      sfx("open");
    },
    [sfx, noteProjectViewed]
  );
  const closeProject = useCallback(() => {
    setProjectSlug(null);
    sfx("close");
  }, [sfx]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      write(STORAGE.muted, next ? "1" : "0");
      if (!next) playTone("success");
      return next;
    });
  }, []);

  useEffect(() => {
    if (!muted) unlock("audio");
  }, [muted, unlock]);

  const setGodMode = useCallback(
    (on: boolean) => {
      setGodModeState(on);
      write(STORAGE.god, on ? "1" : null);
      if (on) {
        playTone("power"); // the Konami code is a deliberate gesture: always give audio feedback
        notify("GOD MODE on. Enter the code again to exit.");
        unlock("konami");
      } else {
        sfx("close");
        notify("God mode off.");
      }
    },
    [notify, sfx, unlock]
  );

  const runMatrix = useCallback(() => {
    unlock("matrix");
    setMatrix(true);
    window.setTimeout(() => setMatrix(false), 6000);
  }, [unlock]);

  const confetti = useCallback(() => fireConfetti(), []);

  const setDisco = useCallback(
    (on: boolean) => {
      setDiscoState(on);
      if (on) {
        unlock("disco");
        notify("🪩 Disco mode. Type it again to stop.");
        sfx("power");
      }
    },
    [notify, sfx, unlock]
  );

  const setTheme = useCallback(
    (name?: string) => {
      const names = Object.keys(THEMES) as ThemeName[];
      if (!name || !names.includes(name as ThemeName)) return `Themes: ${names.join(", ")}`;
      applyTheme(name as ThemeName);
      write(THEME_KEY, name);
      unlock("theme");
      sfx("click");
      return `Theme set to ${name}.`;
    },
    [sfx, unlock]
  );

  const cycleTheme = useCallback(() => {
    const names = Object.keys(THEMES) as ThemeName[];
    const current = (document.documentElement.dataset.theme as ThemeName) || "teal";
    const next = names[(names.indexOf(current) + 1) % names.length];
    notify(setTheme(next));
  }, [notify, setTheme]);

  // Restore saved theme; disco is a pure CSS class.
  useEffect(() => {
    const saved = read(THEME_KEY) as ThemeName | null;
    if (saved && saved in THEMES) applyTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("disco", disco);
  }, [disco]);

  // Theme switch for god mode.
  useEffect(() => {
    document.documentElement.classList.toggle("god-mode", godMode);
  }, [godMode]);

  // Keep the page behind overlays still.
  useEffect(() => {
    const anyOpen = overlay !== null || projectSlug !== null;
    setPagePaused(anyOpen);
  }, [overlay, projectSlug]);

  useEffect(() => {
    if (!online) unlock("offline");
  }, [online, unlock]);

  // Online / offline status.
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  // Global shortcuts: Ctrl/Cmd+K palette, Ctrl+` terminal, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (overlay === "palette") close();
        else open("palette");
        return;
      }
      if (e.ctrlKey && (e.code === "Backquote" || e.key === "`" || e.key === "~")) {
        e.preventDefault();
        if (overlay === "terminal") close();
        else open("terminal");
        return;
      }
      if (e.key === "Escape") {
        if (projectSlug) closeProject();
        else if (overlay) close();
        else if (chatOpen) setChatOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay, projectSlug, open, close, closeProject, chatOpen, setChatOpen]);

  const value = useMemo<ExperienceType>(
    () => ({
      overlay,
      open,
      close,
      projectSlug,
      openProject,
      closeProject,
      muted,
      toggleMuted,
      godMode,
      setGodMode,
      matrix,
      runMatrix,
      sfx,
      confetti,
      toast,
      notify,
      online,
      badges,
      unlock,
      noteProjectViewed,
      chatOpen,
      setChatOpen,
      disco,
      setDisco,
      setTheme,
      cycleTheme,
    }),
    [
      overlay,
      open,
      close,
      projectSlug,
      openProject,
      closeProject,
      muted,
      toggleMuted,
      godMode,
      setGodMode,
      matrix,
      runMatrix,
      sfx,
      confetti,
      toast,
      notify,
      online,
      badges,
      unlock,
      noteProjectViewed,
      chatOpen,
      setChatOpen,
      disco,
      setDisco,
      setTheme,
      cycleTheme,
    ]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) throw new Error("useExperience must be used within an ExperienceProvider");
  return context;
};
