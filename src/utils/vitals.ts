// Live Core Web Vitals, measured in the visitor's own browser with PerformanceObserver.
// Started at boot (main.tsx) so the numbers exist by the time the "Under the hood" panel opens.

export type Vitals = {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls: number;
  inp?: number;
};

export const vitals: Vitals = { cls: 0 };

function observe(type: string, cb: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}) {
  try {
    const po = new PerformanceObserver((list) => cb(list.getEntries()));
    po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
  } catch {
    /* entry type not supported in this browser */
  }
}

export function startVitals() {
  if (typeof PerformanceObserver === "undefined") return;

  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) vitals.ttfb = nav.responseStart;

  observe("paint", (entries) => {
    for (const e of entries) if (e.name === "first-contentful-paint") vitals.fcp = e.startTime;
  });
  observe("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) vitals.lcp = last.startTime;
  });
  observe("layout-shift", (entries) => {
    for (const e of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
      if (!e.hadRecentInput) vitals.cls += e.value;
    }
  });
  // INP approximation: the slowest interaction seen so far.
  observe(
    "event",
    (entries) => {
      for (const e of entries as (PerformanceEntry & { interactionId?: number })[]) {
        if (e.interactionId) vitals.inp = Math.max(vitals.inp ?? 0, e.duration);
      }
    },
    { durationThreshold: 16 }
  );
}

type Rating = "good" | "ni" | "poor";

const THRESHOLDS: Record<keyof Vitals, [number, number]> = {
  ttfb: [800, 1800],
  fcp: [1800, 3000],
  lcp: [2500, 4000],
  cls: [0.1, 0.25],
  inp: [200, 500],
};

export function rate(metric: keyof Vitals, value: number): Rating {
  const [good, poor] = THRESHOLDS[metric];
  return value <= good ? "good" : value <= poor ? "ni" : "poor";
}

export function loadedAssets() {
  const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const js = res.filter((r) => /\/assets\/.+\.js(\?|$)/.test(r.name));
  const bytes = res.reduce((n, r) => n + (r.transferSize || 0), 0);
  const cached = res.filter((r) => r.transferSize === 0 && r.decodedBodySize > 0).length;
  return { requests: res.length, jsChunks: js.length, kb: Math.round(bytes / 1024), cached };
}
