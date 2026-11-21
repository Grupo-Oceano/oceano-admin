import { component$, Slot, type QRL } from "@qwik.dev/core";
import { tv } from "tailwind-variants";

export type Tone = "success" | "warning" | "danger" | "info" | "muted";

export const alert = tv({
  slots: {
    root: "flex items-start gap-3 rounded-xl border px-4 py-3 text-gray-700 dark:text-gray-200",
    icon: "material-symbols-rounded shrink-0",
    body: "flex min-w-0 flex-1 flex-col gap-1",
    title: "font-semibold",
    close:
      "inline-flex shrink-0 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 pointer-coarse:min-h-11 pointer-coarse:min-w-11 dark:text-gray-400 dark:hover:text-white",
  },
  variants: {
    tone: {
      success: {
        root: "border-success/30 bg-success/10",
        icon: "text-success",
        title: "text-success",
      },
      danger: {
        root: "border-danger/30 bg-danger/10",
        icon: "text-danger",
        title: "text-danger",
      },
      warning: {
        root: "border-warning/30 bg-warning/10",
        icon: "text-warning",
        title: "text-gray-900 dark:text-white",
      },
      info: {
        root: "border-info/30 bg-info/10",
        icon: "text-info",
        title: "text-gray-900 dark:text-white",
      },
      muted: {
        root: "border-gray-200 bg-surface-2 text-gray-500 dark:border-gray-700 dark:text-gray-400",
        icon: "text-gray-400 dark:text-gray-500",
        title: "text-gray-500 dark:text-gray-400",
      },
    } satisfies Record<Tone, { root: string; icon: string; title: string }>,
  },
  defaultVariants: { tone: "info" },
});

type AlertProps = {
  tone?: Tone;
  /** A Material Symbols name shown before the content. */
  icon?: string;
  title?: string;
  /** Shows a close button (`<testId>-close`); the caller hides the alert. */
  onDismiss$?: QRL<() => void>;
  /** `alert` interrupts screen readers; `status` (default) waits. */
  role?: "status" | "alert";
  class?: string;
  testId?: string;
};

/**
 * Inline message: `<Alert tone="danger" icon="error" title="Could not sign in">{message}</Alert>`.
 * The default slot is the body, under the optional `title`.
 */
export const Alert = component$<AlertProps>((props) => {
  const s = alert({ tone: props.tone });
  return (
    <div
      role={props.role ?? "status"}
      class={s.root({ class: props.class })}
      data-tone={props.tone ?? "info"}
      data-testid={props.testId}
    >
      {props.icon && (
        <span class={s.icon()} aria-hidden="true">
          {props.icon}
        </span>
      )}
      <div class={s.body()}>
        {props.title && <p class={s.title()}>{props.title}</p>}
        <Slot />
      </div>
      {props.onDismiss$ && (
        <button
          type="button"
          aria-label="Close"
          class={s.close()}
          data-testid={props.testId && `${props.testId}-close`}
          onClick$={props.onDismiss$}
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </div>
  );
});

/** A centred, terminal error block for a panel whose data failed to load (ex `Error.tsx`). */
export const ErrorState = component$<{
  error: string;
  title?: string;
  class?: string;
}>((props) => (
  <div class={["flex min-h-50 grow items-center justify-center", props.class]}>
    <div class="border-danger/30 bg-danger/10 flex flex-col items-center gap-2 rounded-lg border p-6 shadow-md">
      <span
        class="material-symbols-rounded text-danger text-5xl"
        aria-hidden="true"
      >
        error
      </span>
      <p class="text-danger text-lg font-semibold">
        {props.title ?? "An error occurred"}
      </p>
      <p class="text-danger text-center text-sm">{props.error}</p>
    </div>
  </div>
));
