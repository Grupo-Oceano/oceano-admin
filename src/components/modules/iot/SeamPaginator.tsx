// Since seam handles pagination way different, we need to implement a custom paginator

import { component$, QRL } from "@builder.io/qwik";
import { Pagination } from "@qwik-ui/headless";
import { SeamPagination } from "~/common/hooks/seam/useSeamDevicesList";
import Icon from "~/components/etc/ui/Icon";

interface Props {
  classes?: string;
  onPageChange: QRL<(page: number) => void>;
  pagination: SeamPagination | null;
  page: number;
  limit: number;
}

export default component$<Props>(({ classes, onPageChange, page }) => {
  return (
    <div class={classes}>
      <Pagination
        selectedPage={page}
        totalPages={10}
        onPageChange$={onPageChange}
        customArrowTexts={{ previous: "", next: "" }}
        class="flex items-center gap-2"
        selectedClass="bg-blue-600 text-gray-600 px-3 py-1 rounded font-bold dark:bg-blue-700 dark:text-white"
        defaultClass="cursor-pointer bg-white text-gray-600 px-3 py-1 rounded hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        dividerClass="mx-1 text-gray-400"
        prevButtonClass="cursor-pointer px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-600"
        nextButtonClass="cursor-pointer px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <Icon q:slot="prefix" icon="keyboard_double_arrow_left" />
        <Icon q:slot="suffix" icon="keyboard_double_arrow_right" />
      </Pagination>
    </div>
  );
});
