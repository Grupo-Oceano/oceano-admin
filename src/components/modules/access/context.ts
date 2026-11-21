import { createContextId } from "@qwik.dev/core";

/** The staff page's dialogs: which person the "Manage" dialog shows (by id; the row itself comes from the loader). */
export type StaffPageState = {
  manageId: string | null;
  adding: boolean;
  addKey: number;
};
export const StaffPageCtx =
  createContextId<StaffPageState>("access.staff-page");
