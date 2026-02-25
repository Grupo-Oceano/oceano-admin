import { useStore, useTask$ } from "@builder.io/qwik";
import { apiCall, Methods } from "~/lib/axios";

interface HookResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export const useApi = <T>(path: string, method: Methods): HookResult<T> => {
  const result = useStore<HookResult<T>>({
    data: null,
    loading: true,
    error: "",
  });

  useTask$(async ({ track, cleanup }) => {
    track(() => [path, method]);
    result.loading = true;
    result.error = "";
    result.data = null;

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const [error, response] = await apiCall[method]<T>(path, { signal });
      if (error || !response) {
        console.log(error);
        throw new Error(`Error: ${error?.status} ${error?.message}`);
      }
      result.data = response.data;
    } catch (err: any) {
      if (err.name !== "AbortError") {
        result.error = err.message || "Unknown error";
      }
    } finally {
      result.loading = false;
    }

    cleanup(() => controller.abort());
  });

  return result;
};
