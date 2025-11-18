import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "flowbite-qwik";
import Button from "~/components/etc/ui/Button";

export default component$(() => {
  const defaultModalVisible = useSignal(false);

  return (
    <div>
      <Button
        style="hollow"
        onClick$={() => {
          defaultModalVisible.value = true;
        }}
      >
        Open Modal
      </Button>
      <Modal
        header={<div class="flex items-center text-lg">Terms of Service</div>}
        footer={
          <div class="flex justify-between">
            <Button
              onClick$={() => {
                defaultModalVisible.value = false;
              }}
              style="secondary"
            >
              Decline
            </Button>
            <Button
              onClick$={() => {
                defaultModalVisible.value = false;
              }}
              style="primary"
            >
              I accept
            </Button>
          </div>
        }
        bind:show={defaultModalVisible}
        onClickOutside$={() => {
          console.log("click outside !");
        }}
      >
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          With less than a month to go before the European Union enacts new
          consumer privacy laws for its citizens, companies around the world are
          updating their terms of service agreements to comply.
        </p>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          The European Union’s General Data Protection Regulation (G.D.P.R.)
          goes into effect on May 25 and is meant to ensure a common set of data
          rights in the European Union. It requires organizations to notify
          users as soon as possible of high-risk data breaches that could
          personally affect them.
        </p>
      </Modal>
    </div>
  );
});
