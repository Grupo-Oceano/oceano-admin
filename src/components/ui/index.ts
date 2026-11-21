/**
 * The app's UI library: the only entry the app imports (`~/components/ui`). It knows nothing about routes,
 * backends or the session: data comes in through props, actions through QRL props.
 */
export { button, Button, type ButtonVariants } from "./primitives/button";
export { CloseButton } from "./primitives/close-button";
export { Dialog, dialog } from "./primitives/dialog";
export { Icon } from "./primitives/icon";
export {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "./primitives/menu";
export { Popover, PopoverButton, PopoverPanel } from "./primitives/popover";
export type { Anchor } from "./primitives/anchor";
export { Spinner, spinner } from "./primitives/spinner";

export { Description, Field, Label } from "./forms/field";
export { Input, input } from "./forms/input";
export { Select } from "./forms/select";

export { Alert, alert, ErrorState, type Tone } from "./feedback/alert";
export { Skeleton } from "./feedback/skeleton";
export { ToastProvider, useToast, type ToastSeverity } from "./feedback/toast";

export { Avatar } from "./data-view/avatar";
export { DataTable, table, type Column } from "./data-view/data-table";
export { getPath } from "./data-view/get-path";
export { Paginator } from "./data-view/paginator";

export { card } from "./layout/card";
export { divider } from "./layout/divider";
export { heading } from "./layout/heading";
