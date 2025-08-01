import {
  ClassList,
  component$,
  HTMLInputAutocompleteAttribute,
  QRL,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import clsx from "clsx";
import InputError from "./InputError";
import InputLabel from "./InputLabel";

interface Props {
  ref: QRL<(element: HTMLInputElement) => void>;
  type: "text" | "email" | "tel" | "password" | "url" | "number" | "date";
  name: string;
  value: string | number | undefined;
  onInput$: (event: Event, element: HTMLInputElement) => void;
  onChange$: (event: Event, element: HTMLInputElement) => void;
  onBlur$: (event: Event, element: HTMLInputElement) => void;
  placeholder?: string;
  required?: boolean;
  class?: string;
  label?: string;
  error?: string;
  form?: string;
  labelClass?: ClassList;
  autoComplete?: HTMLInputAutocompleteAttribute;
}

export default component$<Props>(({ label, value, error, ...props }) => {
  const { name, required, labelClass, autoComplete } = props;
  const input = useSignal<string | number>();
  useTask$(({ track }) => {
    if (!Number.isNaN(track(() => value))) {
      input.value = value;
    }
  });
  return (
    <div class={clsx("mb-4", props.class)}>
      <InputLabel
        name={name}
        label={label}
        required={required}
        class={labelClass}
      />
      <input
        {...props}
        class={clsx(
          "block w-full rounded-lg border px-3 py-2 text-lg shadow-sm transition",
          "bg-white text-gray-900 placeholder:text-gray-400",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          "dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600",
        )}
        id={name}
        value={input.value}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-errormessage={`${name}-error`}
      />
      <InputError name={name} error={error} class="mt-1 text-sm text-red-600" />
    </div>
  );
});
