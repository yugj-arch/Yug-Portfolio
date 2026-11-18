import { useEffect, useRef } from "react";

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789YUGJAIN<>/{}=+*";

/** Short burst of falling glyphs. Purely decorative, so it is hidden from assistive tech. */
const MatrixRain = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const size = 16;
    const columns = Math.ceil(w / size);
    const drops = Array.from({ length: columns }, () => Math.random() * -50);
    let raf = 0;
    let frame = 0;

    const draw = () => {
      frame += 1;
      if (frame % 2 === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${size}px "Geist Mono", monospace`;
        for (let i = 0; i < columns; i++) {
          const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          const y = drops[i] * size;
          ctx.fillStyle = Math.random() > 0.97 ? "#d1ffd1" : "#39ff14";
          ctx.fillText(char, i * size, y);
          if (y > h && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 1;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="matrix-canvas" aria-hidden="true" />;
};

export default MatrixRain;
