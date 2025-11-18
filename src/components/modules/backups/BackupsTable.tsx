import { component$ } from "@builder.io/qwik";
import { useApi } from "~/common/hooks/useApi";
import TableBase, {
  TableBaseConfig,
  TableColumn,
} from "~/components/etc/ui/TableBase";
import { Backup } from "~/models/backups";

interface Props {
  backups: Backup[] | null;
  loading: boolean;
}

export default component$(() => {
  const { data, loading, error } = useApi<Backup[]>(
    "/oceano-infra/list-backups",
    "get",
  );

  const columns: TableColumn<Backup>[] = [
    { header: "Name", accessor: "name" },
    { header: "Size", accessor: "size" },
    { header: "Access", accessor: "access" },
    { header: "Modify", accessor: "modify" },
    { header: "Change", accessor: "change" },
    { header: "Birth", accessor: "birth" },
  ];

  const config: TableBaseConfig<Backup> = {
    columns,
    loadingRows: 3,
  };

  return (
    <div class="rounded-lg bg-white shadow-sm dark:bg-gray-700">
      <div class="px-6 py-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          List of backups
        </h2>
      </div>

      <div class="px-3">
        <TableBase
          containerClass="shadow-none! bg-transparent!"
          config={config}
          data={data}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
});
