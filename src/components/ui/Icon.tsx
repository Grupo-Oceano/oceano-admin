import { component$ } from "@builder.io/qwik";

interface Props {
  icon: string;
  class?: string;
}

export default component$<Props>(({ icon, class: className }) => {
  return <span class={["material-symbol text-lg", , className]}>{icon}</span>;
});
