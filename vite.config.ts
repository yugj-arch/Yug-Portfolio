import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Public files the offline shell needs. Large 3D models are cached at runtime instead. */
const PUBLIC_PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/resume/Yug_Jain_Resume.pdf",
  "/images/react2.webp",
  "/images/next2.webp",
  "/images/node2.webp",
  "/images/typescript.webp",
  "/images/javascript.webp",
  "/images/mysql.webp",
];

/**
 * Emits /sw.js at build time with every hashed bundle file in its precache list,
 * so lazy chunks (arcade game, terminal, …) work offline even if never opened online.
 */
function serviceWorker(): Plugin {
  return {
    name: "yj-service-worker",
    apply: "build",
    generateBundle(_options, bundle) {
      // Skip very large chunks (the physics/3D bundles): phones never load them, and they
      // are still cached on first use by the /assets/ cache-first rule below.
      const MAX_PRECACHE_BYTES = 300 * 1024;
      const assets = Object.entries(bundle)
        .filter(([file]) => /\.(js|css|html|woff2?|svg|png|webp)$/.test(file))
        .filter(([, out]) => {
          const body = out.type === "chunk" ? out.code : out.source;
          return body.length <= MAX_PRECACHE_BYTES;
        })
        .map(([file]) => `/${file}`);
      const precache = Array.from(new Set([...PUBLIC_PRECACHE, ...assets]));
      const version = Date.now().toString(36);
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: swSource(version, precache),
      });
    },
  };
}

function swSource(version: string, precache: string[]) {
  return `/* Generated at build time by vite.config.ts. Do not edit. */
const VERSION = ${JSON.stringify(version)};
const SHELL = "yj-shell-" + VERSION;
const RUNTIME = "yj-runtime-v1";
const PRECACHE = ${JSON.stringify(precache)};
// Servers often send "Vary: Origin"; module scripts carry an Origin header, so ignore Vary on lookup.
const MATCH = { ignoreVary: true };

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => undefined)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("yj-shell-") && k !== SHELL).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Pages: network first so visitors get fresh content, cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html", MATCH).then((r) => r || caches.match("/", MATCH)))
    );
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;
  if (sameOrigin && url.pathname.startsWith("/_vercel")) return;

  // Hashed bundles never change: cache first. Ones fetched at runtime (the big 3D chunks)
  // go in the runtime cache so a new deploy doesn't throw them away.
  if (sameOrigin && url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request, MATCH).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(RUNTIME).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Everything else (models, images, fonts, resume): stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME).then((cache) =>
      cache.match(request, MATCH).then((hit) => {
        const network = fetch(request)
          .then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit || caches.match(request, MATCH));
        return hit || network;
      })
    )
  );
});
`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
});
