import { component$ } from "@qwik.dev/core";
import { tv, type VariantProps } from "tailwind-variants";

export const avatar = tv({
  slots: {
    frame:
      "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 ring-1 ring-gray-200 dark:ring-gray-700",
    image: "size-full object-cover",
    initials:
      "font-semibold text-sky-700 uppercase select-none dark:text-sky-300",
  },
  variants: {
    size: {
      sm: { frame: "size-8", initials: "text-xs" },
      md: { frame: "size-10", initials: "text-sm" },
      lg: { frame: "size-16", initials: "text-xl" },
    },
  },
  defaultVariants: { size: "md" },
});

type AvatarProps = VariantProps<typeof avatar> & {
  /** Image URL; without one the avatar shows `name`'s initials. */
  src?: string | null;
  name?: string | null;
  class?: string;
};

/** Round user picture, or initials from `name`: `<Avatar name={user.username} />`. */
export const Avatar = component$<AvatarProps>(
  ({ size, src, name, class: cls }) => {
    const s = avatar({ size });
    const initials = (name ?? "")
      .split(/[\s._@-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
    return (
      <span class={s.frame({ class: cls })}>
        {src ? (
          <img
            src={src}
            alt={name ?? ""}
            width={40}
            height={40}
            class={s.image()}
          />
        ) : (
          <span class={s.initials()} aria-hidden="true">
            {initials || "?"}
          </span>
        )}
      </span>
    );
  },
);
