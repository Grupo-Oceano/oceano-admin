import { tv } from "tailwind-variants";

/**
 * Floating panel for `popover` elements (Popover, Menu). The UA centers popovers with `inset: 0; margin: auto`,
 * so they are reset here and placed by `pin()`; until then (`data-placed`) the panel is invisible. Opening
 * fades/scales in through `@starting-style`; `transition-discrete` keeps it visible while it fades out.
 */
export const panel = tv({
  base: [
    "fixed inset-auto m-0 overflow-auto rounded-lg border border-gray-200 bg-surface-raised p-1 text-gray-700 shadow-lg outline-none dark:border-gray-700 dark:text-gray-200",
    "[&:not([data-placed])]:invisible",
    "scale-95 opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-150 ease-out",
    "open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0",
  ],
});

/** One selectable row: a menu item. */
export const option = tv({
  base: [
    "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-gray-700 outline-none select-none pointer-coarse:min-h-11 dark:text-gray-200",
    "hover:bg-surface-2 focus-visible:bg-surface-2 data-focus:bg-surface-2",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
  ],
});
