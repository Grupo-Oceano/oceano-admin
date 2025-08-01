import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiGetAllResponse, ApiResponse } from "~/common/types";
import { environment } from "~/environment";
import { ErrorResponse } from "~/models/errors";
import { handleApiError } from "./api-error";

export class AxiosClass {
  private instance: AxiosInstance;

  constructor({ baseURL = "/webhook/api" }: { baseURL?: string }) {
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
      console.log("Base URL:", this.instance.defaults.baseURL);
      console.log("Fetching all data from:", endpoint, "with params:", params);
      const response = await this.instance.get<ApiGetAllResponse<T>>(endpoint, {
        params,
        ...options,
      });
      return [null, response.data];
    } catch (error) {
      return handleApiError(error);
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResult<ApiResponse<T>>> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(endpoint, {
        params,
      });
      return [null, response.data];
    } catch (error) {
      return handleApiError(error);
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
  ): Promise<ApiResult<ApiResponse<T>>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(endpoint, data);
      return [null, response.data];
    } catch (error) {
      return handleApiError(error);
    }
  }

  async put<T>(
    endpoint: string,
    data?: Record<string, any>,
  ): Promise<ApiResult<ApiResponse<T>>> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(endpoint, data);
      return [null, response.data];
    } catch (error) {
      return handleApiError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResult<ApiResponse<T>>> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(endpoint);
      return [null, response.data];
    } catch (error) {
      return handleApiError(error);
    }
  }

  async download<T>(endpoint: string): Promise<ApiBlobResult> {
    try {
      const response = await this.instance.get<Blob>(endpoint, {
        responseType: "blob",
      });

      console.log("Download response:", response);
      return [null, response.data, response.headers["content-disposition"]];
    } catch (error) {
      return [...handleApiError(error), null];
    }
  }

  getBaseURL(): string {
    return this.instance.defaults.baseURL || "";
  }
}

// ✅ Axios instancia compartida (puedes agregar headers globales, interceptores, etc.)
export const apiCall: AxiosClass = new AxiosClass({
  baseURL:
    typeof window === "undefined" ? `${environment.API_URL}` : "/webhook/api",
});

// ✅ Interfaz genérica de respuesta
type ApiResult<T> = [ErrorResponse | null, T | null];

type ApiBlobResult = [ErrorResponse | null, Blob | null, string | null];
