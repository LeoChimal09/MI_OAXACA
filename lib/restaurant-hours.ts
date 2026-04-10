type RestaurantStatus = {
  isOpen: boolean;
  message: string;
  opensAt: string;
  closesAt: string;
  timezone: string;
};

const DEFAULT_OPEN = "09:00 AM";
const DEFAULT_CLOSE = "10:00 PM";
const DEFAULT_TIMEZONE = "UTC";

function parseClock(value: string): number | null {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?:\s?(AM|PM|am|pm))?$/.exec(trimmed);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      return null;
    }
    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getTimeParts(now: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  });

  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Monday";
  const dayOfWeek = new Date(
    `2000-01-${[
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].indexOf(weekday) + 2}`,
  ).getDay();

  return { hour, minute, totalMinutes: hour * 60 + minute, dayOfWeek };
}

export function getRestaurantStatus(now = new Date()): RestaurantStatus {
  const timezone = process.env.RESTAURANT_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
  const opensAt = process.env.RESTAURANT_OPEN_TIME?.trim() || DEFAULT_OPEN;
  const closesAt = process.env.RESTAURANT_CLOSE_TIME?.trim() || DEFAULT_CLOSE;

  const openMinutes = parseClock(opensAt);
  const closeMinutes = parseClock(closesAt);

  if (openMinutes === null || closeMinutes === null) {
    return {
      isOpen: false,
      message: "Ordering is currently unavailable. Store hours are misconfigured.",
      opensAt,
      closesAt,
      timezone,
    };
  }

  const { totalMinutes, dayOfWeek } = getTimeParts(now, timezone);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    return {
      isOpen: false,
      message: `We are currently closed. We are closed on weekends. Ordering hours are ${opensAt} - ${closesAt} Monday - Friday (${timezone}).`,
      opensAt,
      closesAt,
      timezone,
    };
  }

  const isOpen =
    openMinutes < closeMinutes
      ? totalMinutes >= openMinutes && totalMinutes < closeMinutes
      : totalMinutes >= openMinutes || totalMinutes < closeMinutes;

  return {
    isOpen,
    message: isOpen
      ? "We are currently accepting orders."
      : `We are currently closed. Ordering hours are ${opensAt} - ${closesAt} Monday - Friday (${timezone}).`,
    opensAt,
    closesAt,
    timezone,
  };
}