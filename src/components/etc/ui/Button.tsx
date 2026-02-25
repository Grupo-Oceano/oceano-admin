import { component$, Slot } from "@builder.io/qwik";
import { Button } from "flowbite-qwik";
import { ButtonProps } from "flowbite-qwik/lib-types/components/Button/Button.js";

interface Props extends ButtonProps {
  style: "hollow" | "primary" | "secondary" | "tertiary";
}

export default component$<Props>(
  ({ class: className, style = "hollow", ...props }) => {
    const styleClasses = {
      hollow:
        "border! border-gray-300! text-gray-700! hover:bg-gray-100! bg-transparent!",
      primary: "bg-blue-600! text-white! hover:bg-blue-700!",
      secondary: "bg-gray-200! text-gray-800! hover:bg-gray-300!",
      tertiary: "bg-transparent! text-gray-700! hover:bg-gray-100!",
    };
    return (
      <Button
        class={[
          "!transition-none", // disables base transition/animation
          "!bg-none", // disables base background color
          "!text-inherit", // disables base text color
          "!border-none", // disables base border color
          styleClasses[style],
          "transition-all! duration-200! ease-in-out!",
          className,
        ]}
        {...props}
      >
        <Slot />
      </Button>
    );
  },
);
