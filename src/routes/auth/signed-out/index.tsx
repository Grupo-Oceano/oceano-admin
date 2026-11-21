import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import AuthCard from "~/components/shell/AuthCard";
import { button } from "~/components/ui";

/** Entra's post-logout redirect lands here. */
export default component$(() => (
  <AuthCard title="Signed out">
    <p class="text-gray-700 dark:text-gray-200" data-testid="signed-out">
      You're signed out of Oceano Admin and Microsoft.
    </p>
    <a href="/auth/login" class={button({ class: "lg:self-start" })}>
      <span class="material-symbols-rounded" aria-hidden="true">
        login
      </span>
      Sign in again
    </a>
  </AuthCard>
));

export const head: DocumentHead = { title: "Oceano Admin - Signed out" };
