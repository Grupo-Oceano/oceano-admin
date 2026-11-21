import { component$ } from "@qwik.dev/core";
import { twMerge } from "tailwind-merge";

type IconProps = {
  /** A Material Symbols Rounded name (`home`, `logout`, `battery_android_full`…). */
  icon: string;
  class?: string;
  /** Accessible name; without it the icon is decorative (`aria-hidden`). */
  label?: string;
};

/**
 * Material Symbols Rounded glyph; the font is loaded once in `root.tsx`.
 * ```tsx
 * <Icon icon="logout" class="text-xl text-danger" />
 * ```
 */
export const Icon = component$<IconProps>(({ icon, class: cls, label }) => (
  <span
    class={twMerge(
      "material-symbols-rounded align-middle text-lg leading-none",
      cls,
    )}
    aria-hidden={label ? undefined : "true"}
    aria-label={label}
    role={label ? "img" : undefined}
  >
    {icon}
  </span>
));
