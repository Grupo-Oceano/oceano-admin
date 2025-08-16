export enum Cookies {
  AUTH = "auth",
  SESSION = "session",
}

export interface ApiGetAllResponse<T> {
  data: T[];
  total: number;
  message: string;
}

export type ApiResponse<T, U = never> = {
  data: T;
  message: string;
} & U;
