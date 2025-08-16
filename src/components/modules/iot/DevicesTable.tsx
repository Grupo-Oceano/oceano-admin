import { $, component$ } from "@builder.io/qwik";
import { dateToReader } from "~/common/masks/dates";
import TableFlowbite, {
  TableFlowbiteColumn,
} from "~/components/etc/ui/TableFlowbite";

import { useSeamDevicesList } from "~/common/hooks/seam/useSeamDevicesList";
import Image from "~/components/etc/ui/Image";
import { SeamDevice } from "~/models/iot.model";
import SeamPaginator from "./SeamPaginator";

interface Props {}

export default component$<Props>(() => {
  const { data, loading, error, pagination } = useSeamDevicesList();

  const columns: TableFlowbiteColumn<SeamDevice>[] = [
    {
      header: "Image",
      renderCell: $((row) => (
        <Image
          class="rounded-2 h-10 w-10 object-cover"
          src={`/assets/images/seam/${row.device_type}.jpg`}
          alt={row.display_name || "Device Image"}
        />
      )),
    },
    {
      header: "Device",
      renderCell: $((row) => (
        <div class="flex items-center whitespace-break-spaces">
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
      header: "Created",
      renderCell: $((row) => <>{dateToReader(row.created_at)}</>),
    },
  ];

  return (
    <>
      <div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div class="flex flex-row justify-between px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Kwikset devices
          </h2>

          <SeamPaginator />
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
    </>
  );
});
