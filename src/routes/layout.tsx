import { component$, Slot } from "@builder.io/qwik";
import { authGuard } from "~/lib/auth-guard";

// Root layout with auth guard
export const onRequest = authGuard;

export default component$(() => {
  return <Slot />;
});
