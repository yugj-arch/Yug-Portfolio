import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Touch devices have no pointer to follow.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let hover = false;
    let raf = 0;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.1 });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.1 });

    // The loop only runs while the cursor is still catching up, then goes idle.
    const loop = () => {
      raf = 0;
      if (hover) return;
      cursorPos.x += (mousePos.x - cursorPos.x) / 6;
      cursorPos.y += (mousePos.y - cursorPos.y) / 6;
      moveX(cursorPos.x);
      moveY(cursorPos.y);
      if (Math.abs(mousePos.x - cursorPos.x) > 0.3 || Math.abs(mousePos.y - cursorPos.y) > 0.3) {
        raf = requestAnimationFrame(loop);
      }
    };
    const onMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("mousemove", onMove, { passive: true });

    const cleanups: Array<() => void> = [];
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      const over = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          moveX(rect.left);
          moveY(rect.top);
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };
      const out = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
        if (!raf) raf = requestAnimationFrame(loop);
      };
      element.addEventListener("mouseover", over);
      element.addEventListener("mouseout", out);
      cleanups.push(() => {
        element.removeEventListener("mouseover", over);
        element.removeEventListener("mouseout", out);
      });
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
