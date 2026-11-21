import { sync$ } from "@qwik.dev/core";

export type Move = "next" | "prev" | "first" | "last";

/** Arrow/Home/End → a roving move, or null for keys the widget doesn't handle. */
export function moveFor(
  key: string,
  orientation: "vertical" | "horizontal" | "both" = "vertical",
): Move | null {
  const vertical = orientation !== "horizontal";
  const horizontal = orientation !== "vertical";
  if ((vertical && key === "ArrowDown") || (horizontal && key === "ArrowRight"))
    return "next";
  if ((vertical && key === "ArrowUp") || (horizontal && key === "ArrowLeft"))
    return "prev";
  if (key === "Home" || key === "PageUp") return "first";
  if (key === "End" || key === "PageDown") return "last";
  return null;
}

/** The enabled items under `container`, in DOM order. */
export const itemsIn = (container: Element, selector: string) =>
  [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (el) => !el.hasAttribute("data-disabled") && !el.hasAttribute("disabled"),
  );

/** Index of the item after `move` from `current` (−1 = none), wrapping around. */
export function step(length: number, current: number, move: Move): number {
  if (length === 0) return -1;
  if (move === "first") return 0;
  if (move === "last") return length - 1;
  if (current < 0) return move === "next" ? 0 : length - 1;
  return (current + (move === "next" ? 1 : -1) + length) % length;
}

/** Focuses the next item from the focused one; returns it. */
export function moveFocus(
  container: Element,
  selector: string,
  move: Move,
): HTMLElement | undefined {
  const items = itemsIn(container, selector);
  const next =
    items[
      step(
        items.length,
        items.indexOf(document.activeElement as HTMLElement),
        move,
      )
    ];
  next?.focus();
  return next;
}

/** Focuses `selector` under `root` once it exists: after a state change, Qwik renders a few frames later. */
export function focusSoon(root: Element, selector: string, tries = 20) {
  const el = root.querySelector<HTMLElement>(selector);
  if (el) el.focus();
  else if (tries > 0)
    requestAnimationFrame(() => focusSoon(root, selector, tries - 1));
}

/**
 * Keeps arrow keys from scrolling the page. Qwik handlers run asynchronously, so `preventDefault` has to
 * happen in a sync$ listener placed before the real handler: `onKeyDown$={[preventNavKeys, handler]}`.
 */
export const preventNavKeys = sync$((e: KeyboardEvent) => {
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ].includes(e.key)
  )
    e.preventDefault();
});
