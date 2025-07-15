import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <form method="POST" action="/logout" class="w-fit">
      <button
        type="submit"
        class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
      >
        Logout
      </button>
    </form>
  );
});
