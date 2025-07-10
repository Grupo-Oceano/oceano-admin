export interface User {
  username: string;
  password?: string;
}

export enum Cookies {
  AUTH = "auth",
  SESSION = "session",
  CSRF = "csrf",
  JWT = "jwt",
}
