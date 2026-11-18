// Tiny Web Audio synth for UI feedback. No audio files, nothing plays until the
// visitor turns sound on (browsers also block audio before a user gesture).

type Tone = "click" | "open" | "close" | "success" | "error" | "power" | "jump" | "hit";

let ctx: AudioContext | null = null;

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

function beep(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.05,
  slideTo?: number
) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + start + dur);
  }
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

export function playTone(tone: Tone) {
  const ac = getCtx();
  if (!ac) return;
  switch (tone) {
    case "click":
      beep(ac, 880, 0, 0.05, "triangle", 0.03);
      break;
    case "open":
      beep(ac, 440, 0, 0.12, "sine", 0.04, 880);
      break;
    case "close":
      beep(ac, 660, 0, 0.12, "sine", 0.04, 330);
      break;
    case "success":
      [523, 659, 784, 1047].forEach((f, i) => beep(ac, f, i * 0.08, 0.18, "triangle", 0.05));
      break;
    case "error":
      beep(ac, 180, 0, 0.18, "square", 0.03);
      break;
    case "power":
      [262, 330, 392, 523, 659, 784].forEach((f, i) =>
        beep(ac, f, i * 0.07, 0.15, "square", 0.03)
      );
      break;
    case "jump":
      beep(ac, 300, 0, 0.12, "square", 0.025, 600);
      break;
    case "hit":
      beep(ac, 200, 0, 0.3, "sawtooth", 0.04, 60);
      break;
  }
}
