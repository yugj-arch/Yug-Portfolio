import { RefObject, useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Minimal accessible-dialog behaviour: moves focus into the dialog on open,
 * keeps Tab inside it, and restores focus to the opener on close.
 */
export function useDialog(ref: RefObject<HTMLElement>, initialFocus?: RefObject<HTMLElement>) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = ref.current;
    if (!node) return;
    const first = initialFocus?.current ?? node.querySelector<HTMLElement>(FOCUSABLE) ?? node;
    first.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // Inputs that use Tab themselves (terminal autocomplete) opt out with data-own-tab.
      if ((e.target as HTMLElement).dataset?.ownTab !== undefined) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [ref, initialFocus]);
}
