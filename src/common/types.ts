export enum Cookies {
  AUTH = "auth",
}

export enum SharedMap {
  USER = "user",
}

export interface ApiGetAllResponse<T> {
  data: T[];
  total: number;
  message: string;
}

export type ApiResponse<T, U = object> = {
  data: T;
  message: string;
} & U;
