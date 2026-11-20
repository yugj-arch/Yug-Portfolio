import { useEffect, useRef, useState } from "react";
import { MdArrowBack, MdPause, MdPlayArrow } from "react-icons/md";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>/{}=+*";
type Stream = { x: number; y: number; speed: number; depth: number; length: number; seed: number };

const MatrixRain = () => {
  const { stopMatrix, godMode } = useExperience();
  const panel = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [animated, setAnimated] = useState(false);
  const settings = useRef({ paused, speed, reduced, animated });
  settings.current = { paused, speed, reduced, animated };
  useDialog(panel);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let width = 0;
    let height = 0;
    let streams: Stream[] = [];
    let raf = 0;
    let previous = 0;
    let elapsed = 0;
    const pointer = { x: -1000, y: -1000 };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      streams = Array.from({ length: Math.min(150, Math.ceil(width / 13)) }, (_, index) => ({
        x: index * 13, y: Math.random() * (height + 500) - 300,
        speed: 35 + Math.random() * 95, depth: 0.35 + Math.random() * 0.65,
        length: 9 + Math.floor(Math.random() * 19), seed: Math.floor(Math.random() * GLYPHS.length),
      }));
    };
    const draw = (delta: number) => {
      ctx.fillStyle = "#020907";
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = "center";
      for (const stream of streams) {
        stream.y += delta * stream.speed * settings.current.speed;
        if (stream.y - stream.length * 19 > height) stream.y = -30;
        const dx = stream.x - pointer.x;
        const dy = stream.y - pointer.y;
        const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / 220);
        const x = stream.x + Math.sign(dx) * proximity * 24;
        ctx.font = `${Math.round(12 + stream.depth * 6)}px "Geist Mono", monospace`;
        for (let row = 0; row < stream.length; row++) {
          const y = stream.y - row * 19;
          if (y < -20 || y > height + 20) continue;
          const alpha = (1 - row / stream.length) * stream.depth;
          ctx.fillStyle = row === 0 ? `rgba(210,255,228,${stream.depth})` : `rgba(43,${165 + Math.round(proximity * 80)},112,${alpha * 0.75})`;
          const glyph = (stream.seed + row * 7 + Math.floor(elapsed * (row === 0 ? 9 : 2))) % GLYPHS.length;
          ctx.fillText(GLYPHS[glyph], x, y);
        }
      }
    };
    const tick = (time: number) => {
      if (previous && time - previous < 1000 / 30) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
      previous = time;
      const still = settings.current.paused || (settings.current.reduced && !settings.current.animated);
      if (!still) { elapsed += delta; draw(delta); }
      raf = requestAnimationFrame(tick);
    };
    const onResize = () => { resize(); draw(0); };
    const onPointer = (event: PointerEvent) => { pointer.x = event.clientX; pointer.y = event.clientY; };
    const onLeave = () => { pointer.x = -1000; pointer.y = -1000; };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      previous = 0;
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { setReduced(media.matches); setAnimated(false); };
    resize();
    draw(0);
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMotion);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
    };
  }, []);

  const still = paused || (reduced && !animated);
  return (
    <div className="matrix-experience" role="dialog" aria-modal="true" aria-labelledby="matrix-title" ref={panel} tabIndex={-1}>
      <canvas ref={canvasRef} className="matrix-rain" aria-hidden="true" />
      <div className="matrix-vignette" aria-hidden="true" />
      <header className="matrix-header">
        <span className="matrix-signal"><i /> {still ? "SIGNAL HELD" : "CONNECTION ESTABLISHED"}</span>
        <button className="matrix-exit" onClick={stopMatrix}><MdArrowBack /> {godMode ? "Back to Supreme" : "Exit construct"} <kbd>Esc</kbd></button>
      </header>
      <div className="matrix-message">
        <p>YJ / THE CONSTRUCT</p>
        <h2 id="matrix-title">There is<br />another <em>layer.</em></h2>
        <span>{reduced && !animated ? "A quieter signal. Motion is off for your preferences." : "Move through the signal. Nothing here holds you."}</span>
      </div>
      <footer className="matrix-controls">
        <button aria-label={still ? "Play digital rain" : "Pause digital rain"} onClick={() => {
          if (reduced && !animated) { setAnimated(true); setPaused(false); }
          else setPaused(!paused);
        }}>{still ? <MdPlayArrow /> : <MdPause />} {still ? "Play" : "Pause"}</button>
        <label htmlFor="matrix-speed">Flow <input id="matrix-speed" type="range" min="0.4" max="2" step="0.2" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><output htmlFor="matrix-speed">{speed.toFixed(1)}×</output></label>
        <span className="matrix-hint">Move your cursor to bend the rain</span>
      </footer>
    </div>
  );
};
export default MatrixRain;
