import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { contexts } from "~/common/consts";
import { User } from "~/models/user.model";

export interface SessionStore {
  user: User | null;
}

export const SessionContext = createContextId<SessionStore>(contexts.session);

export const initialSessionState: SessionStore = {
  user: null,
};

export const SessionContextProvider = component$(() => {
  const store = useStore(initialSessionState);

  useContextProvider(SessionContext, store);

  return <Slot />;
});
