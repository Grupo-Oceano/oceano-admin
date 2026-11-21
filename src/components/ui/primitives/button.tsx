import { component$, Slot, type PropsOf } from "@qwik.dev/core";
import { tv, type VariantProps } from "tailwind-variants";
import { Spinner } from "./spinner";

export const button = tv({
  base: "relative inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    intent: {
      primary:
        "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-300",
      secondary:
        "border border-gray-300 bg-surface text-gray-700 hover:bg-surface-2 dark:border-gray-600 dark:text-gray-200",
      success:
        "bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:text-gray-100 dark:hover:bg-green-800",
      danger: "bg-danger text-white hover:bg-danger/90 dark:text-gray-900",
      ghost: "text-gray-700 hover:bg-surface-2 dark:text-gray-200",
    },
    size: {
      sm: "h-8 rounded-lg px-3 text-sm pointer-coarse:h-11",
      md: "min-h-10 rounded-2xl px-4 py-2 pointer-coarse:min-h-11",
      icon: "size-9 rounded-full pointer-coarse:size-11",
    },
    block: { true: "w-full" },
  },
  defaultVariants: { intent: "primary", size: "md" },
});

export type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = Omit<PropsOf<"button">, "class"> &
  ButtonVariants & {
    class?: string;
    /** Material Symbols name rendered before the label. */
    icon?: string;
    /** Shows a spinner in place of the label and disables the button. */
    loading?: boolean;
    testId?: string;
  };

/**
 * ```tsx
 * <Button type="submit" block loading={login.isRunning} icon="login">Log In</Button>
 * <Button intent="secondary" onClick$={…}>Cancel</Button>
 * ```
 * Defaults to `type="button"`. A link that looks like a button: `<Link class={button({ intent: 'secondary' })}>`.
 */
export const Button = component$<ButtonProps>(
  ({
    intent,
    size,
    block,
    class: cls,
    icon,
    loading,
    testId,
    type = "button",
    disabled,
    ...rest
  }) => (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-testid={testId}
      class={button({ intent, size, block, class: cls })}
    >
      <span class={["inline-flex items-center gap-2", loading && "invisible"]}>
        {icon && (
          <span
            class="material-symbols-rounded text-xl leading-none"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <Slot />
      </span>
      {loading && <Spinner size="sm" class="absolute" />}
    </button>
  ),
);
