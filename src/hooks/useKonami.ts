import { useEffect, useRef } from "react";

const SEQUENCE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

/** Calls `onUnlock` when the visitor types ↑ ↑ ↓ ↓ ← → ← → B A outside a text field. */
export function useKonami(onUnlock: () => void) {
  const callback = useRef(onUnlock);
  callback.current = onUnlock;

  useEffect(() => {
    let position = 0;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === SEQUENCE[position]) {
        position += 1;
        if (position === SEQUENCE.length) {
          position = 0;
          callback.current();
        }
      } else if (key === "arrowup") {
        // "↑ ↑ ↑ ↓ …" should still count: keep the last two ups.
        position = position >= 1 && position <= 2 ? 2 : 1;
      } else {
        position = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
