import { $, component$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { Avatar, Dropdown } from "flowbite-qwik";
import { useUser } from "~/routes/home/layout";

export default component$(() => {
  const user = useUser();
  const navigate = useNavigate();

  const logout = $(async () => {
    const res = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.redirected) {
      navigate(res.url); // seguir la redirección que manda el backend
    } else {
      navigate("/login"); // fallback
    }
  });

  return (
    <>
      <Dropdown
        as={
          <Avatar
            img="https://res.cloudinary.com/dkht4mwqi/image/upload/f_auto,q_auto/v1718462567/flowbite-qwik/zqvjllre0haavqbwqw0f.jpg"
            rounded
          >
            <div class="space-y-1 text-start font-medium dark:text-white">
              <div>{user?.value?.username}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">admin</div>
            </div>
          </Avatar>
        }
      >
        <Dropdown.Item header>
          <span class="block text-sm">{user?.value?.username}</span>
          <span class="block truncate text-sm font-medium">
            {user?.value?.username}@flowbite.com
          </span>
        </Dropdown.Item>
        <Dropdown.Item>Dashboard</Dropdown.Item>
        <Dropdown.Item>Settings</Dropdown.Item>
        <Dropdown.Item divider />
        <Dropdown.Item onClick$={logout}>
          <p class="flex w-full content-between justify-between">
            Log out
            <span class="material-symbols-rounded">logout</span>
          </p>
        </Dropdown.Item>
      </Dropdown>
    </>
  );
});
