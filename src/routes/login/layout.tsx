import { component$, Slot } from "@builder.io/qwik";
import LoginLayot from "~/components/layouts/LoginLayout";

export default component$(() => {
  return (
    <LoginLayot>
      <Slot />
    </LoginLayot>
  );
});

/* bg-gradient-to-r from-blue-500 to-purple-500 */
