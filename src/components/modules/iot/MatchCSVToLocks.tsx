import { component$, useSignal } from "@qwik.dev/core";
import { Button, Dialog, dialog } from "~/components/ui";

// why: placeholder for the CSV-to-locks matching flow; kept from v1 as a demo dialog until the flow is specified.
export default component$(() => {
  const open = useSignal(false);
  return (
    <div>
      <Button intent="secondary" onClick$={() => (open.value = true)}>
        Open Modal
      </Button>
      <Dialog
        open={open.value}
        closable
        title="Terms of Service"
        onClose$={() => (open.value = false)}
      >
        <div class="flex flex-col gap-3 text-base leading-relaxed text-gray-500 dark:text-gray-400">
          <p>
            With less than a month to go before the European Union enacts new
            consumer privacy laws for its citizens, companies around the world
            are updating their terms of service agreements to comply.
          </p>
          <p>
            The European Union’s General Data Protection Regulation (G.D.P.R.)
            goes into effect on May 25 and is meant to ensure a common set of
            data rights in the European Union. It requires organizations to
            notify users as soon as possible of high-risk data breaches that
            could personally affect them.
          </p>
        </div>
        <footer class={dialog().footer()}>
          <Button intent="secondary" onClick$={() => (open.value = false)}>
            Decline
          </Button>
          <Button onClick$={() => (open.value = false)}>I accept</Button>
        </footer>
      </Dialog>
    </div>
  );
});
