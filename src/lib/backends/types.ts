/**
 * Shapes shared by every backend client. Plain objects only: loader and action results are serialized.
 */

export type ApiError = { status: number; message: string };

/** `[error, null]` or `[null, body]`: clients never throw. */
export type Result<T> = [ApiError, null] | [null, T];

/** oceano-core's standard envelope (`StandardResponseInterceptor`). */
export type ApiResponse<T, U = object> = { data: T; message: string } & U;

/** oceano-core's paged list envelope. */
export type ApiGetAllResponse<T> = {
  data: T[];
  total: number;
  message: string;
};
