import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation, type LinkProps } from "@builder.io/qwik-city";

type NavLinkProps = LinkProps & { activeClass?: string };

export default component$(({ activeClass, ...props }: NavLinkProps) => {
  const location = useLocation();
  const toPathname = props.href ?? "";
  const locationPathname = location.url.pathname;

  // Normalize paths to remove trailing slashes except for root
  const normalize = (path: string) =>
    path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

  const normalizedTo = normalize(toPathname);
  const normalizedLocation = normalize(locationPathname);

  const isActive = normalizedLocation === normalizedTo;

  return (
    <Link
      {...props}
      class={[props.class, isActive && activeClass ? activeClass : ""]}
    >
      <Slot />
    </Link>
  );
});
