import { type ActionStore, Form } from "@builder.io/qwik-city";
import { type FormStore, reset } from "@modular-forms/qwik";
import ActionButton from "./ActionButton";

type FormFooterProps = {
  of: FormStore<any, any>;
  resetAction?: ActionStore<object, Record<string, any>, true>;
  form?: string;
};

/**
 * Form footer with buttons to reset and submit the form.
 */
export default function FormFooter({
  of: formStore,
  resetAction,
  form,
}: FormFooterProps) {
  return (
    <footer class="flex justify-between gap-4 px-2 py-4 lg:px-4 lg:py-6">
      <ActionButton
        variant="primary"
        label="Submit"
        type="submit"
        form={form}
        class="w-full lg:w-auto"
      />
      {resetAction ? (
        <Form action={resetAction}>
          <ActionButton
            variant="secondary"
            label="Reset"
            type={resetAction ? "submit" : "button"}
            preventdefault:click
            onClick$={() => reset(formStore)}
          />
        </Form>
      ) : null}
    </footer>
  );
}
