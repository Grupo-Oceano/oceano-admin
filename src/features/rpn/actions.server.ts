import type { RequestEventAction } from "@qwik.dev/router";
import { siteRoleOf } from "~/lib/auth/guard.server";
import type { Backend } from "~/lib/backends/client.server";
import { rpnCall } from "~/lib/backends/rpn.server";
import type { Result } from "~/lib/backends/types";
import { rpnErrorMessage } from "./errors";

/**
 * Every RockyPoint.net action: re-check the rpn grant server side (the layout only decided who sees the
 * page), call the RPN API with a site token, answer `{ message }` or `ev.fail(status, { message })`. The RPN
 * API checks the role again.
 */
export async function rpnWrite<T>(
  ev: RequestEventAction,
  call: (api: Backend) => Promise<Result<T>>,
  done: string | ((data: T) => string),
) {
  if (!siteRoleOf(ev, "rpn"))
    return ev.fail(403, { message: rpnErrorMessage({ status: 403, message: "no_site_access" }) });
  const [error, data] = await rpnCall(ev, call);
  if (error) return ev.fail(error.status, { message: rpnErrorMessage(error) });
  return { message: typeof done === "function" ? done(data) : done };
}

/** Loader side: a site API failure is shown in place (never "sign in again": that would loop). */
export const rpnLoaderOptions = { message: rpnErrorMessage, signInOn401: false } as const;
