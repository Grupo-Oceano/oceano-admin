import { isBrowser } from "@builder.io/qwik";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiGetAllResponse, ApiResponse } from "~/common/types";
import { environment } from "~/environment";
import { ErrorResponse } from "~/models/errors";
import { handleApiError } from "./api-error";

export type Methods = keyof Pick<AxiosClass, "get" | "post" | "put" | "delete">;

export class AxiosClass {
  private instance: AxiosInstance;

  constructor({ baseURL = "/backbone/api" }: { baseURL?: string }) {
    this.instance = axios.create({
      baseURL,
      withCredentials: true,
    });
  }

  async getAll<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: AxiosRequestConfig = {},
  ): Promise<ApiResult<ApiGetAllResponse<T>>> {
    try {
      const response = await this.instance.get<ApiGetAllResponse<T>>(endpoint, {
        params,
        ...options,
      });
      return [null, response.data];
    } catch (error) {
      const _ = handleApiError(error);
      return [_, null];
    }
  }

  async get<T, U = object>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<ApiResponse<T, U>>> {
    try {
      const response = await this.instance.get<ApiResponse<T, U>>(endpoint, {
        params,
        ...config,
      });
      return [null, response.data];
    } catch (error) {
      const _ = handleApiError<ApiResponse<T>>(error);
      return [_, null];
    }
  }

  async post<T, U = object>(
    endpoint: string,
    data?: any,
  ): Promise<ApiResult<ApiResponse<T, U>>> {
    try {
      const response = await this.instance.post<ApiResponse<T, U>>(
        endpoint,
        data,
      );
      return [null, response.data];
    } catch (error) {
      const _ = handleApiError<ApiResponse<T, U>>(error);
      return [_, null];
    }
  }

  async put<T, U = object>(
    endpoint: string,
    data?: Record<string, any>,
  ): Promise<ApiResult<ApiResponse<T, U>>> {
    try {
      const response = await this.instance.put<ApiResponse<T, U>>(
        endpoint,
        data,
      );
      return [null, response.data];
    } catch (error) {
      const _ = handleApiError<ApiResponse<T, U>>(error);
      return [_, null];
    }
  }

  async delete<T, U = object>(
    endpoint: string,
  ): Promise<ApiResult<ApiResponse<T, U>>> {
    try {
      const response = await this.instance.delete<ApiResponse<T, U>>(endpoint);
      return [null, response.data];
    } catch (error) {
      const _ = handleApiError<ApiResponse<T, U>>(error);
      return [_, null];
    }
  }

  async download<T, U = object>(endpoint: string): Promise<ApiBlobResult> {
    try {
      const response = await this.instance.get<Blob>(endpoint, {
        responseType: "blob",
      });

      console.log("Download response:", response);
      return [null, response.data, response.headers["content-disposition"]];
    } catch (error) {
      const _ = handleApiError<ApiResponse<T, U>>(error);
      return [_, null, null];
    }
  }

  getBaseURL(): string {
    return this.instance.defaults.baseURL || "";
  }
}

// ✅ Axios instancia compartida (puedes agregar headers globales, interceptores, etc.)
export const apiCall: AxiosClass = new AxiosClass({
  baseURL: isBrowser ? "/backbone/api" : `${environment.API_URL}`,
});

// ✅ Interfaz genérica de respuesta
type ApiResult<T> = [ErrorResponse | null, T | null];

type ApiBlobResult = [ErrorResponse | null, Blob | null, string | null];
