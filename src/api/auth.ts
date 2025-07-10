import { User } from "~/models/user.model";
import { ApiCall } from "~/utils/axios";

const checkCookieValidity = async (cookie: string): Promise<User | null> => {
  try {
    const user = await ApiCall.post("auth/check-cookie", { cookie });
    return user;
  } catch (err) {
    return null;
  }
};

export { checkCookieValidity };
