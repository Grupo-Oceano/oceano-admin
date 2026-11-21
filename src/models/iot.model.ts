import type { Device, SeamPageCursor } from "seam";

export type SeamDevice = Device;

/** Seam paginates by cursor, passed through by oceano-core. */
export interface SeamPagination {
  readonly hasNextPage: boolean;
  readonly nextPageCursor: SeamPageCursor | null;
  readonly nextPageUrl: string | null;
}

export interface DeviceLiveData {
  access_code_being_set?: boolean;
}
