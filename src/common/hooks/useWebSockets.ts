import {
  $,
  NoSerialize,
  noSerialize,
  QRL,
  Signal,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { io, Socket } from "socket.io-client";

export enum WSEvent {
  // Oceano Infra specific events
  SERVICE_STATUS = "service_status",
  METRICS_UPDATE = "metrics_update",

  // Miscellaneous events
  MESSAGE = "message",
}

export enum WSNamespace {
  OCEANO_INFRA = "oceano-infra",
}

interface HookResult {
  send$: QRL<(eventName: WSEvent, data?: any) => void>;
  listen$: QRL<(eventName: WSEvent, callback: (data: any) => void) => void>;
  socketRef: Signal<NoSerialize<Socket> | null>;
}

export const useWebSocket = (namespace: string): HookResult => {
  const socketRef = useSignal<NoSerialize<Socket> | null>(null);

  // Connect once
  useVisibleTask$(() => {
    if (!socketRef.value) {
      const socket = noSerialize(
        io("/" + namespace, { transports: ["websocket"] }),
      );
      socketRef.value = socket;

      socket?.on("connect", () => {
        console.log("Connected to WebSocket:", socket.id);
      });

      socket?.on("disconnect", () => {
        console.log("Disconnected from WebSocket:", socket.id);
      });

      /* cleanup(() => {
        console.log("Cleaning up WebSocket connection");
        socket?.removeAllListeners();
        socket?.disconnect();
        socketRef.value = null;
      }); */
    }
  });

  const send$ = $((eventName: WSEvent, data?: any) => {
    socketRef.value?.emit(eventName, data);
  });

  const listen$ = $((eventName: WSEvent, callback: (data: any) => void) => {
    socketRef.value?.off(eventName, callback); // remove if exists
    socketRef.value?.on(eventName, callback);
  });

  return { send$, listen$, socketRef };
};
