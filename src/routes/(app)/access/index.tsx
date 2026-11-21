import { component$, useContext, useContextProvider, useStore, useTask$ } from "@qwik.dev/core";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  zod$,
  type DocumentHead,
  type RequestEventAction,
} from "@qwik.dev/router";
import { StaffPageCtx, type StaffPageState } from "~/components/modules/access/context";
import { STATUS_TONE, staffColumns } from "~/components/modules/access/staff.columns";
import {
  Alert,
  Badge,
  Button,
  CloseButton,
  DataTable,
  Description,
  Dialog,
  dialog,
  Field,
  Input,
  Label,
  Select,
  button,
  divider,
} from "~/components/ui";
import { accessErrorMessage } from "~/features/access/errors";
import {
  createStaffInput,
  putGrantInput,
  revokeGrantInput,
  setOwnerInput,
  setStatusInput,
  sortStaff,
  staffQuery,
  STAFF_STATUSES,
  type Site,
  type StaffMember,
} from "~/features/access/schema";
import { isOwner, sessionOf } from "~/lib/auth/guard.server";
import { coreApi } from "~/lib/backends/core.server";
import type { ApiResponse, Result } from "~/lib/backends/types";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { searchKeys, searchObject } from "~/lib/crud/search-keys";
import { useActionToast } from "~/lib/crud/use-action-toast";

/** Staff (pending first, so new sign-ins are visible) and the sites with their roles. Owners only. */
export const useStaff = routeLoader$(
  async (ev) => {
    const query = staffQuery.parse(searchObject(ev.url.searchParams));
    if (!isOwner(ev)) return { query, rows: [], sites: [], error: null, selfId: null };
    const core = coreApi(ev);
    const [staff, sites] = await Promise.all([
      core.get<ApiResponse<StaffMember[]>>("/admin/staff", { status: query.status }),
      core.get<ApiResponse<Site[]>>("/admin/sites"),
    ]);
    const list = loaderResult(ev, staff, { message: accessErrorMessage });
    const siteList = loaderResult(ev, sites, { message: accessErrorMessage });
    return {
      query,
      rows: sortStaff(list.data?.data ?? []),
      sites: (siteList.data?.data ?? []).filter((s) => s.active),
      error: list.error ?? siteList.error,
      selfId: sessionOf(ev)?.staff.id ?? null,
    };
  },
  { search: searchKeys(staffQuery) },
);

type Ev = RequestEventAction;

/** Every access action: owner check → oceano-core → `{ message }` or `ev.fail(status, { message })`. */
async function ownerWrite<T>(ev: Ev, call: () => Promise<Result<T>>, done: string) {
  if (!isOwner(ev)) return ev.fail(403, { message: accessErrorMessage({ status: 403, message: "owner_only" }) });
  const [error] = await call();
  return error ? ev.fail(error.status, { message: accessErrorMessage(error) }) : { message: done };
}

export const useCreateStaff = routeAction$(
  (body, ev) =>
    ownerWrite(
      ev,
      () => coreApi(ev).post<ApiResponse<StaffMember>>("/admin/staff", body),
      `${body.email} can now sign in. Give them a site.`,
    ),
  zod$(createStaffInput),
);

export const useSetStatus = routeAction$(
  ({ id, status }, ev) =>
    ownerWrite(
      ev,
      () => coreApi(ev).patch<ApiResponse<StaffMember>>(`/admin/staff/${id}`, { status }),
      status === "active" ? "Account activated." : "Account disabled.",
    ),
  zod$(setStatusInput),
);

export const useSetOwner = routeAction$(
  ({ id, isOwner: owner }, ev) =>
    ownerWrite(
      ev,
      () => coreApi(ev).patch<ApiResponse<StaffMember>>(`/admin/staff/${id}`, { isOwner: owner }),
      owner ? "Promoted to owner." : "Owner role removed.",
    ),
  zod$(setOwnerInput),
);

export const usePutGrant = routeAction$(
  ({ id, site, role }, ev) =>
    ownerWrite(
      ev,
      () => coreApi(ev).put(`/admin/staff/${id}/grants/${site}`, { role }),
      `Role on ${site} set to ${role}.`,
    ),
  zod$(putGrantInput),
);

export const useRevokeGrant = routeAction$(
  ({ id, site }, ev) =>
    ownerWrite(
      ev,
      () => coreApi(ev).delete(`/admin/staff/${id}/grants/${site}`),
      `Access to ${site} revoked.`,
    ),
  zod$(revokeGrantInput),
);

const FILTERS = [["", "All"], ...STAFF_STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1)])] as const;

/** Add a person before their first sign-in (core pre-enables them: active, no Microsoft account bound yet). */
const AddStaffDialog = component$(() => {
  const page = useContext(StaffPageCtx);
  const create = useCreateStaff();
  // Each `useXxx()` call is its own action store: toast the one the form submits.
  useActionToast(create);
  const errors = create.value?.fieldErrors;
  useTask$(({ track }) => {
    const value = track(() => create.value);
    if (value && !value.failed) page.adding = false;
  });
  return (
    <Dialog
      open={page.adding}
      closable
      title="Add staff"
      size="sm"
      onClose$={() => (page.adding = false)}
      testId="add-staff"
    >
      <Form action={create} class="flex flex-col gap-4" key={page.addKey}>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          They can sign in with this Microsoft account right away. Then give them a role on a site.
        </p>
        <Field invalid={!!errors?.email}>
          <Label required>Work email</Label>
          <Input name="email" type="email" autocomplete="off" placeholder="ana@gooceano.com" required testId="add-email" />
          {errors?.email && <Description>{errors.email}</Description>}
        </Field>
        <Field invalid={!!errors?.name}>
          <Label required>Name</Label>
          <Input name="name" autocomplete="off" required maxLength={200} testId="add-name" />
          {errors?.name && <Description>{errors.name}</Description>}
        </Field>
        {create.value?.failed && create.value.message && (
          <Alert tone="danger" icon="error" role="alert">
            {create.value.message}
          </Alert>
        )}
        <footer class={dialog().footer()}>
          <CloseButton class={button({ intent: "secondary" })}>Cancel</CloseButton>
          <Button type="submit" icon="person_add" loading={create.isRunning} testId="add-submit">
            Add
          </Button>
        </footer>
      </Form>
    </Dialog>
  );
});

/** Status, owner flag and site roles of one person. Every button is its own form (works without JS). */
const ManageDialog = component$<{ person: StaffMember | null; sites: Site[]; isSelf: boolean }>(
  ({ person, sites, isSelf }) => {
    const page = useContext(StaffPageCtx);
    const setStatus = useSetStatus();
    const setOwner = useSetOwner();
    const putGrant = usePutGrant();
    const revokeGrant = useRevokeGrant();
    useActionToast(setStatus);
    useActionToast(setOwner);
    useActionToast(putGrant);
    useActionToast(revokeGrant);
    return (
      <Dialog
        open={!!person}
        closable
        title={person ? person.name || person.email : "Manage"}
        size="md"
        onClose$={() => (page.manageId = null)}
        testId="manage-staff"
      >
        {person && (
          <div class="flex flex-col gap-5" key={person.id}>
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="text-gray-500 dark:text-gray-400">{person.email}</span>
              <Badge tone={STATUS_TONE[person.status]}>{person.status}</Badge>
              {person.isOwner && <Badge tone="info">Owner</Badge>}
              {isSelf && <Badge>You</Badge>}
            </div>

            <section class="flex flex-col gap-2">
              <h3 class="font-semibold text-gray-900 dark:text-white">Account</h3>
              <div class="flex flex-wrap gap-2">
                <Form action={setStatus}>
                  <input type="hidden" name="id" value={person.id} />
                  {person.status === "active" ? (
                    <>
                      <input type="hidden" name="status" value="disabled" />
                      <Button type="submit" intent="danger" size="sm" icon="block" loading={setStatus.isRunning} disabled={isSelf} testId="disable">
                        Disable
                      </Button>
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="status" value="active" />
                      <Button type="submit" intent="success" size="sm" icon="check" loading={setStatus.isRunning} testId="activate">
                        Activate
                      </Button>
                    </>
                  )}
                </Form>
                <Form action={setOwner}>
                  <input type="hidden" name="id" value={person.id} />
                  <input type="hidden" name="isOwner" value={person.isOwner ? "false" : "true"} />
                  <Button type="submit" intent="secondary" size="sm" icon={person.isOwner ? "remove_moderator" : "shield_person"} loading={setOwner.isRunning} disabled={isSelf && person.isOwner} testId="toggle-owner">
                    {person.isOwner ? "Remove owner role" : "Make owner"}
                  </Button>
                </Form>
              </div>
              {person.status === "pending" && (
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Signed in and waiting. Activate them and give them a site role below.
                </p>
              )}
            </section>

            <hr class={divider()} />

            <section class="flex flex-col gap-3">
              <h3 class="font-semibold text-gray-900 dark:text-white">Sites</h3>
              {person.isOwner && (
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Owners can open every site with its highest role; grants below apply if the owner role is removed.
                </p>
              )}
              {sites.length === 0 && <p class="text-sm text-gray-500 dark:text-gray-400">No active sites.</p>}
              {sites.map((site) => {
                const grant = person.grants.find((g) => g.site === site.key);
                return (
                  <div key={site.key} class="flex flex-col gap-2 sm:flex-row sm:items-end" data-testid={`grant-${site.key}`}>
                    <Form action={putGrant} class="flex flex-1 items-end gap-2">
                      <input type="hidden" name="id" value={person.id} />
                      <input type="hidden" name="site" value={site.key} />
                      <Field class="flex-1">
                        <Label>{site.name}</Label>
                        <Select name="role" required>
                          <option value="" disabled selected={!grant}>
                            No access
                          </option>
                          {site.roles.map((role) => (
                            <option key={role} value={role} selected={grant?.role === role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Button type="submit" size="sm" icon="save" loading={putGrant.isRunning} class="mb-0.5">
                        {grant ? "Change" : "Grant"}
                      </Button>
                    </Form>
                    {grant && (
                      <Form action={revokeGrant}>
                        <input type="hidden" name="id" value={person.id} />
                        <input type="hidden" name="site" value={site.key} />
                        <Button type="submit" size="sm" intent="ghost" icon="remove_circle" loading={revokeGrant.isRunning} class="mb-0.5">
                          Revoke
                        </Button>
                      </Form>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        )}
      </Dialog>
    );
  },
);

export default component$(() => {
  const staff = useStaff();
  const page = useStore<StaffPageState>({ manageId: null, adding: false, addKey: 0 });
  useContextProvider(StaffPageCtx, page);
  const { query, rows, sites, error, selfId } = staff.value;
  const pending = rows.filter((r) => r.status === "pending").length;
  const person = rows.find((r) => r.id === page.manageId) ?? null;

  return (
    <div class="flex flex-col gap-4">
      {pending > 0 && query.status !== "pending" && (
        <Alert tone="warning" icon="person_alert" testId="pending-banner">
          {pending === 1 ? "1 person signed in and is" : `${pending} people signed in and are`} waiting for access.{" "}
          <Link href="?status=pending" class="font-semibold underline">
            Show pending
          </Link>
        </Alert>
      )}
      <DataTable
        columns={staffColumns}
        rows={rows}
        error={error}
        rowKey="id"
        emptyText={query.status ? `Nobody is ${query.status}.` : "No staff yet."}
        testId="staff"
      >
        <div q:slot="toolbar" class="flex flex-col gap-3 border-b border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <nav aria-label="Filter by status" class="flex flex-wrap gap-2">
            {FILTERS.map(([value, label]) => (
              <Link
                key={value || "all"}
                href={value ? `?status=${value}` : "?"}
                aria-current={query.status === value ? "page" : undefined}
                class={button({
                  intent: query.status === value ? "primary" : "secondary",
                  size: "sm",
                })}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Button
            icon="person_add"
            size="sm"
            onClick$={() => {
              page.addKey++;
              page.adding = true;
            }}
            testId="add-staff-open"
          >
            Add staff
          </Button>
        </div>
      </DataTable>
      <AddStaffDialog />
      <ManageDialog person={person} sites={sites} isSelf={!!person && person.id === selfId} />
    </div>
  );
});

export const head: DocumentHead = { title: "Access - Oceano Admin" };
