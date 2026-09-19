import { toDateParam } from "../lib/format";

/** Parse a YYYY-MM-DD value as a local date, avoiding UTC timezone shifts. */
export const fromDateParam = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toDateParam(date) === value ? date : null;
};

/** Return a new date moved by a whole number of weeks. */
export const addWeeks = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount * 7);
  return result;
};
