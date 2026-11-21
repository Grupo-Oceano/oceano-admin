import { component$ } from "@qwik.dev/core";
import { Alert, button } from "~/components/ui";
import type { AccessDenied } from "~/lib/auth/guard.server";
import { OWNER_CONTACT } from "~/lib/auth/sign-in-errors";

/** What a section layout renders instead of its pages when the guard denied access (status 403). */
export default component$<{ denied: AccessDenied; siteName?: string }>(
  ({ denied, siteName }) => (
    <div
      class="mx-auto flex max-w-xl flex-col gap-4 py-10"
      data-testid="forbidden"
    >
      <Alert
        tone="warning"
        icon="lock"
        title="You don't have access to this section"
        role="alert"
      >
        {denied.reason === "owner_only"
          ? "This page is for owners only."
          : denied.reason === "access_managers_only"
            ? "Access management is for owners and access managers."
            : `Your account has no role on ${siteName ?? denied.site ?? "this site"}.`}{" "}
        Ask an owner ({OWNER_CONTACT}) if you need it.
      </Alert>
      <a href="/" class={button({ intent: "secondary", class: "self-start" })}>
        Back to your sites
      </a>
    </div>
  ),
);
