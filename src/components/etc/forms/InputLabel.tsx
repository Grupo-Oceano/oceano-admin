import { ClassList, component$ } from "@builder.io/qwik";
import clsx from "clsx";

type Props = {
  name: string;
  label?: string;
  required?: boolean;
  margin?: "none";
  class?: ClassList;
};

export default component$<Props>(
  ({ name, label, required, margin, class: labelClass }) => (
    <>
      {label && (
        <label
          class={clsx(
            "inline-block font-medium text-gray-500 lg:text-lg dark:text-gray-200",
            !margin && "mb-1 lg:mb-2",
            labelClass,
          )}
          for={name}
        >
          {label}{" "}
          {required && (
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          )}
        </label>
      )}
    </>
  ),
);
