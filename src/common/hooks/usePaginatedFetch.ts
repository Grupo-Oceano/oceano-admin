import { $, QRL, useSignal, useTask$ } from "@builder.io/qwik";
import { apiCall } from "~/lib/axios";

interface Result<T> {
  data: T[];
  loading: boolean;
  error: string;
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;

    onPageChange: QRL<(page: number) => void>;
    onPageSizeChange: QRL<(size: number) => void>;
  };
}

export const usePaginatedFetch = <T>(path: string): Result<T> => {
  const data = useSignal<T[]>([]);
  const loading = useSignal(true);
  const error = useSignal("");

  const currentPage = useSignal(1);
  const pageSize = useSignal(10);
  const totalCount = useSignal(0);

  useTask$(async ({ track, cleanup }) => {
    track(() => [currentPage.value, pageSize.value, path]);

    const controller = new AbortController();
    const signal = controller.signal;

    loading.value = true;
    error.value = "";

    const [errorRes, response] = await apiCall.getAll<T>(
      `${path}/${(currentPage.value - 1) * pageSize.value}/${pageSize.value}`,
      {},
      { signal },
    );

    if (errorRes || !response) {
      if (errorRes?.message !== "CanceledError") {
        error.value = errorRes?.message || "Unknown error";
      }
    } else {
      data.value = response.data;
      totalCount.value = response.total;
    }

    cleanup(() => controller.abort());
    loading.value = false;
  });

  return {
    data: data.value,
    loading: loading.value,
    error: error.value,
    pagination: {
      total: totalCount.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,

      onPageChange: $((page: number) => {
        currentPage.value = page;
      }),
      onPageSizeChange: $((size: number) => {
        pageSize.value = size;
        currentPage.value = 1; // Reset to first page on page size change
      }),
    },
  };
};
