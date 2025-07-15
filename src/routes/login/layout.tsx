import { component$, Slot } from "@builder.io/qwik";
import LoginLayot from "~/components/layouts/LoginLayout";
import { authGuard } from "~/lib/auth-guard";

export const onRequest = authGuard;

export default component$(() => {
  return (
    <LoginLayot>
      <Slot />
    </LoginLayot>
  );
});
