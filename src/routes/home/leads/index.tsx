import { component$ } from "@builder.io/qwik";
import { Button, Spinner, Table } from "flowbite-qwik";
import { useDownload } from "~/common/hooks/useDownload";
import { usePaginatedFetch } from "~/common/hooks/usePaginatedFetch";
import { dateToReader } from "~/common/masks/dates";
import Icon from "~/components/etc/ui/Icon";
import TablePagination from "~/components/etc/ui/TablePagination";
import { Guest, LeadsTableHeaders } from "~/models/leads.model";

export default component$(() => {
  const { data, loading, error, pagination } =
    usePaginatedFetch<Guest>("/guests/leads");

  const { loading: loadingDownload, download } = useDownload(
    "/guests/leads/download",
  );

  return (
    <>
      <div class="mx-6 mb-4 flex items-center justify-between">
        <div class="flex flex-col gap-1 p-3 text-left">
          <small class="text-xs text-gray-500 dark:text-gray-400">
            Here you can see people registered through Paz del Mar and Oceano
            guests WIFI
          </small>
        </div>
        <Button
          color="alternative"
          class="cursor-pointer rounded-2xl bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-700 dark:text-gray-100 dark:hover:bg-green-800 hover:dark:text-white"
          loading={loadingDownload.value}
          disabled={loadingDownload.value}
          onClick$={download}
        >
          <div class="flex items-center gap-2">
            <Icon icon="vertical_align_bottom" /> Export
          </div>
        </Button>
      </div>
      <div
        class={[
          "max-h-9/12 overflow-y-auto rounded-2xl",
          loading ? "flex h-9/12" : "",
        ]}
      >
        {loading ? (
          <div class="flex flex-grow items-center justify-center">
            <Spinner size="9" />
          </div>
        ) : error ? (
          <div class="flex flex-grow items-center justify-center">
            <p class="text-red-500">Error loading leads: {error}</p>
          </div>
        ) : (
          <Table>
            <Table.Head>
              {LeadsTableHeaders.map((header) => (
                <Table.HeadCell key={header.key}>{header.label}</Table.HeadCell>
              ))}
              {/* <Table.HeadCell>
                <span class="sr-only">Edit</span>
              </Table.HeadCell> */}
            </Table.Head>
            <Table.Body class="divide-y">
              {data.map((lead) => (
                <Table.Row
                  key={lead.id}
                  class="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell class="font-medium whitespace-nowrap text-gray-900 dark:text-white">
                    {lead.id}
                  </Table.Cell>
                  <Table.Cell class="font-medium whitespace-nowrap text-gray-900 dark:text-white">
                    {lead.fname}
                  </Table.Cell>
                  <Table.Cell>{lead.lname}</Table.Cell>
                  <Table.Cell>{lead.email}</Table.Cell>
                  <Table.Cell>{lead.macAddress}</Table.Cell>
                  <Table.Cell>{dateToReader(lead.createdAt)}</Table.Cell>
                  <Table.Cell>{dateToReader(lead.updatedAt)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
      <TablePagination
        class="mt-5"
        pageSizeOptions={["25", "50", "100", "200"]}
        {...pagination}
      />
    </>
  );
});
