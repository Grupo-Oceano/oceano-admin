/** Reads a dotted path ('location.location_name', 'items.0.qty') from a row. Missing segments give undefined. */
export const getPath = (source: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value !== null && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      source,
    );
