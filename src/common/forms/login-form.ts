import * as v from "valibot";

export const LoginSchema = v.object({
  username: v.pipe(v.string(), v.nonEmpty("Please enter your username.")),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your password."),
    v.minLength(8, "Your password must have 8 characters or more."),
  ),
});
export type LoginForm = v.InferInput<typeof LoginSchema>;
