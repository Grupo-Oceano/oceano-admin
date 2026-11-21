import { component$, Slot } from "@qwik.dev/core";
import { useNavigate } from "@qwik.dev/router";
import ThemeToggle from "~/components/shell/ThemeToggle";
import { Button } from "~/components/ui";
import { requireStaff } from "~/lib/auth/guard.server";

// A named layout replaces `layout.tsx`, so it repeats the guard.
export const onRequest = requireStaff;

/** Full-width layout for `index@checkout` pages: a header with "Back" and the theme toggle, no sidebar. */
export default component$(() => {
  const navigate = useNavigate();
  return (
    <div class="flex h-dvh w-screen flex-col bg-gray-200 dark:bg-gray-800">
      <header class="flex h-28 w-full flex-row items-center justify-between bg-gray-100 p-6 px-10 dark:bg-gray-900 print:hidden">
        <img
          src="/favicon.png"
          alt="logo"
          width={100}
          height={100}
          class="max-h-25 max-w-50"
        />
        <div class="flex flex-row items-center gap-2">
          <Button
            intent="secondary"
            icon="arrow_back"
            title="Back"
            onClick$={() => navigate("../")}
          >
            Back
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <div class="min-h-0 flex-1 overflow-auto">
        <Slot />
      </div>
    </div>
  );
});
