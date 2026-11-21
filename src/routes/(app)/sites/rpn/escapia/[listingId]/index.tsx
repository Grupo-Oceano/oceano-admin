import { component$ } from "@qwik.dev/core";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  zod$,
  type DocumentHead,
} from "@qwik.dev/router";
import EscapiaStatus from "~/components/modules/rpn/EscapiaStatus";
import {
  Alert,
  Badge,
  Button,
  card,
  Description,
  Field,
  heading,
  Input,
  Label,
} from "~/components/ui";
import { rpnLoaderOptions, rpnWrite } from "~/features/rpn/actions.server";
import {
  isUuid,
  linkEscapiaInput,
  listingIdInput,
  type EscapiaFieldValue,
  type EscapiaKeyingDetail,
  type EscapiaQueueItem,
} from "~/features/rpn/contract";
import {
  ESCAPIA_SECTIONS,
  humanizeKey,
  labelOf,
  LISTING_STATES,
} from "~/features/rpn/labels";
import { siteRoleOf } from "~/lib/auth/guard.server";
import { rpnCall } from "~/lib/backends/rpn.server";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { useActionToast } from "~/lib/crud/use-action-toast";
import { formatDateTime } from "~/lib/utils/format";

/** One property to key: the submitted intake in Escapia's field order, plus claim and link. */
export const useKeying = routeLoader$(async (ev) => {
  const id = ev.params.listingId;
  if (!isUuid(id)) return { item: null, error: "This property doesn't exist." };
  if (!siteRoleOf(ev, "rpn")) return { item: null, error: null };
  const { data, error } = loaderResult(
    ev,
    await rpnCall(ev, (api) =>
      api.get<EscapiaKeyingDetail>(`/admin/escapia-queue/${id}`),
    ),
    rpnLoaderOptions,
  );
  return { item: data, error };
});

export const useClaimOne = routeAction$(
  ({ listingId }, ev) =>
    rpnWrite(
      ev,
      (api) =>
        api.post<EscapiaQueueItem>(`/admin/properties/${listingId}/claim`),
      "You claimed this property.",
    ),
  zod$(listingIdInput),
);

export const useUnclaimOne = routeAction$(
  ({ listingId }, ev) =>
    rpnWrite(
      ev,
      (api) =>
        api.post<EscapiaQueueItem>(`/admin/properties/${listingId}/unclaim`),
      "Unclaimed.",
    ),
  zod$(listingIdInput),
);

/** 202: RPN stored the id and verifies it with Escapia in the background (verify-escapia-unit). */
export const useLink = routeAction$(
  ({ listingId, escapiaUnitId }, ev) =>
    rpnWrite(
      ev,
      (api) =>
        api.post<EscapiaQueueItem>(
          `/admin/properties/${listingId}/link-escapia`,
          { escapiaUnitId },
        ),
      `Unit ${escapiaUnitId} saved. RockyPoint.net is checking it with Escapia; reload in a moment to see the result.`,
    ),
  zod$(linkEscapiaInput),
);

const show = (value: EscapiaFieldValue): string =>
  value === null || value === ""
    ? "—"
    : Array.isArray(value)
      ? value.join(", ") || "—"
      : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value);

export default component$(() => {
  const page = useKeying();
  const claim = useClaimOne();
  const unclaim = useUnclaimOne();
  const link = useLink();
  useActionToast(claim);
  useActionToast(unclaim);
  useActionToast(link);
  const { item, error } = page.value;
  const back = (
    <Link
      href="/sites/rpn/escapia/"
      class="inline-flex items-center gap-1 px-1 text-sm font-medium text-gray-600 hover:text-sky-700 dark:text-gray-300 dark:hover:text-sky-300"
    >
      <span class="material-symbols-rounded text-base" aria-hidden="true">
        chevron_left
      </span>
      Back to Escapia keying
    </Link>
  );
  if (!item) {
    return (
      <div class="flex flex-col gap-4">
        {back}
        {error && (
          <Alert tone="danger" icon="error" role="alert" testId="keying-error">
            {error}
          </Alert>
        )}
      </div>
    );
  }

  const claimAction = item.assignee ? unclaim : claim;
  const unitError = link.value?.fieldErrors?.escapiaUnitId;
  return (
    <div class="flex flex-col gap-6">
      {back}
      <header class="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <h2 class={heading({ level: "page", class: "break-words" })}>
            {item.name}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {item.partner.companyName}
          </p>
          {item.approvedAt && (
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Approved {formatDateTime(item.approvedAt)}
            </p>
          )}
        </div>
        <EscapiaStatus item={item} />
      </header>

      {item.linkFailure && (
        <Alert
          tone="danger"
          icon="link_off"
          title="The last unit id wasn't found in Escapia"
          role="alert"
        >
          {item.linkFailure.escapiaUnitId} was checked on{" "}
          {formatDateTime(item.linkFailure.failedAt)} and doesn't exist in
          Escapia. Check the id in Escapia and paste it again.
        </Alert>
      )}

      <section
        class={card({
          class:
            "flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between",
        })}
      >
        <Form action={claimAction}>
          <input type="hidden" name="listingId" value={item.listingId} />
          <Button
            type="submit"
            intent="secondary"
            icon={item.assignee ? "person_remove" : "front_hand"}
            loading={claimAction.isRunning}
            testId="keying-claim"
          >
            {item.assignee
              ? `Unclaim (${item.assignee.name || item.assignee.email})`
              : "Claim"}
          </Button>
        </Form>
        <Form
          action={link}
          class="flex flex-col gap-2 sm:flex-row sm:items-end"
          data-testid="link-form"
        >
          <input type="hidden" name="listingId" value={item.listingId} />
          <Field invalid={!!unitError} class="sm:w-72">
            <Label required>Escapia unit id</Label>
            <Input
              name="escapiaUnitId"
              required
              maxLength={64}
              pattern="[A-Za-z0-9_\-]{1,64}"
              autocomplete="off"
              value={item.escapiaUnitId ?? ""}
              testId="unit-id"
            />
            <Description>
              {unitError ??
                "Exactly as Escapia shows it, after you keyed the unit."}
            </Description>
          </Field>
          <Button
            type="submit"
            icon="link"
            loading={link.isRunning}
            class="sm:mb-6"
            testId="link-submit"
          >
            Link unit
          </Button>
        </Form>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class={heading({ level: "section", class: "px-1" })}>
          What to key{" "}
          {item.intake && (
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              (submitted {formatDateTime(item.intake.submittedAt)})
            </span>
          )}
        </h3>
        {!item.intake ? (
          <Alert tone="muted" icon="info">
            This listing has no submitted intake (legacy data). Use the listing
            itself.
          </Alert>
        ) : (
          <div class="grid gap-4 lg:grid-cols-2">
            {item.intake.sections.map((section) => (
              <section
                key={section.id}
                class={card({ class: "p-5" })}
                data-testid={`section-${section.id}`}
              >
                <h4 class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  {labelOf(ESCAPIA_SECTIONS, section.id)}
                </h4>
                <dl class="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
                  {section.fields.map((field) => (
                    <div key={field.key} class="contents">
                      <dt class="text-sm text-gray-500 dark:text-gray-400">
                        {humanizeKey(field.key)}
                      </dt>
                      <dd class="text-sm break-words whitespace-pre-line text-gray-900 select-all dark:text-gray-100">
                        {show(field.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </section>
      <p class="flex items-center gap-2 px-1 text-xs text-gray-500 dark:text-gray-400">
        Listing state{" "}
        <Badge>{labelOf(LISTING_STATES, item.listingState)}</Badge>
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Key into Escapia - RockyPoint.net - Oceano Admin",
};
