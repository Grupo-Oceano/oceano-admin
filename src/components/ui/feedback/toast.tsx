import {
  $,
  component$,
  createContextId,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";
import { tv } from "tailwind-variants";

export type ToastSeverity = "success" | "info" | "warn" | "error";
export type ToastItem = {
  id: number;
  summary: string;
  severity: ToastSeverity;
  detail?: string;
  life: number;
  closing?: boolean;
};

type ToastState = { items: ToastItem[]; seq: number };
export const ToastCtx = createContextId<ToastState>("ui.toast");

/** `const { add } = useToast(); add('Saved', 'success', 'optional detail', 3000)`. Needs a ToastProvider above. */
export function useToast() {
  const state = useContext(ToastCtx);
  const add = $(
    (
      summary: string,
      severity: ToastSeverity = "info",
      detail = "",
      life = 3000,
    ) => {
      state.seq++;
      state.items = [
        ...state.items,
        { id: state.seq, summary, severity, detail: detail || undefined, life },
      ];
    },
  );
  /** Plays the leave transition, then drops the toast. */
  const remove = $((id: number) => {
    state.items = state.items.map((t) =>
      t.id === id ? { ...t, closing: true } : t,
    );
    setTimeout(
      () => (state.items = state.items.filter((t) => t.id !== id)),
      LEAVE_MS,
    );
  });
  return { add, remove };
}

const LEAVE_MS = 200;

export const toast = tv({
  slots: {
    root: [
      "pointer-events-auto w-80 rounded-md border-l-4 bg-surface-raised px-4 py-3 text-gray-700 dark:text-gray-200 shadow-lg",
      // Slides in from the right on mount (@starting-style) and back out while `data-closed`.
      "transition-[opacity,translate] duration-200 ease-out starting:translate-x-8 starting:opacity-0 data-closed:translate-x-8 data-closed:opacity-0",
    ],
    summary: "text-sm font-semibold text-gray-900 dark:text-white",
    detail: "mt-1 text-sm",
    close:
      "cursor-pointer text-lg leading-none opacity-60 hover:opacity-100 pointer-coarse:-m-3 pointer-coarse:inline-flex pointer-coarse:size-11 pointer-coarse:items-center pointer-coarse:justify-center",
  },
  variants: {
    severity: {
      success: {
        root: "border-success bg-linear-to-r from-success/10 to-success/10",
      },
      info: { root: "border-info bg-linear-to-r from-info/10 to-info/10" },
      warn: {
        root: "border-warning bg-linear-to-r from-warning/10 to-warning/10",
      },
      error: {
        root: "border-danger bg-linear-to-r from-danger/10 to-danger/10",
      },
    },
  },
});

const Toast = component$<{ item: ToastItem }>(({ item }) => {
  const { remove } = useToast();
  const s = toast({ severity: item.severity });
  // eslint-disable-next-line qwik/no-use-visible-task -- the dismiss timer must run in the browser, also for toasts rendered on the server
  useVisibleTask$(({ cleanup }) => {
    const id = setTimeout(() => remove(item.id), item.life);
    cleanup(() => clearTimeout(id));
  });
  return (
    <div
      role={item.severity === "error" ? "alert" : "status"}
      data-testid="toast"
      data-severity={item.severity}
      data-closed={item.closing || undefined}
      class={s.root()}
    >
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <p class={s.summary()}>{item.summary}</p>
          {item.detail && <p class={s.detail()}>{item.detail}</p>}
        </div>
        <button
          type="button"
          aria-label="Close"
          class={s.close()}
          onClick$={() => remove(item.id)}
        >
          ×
        </button>
      </div>
    </div>
  );
});

/**
 * Hosts the toast context and renders the stack; mount it once, high enough that every page shares it.
 * The stack is a manual popover in the top layer, above z-indexed overlays as well as native
 * `<dialog>`s; each new toast re-shows it, so it sits above a modal opened since.
 */
export const ToastProvider = component$(() => {
  const state = useStore<ToastState>({ items: [], seq: 0 });
  useContextProvider(ToastCtx, state);
  const stack = useSignal<HTMLElement>();
  // eslint-disable-next-line qwik/no-use-visible-task -- showPopover() is a DOM call
  useVisibleTask$(
    ({ track }) => {
      track(() => state.seq);
      const el = stack.value;
      if (!el?.showPopover) return;
      if (el.matches(":popover-open")) el.hidePopover();
      el.showPopover();
    },
    { strategy: "document-ready" },
  );
  return (
    <>
      <Slot />
      <div
        ref={stack}
        popover="manual"
        aria-live="polite"
        class="pointer-events-none fixed inset-auto top-4 right-4 m-0 flex flex-col gap-2 overflow-visible border-0 bg-transparent p-0"
      >
        {state.items.map((t) => (
          <Toast key={t.id} item={t} />
        ))}
      </div>
    </>
  );
});
