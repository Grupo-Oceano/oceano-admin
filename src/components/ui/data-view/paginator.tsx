import { component$, type QRL } from "@qwik.dev/core";

type PaginatorProps = {
  total: number;
  offset: number;
  take: number;
  takeOptions?: readonly number[];
  /** The app writes the new values to the URL; the lib knows no router. */
  onChange$: QRL<(next: { offset: number; take: number }) => void>;
  /** Locks every control, e.g. while the requested page loads. */
  disabled?: boolean;
  testId?: string;
  class?: string;
};

const pageButton =
  "inline-flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-surface-2 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-11 dark:text-gray-400 dark:hover:text-white";

/**
 * Offset/take pager (the backends' pagination params).
 * ```tsx
 * <Paginator total={list.value.total} offset={q.offset} take={q.take} onChange$={(next) => setSearch(next)} testId="leads-paginator" />
 * ```
 */
export const Paginator = component$<PaginatorProps>((props) => {
  const testId = props.testId ?? "paginator";
  const options = props.takeOptions ?? [10, 25, 50, 100];
  const from = props.total === 0 ? 0 : props.offset + 1;
  const to = Math.min(props.offset + props.take, props.total);
  const lastOffset = Math.max(
    0,
    Math.floor((props.total - 1) / props.take) * props.take,
  );

  return (
    <nav
      class={[
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-gray-500 dark:text-gray-400",
        props.class,
      ]}
      aria-label="Pagination"
      data-testid={testId}
    >
      <span data-testid={`${testId}-summary`}>
        {from}–{to} of {props.total}
      </span>
      <div class="flex items-center gap-1">
        <label class="mr-2 flex items-center gap-2">
          <span>Per page</span>
          <select
            class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 pointer-coarse:min-h-11"
            disabled={props.disabled}
            data-testid={`${testId}-take`}
            onChange$={(_, el) =>
              props.onChange$({ offset: 0, take: Number(el.value) })
            }
          >
            {options.map((n) => (
              <option key={n} value={String(n)} selected={n === props.take}>
                {String(n)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          class={pageButton}
          aria-label="First page"
          disabled={props.disabled || props.offset === 0}
          data-testid={`${testId}-first`}
          onClick$={() => props.onChange$({ offset: 0, take: props.take })}
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            first_page
          </span>
        </button>
        <button
          type="button"
          class={pageButton}
          aria-label="Previous page"
          disabled={props.disabled || props.offset === 0}
          data-testid={`${testId}-prev`}
          onClick$={() =>
            props.onChange$({
              offset: Math.max(0, props.offset - props.take),
              take: props.take,
            })
          }
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            chevron_left
          </span>
        </button>
        <button
          type="button"
          class={pageButton}
          aria-label="Next page"
          disabled={props.disabled || to >= props.total}
          data-testid={`${testId}-next`}
          onClick$={() =>
            props.onChange$({
              offset: props.offset + props.take,
              take: props.take,
            })
          }
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            chevron_right
          </span>
        </button>
        <button
          type="button"
          class={pageButton}
          aria-label="Last page"
          disabled={props.disabled || to >= props.total}
          data-testid={`${testId}-last`}
          onClick$={() =>
            props.onChange$({ offset: lastOffset, take: props.take })
          }
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            last_page
          </span>
        </button>
      </div>
    </nav>
  );
});
