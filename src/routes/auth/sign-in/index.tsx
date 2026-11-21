import { component$ } from "@qwik.dev/core";
import { routeLoader$, type DocumentHead } from "@qwik.dev/router";
import AuthCard from "~/components/shell/AuthCard";
import { Alert, button } from "~/components/ui";
import { readAuthConfig } from "~/lib/auth/config";
import { loginUrl, sanitizeReturnTo } from "~/lib/auth/return-to";
import { SIGN_IN_ERRORS, signInErrorOf } from "~/lib/auth/sign-in-errors";

/** Whether sign-in is configured, which error to explain, and where "Sign in" goes back to. */
export const useSignIn = routeLoader$(
  (ev) => {
    const configured = !!readAuthConfig((name) => ev.env.get(name));
    if (!configured) ev.status(503);
    const error = signInErrorOf(ev.query.get("error"));
    return {
      configured,
      error: error ? SIGN_IN_ERRORS[error] : null,
      loginHref: loginUrl(sanitizeReturnTo(ev.query.get("returnTo"))),
    };
  },
  { search: ["error", "returnTo"] },
);

/** Shown when sign-in failed or isn't configured. The guard sends signed-out users straight to Entra. */
export default component$(() => {
  const page = useSignIn();
  const { configured, error, loginHref } = page.value;

  if (!configured) {
    return (
      <AuthCard title="Sign In">
        <Alert
          tone="warning"
          icon="settings_alert"
          title="Staff sign-in is not configured"
          role="alert"
          testId="sign-in-not-configured"
        >
          This environment has no Microsoft Entra settings yet, so nobody can
          sign in. An administrator needs to set ENTRA_TENANT_ID,
          ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, ENTRA_API_SCOPE and
          ADMIN_SESSION_SECRET (docs/setup/entra.md).
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign In">
      <p class="text-gray-700 dark:text-gray-200">
        Oceano staff sign in with their Microsoft work account (@gooceano.com).
      </p>
      {error && (
        <Alert tone="danger" icon="error" role="alert" testId="sign-in-error">
          {error}
        </Alert>
      )}
      <a
        href={loginHref}
        class={button({ class: "lg:self-start" })}
        data-testid="sign-in"
      >
        <span class="material-symbols-rounded" aria-hidden="true">
          login
        </span>
        Sign in with Microsoft
      </a>
    </AuthCard>
  );
});

export const head: DocumentHead = { title: "Oceano Admin - Sign in" };
