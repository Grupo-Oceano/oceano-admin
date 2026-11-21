import type { Socket } from "socket.io-client";

/** Socket.IO namespaces on oceano-core (same origin `/socket.io`, proxied by nginx / the Vite dev server). */
export const WSNamespace = {
  OCEANO_INFRA: "oceano-infra",
  IOT: "iot",
} as const;

export const WSEvent = {
  SERVICE_STATUS: "service_status",
  METRICS_UPDATE: "metrics_update",
  /** Suffixed with the device id: `device_status_update-<id>`. */
  DEVICE_STATUS_UPDATE: "device_status_update-",
  MESSAGE: "message",
} as const;

/**
 * Opens one socket to a namespace. Browser-only: call it from a `useVisibleTask$`, keep the socket behind
 * `noSerialize` (or local to the task) and `disconnect()` it in the task's cleanup.
 */
export async function connectSocket(namespace: string): Promise<Socket> {
  const { io } = await import("socket.io-client");
  return io(`/${namespace}`, {
    transports: ["websocket"],
    withCredentials: true,
  });
}
