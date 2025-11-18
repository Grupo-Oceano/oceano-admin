import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { InitialValues, useForm } from "@modular-forms/qwik";
import ActionButton from "~/components/etc/forms/ActionButton";
import Expandable from "~/components/etc/forms/Expandable";
import FormFooter from "~/components/etc/forms/FormFooter";
import InputError from "~/components/etc/forms/InputError";
import InputLabel from "~/components/etc/forms/InputLabel";
import Response from "~/components/etc/forms/Response";
import Spinner from "~/components/etc/forms/Spinner";
import TextInput from "~/components/etc/forms/TextInput";
import UnstyledButton from "~/components/etc/forms/UnstyledButton";
import Navlink from "~/components/etc/system/Navlink";
import Sidebar from "~/components/etc/system/Sidebar";
import SidebarAvatar from "~/components/etc/system/SidebarAvatar";
import ThemeToggle from "~/components/etc/system/ThemeToggle";
import Uppernav from "~/components/etc/system/Uppernav";
import Button from "~/components/etc/ui/Button";
import Dropdown from "~/components/etc/ui/Dropdown";
import Error from "~/components/etc/ui/Error";
import Icon from "~/components/etc/ui/Icon";
import Image from "~/components/etc/ui/Image";
import Paginator from "~/components/etc/ui/Paginator";
import Select from "~/components/etc/ui/Select";
import Skeleton from "~/components/etc/ui/Skeleton";
import TableBase, {
  TableBaseConfig,
  TableColumn,
} from "~/components/etc/ui/TableBase";
import TableFlowbite from "~/components/etc/ui/TableFlowbite";
import TablePagination from "~/components/etc/ui/TablePagination";

export const useFormLoader = routeLoader$<InitialValues<{ testInput: string }>>(
  () => ({ testInput: "" }),
);

export default component$(() => {
  const inputValue = useSignal("");
  const selectValue = useSignal("");
  const expandedState = useSignal(false);

  const [testForm, { Form, Field }] = useForm<{
    testInput: string;
  }>({
    loader: useFormLoader(),
  });

  const columns: TableColumn<{
    name: string;
    email: string;
    role: string;
  }>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
  ];

  const config: TableBaseConfig<{
    name: string;
    email: string;
    role: string;
  }> = {
    columns,
    loadingRows: 3,
  };

  const pagination = {
    total: 10,
    currentPage: 1,
    pageSize: 10,
    onPageChange: $((page: number) => console.log("Page changed to:", page)),
    onPageSizeChange: $((size: number) =>
      console.log("Page size changed to:", size),
    ),
  };

  const log = (number: string) => $(() => console.log(number));

  return (
    <div class="flex flex-col gap-8 p-8">
      <h1 class="text-3xl font-bold">UI Components Showcase</h1>

      {/* Buttons Section */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">Buttons</h2>
        <div class="mb-4 flex flex-wrap items-center gap-4">
          <Button style="primary">Primary Button</Button>
          <Button style="secondary">Secondary Button</Button>
          <Button style="hollow">Hollow Button</Button>
          <Button style="tertiary">Tertiary Button</Button>
        </div>
        <div class="mb-4 flex flex-wrap items-center gap-4">
          <ActionButton>Action Button</ActionButton>
          <UnstyledButton type="button">Unstyled Button</UnstyledButton>
        </div>
      </section>

      {/* Icons Section */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">Icons</h2>
        <div class="flex flex-wrap items-center gap-4">
          <Icon icon="home" class="text-3xl text-blue-600" />
          <Icon icon="check_circle" class="text-3xl text-green-600" />
          <Icon icon="error" class="text-3xl text-red-600" />
          <Icon icon="settings" class="text-3xl text-gray-600" />
          <Icon icon="star" class="text-3xl text-yellow-600" />
        </div>
      </section>

      {/* Forms Section */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">Form Components</h2>
        <div class="max-w-md space-y-4">
          <div>
            <InputLabel name="test-input" label="Sample Input"></InputLabel>
            <Form id="test-form" onSubmit$={async () => {}}>
              <Field name="testInput">
                {(field, props) => (
                  <TextInput
                    {...props}
                    value={field.value}
                    error={field.error}
                    type="text"
                    label="Some text"
                    placeholder="Enter some text..."
                    required
                    labelClass="text-gray-800 dark:text-white lg:text-gray-500 lg:dark:text-gray-200"
                  />
                )}
              </Field>

              <FormFooter of={testForm}>
                <Button style="primary">Save</Button>
                <Button style="secondary">Cancel</Button>
              </FormFooter>

              <div>
                <h3 class="mb-2 text-lg font-medium">Response Component</h3>
                <Response of={testForm} />
              </div>
            </Form>
            <InputError
              name={"dummy"}
              error={"Sample error message for the input field."}
              class="mt-1 text-sm text-red-600"
            ></InputError>
          </div>

          <div>
            <InputLabel name="test-select">Sample Select</InputLabel>
            <Select
              placeholder="Choose a page size"
              options={[
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ]}
            />
          </div>

          <Expandable expanded={expandedState.value}>
            <p>This content is inside an expandable component.</p>
          </Expandable>
        </div>
      </section>

      {/* UI Components Section */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">UI Components</h2>
        <div class="space-y-4">
          <div>
            <h3 class="mb-2 text-lg font-medium">Dropdown</h3>
            <Dropdown
              items={[
                {
                  label: "Item 1",
                  onClick: log("Item 1"),
                },
                {
                  label: "Item 2",
                  onClick: log("Item 2"),
                },
                {
                  label: "Item 3",
                  onClick: log("Item 3"),
                },
              ]}
            />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Error Component</h3>
            <Error error="This is an error message example" />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Error Component</h3>
            <Error error="This is an error message example" />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Image Component</h3>
            <Image
              src="https://via.placeholder.com/200x150"
              alt="Sample image"
              class="rounded-lg"
            />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Skeleton Loading</h3>
            <div class="space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
              <Skeleton class="h-4 w-5/6" />
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Spinner</h3>
            <Spinner />
          </div>
        </div>
      </section>

      {/* System Components Section */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">System Components</h2>
        <div class="space-y-4">
          <div>
            <h3 class="mb-2 text-lg font-medium">Theme Toggle</h3>
            <ThemeToggle />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Navigation Links</h3>
            <div class="flex gap-4">
              <Navlink href="/dashboard">Dashboard</Navlink>
              <Navlink href="/users">Users</Navlink>
              <Navlink href="/settings">Settings</Navlink>
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Sidebar Avatar</h3>
            <SidebarAvatar />
          </div>
        </div>
      </section>

      {/* Table Components Section */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">Table Components</h2>
        <div class="space-y-6">
          <div>
            <h3 class="mb-2 text-lg font-medium">Basic Table</h3>
            <TableBase
              config={config}
              data={[
                { name: "John Doe", email: "john@example.com", role: "Admin" },
                { name: "Jane Smith", email: "jane@example.com", role: "User" },
                {
                  name: "Bob Johnson",
                  email: "bob@example.com",
                  role: "Editor",
                },
              ]}
            />
            <TableBase config={config} data={null} loading={true} />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Flowbite Table</h3>

            <TableFlowbite
              columns={columns}
              data={[
                {
                  name: "Product A",
                  email: "$19.99",
                  role: "50",
                },
                {
                  name: "Product B",
                  email: "$29.99",
                  role: "25",
                },
                {
                  name: "Product C",
                  email: "$39.99",
                  role: "10",
                },
              ]}
            />

            <TableFlowbite
              columns={columns}
              data={null}
              loading={true}
              loadingRows={5}
            />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Table Pagination</h3>
            <TablePagination
              class="mt-5"
              pageSizeOptions={["25", "50", "100", "200"]}
              {...pagination}
            />
          </div>

          <div>
            <h3 class="mb-2 text-lg font-medium">Paginator</h3>
            <Paginator
              selectedPage={pagination.currentPage}
              totalPages={pagination.total}
              onPageChange={pagination.onPageChange}
            />
          </div>
        </div>
      </section>

      {/* Layout Components Preview */}
      <section>
        <h2 class="mb-4 text-2xl font-semibold">Layout Components Preview</h2>
        <div class="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Upper Navigation (reduced size for demo):
          </p>
          <div class="origin-top-left scale-75 transform">
            <Uppernav />
          </div>
        </div>

        <div class="mt-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Sidebar (reduced size for demo):
          </p>
          <div class="max-w-xs origin-top-left scale-75 transform">
            <Sidebar />
          </div>
        </div>
      </section>
    </div>
  );
});
