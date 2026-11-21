import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";
import { connectSocket, WSEvent, WSNamespace } from "~/lib/realtime/socket";
import type { MetricsInfo, ServicesStatus } from "~/models/infra.model";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface InfrastructureStore {
  services: ServicesStatus | null;
  metrics: MetricsInfo | null;
  /** When data was last received over the socket. */
  lastUpdate: Date | null;
  status: ConnectionStatus;
  reconnectAttempts: number;
}

export const InfrastructureContext = createContextId<InfrastructureStore>(
  "modules.infrastructure",
);

/** Opens the `oceano-infra` socket once for the infrastructure section and keeps the latest snapshot. */
export const InfrastructureContextProvider = component$(() => {
  const infra = useStore<InfrastructureStore>({
    services: null,
    metrics: null,
    lastUpdate: null,
    status: "connecting",
    reconnectAttempts: 0,
  });

  // The provider renders no element of its own, so it can't wait for visibility: connect on document-ready.
  // eslint-disable-next-line qwik/no-use-visible-task -- the socket lives in the browser only
  useVisibleTask$(
    async ({ cleanup }) => {
      let closed = false;
      let disconnect = () => {};
      cleanup(() => {
        closed = true;
        disconnect();
      });

      const socket = await connectSocket(WSNamespace.OCEANO_INFRA);
      disconnect = () => socket.disconnect();
      if (closed) return disconnect();

      socket.on("connect", () => {
        infra.status = "connected";
        infra.reconnectAttempts = 0;
      });
      socket.on("disconnect", () => (infra.status = "disconnected"));
      socket.on("connect_error", () => (infra.status = "error"));
      socket.io.on("reconnect_attempt", (attempt) => {
        infra.status = "reconnecting";
        infra.reconnectAttempts = attempt;
      });
      socket.on(WSEvent.SERVICE_STATUS, (data: ServicesStatus) => {
        infra.services = data;
        infra.lastUpdate = new Date();
      });
      socket.on(WSEvent.METRICS_UPDATE, (data: MetricsInfo) => {
        infra.metrics = data;
        infra.lastUpdate = new Date();
      });
      socket.emit(WSEvent.SERVICE_STATUS);
      socket.emit(WSEvent.METRICS_UPDATE);
    },
    { strategy: "document-ready" },
  );

  useContextProvider(InfrastructureContext, infra);

  return <Slot />;
});
