import { component$ } from "@qwik.dev/core";
import { Badge } from "~/components/ui";
import type { EscapiaQueueItem } from "~/features/rpn/contract";
import { formatDateTime } from "~/lib/utils/format";

/** Where a keying item stands: verifying a pasted unit id, a failed link, claimed, or waiting. */
export default component$<{ item: EscapiaQueueItem }>(({ item }) => (
  <span class="flex flex-col items-start gap-1">
    {item.linkFailure && (
      <Badge
        tone="danger"
        icon="link_off"
        testId={`link-failure-${item.listingId}`}
      >
        {item.linkFailure.escapiaUnitId} not found in Escapia (
        {formatDateTime(item.linkFailure.failedAt)})
      </Badge>
    )}
    {item.escapiaUnitId ? (
      <Badge tone="info" icon="hourglass_top">
        Verifying {item.escapiaUnitId}
      </Badge>
    ) : item.assignee ? (
      <Badge tone="warning" icon="person">
        {item.assignee.name || item.assignee.email}
      </Badge>
    ) : (
      <Badge>Unclaimed</Badge>
    )}
  </span>
));
