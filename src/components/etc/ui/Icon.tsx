import { component$ } from "@builder.io/qwik";

interface Props {
  icon: string;
  class?: string | string[];
  "q:slot"?: string; // Optional slot for Qwik
}

export default component$<Props>(
  ({ icon, class: className, "q:slot": slot }) => {
    return (
      <span class={["material-symbol text-lg", className]} q:slot={slot}>
        {icon}
      </span>
    );
  },
);
