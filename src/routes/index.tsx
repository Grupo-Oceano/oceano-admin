import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";

// The root layout's guard always redirects `/` (to /home or /login); this page only exists to match the path.
export default component$(() => <></>);

export const head: DocumentHead = {
  title: "Oceano Admin",
};
