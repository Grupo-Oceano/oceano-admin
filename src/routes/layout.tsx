import { component$, Slot } from "@qwik.dev/core";
import { authGuard } from "~/lib/auth/guard.server";

// Every route sits behind the guard: signed out → /login, signed in → away from /login.
export const onRequest = authGuard;

export default component$(() => <Slot />);
