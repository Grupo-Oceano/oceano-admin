import type { RequestHandler } from "@qwik.dev/router";
import { coreApi } from "~/lib/backends/core.server";

/** Streams oceano-core's leads CSV to the browser; the root guard has already checked the session. */
export const onGet: RequestHandler = async (ev) => {
  let res: Response;
  try {
    res = await coreApi(ev).raw("/guests/leads/download");
  } catch {
    throw ev.error(502, "Leads export is unavailable");
  }
  if (!res.ok)
    throw ev.error(res.status === 404 ? 404 : 502, "Leads export failed");

  const headers = new Headers({
    "content-type": res.headers.get("content-type") ?? "text/csv",
    "content-disposition":
      res.headers.get("content-disposition") ??
      'attachment; filename="leads.csv"',
    "cache-control": "private, no-store",
  });
  const length = res.headers.get("content-length");
  if (length) headers.set("content-length", length);
  ev.send(new Response(res.body, { status: 200, headers }));
};
