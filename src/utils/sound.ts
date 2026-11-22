// UI feedback sounds, played from small audio files in /public/sounds (see
// /public/sounds/CREDITS.md). Nothing loads or plays until the visitor turns
// sound on (browsers also block audio before a user gesture). Files are fetched
// once, decoded into AudioBuffers and replayed through Web Audio, so rapid
// clicks never stack <audio> elements.

type Tone = "click" | "open" | "close" | "success" | "error" | "power" | "jump" | "hit";

// Every file is normalised to a -3 dBFS peak; these gains set the mix.
const GAIN: Record<Tone, number> = {
  click: 0.22,
  open: 0.28,
  close: 0.28,
  success: 0.3,
  error: 0.26,
  power: 0.3,
  jump: 0.22,
  hit: 0.26,
};

const TONES = Object.keys(GAIN) as Tone[];

let ctx: AudioContext | null = null;
const buffers = new Map<Tone, AudioBuffer>();
const loading = new Map<Tone, Promise<AudioBuffer | null>>();
let ext: "webm" | "mp3" | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function fileExt(): "webm" | "mp3" {
  if (!ext) {
    const probe = typeof Audio !== "undefined" ? new Audio() : null;
    ext = probe?.canPlayType('audio/webm; codecs="opus"') ? "webm" : "mp3";
  }
  return ext;
}

function load(ac: AudioContext, tone: Tone): Promise<AudioBuffer | null> {
  const pending = loading.get(tone);
  if (pending) return pending;
  const p = fetch(`/sounds/${tone}.${fileExt()}`)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((data) => ac.decodeAudioData(data))
    .then((buf) => {
      buffers.set(tone, buf);
      return buf;
    })
    .catch(() => {
      loading.delete(tone); // allow a retry on the next call
      return null;
    });
  loading.set(tone, p);
  return p;
}

function start(ac: AudioContext, buf: AudioBuffer, tone: Tone) {
  const src = ac.createBufferSource();
  const amp = ac.createGain();
  src.buffer = buf;
  amp.gain.value = GAIN[tone];
  src.connect(amp).connect(ac.destination);
  src.start();
}

/** Fetch and decode every cue so the first plays without delay. */
export function preloadSounds() {
  const ac = getCtx();
  if (!ac) return;
  TONES.forEach((t) => void load(ac, t));
}

export function playTone(tone: Tone) {
  const ac = getCtx();
  if (!ac) return;
  const buf = buffers.get(tone);
  if (buf) {
    start(ac, buf, tone);
    return;
  }
  // First use: load everything, and play this cue if it arrives promptly.
  const asked = performance.now();
  preloadSounds();
  void load(ac, tone).then((b) => {
    if (b && performance.now() - asked < 400) start(ac, b, tone);
  });
}
