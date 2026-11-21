import { tv } from "tailwind-variants";

/**
 * Heading text on the caller's own tag: `<h1 class={heading({ level: 'page' })}>Backups</h1>`.
 * `page` titles a screen, `section` a block inside it, `group` is the small uppercase title over a nav group or menu section.
 */
export const heading = tv({
  variants: {
    level: {
      page: "text-2xl font-bold text-gray-900 dark:text-white",
      section: "text-lg font-semibold text-gray-900 dark:text-white",
      group:
        "text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400",
    },
  },
  defaultVariants: { level: "section" },
});
