import { component$, Slot } from "@qwik.dev/core";

// No guard here: `(app)/layout.tsx` guards the signed-in app, `/auth/*` is public (sign-in, callback, notices).
export default component$(() => <Slot />);
