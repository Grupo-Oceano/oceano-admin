/** The `search` option of a `routeLoader$` from its query schema: every param the schema reads. */
export const searchKeys = (schema: { shape: Record<string, unknown> }): string[] =>
  Object.keys(schema.shape);

/** `URLSearchParams` as a plain object for a query schema (first value per key). */
export const searchObject = (params: URLSearchParams): Record<string, string> =>
  Object.fromEntries(params.entries());
