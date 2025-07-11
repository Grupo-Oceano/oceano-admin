import { RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { Cookies } from "~/common/types";

export const onPost: RequestHandler = async ({ cookie, redirect }) => {
  cookie.delete(Cookies.AUTH, { path: "/" });
  throw redirect(302, "/login");
};
