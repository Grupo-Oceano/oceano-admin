import { tv } from "tailwind-variants";

/** `<hr class={divider()} />`; spacing comes from the parent's `gap` or `class` (`divider({ class: 'my-4' })`). */
export const divider = tv({ base: "border-gray-300 dark:border-gray-600" });
