// Generative lo-fi loop on Web Audio: no audio files. Warm electric-piano chords, a soft
// kick, brushed hats, a pentatonic melody and vinyl crackle, all through a low-pass filter.

const BPM = 72;
const BEAT = 60 / BPM;
const STEP = BEAT / 2; // eighth notes

// Cmaj9 · Am9 · Dm9 · G13 (MIDI notes)
const CHORDS = [
  [48, 55, 59, 62, 64],
  [45, 52, 55, 59, 64],
  [50, 57, 60, 64, 65],
  [43, 53, 57, 59, 64],
];
const PENTA = [72, 74, 76, 79, 81, 84];

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let running = false;
let noiseBuf: AudioBuffer | null = null;
let crackle: AudioBufferSourceNode | null = null;

function noise(ctx: AudioContext) {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function tone(ctx: AudioContext, dest: AudioNode, midi: number, t: number, dur: number, gain: number, type: OscillatorType) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = hz(midi);
  o.detune.value = (Math.random() - 0.5) * 12; // gentle tape wobble
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function schedule(ctx: AudioContext, dest: AudioNode, t: number, s: number) {
  const bar = Math.floor(s / 8) % CHORDS.length;
  const inBar = s % 8;
  if (inBar === 0) {
    CHORDS[bar].forEach((m, i) => tone(ctx, dest, m, t + i * 0.012, BEAT * 3.6, 0.05, "triangle"));
    tone(ctx, dest, CHORDS[bar][0] - 12, t, BEAT * 3.2, 0.09, "sine"); // bass
  }
  if (inBar === 0 || inBar === 4) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.25);
  }
  if (inBar % 2 === 1) {
    const src = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = noise(ctx);
    f.type = "highpass";
    f.frequency.value = 7000;
    g.gain.setValueAtTime(0.035, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random());
    src.stop(t + 0.08);
  }
  if (Math.random() < 0.22) {
    const m = PENTA[Math.floor(Math.random() * PENTA.length)];
    tone(ctx, dest, m, t, BEAT * 1.4, 0.035, "sine");
  }
}

export function startLofi() {
  if (running) return;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  if (!ac) ac = new Ctor();
  void ac.resume();
  const ctx = ac;

  master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 2);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1500;
  lp.Q.value = 0.4;
  lp.connect(master).connect(ctx.destination);

  crackle = ctx.createBufferSource();
  const cf = ctx.createBiquadFilter();
  const cg = ctx.createGain();
  crackle.buffer = noise(ctx);
  crackle.loop = true;
  cf.type = "highpass";
  cf.frequency.value = 3500;
  cg.gain.value = 0.006;
  crackle.connect(cf).connect(cg).connect(master);
  crackle.start();

  running = true;
  step = 0;
  nextTime = ctx.currentTime + 0.1;
  timer = window.setInterval(() => {
    while (nextTime < ctx.currentTime + 0.3) {
      schedule(ctx, lp, nextTime, step);
      nextTime += STEP;
      step += 1;
    }
  }, 100);
}

export function stopLofi() {
  if (!running || !ac || !master) return;
  running = false;
  window.clearInterval(timer);
  const m = master;
  const c = crackle;
  m.gain.cancelScheduledValues(ac.currentTime);
  m.gain.setValueAtTime(Math.max(m.gain.value, 0.0001), ac.currentTime);
  m.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8);
  window.setTimeout(() => {
    c?.stop();
    m.disconnect();
  }, 900);
}

export const isLofiRunning = () => running;
