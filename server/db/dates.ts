// Offering and completion dates are stored as text. Older rows are ISO strings with a "Z"; rows written
// through the DATE _stringify override in dbBuilder are UTC with no zone ("2026-10-11T15:00:00").
// Read both as UTC, so the result doesn't depend on the server's or the browser's time zone.
export function utcDate(value: string|Date): Date {
  if (value instanceof Date) return value;
  const iso = value.trim().replace(' ', 'T').replace(/\s+(?=[+-]\d\d:?\d\d$)/, '');
  return new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(iso) ? iso : iso + 'Z');
}
