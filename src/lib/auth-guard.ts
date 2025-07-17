import { RequestEvent, RequestHandler } from "@builder.io/qwik-city";
import { Cookies } from "~/common/types";
import { User } from "~/models/user.model";
import { apiCall } from "./axios";

export const authGuard: RequestHandler = async ({
  cookie,
  redirect,
  url,
}: RequestEvent) => {
  const path = url.pathname;
  const authCookie = cookie.get(Cookies.AUTH);

  console.log("[authGuard] Path:", path);
  console.log("[authGuard] Auth cookie:", authCookie?.value);

  // Always check if authCookie exists and is valid
  if (authCookie) {
    const [error, res] = await apiCall.post<User>("auth/check-cookie", {
      cookie: authCookie.value,
    });
    console.log("[authGuard] Auth check error:", error);
    console.log("[authGuard] Auth check response:", res);

    if (!error && res) {
      // Authenticated and valid cookie
      // Redirect root to /home
      if (path === "/") {
        console.log("[authGuard] Redirecting / to /home");
        throw redirect(302, "/home");
      }
      // If accessing /login or /register and already authenticated, redirect to /home
      if (path.startsWith("/login") || path.startsWith("/register")) {
        console.log("[authGuard] Redirecting from auth page to /home");
        throw redirect(302, "/home");
      }
      // Allow access to other routes
      console.log("[authGuard] Authenticated, access granted");
      return;
    }
  }

  // Not authenticated or invalid cookie
  if (path.startsWith("/login") || path.startsWith("/register")) {
    // Allow access to login/register
    console.log(
      "[authGuard] Not authenticated, access to login/register granted",
    );
    return;
  }

  // Redirect all other routes to /login
  console.log("[authGuard] Not authenticated, redirecting to /login");
  throw redirect(302, "/login");
};
