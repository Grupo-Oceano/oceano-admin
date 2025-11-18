import { $, component$, useSignal } from "@builder.io/qwik";
import { useSeamDevicesList } from "~/common/hooks/seam/useSeamDevicesList";
import { dateToReader } from "~/common/masks/dates";
import Button from "~/components/etc/ui/Button";
import Icon from "~/components/etc/ui/Icon";
import Image from "~/components/etc/ui/Image";
import TableFlowbite, {
  TableFlowbiteColumn,
} from "~/components/etc/ui/TableFlowbite";
import { batteryIcon, mapBatteryLevelToClass } from "~/lib/utils/seam-devices";
import { SeamDevice } from "~/models/iot.model";
import DeviceLiveUpdate from "./DeviceLiveUpdate";
import MatchCSVToLocks from "./MatchCSVToLocks";

interface Props {
  classes?: string;
}

export default component$<Props>(({ classes }) => {
  const { data, loading, error /* limit, page, pagination, onPageChange */ } =
    useSeamDevicesList();

  const addedfile = useSignal(false);

  const columns: TableFlowbiteColumn<SeamDevice>[] = [
    /* {
      header: "Image",
      renderCell: $((row) => (
        <Image
          class="rounded-2 h-10 w-10 object-cover"
          src={`/assets/images/seam/${row.device_type}.jpg`}
          alt={row.display_name || "Device Image"}
        />
      )),
    }, */
    {
      header: "Device",
      renderCell: $((row) => (
        <div class="flex items-center space-x-3.5 whitespace-break-spaces">
          <Image
            class="rounded-2 h-10 w-10 object-cover"
            src={row.properties.image_url}
            alt={row.properties.image_alt_text || row.device_type}
          />
          <div>
            <div class="text-sm font-medium break-words text-gray-900 dark:text-white">
              {row.display_name || "Unnamed Device"}
            </div>
            <div class="text-sm break-words text-gray-500 dark:text-gray-400">
              {row.device_id.length > 16 ? (
                <span title={row.device_id}>
                  {row.device_id.slice(0, 16)}...
                </span>
              ) : (
                row.device_id
              )}
            </div>
          </div>
        </div>
      )),
    },
    {
      header: "location",
      renderCell: $((row) => (
        <div class="text-sm break-words text-gray-500 dark:text-gray-400">
          {row.location?.location_name || "Unknown Location"}
        </div>
      )),
    },
    {
      header: "Status",
      renderCell: $((row) => (
        <div class="text-sm break-words text-gray-500 dark:text-gray-400">
          <div class="flex flex-row items-center gap-2">
            <Icon
              class={[
                "text-2xl!",
                mapBatteryLevelToClass(row.properties.battery?.level),
              ]}
              icon={batteryIcon(row.properties.battery?.level)}
            />
            {row.properties.battery?.level ? (
              <span>{row.properties.battery?.level * 100}%</span>
            ) : (
              "Offline"
            )}
          </div>
          <DeviceLiveUpdate device={row} addedfile={addedfile.value} />
        </div>
      )),
    },
    {
      header: "Added at",
      renderCell: $((row) => <>{dateToReader(row.created_at)}</>),
    },
  ];

  const openFileSystem = $(() => {
    // Trigger add file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.click();

    input.addEventListener("change", (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        addedfile.value = true;
      }
    });
  });

  return (
    <div class={["rounded-lg bg-white shadow-sm dark:bg-gray-800", classes]}>
      <div class="flex flex-row items-center justify-between px-6 py-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Kwikset devices
        </h2>

        <MatchCSVToLocks />

        <Button style="primary" onClick$={openFileSystem}>
          Set locks from CSV
        </Button>

        {/* <SeamPaginator
          page={page}
          limit={limit}
          pagination={pagination}
          onPageChange={onPageChange}
        /> */}
      </div>
      <div class="px-3">
        <TableFlowbite
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          loadingRows={5}
        />
      </div>
    </div>
  );
});
