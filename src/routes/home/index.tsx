import { component$ } from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import { Cookies } from "~/models/user.model";

export const onRequest: RequestHandler = ({ cookie, redirect }) => {
  const token = cookie.get(Cookies.AUTH);
  if (!token?.value) throw redirect(302, "/login");
};

export default component$(() => {
  return <div>Welcome to the home page!</div>;
});
