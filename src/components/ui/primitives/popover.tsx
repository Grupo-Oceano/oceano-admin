import {
  component$,
  createContextId,
  Slot,
  useContext,
  useContextProvider,
  useId,
  useStore,
  type PropsOf,
} from "@qwik.dev/core";
import { tv } from "tailwind-variants";
import { pin, release, type Anchor } from "./anchor";
import { button } from "./button";
import { CloseCtx } from "./close-button";
import { panel } from "./panel";

/** Shared by Popover and Menu: the panel's element id and whether it is showing. */
export type PopoverState = { id: string; open: boolean };
export const PopoverCtx = createContextId<PopoverState>("ui.popover");

/** Root for Popover and Menu: provides the panel id to the button, the panel and any CloseButton. */
export const usePopoverRoot = () => {
  const state = useStore<PopoverState>({ id: useId(), open: false });
  useContextProvider(PopoverCtx, state);
  useContextProvider(CloseCtx, { popoverId: state.id });
  return state;
};

/** The button that toggles the panel, wherever it is in the DOM. */
export const triggerOf = (id: string) =>
  document.querySelector<HTMLElement>(`[popovertarget="${id}"]`);

/** `onToggle$` for every panel: tracks `open`, pins the panel to its trigger, and says whether it opened. */
export const togglePanel = async (
  ctx: PopoverState,
  e: Event,
  el: HTMLElement,
  anchor: Anchor | undefined,
) => {
  const open = (e as ToggleEvent).newState === "open";
  ctx.open = open;
  if (open) await pin(triggerOf(ctx.id), el, anchor);
  else release(el);
  return open;
};

/**
 * Headless UI's Popover on the native `popover` attribute: top layer, light dismiss, Esc, and opening one
 * closes the others, all without JS. Only placement (`anchor`) needs the browser.
 * ```tsx
 * <Popover>
 *   <PopoverButton>Filters</PopoverButton>
 *   <PopoverPanel anchor="bottom end">… <CloseButton>Done</CloseButton></PopoverPanel>
 * </Popover>
 * ```
 */
export const Popover = component$<{ class?: string }>((props) => {
  const state = usePopoverRoot();
  return (
    <div class={props.class} data-open={state.open || undefined}>
      <Slot />
    </div>
  );
});

type TriggerProps = Omit<PropsOf<"button">, "class" | "type"> & {
  class?: string;
  testId?: string;
};

/** A custom trigger look keeps a 44px hit area on coarse pointers. */
const trigger = tv({ base: "pointer-coarse:min-h-11 pointer-coarse:min-w-11" });

/** Defaults to a secondary Button look; any `class` replaces it. */
export const PopoverButton = component$<TriggerProps>(
  ({ class: cls, testId, ...rest }) => {
    const ctx = useContext(PopoverCtx);
    return (
      <button
        {...rest}
        type="button"
        popovertarget={ctx.id}
        aria-expanded={ctx.open}
        aria-controls={ctx.id}
        data-open={ctx.open || undefined}
        data-testid={testId}
        class={cls ? trigger({ class: cls }) : button({ intent: "secondary" })}
      >
        <Slot />
      </button>
    );
  },
);

export const PopoverPanel = component$<{
  anchor?: Anchor;
  class?: string;
  testId?: string;
}>((props) => {
  const ctx = useContext(PopoverCtx);
  return (
    <div
      id={ctx.id}
      popover="auto"
      data-testid={props.testId}
      class={panel({ class: ["p-3", props.class] })}
      onToggle$={(e, el) => togglePanel(ctx, e, el, props.anchor)}
    >
      <Slot />
    </div>
  );
});
