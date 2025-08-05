import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { contexts } from "~/common/consts";
import { useWebSockets } from "~/common/hooks/useWebSockets";
import type { ServiceStatus, SystemMetrics } from "~/models/infra.model";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface InfrastructureStore {
  services: ServiceStatus[];
  metrics: SystemMetrics;
  loading: boolean; // Initial data loading only
  lastUpdate: Date | null; // When data was last received via WebSocket
  error: string | null;
  // WebSocket specific states
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
  isRealtimeEnabled: boolean;
}

export const InfrastructureContext = createContextId<InfrastructureStore>(
  contexts.infrastructure,
);

export const initialInfrastructureState: InfrastructureStore = {
  services: [],
  metrics: {
    totalMemory: 0,
    usedMemory: 0,
    cpuUsage: 0,
    diskUsage: 0,
    activeServices: 0,
    totalServices: 0,
  },
  loading: true, // Only for initial connection/data load
  lastUpdate: null,
  error: null,
  // WebSocket specific initial states
  connectionStatus: "connecting",
  reconnectAttempts: 0,
  isRealtimeEnabled: true,
};

export const InfrastructureContextProvider = component$(() => {
  const infra = useStore<InfrastructureStore>(initialInfrastructureState);

  useWebSockets()

  useContextProvider(InfrastructureContext, infra);

  return <Slot />;
});
