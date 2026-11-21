/**
 * SSR entry point: every server render (dev server, preview, node server) starts here.
 */
import { createRenderer } from "@qwik.dev/router";
import { themeFromCookies } from "./lib/theme";
import Root from "./root";

export default createRenderer((opts) => {
  // `.dark` on <html> for a dark theme, so the first paint already has it.
  const dark = themeFromCookies() === "dark";
  return {
    jsx: <Root />,
    options: {
      ...opts,
      containerAttributes: {
        lang: "en-us",
        ...(dark ? { class: "dark" } : {}),
        ...opts.containerAttributes,
      },
      serverData: { ...opts.serverData },
    },
  };
});
