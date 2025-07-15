import { $, component$, QRL } from "@builder.io/qwik";
import { globalAction$, routeLoader$ } from "@builder.io/qwik-city";
import {
  formAction$,
  InitialValues,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import * as v from "valibot";
import { Auth } from "~/api/auth";
import ActionButton from "~/components/forms/ActionButton";
import Response from "~/components/forms/Response";
import TextInput from "~/components/forms/TextInput";

const LoginSchema = v.object({
  username: v.pipe(v.string(), v.nonEmpty("Please enter your username.")),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your password."),
    v.minLength(8, "Your password must have 8 characters or more."),
  ),
});

type LoginForm = v.InferInput<typeof LoginSchema>;

const getInitFormValues = (): InitialValues<LoginForm> => ({
  username: "",
  password: "",
});

// Note: State is kept in local variable for demo purposes
let loginFormValues: InitialValues<LoginForm> = getInitFormValues();

export const useResetFormAction = globalAction$(() => {
  loginFormValues = getInitFormValues();
});

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(
  () => loginFormValues,
);

export const useFormAction = formAction$<LoginForm>(
  async (values, { cookie }) => {
    // Runs on server
    const [error, data] = await Auth.login(values.username, values.password);

    if (error || !data) {
      return {
        status: "error",
        message: error?.message,
      };
    }

    // Set cookie for auth
    cookie.set("auth_token", data?.data?.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return {
      status: "success",
      message: data.message,
    };
  },
  valiForm$(LoginSchema),
);

export default component$(() => {
  const [loginForm, { Form, Field }] = useForm<LoginForm>({
    loader: useFormLoader(),
    action: useFormAction(),
    validate: valiForm$(LoginSchema),
  });

  const resetFormAction = useResetFormAction();

  const handleSubmit: QRL<SubmitHandler<LoginForm>> = $((values, event) => {
    console.log(values);
  });

  return (
    <div class="flex flex-col gap-3 bg-transparent px-8 shadow-2xl backdrop-blur-lg lg:max-w-none lg:px-4 lg:shadow-none lg:backdrop-blur-none">
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
        class="mx-5 h-10 w-full bg-sky-600 text-white hover:bg-sky-600/80 lg:w-auto dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-400/80"
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
