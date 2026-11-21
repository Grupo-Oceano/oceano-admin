/** `ev.sharedMap` key where the guard leaves the signed-in user for loaders. */
export const SESSION_USER = "session.user";

/** What the browser may see of the user: never the token or password. */
export type SessionUser = { username: string };
