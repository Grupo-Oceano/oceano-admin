import { component$ } from "@qwik.dev/core";
import { routeLoader$, type DocumentHead } from "@qwik.dev/router";
import AuthCard from "~/components/shell/AuthCard";
import { Alert, button } from "~/components/ui";
import { readAuthConfig } from "~/lib/auth/config";
import { readSession } from "~/lib/auth/session.server";
import {
  NOT_ENABLED_REASONS,
  notEnabledReasonOf,
  OWNER_CONTACT,
} from "~/lib/auth/sign-in-errors";

/** Why oceano-core refused the account, and which Microsoft account is signed in (email only). */
export const useNotEnabled = routeLoader$(
  async (ev) => {
    ev.status(403);
    const reason = notEnabledReasonOf(ev.query.get("reason")) ?? "not_enabled";
    const config = readAuthConfig((name) => ev.env.get(name));
    const session = config
      ? await readSession(ev.cookie, config.sessionSecret)
      : null;
    return {
      message: NOT_ENABLED_REASONS[reason],
      email: session?.email ?? null,
    };
  },
  { search: ["reason"] },
);

/** A verified Entra user oceano-core doesn't (yet) let in: explain, never loop back to sign-in. */
export default component$(() => {
  const page = useNotEnabled();
  return (
    <AuthCard title="Not enabled yet">
      <Alert tone="warning" icon="person_off" role="alert" testId="not-enabled">
        {page.value.message} Ask an owner ({OWNER_CONTACT}) to enable you and
        give you a site.
      </Alert>
      {page.value.email && (
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Signed in with Microsoft as <strong>{page.value.email}</strong>.
        </p>
      )}
      <div class="flex flex-col gap-2 sm:flex-row">
        <a href="/" class={button()}>
          Try again
        </a>
        <form method="post" action="/auth/logout">
          <button
            type="submit"
            class={button({ intent: "secondary", block: true })}
          >
            Sign out and use another account
          </button>
        </form>
      </div>
    </AuthCard>
  );
});

export const head: DocumentHead = { title: "Oceano Admin - Not enabled" };
