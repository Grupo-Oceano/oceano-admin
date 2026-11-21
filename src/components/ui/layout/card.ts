import { tv } from "tailwind-variants";

/**
 * Card surfaces: `<section class={card()}>`, `card({ tone: 'panel' })` for the shell's grey grid panels.
 * Padding is the caller's (`card({ class: 'p-6' })`), since tables sit flush.
 */
export const card = tv({
  base: "rounded-lg",
  variants: {
    tone: {
      raised: "bg-surface shadow-sm dark:bg-gray-700",
      elevated: "bg-surface shadow-lg dark:bg-gray-700",
      panel:
        "rounded-2xl border border-gray-300 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-700",
    },
  },
  defaultVariants: { tone: "raised" },
});
