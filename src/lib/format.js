// Display formatting shared by the planner screens. Everything here takes API
// values (ISO date-times, "HH:mm:ss" TimeOnly strings) and returns the exact
// strings the design calls for.

const SHORT_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Monday 00:00 of the week containing `date`, matching the API's week maths. */
export const startOfWeek = (date = new Date()) => {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return day;
};

/** A local YYYY-MM-DD string — safe to send as a query parameter. */
export const toDateParam = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

/** "MON 7" — the weekly calendar's column headings. */
export const formatDayHeading = (date) =>
  `${SHORT_DAYS[date.getDay()]} ${date.getDate()}`;

/** "September 7–13, 2026" — the Schedule page subtitle. */
export const formatWeekRange = (weekStart) => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);

  const month = weekStart.toLocaleDateString(undefined, { month: "long" });
  const endMonth = end.toLocaleDateString(undefined, { month: "long" });
  const year = end.getFullYear();

  return month === endMonth
    ? `${month} ${weekStart.getDate()}–${end.getDate()}, ${year}`
    : `${month} ${weekStart.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
};

/** "8:00" — 24-hour clock used inside the compact shift blocks. */
const clock = (date) =>
  `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

/** "8:00–12:00" for a shift block. */
export const formatShiftRange = (startIso, endIso) =>
  `${clock(new Date(startIso))}–${clock(new Date(endIso))}`;

/** "8:00 AM–12:00 PM" for the detail and mobile screens. */
export const formatShiftRangeLong = (startIso, endIso) => {
  const options = { hour: "numeric", minute: "2-digit" };
  const start = new Date(startIso).toLocaleTimeString(undefined, options);
  const end = new Date(endIso).toLocaleTimeString(undefined, options);
  return `${start}–${end}`;
};

/** "MON 7" from an ISO date-time. */
export const formatShiftDay = (startIso) => formatDayHeading(new Date(startIso));

/** "8a" / "8:30a" — the compact labels inside availability cells. */
const shortTime = (timeOnly) => {
  const [rawHours, rawMinutes] = String(timeOnly).split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const suffix = hours < 12 ? "a" : "p";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return minutes ? `${display}:${String(minutes).padStart(2, "0")}${suffix}` : `${display}${suffix}`;
};

/** The text inside one availability cell. */
export const formatAvailabilityCell = ({ isAvailable, startTime, endTime }) => {
  if (!isAvailable) return "Unavailable";
  if (startTime && endTime) return `${shortTime(startTime)}–${shortTime(endTime)}`;
  return "Flexible";
};

/** "JMD 428K" — the labour-cost metric, abbreviated to fit its tile. */
export const formatCurrencyCompact = (amount, currency = "JMD") => {
  const value = Number(amount) || 0;
  if (Math.abs(value) >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${currency} ${Math.round(value / 1_000)}K`;
  return `${currency} ${Math.round(value)}`;
};

export const formatHours = (hours) => `${Math.round(Number(hours) || 0)}h`;

export const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

/**
 * A stable accent colour per employee, so the same person keeps the same colour
 * across the calendar and the roster. The API's AssignedColor wins when it
 * names one of the palette tones.
 */
const TONES = ["blue", "green", "purple", "orange", "red"];

export const toneFor = (key, assignedColor) => {
  if (assignedColor && TONES.includes(String(assignedColor).toLowerCase())) {
    return String(assignedColor).toLowerCase();
  }
  const text = String(key ?? "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
};
