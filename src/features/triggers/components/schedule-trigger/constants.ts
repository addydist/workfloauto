// Pure, dependency-free schedule model + due-check. Shared by the dialog
// (display) and the server-side scheduler (isScheduleDue). Uses Intl for
// timezone-aware wall-clock time — no cron parser needed.

export type ScheduleFrequency = "minutes" | "daily" | "weekly";

export type ScheduleData = {
  frequency?: ScheduleFrequency;
  everyMinutes?: number; // for "minutes"
  hour?: number; // 0-23 (daily/weekly)
  minute?: number; // 0-59
  weekday?: number; // 0-6 (Sun-Sat) for weekly
  timezone?: string; // IANA, e.g. "Asia/Kolkata"
};

export const EVERY_MINUTES_OPTIONS = [5, 10, 15, 30] as const;

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WEEKDAY_ABBR: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Wall-clock hour/minute/weekday in a given IANA timezone. Falls back to UTC. */
export function tzWallClock(timezone: string, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(date);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return {
      hour: parseInt(get("hour"), 10) % 24,
      minute: parseInt(get("minute"), 10),
      weekday: WEEKDAY_ABBR[get("weekday")] ?? date.getUTCDay(),
    };
  } catch {
    return {
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      weekday: date.getUTCDay(),
    };
  }
}

/** True if the schedule should fire at the given moment (checked each minute). */
export function isScheduleDue(data: ScheduleData, date = new Date()): boolean {
  const tz = data.timezone || "UTC";
  const { hour, minute, weekday } = tzWallClock(tz, date);
  const m = data.minute ?? 0;
  const h = data.hour ?? 9;

  switch (data.frequency) {
    case "minutes": {
      const every = data.everyMinutes ?? 15;
      return (hour * 60 + minute) % every === 0;
    }
    case "daily":
      return hour === h && minute === m;
    case "weekly":
      return weekday === (data.weekday ?? 1) && hour === h && minute === m;
    default:
      return false;
  }
}

/** Human-readable summary for the node label / preview. */
export function describeSchedule(data: ScheduleData): string {
  if (!data.frequency) return "Not configured";
  const time = `${pad(data.hour ?? 9)}:${pad(data.minute ?? 0)}`;
  const tz = data.timezone ? ` (${data.timezone})` : "";
  switch (data.frequency) {
    case "minutes":
      return `Every ${data.everyMinutes ?? 15} minutes`;
    case "daily":
      return `Daily at ${time}${tz}`;
    case "weekly":
      return `Weekly on ${WEEKDAYS[data.weekday ?? 1]} at ${time}${tz}`;
    default:
      return "Not configured";
  }
}
