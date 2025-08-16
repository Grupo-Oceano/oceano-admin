import { $ } from "@builder.io/qwik";

const dateToReader = $((date: Date | string | number): string => {
  const d = Number.isInteger(date)
    ? new Date((date as number) * 1000)
    : new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});

export { dateToReader };
