import { useCallback, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";

/**
 * Cyber Runner: a 60-second endless runner drawn on a canvas. Jump the bugs,
 * grab skill tokens. Works offline (no assets), keeps a local top-5 board.
 */

const W = 900;
const H = 320;
const GROUND = 262;
const ROUND_SECONDS = 60;
const STORE_KEY = "yj:arcade:scores";

const BUGS = ["NullPointer", "CORS", "Off-by-1", "Race cond.", "Merge conflict", "Memory leak", "undefined", "Flaky test"];
const TOKENS = ["React", "Next.js", "Python", "PyTorch", "Node.js", "Flask", "Docker", "TS", "Firebase", "GSAP"];

type Phase = "ready" | "running" | "over";
type Bug = { x: number; w: number; h: number; label: string };
type Token = { x: number; y: number; label: string; taken: boolean };

function loadScores(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((n) => typeof n === "number").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveScore(score: number): number[] {
  const next = [...loadScores(), score].sort((a, b) => b - a).slice(0, 5);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

const ArcadeGame = () => {
  const { close, sfx, online, unlock } = useExperience();
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Focus the panel itself so Space goes to the game, not the close button.
  useDialog(panelRef, panelRef);

  const [phase, setPhase] = useState<Phase>("ready");
  const [scores, setScores] = useState<number[]>(loadScores);
  const [last, setLast] = useState<{ score: number; reason: string } | null>(null);

  // Mutable game state lives in a ref so the RAF loop never waits on React.
  const game = useRef({
    phase: "ready" as Phase,
    y: GROUND,
    vy: 0,
    jumps: 0,
    speed: 6,
    distance: 0,
    bonus: 0,
    elapsed: 0,
    bugs: [] as Bug[],
    tokens: [] as Token[],
    nextBug: 60,
    nextToken: 120,
    flash: 0,
    endedAt: 0,
    popups: [] as { x: number; y: number; text: string; life: number }[],
  });

  const accent = useRef("#5eead4");

  const start = useCallback(() => {
    Object.assign(game.current, {
      phase: "running",
      y: GROUND,
      vy: 0,
      jumps: 0,
      speed: 6,
      distance: 0,
      bonus: 0,
      elapsed: 0,
      bugs: [],
      tokens: [],
      nextBug: 70,
      nextToken: 110,
      flash: 0,
      popups: [],
    });
    setPhase("running");
    setLast(null);
    sfx("click");
  }, [sfx]);

  const end = useCallback(
    (reason: string) => {
      const g = game.current;
      g.phase = "over";
      g.endedAt = performance.now();
      const score = Math.floor(g.distance / 10) + g.bonus;
      setScores(saveScore(score));
      if (score >= 500) unlock("squasher");
      if (reason === "time") unlock("marathon");
      setLast({ score, reason });
      setPhase("over");
      sfx(reason === "time" ? "success" : "hit");
    },
    [sfx, unlock]
  );

  const jump = useCallback(() => {
    const g = game.current;
    if (g.phase !== "running") {
      // Short cooldown so a panicked jump right after a crash doesn't restart instantly.
      if (performance.now() - g.endedAt > 450) start();
      return;
    }
    if (g.jumps < 2) {
      g.vy = g.jumps === 0 ? -13.5 : -11;
      g.jumps += 1;
      sfx("jump");
    }
  }, [start, sfx]);

  // Input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.tagName === "A") return;
      if (e.code === "Space" || e.key === "ArrowUp" || e.key.toLowerCase() === "w" || e.key === "Enter") {
        e.preventDefault();
        jump();
      } else if (e.key.toLowerCase() === "r") {
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, start]);

  // Loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    accent.current =
      getComputedStyle(document.documentElement).getPropertyValue("--accentColor").trim() || "#5eead4";

    let raf = 0;
    let lastT = performance.now();
    let gridOffset = 0;

    const draw = (now: number) => {
      const g = game.current;
      // Fixed-ish timestep scaled to 60fps; clamp long pauses (tab switches).
      const dt = Math.min((now - lastT) / 16.67, 3);
      lastT = now;
      const A = accent.current;

      if (g.phase === "running") {
        g.elapsed += (dt * 16.67) / 1000;
        g.speed = 6 + Math.min(g.elapsed / 8, 6);
        g.distance += g.speed * dt;
        gridOffset = (gridOffset + g.speed * dt) % 40;

        // physics
        g.vy += 0.7 * dt;
        g.y += g.vy * dt;
        if (g.y >= GROUND) {
          g.y = GROUND;
          g.vy = 0;
          g.jumps = 0;
        }

        // spawn
        g.nextBug -= dt;
        if (g.nextBug <= 0) {
          const h = 28 + Math.random() * 30;
          g.bugs.push({ x: W + 20, w: 26 + Math.random() * 18, h, label: BUGS[Math.floor(Math.random() * BUGS.length)] });
          g.nextBug = Math.max(38, 95 - g.elapsed * 0.9) + Math.random() * 60;
        }
        g.nextToken -= dt;
        if (g.nextToken <= 0) {
          g.tokens.push({
            x: W + 20,
            y: GROUND - 70 - Math.random() * 80,
            label: TOKENS[Math.floor(Math.random() * TOKENS.length)],
            taken: false,
          });
          g.nextToken = 90 + Math.random() * 90;
        }

        // move + collide
        const px = 90;
        const size = 28;
        const top = g.y - size;
        for (const b of g.bugs) {
          b.x -= g.speed * dt;
          const hitX = px + size - 4 > b.x && px + 4 < b.x + b.w;
          const hitY = g.y - 2 > GROUND - b.h;
          if (hitX && hitY) {
            g.flash = 1;
            end("bug");
            break;
          }
        }
        for (const t of g.tokens) {
          t.x -= g.speed * dt;
          if (!t.taken && Math.abs(t.x - (px + size / 2)) < 30 && Math.abs(t.y - (top + size / 2)) < 30) {
            t.taken = true;
            g.bonus += 50;
            g.popups.push({ x: t.x, y: t.y, text: `+50 ${t.label}`, life: 1 });
            sfx("click");
          }
        }
        g.bugs = g.bugs.filter((b) => b.x + b.w > -10);
        g.tokens = g.tokens.filter((t) => t.x > -60 && !t.taken);

        if (g.elapsed >= ROUND_SECONDS && g.phase === "running") {
          g.bonus += 500;
          end("time");
        }
      }

      // ---- render ----
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#070a14");
      sky.addColorStop(1, "#0d1326");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // grid floor
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = -gridOffset; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND);
        ctx.lineTo(x - 60, H);
        ctx.stroke();
      }
      ctx.strokeStyle = A;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 0.5);
      ctx.lineTo(W, GROUND + 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // tokens
      ctx.font = "600 12px 'Geist Mono', monospace";
      ctx.textAlign = "center";
      for (const t of g.tokens) {
        ctx.fillStyle = "rgba(251,191,36,0.15)";
        ctx.strokeStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(t.label, t.x, t.y - 20);
      }

      // bugs
      for (const b of g.bugs) {
        ctx.fillStyle = "rgba(248,113,113,0.18)";
        ctx.strokeStyle = "#f87171";
        ctx.lineWidth = 2;
        ctx.fillRect(b.x, GROUND - b.h, b.w, b.h);
        ctx.strokeRect(b.x, GROUND - b.h, b.w, b.h);
        ctx.fillStyle = "#fca5a5";
        ctx.fillText(b.label, b.x + b.w / 2, GROUND - b.h - 8);
      }

      // player
      const size = 28;
      ctx.save();
      ctx.shadowColor = A;
      ctx.shadowBlur = 18;
      ctx.fillStyle = A;
      ctx.fillRect(90, g.y - size, size, size);
      ctx.restore();
      ctx.fillStyle = "#04110f";
      ctx.fillRect(90 + 16, g.y - size + 8, 5, 5);

      // popups
      for (const p of g.popups) {
        p.y -= 0.8 * dt;
        p.life -= 0.02 * dt;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      g.popups = g.popups.filter((p) => p.life > 0);

      // HUD
      ctx.textAlign = "left";
      ctx.font = "600 15px 'Geist Mono', monospace";
      ctx.fillStyle = "#eae5ec";
      ctx.fillText(`SCORE ${Math.floor(g.distance / 10) + g.bonus}`, 20, 30);
      ctx.textAlign = "right";
      const left = Math.max(0, Math.ceil(ROUND_SECONDS - g.elapsed));
      ctx.fillStyle = left <= 10 && g.phase === "running" ? "#fbbf24" : "#eae5ec";
      ctx.fillText(`⏱ ${left}s`, W - 20, 30);

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(248,113,113,${g.flash * 0.35})`;
        ctx.fillRect(0, 0, W, H);
        g.flash = Math.max(0, g.flash - 0.05 * dt);
      }

      if (g.phase !== "running") {
        ctx.fillStyle = "rgba(5,8,16,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "700 28px Geist, sans-serif";
        ctx.fillText(g.phase === "ready" ? "CYBER RUNNER" : "GAME OVER", W / 2, H / 2 - 24);
        ctx.font = "400 15px Geist, sans-serif";
        ctx.fillStyle = "#c4cad6";
        ctx.fillText(
          g.phase === "ready"
            ? "Space / ↑ / tap to jump (double jump works). Dodge the bugs, grab skills."
            : "Press Space, R or tap to retry",
          W / 2,
          H / 2 + 10
        );
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVisibility = () => {
      lastT = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [end, sfx]);

  return (
    <div className="ov-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        className="ov-panel arcade"
        role="dialog"
        aria-modal="true"
        aria-labelledby="arcade-title"
        ref={panelRef}
        tabIndex={-1}
      >
        <button className="ov-close" onClick={close} aria-label="Close game">
          <MdClose />
        </button>
        <h2 id="arcade-title">{online ? "Take a 60-second break" : "You're offline — but Yug's code never sleeps!"}</h2>
        <p className="arcade-sub">
          Cyber Runner. Jump the bugs, collect skill tokens (+50), survive 60 seconds for a +500 bonus.
        </p>
        <div className="arcade-stage">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={(e) => {
              e.preventDefault();
              jump();
            }}
            aria-label="Cyber Runner game. Press Space or tap to jump."
            role="img"
          />
        </div>
        <div className="arcade-board">
          <div>
            <h3>Your top scores (this device)</h3>
            {scores.length ? (
              <ol>
                {scores.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : (
              <p>No runs yet.</p>
            )}
          </div>
          <div aria-live="polite">
            <h3>Status</h3>
            <p>
              {phase === "ready" && "Press Space or tap the game to start."}
              {phase === "running" && "Running…"}
              {phase === "over" &&
                last &&
                (last.reason === "time"
                  ? `Break over! You survived with ${last.score} points.`
                  : `Squashed by a bug at ${last.score} points. Space or R to retry.`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcadeGame;
