import { ClientSideAxios } from "~/lib/client-side-axios";
import { UserLogin } from "~/models/user.model";

const login = async (username: string, password: string) => {
  return await ClientSideAxios.post<UserLogin>("auth/login", {
    username,
    password,
  });
};

export const Auth = {
  login,
};
