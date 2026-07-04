// Small presentation helpers shared across the UI.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** Two-digit ball label, e.g. 7 -> "07". */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "2026-07-03" -> "3 Jul 2026". Safe for our ISO date strings. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "2026-07-03" -> "Friday, 3 Jul 2026". */
export function formatLongDate(iso: string): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return iso;
  return `${WEEKDAYS[dt.getUTCDay()]}, ${formatDate(iso)}`;
}

export function formatYear(iso: string): string {
  return iso.slice(0, 4);
}
