export interface User {
  username: string;
  password?: string;
}

export interface UserLogin extends User {
  token: string;
}
