import { component$, Slot } from "@qwik.dev/core";
import { Link, useLocation, type LinkProps } from "@qwik.dev/router";

type NavLinkProps = LinkProps & { activeClass?: string };

const normalize = (path: string) =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

/** A `Link` that adds `activeClass` (and `aria-current`) when its `href` is the current path. */
export default component$<NavLinkProps>(({ activeClass, ...props }) => {
  const location = useLocation();
  const active =
    normalize(location.url.pathname) === normalize(props.href ?? "");
  return (
    <Link
      {...props}
      aria-current={active ? "page" : undefined}
      class={[props.class, active && activeClass]}
    >
      <Slot />
    </Link>
  );
});
