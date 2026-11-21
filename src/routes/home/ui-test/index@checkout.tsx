import { component$, useSignal } from "@qwik.dev/core";
import {
  Form,
  routeAction$,
  z,
  zod$,
  type DocumentHead,
} from "@qwik.dev/router";
import NavLink from "~/components/shell/NavLink";
import ThemeToggle from "~/components/shell/ThemeToggle";
import {
  Alert,
  Avatar,
  Button,
  button,
  CloseButton,
  DataTable,
  Description,
  Dialog,
  dialog,
  ErrorState,
  Field,
  heading,
  Icon,
  Input,
  Label,
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSeparator,
  Paginator,
  Popover,
  PopoverButton,
  PopoverPanel,
  Select,
  Skeleton,
  Spinner,
  useToast,
  type Column,
} from "~/components/ui";

/** A sample native form: validated on the server by zod$, errors come back on the action. */
export const useSampleAction = routeAction$(
  (data) => ({ message: `Saved "${data.testInput}"` }),
  zod$({ testInput: z.string().trim().min(3, "Type at least 3 characters.") }),
);

type Person = { name: string; email: string; role: string };

const RoleCell = component$<{ row: Person }>(({ row }) => (
  <span class="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900 dark:text-sky-200">
    {row.role}
  </span>
));

const columns: Column<Person>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email", hideBelow: "sm" },
  { key: "role", header: "Role", cell: RoleCell },
];

const people: Person[] = [
  { name: "John Doe", email: "john@example.com", role: "Admin" },
  { name: "Jane Smith", email: "jane@example.com", role: "User" },
  { name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
];

/** Dev showcase of src/components/ui; check new primitives here at phone, tablet and desktop widths. */
export default component$(() => {
  const sample = useSampleAction();
  const dialogOpen = useSignal(false);
  const page = useSignal({ offset: 0, take: 10 });
  const { add } = useToast();
  const section = heading({ class: "mb-4 text-2xl" });

  return (
    <div class="flex flex-col gap-10 p-4 sm:p-8">
      <h1 class="text-3xl font-bold">UI Components Showcase</h1>

      <section>
        <h2 class={section}>Buttons</h2>
        <div class="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button intent="secondary">Secondary</Button>
          <Button intent="success" icon="vertical_align_bottom">
            Success
          </Button>
          <Button intent="danger">Danger</Button>
          <Button intent="ghost">Ghost</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="icon" intent="ghost" aria-label="Settings">
            <Icon icon="settings" class="text-xl" />
          </Button>
        </div>
      </section>

      <section>
        <h2 class={section}>Icons, avatar, spinner, skeleton</h2>
        <div class="flex flex-wrap items-center gap-4">
          <Icon icon="home" class="text-3xl text-blue-600 dark:text-blue-400" />
          <Icon icon="check_circle" class="text-success text-3xl" />
          <Icon icon="error" class="text-danger text-3xl" />
          <Icon
            icon="star"
            class="text-3xl text-yellow-600 dark:text-yellow-400"
          />
          <Avatar name="oceano admin" />
          <Avatar size="lg" name="Jane Smith" />
          <Spinner class="text-sky-600 dark:text-sky-400" />
          <Spinner size="lg" class="text-sky-600 dark:text-sky-400" />
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-4 w-5/6" />
        </div>
      </section>

      <section>
        <h2 class={section}>Form (routeAction$ + zod$)</h2>
        <Form action={sample} class="flex max-w-md flex-col gap-4">
          <Field invalid={!!sample.value?.fieldErrors?.testInput}>
            <Label required>Some text</Label>
            <Input
              name="testInput"
              icon="edit"
              placeholder="Enter some text..."
            />
            <Description>
              {sample.value?.fieldErrors?.testInput ??
                "Validated on the server; works without JavaScript."}
            </Description>
          </Field>
          <Field>
            <Label>Page size</Label>
            <Select name="size">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </Field>
          {sample.value && !sample.value.failed && (
            <Alert tone="success" icon="check_circle">
              {sample.value.message}
            </Alert>
          )}
          <div class="flex gap-2">
            <Button type="submit" loading={sample.isRunning}>
              Save
            </Button>
            <Button type="reset" intent="secondary">
              Reset
            </Button>
          </div>
        </Form>
      </section>

      <section>
        <h2 class={section}>Feedback</h2>
        <div class="flex flex-col gap-4">
          <Alert tone="info" icon="info" title="Heads up">
            An informational message.
          </Alert>
          <Alert tone="warning" icon="warning">
            A warning without a title.
          </Alert>
          <Alert
            tone="danger"
            icon="error"
            title="Something failed"
            role="alert"
          >
            An error message example.
          </Alert>
          <ErrorState error="This is an error message example" />
          <div class="flex flex-wrap gap-2">
            <Button
              intent="secondary"
              onClick$={() => add("Saved", "success", "The record was stored.")}
            >
              Success toast
            </Button>
            <Button
              intent="secondary"
              onClick$={() => add("Could not save", "error")}
            >
              Error toast
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 class={section}>Menu, popover, dialog</h2>
        <div class="flex flex-wrap items-start gap-4">
          <Menu>
            <MenuButton>
              Options
              <Icon icon="expand_more" />
            </MenuButton>
            <MenuItems anchor="bottom start">
              <MenuHeading>Actions</MenuHeading>
              <MenuItem onClick$={() => console.log("Item 1")}>Item 1</MenuItem>
              <MenuItem onClick$={() => console.log("Item 2")}>Item 2</MenuItem>
              <MenuSeparator />
              <MenuItem disabled>Disabled item</MenuItem>
            </MenuItems>
          </Menu>

          <Popover>
            <PopoverButton>Popover</PopoverButton>
            <PopoverPanel anchor="bottom start" class="w-64">
              <p class="mb-3 text-sm">
                Any content, light-dismissed by a tap outside.
              </p>
              <CloseButton class={button({ intent: "secondary", size: "sm" })}>
                Done
              </CloseButton>
            </PopoverPanel>
          </Popover>

          <Button intent="secondary" onClick$={() => (dialogOpen.value = true)}>
            Open dialog
          </Button>
          <Dialog
            open={dialogOpen.value}
            closable
            title="A dialog"
            onClose$={() => (dialogOpen.value = false)}
          >
            <p>
              Native &lt;dialog&gt; with focus trap, Esc and backdrop close.
            </p>
            <footer class={dialog().footer()}>
              <CloseButton class={button({ intent: "secondary" })}>
                Cancel
              </CloseButton>
              <Button onClick$={() => (dialogOpen.value = false)}>
                Accept
              </Button>
            </footer>
          </Dialog>
        </div>
      </section>

      <section>
        <h2 class={section}>System</h2>
        <div class="flex flex-wrap items-center gap-4">
          <ThemeToggle />
          <NavLink
            href="/home/dashboard"
            class="text-sky-600 dark:text-sky-400"
            activeClass="font-bold"
          >
            Dashboard
          </NavLink>
          <NavLink
            href="/home/ui-test"
            class="text-sky-600 dark:text-sky-400"
            activeClass="font-bold"
          >
            This page (active)
          </NavLink>
        </div>
      </section>

      <section>
        <h2 class={section}>Data table</h2>
        <div class="flex flex-col gap-6">
          <DataTable
            columns={columns}
            rows={people}
            rowKey="email"
            testId="people"
          >
            <Paginator
              q:slot="footer"
              total={42}
              offset={page.value.offset}
              take={page.value.take}
              onChange$={(next) => (page.value = next)}
            />
          </DataTable>
          <DataTable columns={columns} rows={null} loadingRows={3} />
          <DataTable columns={columns} rows={[]} emptyText="No people yet." />
          <DataTable
            columns={columns}
            rows={null}
            error="The backend did not answer."
          />
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = { title: "UI showcase" };
