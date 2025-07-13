import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface Props {
  total: number;
  currentPage: number;
  selectedPageSize: number;
  pageSizeOptions: number[];
  onPageChange$?: (offset: number) => void;
  onPageSizeChange$?: (size: number) => void;
}

export default component$<Props>(
  ({
    total,
    currentPage,
    selectedPageSize,
    pageSizeOptions,
    onPageChange$,
    onPageSizeChange$,
  }) => {
    const rangeDisplaying = useSignal("");
    const current = useSignal(currentPage);
    const size = useSignal(selectedPageSize);

    const calculateRange = $(() => {
      const start = total === 0 ? 0 : current.value * size.value + 1;
      const end = Math.min((current.value + 1) * size.value, total);
      rangeDisplaying.value = `${start} - ${end} de ${total}`;
    });

    const changePageSize = $((newSize: number) => {
      size.value = newSize;
      if (current.value !== 0 && onPageChange$) {
        onPageChange$(0);
        current.value = 0;
      }
      if (onPageSizeChange$) onPageSizeChange$(newSize);
      calculateRange();
    });

    const changePage = $(
      async (action: "prevPage" | "nextPage" | "firstPage" | "lastPage") => {
        if (total === 0) {
          calculateRange();
          return;
        }

        const maxPage = Math.ceil(total / size.value) - 1;
        const newPage = {
          prevPage: Math.max(current.value - 1, 0),
          nextPage: Math.min(current.value + 1, maxPage),
          firstPage: 0,
          lastPage: maxPage,
        }[action];

        if (newPage !== current.value) {
          current.value = newPage;
          if (onPageChange$) await onPageChange$(newPage * size.value);
        }

        await calculateRange();
      },
    );

    useVisibleTask$(({ track }) => {
      track(() => current.value);
      track(() => size.value);
      calculateRange();
    });

    return (
      <div class="flex flex-row items-center justify-end gap-2 p-1">
        <nav aria-label="Page navigation">
          <ul class="inline-flex items-center space-x-1">
            <li class="cursor-pointer" onClick$={() => changePage("firstPage")}>
              <span class="material-symbols-outlined">
                keyboard_double_arrow_left
              </span>
            </li>
            <li class="cursor-pointer" onClick$={() => changePage("prevPage")}>
              <span class="material-symbols-outlined">keyboard_arrow_left</span>
            </li>
            <div class="rounded border bg-white px-3 py-1 text-sm dark:bg-gray-800">
              {rangeDisplaying.value}
            </div>
            <li class="cursor-pointer" onClick$={() => changePage("nextPage")}>
              <span class="material-symbols-outlined">
                keyboard_arrow_right
              </span>
            </li>
            <li class="cursor-pointer" onClick$={() => changePage("lastPage")}>
              <span class="material-symbols-outlined">
                keyboard_double_arrow_right
              </span>
            </li>
          </ul>
        </nav>

        <div class="relative">
          <button
            type="button"
            class="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
          >
            {size.value}
          </button>
          <ul class="absolute right-0 z-10 mt-1 w-20 rounded border bg-white shadow">
            {pageSizeOptions.map((option) => (
              <li
                key={option}
                class="cursor-pointer px-2 py-1 hover:bg-gray-100"
                onClick$={() => changePageSize(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);
