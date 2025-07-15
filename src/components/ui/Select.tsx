import { component$, QRL } from "@builder.io/qwik";
import { Select } from "@qwik-ui/headless";

interface Props {
  options: any[];
  optionLabel?: string;
  optionValue?: string;
  label?: string;
  placeholder?: string;

  value?: any;
  onChange$?: QRL<(value: any) => void>;
}

export default component$<Props>(
  ({
    options,
    optionLabel = "label",
    optionValue = "value",
    label,
    placeholder = "Select an option",

    value,
    onChange$,
  }) => {
    return (
      <Select.Root
        onChange$={onChange$}
        value={value}
        class="z-10 w-full rounded bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        {label && (
          <Select.Label class="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </Select.Label>
        )}
        <Select.Trigger class="">
          <Select.DisplayValue
            placeholder={value || placeholder}
            class="text-gray-500 dark:text-gray-200"
          />
        </Select.Trigger>
        <Select.Popover class="origin-top transform-gpu overflow-hidden rounded-md border border-gray-200 bg-white pt-56 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] will-change-transform data-[closed]:translate-y-[-10px] data-[closed]:scale-95 data-[closed]:opacity-0 data-[open]:translate-y-0 data-[open]:scale-100 data-[open]:opacity-100 dark:border-gray-700 dark:bg-gray-600">
          {options.map((option) =>
            typeof option === "object" && option !== null ? (
              <Select.Item
                value={option[optionValue]}
                key={option[optionValue]}
                class="cursor-pointer px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 dark:hover:bg-gray-800 dark:focus:bg-gray-700"
              >
                <Select.ItemLabel class="block text-gray-900 dark:text-white">
                  {option[optionLabel]}
                </Select.ItemLabel>
              </Select.Item>
            ) : (
              <Select.Item
                value={option}
                key={option}
                class="cursor-pointer px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 dark:hover:bg-gray-800 dark:focus:bg-gray-700"
              >
                <Select.ItemLabel class="block text-gray-900 dark:text-white">
                  {option}
                </Select.ItemLabel>
              </Select.Item>
            ),
          )}
        </Select.Popover>
      </Select.Root>
    );
  },
);
