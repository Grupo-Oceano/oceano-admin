export enum Cookies {
  AUTH = "auth",
  SESSION = "session",
}

export interface ApiGetAllResponse<T> {
  data: T[];
  total: number;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
