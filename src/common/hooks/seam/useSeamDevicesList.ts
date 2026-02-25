import { $, useStore, useTask$ } from "@builder.io/qwik";
import { SeamPageCursor } from "seam";
import { apiCall } from "~/lib/axios";
import { SeamDevice } from "~/models/iot.model";

export interface SeamPagination {
  readonly hasNextPage: boolean;
  readonly nextPageCursor: SeamPageCursor | null;
  readonly nextPageUrl: string | null;
}

interface Store {
  data: SeamDevice[];
  loading: boolean;
  error: string | null;
  pagination: SeamPagination | null;
  page: number;
  limit: number;
}

interface SeamResponse {
  devices: SeamDevice[];
  pagination: SeamPagination;
}

export const useSeamDevicesList = () => {
  const store = useStore<Store>({
    data: [],
    loading: true,
    error: null,
    pagination: {
      hasNextPage: false,
      nextPageCursor: null,
      nextPageUrl: null,
    },
    page: 1,
    limit: 100,
  });

  useTask$(async ({ track, cleanup }) => {
    track(() => []);
    store.loading = true;

    const controller = new AbortController();
    const signal = controller.signal;

    const [errRes, response] = await apiCall.get<
      SeamResponse,
      {
        pagination: SeamPagination;
      }
    >(`/iot/devices`, {}, { signal });

    if (errRes) {
      store.error = errRes.message || "Unknown error";
    }

    if (response) {
      store.data.push(...response.data.devices);
      store.pagination = {
        ...response.pagination,
      };
    }

    store.loading = false;

    cleanup(() => {});
  });

  return {
    ...store,
    onPageChange: $((page: number) => {
      console.log(page);
    }),
  };
};
