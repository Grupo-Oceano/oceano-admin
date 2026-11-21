import { component$, Slot } from "@qwik.dev/core";
import { InfrastructureContextProvider } from "~/lib/stores/infrastructure-store";

export default component$(() => {
  return (
    <InfrastructureContextProvider>
      <Slot />
    </InfrastructureContextProvider>
  );
});
