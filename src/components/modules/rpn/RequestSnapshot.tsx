// why: custom workflow — the reviewer reads the partner's submission laid out like the RPN intake.
import { component$ } from "@qwik.dev/core";
import { Badge, card } from "~/components/ui";
import type { ReviewSubject } from "~/features/rpn/contract";
import { labelOf, STRATEGIES } from "~/features/rpn/labels";
import { describeSnapshot, formatPriceFrom } from "~/features/rpn/snapshot";

type Row = {
  label: string;
  value: string | number | null | undefined;
  chips?: string[];
};

const NONE = "Not provided";
const or = (v: string | number | null | undefined) =>
  v === undefined || v === null || v === "" ? NONE : v;
const yesNo = (v: boolean) => (v ? "Yes" : "No");

const Section = component$<{ title: string; rows: Row[] }>(
  ({ title, rows }) => (
    <section class={card({ class: "p-5" })}>
      <h3 class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {title}
      </h3>
      <dl class="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        {rows.map((row) => (
          <div key={row.label} class="contents">
            <dt class="text-sm text-gray-500 dark:text-gray-400">
              {row.label}
            </dt>
            <dd class="text-sm break-words whitespace-pre-line text-gray-900 dark:text-gray-100">
              {row.chips ? (
                row.chips.length ? (
                  <span class="flex flex-wrap gap-1.5">
                    {row.chips.map((chip) => (
                      <Badge key={chip}>{chip}</Badge>
                    ))}
                  </span>
                ) : (
                  NONE
                )
              ) : (
                or(row.value)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  ),
);

/** The submission as the partner sent it (immutable), or raw JSON when its format isn't known here. */
export default component$<{ subject: ReviewSubject; snapshot: unknown }>(
  ({ subject, snapshot }) => {
    const view = describeSnapshot(subject, snapshot);

    if (view.kind === "raw") {
      return (
        <div class="flex flex-col gap-3">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            This submission uses a format the console can't lay out, so it is
            shown as sent.
          </p>
          <pre class="bg-surface-2 overflow-x-auto rounded-lg border border-gray-200 p-4 text-xs leading-5 dark:border-gray-700">
            {view.json}
          </pre>
        </div>
      );
    }

    if (view.kind === "company") {
      const c = view.data;
      return (
        <Section
          title="Company profile"
          rows={[
            { label: "Company name", value: c.companyName },
            { label: "Legal name", value: c.legalName },
            { label: "Contact email", value: c.contactEmail },
            { label: "Contact phone", value: c.contactPhone },
            { label: "Website", value: c.website },
            { label: "RFC", value: c.taxId },
          ]}
        />
      );
    }

    const p = view.data;
    const r = p.houseRules;
    return (
      <div class="flex flex-col gap-4">
        <Section
          title="Basics"
          rows={[
            { label: "Name", value: p.name },
            {
              label: "Written in",
              value:
                p.contentLocale === "es"
                  ? "Spanish"
                  : p.contentLocale === "en"
                    ? "English"
                    : p.contentLocale,
            },
            { label: "Description", value: p.description },
          ]}
        />
        <Section
          title="Location"
          rows={[
            { label: "Street", value: p.address.street },
            { label: "Neighborhood", value: p.address.neighborhood },
            { label: "City", value: p.address.city },
            { label: "State", value: p.address.state },
            { label: "Postal code", value: p.address.postalCode },
            { label: "Coordinates", value: `${p.geo.lat}, ${p.geo.lng}` },
            { label: "Area id", value: p.areaId },
            { label: "Escapia location id", value: p.escapiaLocationId },
          ]}
        />
        <Section
          title="Capacity"
          rows={[
            { label: "Bedrooms", value: p.bedrooms },
            { label: "Bathrooms", value: p.bathrooms },
            { label: "Max guests", value: p.maxOccupancy },
            {
              label: "Beds",
              value: p.beds?.length
                ? p.beds
                    .map((b) => `${b.count} × ${b.type.replace("_", " ")}`)
                    .join(", ")
                : null,
            },
            { label: "Escapia unit type id", value: p.escapiaUnitTypeId },
          ]}
        />
        <Section
          title="Amenities"
          rows={[{ label: "Amenities", value: null, chips: p.amenityCodes }]}
        />
        <Section
          title="House rules"
          rows={[
            { label: "Check-in", value: r.checkInTime },
            { label: "Check-out", value: r.checkOutTime },
            { label: "Minimum nights", value: r.minNights },
            { label: "Pets allowed", value: yesNo(r.petsAllowed) },
            { label: "Smoking allowed", value: yesNo(r.smokingAllowed) },
            { label: "Events allowed", value: yesNo(r.eventsAllowed) },
            {
              label: "Quiet hours",
              value: r.quietHours
                ? `${r.quietHours.from} to ${r.quietHours.to}`
                : null,
            },
            { label: "Notes", value: r.notes },
          ]}
        />
        <Section
          title="Guest contact"
          rows={[
            { label: "Phone", value: p.contact.phone },
            { label: "WhatsApp", value: p.contact.whatsapp },
            { label: "Email", value: p.contact.email },
          ]}
        />
        <Section
          title="Management"
          rows={[
            {
              label: "Requested management",
              value: labelOf(STRATEGIES, p.requestedStrategy),
            },
            {
              label: "Price from, per night",
              value:
                p.priceFromCents == null
                  ? null
                  : formatPriceFrom(p.priceFromCents, p.priceCurrency ?? "USD"),
            },
            {
              label: "Photos",
              value: `${p.images.length} photo${p.images.length === 1 ? "" : "s"}`,
            },
            {
              label: "Ownership attested",
              value: p.ownershipAttested
                ? "The partner confirmed they own or manage this property."
                : "No",
            },
          ]}
        />
      </div>
    );
  },
);
