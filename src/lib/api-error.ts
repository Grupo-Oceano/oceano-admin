import { AxiosError } from "axios";
import { ErrorResponse } from "~/models/errors";

export function handleApiError<T>(error: unknown): ErrorResponse {
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unexpected error";

    return new ErrorResponse(status, message);
  }

  return new ErrorResponse(500, (error as Error)?.message);
}
