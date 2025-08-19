import { component$, Slot } from "@builder.io/qwik";
import { InfrastructureContextProvider } from "~/lib/stores/infrastructure-store";

export default component$(() => {
  return (
    <InfrastructureContextProvider>
      <Slot />
    </InfrastructureContextProvider>
  );
});
