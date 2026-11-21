import { component$, Slot } from "@qwik.dev/core";
import type { RequestHandler } from "@qwik.dev/router";
import LoginLayout from "~/components/shell/LoginLayout";

/** Public: sign-in flow and its notices. Never cached (they read cookies and env). */
export const onRequest: RequestHandler = async (ev) => {
  ev.headers.set("Cache-Control", "no-store");
};

export default component$(() => (
  <LoginLayout>
    <Slot />
  </LoginLayout>
));
