import { component$, QRL } from "@builder.io/qwik";
import Paginator from "./Paginator";
import Select from "./Select";

interface Props {
  class?: string;

  total: number;
  currentPage: number;
  pageSize: number;

  pageSizeOptions: string[];

  onPageChange: QRL<(page: number) => void>;
  onPageSizeChange: QRL<(size: number) => void>;
}

export default component$<Props>(
  ({
    class: className,
    total,
    currentPage,
    pageSize: selectedPageSize,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
  }) => {
    return (
      <div
        class={["flex flex-row items-center justify-end gap-2 p-1", className]}
      >
        <Paginator
          selectedPage={currentPage}
          totalPages={Math.ceil(total / selectedPageSize)}
          onPageChange$={onPageChange}
        />

        <div class="relative">
          <Select
            value={selectedPageSize}
            options={pageSizeOptions}
            onChange$={onPageSizeChange}
            placeholder="Choose a page size"
          />
        </div>
      </div>
    );
  },
);
