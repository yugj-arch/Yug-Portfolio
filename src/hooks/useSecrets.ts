import { useEffect, useRef } from "react";

/** Words typed anywhere outside a text field fire their handler. Buffer holds the last 12 letters. */
export function useSecrets(words: Record<string, () => void>) {
  const ref = useRef(words);
  ref.current = words;

  useEffect(() => {
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-12);
      for (const [word, fn] of Object.entries(ref.current)) {
        if (buffer.endsWith(word)) {
          buffer = "";
          fn();
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
