import { component$, Slot } from "@builder.io/qwik";
import { authGuard } from "~/lib/auth-guard";
import { SessionContextProvider } from "~/lib/stores/session-store";

// Root layout with auth guard
export const onRequest = authGuard;

export default component$(() => {
  return (
    <SessionContextProvider>
      <Slot />
    </SessionContextProvider>
  );
});
