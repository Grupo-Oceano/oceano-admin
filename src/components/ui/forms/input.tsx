import { component$, type PropsOf } from "@qwik.dev/core";
import { tv } from "tailwind-variants";
import { useFieldAttrs } from "./field";

export const input = tv({
  slots: {
    root: [
      "flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm transition pointer-coarse:min-h-11 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
      "focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500",
      "data-invalid:border-danger data-invalid:focus-within:ring-danger data-disabled:bg-gray-200 data-disabled:opacity-70 dark:data-disabled:bg-gray-700",
    ],
    icon: "material-symbols-rounded text-gray-500 dark:text-gray-400",
    // why text-base: 16px stops iOS from zooming on focus; larger screens keep the v1 text-lg.
    control:
      "w-full bg-transparent text-base outline-none placeholder:text-gray-400 disabled:cursor-not-allowed lg:text-lg",
  },
});

type InputProps = Omit<PropsOf<"input">, "class"> & {
  /** Material Symbols name shown before the control. */
  icon?: string;
  invalid?: boolean;
  class?: string;
  testId?: string;
};

/**
 * A native input with an optional leading icon; the whole box is the label, so clicking the icon focuses it.
 * Inside a `<Field>` it takes the field's id, description and disabled/invalid state. Posts with the
 * surrounding `<Form>` through `name`; use `bind:value` on it when the value must live in a signal.
 * ```tsx
 * <Input name="username" icon="person" autocomplete="username" required />
 * ```
 */
export const Input = component$<InputProps>(
  ({ icon, invalid, class: cls, testId, id, disabled, ...rest }) => {
    const s = input();
    const f = useFieldAttrs({ id, disabled: disabled ?? undefined, invalid });
    return (
      <label
        class={s.root({ class: cls })}
        data-invalid={f.invalid || undefined}
        data-disabled={f.disabled || undefined}
      >
        {icon && (
          <span class={s.icon()} aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          {...rest}
          id={f.id}
          disabled={f.disabled}
          aria-invalid={f.invalid || undefined}
          aria-describedby={f.describedBy}
          data-testid={testId}
          class={s.control()}
        />
      </label>
    );
  },
);
