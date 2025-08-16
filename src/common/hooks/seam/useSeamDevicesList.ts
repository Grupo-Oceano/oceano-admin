import { useStore, useTask$ } from "@builder.io/qwik";
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
}

export const useSeamDevicesList = () => {
  const store = useStore<Store>({
    data: [],
    loading: true,
    error: null,
    pagination: null,
  });

  useTask$(async ({ track, cleanup }) => {
    track(() => [store.pagination?.nextPageCursor]);

    const controller = new AbortController();
    const signal = controller.signal;

    const [errRes, response] = await apiCall.get<
      SeamDevice[],
      { pagination: SeamPagination }
    >(`/api/iot/devices`, {
      signal,
    });

    if (errRes) {
      store.error = errRes.message || "Unknown error";
    }

    if (response) {
      store.data.push(...response.data);
      store.pagination = response.pagination;
    }

    cleanup(() => {});
  });

  return { ...store };
};
