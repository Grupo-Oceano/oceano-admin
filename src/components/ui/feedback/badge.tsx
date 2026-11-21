import { component$, Slot } from "@qwik.dev/core";
import { tv } from "tailwind-variants";
import type { Tone } from "./alert";

export const badge = tv({
  base: "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  variants: {
    tone: {
      success: "bg-success/15 text-success",
      warning: "bg-warning/15 text-gray-900 dark:text-white",
      danger: "bg-danger/15 text-danger",
      info: "bg-info/15 text-info",
      muted: "bg-surface-3 text-gray-600 dark:text-gray-300",
    } satisfies Record<Tone, string>,
  },
  defaultVariants: { tone: "muted" },
});

/**
 * A status pill: `<Badge tone="warning">Pending</Badge>`. Optional leading Material Symbol via `icon`.
 */
export const Badge = component$<{
  tone?: Tone;
  icon?: string;
  class?: string;
  testId?: string;
}>((props) => (
  <span class={badge({ tone: props.tone, class: props.class })} data-testid={props.testId}>
    {props.icon && (
      <span class="material-symbols-rounded text-sm leading-none" aria-hidden="true">
        {props.icon}
      </span>
    )}
    <Slot />
  </span>
));
