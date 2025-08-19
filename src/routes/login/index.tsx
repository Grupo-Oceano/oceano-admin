import { $, component$, QRL } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import {
  InitialValues,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { Auth } from "~/api/auth";
import { LoginForm, LoginSchema } from "~/common/forms/login-form";
import ActionButton from "~/components/etc/forms/ActionButton";
import Response from "~/components/etc/forms/Response";
import TextInput from "~/components/etc/forms/TextInput";

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  username: "",
  password: "",
}));

export default component$(() => {
  const [loginForm, { Form, Field }] = useForm<LoginForm>({
    loader: useFormLoader(),
    validate: valiForm$(LoginSchema), // ✅ Only validate client-side
  });

  const nav = useNavigate();

  const handleSubmit: QRL<SubmitHandler<LoginForm>> = $(
    async (values, event) => {
      event.preventDefault(); // Prevent default form submission
      const [error, res] = await Auth.login(values.username, values.password);

      if (error || !res) {
        return (loginForm.response = {
          status: "error",
          message: error?.message,
        });
      }

      loginForm.response = {
        status: "success",
        message: res.message,
      };

      // Redirect after successful login (replace '/dashboard' with your target route)
      await nav("/home");
    },
  );

  return (
    <div class="flex flex-col gap-3 bg-transparent px-8 lg:max-w-none lg:px-4">
      <div class="mb-4 flex flex-row items-center gap-2 whitespace-nowrap">
        <hr class="my-2 flex-1 border-gray-300 dark:border-gray-600" />
        <h1 class="w-auto font-bold text-sky-600 opacity-75 dark:text-sky-400">
          Sign In
        </h1>
        <hr class="my-2 flex-1 border-gray-300 dark:border-gray-600" />
      </div>

      <h3 class="mb-4 text-start font-bold text-gray-800 dark:text-gray-200">
        Please enter your credentials
      </h3>

      <Form id="login-form" onSubmit$={handleSubmit}>
        <Field name="username">
          {(field, props) => (
            <TextInput
              {...props}
              value={field.value}
              error={field.error}
              type="text"
              label="Username"
              placeholder="Username@123"
              required
              labelClass="text-gray-800 dark:text-white lg:text-gray-500 lg:dark:text-gray-200"
            />
          )}
        </Field>
        <Field name="password">
          {(field, props) => (
            <TextInput
              {...props}
              value={field.value}
              error={field.error}
              type="password"
              label="Password"
              placeholder="********"
              required
              labelClass="text-gray-800 dark:text-white lg:text-gray-500 lg:dark:text-gray-200"
            />
          )}
        </Field>

        <Response class="" of={loginForm} />
      </Form>

      <ActionButton
        variant="primary"
        label="Log In"
        type="submit"
        form="login-form"
        class="h-10 w-full bg-sky-600 px-5 text-white hover:bg-sky-600/80 lg:w-auto dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-400/80"
      >
        <span class="material-symbol" q:slot="iconBefore">
          login
        </span>
      </ActionButton>

      <small class="mt-auto mb-4 text-start text-gray-500 dark:text-gray-400">
        If you don't have an account, please contact your administrator.
      </small>
    </div>
  );
});

export const head = {
  title: "Grupo Oceano - Login",
};
