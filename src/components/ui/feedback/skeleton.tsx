import { component$ } from "@qwik.dev/core";
import { twMerge } from "tailwind-merge";

/** Pulsing placeholder block; size it with `class` (`h-4 w-3/4`). */
export const Skeleton = component$<{ class?: string }>((props) => (
  <div
    aria-hidden="true"
    class={twMerge(
      "h-16 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600",
      props.class,
    )}
  />
));
