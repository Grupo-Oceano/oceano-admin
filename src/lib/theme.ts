import { getRequestEvent } from "@qwik.dev/router";

export type Theme = "light" | "dark";

/** Cookie the ThemeToggle writes and SSR reads, so the first paint has the right theme. */
export const THEME_COOKIE = "theme";

/** The theme SSR puts on `<html>` (`.dark` or nothing), from the `theme` cookie. */
export function themeFromCookies(): Theme {
  return getRequestEvent()?.cookie.get(THEME_COOKIE)?.value === "dark"
    ? "dark"
    : "light";
}
