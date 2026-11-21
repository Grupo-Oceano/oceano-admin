import {
  component$,
  Slot,
  useContextProvider,
  useSignal,
  useVisibleTask$,
  type QRL,
} from "@qwik.dev/core";
import { tv } from "tailwind-variants";
import { CloseCtx } from "./close-button";

export const dialog = tv({
  slots: {
    root: [
      "m-auto max-h-[calc(100dvh-2rem)] overflow-auto rounded-xl bg-surface-raised p-0 text-gray-700 shadow-xl dark:text-gray-200",
      // Native <dialog> + @starting-style: fade/scale in on showModal(), out on close().
      "scale-95 opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-150 ease-out",
      "open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0",
      "backdrop:bg-black/0 backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-150",
      "open:backdrop:bg-black/40 starting:open:backdrop:bg-black/0",
    ],
    header:
      "flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700",
    title: "text-lg font-semibold text-gray-900 dark:text-white",
    close:
      "cursor-pointer text-2xl leading-none text-gray-500 hover:text-gray-900 pointer-coarse:size-11 dark:text-gray-400 dark:hover:text-white",
    body: "px-5 py-4",
    /** Last child of the body: sticks to the bottom while the body scrolls. Phones stack the buttons, primary on top. */
    footer:
      "sticky bottom-0 -mx-5 mt-4 -mb-4 flex flex-col-reverse gap-2 border-t border-gray-200 bg-surface-raised px-5 py-3 sm:flex-row sm:justify-end dark:border-gray-700",
  },
  variants: {
    // why arbitrary: full width minus a gutter on phones, capped from there.
    size: {
      sm: { root: "w-[min(24rem,calc(100vw-2rem))]" },
      md: { root: "w-[min(32rem,calc(100vw-2rem))]" },
      lg: { root: "w-[min(48rem,calc(100vw-2rem))]" },
    },
  },
  defaultVariants: { size: "md" },
});

type DialogProps = {
  open: boolean;
  title: string;
  /** Esc, a backdrop click, × and any `<CloseButton>` inside call `onClose$`. */
  closable?: boolean;
  size?: "sm" | "md" | "lg";
  onClose$?: QRL<() => void>;
  testId?: string;
  class?: string;
};

/**
 * Native modal `<dialog>` (top layer, focus trap, inert page) opened with `showModal()` while `open` is true.
 * ```tsx
 * <Dialog open={show.value} closable title="Notice" onClose$={() => (show.value = false)}>
 *   …
 *   <footer class={dialog().footer()}>
 *     <CloseButton class={button({ intent: 'secondary' })}>Cancel</CloseButton>
 *   </footer>
 * </Dialog>
 * ```
 */
export const Dialog = component$<DialogProps>((props) => {
  const ref = useSignal<HTMLDialogElement>();
  const s = dialog({ size: props.size });
  useContextProvider(CloseCtx, { close$: props.onClose$ });
  // A closed <dialog> is display:none and never intersects, so the default strategy would never run this.
  // eslint-disable-next-line qwik/no-use-visible-task -- showModal() is a DOM call
  useVisibleTask$(
    ({ track }) => {
      const open = track(() => props.open);
      const d = ref.value;
      if (!d) return;
      if (open && !d.open) d.showModal();
      if (!open && d.open) d.close();
    },
    { strategy: "document-ready" },
  );
  return (
    <dialog
      ref={ref}
      aria-label={props.title}
      data-testid={props.testId}
      preventdefault:cancel={!props.closable}
      onCancel$={() => props.closable && props.onClose$?.()}
      onClick$={(e, el) =>
        props.closable && e.target === el && props.onClose$?.()
      }
      class={s.root({ class: props.class })}
    >
      <header class={s.header()}>
        <h2 class={s.title()}>{props.title}</h2>
        {props.closable && (
          <button
            type="button"
            aria-label="Close"
            class={s.close()}
            onClick$={() => props.onClose$?.()}
          >
            ×
          </button>
        )}
      </header>
      <div class={s.body()}>
        <Slot />
      </div>
    </dialog>
  );
});
