import { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";
import { loadedAssets, rate, vitals, Vitals } from "../../utils/vitals";

const METRICS: { key: keyof Vitals; label: string; unit: "ms" | "" }[] = [
  { key: "ttfb", label: "Time to first byte", unit: "ms" },
  { key: "fcp", label: "First contentful paint", unit: "ms" },
  { key: "lcp", label: "Largest contentful paint", unit: "ms" },
  { key: "cls", label: "Cumulative layout shift", unit: "" },
  { key: "inp", label: "Slowest interaction (INP)", unit: "ms" },
];

const STACK: [string, string][] = [
  ["Frontend", "React 18 + TypeScript, built with Vite. Every overlay (terminal, palette, game, chat, this panel) is a lazy chunk loaded on first use."],
  ["3D", "Three.js through React Three Fiber: rigged character scene, a bloom-lit particle galaxy, and a Rapier physics pit you can grab and throw."],
  ["Motion", "GSAP ScrollSmoother + ScrollTrigger, SplitText reveals. Respects prefers-reduced-motion."],
  ["AI chat", "Vercel Function streaming Claude, grounded on the resume with a cached system prompt. Falls back to an in-browser answer engine offline."],
  ["Offline", "Build-time generated service worker: precached app shell, cache-first hashed assets, stale-while-revalidate media."],
  ["Data", "One typed source of truth (profile.ts) feeds the site, the recruiter view, the terminal, the chat and the JSON-LD for search engines."],
  ["A11y", "Focus-trapped dialogs, keyboard shortcuts, live regions for chat and terminal, a no-JS fallback, and a print-ready recruiter page."],
];

const fmt = (key: keyof Vitals, v: number) => (key === "cls" ? v.toFixed(3) : `${Math.round(v)}`);

const UnderTheHood = () => {
  const { close, online } = useExperience();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef);
  const [, tick] = useState(0);
  const [sw, setSw] = useState<"active" | "none" | "unsupported">("none");

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    if (!("serviceWorker" in navigator)) setSw("unsupported");
    else navigator.serviceWorker.getRegistration().then((r) => setSw(r?.active ? "active" : "none"));
    return () => window.clearInterval(id);
  }, []);

  const assets = loadedAssets();
  const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;

  return (
    <div className="ov-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="ov-panel hood" role="dialog" aria-modal="true" aria-labelledby="hood-title" ref={panelRef}>
        <button className="ov-close" onClick={close} aria-label="Close">
          <MdClose />
        </button>
        <p className="pm-cat">Under the hood</p>
        <h2 id="hood-title">How this site is built, measured live</h2>
        <p className="hood-sub">These numbers come from your browser, right now, not from a lab test.</p>

        <ul className="hood-vitals">
          {METRICS.map(({ key, label, unit }) => {
            const v = vitals[key];
            const r = v === undefined ? null : rate(key, v);
            return (
              <li key={key} className={r ? `hood-${r}` : ""}>
                <span>{label}</span>
                <strong>{v === undefined ? "—" : `${fmt(key, v)}${unit ? ` ${unit}` : ""}`}</strong>
                <em>{r === "good" ? "Good" : r === "ni" ? "Needs work" : r === "poor" ? "Poor" : key === "inp" ? "Click something" : "Not reported"}</em>
              </li>
            );
          })}
        </ul>

        <ul className="hood-facts">
          <li>
            <strong>{assets.jsChunks}</strong> JS chunks loaded so far
          </li>
          <li>
            <strong>{assets.kb} KB</strong> transferred · {assets.cached} served from cache
          </li>
          <li>
            Service worker: <strong>{sw === "active" ? "active (works offline)" : sw === "none" ? "not active" : "unsupported"}</strong>
          </li>
          <li>
            Network: <strong>{online ? "online" : "offline"}</strong>
          </li>
          {mem && (
            <li>
              JS heap: <strong>{Math.round(mem.usedJSHeapSize / 1048576)} MB</strong>
            </li>
          )}
        </ul>

        <dl className="pm-arch hood-stack">
          {STACK.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="hood-src">
          Source:{" "}
          <a href="https://github.com/yugj-arch/Yug-Portfolio" target="_blank" rel="noopener noreferrer">
            github.com/yugj-arch/Yug-Portfolio
          </a>
        </p>
      </div>
    </div>
  );
};

export default UnderTheHood;
