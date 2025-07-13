import { component$ } from "@builder.io/qwik";
import { Button, Table } from "flowbite-qwik";
import { usePaginatedFetch } from "~/common/hooks/usePaginatedFetch";
import Icon from "~/components/ui/Icon";
import { Lead, LeadsTableHeaders } from "~/models/leads";

export default component$(() => {
  const { data, loading, error, pagination } = usePaginatedFetch<Lead>(
    "/captive-portal/leads",
  );

  return (
    <>
      <div class="mx-6 mb-4 flex items-center justify-between">
        <div class="flex gap-3 p-3 text-center"></div>
        <Button color="alternative" class="rounded-2xl">
          <div class="flex items-center gap-2">
            <Icon icon="vertical_align_bottom" /> Export
          </div>
        </Button>
      </div>

      {data.map((lead) => (
        <div key={lead.id} class="mb-4">
          <p class="text-lg font-semibold">{`${lead.fname} ${lead.lname}`}</p>
          <p class="text-sm text-gray-500">{lead.email}</p>
        </div>
      ))}
      <div class="overflow-x-auto rounded-2xl">
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
      </div>
      {/* <TablePagination /> */}
    </>
  );
});
