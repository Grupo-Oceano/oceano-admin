import type { Placement } from "@floating-ui/dom";

/** Headless UI's `anchor` syntax: a side, optionally followed by an alignment (`'bottom start'`). */
export type Anchor =
  `${"top" | "right" | "bottom" | "left"}${"" | " start" | " end"}`;

const cleanups = new WeakMap<HTMLElement, () => void>();

/**
 * Pins `floating` (a `popover` element, top layer, `position: fixed`) next to `reference` and keeps it there
 * on scroll/resize until `release(floating)`. Resolves once it is placed, and marks it `data-placed` (the
 * panel stays invisible until then, rather than showing in the corner). Browser-only: call it from event handlers.
 */
export async function pin(
  reference: Element | null,
  floating: HTMLElement,
  anchor: Anchor = "bottom start",
  opts: { gap?: number; matchWidth?: boolean } = {},
) {
  if (!reference) return void (floating.dataset.placed = "");
  const { autoUpdate, computePosition, flip, offset, shift, size } =
    await import("@floating-ui/dom");
  release(floating);
  const placement = anchor.replace(" ", "-") as Placement;
  const update = async () => {
    const { x, y } = await computePosition(reference, floating, {
      placement,
      strategy: "fixed",
      middleware: [
        offset(opts.gap ?? 4),
        flip(),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ rects, availableHeight, elements }) {
            elements.floating.style.maxHeight = `${Math.max(availableHeight, 120)}px`;
            if (opts.matchWidth)
              elements.floating.style.minWidth = `${rects.reference.width}px`;
          },
        }),
      ],
    });
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
    floating.dataset.placed = "";
  };
  await update();
  cleanups.set(floating, autoUpdate(reference, floating, update));
}

export function release(floating: HTMLElement) {
  cleanups.get(floating)?.();
  cleanups.delete(floating);
  delete floating.dataset.placed;
}
