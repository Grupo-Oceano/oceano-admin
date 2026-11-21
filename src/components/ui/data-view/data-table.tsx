import {
  component$,
  Slot,
  type Component,
  type JSXChildren,
  type JSXOutput,
} from "@qwik.dev/core";
import { tv } from "tailwind-variants";
import { getPath } from "./get-path";

/**
 * One column. Plain columns print the value at `key` (a dotted path). Custom cells pass `cell`, a `component$`
 * that receives the row: functions don't serialize, components do.
 */
export type Column<T> = {
  key: string;
  header: string;
  cell?: Component<{ row: T }>;
  /** Hides the column on narrow screens; the table scrolls sideways inside its own wrapper either way. */
  hideBelow?: "sm" | "md" | "lg";
  align?: "start" | "end";
  class?: string;
};

export const table = tv({
  slots: {
    root: "overflow-hidden rounded-lg bg-surface shadow-sm",
    scroller: "overflow-x-auto",
    tableEl: "min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700",
    th: "px-6 py-3 text-left text-xs font-medium whitespace-nowrap text-gray-500 uppercase dark:text-gray-300",
    tbody: "divide-y divide-gray-200 dark:divide-gray-700",
    tr: "hover:bg-surface-2",
    td: "px-6 py-4 text-gray-900 dark:text-gray-100",
    message: "px-6 py-10 text-center text-gray-500 dark:text-gray-400",
  },
  variants: {
    flat: { true: { root: "bg-transparent shadow-none" } },
  },
});

const hideClass = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const;
const cellClass = (col: Column<object>) => [
  col.hideBelow && hideClass[col.hideBelow],
  col.align === "end" && "text-right",
  col.class,
];

type DataTableProps<T> = {
  columns: readonly Column<T>[];
  rows: readonly T[] | null;
  /** Placeholder rows while `rows` is null or `loading`. */
  loading?: boolean;
  loadingRows?: number;
  /** Replaces the rows with an inline error row (`<testId>-error`); the toolbar/footer slots stay. */
  error?: string | null;
  /** Row id path for keys and `data-row-id` (default: the row index). */
  rowKey?: string;
  emptyText?: string;
  /** Transparent, no shadow: for a table inside a card. */
  flat?: boolean;
  testId?: string;
  class?: string;
};

const DataTableImpl = component$<DataTableProps<object>>((props) => {
  const s = table({ flat: props.flat });
  const testId = props.testId ?? "data-table";
  const columns = props.columns;
  const span = columns.length;
  return (
    <div class={s.root({ class: props.class })} data-testid={testId}>
      <Slot name="toolbar" />
      <div class={s.scroller()}>
        <table class={s.tableEl()}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  class={s.th({ class: cellClass(col) })}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody class={s.tbody()}>
            {props.error ? (
              <tr>
                <td
                  colSpan={span}
                  role="alert"
                  class={s.message({ class: "text-danger" })}
                  data-testid={`${testId}-error`}
                >
                  {props.error}
                </td>
              </tr>
            ) : props.loading || !props.rows ? (
              Array.from({ length: props.loadingRows ?? 5 }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  {columns.map((col) => (
                    <td key={col.key} class={s.td({ class: cellClass(col) })}>
                      <div class="h-4 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                    </td>
                  ))}
                </tr>
              ))
            ) : props.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={span}
                  class={s.message()}
                  data-testid={`${testId}-empty`}
                >
                  {props.emptyText ?? "Nothing to show."}
                </td>
              </tr>
            ) : (
              props.rows.map((row, index) => {
                const id = String(
                  (props.rowKey && getPath(row, props.rowKey)) ?? index,
                );
                return (
                  <tr
                    key={id}
                    class={s.tr()}
                    data-testid={`${testId}-row`}
                    data-row-id={id}
                  >
                    {columns.map((col) => {
                      const Cell = col.cell;
                      const value = getPath(row, col.key);
                      return (
                        <td
                          key={col.key}
                          class={s.td({ class: cellClass(col) })}
                        >
                          {Cell ? (
                            <Cell row={row} />
                          ) : value === null || value === undefined ? (
                            ""
                          ) : (
                            String(value)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Slot name="footer" />
    </div>
  );
});

/**
 * Config-driven table: columns in, rows in, loading/error/empty states built in.
 * ```tsx
 * const columns: Column<Backup>[] = [{ key: 'name', header: 'Name' }, { key: 'size', header: 'Size', cell: BackupSize }];
 * <DataTable columns={columns} rows={list.value.rows} error={list.value.error} rowKey="name" testId="backups">
 *   <Paginator q:slot="footer" … />
 * </DataTable>
 * ```
 * Slots `toolbar` and `footer` render once, so per-row content goes through `cell`, never a slot.
 */
export const DataTable = DataTableImpl as unknown as <T extends object>(
  props: DataTableProps<T> & { children?: JSXChildren },
) => JSXOutput;
