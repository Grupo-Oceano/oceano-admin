import {
  $,
  component$,
  isBrowser,
  Slot,
  useOnWindow,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import clsx from "clsx";

interface Props {
  class?: string;
  id?: string;
  expanded: boolean;
}

/**
 * Wrapper component to vertically expand or collapse content.
 */
export const Expandable = component$<Props>(({ id, expanded, ...props }) => {
  // Use element signal
  const element = useSignal<HTMLDivElement>();

  /**
   * Updates the expandable element height.
   */
  const updateElementHeight = $(() => {
    element.value!.style.height = `${
      expanded ? element.value!.scrollHeight : 0
    }px`;
  });

  // Expand or collapse content when expanded prop changes
  // Using useTask$ instead of useVisibleTask$ for better performance
  useTask$(({ track }) => {
    track(() => expanded);

    // Only update if element is available (client-side)
    if (isBrowser && element.value) {
      updateElementHeight();
    }
  });

  // Update element height when window size change
  useOnWindow(
    "resize",
    $(async () => {
      element.value!.style.maxHeight = "0";
      await updateElementHeight();
      element.value!.style.maxHeight = "";
    }),
  );

  return (
    <div
      class={clsx(
        "!m-0 origin-top duration-200",
        !expanded && "invisible h-0 -translate-y-2 scale-y-75 opacity-0",
        props.class,
      )}
      id={id}
      ref={element}
      aria-hidden={!expanded}
    >
      <Slot />
    </div>
  );
});
