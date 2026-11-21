import { component$, Slot, type PropsOf } from "@qwik.dev/core";
import { useFieldAttrs } from "./field";

type SelectProps = Omit<PropsOf<"select">, "class"> & {
  invalid?: boolean;
  class?: string;
  testId?: string;
};

/**
 * The native `<select>` with the field look and a chevron: works without JS and opens the native picker on
 * touch devices.
 * ```tsx
 * <Field><Label>Page size</Label><Select name="take">{sizes.map((n) => <option key={n}>{n}</option>)}</Select></Field>
 * ```
 */
export const Select = component$<SelectProps>(
  ({ invalid, class: cls, testId, id, disabled, ...rest }) => {
    const f = useFieldAttrs({ id, disabled: disabled ?? undefined, invalid });
    return (
      <div class="relative">
        <select
          {...rest}
          id={f.id}
          disabled={f.disabled}
          aria-invalid={f.invalid || undefined}
          aria-describedby={f.describedBy}
          data-testid={testId}
          class={[
            "w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 pointer-coarse:min-h-11",
            "aria-invalid:border-danger focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-70",
            cls,
          ]}
        >
          <Slot />
        </select>
        <span
          class="material-symbols-rounded pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>
    );
  },
);
