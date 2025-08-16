import { component$, JSX, QRL } from "@builder.io/qwik";
import { Table } from "flowbite-qwik";
import Error from "./Error";

export interface TableFlowbiteColumn<T> {
  header: string;
  accessor?: keyof T;
  renderCell?: QRL<(row: T) => JSX.Element>;
}

interface TableFlowbiteProps<T> {
  columns: TableFlowbiteColumn<T>[];
  data: T[] | null;
  loading?: boolean;
  error?: string | null;
  loadingRows?: number;
  tableClass?: string;
}

export default component$<TableFlowbiteProps<any>>(
  ({ columns, data, loading, error, loadingRows = 5, tableClass }) => {
    if (error) {
      return <Error error={error} />;
    }

    return (
      <div class="overflow-x-auto rounded-lg">
        <Table class="shadow-sm">
          <Table.Head>
            {columns.map((col, idx) => (
              <Table.HeadCell key={idx}>{col.header}</Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body class="divide-y">
            {loading || !data
              ? Array.from({ length: loadingRows }).map((_, rowIdx) => (
                  <Table.Row key={rowIdx}>
                    {columns.map((_, colIdx) => (
                      <Table.Cell key={colIdx}>
                        <div class="h-4 animate-pulse rounded bg-gray-300 dark:bg-gray-800"></div>
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              : data?.map((row, rowIdx) => (
                  <Table.Row
                    key={rowIdx}
                    class="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    {columns.map((col, colIdx) => (
                      <Table.Cell
                        key={colIdx}
                        class="font-medium whitespace-nowrap text-gray-900 dark:text-white"
                      >
                        {col.renderCell ? (
                          col.renderCell!(row)
                        ) : col.accessor ? (
                          <>{row[col.accessor] ?? ""}</>
                        ) : null}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
          </Table.Body>
        </Table>
      </div>
    );
  },
);
