import {
  $,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";
import {
  Button,
  card,
  DataTable,
  heading,
  Icon,
  type Column,
} from "~/components/ui";
import { connectSocket, WSEvent, WSNamespace } from "~/lib/realtime/socket";
import { formatDateTime } from "~/lib/utils/format";
import { batteryIcon, mapBatteryLevelToClass } from "~/lib/utils/seam-devices";
import type { DeviceLiveData, SeamDevice } from "~/models/iot.model";
import MatchCSVToLocks from "./MatchCSVToLocks";

/** Live per-device data from the `iot` socket, and whether a CSV of lock codes was picked. */
type IotLive = { devices: Record<string, DeviceLiveData>; csvPicked: boolean };
const IotLiveCtx = createContextId<IotLive>("modules.iot.live");

const DeviceCell = component$<{ row: SeamDevice }>(({ row }) => (
  <div class="flex items-center gap-3.5 whitespace-break-spaces">
    {row.properties.image_url ? (
      <img
        class="size-10 rounded object-cover"
        src={row.properties.image_url}
        alt={row.properties.image_alt_text || row.device_type}
        width={40}
        height={40}
      />
    ) : (
      <Icon icon="image" class="text-4xl text-gray-400" />
    )}
    <div>
      <div class="text-sm font-medium break-words text-gray-900 dark:text-white">
        {row.display_name || "Unnamed Device"}
      </div>
      <div class="text-sm break-words text-gray-500 dark:text-gray-400">
        {row.device_id.length > 16 ? (
          <span title={row.device_id}>{row.device_id.slice(0, 16)}...</span>
        ) : (
          row.device_id
        )}
      </div>
    </div>
  </div>
));

const LocationCell = component$<{ row: SeamDevice }>(({ row }) => (
  <div class="text-sm break-words text-gray-500 dark:text-gray-400">
    {row.location?.location_name || "Unknown Location"}
  </div>
));

const StatusCell = component$<{ row: SeamDevice }>(({ row }) => {
  const live = useContext(IotLiveCtx);
  const level = row.properties.battery?.level;
  const settingCode =
    live.csvPicked || !!live.devices[row.device_id]?.access_code_being_set;
  return (
    <div class="flex flex-col gap-3 text-sm break-words text-gray-500 dark:text-gray-400">
      <div class="flex flex-row items-center gap-2">
        <Icon
          class={["text-2xl", mapBatteryLevelToClass(level)].join(" ")}
          icon={batteryIcon(level)}
        />
        {level ? <span>{Math.round(level * 100)}%</span> : "Offline"}
      </div>
      {settingCode && (
        <p>
          <Icon icon="info" class="text-sky-500 dark:text-sky-400" /> An access
          code is being set.
        </p>
      )}
    </div>
  );
});

const AddedCell = component$<{ row: SeamDevice }>(({ row }) => (
  <>{formatDateTime(row.created_at)}</>
));

const columns: Column<SeamDevice>[] = [
  { key: "display_name", header: "Device", cell: DeviceCell },
  { key: "location", header: "Location", cell: LocationCell, hideBelow: "md" },
  { key: "status", header: "Status", cell: StatusCell },
  { key: "created_at", header: "Added at", cell: AddedCell, hideBelow: "lg" },
];

export default component$<{
  devices: SeamDevice[];
  error: string | null;
  class?: string;
}>((props) => {
  const live = useStore<IotLive>({ devices: {}, csvPicked: false });
  useContextProvider(IotLiveCtx, live);
  const ids = props.devices.map((d) => d.device_id);

  // One socket for the whole table; each device reports on `device_status_update-<id>`.
  // eslint-disable-next-line qwik/no-use-visible-task -- the socket lives in the browser only
  useVisibleTask$(async ({ cleanup }) => {
    let closed = false;
    let disconnect = () => {};
    cleanup(() => {
      closed = true;
      disconnect();
    });
    const socket = await connectSocket(WSNamespace.IOT);
    disconnect = () => socket.disconnect();
    if (closed) return disconnect();
    for (const id of ids) {
      socket.on(WSEvent.DEVICE_STATUS_UPDATE + id, (data: DeviceLiveData) => {
        live.devices[id] = { ...live.devices[id], ...data };
      });
    }
  });

  const pickCsv = $(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.addEventListener("change", () => {
      if (input.files?.[0]) live.csvPicked = true;
    });
    input.click();
  });

  return (
    <div class={card({ class: props.class })}>
      <div class="flex flex-row flex-wrap items-center justify-between gap-2 px-6 py-4">
        <h2 class={heading()}>Kwikset devices</h2>
        <MatchCSVToLocks />
        <Button onClick$={pickCsv}>Set locks from CSV</Button>
      </div>
      <div class="px-3 pb-3">
        <DataTable
          flat
          columns={columns}
          rows={props.devices}
          error={props.error}
          rowKey="device_id"
          testId="devices"
        />
      </div>
    </div>
  );
});
