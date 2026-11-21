/**
 * `ev.sharedMap` key for the session's Entra access token. Server memory only: no loader returns it, and
 * `coreApi(ev)` reads it to call oceano-core.
 */
export const ACCESS_TOKEN = "session.accessToken";
/** `ev.sharedMap` key for an access decision of a section layout (`requireOwner`, `requireSite`). */
export const ACCESS_DENIED = "session.accessDenied";
