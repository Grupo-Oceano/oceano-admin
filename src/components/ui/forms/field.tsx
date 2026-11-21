import {
  component$,
  createContextId,
  Slot,
  useContext,
  useContextProvider,
  useId,
} from "@qwik.dev/core";

/** Wires a control to its Label and Description; controls read it with `useFieldAttrs`. */
export type FieldState = {
  id: string;
  descriptionId: string;
  disabled: boolean;
  invalid: boolean;
};
export const FieldCtx = createContextId<FieldState>("ui.field");

/** Attributes every control takes from the surrounding Field (its own props win). */
export const useFieldAttrs = (own: {
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}) => {
  const field = useContext(FieldCtx, null);
  return {
    id: own.id ?? field?.id,
    disabled: own.disabled ?? field?.disabled ?? false,
    invalid: own.invalid ?? field?.invalid ?? false,
    describedBy: field?.descriptionId,
  };
};

/**
 * Headless UI's Field: `<Field>`, `<Label>`, `<Description>` and the control inside get matching ids,
 * `aria-describedby`, and the shared `disabled`/`invalid` state (as `data-disabled`/`data-invalid`).
 * ```tsx
 * <Field invalid={!!errors?.username}>
 *   <Label required>Username</Label>
 *   <Input name="username" autocomplete="username" />
 *   {errors?.username && <Description>{errors.username}</Description>}
 * </Field>
 * ```
 */
export const Field = component$<{
  disabled?: boolean;
  invalid?: boolean;
  class?: string;
}>((props) => {
  const id = useId();
  useContextProvider(FieldCtx, {
    id: `${id}-control`,
    descriptionId: `${id}-description`,
    disabled: !!props.disabled,
    invalid: !!props.invalid,
  });
  return (
    <div
      data-disabled={props.disabled || undefined}
      data-invalid={props.invalid || undefined}
      class={["flex flex-col gap-1.5", props.class]}
    >
      <Slot />
    </div>
  );
});

export const Label = component$<{
  for?: string;
  required?: boolean;
  class?: string;
}>((props) => {
  const field = useContext(FieldCtx, null);
  return (
    <label
      for={props.for ?? field?.id}
      class={[
        "font-medium text-gray-600 lg:text-lg dark:text-gray-200",
        field?.disabled && "opacity-60",
        props.class,
      ]}
    >
      <Slot />
      {props.required && (
        <span class="text-danger ms-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});

/** Help text; inside an invalid Field it reads as the error message. */
export const Description = component$<{ class?: string }>((props) => {
  const field = useContext(FieldCtx, null);
  return (
    <p
      id={field?.descriptionId}
      class={[
        "text-sm",
        field?.invalid ? "text-danger" : "text-gray-500 dark:text-gray-400",
        props.class,
      ]}
    >
      <Slot />
    </p>
  );
});
