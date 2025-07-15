import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiGetAllResponse, ApiResponse } from "~/common/types";
import { ErrorResponse } from "~/models/errors";
import { handleApiError } from "./api-error";

// ✅ Axios instancia compartida (puedes agregar headers globales, interceptores, etc.)
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/webhook/api",
  withCredentials: true, // ✅ si usas cookies (session-based auth)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interfaz genérica de respuesta
type ApiResult<T> = [ErrorResponse | null, T | null];

export class AxiosClass {
  private instance: AxiosInstance;

  constructor({ baseURL = "/webhook/api" }: { baseURL?: string }) {
    this.instance = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
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
}
