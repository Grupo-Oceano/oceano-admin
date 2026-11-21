import { component$ } from "@qwik.dev/core";
import {
  Form,
  routeAction$,
  z,
  zod$,
  type DocumentHead,
} from "@qwik.dev/router";
import {
  Alert,
  Button,
  Description,
  Field,
  Input,
  Label,
} from "~/components/ui";
import { authCookieOptions, AUTH_COOKIE } from "~/lib/auth/cookies";
import { coreApi } from "~/lib/backends/core.server";
import type { UserLogin } from "~/models/user.model";

/** Signs in against oceano-core and keeps its token in the httpOnly `auth` cookie; the browser never sees it. */
export const useLogin = routeAction$(
  async (credentials, ev) => {
    const [error, res] = await coreApi(ev).post<UserLogin>(
      "/auth/login",
      credentials,
    );
    if (error || !res?.token) {
      return ev.fail(error?.status ?? 401, {
        message: error?.message ?? "Invalid credentials",
      });
    }
    ev.cookie.set(AUTH_COOKIE, res.token, authCookieOptions(ev.url));
    throw ev.redirect(302, "/home");
  },
  zod$({
    username: z.string().trim().min(1, "Please enter your username."),
    password: z
      .string()
      .min(1, "Please enter your password.")
      .min(8, "Your password must have 8 characters or more."),
  }),
);

export default component$(() => {
  const login = useLogin();
  const errors = login.value?.fieldErrors;
  const failure = login.value?.failed ? login.value.message : undefined;

  return (
    <div class="flex w-full flex-col gap-3 bg-transparent lg:px-4">
      <div class="mb-4 flex flex-row items-center gap-2 whitespace-nowrap">
        <hr class="my-2 flex-1 border-gray-300 dark:border-gray-600" />
        <h1 class="font-bold text-sky-600 opacity-75 dark:text-sky-400">
          Sign In
        </h1>
        <hr class="my-2 flex-1 border-gray-300 dark:border-gray-600" />
      </div>

      <h3 class="mb-4 text-start font-bold text-gray-800 dark:text-gray-200">
        Please enter your credentials
      </h3>

      <Form action={login} class="flex flex-col gap-4" data-testid="login-form">
        <Field invalid={!!errors?.username}>
          <Label required>Username</Label>
          <Input
            name="username"
            type="text"
            placeholder="Username@123"
            autocomplete="username"
            required
            testId="login-username"
          />
          {errors?.username && <Description>{errors.username}</Description>}
        </Field>
        <Field invalid={!!errors?.password}>
          <Label required>Password</Label>
          <Input
            name="password"
            type="password"
            placeholder="********"
            autocomplete="current-password"
            required
            minLength={8}
            testId="login-password"
          />
          {errors?.password && <Description>{errors.password}</Description>}
        </Field>

        {failure && (
          <Alert tone="danger" icon="error" role="alert" testId="login-error">
            {failure}
          </Alert>
        )}

        <Button
          type="submit"
          icon="login"
          loading={login.isRunning}
          class="lg:self-start"
          testId="login-submit"
        >
          Log In
        </Button>
      </Form>

      <small class="mt-auto mb-4 text-start text-gray-500 dark:text-gray-400">
        If you don't have an account, please contact your administrator.
      </small>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Grupo Oceano - Login",
};
