export enum Cookies {
  AUTH = "auth",
  SESSION = "session",
  CSRF = "csrf",
  JWT = "jwt",
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
