import { RequestEvent, RequestHandler } from "@builder.io/qwik-city";
import { Cookies } from "~/common/types";
import { User } from "~/models/user.model";
import { apiCall } from "./axios";

// Cache for authentication results to avoid repeated API calls
const authCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to clear auth cache (useful for logout)
export const clearAuthCache = (token?: string) => {
  if (token) {
    authCache.delete(token);
  } else {
    authCache.clear();
  }
};

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
    const token = authCookie.value;
    const now = Date.now();

    // Check cache first
    const cached = authCache.get(token);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log("[authGuard] Using cached auth result:", cached.isValid);

      if (cached.isValid) {
        // Authenticated and valid cookie (from cache)
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
        console.log("[authGuard] Authenticated (cached), access granted");
        return;
      }
    } else {
      // Cache miss or expired, make API call
      const [error, res] = await apiCall.post<User>("auth/check-token", {
        token: authCookie.value,
      });
      console.log("[authGuard] Auth check error:", error);
      console.log("[authGuard] Auth check response:", res);

      const isValid = !error && !!res;

      // Cache the result
      authCache.set(token, { isValid, timestamp: now });

      if (isValid) {
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
