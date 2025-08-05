import { apiCall } from "~/lib/axios";
import { UserLogin } from "~/models/user.model";

const login = async (username: string, password: string) => {
  console.log("Base URL:", apiCall.getBaseURL());
  return await apiCall.post<UserLogin>("/auth/login", {
    username,
    password,
  });
};

export const Auth = {
  login,
};
