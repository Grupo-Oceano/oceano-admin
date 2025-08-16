import { component$, QRL } from "@builder.io/qwik";
import { Dropdown as FBDropdown } from "flowbite-qwik";

interface Props {
  class?: string;
  label?: string;
  items?: Array<{
    label: string;
    onClick: QRL<() => void>;
    type?: "item" | "divider";
  }>;
}

export default component$<Props>(
  ({ class: className, label = "...", items }) => {
    return (
      <FBDropdown
        label={label}
        inline
        class={[
          "h-fit rounded-lg bg-white px-2 py-2 text-gray-900 shadow-md dark:bg-gray-800 dark:text-white",
          "w-full md:w-auto",
          "text-sm font-medium",
          "transition-colors duration-200 ease-in-out",
          className,
        ]}
      >
        {items?.map((item, index) =>
          item.type === "divider" ? (
            <FBDropdown.Item key={index} divider />
          ) : (
            <FBDropdown.Item key={index} onClick$={item.onClick}>
              {item.label}
            </FBDropdown.Item>
          ),
        )}
      </FBDropdown>
    );
  },
);
