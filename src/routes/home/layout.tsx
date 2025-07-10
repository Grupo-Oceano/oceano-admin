import { component$, Slot } from "@builder.io/qwik";
import { authGuard } from "~/lib/auth-guard";

export const onRequest = authGuard;

export default component$(() => {
  return (
    <div class="flex min-h-screen min-w-screen flex-col bg-gray-100 dark:bg-gray-800">
      <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Home Page
        </h1>
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Welcome to the home page!
        </p>
      </div>

      <Slot />
    </div>
  );
});
