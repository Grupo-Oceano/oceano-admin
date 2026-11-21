import { component$, Slot } from "@qwik.dev/core";
import LoginLayout from "~/components/shell/LoginLayout";

// The root layout's guard already covers /login (signed-in users go to /home).
export default component$(() => (
  <LoginLayout>
    <Slot />
  </LoginLayout>
));
