import { component$ } from "@qwik.dev/core";
import { tv, type VariantProps } from "tailwind-variants";

export const spinner = tv({
  base: "inline-block animate-spin rounded-full border-current border-r-transparent",
  variants: {
    size: {
      sm: "size-4 border-2",
      md: "size-6 border-2",
      lg: "size-10 border-4",
    },
  },
  defaultVariants: { size: "md" },
});

/** `<Spinner size="lg" class="text-sky-600 dark:text-sky-400" />`; colour comes from `currentColor`. */
export const Spinner = component$<
  VariantProps<typeof spinner> & { class?: string; label?: string }
>(({ size, class: cls, label = "Loading" }) => (
  <span
    role="status"
    aria-label={label}
    class={spinner({ size, class: cls })}
  />
));
