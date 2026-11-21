import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";
import type { AuthConfig } from "./config";

/** Scopes requested at sign-in and at code redemption (they must be the same). */
export const entraScopes = (config: AuthConfig): string[] => [
  config.apiScope,
  "openid",
  "profile",
];

export const entraAuthority = (config: AuthConfig): string =>
  `https://login.microsoftonline.com/${config.tenantId}`;

/**
 * A NEW client per request: MSAL keeps an in-memory token cache, and a shared one would hold every staff
 * member's tokens in this process. Single tenant: the authority is the gooceano directory, never
 * `common`/`organizations`.
 */
export function createEntraClient(
  config: AuthConfig,
): ConfidentialClientApplication {
  return new ConfidentialClientApplication({
    auth: {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      authority: entraAuthority(config),
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
        loggerCallback: (level, message) => {
          if (level <= LogLevel.Warning) console.warn(`[msal] ${message}`);
        },
      },
    },
  });
}

/** Entra end-session URL; Entra then sends the browser to `postLogoutRedirectUri`. */
export const entraLogoutUrl = (
  config: AuthConfig,
  postLogoutRedirectUri: string,
): string =>
  `${entraAuthority(config)}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
