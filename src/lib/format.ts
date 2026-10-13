export const TIME_ZONE = "Asia/Kolkata";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const keyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const minutesFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
});

function toParts(
  formatter: Intl.DateTimeFormat,
  date: Date
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of formatter.formatToParts(date)) out[p.type] = p.value;
  return out;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const inrFraction = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,234 or ₹1,234.50 */
export function formatINR(amount: number): string {
  const n = round2(amount);
  return Number.isInteger(n) ? inrWhole.format(n) : inrFraction.format(n);
}

/** DD MMM YYYY (Asia/Kolkata) */
export function formatDate(input: string | Date): string {
  const p = toParts(partsFormatter, typeof input === "string" ? new Date(input) : input);
  return `${p.day} ${p.month} ${p.year}`;
}

/** hh:mm AM/PM (Asia/Kolkata) */
export function formatTime(input: string | Date): string {
  const p = toParts(partsFormatter, typeof input === "string" ? new Date(input) : input);
  return `${p.hour}:${p.minute} ${p.dayPeriod}`;
}

export function formatDateTime(input: string | Date): string {
  return `${formatDate(input)}, ${formatTime(input)}`;
}

/** YYYY-MM-DD in Asia/Kolkata */
export function istDateKey(date: Date): string {
  const p = toParts(keyFormatter, date);
  return `${p.year}-${p.month}-${p.day}`;
}

export function istMinutesOfDay(date: Date): number {
  const p = toParts(minutesFormatter, date);
  return Number(p.hour) * 60 + Number(p.minute);
}

/** A Date that falls inside the given IST day (noon). */
export function dateFromKey(key: string): Date {
  return new Date(`${key}T12:00:00+05:30`);
}

export function istStartOfDay(key: string): Date {
  return new Date(`${key}T00:00:00+05:30`);
}

export function shiftDateKey(key: string, days: number): string {
  return istDateKey(new Date(dateFromKey(key).getTime() + days * 86_400_000));
}

export function formatDateKey(key: string): string {
  return formatDate(dateFromKey(key));
}

export function weekdayShort(key: string): string {
  return weekdayFormatter.format(dateFromKey(key));
}

export function dayLabel(key: string, todayKey: string): string {
  if (key === todayKey) return "Today";
  if (key === shiftDateKey(todayKey, -1)) return "Yesterday";
  return formatDateKey(key);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatMobile(mobile: string): string {
  if (mobile.length === 10) return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  return mobile;
}
