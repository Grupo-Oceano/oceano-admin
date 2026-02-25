import { component$, Slot } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import ThemeToggle from "~/components/etc/system/ThemeToggle";
import Button from "~/components/etc/ui/Button";
import Icon from "~/components/etc/ui/Icon";

export default component$(() => {
  const navigate = useNavigate();

  // Simula tus props/lógica real aquí
  const logoURL = "/logo.png";
  const disabled = () => false;
  const routeLink = () => ""; // pon aquí la ruta si aplica
  const buttonTitle = () => "Volver";

  return (
    <div class="flex h-screen w-screen flex-col bg-gray-200 dark:bg-gray-800">
      <header class="flex h-28 w-full flex-row items-center justify-between bg-gray-100 p-6 px-10 dark:bg-gray-900">
        <img
          src="/favicon.png"
          alt="logo"
          style={{ maxWidth: "200px", maxHeight: "100px" }}
        />

        {!disabled() && (
          <div class="animate-slideInFromLeft flex flex-row items-center gap-2">
            {routeLink() ? (
              <Button
                style="secondary"
                href={routeLink()}
                title={buttonTitle()}
                class="d-print-none flex flex-row items-center gap-1"
              >
                <Icon icon="arrow_back" class="text-xl" />
                {buttonTitle()}
              </Button>
            ) : (
              <Button
                style="secondary"
                type="button"
                title={buttonTitle()}
                class="d-print-none flex flex-row items-center gap-1"
                onClick$={() => navigate("../")}
              >
                <Icon icon="arrow_back" class="text-xl" />
                {buttonTitle()}
              </Button>
            )}

            <ThemeToggle classes="d-print-none" />
          </div>
        )}
      </header>

      <Slot />
    </div>
  );
});
