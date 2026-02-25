import { component$, JSX, QRL } from "@builder.io/qwik";
import { Pagination } from "~/common/hooks/usePaginatedFetch";
import Error from "./Error";
import TablePagination from "./TablePagination";

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T;
  renderCell?: QRL<(row: T) => JSX.Element>; // Make sure renderCell returns JSX.Element
}

export interface TableBaseConfig<T> {
  columns: TableColumn<T>[];
  loadingRows?: number;
}

interface TableBaseProps<T> {
  tableClass?: string;
  containerClass?: string;
  config: TableBaseConfig<T>;
  data: T[] | null;
  loading?: boolean;
  error?: string;
  pagination?: Pagination;
}

export const TableBase = <T,>({
  data,
  loading,
  error,
  config,
  containerClass,
  tableClass,
  pagination,
}: TableBaseProps<T>) => {
  const { columns, loadingRows = 5 } = config;

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div
      class={["rounded-lg bg-white shadow-sm dark:bg-gray-800", containerClass]}
    >
      <div class="overflow-x-auto rounded-lg">
        <table class={["min-w-full divide-y divide-gray-200", tableClass]}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-700">
            {loading || !data
              ? Array.from({ length: loadingRows }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} class="px-6 py-4">
                        <div class="h-4 animate-pulse rounded bg-gray-300 dark:bg-gray-800"></div>
                      </td>
                    ))}
                  </tr>
                ))
              : data?.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    class="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        class={"px-6 py-4 text-sm whitespace-nowrap capitalize"}
                      >
                        {col.renderCell ? (
                          col.renderCell!(row)
                        ) : col.accessor ? (
                          <>{row[col.accessor] ?? ""}</>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <TablePagination
          class="mt-5"
          pageSizeOptions={["25", "50", "100", "200"]}
          {...pagination}
        />
      )}
    </div>
  );
};

export default component$(TableBase);
