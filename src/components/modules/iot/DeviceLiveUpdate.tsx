import { component$, useStore, useTask$ } from "@builder.io/qwik";
import {
  useWebSocket,
  WSEvent,
  WSNamespace,
} from "~/common/hooks/useWebSockets";
import Icon from "~/components/etc/ui/Icon";
import { DeviceLiveData, SeamDevice } from "~/models/iot.model";

interface Props {
  device: SeamDevice;
  addedfile: boolean;
}

export default component$<Props>(({ device, addedfile }) => {
  const { listen$ } = useWebSocket(WSNamespace.IOT);

  const data = useStore<DeviceLiveData>({});

  useTask$(() => {
    listen$(
      WSEvent.DEVICE_STATUS_UPDATE + device.device_id,
      (data: DeviceLiveData) => {
        Object.assign(data, data);
      },
    );
  });

  return (
    <div class="flex flex-col gap-3">
      {addedfile && (
        <p>
          <Icon icon="info" class={"text-blue-400 dark:text-blue-700"} /> An
          access code is being set.
        </p>
      )}
    </div>
  );
});
