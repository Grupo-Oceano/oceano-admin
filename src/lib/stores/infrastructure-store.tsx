import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { contexts } from "~/common/consts";
import {
  useWebSocket,
  WSEvent,
  WSNamespace,
} from "~/common/hooks/useWebSockets";
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
  lastUpdate: Date | null; // When data was last received via WebSocket
}

export const InfrastructureContext = createContextId<InfrastructureStore>(
  contexts.infrastructure,
);

export const initialInfrastructureState: InfrastructureStore = {
  services: null,
  metrics: null,
  lastUpdate: null,
};

export const InfrastructureContextProvider = component$(() => {
  const infra = useStore<InfrastructureStore>(initialInfrastructureState);
  const { listen$, send$ } = useWebSocket(WSNamespace.OCEANO_INFRA);

  useVisibleTask$(() => {
    const handleServiceStatus = (data: ServicesStatus) => {
      infra.services = data;
      infra.lastUpdate = new Date();
    };

  const handleMetricsUpdate = (data: MetricsInfo) => {
    infra.metrics = data;
    infra.lastUpdate = new Date();
  };

  send$(WSEvent.SERVICE_STATUS);
  listen$(WSEvent.SERVICE_STATUS, handleServiceStatus);

  send$(WSEvent.METRICS_UPDATE);
  listen$(WSEvent.METRICS_UPDATE, handleMetricsUpdate);
  });

  useContextProvider(InfrastructureContext, infra);

  return <Slot />;
});
