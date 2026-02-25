import { component$, isBrowser, useSignal, useTask$ } from "@builder.io/qwik";
import clsx from "clsx";
import Expandable from "./Expandable";

interface Props {
  name: string;
  error?: string;
  class?: string;
}

export default component$<Props>(({ name, error, class: className }) => {
  // Use frozen error signal
  const frozenError = useSignal<string>();

  // Freeze error while element collapses to prevent UI from jumping
  useTask$(({ track, cleanup }) => {
    const nextError = track(() => error);
    if (isBrowser && !nextError) {
      const timeout = setTimeout(() => (frozenError.value = nextError), 200);
      cleanup(() => clearTimeout(timeout));
    } else {
      frozenError.value = nextError;
    }
  });

  return (
    <Expandable expanded={!!error}>
      <div
        class={clsx("pt-1 text-sm", className, "dark:text-red-400")}
        id={`${name}-error`}
      >
        {frozenError.value}
      </div>
    </Expandable>
  );
});
