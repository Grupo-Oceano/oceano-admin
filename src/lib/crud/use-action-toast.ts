import { useTask$ } from "@qwik.dev/core";
import type { ActionStore } from "@qwik.dev/router";
import { useToast } from "~/components/ui";

/** What every CRUD action returns: `{ message }` on success, `ev.fail(status, { message })` on failure. */
type ActionResult = { message?: string; failed?: boolean } | undefined;

/**
 * Shows each result of `action` as a toast: green with its `message` on success, red on failure.
 * ```ts
 * const create = useCreateStaff();
 * useActionToast(create);
 * ```
 */
export function useActionToast(action: ActionStore<any, any, any>) {
  const { add } = useToast();
  useTask$(({ track }) => {
    const value = track(() => action.value) as ActionResult;
    if (!value?.message) return;
    add(value.message, value.failed ? "error" : "success");
  });
}
