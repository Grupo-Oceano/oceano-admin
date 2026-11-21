import {
  component$,
  createContextId,
  Slot,
  useContext,
  type PropsOf,
  type QRL,
} from "@qwik.dev/core";

/** Provided by Dialog (a close QRL) and by Popover/Menu (their popover id) so CloseButton can close the nearest one. */
export type CloseState = { popoverId?: string; close$?: QRL<() => void> };
export const CloseCtx = createContextId<CloseState>("ui.close");

type CloseButtonProps = Omit<PropsOf<"button">, "type" | "onClick$">;

/**
 * Closes the nearest Dialog, Popover or Menu, like Headless UI's `CloseButton`. Unstyled: pass `class`
 * (or `class={button({ intent: 'secondary' })}`).
 */
export const CloseButton = component$<CloseButtonProps>((props) => {
  const ctx = useContext(CloseCtx, null);
  return (
    <button
      {...props}
      type="button"
      popovertarget={ctx?.popoverId}
      popovertargetaction={ctx?.popoverId ? "hide" : undefined}
      onClick$={() => ctx?.close$?.()}
    >
      <Slot />
    </button>
  );
});
