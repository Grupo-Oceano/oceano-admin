import {
  $,
  component$,
  Slot,
  useContext,
  type PropsOf,
  type QRL,
} from "@qwik.dev/core";
import { divider } from "../layout/divider";
import { heading } from "../layout/heading";
import type { Anchor } from "./anchor";
import { itemsIn, moveFocus, moveFor, preventNavKeys } from "./keyboard";
import { option, panel } from "./panel";
import {
  PopoverButton,
  PopoverCtx,
  togglePanel,
  usePopoverRoot,
} from "./popover";

const ITEM = '[role="menuitem"]';

/**
 * Headless UI's Menu (dropdown): `Menu`, `MenuButton`, `MenuItems`, `MenuItem`, `MenuHeading`, `MenuSeparator`.
 * Arrow keys/Home/End move between items, a letter jumps to the next item starting with it, Esc closes.
 * ```tsx
 * <Menu>
 *   <MenuButton class={button({ intent: 'ghost' })}>Options</MenuButton>
 *   <MenuItems anchor="bottom end">
 *     <MenuItem href="/dashboard/">Dashboard</MenuItem>
 *     <MenuSeparator />
 *     <form method="post" action="/auth/logout"><MenuItem type="submit">Sign out</MenuItem></form>
 *   </MenuItems>
 * </Menu>
 * ```
 */
export const Menu = component$<{ class?: string }>((props) => {
  const state = usePopoverRoot();
  return (
    <div class={props.class} data-open={state.open || undefined}>
      <Slot />
    </div>
  );
});

export const MenuButton = component$<
  Omit<PropsOf<"button">, "class" | "type"> & {
    class?: string;
    testId?: string;
  }
>((props) => (
  <PopoverButton aria-haspopup="menu" {...props}>
    <Slot />
  </PopoverButton>
));

export const MenuItems = component$<{
  anchor?: Anchor;
  class?: string;
  testId?: string;
}>((props) => {
  const ctx = useContext(PopoverCtx);
  return (
    <div
      id={ctx.id}
      popover="auto"
      role="menu"
      data-testid={props.testId}
      class={panel({ class: ["min-w-48", props.class] })}
      onToggle$={async (e, el) => {
        if (await togglePanel(ctx, e, el, props.anchor))
          itemsIn(el, ITEM)[0]?.focus();
      }}
      onKeyDown$={[
        preventNavKeys,
        $((e: KeyboardEvent, el: HTMLElement) => {
          const move = moveFor(e.key);
          if (move) return void moveFocus(el, ITEM, move);
          if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
          const items = itemsIn(el, ITEM);
          const from = items.indexOf(document.activeElement as HTMLElement);
          const ordered = [
            ...items.slice(from + 1),
            ...items.slice(0, from + 1),
          ];
          ordered
            .find((i) =>
              i.textContent
                ?.trim()
                .toLowerCase()
                .startsWith(e.key.toLowerCase()),
            )
            ?.focus();
        }),
      ]}
    >
      <Slot />
    </div>
  );
});

type MenuItemProps = {
  /** Renders a link instead of a button. */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick$?: QRL<() => void>;
  class?: string;
  testId?: string;
};

/** Closes the menu after it runs. `data-disabled` follows the `disabled` prop. */
export const MenuItem = component$<MenuItemProps>((props) => {
  const close = $(async (_: Event, el: HTMLElement) => {
    await props.onClick$?.();
    el.closest<HTMLElement>("[popover]")?.hidePopover();
  });
  const common = {
    role: "menuitem",
    tabIndex: -1,
    "data-testid": props.testId,
    "data-disabled": props.disabled || undefined,
    "aria-disabled": props.disabled || undefined,
    class: option({ class: props.class }),
  };
  return props.href && !props.disabled ? (
    <a {...common} href={props.href} onClick$={close}>
      <Slot />
    </a>
  ) : (
    <button
      {...common}
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick$={close}
    >
      <Slot />
    </button>
  );
});

export const MenuHeading = component$<{ class?: string }>((props) => (
  <div
    role="presentation"
    class={heading({ level: "group", class: ["px-3 pt-2 pb-1", props.class] })}
  >
    <Slot />
  </div>
));

export const MenuSeparator = component$<{ class?: string }>((props) => (
  <hr role="separator" class={divider({ class: ["my-1", props.class] })} />
));
