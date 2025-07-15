import { $, useSignal } from "@builder.io/qwik";
import { useToast } from "flowbite-qwik";
import { ClientSideAxios } from "~/lib/client-side-axios";

interface DownloadProps {
  url: string;
}

const useDownload = (url: string) => {
  const loading = useSignal(false);
  const { add } = useToast();

  const download = $(async () => {
    loading.value = true;
    try {
      const [error, blob, contentDisposition] =
        await ClientSideAxios.download(url);

      if (error || !blob) {
        add({
          text: error?.message || "Failed to download file",
          type: "danger",
        });
        return;
      }

      const match = contentDisposition?.match(/filename="?(.+?)"?$/);
      const fileName = match ? match[1] : "download.csv";

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      loading.value = false;
    }
  });

  return { loading, download };
};

export { useDownload };
