import { component$ } from "@qwik.dev/core";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  zod$,
  type DocumentHead,
} from "@qwik.dev/router";
import RequestSnapshot from "~/components/modules/rpn/RequestSnapshot";
import {
  Alert,
  Badge,
  Button,
  card,
  Description,
  Field,
  heading,
  Label,
  Select,
} from "~/components/ui";
import { rpnLoaderOptions, rpnWrite } from "~/features/rpn/actions.server";
import {
  approveRequestInput,
  isUuid,
  PROPERTY_STRATEGIES,
  rejectRequestInput,
  type StatusRequestDetail,
} from "~/features/rpn/contract";
import {
  labelOf,
  LISTING_STATES,
  PARTNER_STATES,
  REQUEST_STATUS,
  requestTone,
  STRATEGIES,
  SUBJECT_KICKER,
} from "~/features/rpn/labels";
import { requestedStrategyOf } from "~/features/rpn/snapshot";
import { siteRoleOf } from "~/lib/auth/guard.server";
import { rpnCall } from "~/lib/backends/rpn.server";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { useActionToast } from "~/lib/crud/use-action-toast";
import { formatDateTime } from "~/lib/utils/format";

/** One status request: snapshot, derived partner/listing states, and (while open) the decision forms. */
export const useStatusRequest = routeLoader$(async (ev) => {
  const id = ev.params.id;
  if (!isUuid(id))
    return { request: null, error: "This request doesn't exist." };
  if (!siteRoleOf(ev, "rpn")) return { request: null, error: null };
  const { data, error } = loaderResult(
    ev,
    await rpnCall(ev, (api) =>
      api.get<StatusRequestDetail>(`/admin/status-requests/${id}`),
    ),
    rpnLoaderOptions,
  );
  return { request: data, error };
});

export const useApprove = routeAction$(
  ({ id, reviewNotes, strategy }, ev) =>
    rpnWrite(
      ev,
      (api) =>
        api.post<StatusRequestDetail>(`/admin/status-requests/${id}/approve`, {
          reviewNotes,
          strategy,
        }),
      "Approved. The partner will be notified by email.",
    ),
  zod$(approveRequestInput),
);

export const useReject = routeAction$(
  ({ id, reviewNotes }, ev) =>
    rpnWrite(
      ev,
      (api) =>
        api.post<StatusRequestDetail>(`/admin/status-requests/${id}/reject`, {
          reviewNotes,
        }),
      "Rejected. The partner will be notified with your notes.",
    ),
  zod$(rejectRequestInput),
);

const textarea =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-sky-500 aria-invalid:border-danger sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

const Decision = component$<{ request: StatusRequestDetail }>(({ request }) => {
  const approve = useApprove();
  const reject = useReject();
  useActionToast(approve);
  useActionToast(reject);
  const requested = requestedStrategyOf(request.snapshot);
  const rejectErrors = reject.value?.fieldErrors;
  const approveErrors = approve.value?.fieldErrors;
  return (
    <div class="grid gap-4 lg:grid-cols-2">
      <Form
        action={approve}
        class={card({ class: "flex flex-col gap-4 p-5" })}
        data-testid="approve-form"
      >
        <input type="hidden" name="id" value={request.id} />
        <h3 class={heading({ level: "section" })}>Approve</h3>
        {request.subject === "listing" && (
          <Field>
            <Label>Management</Label>
            <Select name="strategy">
              {PROPERTY_STRATEGIES.map((s) => (
                <option key={s} value={s} selected={requested === s}>
                  {STRATEGIES[s]}
                </option>
              ))}
            </Select>
            <Description>
              Defaults to what the partner asked for. Oceano-managed listings
              then wait for Escapia keying.
            </Description>
          </Field>
        )}
        <Field invalid={!!approveErrors?.reviewNotes}>
          <Label>Notes (optional)</Label>
          <textarea
            name="reviewNotes"
            rows={3}
            maxLength={2000}
            class={textarea}
          />
          <Description>
            {approveErrors?.reviewNotes ??
              "The partner sees these in the approval email."}
          </Description>
        </Field>
        <Button
          type="submit"
          intent="success"
          icon="check"
          loading={approve.isRunning}
          class="self-start"
          testId="approve"
        >
          Approve
        </Button>
      </Form>

      <Form
        action={reject}
        class={card({ class: "flex flex-col gap-4 p-5" })}
        data-testid="reject-form"
      >
        <input type="hidden" name="id" value={request.id} />
        <h3 class={heading({ level: "section" })}>Reject</h3>
        <Field invalid={!!rejectErrors?.reviewNotes}>
          <Label required>What needs to change</Label>
          <textarea
            name="reviewNotes"
            rows={5}
            required
            minLength={3}
            maxLength={2000}
            class={textarea}
          />
          <Description>
            {rejectErrors?.reviewNotes ??
              "At least 3 characters. The partner reads this to fix and resubmit."}
          </Description>
        </Field>
        <Button
          type="submit"
          intent="danger"
          icon="close"
          loading={reject.isRunning}
          class="self-start"
          testId="reject"
        >
          Reject
        </Button>
      </Form>
    </div>
  );
});

export default component$(() => {
  const page = useStatusRequest();
  const { request, error } = page.value;
  const back = (
    <Link
      href="/sites/rpn/"
      class="inline-flex items-center gap-1 px-1 text-sm font-medium text-gray-600 hover:text-sky-700 dark:text-gray-300 dark:hover:text-sky-300"
    >
      <span class="material-symbols-rounded text-base" aria-hidden="true">
        chevron_left
      </span>
      Back to the queue
    </Link>
  );

  if (!request) {
    return (
      <div class="flex flex-col gap-4">
        {back}
        {error && (
          <Alert tone="danger" icon="error" role="alert" testId="request-error">
            {error}
          </Alert>
        )}
      </div>
    );
  }

  const open =
    request.status === "pending" || request.status === "under_review";
  return (
    <div class="flex flex-col gap-6">
      {back}
      <header class="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-300">
            {SUBJECT_KICKER[request.subject]}
          </p>
          <h2 class={heading({ level: "page", class: "mt-1 break-words" })}>
            {request.listing?.name ?? request.partner.companyName}
          </h2>
          {request.listing && (
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {request.partner.companyName}
            </p>
          )}
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Sent for review on {formatDateTime(request.createdAt)}
          </p>
        </div>
        <Badge tone={requestTone(request.status)}>
          {labelOf(REQUEST_STATUS, request.status)}
        </Badge>
      </header>

      <section class={card({ class: "grid gap-4 p-5 sm:grid-cols-2" })}>
        <h3 class="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:col-span-2 dark:text-gray-400">
          Current state
        </h3>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Company</p>
          <p class="font-medium text-gray-900 dark:text-white">
            {labelOf(PARTNER_STATES, request.partnerState)}
          </p>
        </div>
        {request.listingState && (
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Listing</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {labelOf(LISTING_STATES, request.listingState)}
            </p>
          </div>
        )}
      </section>

      <section class="flex flex-col gap-3">
        <h3 class={heading({ level: "section", class: "px-1" })}>
          What the partner sent
        </h3>
        <RequestSnapshot
          subject={request.subject}
          snapshot={request.snapshot}
        />
      </section>

      <section class="flex flex-col gap-3">
        <h3 class={heading({ level: "section", class: "px-1" })}>Decision</h3>
        {open ? (
          <Decision request={request} />
        ) : (
          <div
            class={card({ class: "flex flex-col gap-3 p-5" })}
            data-testid="decided"
          >
            <p class="text-sm">This request has already been decided.</p>
            {request.reviewedAt && (
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {request.reviewer
                  ? `Decided by ${request.reviewer.name || request.reviewer.email} on ${formatDateTime(request.reviewedAt)}`
                  : `Decided on ${formatDateTime(request.reviewedAt)}`}
              </p>
            )}
            {request.reviewNotes && (
              <div>
                <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Notes to the partner
                </p>
                <p class="mt-1 text-sm whitespace-pre-line">
                  {request.reviewNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Review request - RockyPoint.net - Oceano Admin",
};
