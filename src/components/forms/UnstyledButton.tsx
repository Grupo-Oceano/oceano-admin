import { $, component$, Slot, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import clsx from "clsx";
import Spinner from "./Spinner";

type LinkProps = {
  type: "link";
  href: string;
  download?: boolean | string;
  target?: "_blank";
};

type ButtonProps = {
  type: "button" | "reset" | "submit";
  "preventdefault:click"?: boolean;
  onClick$?: () => unknown;
  loading?: boolean;
  form?: string;
};

export type DefaultButtonProps = LinkProps | ButtonProps;

type UnstyledButtonProps = DefaultButtonProps & {
  class?: string;
  "aria-label"?: string;
};

/**
 * Basic button component that contains important functionality and is used to
 * build more complex components on top of it.
 */
export default component$(
  ({ class: className, ...props }: UnstyledButtonProps) => {
    // Use loading signal
    const loading = useSignal(false);

    return (
      <>
        {/* Link button */}
        {props.type === "link" && (
          <Link
            {...props}
            rel={props.target === "_blank" ? "noreferrer" : undefined}
          >
            <Slot />
          </Link>
        )}

        {/* Normal button */}
        {props.type !== "link" && (
          <button
            {...props}
            // disabled={loading.value || props.loading}
            // Start and stop loading if function is async
            onClick$={
              props.onClick$ &&
              $(async () => {
                console.log("Button clicked");
                loading.value = true;
                await props.onClick$!();
                loading.value = false;
              })
            }
          >
            <div
              class={clsx(
                "cursor-pointer transition-[opacity,transform,visibility] duration-200",
                loading.value || props.loading
                  ? "invisible translate-x-5 opacity-0"
                  : "visible delay-300",
                className,
              )}
            >
              <Slot />
            </div>
            <div
              class={clsx(
                "absolute cursor-pointer duration-200",
                loading.value || props.loading
                  ? "visible delay-300"
                  : "invisible -translate-x-5 opacity-0",
              )}
            >
              <Spinner />
            </div>
          </button>
        )}
      </>
    );
  },
);
